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
import type { EntityRef, FlowEntityConfig, FlowKey, HomeAssistant, SolarAlmanacCardConfig } from './types';

const CARD_TAG = 'solar-almanac-card';
const HISTORY_REFRESH_MS = 5 * 60_000;
const DASH_PERIOD = 15;
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
    const volt = voltage !== undefined ? ` · ${Math.round(voltage)} V` : '';
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
          : online || voltage !== undefined
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
    if (!items.length && !entities?.grid) return nothing;
    return html`
      <dl class="reserve">
        ${entities?.grid
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
    const bought = this._energy('grid_import_today');
    const sold = this._energy('grid_export_today');
    const savings = this._value('savings_month');
    const delta = this._cellDelta();
    const temp = this._value('inverter_temperature');
    const freq = this._value('grid_frequency');
    const part = (v: number | undefined) => (v === undefined ? '—' : formatNumber(v));
    const open = (key: EntityKey, text: string, side = '') =>
      this._config?.entities[key] ? html`<button class="fact ${side}" @click=${() => this._moreInfo(key)}>${text}</button>` : text;
    const rows: Array<[string, unknown]> = [
      [this._config?.savings_label ?? 'Tiết kiệm tháng', savings === undefined ? undefined : open('savings_month', `${formatNumber(savings, 0)} đ`)],
      ['Tải hôm nay', load === undefined ? undefined : open('load_today', load)],
      ['Mua / phát', bought === undefined && sold === undefined ? undefined : html`${open('grid_import_today', part(bought), 'left')} / ${open('grid_export_today', `${part(sold)} kWh`, 'right')}`],
      ['Lệch cell', delta === undefined ? undefined : open('cell_delta', `${formatNumber(delta, 0)} mV`)],
      ['Nhiệt biến tần', temp === undefined ? undefined : open('inverter_temperature', `${formatNumber(temp, 0)} ${this._temperatureUnit()}`)],
      ['Tần số lưới', freq === undefined ? undefined : open('grid_frequency', `${formatNumber(freq)} Hz`)],
    ];
    const shown = rows.filter((r) => r[1] !== undefined);
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
          ${this._renderLead(power, load, unread ? undefined : flows)} ${this._renderLinks(power)}
          ${this._renderReserve(power, runtime, online, selfUse)}
          ${status ? html`<p class="say"><b>${status.lead}</b> ${status.rest ?? ''}</p>` : nothing}
          ${this._config.compact ? nothing : html`${this._renderHours(now)} ${this._renderFine()}`} ${this._renderControls()}
        </div>
      </ha-card>
    `;
  }

  protected updated(changed: PropertyValues): void {
    this._syncFlows();
    if (changed.has('hass') || changed.has('_config')) this._maybeFetchHistory();
  }

  /** Hạt chạy bằng Web Animations, ngoài vòng render: đổi tốc độ không làm giật. */
  private _syncFlows(): void {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    for (const el of this.renderRoot.querySelectorAll<SVGPathElement>('.flow')) {
      const key = el.dataset.key!;
      const rate = Number(el.dataset.rate);
      let animation = this._animations.get(key);
      if (reduced || !el.animate) continue;
      if (!animation || (animation.effect as KeyframeEffect).target !== el) {
        animation?.cancel();
        animation = el.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: -DASH_PERIOD }], { duration: 1000, iterations: Infinity });
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
        outline: calc(var(--u) * 2) solid var(--sac-fg);
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
        font-size: max(11px, calc(var(--u) * 12));
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
        font-size: calc(var(--u) * 12.5);
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
        font-size: calc(var(--u) * 12);
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
        font-size: calc(var(--u) * 12.5);
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
        font-size: max(11px, calc(var(--u) * 12));
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
        font-size: max(11px, calc(var(--u) * 11));
        color: var(--sac-dim);
      }
      .fine {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: calc(var(--u) * 3) calc(var(--u) * 16);
        margin: calc(var(--u) * 10) calc(var(--u) * 14) calc(var(--u) * 12);
        padding-top: calc(var(--u) * 9);
        border-top: 1px solid var(--sac-border);
        font-size: calc(var(--u) * 12.5);
        color: var(--sac-dim);
      }
      .fine div {
        position: relative;
        display: flex;
        justify-content: space-between;
        gap: calc(var(--u) * 8);
      }
      .fine dt {
        white-space: nowrap;
      }
      .fine dd {
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
        font-size: calc(var(--u) * 12.5);
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
          font-size: calc(var(--u) * 12.5);
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
