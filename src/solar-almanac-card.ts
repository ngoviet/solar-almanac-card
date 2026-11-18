import { LitElement, css, html, nothing, svg } from 'lit';
import type { PropertyValues } from 'lit';
import { installFont } from './font';
import {
  bestWindow,
  computeFlows,
  flowDuration,
  formatNumber,
  formatPower,
  heroPower,
  hoursLeft,
  hoursToFull,
  resolveLoad,
  statusLine,
} from './flows';
import type { Power } from './flows';
import { FORECAST_ATTRIBUTES, fetchToday, parseForecast, toHourly } from './history';
import { themeStyles } from './theme';
import type { EntityRef, FlowEntityConfig, FlowKey, HomeAssistant, MpptConfig, SolarAlmanacCardConfig } from './types';

const CARD_TAG = 'solar-almanac-card';
const HISTORY_REFRESH_MS = 5 * 60_000;
const DASH_PERIOD = 15;
/** Hạt đơn của layout inverter: px/giây khi `flowDuration` = 1 giây, và thời gian tối thiểu cho một vòng (giây). */
const SOLO_SPEED = 60;
const SOLO_MIN_LAP = 0.8;
/** Khoảng cách (px) giữa hai chấm trên dây của layout flow. */
const WIRE_GAP = 18;
const DEFAULT_HOURS: [number, number] = [6, 17];
const ENERGY_TO_KWH: Record<string, number> = { wh: 0.001, mwh: 1000 };
const DEFAULT_EOD_LEVELS = [10, 20, 30];

type EntityKey = Exclude<keyof SolarAlmanacCardConfig['entities'], 'fan_rpm'>;

const SOURCES: Array<{ key: FlowKey; label: string; color: string }> = [
  { key: 'pv', label: 'Solar', color: 'var(--sac-solar)' },
  { key: 'battery', label: 'Pin', color: 'var(--sac-battery)' },
  { key: 'grid', label: 'Lưới', color: 'var(--sac-grid)' },
];

interface HourCell {
  hour: number;
  forecast?: number;
  actual?: number;
  now: boolean;
  good: boolean;
}

/** Biểu tượng nét của sơ đồ `inverter`; vẽ bằng màu chữ (`currentColor`) của ô chứa. */
const ICONS = {
  solar: svg`<svg viewBox="0 0 32 32"><path d="M5 20 9 6h18l-4 14Z M7 13h18 M15 6l-4 14 M21 6l-4 14 M14 20v6 M10 26h8"></path></svg>`,
  grid: svg`<svg viewBox="0 0 32 32"><path d="M16 3 9 29 M16 3l7 26 M6 9h20 M8 15h16 M7 9v2.5 M25 9v2.5 M10.6 23l8.6-8 M21.4 23l-8.6-8"></path></svg>`,
  home: svg`<svg viewBox="0 0 32 32"><path d="M4 15 16 4l12 11 M7 12.5V28h18V12.5 M17.5 12.5 13 19.5h4.5L15 25"></path></svg>`,
  inverter: svg`<svg viewBox="0 0 32 32"><rect x="5" y="3" width="22" height="26" rx="3"></rect><rect x="9.5" y="7" width="13" height="6" rx="1"></rect><path d="M9.5 21.5c2.2-3.6 4.3-3.6 6.5 0s4.3 3.6 6.5 0"></path></svg>`,
};

/** Đường gấp khúc qua các điểm, bo tròn góc bán kính `r` (px). Bỏ điểm trùng nhau. */
function roundedPath(points: Array<[number, number]>, r: number): string {
  const p = points.filter((q, i) => i === 0 || Math.hypot(q[0] - points[i - 1][0], q[1] - points[i - 1][1]) > 0.5);
  if (p.length < 2) return '';
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 1; i < p.length - 1; i++) {
    const [a, b, c] = [p[i - 1], p[i], p[i + 1]];
    const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
    const k = Math.min(r, l1 / 2, l2 / 2);
    const s = [b[0] - ((b[0] - a[0]) / l1) * k, b[1] - ((b[1] - a[1]) / l1) * k];
    const e = [b[0] + ((c[0] - b[0]) / l2) * k, b[1] + ((c[1] - b[1]) / l2) * k];
    d += `L${f(s[0])} ${f(s[1])}Q${f(b[0])} ${f(b[1])} ${f(e[0])} ${f(e[1])}`;
  }
  const last = p[p.length - 1];
  return `${d}L${f(last[0])} ${f(last[1])}`;
}

function toEntityConfig(ref?: EntityRef): FlowEntityConfig | undefined {
  if (!ref) return undefined;
  return typeof ref === 'string' ? { entity: ref } : ref;
}

