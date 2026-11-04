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

type EntityKey = keyof SolarAlmanacCardConfig['entities'];

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
    return this._config?.compact ? 5 : 11;
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

  /** Hệ số đổi về W theo `unit_of_measurement`. */
  private _scale(key: EntityKey): number {
    const unit = String(this._entity(key)?.st.attributes.unit_of_measurement ?? '').toLowerCase();
    return unit === 'kw' ? 1000 : 1;
  }

  /** Đọc công suất (W) của một nút, đã quy đổi kW và áp dụng invert. */
  private _power(key: FlowKey | 'load'): number | undefined {
    const v = this._value(key);
    if (v === undefined) return undefined;
    const w = v * this._scale(key);
    return this._entity(key)!.cfg.invert ? -w : w;
  }

  private _moreInfo(key: EntityKey | undefined): void {
    const entityId = key && toEntityConfig(this._config?.entities[key])?.entity;
    if (!entityId) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId } }));
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
    const checks: Array<[EntityKey, string, number | undefined, string]> = [
      ['cell_delta', 'Lệch cell', this._config?.cell_delta_warn, 'mV'],
      ['inverter_temperature', 'Nhiệt biến tần', this._config?.inverter_temperature_warn, '°C'],
    ];
    return checks.flatMap(([key, name, limit, fallback]) => {
      const value = this._value(key);
      if (value === undefined || limit === undefined || value <= limit) return [];
      const unit = this._entity(key)?.st.attributes.unit_of_measurement || fallback;
      return [`${name} ${formatNumber(value, 0)} ${unit}, vượt ngưỡng ${formatNumber(limit, 0)} ${unit}`];
    });
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
    return html`
      <header class="band">
        <span class="date">${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${date}</span>
        ${this._config?.title ? html`<span class="title">${this._config.title}</span>` : nothing}
        ${online === false
          ? html`<span class="state down">Mất lưới</span>`
          : online || voltage !== undefined
            ? html`<span class="state">${online ? 'Có lưới' : 'Lưới'}${volt}</span>`
            : nothing}
      </header>
    `;
  }

  private _renderSources(power: Power) {
    const rows = SOURCES.filter(({ key }) => this._config?.entities[key]);
    const soc = this._value('battery_soc');
    const threshold = this._config?.threshold ?? 10;
    return html`
      <div class="sources">
        ${rows.map(({ key, label, color }) => {
          const w = power[key];
          const direction = w === undefined || Math.abs(w) <= threshold ? '' : key === 'battery' ? (w > 0 ? ' · xả' : ' · sạc') : '';
          const gridNote = key === 'grid' && w !== undefined && Math.abs(w) > threshold ? (w > 0 ? ' · mua' : ' · phát') : '';
          return html`
            <button class="row" @click=${() => this._moreInfo(key)}>
              <span class="label"><i style="background:${color}"></i>${label}${key === 'battery' && soc !== undefined ? ` ${Math.round(soc)}%` : ''}${direction}${gridNote}</span>
              <b class="num">${w === undefined ? '—' : formatPower(w)}</b>
              ${key === 'battery' && soc !== undefined
                ? html`<span class="soc"><span style="width:${Math.min(100, Math.max(0, soc))}%"></span></span>`
                : nothing}
            </button>
          `;
        })}
      </div>
      <div class="links">
      ${svg`
        <svg viewBox="0 0 30 150" preserveAspectRatio="none" aria-hidden="true">
          ${rows.map(({ key, color }, i) => {
            const y = ((i + 0.5) / rows.length) * 150;
            const d = `M0 ${y}C16 ${y} 14 75 30 75`;
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

  private _renderHero(load: number | undefined, flows: ReturnType<typeof computeFlows>) {
    const hero = load === undefined ? undefined : heroPower(load);
    const total = flows.solarHome + flows.batteryHome + flows.gridHome;
    const parts = [
      { w: flows.solarHome, color: 'var(--sac-solar)' },
      { w: flows.batteryHome, color: 'var(--sac-battery)' },
      { w: flows.gridHome, color: 'var(--sac-grid)' },
    ].filter((p) => p.w > 0);
    const body = html`
      <b class="num">${hero?.value ?? '—'}</b>
      <span>${hero?.unit ?? 'W'} nhà đang dùng</span>
      ${total > 0 ? html`<span class="mix">${parts.map((p) => html`<i style="flex:${p.w} 1 0;background:${p.color}"></i>`)}</span>` : nothing}
    `;
    return this._config?.entities.load
      ? html`<button class="hero" @click=${() => this._moreInfo('load')}>${body}</button>`
      : html`<div class="hero">${body}</div>`;
  }

  private _renderReserve(runtime: number | undefined, online: boolean | undefined, selfUse: number | undefined) {
    const tomorrow = this._value('forecast_tomorrow');
    const items = [
      runtime !== undefined ? { label: online === false ? 'Pin còn' : 'Nếu mất điện', value: `~${formatNumber(runtime)}`, unit: 'giờ' } : undefined,
      selfUse !== undefined ? { label: 'Tự cấp', value: `${selfUse}%` } : undefined,
      tomorrow !== undefined ? { label: 'Ngày mai', value: `${Math.round(tomorrow)}`, unit: 'kWh' } : undefined,
    ].filter((item) => item !== undefined);
    if (!items.length) return nothing;
    return html`
      <dl class="reserve">
        ${items.map(
          (item) => html`<div><dt>${item.label}</dt><dd class="num">${item.value}${item.unit ? html` <small>${item.unit}</small>` : nothing}</dd></div>`,
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
    const kwh = (v: number | undefined) => (v === undefined ? undefined : `${formatNumber(v)} kWh`);
    const pvToday = this._value('pv_today');
    const forecast = this._value('forecast_today');
    const bought = this._value('grid_import_today');
    const sold = this._value('grid_export_today');
    const savings = this._value('savings_month');
    const delta = this._value('cell_delta');
    const temp = this._value('inverter_temperature');
    const freq = this._value('grid_frequency');
    const unit = (key: EntityKey) => this._entity(key)?.st.attributes.unit_of_measurement ?? '';
    const rows: Array<[string, string | undefined]> = [
      ['Solar hôm nay', pvToday === undefined ? undefined : forecast === undefined ? kwh(pvToday) : `${formatNumber(pvToday)} / ${formatNumber(forecast)} kWh`],
      ['Tiết kiệm tháng', savings === undefined ? undefined : `${formatNumber(savings, 0)} đ`],
      ['Tải hôm nay', kwh(this._value('load_today'))],
      ['Mua / phát', bought === undefined && sold === undefined ? undefined : `${formatNumber(bought ?? 0)} / ${formatNumber(sold ?? 0)} kWh`],
      ['Lệch cell', delta === undefined ? undefined : `${formatNumber(delta, 0)} ${unit('cell_delta')}`],
      ['Nhiệt biến tần', temp === undefined ? undefined : `${formatNumber(temp, 0)} ${unit('inverter_temperature') || '°C'}`],
      ['Tần số lưới', freq === undefined ? undefined : `${formatNumber(freq)} Hz`],
    ];
    const shown = rows.filter((r) => r[1] !== undefined);
    if (!shown.length) return nothing;
    return html`<dl class="fine">${shown.map(([k, v]) => html`<div><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>`;
  }

  /** `hass` đổi theo mọi entity trong nhà; chỉ vẽ lại khi entity của card đổi. */
  protected shouldUpdate(changed: PropertyValues): boolean {
    const old = changed.get('hass') as HomeAssistant | undefined;
    if (changed.size !== 1 || !old || !this._config) return true;
    if (old.themes?.darkMode !== this.hass?.themes?.darkMode) return true;
    return Object.values(this._config.entities).some((ref) => {
      const id = toEntityConfig(ref)?.entity;
      return id !== undefined && old.states[id] !== this.hass?.states[id];
    });
  }

  protected willUpdate(): void {
    const theme = this._config?.theme ?? 'auto';
    const dark = theme === 'auto' ? (this.hass?.themes?.darkMode ?? matchMedia('(prefers-color-scheme: dark)').matches) : theme === 'dark';
    this.dataset.mode = dark ? 'dark' : 'light';
  }

  protected render() {
    if (!this._config) return nothing;
    const now = this.now ?? new Date();
    const threshold = this._config.threshold ?? 10;
    const power: Power = {
      pv: this._power('pv'),
      battery: this._power('battery'),
      grid: this._power('grid'),
      load: this._power('load'),
    };
    const load = resolveLoad(power);
    const flows = computeFlows(power);
    const online = this._gridOnline();
    const soc = this._value('battery_soc');
    const capacity = this._config.battery_capacity;
    const runtime = soc !== undefined && capacity && load !== undefined ? hoursLeft(soc, capacity, this._config.battery_reserve ?? 0, load) : undefined;
    const fullIn = soc !== undefined && capacity ? hoursToFull(soc, capacity, Math.max(0, -(power.battery ?? 0))) : undefined;
    const bought = this._value('grid_import_today');
    const consumed = this._value('load_today');
    const selfUse = bought !== undefined && consumed ? Math.max(0, Math.round((1 - bought / consumed) * 100)) : undefined;
    const status = statusLine({ power, flows, threshold, gridOnline: online, runtime, fullIn });

    return html`
      <ha-card>
        <div class="page">
          ${this._renderBand(now, online)}
          ${this._alerts().map((text) => html`<p class="alert">${text}</p>`)}
          <section class="live">
            ${this._renderSources(power)} ${this._renderHero(load, flows)} ${this._renderReserve(runtime, online, selfUse)}
          </section>
          ${status ? html`<p class="say"><b>${status.lead}</b> ${status.rest ?? ''}</p>` : nothing}
          ${this._config.compact ? nothing : html`${this._renderHours(now)} ${this._renderFine()}`}
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
        color: var(--sac-band);
        font-weight: 700;
        border-radius: calc(var(--u) * 4);
        padding: 0 calc(var(--u) * 7);
      }
      .live {
        display: grid;
        grid-template-columns: calc(var(--u) * 112) minmax(calc(var(--u) * 16), 1fr) calc(var(--u) * 158) calc(var(--u) * 84);
        align-items: stretch;
        padding: calc(var(--u) * 12) calc(var(--u) * 14) calc(var(--u) * 4);
      }
      .sources {
        display: grid;
        grid-auto-rows: 1fr;
        min-width: 0;
      }
      .row {
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-width: 0;
        padding: calc(var(--u) * 3) 0;
      }
      .label,
      .reserve dt {
        font-size: max(11px, calc(var(--u) * 12));
        color: var(--sac-dim);
        white-space: nowrap;
      }
      .label i {
        display: inline-block;
        width: calc(var(--u) * 9);
        height: calc(var(--u) * 9);
        border-radius: calc(var(--u) * 2);
        margin-right: calc(var(--u) * 4);
      }
      .row .num,
      .reserve dd {
        font-size: calc(var(--u) * 23);
        line-height: 1.05;
        white-space: nowrap;
      }
      .soc {
        display: block;
        height: calc(var(--u) * 3);
        margin-top: calc(var(--u) * 3);
        width: 76%;
        background: var(--sac-border);
        border-radius: calc(var(--u) * 2);
        overflow: hidden;
      }
      .soc span {
        display: block;
        height: 100%;
        background: var(--sac-battery);
      }
      .links {
        position: relative;
      }
      .links svg {
        position: absolute;
        inset: 0;
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
      .hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 0;
        text-align: center;
        font-size: calc(var(--u) * 13);
        color: var(--sac-dim);
      }
      .hero .num {
        font-size: calc(var(--u) * 92);
        line-height: 1.08;
        letter-spacing: -0.02em;
        color: var(--sac-fg);
      }
      .mix {
        display: flex;
        gap: calc(var(--u) * 2);
        width: 84%;
        height: calc(var(--u) * 6);
        margin-top: calc(var(--u) * 5);
      }
      .mix i {
        min-width: calc(var(--u) * 3);
        border-radius: calc(var(--u) * 2);
      }
      dl,
      dd {
        margin: 0;
      }
      .reserve {
        display: grid;
        grid-auto-rows: 1fr;
        align-items: center;
        padding-left: calc(var(--u) * 4);
        min-width: 0;
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
        color: var(--sac-band);
        border-bottom: 1px solid var(--sac-band);
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
        overflow: hidden;
        padding: calc(var(--u) * 2) 0;
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
      .fine div:first-child {
        grid-column: 1 / -1;
      }
      .fine div {
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
      @media (hover: hover) {
        .row:hover .label,
        button.hero:hover span:not(.mix),
        .cell:hover .hour {
          color: var(--sac-fg);
        }
      }
      @container (max-width: 340px) {
        .live {
          grid-template-columns: calc(var(--u) * 112) minmax(calc(var(--u) * 6), 1fr) calc(var(--u) * 158);
        }
        .reserve {
          grid-column: 1 / -1;
          grid-auto-flow: column;
          grid-auto-columns: minmax(0, 1fr);
          padding: calc(var(--u) * 8) 0 0;
        }
      }
      @container (max-width: 340px) {
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