export class SolarAlmanacCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    now: { attribute: false },
    _config: { state: true },
    _hourly: { state: true },
    _focusHour: { state: true },
  };

  declare hass?: HomeAssistant;
  /** Thời điểm hiển thị; để trống là giờ máy. Trang dev dùng để thử các tình huống. */
  declare now?: Date;
  declare _config?: SolarAlmanacCardConfig;
  declare _hourly?: Map<number, number>;
  declare _focusHour?: number;

  private _animations = new Map<string, Animation>();
  private _lastFetch = 0;
  private _resize?: ResizeObserver;

  static getStubConfig(): Partial<SolarAlmanacCardConfig> {
    return {
      entities: {
        pv: 'sensor.pv_power',
        battery: 'sensor.battery_power',
        battery_soc: 'sensor.battery_soc',
        grid: 'sensor.grid_power',
      },
    };
  }

  setConfig(config: SolarAlmanacCardConfig): void {
    if (!config || !config.entities) {
      throw new Error('solar-almanac-card: cần khai báo "entities"');
    }
    this._config = config;
    this._lastFetch = 0;
  }

  getCardSize(): number {
    const entities = this._config?.entities;
    return (this._config?.compact ? 5 : 11) + (entities?.fan || entities?.fan_rpm ? 1 : 0) + (entities?.eod ? 1 : 0);
  }

  getGridOptions() {
    return { columns: 12, min_columns: 9 };
  }

  connectedCallback(): void {
    super.connectedCallback();
    installFont();
    this.requestUpdate();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    for (const animation of this._animations.values()) animation.cancel();
    this._animations.clear();
    this._resize?.disconnect();
    this._resize = undefined;
  }

  private _entity(key: EntityKey) {
    const cfg = toEntityConfig(this._config?.entities[key]);
    const st = cfg && this.hass?.states[cfg.entity];
    return cfg && st ? { cfg, st } : undefined;
  }

  private _value(key: EntityKey): number | undefined {
    const v = parseFloat(this._entity(key)?.st.state ?? '');
    return Number.isNaN(v) ? undefined : v;
  }

  private _unit(key: EntityKey): string {
    return String(this._entity(key)?.st.attributes.unit_of_measurement ?? '').toLowerCase();
  }

  /** Hệ số đổi về W theo `unit_of_measurement`, đã áp dụng invert. */
  private _scale(key: EntityKey): number {
    const scale = this._unit(key) === 'kw' ? 1000 : 1;
    return this._entity(key)?.cfg.invert ? -scale : scale;
  }

  /** Đọc công suất (W) của một nút. */
  private _power(key: FlowKey | 'load'): number | undefined {
    const v = this._value(key);
    return v === undefined ? undefined : v * this._scale(key);
  }

  /** Đọc năng lượng (kWh); đơn vị khác Wh, MWh thì coi là kWh. */
  private _energy(key: EntityKey): number | undefined {
    const v = this._value(key);
    return v === undefined ? undefined : v * (ENERGY_TO_KWH[this._unit(key)] ?? 1);
  }

  /** Độ lệch cell (mV); BMS báo V hay mV tuỳ hãng. */
  private _cellDelta(): number | undefined {
    const v = this._value('cell_delta');
    return v !== undefined && this._unit('cell_delta') === 'v' ? v * 1000 : v;
  }

  private _temperatureUnit(): string {
    return this._entity('inverter_temperature')?.st.attributes.unit_of_measurement || '°C';
  }

  /** Có nguồn đã khai mà không đọc được. */
  private _unread(power: Power): boolean {
    return SOURCES.some(({ key }) => this._config?.entities[key] && power[key] === undefined);
  }

  private _openEntity(entityId: string | undefined): void {
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId } }));
  }

  private _moreInfo(key: EntityKey | undefined): void {
    this._openEntity(key && toEntityConfig(this._config?.entities[key])?.entity);
  }

  /** Giao hành động cho Home Assistant, hộp xác nhận cũng do HA hiện. */
  private _perform(entity: string, tap_action: Record<string, unknown>): void {
    this.dispatchEvent(
      new CustomEvent('hass-action', { bubbles: true, composed: true, detail: { config: { entity, tap_action }, action: 'tap' } }),
    );
  }

  /** Các sensor vòng quay có trong HA, kèm số cao nhất đọc được. */
  private _fanRpm(): { ids: string[]; rpm?: number } {
    const refs = [this._config?.entities.fan_rpm ?? []].flat();
    const ids = refs.flatMap((ref) => toEntityConfig(ref)?.entity ?? []).filter((id) => this.hass?.states[id]);
    const values = ids.map((id) => parseFloat(this.hass?.states[id].state ?? '')).filter((v) => !Number.isNaN(v));
    return { ids, rpm: values.length ? Math.max(...values) : undefined };
  }

  private _gridOnline(): boolean | undefined {
    const state = this._entity('grid_connected')?.st.state;
    if (state === 'on') return true;
    if (state === 'off') return false;
    return undefined;
  }

  private _forecast(key: EntityKey, day: Date): Map<number, number> {
    const attributes = this._entity(key)?.st.attributes;
    const names = this._config?.forecast_attribute ? [this._config.forecast_attribute] : FORECAST_ATTRIBUTES;
    const name = names.find((n) => attributes?.[n] !== undefined);
    return parseForecast(name ? attributes?.[name] : undefined, day);
  }

  /** Câu cảnh báo khi một chỉ số tình trạng vượt ngưỡng người dùng đặt. */
  private _alerts(): string[] {
    const checks: Array<[string, number | undefined, number | undefined, string]> = [
      ['Lệch cell', this._cellDelta(), this._config?.cell_delta_warn, 'mV'],
      ['Nhiệt biến tần', this._value('inverter_temperature'), this._config?.inverter_temperature_warn, this._temperatureUnit()],
    ];
    const alerts = checks.flatMap(([name, value, limit, unit]) => {
      if (value === undefined || limit === undefined || value <= limit) return [];
      return [`${name} ${formatNumber(value, 0)} ${unit}, vượt ngưỡng ${formatNumber(limit, 0)} ${unit}`];
    });
    if (this._entity('fan_stall')?.st.state === 'on') alerts.push('Quạt tản nhiệt bị kẹt, cần kiểm tra');
    return alerts;
  }

  private _hourCells(now: Date): { cells: HourCell[]; tomorrow: boolean; window?: { start: number; end: number } } {
    const today = this._forecast('forecast_today', now);
    const next = this._forecast('forecast_tomorrow', new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    const todayWindow = bestWindow(today);
    const tomorrow = next.size > 0 && (!todayWindow || now.getHours() >= todayWindow.end);
    const forecast = tomorrow ? next : today;
    const window = tomorrow ? bestWindow(next) : todayWindow;
    const actual = tomorrow ? undefined : this._hourly;

    const peak = Math.max(0, ...forecast.values());
    const lit = [...forecast].filter(([, w]) => w >= peak * 0.02 && w > 0).map(([hour]) => hour);
    for (const [hour, w] of actual ?? []) if (w > 50) lit.push(hour);
    const [first, last] = lit.length ? [Math.min(...lit), Math.max(...lit)] : DEFAULT_HOURS;

    const cells: HourCell[] = [];
    for (let hour = first; hour <= last; hour++) {
      cells.push({
        hour,
        forecast: forecast.get(hour),
        actual: actual?.get(hour),
        now: !tomorrow && hour === now.getHours(),
        good: !!window && hour >= window.start && hour < window.end,
      });
    }
    return { cells, tomorrow, window };
  }

  private _renderBand(now: Date, online?: boolean) {
    const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(now);
    const date = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const voltage = this._value('grid_voltage');
    // Sơ đồ `inverter` đã ghi điện áp cạnh nút lưới.
    const inNode = this._config?.layout === 'inverter' && !!this._config.entities.grid;
    const volt = voltage !== undefined && !inNode ? ` · ${Math.round(voltage)} V` : '';
    const state = (label: string, cls: string) =>
      this._config?.entities.grid_voltage
        ? html`<button class=${cls} @click=${() => this._moreInfo('grid_voltage')}>${label}</button>`
        : html`<span class=${cls}>${label}</span>`;
    return html`
      <header class="band">
        <span class="date">${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${date}</span>
        ${this._config?.title ? html`<span class="title">${this._config.title}</span>` : nothing}
        ${online === false
          ? state('Mất lưới', 'state down')
          : online || volt
            ? state(`${online ? 'Có lưới' : 'Lưới'}${volt}`, 'state')
            : nothing}
      </header>
    `;
  }

  /** Ba số chính cùng một cỡ: Solar, SOC pin, nhà đang dùng; mỗi số kèm một thanh và một dòng chữ. */
  private _renderLead(power: Power, load: number | undefined, flows?: ReturnType<typeof computeFlows>) {
    const entities = this._config?.entities;
    const threshold = this._config?.threshold ?? 10;
    const stats = [];

    if (entities?.pv) {
      const today = this._energy('pv_today');
      const forecast = this._energy('forecast_today');
      const value = power.pv === undefined ? undefined : heroPower(power.pv);
      const sub = today === undefined ? undefined : forecast === undefined ? `${formatNumber(today)} kWh` : `${formatNumber(today)} / ${formatNumber(forecast)} kWh`;
      const fill = today !== undefined && forecast ? (today / forecast) * 100 : undefined;
      stats.push(html`
        <div class="stat">
          <button class="main" @click=${() => this._moreInfo('pv')}>
            <span class="label"><i style="background:var(--sac-solar)"></i>Solar</span>
            ${this._figure(value)}
          </button>
          ${this._gauge(fill, 'var(--sac-solar)')} ${sub ? html`<span class="sub">${sub}</span>` : nothing}
        </div>
      `);
    }

    if (entities?.battery) {
      const soc = this._value('battery_soc');
      const w = power.battery;
      const moving = w !== undefined && Math.abs(w) > threshold;
      const value = soc !== undefined ? { value: String(Math.round(soc)), unit: '%' } : w === undefined ? undefined : heroPower(w);
      const flow = w === undefined ? '—' : moving ? `${w > 0 ? 'xả' : 'sạc'} ${formatPower(w)}` : 'đang nghỉ';
      stats.push(html`
        <div class="stat">
          <button class="main" @click=${() => this._moreInfo(soc !== undefined ? 'battery_soc' : 'battery')}>
            <span class="label"><i style="background:var(--sac-battery)"></i>Pin</span>
            ${this._figure(value)}
          </button>
          ${this._gauge(soc, 'var(--sac-battery)')}
          <button class="sub" @click=${() => this._moreInfo('battery')}>${flow}</button>
        </div>
      `);
    }

    const { mix, origin } = this._homeMix(load, flows);
    const home = html`
      <span class="label">Nhà đang dùng</span>
      ${this._figure(load === undefined ? undefined : heroPower(load))}
    `;
    stats.push(html`
      <div class="stat">
        ${entities?.load ? html`<button class="main" @click=${() => this._moreInfo('load')}>${home}</button>` : html`<div class="main">${home}</div>`}
        ${mix.length
          ? html`<span class="mix">${mix.map((p) => html`<i style="flex:${p.w} 1 0;background:${p.color}"></i>`)}</span>`
          : html`<span class="gauge"></span>`}
        ${origin ? html`<span class="sub">${origin}</span>` : nothing}
      </div>
    `);

    return html`<section class="lead" style="--cols:${stats.length}">${stats}</section>`;
  }

  /** Tải đang đến từ nguồn nào: các đoạn của thanh tỉ lệ và câu "83% từ Solar". */
  private _homeMix(load: number | undefined, flows?: ReturnType<typeof computeFlows>) {
    const threshold = this._config?.threshold ?? 10;
    const parts = flows
      ? [
          { name: 'Solar', w: flows.solarHome, color: 'var(--sac-solar)' },
          { name: 'pin', w: flows.batteryHome, color: 'var(--sac-battery)' },
          { name: 'lưới', w: flows.gridHome, color: 'var(--sac-grid)' },
        ].filter((p) => p.w > 0)
      : [];
    const unknown = flows ? (load ?? 0) - parts.reduce((sum, p) => sum + p.w, 0) : 0;
    const top = [...parts].sort((a, b) => b.w - a.w)[0];
    const origin = top && load && load > threshold && top.w >= unknown ? `${Math.round((top.w / load) * 100)}% từ ${top.name}` : undefined;
    const mix = unknown > threshold ? [...parts, { name: '', w: unknown, color: 'var(--sac-border)' }] : parts;
    return { mix, origin, top };
  }

  private _mixBar(mix: Array<{ w: number; color: string }>) {
    return mix.length
      ? html`<span class="mix">${mix.map((p) => html`<i style="flex:${p.w} 1 0;background:${p.color}"></i>`)}</span>`
      : html`<span class="gauge"></span>`;
  }

  /**
   * Sơ đồ dòng năng lượng: Solar trên, lưới trái, nhà phải, pin dưới, nối về biến tần ở giữa.
   * Hệ không lưới thì pin sang trái và bỏ hàng dưới. Dây dày theo công suất, chấm chạy theo chiều dòng.
   */
  private _renderFlow(power: Power, load: number | undefined, flows?: ReturnType<typeof computeFlows>) {
    const entities = this._config?.entities;
    const threshold = this._config?.threshold ?? 10;
    const max = this._config?.flow_max_power ?? 5000;
    const hasPv = !!entities?.pv;
    const hasGrid = !!entities?.grid;
    const hasBattery = !!entities?.battery;
    const batteryLeft = hasBattery && !hasGrid;
    const batteryBottom = hasBattery && hasGrid;

    // forward: chấm chạy sang phải (dây ngang) hoặc xuống dưới (dây dọc).
    const wire = (key: string, w: number | undefined, color: string, axis: 'h' | 'v', forward: boolean, area: string) => {
      const active = w !== undefined && Math.abs(w) > threshold;
      const width = active ? 2 + 6 * Math.sqrt(Math.min(1, Math.abs(w) / max)) : 1;
      return html`
        <span class="wire ${axis} ${active ? 'on' : ''}" style="grid-area:${area};--wire:${width.toFixed(1)}px;--wire-color:${color}" aria-hidden="true">
          <i class="dots" data-key=${key} data-axis=${axis} data-rate=${active ? 1 / flowDuration(w) : 0} data-reverse=${forward ? '' : '1'}></i>
        </span>
      `;
    };
    const swatch = (color: string) => html`<i style="background:${color}"></i>`;

    const { mix, origin, top } = this._homeMix(load, flows);
    const soc = this._value('battery_soc');
    const bw = power.battery;
    const bMoving = bw !== undefined && Math.abs(bw) > threshold;
    const batteryFlow = bw === undefined ? '—' : bMoving ? `${bw > 0 ? 'xả' : 'sạc'} ${formatPower(bw)}` : 'đang nghỉ';
    const pvToday = this._energy('pv_today');
    const forecast = this._energy('forecast_today');
    const pvSub = pvToday === undefined ? undefined : forecast === undefined ? `${formatNumber(pvToday)} kWh` : `${formatNumber(pvToday)} / ${formatNumber(forecast)} kWh`;
    const gw = power.grid;
    const gMoving = gw !== undefined && Math.abs(gw) > threshold;
    const bought = this._energy('grid_import_today');
    const sold = this._energy('grid_export_today');
    const gridSub = [bought !== undefined ? `mua ${formatNumber(bought)}` : '', sold ? `phát ${formatNumber(sold)}` : ''].filter(Boolean).join(' · ');

    const batteryNode = html`
      <button class="main" @click=${() => this._moreInfo(soc !== undefined ? 'battery_soc' : 'battery')}>
        <span class="label">${swatch('var(--sac-battery)')}Pin</span>
        ${this._figure(soc !== undefined ? { value: String(Math.round(soc)), unit: '%' } : bw === undefined ? undefined : heroPower(bw))}
      </button>
      ${this._gauge(soc, 'var(--sac-battery)')}
      <button class="sub" @click=${() => this._moreInfo('battery')}>${batteryFlow}</button>
    `;

    const mppts = hasPv ? (this._config?.mppts ?? []) : [];
    const rows = [
      hasPv ? '"pv pv pv pv pv"' : '',
      hasPv ? '". . ws . ."' : '',
      `"${hasGrid ? 'grid wg' : batteryLeft ? 'bat wb' : '. .'} hub wh home"`,
      batteryBottom ? '". . wb . ."' : '',
      batteryBottom ? '"bat bat bat bat bat"' : '',
    ].filter(Boolean);

    return html`
      <section class="map" style="grid-template-areas:${rows.join(' ')}">
        ${hasPv
          ? html`
              <div class="axis" style="grid-area:pv">
                ${mppts.length ? this._renderMppts(mppts.slice(0, Math.ceil(mppts.length / 2)), 0, 'left', wire) : nothing}
                <div class="node">
                  <button class="main" @click=${() => this._moreInfo('pv')}>
                    <span class="label">${swatch('var(--sac-solar)')}Solar</span>
                    ${this._figure(power.pv === undefined ? undefined : heroPower(power.pv))}
                  </button>
                  ${this._gauge(pvToday !== undefined && forecast ? (pvToday / forecast) * 100 : undefined, 'var(--sac-solar)')}
                  ${pvSub ? html`<span class="sub">${pvSub}</span>` : nothing}
                </div>
                ${mppts.length > 1
                  ? this._renderMppts(mppts.slice(Math.ceil(mppts.length / 2)), Math.ceil(mppts.length / 2), 'right', wire)
                  : nothing}
              </div>
              ${wire('pv', power.pv, 'var(--sac-solar)', 'v', true, 'ws')}
            `
          : nothing}
        ${hasGrid
          ? html`
              <div class="node side" style="grid-area:grid">
                <button class="main" @click=${() => this._moreInfo('grid')}>
                  <span class="label">${swatch('var(--sac-grid)')}Lưới${gMoving ? (gw > 0 ? ' · mua' : ' · phát') : ''}</span>
                  ${this._figure(gw === undefined ? undefined : heroPower(gw))}
                </button>
                ${gridSub ? html`<button class="sub" @click=${() => this._moreInfo('grid_import_today')}>${gridSub} kWh</button>` : nothing}
              </div>
              ${wire('grid', gw, 'var(--sac-grid)', 'h', (gw ?? 0) >= 0, 'wg')}
            `
          : nothing}
        ${hasBattery
          ? html`
              <div class=${batteryLeft ? 'node side' : 'axis'} style="grid-area:bat">
                ${batteryLeft
                  ? batteryNode
                  : html`<div class="node">${batteryNode}</div>`}
              </div>
              ${batteryLeft
                ? wire('battery', bw, 'var(--sac-battery)', 'h', (bw ?? 0) >= 0, 'wb')
                : wire('battery', bw, 'var(--sac-battery)', 'v', (bw ?? 0) < 0, 'wb')}
            `
          : nothing}
        <span class="hub" style="grid-area:hub" aria-hidden="true">
          ${svg`<svg viewBox="0 0 24 24"><path d="M4 12c2.7-5.3 5.3-5.3 8 0s5.3 5.3 8 0"></path></svg>`}
        </span>
        ${wire('home', load, top?.color ?? 'var(--sac-fg)', 'h', true, 'wh')}
        <div class="node side home" style="grid-area:home">
          ${entities?.load
            ? html`<button class="main" @click=${() => this._moreInfo('load')}>
                <span class="label">Nhà đang dùng</span>${this._figure(load === undefined ? undefined : heroPower(load))}
              </button>`
            : html`<div class="main"><span class="label">Nhà đang dùng</span>${this._figure(load === undefined ? undefined : heroPower(load))}</div>`}
          ${this._mixBar(mix)} ${origin ? html`<span class="sub">${origin}</span>` : nothing}
        </div>
      </section>
    `;
  }

  /** Nút bấm mở lịch sử một entity; entity chưa khai thì chỉ là chữ. */
  private _link(key: EntityKey, text: string) {
    return this._config?.entities[key] ? html`<button class="lk" @click=${() => this._moreInfo(key)}>${text}</button>` : text;
  }

  /** Hai số năng lượng "a / b kWh", mỗi số mở entity của nó; thiếu cả hai thì không có. */
  private _energyPair(a: EntityKey, b: EntityKey) {
    const x = this._energy(a);
    const y = this._energy(b);
    if (x === undefined && y === undefined) return undefined;
    const part = (v: number | undefined) => (v === undefined ? '—' : formatNumber(v));
    return html`${this._link(a, part(x))} / ${this._link(b, `${part(y)} kWh`)}`;
  }

  /** Một dòng "nhãn giá trị" trong nút; giá trị dài thì tự xuống dòng dưới nhãn. */
  private _kv(label: string, value: unknown) {
    return value === undefined ? nothing : html`<div class="kv"><span>${label}</span> <b>${value}</b></div>`;
  }

  /** Ô số viền màu nguồn, như ô công suất của card Sunsynk. */
  private _box(text: string, color: string, key?: EntityKey) {
    const inner = html`<b class="num">${text}</b>`;
    return key && this._config?.entities[key]
      ? html`<button class="val" style="--c:${color}" @click=${() => this._moreInfo(key)}>${inner}</button>`
      : html`<span class="val" style="--c:${color}">${inner}</span>`;
  }

  /** Dòng thời gian dưới nút pin: như hàng dự phòng của layout khác, tính tới `battery_reserve`. */
  private _batteryNote(runtime: number | undefined, offGrid: boolean): { label: string; value: string } | undefined {
    if (runtime === undefined) return undefined;
    return { label: offGrid ? 'Pin còn' : 'Nếu mất điện', value: `~${formatNumber(runtime)} giờ` };
  }

  /**
   * Sơ đồ kiểu Sunsynk: Solar trên trái, pin dưới trái, biến tần giữa, nhà trên phải, lưới dưới phải.
   * Số liệu trong ngày của từng nút đứng ngay cạnh nút đó. Dây gấp khúc vẽ sau khi đo vị trí (`_layoutWires`).
   */
  private _renderInverter(
    power: Power,
    load: number | undefined,
    flows: ReturnType<typeof computeFlows> | undefined,
    runtime: number | undefined,
    online: boolean | undefined,
    selfUse: number | undefined,
  ) {
    const entities = this._config?.entities;
    const threshold = this._config?.threshold ?? 10;
    const max = this._config?.flow_max_power ?? 5000;
    const hasPv = !!entities?.pv;
    const hasGrid = !!entities?.grid;
    const hasBattery = !!entities?.battery;
    const mppts = hasPv ? (this._config?.mppts ?? []) : [];

    const wires: Array<{ id: string; w: number | undefined; color: string; reverse: boolean }> = [];
    const wire = (id: string, w: number | undefined, color: string, reverse = false) => wires.push({ id, w, color, reverse });

    // ---- Solar
    let solar: unknown = nothing;
    if (hasPv) {
      const pvToday = this._energy('pv_today');
      const forecast = this._energy('forecast_today');
      const tomorrow = this._energy('forecast_tomorrow');
      const today = pvToday === undefined ? undefined : forecast === undefined ? `${formatNumber(pvToday)} kWh` : `${formatNumber(pvToday)} / ${formatNumber(forecast)} kWh`;
      mppts.forEach((m, i) => {
        const p = this._read(m.power);
        wire(`mppt${i}`, p.v === undefined ? undefined : p.v * (p.unit === 'kw' ? 1000 : 1), 'var(--sac-solar)', (p.v ?? 0) < 0);
      });
      wire('pv', power.pv, 'var(--sac-solar)', (power.pv ?? 0) < 0);
      solar = html`
        <div class="part solar" style="grid-area:solar">
          <div class="head">
            <span class="icon" data-anchor=${mppts.length ? 'pv-icon' : 'pv'} style="color:var(--sac-solar)">${ICONS.solar}</span>
            <div class="text">
              <div class="headline">
                <span class="label">Solar</span>
                ${this._box(power.pv === undefined ? '—' : formatPower(power.pv), 'var(--sac-solar)', 'pv')}
              </div>
              ${today ? html`${this._gauge(pvToday !== undefined && forecast ? (pvToday / forecast) * 100 : undefined, 'var(--sac-solar)')}` : nothing}
              ${this._kv('Hôm nay', today ? this._link('pv_today', today) : undefined)}
              ${this._kv('Ngày mai', tomorrow === undefined ? undefined : this._link('forecast_tomorrow', `${Math.round(tomorrow)} kWh`))}
            </div>
          </div>
          ${mppts.length
            ? html`<div class="pvs" style="--n:${mppts.length}">
                ${mppts.map((m, i) => {
                  const p = this._read(m.power);
                  const w = p.v === undefined ? undefined : p.v * (p.unit === 'kw' ? 1000 : 1);
                  const volt = this._read(m.voltage).v;
                  const amp = this._read(m.current).v;
                  const e = this._read(m.energy_today);
                  const kwh = e.v === undefined ? undefined : e.v * (ENERGY_TO_KWH[e.unit] ?? 1);
                  const va = [volt !== undefined ? `${formatNumber(volt, volt >= 100 ? 0 : 1)} V` : '', amp !== undefined ? `${formatNumber(amp, 1)} A` : '']
                    .filter(Boolean)
                    .join(' · ');
                  return html`
                    <button class="pv" data-anchor="mppt${i}" @click=${() => this._openEntity(p.id)}>
                      <span class="label">${m.name ?? `PV${i + 1}`}</span>
                      <b class="num">${w === undefined ? '—' : formatPower(w)}</b>
                      ${va ? html`<span class="sub">${va}</span>` : nothing}
                      ${kwh !== undefined ? html`<span class="sub">${formatNumber(kwh)} kWh</span>` : nothing}
                    </button>
                  `;
                })}
              </div>`
            : nothing}
        </div>
      `;
    }

    // ---- Pin
    let battery: unknown = nothing;
    if (hasBattery) {
      const soc = this._value('battery_soc');
      const bw = power.battery;
      const moving = bw !== undefined && Math.abs(bw) > threshold;
      const flow = bw === undefined ? '—' : moving ? `${bw > 0 ? 'xả' : 'sạc'} ${formatPower(bw)}` : 'đang nghỉ';
      const note = this._batteryNote(runtime, online === false || !hasGrid);
      const delta = this._cellDelta();
      const level = soc === undefined ? 0 : Math.min(100, Math.max(0, soc));
      wire('bat', bw, 'var(--sac-battery)', (bw ?? 0) < 0);
      battery = html`
        <div class="part bat" style="grid-area:bat">
          <div class="text">
            <button class="main" @click=${() => this._moreInfo(soc !== undefined ? 'battery_soc' : 'battery')}>
              <span class="label">Pin</span>
              ${soc !== undefined ? html`<b class="num soc">${Math.round(soc)}<small>%</small></b>` : nothing}
            </button>
            ${this._box(flow, 'var(--sac-battery)', 'battery')}
            ${this._kv('Sạc / xả hôm nay', this._energyPair('battery_charge_today', 'battery_discharge_today'))}
            ${note ? this._kv(note.label, this._link('battery_soc', note.value)) : nothing}
            ${this._kv('Lệch cell', delta === undefined ? undefined : this._link('cell_delta', `${formatNumber(delta, 0)} mV`))}
          </div>
          <span class="icon battery" data-anchor="bat" aria-hidden="true">
            ${svg`<svg viewBox="0 0 24 40">
              <rect class="body" x="3" y="5" width="18" height="33" rx="3"></rect>
              <rect class="cap" x="8" y="1.5" width="8" height="3.5" rx="1"></rect>
              <rect class="level" x="6" y=${35 - (27 * level) / 100} width="12" height=${(27 * level) / 100} rx="1"></rect>
            </svg>`}
          </span>
        </div>
      `;
    }

    // ---- Lưới
    let grid: unknown = nothing;
    if (hasGrid) {
      const gw = power.grid;
      const moving = gw !== undefined && Math.abs(gw) > threshold;
      const volt = this._value('grid_voltage');
      const freq = this._value('grid_frequency');
      const line = [
        volt !== undefined ? this._link('grid_voltage', `${Math.round(volt)} V`) : undefined,
        freq !== undefined ? this._link('grid_frequency', `${formatNumber(freq)} Hz`) : undefined,
      ].filter((v) => v !== undefined);
      wire('grid', gw, 'var(--sac-grid)', (gw ?? 0) < 0);
      grid = html`
        <div class="part grid" style="grid-area:grid">
          <span class="icon" data-anchor="grid" style="color:${online === false ? 'var(--sac-dim)' : 'var(--sac-grid)'}">${ICONS.grid}</span>
          <div class="text">
            <span class="label">${online === false ? 'Lưới · mất' : `Lưới${moving ? (gw > 0 ? ' · mua' : ' · phát') : ''}`}</span>
            ${this._box(gw === undefined ? '—' : formatPower(gw), 'var(--sac-grid)', 'grid')}
            ${this._kv('Mua / phát hôm nay', this._energyPair('grid_import_today', 'grid_export_today'))}
            ${line.length ? html`<div class="kv"><b>${line.map((v, i) => html`${i ? ' · ' : ''}${v}`)}</b></div>` : nothing}
          </div>
        </div>
      `;
    }

    // ---- Nhà
    const { mix, origin, top } = this._homeMix(load, flows);
    const consumed = this._energy('load_today');
    wire('home', load, top?.color ?? 'var(--sac-fg)');
    const home = html`
      <div class="part home" style="grid-area:home">
        <span class="icon" data-anchor="home" style="color:var(--sac-fg)">${ICONS.home}</span>
        <div class="text">
          <span class="label">Nhà đang dùng</span>
          ${this._box(load === undefined ? '—' : formatPower(load), 'var(--sac-fg)', entities?.load ? 'load' : undefined)}
          ${this._mixBar(mix)} ${origin ? html`<span class="sub">${origin}</span>` : nothing}
          ${this._kv('Tải hôm nay', consumed === undefined ? undefined : this._link('load_today', `${formatNumber(consumed)} kWh`))}
          ${this._kv('Tự cấp', selfUse === undefined ? undefined : this._link('grid_import_today', `${selfUse}%`))}
        </div>
      </div>
    `;

    // ---- Biến tần
    const temp = this._value('inverter_temperature');
    const hot = temp !== undefined && this._config?.inverter_temperature_warn !== undefined && temp > this._config.inverter_temperature_warn;
    const inverter = html`
      <div class="part inv" style="grid-area:inv">
        <span class="icon" data-anchor="inv">${ICONS.inverter}</span>
        ${temp !== undefined
          ? html`<button class="lk temp ${hot ? 'hot' : ''}" @click=${() => this._moreInfo('inverter_temperature')}>
              ${formatNumber(temp, 0)} ${this._temperatureUnit()}
            </button>`
          : nothing}
      </div>
    `;

    const rows = [
      hasPv ? `"solar solar ${hasGrid ? 'home' : '.'}"` : hasGrid ? '". . home"' : '',
      `"${hasBattery ? 'bat' : '.'} inv ${hasGrid ? 'grid' : 'home'}"`,
    ].filter(Boolean);

    return html`
      <section class="rig" style="grid-template-areas:${rows.join(' ')}">
        ${svg`<svg class="wires" aria-hidden="true">
          ${wires.map(({ id, w, color, reverse }) => {
            const active = w !== undefined && Math.abs(w) > threshold;
            const width = active ? 2 + 4 * Math.sqrt(Math.min(1, Math.abs(w) / max)) : 1;
            const style = `--c:${color};--w:${width.toFixed(1)}px`;
            return svg`
              <path class="track ${active ? 'on' : ''}" data-wire=${id} style=${style}></path>
              <path
                class="flow solo ${active ? '' : 'idle'}"
                pathLength="100"
                data-wire=${id}
                data-key=${`i-${id}`}
                data-rate=${active ? 1 / flowDuration(w) : 0}
                data-reverse=${reverse ? '1' : ''}
                style=${style}
              ></path>
            `;
          })}
        </svg>`}
        ${solar} ${battery} ${inverter} ${home} ${grid}
      </section>
    `;
  }

  /** Vẽ đường cho các dây của sơ đồ `inverter` theo vị trí thật của các nút; gọi lại khi card đổi cỡ. */
  private _layoutWires(): void {
    const rig = this.renderRoot.querySelector<HTMLElement>('.rig');
    if (!rig) return;
    const origin = rig.getBoundingClientRect();
    const at = (name: string) => {
      const el = rig.querySelector<HTMLElement>(`[data-anchor="${name}"]`);
      if (!el) return undefined;
      const r = el.getBoundingClientRect();
      const l = r.left - origin.left;
      const t = r.top - origin.top;
      return { l, t, r: l + r.width, b: t + r.height, cx: l + r.width / 2, cy: t + r.height / 2, h: r.height };
    };
    const inv = at('inv');
    if (!inv) return;
    type Pt = [number, number];
    // Ngang - dọc - ngang; hai đầu gần cùng độ cao thì vẽ thẳng.
    const hvh = (a: Pt, b: Pt, x = (a[0] + b[0]) / 2): Pt[] =>
      Math.abs(a[1] - b[1]) < 2 ? [[a[0], b[1]], b] : [a, [x, a[1]], [x, b[1]], b];
    const routes = new Map<string, Pt[]>();

    const sources = [...rig.querySelectorAll<HTMLElement>('[data-anchor^="mppt"]')].map((el) => at(el.dataset.anchor!)!);
    const pv = at('pv');
    const solar = rig.querySelector<HTMLElement>('.part.solar');
    if (solar && (sources.length || pv)) {
      // Thanh góp Solar nằm giữa khe hai hàng, để dây không đi qua chữ của nút pin bên dưới.
      const gap = parseFloat(getComputedStyle(rig).rowGap) || 0;
      const yBus = solar.getBoundingClientRect().bottom - origin.top + gap / 2;
      sources.forEach((s, i) => routes.set(`mppt${i}`, [[s.cx, s.b], [s.cx, yBus], [inv.cx, yBus]]));
      routes.set('pv', pv ? [[pv.cx, pv.b], [pv.cx, yBus], [inv.cx, yBus], [inv.cx, inv.t]] : [[inv.cx, yBus], [inv.cx, inv.t]]);
    }
    const bat = at('bat');
    if (bat) routes.set('bat', hvh([bat.r, bat.cy], [inv.l, inv.cy]));
    const grid = at('grid');
    if (grid) routes.set('grid', hvh([grid.l, grid.cy], [inv.r, inv.cy]));
    const home = at('home');
    if (home) {
      // Có lưới thì lưới đi thẳng vào giữa biến tần, dây nhà rời biến tần cao hơn rồi gập lên.
      const start: Pt = grid ? [inv.r, inv.t + inv.h * 0.22] : [inv.r, inv.cy];
      routes.set('home', hvh(start, [home.l, home.cy], grid ? (inv.r + home.l) / 2 : undefined));
    }

    rig.querySelector('.wires')?.setAttribute('viewBox', `0 0 ${origin.width} ${origin.height}`);
    for (const path of rig.querySelectorAll<SVGPathElement>('path[data-wire]')) {
      const points = routes.get(path.dataset.wire!);
      path.setAttribute('d', points ? roundedPath(points, 6) : '');
    }
    this._syncFlows();
  }

  /** Đọc một entity bất kỳ (không nằm trong `entities`): số và đơn vị. */
  private _read(ref: EntityRef | undefined): { id?: string; v?: number; unit: string } {
    const cfg = toEntityConfig(ref);
    const st = cfg && this.hass?.states[cfg.entity];
    const v = parseFloat(st?.state ?? '');
    const unit = String(st?.attributes.unit_of_measurement ?? '').toLowerCase();
    return { id: cfg?.entity, v: Number.isNaN(v) ? undefined : cfg?.invert ? -v : v, unit };
  }

  /**
   * Các ô MPPT cùng hàng với nút Solar: nửa đầu bên trái, nửa sau bên phải, dây ngang chảy vào Solar.
   * Mỗi ô: công suất, điện áp · dòng, kWh hôm nay. `first` là số thứ tự của ô đầu, để đặt tên PVn mặc định.
   */
  private _renderMppts(
    list: MpptConfig[],
    first: number,
    side: 'left' | 'right',
    wire: (key: string, w: number | undefined, color: string, axis: 'h' | 'v', forward: boolean, area: string) => unknown,
  ) {
    return html`
      <div class="mppts ${side}">
        ${list.map((m, j) => {
          const i = first + j;
          const p = this._read(m.power);
          const w = p.v === undefined ? undefined : p.v * (p.unit === 'kw' ? 1000 : 1);
          const volt = this._read(m.voltage).v;
          const amp = this._read(m.current).v;
          const e = this._read(m.energy_today);
          const kwh = e.v === undefined ? undefined : e.v * (ENERGY_TO_KWH[e.unit] ?? 1);
          const va = [volt !== undefined ? `${formatNumber(volt, volt >= 100 ? 0 : 1)} V` : '', amp !== undefined ? `${formatNumber(amp, 1)} A` : '']
            .filter(Boolean)
            .join(' · ');
          return html`
            <div class="mppt">
              <button class="box" @click=${() => this._openEntity(p.id)}>
                <span class="label">${m.name ?? `PV${i + 1}`}</span>
                <b class="num">${w === undefined ? '—' : formatPower(w)}</b>
                ${va ? html`<span class="sub">${va}</span>` : nothing}
                ${kwh !== undefined ? html`<span class="sub">${formatNumber(kwh)} kWh</span>` : nothing}
              </button>
              ${wire(`mppt${i}`, w, 'var(--sac-solar)', 'h', side === 'left', 'auto')}
            </div>
          `;
        })}
      </div>
    `;
  }

  private _figure(v: { value: string; unit: string } | undefined) {
    return html`<b class="num">${v?.value ?? '—'}${v ? html`<small>${v.unit}</small>` : nothing}</b>`;
  }

  private _gauge(percent: number | undefined, color: string) {
    const width = percent === undefined ? 0 : Math.min(100, Math.max(0, percent));
    return html`<span class="gauge"><span style="width:${width}%;background:${color}"></span></span>`;
  }

  /** Dải hạt: Solar và pin đi xuống, lưới đi lên từ hàng dưới, cùng chạy về cột Nhà. */
  private _renderLinks(power: Power) {
    const entities = this._config?.entities;
    const threshold = this._config?.threshold ?? 10;
    const columns = (entities?.pv ? 1 : 0) + (entities?.battery ? 1 : 0) + 1;
    const center = (i: number) => ((i + 0.5) / columns) * 300;
    const home = center(columns - 1);
    const lane = (from: number, y: number, start: number) =>
      `M${from} ${start}C${from} ${y} ${from + 12} ${y} ${from + 24} ${y}L${home - 24} ${y}C${home - 12} ${y} ${home} ${y} ${home} 0`;
    const rows = SOURCES.filter(({ key }) => entities?.[key]);
    return html`
      <div class="links">
        ${svg`
          <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
            ${rows.map(({ key, color }, i) => {
              const d = key === 'grid' ? lane(36, 16, 24) : lane(center(i), key === 'pv' ? 8 : 12, 0);
              const w = power[key] ?? 0;
              const active = Math.abs(w) > threshold;
              return svg`
                <path class="track" d=${d}></path>
                <path
                  class="flow ${active ? '' : 'idle'}"
                  d=${d}
                  stroke=${color}
                  data-key=${key}
                  data-rate=${active ? 1 / flowDuration(w) : 0}
                  data-reverse=${w < 0 ? '1' : ''}
                ></path>
              `;
            })}
          </svg>
        `}
      </div>
    `;
  }

  private _renderReserve(power: Power, runtime: number | undefined, online: boolean | undefined, selfUse: number | undefined) {
    const entities = this._config?.entities;
    const threshold = this._config?.threshold ?? 10;
    const tomorrow = this._energy('forecast_tomorrow');
    // Hệ không nối lưới thì pin luôn là nguồn dự phòng, không có chuyện "mất điện".
    const offGrid = online === false || !entities?.grid;
    const grid = power.grid;
    const gridNote = grid === undefined || Math.abs(grid) <= threshold ? '' : grid > 0 ? ' · mua' : ' · phát';
    const items = [
      runtime !== undefined ? { label: offGrid ? 'Pin còn' : 'Nếu mất điện', value: `~${formatNumber(runtime)}`, unit: 'giờ', key: 'battery_soc' as EntityKey } : undefined,
      selfUse !== undefined ? { label: 'Tự cấp', value: `${selfUse}%`, key: 'grid_import_today' as EntityKey } : undefined,
      tomorrow !== undefined ? { label: 'Ngày mai', value: `${Math.round(tomorrow)}`, unit: 'kWh', key: 'forecast_tomorrow' as EntityKey } : undefined,
    ].filter((item) => item !== undefined);
    // Ở sơ đồ, lưới đã có nút riêng nên không lặp lại ở hàng này.
    const showGrid = !!entities?.grid && this._config?.layout !== 'flow';
    if (!items.length && !showGrid) return nothing;
    return html`
      <dl class="reserve">
        ${showGrid
          ? html`<div>
              <dt><i style="background:var(--sac-grid)"></i>Lưới${gridNote}</dt>
              <dd class="num"><button class="fact" @click=${() => this._moreInfo('grid')}>${grid === undefined ? '—' : formatPower(grid)}</button></dd>
            </div>`
          : nothing}
        ${items.map(
          (item) => html`<div><dt>${item.label}</dt><dd class="num"><button class="fact" @click=${() => this._moreInfo(item.key)}>${item.value}${item.unit ? html` <small>${item.unit}</small>` : nothing}</button></dd></div>`,
        )}
      </dl>
    `;
  }

  private _renderHours(now: Date) {
    const { cells, tomorrow, window } = this._hourCells(now);
    const scale = Math.max(1, ...cells.map((c) => Math.max(c.forecast ?? 0, c.actual ?? 0)));
    const hasForecast = cells.some((c) => c.forecast !== undefined);
    const hasActual = cells.some((c) => c.actual);
    if (!hasForecast && !hasActual) return nothing;

    const legend = hasForecast && hasActual ? 'Nền dự báo · Cột thực' : hasForecast ? 'Nền: dự báo' : 'Cột: thực tế';
    const focus = cells.find((c) => c.hour === this._focusHour);
    const summary = focus
      ? [`${focus.hour}h`, focus.forecast !== undefined ? `Dự báo ${formatPower(focus.forecast)}` : '', focus.actual !== undefined ? `Thực ${formatPower(focus.actual)}` : '']
          .filter(Boolean)
          .join(' · ')
      : legend;
    const first = cells.findIndex((c) => c.good);
    const span = cells.filter((c) => c.good).length;
    return html`
      <section class="hours" aria-label="Sản lượng theo giờ">
        <div class="hours-head">
          <span>${window ? `Giờ tốt dùng tải lớn${tomorrow ? ' ngày mai' : ''}` : 'Solar theo giờ'}</span>
          <b class=${focus ? '' : 'legend'}>${summary}</b>
        </div>
        <div class="cells" style="--count:${cells.length}">
          ${window && span
            ? html`<div class="window" style="grid-column:${first + 1} / span ${span}">${window.start}–${window.end}h</div>`
            : nothing}
          ${cells.map((c) => {
            const level = (c.forecast ?? 0) / scale;
            const label = `${c.hour} giờ${c.good ? ', giờ tốt' : ''}${c.forecast !== undefined ? `, dự báo ${formatPower(c.forecast)}` : ''}${c.actual !== undefined ? `, thực ${formatPower(c.actual)}` : ''}`;
            return html`
              <button
                class="cell ${c.now ? 'now' : ''}"
                aria-label=${label}
                @click=${() => (this._focusHour = c.hour)}
                @pointerenter=${(e: PointerEvent) => e.pointerType === 'mouse' && (this._focusHour = c.hour)}
                @pointerleave=${(e: PointerEvent) => e.pointerType === 'mouse' && (this._focusHour = undefined)}
                @focus=${() => (this._focusHour = c.hour)}
                @blur=${() => (this._focusHour = undefined)}
              >
                <span class="tile" style="--level:${Math.round(level * 70 + 6)}%">
                  ${c.actual ? html`<i style="height:${Math.round((c.actual / scale) * 100)}%"></i>` : nothing}
                </span>
                <span class="hour">${c.hour}</span>
              </button>
            `;
          })}
        </div>
      </section>
    `;
  }

  private _renderFine() {
    const consumed = this._energy('load_today');
    const load = consumed === undefined ? undefined : `${formatNumber(consumed)} kWh`;
    const savings = this._value('savings_month');
    const delta = this._cellDelta();
    const temp = this._value('inverter_temperature');
    const freq = this._value('grid_frequency');
    const part = (v: number | undefined) => (v === undefined ? '—' : formatNumber(v));
    const open = (key: EntityKey, text: string, side = '') =>
      this._config?.entities[key] ? html`<button class="fact ${side}" @click=${() => this._moreInfo(key)}>${text}</button>` : text;
    // Hai số trên một dòng, mỗi nửa mở lịch sử entity của nó; thiếu cả hai thì ẩn dòng.
    const pair = (a: EntityKey, b: EntityKey) => {
      const x = this._energy(a);
      const y = this._energy(b);
      return x === undefined && y === undefined
        ? undefined
        : html`${open(a, part(x), 'left')} / ${open(b, `${part(y)} kWh`, 'right')}`;
    };
    // Sơ đồ `inverter` đã ghi các số trong ngày cạnh từng nút; chỉ còn các dòng không thuộc nút nào.
    const inverter = this._config?.layout === 'inverter';
    const entities = this._config?.entities;
    const rows: Array<[string, unknown, boolean?]> = [
      [this._config?.savings_label ?? 'Tiết kiệm tháng', savings === undefined ? undefined : open('savings_month', `${formatNumber(savings, 0)} đ`)],
      ['Tải hôm nay', load === undefined ? undefined : open('load_today', load), true],
      ['Mua / phát', pair('grid_import_today', 'grid_export_today'), !!entities?.grid],
      ['Sạc / xả hôm nay', pair('battery_charge_today', 'battery_discharge_today'), !!entities?.battery],
      [this._config?.battery_period_label ?? 'Sạc / xả tháng', pair('battery_charge_period', 'battery_discharge_period')],
      ['Lệch cell', delta === undefined ? undefined : open('cell_delta', `${formatNumber(delta, 0)} mV`), !!entities?.battery],
      ['Nhiệt biến tần', temp === undefined ? undefined : open('inverter_temperature', `${formatNumber(temp, 0)} ${this._temperatureUnit()}`), true],
      ['Tần số lưới', freq === undefined ? undefined : open('grid_frequency', `${formatNumber(freq)} Hz`), !!entities?.grid],
    ];
    const shown = rows.filter((r) => r[1] !== undefined && !(inverter && r[2]));
    if (!shown.length) return nothing;
    return html`<dl class="fine">${shown.map(([k, v]) => html`<div><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>`;
  }

  private _renderFan() {
    const fan = this._entity('fan');
    const auto = this._entity('fan_auto');
    const { ids, rpm } = this._fanRpm();
    if (!fan && !ids.length) return nothing;
    const running = fan?.st.state === 'on' ? 'Đang chạy' : '—';
    const speed = fan?.st.state === 'off' ? 'Tắt' : rpm !== undefined ? `${formatNumber(rpm, 0)} vòng/phút` : running;
    return html`
      <div class="control">
        <button class="about" @click=${() => this._openEntity(fan?.cfg.entity ?? ids[0])}>
          <span>Quạt tản nhiệt</span><b>${speed}</b>
        </button>
        ${auto
          ? html`<button
              class="opt"
              aria-pressed=${auto.st.state === 'on' ? 'true' : 'false'}
              ?disabled=${auto.st.state !== 'on' && auto.st.state !== 'off'}
              @click=${() => this._perform(auto.cfg.entity, { action: 'toggle' })}
            >
              Tự động
            </button>`
          : nothing}
      </div>
    `;
  }

  private _renderEod() {
    const eod = this._entity('eod');
    if (!eod) return nothing;
    const id = eod.cfg.entity;
    const levels = this._config?.eod_levels ?? DEFAULT_EOD_LEVELS;
    const current = this._value('eod');
    const setLevel = (level: number) =>
      this._perform(id, {
        action: 'perform-action',
        perform_action: `${id.split('.')[0]}.set_value`,
        target: { entity_id: id },
        data: { value: level },
        confirmation: { text: `Đặt EOD lưới = ${level}%? Pin sẽ xả tới ${level}% mới lấy lưới.` },
      });
    return html`
      <div class="control">
        <button class="about" @click=${() => this._moreInfo('eod')}>
          <span>EOD lưới</span>${current === undefined
            ? html`<b>—</b>`
            : levels.includes(current)
              ? nothing
              : html`<b>${formatNumber(current, 0)}%</b>`}
        </button>
        <div class="opts" role="group" aria-label="Đặt EOD lưới">
          ${levels.map(
            (level) => html`<button
              class="opt"
              aria-pressed=${level === current ? 'true' : 'false'}
              ?disabled=${current === undefined}
              @click=${() => level !== current && setLevel(level)}
            >
              ${level}%
            </button>`,
          )}
        </div>
      </div>
    `;
  }

  /** Khu điều khiển: chỉ có khi đã khai quạt hoặc EOD, nên hệ không có quạt tự bỏ qua. */
  private _renderControls() {
    const fan = this._renderFan();
    const eod = this._renderEod();
    if (fan === nothing && eod === nothing) return nothing;
    return html`<div class="controls">${fan} ${eod}</div>`;
  }

  /** `hass` đổi theo mọi entity trong nhà; chỉ vẽ lại khi entity của card đổi. */
  protected shouldUpdate(changed: PropertyValues): boolean {
    const old = changed.get('hass') as HomeAssistant | undefined;
    if (changed.size !== 1 || !old || !this._config) return true;
    if (old.themes?.darkMode !== this.hass?.themes?.darkMode) return true;
    return Object.values(this._config.entities).flat().some((ref) => {
      const id = toEntityConfig(ref)?.entity;
      return id !== undefined && old.states[id] !== this.hass?.states[id];
    });
  }

  protected willUpdate(): void {
    const theme = this._config?.theme ?? 'auto';
    const dark = theme === 'auto' ? (this.hass?.themes?.darkMode ?? matchMedia('(prefers-color-scheme: dark)').matches) : theme === 'dark';
    this.dataset.mode = dark ? 'dark' : 'light';
    this.dataset.band = this._config?.band ?? 'red';
    this.dataset.motion = this._motion();
  }

  protected render() {
    if (!this._config) return nothing;
    const now = this.now ?? new Date();
    const threshold = this._config.threshold ?? 10;
    const online = this._gridOnline();
    const power: Power = {
      pv: this._power('pv'),
      battery: this._power('battery'),
      // Lúc mất lưới, sensor lưới có thể mất tín hiệu nhưng lưới chắc chắn bằng 0.
      grid: this._power('grid') ?? (online === false && this._config.entities.grid ? 0 : undefined),
      load: this._power('load'),
    };
    const unread = this._unread(power);
    const load = resolveLoad(power);
    const flows = computeFlows(power);
    const soc = this._value('battery_soc');
    const capacity = this._config.battery_capacity;
    const runtime = soc !== undefined && capacity && load !== undefined ? hoursLeft(soc, capacity, this._config.battery_reserve ?? 0, load) : undefined;
    const fullIn = soc !== undefined && capacity ? hoursToFull(soc, capacity, Math.max(0, -(power.battery ?? 0))) : undefined;
    const bought = this._energy('grid_import_today');
    const consumed = this._energy('load_today');
    const selfUse = bought !== undefined && consumed ? Math.max(0, Math.round((1 - bought / consumed) * 100)) : undefined;
    const status = unread ? undefined : statusLine({ power, flows, threshold, gridOnline: online, runtime, fullIn });

    return html`
      <ha-card>
        <div class="page">
          ${this._renderBand(now, online)}
          ${this._alerts().map((text) => html`<p class="alert">${text}</p>`)}
          ${this._config.layout === 'inverter'
            ? this._renderInverter(power, load, unread ? undefined : flows, runtime, online, selfUse)
            : html`
                ${this._config.layout === 'flow'
                  ? this._renderFlow(power, load, unread ? undefined : flows)
                  : html`${this._renderLead(power, load, unread ? undefined : flows)} ${this._renderLinks(power)}`}
                ${this._renderReserve(power, runtime, online, selfUse)}
              `}
          ${status ? html`<p class="say"><b>${status.lead}</b> ${status.rest ?? ''}</p>` : nothing}
          ${this._config.compact ? nothing : html`${this._renderHours(now)} ${this._renderFine()}`} ${this._renderControls()}
        </div>
      </ha-card>
    `;
  }

  protected updated(changed: PropertyValues): void {
    this._watchRig();
    this._layoutWires();
    this._syncFlows();
    if (changed.has('hass') || changed.has('_config')) this._maybeFetchHistory();
  }

  /** Dây của sơ đồ `inverter` theo vị trí các nút: vẽ lại khi sơ đồ hay một nút đổi cỡ (card co giãn, font nạp xong). */
  private _watchRig(): void {
    const rig = this.renderRoot.querySelector('.rig');
    if (!rig) return;
    this._resize ??= new ResizeObserver(() => this._layoutWires());
    for (const el of [rig, ...rig.querySelectorAll('.part, [data-anchor]')]) this._resize.observe(el);
  }

  /**
   * Chế độ hạt từ `animation`. Nhận cả true/false như card Sunsynk, và vì YAML 1.1 (PyYAML) đọc
   * `animation: on` không quote thành true.
   */
  private _motion(): 'auto' | 'on' | 'off' {
    const value: unknown = this._config?.animation;
    if (value === true || value === 'on') return 'on';
    if (value === false || value === 'off') return 'off';
    return 'auto';
  }

  /** Hạt chạy bằng Web Animations, ngoài vòng render: đổi tốc độ không làm giật. */
  private _syncFlows(): void {
    // `animation: on` vẫn chạy hạt khi hệ điều hành bật giảm chuyển động (Windows tắt hiệu ứng hoạt ảnh); `off` không bao giờ chạy.
    const motion = this._motion();
    const reduced = motion === 'off' || (motion === 'auto' && matchMedia('(prefers-reduced-motion: reduce)').matches);
    // .flow: hạt trên đường SVG (layout columns); .dots: chấm trên dây CSS (layout flow);
    // .solo: một hạt đi hết dây mỗi vòng (layout inverter), tốc độ px/giây theo công suất nên dây dài hay ngắn chạy đều nhau.
    for (const el of this.renderRoot.querySelectorAll<SVGPathElement | HTMLElement>('.flow, .dots')) {
      const dots = el.classList.contains('dots');
      const solo = el.classList.contains('solo');
      const key = `${dots ? 'w' : 'f'}-${el.dataset.key!}`;
      const perSecond = Number(el.dataset.rate);
      const length = solo && perSecond > 0 ? (el as SVGPathElement).getTotalLength() : 0;
      const rate = solo && perSecond > 0 ? 1 / Math.max(SOLO_MIN_LAP, length / (SOLO_SPEED * perSecond)) : perSecond;
      let animation = this._animations.get(key);
      if (reduced || !el.animate) {
        animation?.cancel();
        this._animations.delete(key);
        continue;
      }
      if (!animation || (animation.effect as KeyframeEffect).target !== el) {
        animation?.cancel();
        const frames = dots
          ? el.dataset.axis === 'v'
            ? [{ backgroundPosition: '50% 0px' }, { backgroundPosition: `50% ${WIRE_GAP}px` }]
            : [{ backgroundPosition: '0px 50%' }, { backgroundPosition: `${WIRE_GAP}px 50%` }]
          : [{ strokeDashoffset: 0 }, { strokeDashoffset: solo ? -100 : -DASH_PERIOD }];
        animation = el.animate(frames, { duration: 1000, iterations: Infinity });
        this._animations.set(key, animation);
      }
      animation.effect?.updateTiming({ direction: el.dataset.reverse ? 'reverse' : 'normal' });
      if (rate > 0) {
        animation.updatePlaybackRate(rate);
        if (animation.playState !== 'running') animation.play();
      } else {
        animation.pause();
      }
    }
  }

  private async _maybeFetchHistory(): Promise<void> {
    const entity = toEntityConfig(this._config?.entities.pv)?.entity;
    if (!entity || !this.hass || this._config?.compact) return;
    if (Date.now() - this._lastFetch < HISTORY_REFRESH_MS) return;
    this._lastFetch = Date.now();
    const now = this.now ?? new Date();
    try {
      this._hourly = toHourly(await fetchToday(this.hass, entity, now), now, this._scale('pv'));
    } catch (err) {
      // Mất lịch sử chỉ làm dải giờ thiếu cột thực tế, phần còn lại của card vẫn chạy.
      console.warn('solar-almanac-card: không đọc được lịch sử', err);
    }
  }

  static styles = [
    themeStyles,
    css`
      :host {
        display: block;
      }
      ha-card {
        display: block;
        overflow: hidden;
        background: var(--sac-surface);
        color: var(--sac-fg);
        container-type: inline-size;
        font-family: var(--ha-font-family-body, Roboto, sans-serif);
        font-variant-numeric: tabular-nums;
      }
      /* Mọi kích thước tính theo --u: card rộng ra thì chữ lớn theo để đọc từ xa. */
      .page {
        --u: clamp(0.92px, 0.2427cqi, 1.7px);
        font-size: calc(var(--u) * 14);
        line-height: 1.4;
      }
      button {
        all: unset;
        box-sizing: border-box;
        cursor: pointer;
      }
      button:focus-visible {
        outline: max(2px, calc(var(--u) * 2)) solid var(--sac-fg);
        outline-offset: calc(var(--u) * 1);
      }
      .num {
        font-family: 'SAC Numerals', 'Arial Narrow', var(--ha-font-family-body, Roboto, sans-serif);
        font-weight: 700;
      }
      .band {
        display: flex;
        align-items: baseline;
        gap: calc(var(--u) * 10);
        padding: calc(var(--u) * 9) calc(var(--u) * 14);
        background: var(--sac-band);
        color: var(--sac-on-band);
        font-weight: 500;
      }
      .title {
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .state {
        margin-left: auto;
        white-space: nowrap;
      }
      .state.down {
        background: var(--sac-on-band);
        color: var(--sac-alert);
        font-weight: 700;
        border-radius: calc(var(--u) * 4);
        padding: 0 calc(var(--u) * 7);
      }
      .lead {
        display: grid;
        grid-template-columns: repeat(var(--cols), minmax(0, 1fr));
        gap: calc(var(--u) * 12);
        padding: calc(var(--u) * 12) calc(var(--u) * 14) 0;
      }
      .stat {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .main {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .label,
      .reserve dt {
        font-size: max(12px, calc(var(--u) * 12));
        color: var(--sac-dim);
        white-space: nowrap;
      }
      .label i,
      .reserve dt i {
        display: inline-block;
        width: calc(var(--u) * 9);
        height: calc(var(--u) * 9);
        border-radius: calc(var(--u) * 2);
        margin-right: calc(var(--u) * 4);
      }
      .main .num {
        font-size: calc(var(--u) * 58);
        line-height: 1.08;
        letter-spacing: -0.02em;
        color: var(--sac-fg);
        white-space: nowrap;
      }
      .main small {
        margin-left: calc(var(--u) * 3);
        font-family: var(--ha-font-family-body, Roboto, sans-serif);
        font-size: calc(var(--u) * 14);
        font-weight: 500;
        letter-spacing: 0;
        color: var(--sac-dim);
      }
      .gauge,
      .mix {
        display: flex;
        height: calc(var(--u) * 5);
        margin-top: calc(var(--u) * 4);
      }
      .gauge {
        background: var(--sac-border);
        border-radius: calc(var(--u) * 2);
        overflow: hidden;
      }
      .gauge span {
        display: block;
        height: 100%;
      }
      .mix {
        gap: calc(var(--u) * 2);
      }
      .mix i {
        min-width: calc(var(--u) * 3);
        border-radius: calc(var(--u) * 2);
      }
      .sub {
        margin-top: calc(var(--u) * 4);
        font-size: max(12px, calc(var(--u) * 12.5));
        color: var(--sac-dim);
        white-space: nowrap;
      }
      .links {
        height: calc(var(--u) * 24);
        margin: calc(var(--u) * 5) calc(var(--u) * 14) calc(var(--u) * 2);
      }
      .links svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      .track,
      .flow {
        fill: none;
        vector-effect: non-scaling-stroke;
      }
      .track {
        stroke: var(--sac-border);
        stroke-width: 1px;
      }
      .flow {
        stroke-width: 3.5px;
        stroke-linecap: round;
        stroke-dasharray: 0.1 ${DASH_PERIOD - 0.1};
      }
      .flow.idle {
        display: none;
      }
      /* ---- layout: flow ---- */
      .map {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(calc(var(--u) * 26), 0.8fr) auto minmax(calc(var(--u) * 26), 0.8fr) minmax(0, 1.15fr);
        align-items: center;
        padding: calc(var(--u) * 10) calc(var(--u) * 14) calc(var(--u) * 6);
      }
      .node {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-self: center;
        min-width: 0;
        text-align: center;
      }
      .node .main {
        align-items: center;
      }
      .node .gauge,
      .node .mix {
        align-self: stretch;
        min-width: calc(var(--u) * 92);
      }
      .node .main .num {
        font-size: calc(var(--u) * 32);
        line-height: 1;
      }
      .node.side .main .num {
        font-size: calc(var(--u) * 30);
      }
      .node.home .main .num {
        font-size: calc(var(--u) * 44);
      }
      .node .sub {
        margin-top: calc(var(--u) * 2);
      }
      .node.side {
        justify-self: stretch;
      }
      .node.side .gauge,
      .node.side .mix {
        min-width: 0;
      }
      /* Hàng Solar và hàng Pin: tỉ lệ hai bên = (1 + 0.8) và (0.8 + 1.15) của .map, để nút đứng thẳng trên/dưới ô biến tần. */
      .axis {
        display: grid;
        grid-template-columns: minmax(0, 1.8fr) auto minmax(0, 1.95fr);
        grid-template-areas: 'left mid right';
        align-items: center;
      }
      .axis > .node {
        grid-area: mid;
      }
      .mppts {
        display: flex;
        flex-direction: column;
        gap: calc(var(--u) * 6);
        min-width: 0;
      }
      .mppts.left {
        grid-area: left;
      }
      .mppts.right {
        grid-area: right;
      }
      .mppt {
        display: flex;
        align-items: stretch;
        min-width: 0;
      }
      .mppts.right .mppt {
        flex-direction: row-reverse;
      }
      .mppt .box {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 0 1 auto;
        box-sizing: border-box;
        min-width: 0;
        padding: calc(var(--u) * 5) calc(var(--u) * 8);
        border: 1px solid var(--sac-solar);
        border-radius: calc(var(--u) * 4);
        text-align: center;
      }
      .mppt .num {
        font-size: calc(var(--u) * 22);
        line-height: 1.05;
        white-space: nowrap;
      }
      .mppt .sub {
        margin-top: calc(var(--u) * 1);
        font-size: max(12px, calc(var(--u) * 12));
      }
      .mppt .wire.h {
        flex: 1 1 calc(var(--u) * 12);
        min-width: calc(var(--u) * 12);
        margin: 0 calc(var(--u) * 4);
      }
      .hub {
        display: grid;
        place-items: center;
        width: calc(var(--u) * 34);
        height: calc(var(--u) * 34);
        border: 1.5px solid var(--sac-dim);
        border-radius: calc(var(--u) * 4);
        color: var(--sac-dim);
      }
      .hub svg {
        width: 62%;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
      }
      .wire {
        position: relative;
        display: block;
        align-self: stretch;
        justify-self: stretch;
      }
      .wire.v {
        min-height: calc(var(--u) * 22);
        margin: calc(var(--u) * 3) 0;
      }
      .wire.h {
        margin: 0 calc(var(--u) * 3);
      }
      .wire::before {
        content: '';
        position: absolute;
        background: var(--sac-border);
      }
      .wire.on::before {
        background: var(--wire-color);
        opacity: 0.45;
      }
      .wire.h::before {
        left: 0;
        right: 0;
        top: 50%;
        height: var(--wire);
        transform: translateY(-50%);
      }
      .wire.v::before {
        top: 0;
        bottom: 0;
        left: 50%;
        width: var(--wire);
        transform: translateX(-50%);
      }
      .dots {
        position: absolute;
        display: none;
        background-image: radial-gradient(circle closest-side, var(--wire-color) 85%, transparent 100%);
      }
      .wire.on .dots {
        display: block;
      }
      .wire.h .dots {
        left: 0;
        right: 0;
        top: 50%;
        height: calc(var(--wire) + 4px);
        transform: translateY(-50%);
        background-size: ${WIRE_GAP}px 100%;
        background-repeat: repeat-x;
      }
      .wire.v .dots {
        top: 0;
        bottom: 0;
        left: 50%;
        width: calc(var(--wire) + 4px);
        transform: translateX(-50%);
        background-size: 100% ${WIRE_GAP}px;
        background-repeat: repeat-y;
      }
      /* Giảm chuyển động (hoặc animation: off): bỏ chấm, dây đậm màu nguồn; animation: on thì vẫn chạy. */
      @media (prefers-reduced-motion: reduce) {
        :host(:not([data-motion='on'])) .dots {
          display: none !important;
        }
        :host(:not([data-motion='on'])) .wire.on::before {
          opacity: 1;
        }
      }
      :host([data-motion='off']) .dots {
        display: none !important;
      }
      :host([data-motion='off']) .wire.on::before {
        opacity: 1;
      }
      /* ---- layout: inverter (kiểu Sunsynk) ---- */
      .rig {
        /* Sơ đồ ba cột cần co thêm dưới mốc 0.92px của tờ giấy để vừa card điện thoại; chữ nhỏ có sàn 12px. */
        --u: clamp(0.78px, 0.2427cqi, 1.7px);
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
        column-gap: calc(var(--u) * 10);
        row-gap: calc(var(--u) * 24);
        align-items: center;
        padding: calc(var(--u) * 12) calc(var(--u) * 14) calc(var(--u) * 10);
      }
      .rig .wires {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
        pointer-events: none;
      }
      .rig .track,
      .rig .flow {
        stroke: var(--c);
      }
      /* Dây nghỉ vẫn mang màu nguồn (nhạt) để nhìn ra nút nào nối với nút nào, như card Sunsynk. */
      .rig .track {
        stroke-width: 1.5px;
        opacity: 0.35;
      }
      .rig .track.on {
        stroke: var(--c);
        stroke-width: var(--w);
        opacity: 0.45;
      }
      /* Một hạt mỗi dây: nét đứt dài bằng cả dây (pathLength 100), đầu tròn thành hạt. */
      .rig .flow {
        stroke-width: calc(var(--w) + 4px);
        stroke-dasharray: 0.1 99.9;
      }
      @media (prefers-reduced-motion: reduce) {
        :host(:not([data-motion='on'])) .rig .flow {
          display: none;
        }
        :host(:not([data-motion='on'])) .rig .track.on {
          opacity: 1;
        }
      }
      :host([data-motion='off']) .rig .flow {
        display: none;
      }
      :host([data-motion='off']) .rig .track.on {
        opacity: 1;
      }
      .rig .part {
        position: relative;
        z-index: 1;
        min-width: 0;
      }
      .rig .part .text {
        display: flex;
        flex-direction: column;
        gap: calc(var(--u) * 3);
        min-width: 0;
      }
      .rig .icon {
        display: block;
        flex: none;
        width: calc(var(--u) * 32);
        height: calc(var(--u) * 32);
      }
      .rig .icon svg {
        display: block;
        width: 100%;
        height: 100%;
        fill: none;
        stroke: currentColor;
        stroke-width: 2;
        stroke-linecap: round;
        stroke-linejoin: round;
      }
      .rig .val {
        display: inline-flex;
        align-self: flex-start;
        justify-content: center;
        min-width: calc(var(--u) * 64);
        padding: calc(var(--u) * 1) calc(var(--u) * 8);
        border: 1.5px solid var(--c);
        border-radius: calc(var(--u) * 4);
        color: var(--sac-fg);
      }
      .rig .val .num {
        font-size: calc(var(--u) * 22);
        line-height: 1.15;
        white-space: nowrap;
      }
      /* Nhãn và giá trị cùng một dòng chữ: nút số là liên kết nằm trong câu (WCAG 2.5.8, ngoại lệ inline). */
      .rig .kv {
        font-size: max(12px, calc(var(--u) * 12.5));
        line-height: 1.35;
        color: var(--sac-dim);
      }
      .rig .kv b {
        color: var(--sac-fg);
        font-weight: 500;
        white-space: nowrap;
      }
      .rig .lk {
        cursor: pointer;
      }
      .rig .gauge,
      .rig .mix {
        margin-top: 0;
      }
      .rig .sub {
        margin-top: 0;
        font-size: max(12px, calc(var(--u) * 12.5));
        white-space: normal;
      }
      /* Solar: đầu nút trên, các ô PV dưới, dây từ đáy từng ô chạy về biến tần. */
      .rig .solar {
        align-self: end;
      }
      .rig .solar .head {
        display: flex;
        gap: calc(var(--u) * 8);
        align-items: flex-start;
      }
      .rig .solar .head .text {
        flex: 1;
      }
      .rig .headline {
        display: flex;
        align-items: center;
        gap: calc(var(--u) * 8);
      }
      .rig .pvs {
        display: grid;
        grid-template-columns: repeat(var(--n), minmax(0, 1fr));
        gap: calc(var(--u) * 10);
        margin-top: calc(var(--u) * 10);
      }
      .rig .pv {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-width: 0;
        padding: calc(var(--u) * 4) calc(var(--u) * 6);
        border: 1.5px solid var(--sac-solar);
        border-radius: calc(var(--u) * 4);
        text-align: center;
      }
      .rig .pv .num {
        font-size: calc(var(--u) * 20);
        line-height: 1.1;
        white-space: nowrap;
      }
      /* Nhiều MPPT thì ô hẹp: tên xuống dòng chứ không cắt. */
      .rig .pv .label {
        max-width: 100%;
        white-space: normal;
        text-wrap: balance;
      }
      .rig .pv .sub {
        font-size: max(12px, calc(var(--u) * 12));
        text-wrap: balance;
      }
      /* Pin: chữ căn phải, biểu tượng sát biến tần. */
      .rig .bat {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: calc(var(--u) * 8);
      }
      .rig .bat .text {
        align-items: flex-end;
        text-align: right;
      }
      .rig .bat .val {
        align-self: flex-end;
      }
      .rig .bat .main {
        align-items: flex-end;
      }
      .rig .soc {
        font-size: calc(var(--u) * 34);
        line-height: 1;
        color: var(--sac-fg);
      }
      .rig .soc small {
        margin-left: calc(var(--u) * 2);
        font-family: var(--ha-font-family-body, Roboto, sans-serif);
        font-size: max(12px, calc(var(--u) * 14));
        font-weight: 500;
        color: var(--sac-dim);
      }
      .rig .icon.battery {
        width: calc(var(--u) * 26);
        height: calc(var(--u) * 44);
        color: var(--sac-dim);
      }
      .rig .icon.battery .body {
        stroke-width: 1.8;
      }
      .rig .icon.battery .cap {
        fill: currentColor;
        stroke: none;
      }
      .rig .icon.battery .level {
        fill: var(--sac-battery);
        stroke: none;
      }
      /* Nhà, lưới: biểu tượng trái sát dây, chữ phải. */
      .rig .home,
      .rig .grid {
        display: flex;
        align-items: center;
        gap: calc(var(--u) * 8);
      }
      .rig .home .text,
      .rig .grid .text {
        flex: 1;
      }
      .rig .home .mix {
        align-self: stretch;
      }
      /* Biến tần: biểu tượng giữa ô, nhiệt độ treo dưới để dây ngang trúng tâm. */
      .rig .inv {
        display: grid;
        justify-items: center;
        margin: 0 calc(var(--u) * 6);
      }
      .rig .inv .icon {
        width: calc(var(--u) * 46);
        height: calc(var(--u) * 46);
        color: var(--sac-dim);
      }
      .rig .temp {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-top: calc(var(--u) * 3);
        font-size: max(12px, calc(var(--u) * 12.5));
        font-weight: 500;
        white-space: nowrap;
        color: var(--sac-fg);
      }
      .rig .temp.hot {
        padding: 0 calc(var(--u) * 5);
        border-radius: calc(var(--u) * 4);
        background: var(--sac-on-band);
        color: var(--sac-alert);
        font-weight: 700;
      }
      dl,
      dd {
        margin: 0;
      }
      .reserve {
        display: grid;
        grid-auto-flow: column;
        grid-auto-columns: minmax(0, 1fr);
        gap: calc(var(--u) * 8);
        padding: calc(var(--u) * 2) calc(var(--u) * 14) calc(var(--u) * 2);
      }
      .reserve div {
        position: relative;
        min-width: 0;
      }
      .reserve dd {
        font-size: calc(var(--u) * 21);
        line-height: 1.1;
        white-space: nowrap;
      }
      .reserve small {
        font-family: var(--ha-font-family-body, Roboto, sans-serif);
        font-size: max(12px, calc(var(--u) * 12));
        font-weight: 500;
      }
      .alert {
        margin: 0;
        padding: calc(var(--u) * 5) calc(var(--u) * 14);
        background: var(--sac-on-band);
        color: var(--sac-alert);
        border-bottom: 1px solid var(--sac-alert);
        font-size: calc(var(--u) * 13.5);
        font-weight: 600;
      }
      .say {
        margin: calc(var(--u) * 6) calc(var(--u) * 14) calc(var(--u) * 12);
        text-align: center;
        font-size: calc(var(--u) * 14.5);
        text-wrap: balance;
      }
      .say b {
        font-weight: 600;
      }
      .hours {
        padding: 0 calc(var(--u) * 14);
      }
      .hours:last-child {
        padding-bottom: calc(var(--u) * 14);
      }
      .hours-head {
        display: flex;
        justify-content: space-between;
        gap: calc(var(--u) * 10);
        margin-bottom: calc(var(--u) * 5);
        font-size: max(12px, calc(var(--u) * 12.5));
        color: var(--sac-dim);
      }
      .hours-head b {
        color: var(--sac-fg);
        font-weight: 600;
        white-space: nowrap;
      }
      .hours-head b.legend {
        color: var(--sac-dim);
        font-weight: 400;
      }
      .cells {
        display: grid;
        grid-template-columns: repeat(var(--count), minmax(0, 1fr));
        gap: calc(var(--u) * 2);
        touch-action: pan-y;
      }
      .cell {
        display: block;
        grid-row: 2;
        text-align: center;
      }
      .tile {
        position: relative;
        display: block;
        height: calc(var(--u) * 40);
        border-radius: calc(var(--u) * 3);
        overflow: hidden;
        background: color-mix(in oklch, var(--sac-solar) var(--level), var(--sac-surface));
      }
      .tile i {
        position: absolute;
        inset: auto 0 0;
        background: var(--sac-solar);
      }
      .window {
        grid-row: 1;
        justify-self: center;
        box-sizing: border-box;
        width: max-content;
        min-width: 100%;
        padding: calc(var(--u) * 2) calc(var(--u) * 4);
        border-radius: calc(var(--u) * 3);
        background: var(--sac-fg);
        color: var(--sac-surface);
        font-size: max(12px, calc(var(--u) * 12));
        font-weight: 600;
        line-height: 1.25;
        text-align: center;
        white-space: nowrap;
      }
      .cell.now .tile {
        outline: calc(var(--u) * 2) solid var(--sac-fg);
        outline-offset: calc(var(--u) * 1);
      }
      .hour {
        display: block;
        margin-top: calc(var(--u) * 3);
        font-size: max(12px, calc(var(--u) * 11));
        color: var(--sac-dim);
      }
      .fine {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        /* Hàng cách nhau đủ để tâm hai nút số xếp chồng cách ≥ 24px (WCAG 2.5.8). */
        gap: max(8px, calc(var(--u) * 3)) calc(var(--u) * 16);
        margin: calc(var(--u) * 10) calc(var(--u) * 14) calc(var(--u) * 12);
        padding-top: calc(var(--u) * 9);
        border-top: 1px solid var(--sac-border);
        font-size: max(12px, calc(var(--u) * 12.5));
        color: var(--sac-dim);
      }
      .fine div {
        position: relative;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        column-gap: calc(var(--u) * 8);
      }
      .fine dt {
        white-space: nowrap;
      }
      /* Cột hẹp không chứa nổi cả dòng thì giá trị xuống dòng, vẫn căn phải. */
      .fine dd {
        margin-left: auto;
        color: var(--sac-fg);
        font-weight: 500;
        white-space: nowrap;
      }
      /* Vùng bấm phủ cả dòng, nhãn cũng chạm được. */
      .fact::after {
        content: '';
        position: absolute;
        inset: 0;
      }
      /* Dòng có hai số: mỗi nửa dòng mở một entity. */
      .fact.left::after {
        right: 50%;
      }
      .fact.right::after {
        left: 50%;
      }
      .controls {
        display: grid;
        gap: calc(var(--u) * 4);
        margin: calc(var(--u) * 10) calc(var(--u) * 14) calc(var(--u) * 12);
        padding-top: calc(var(--u) * 9);
        border-top: 1px solid var(--sac-border);
        font-size: max(12px, calc(var(--u) * 12.5));
        color: var(--sac-dim);
      }
      .fine + .controls {
        margin-top: 0;
      }
      .control {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: calc(var(--u) * 4) calc(var(--u) * 8);
      }
      .about {
        display: flex;
        gap: calc(var(--u) * 8);
        min-width: 0;
        white-space: nowrap;
      }
      .about b {
        color: var(--sac-fg);
        font-weight: 500;
      }
      .opts {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        margin-left: auto;
        gap: calc(var(--u) * 4);
      }
      .opt {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: calc(var(--u) * 46);
        /* Không thấp hơn 36px để bấm bằng ngón tay trên điện thoại. */
        height: max(36px, calc(var(--u) * 32));
        padding: 0 calc(var(--u) * 9);
        border: 1px solid var(--sac-border);
        border-radius: calc(var(--u) * 3);
        color: var(--sac-fg);
        font-weight: 500;
      }
      .opt[aria-pressed='true'] {
        background: var(--sac-fg);
        border-color: var(--sac-fg);
        color: var(--sac-surface);
        font-weight: 600;
      }
      .opt:disabled {
        cursor: default;
        color: var(--sac-dim);
      }
      @media (hover: hover) {
        .rig .lk:hover {
          text-decoration: underline;
        }
        .rig .pv:hover .label,
        .main:hover .label,
        button.sub:hover,
        .about:hover span,
        .cell:hover .hour {
          color: var(--sac-fg);
        }
        .opt:not(:disabled):hover {
          border-color: var(--sac-fg);
        }
      }
      /* Card hẹp: bớt cỡ để cột ba số vẫn chứa đủ "2,40 kW". */
      @container (max-width: 400px) {
        .lead {
          gap: calc(var(--u) * 8);
        }
        .main .num {
          font-size: calc(var(--u) * 48);
        }
        .main small {
          margin-left: calc(var(--u) * 2);
          font-size: max(12px, calc(var(--u) * 12.5));
        }
      }
      @container (max-width: 400px) {
        .node .main .num {
          font-size: calc(var(--u) * 30);
        }
        .node.side .main .num {
          font-size: calc(var(--u) * 28);
        }
        .node.home .main .num {
          font-size: calc(var(--u) * 38);
        }
        .node .gauge,
        .node .mix {
          min-width: calc(var(--u) * 70);
        }
      }
      /* Sơ đồ inverter ở card hẹp: thu khoảng cách và biểu tượng trước, số nhỏ lại sau cùng; chữ không dưới 12px. */
      @container (max-width: 400px) {
        .rig {
          column-gap: calc(var(--u) * 6);
          padding-left: calc(var(--u) * 10);
          padding-right: calc(var(--u) * 10);
        }
        .rig .inv {
          margin: 0 calc(var(--u) * 2);
        }
        .rig .icon.battery {
          width: calc(var(--u) * 22);
          height: calc(var(--u) * 38);
        }
        .rig .val {
          padding: calc(var(--u) * 1) calc(var(--u) * 5);
        }
      }
      @container (max-width: 340px) {
        .rig .val .num {
          font-size: calc(var(--u) * 19);
        }
        .rig .soc {
          font-size: calc(var(--u) * 30);
        }
        .rig .icon {
          width: calc(var(--u) * 26);
          height: calc(var(--u) * 26);
        }
        .rig .inv .icon {
          width: calc(var(--u) * 38);
          height: calc(var(--u) * 38);
        }
      }
      @container (max-width: 367px) {
        .title {
          display: none;
        }
        .cell:nth-of-type(even) .hour {
          visibility: hidden;
        }
        .fine {
          grid-template-columns: minmax(0, 1fr);
        }
      }
    `,
  ];
}

if (!customElements.get(CARD_TAG)) {
  customElements.define(CARD_TAG, SolarAlmanacCard);
  window.customCards = window.customCards || [];
  window.customCards.push({
    type: CARD_TAG,
    name: 'Solar Almanac',
    description: 'Luồng năng lượng và giờ tốt dùng tải lớn, trình bày như một tờ lịch',
    preview: true,
  });
  console.info(`%c SOLAR-ALMANAC-CARD %c v${__VERSION__} `, 'background:#c4302b;color:#fff', 'background:#333;color:#fff');
}

declare global {
  interface HTMLElementTagNameMap {
    'solar-almanac-card': SolarAlmanacCard;
  }
}
