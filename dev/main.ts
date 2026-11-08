// Trang dev: dựng card với `hass` giả, dùng số thật của một hệ Luxpower ngày 04/11/2026.
import '../src/solar-almanac-card';
import type { HassEntity, HomeAssistant } from '../src/types';

// Thay cho ha-card của Home Assistant: khối có bo góc, nền do card tự đặt.
customElements.define(
  'ha-card',
  class extends HTMLElement {
    connectedCallback() {
      this.attachShadow({ mode: 'open' }).innerHTML = '<style>:host{display:block;border-radius:12px}</style><slot></slot>';
    }
  },
);

const PV_BY_HALF_HOUR = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 46, 183, 1207, 2243, 3220, 2689, 2579, 5342, 5640, 6139, 5574, 2948, 4093, 5191, 3085, 1615, 1192,
  1011, 1739, 890, 1304, 343, 150, 67, 51,
];
const FORECAST_TODAY = [0, 0, 0, 0, 0, 0, 0.24, 1.84, 3.79, 5.16, 6.38, 6.65, 5.13, 4.23, 5.02, 3.19, 0.75, 0.01];
const FORECAST_TOMORROW = FORECAST_TODAY.map((v) => v * 0.71);

interface Scenario {
  label: string;
  hour: number;
  pv: number;
  battery: number;
  grid: number;
  soc: number;
  gridOnline?: boolean;
  sparse?: boolean;
  temp?: number;
  stall?: boolean;
  fanOff?: boolean;
  pvToday: number;
  loadToday: number;
}

const SCENARIOS: Scenario[] = [
  { label: '19:08 xả', hour: 19.13, pv: 0, battery: 1627, grid: 371, soc: 80, pvToday: 29.4, loadToday: 21 },
  { label: '10:00 sạc', hour: 10, pv: 6139, battery: -4590, grid: 6, soc: 62, pvToday: 11.6, loadToday: 12.2 },
  { label: 'Phát lưới', hour: 12.5, pv: 6400, battery: 0, grid: -3200, soc: 100, pvToday: 20.1, loadToday: 14 },
  { label: 'Mất lưới', hour: 21, pv: 0, battery: 2400, grid: 0, soc: 42, gridOnline: false, pvToday: 29.4, loadToday: 24 },
  { label: 'Cảnh báo', hour: 14, pv: 3100, battery: -800, grid: 0, soc: 96, temp: 78, stall: true, pvToday: 24.5, loadToday: 16 },
  { label: 'Quạt tắt', hour: 6, pv: 120, battery: 300, grid: 0, soc: 48, fanOff: true, pvToday: 0.1, loadToday: 8 },
  { label: 'Thiếu dữ liệu', hour: 15, pv: 1500, battery: 0, grid: 300, soc: 55, sparse: true, pvToday: 0, loadToday: 0 },
];

const card = document.createElement('solar-almanac-card');
card.setConfig({
  type: 'custom:solar-almanac-card',
  title: 'Luxpower 6.5kW',
  battery_capacity: 17.15,
  battery_reserve: 2,
  inverter_temperature_warn: 70,
  entities: {
    pv: 'sensor.pv_power',
    battery: 'sensor.battery_power',
    battery_soc: 'sensor.battery_soc',
    grid: 'sensor.grid_power',
    pv_today: 'sensor.pv_today',
    load_today: 'sensor.load_today',
    grid_import_today: 'sensor.grid_import_today',
    grid_export_today: 'sensor.grid_export_today',
    battery_charge_today: 'sensor.battery_charge_today',
    battery_discharge_today: 'sensor.battery_discharge_today',
    battery_charge_period: 'sensor.battery_charge_period',
    battery_discharge_period: 'sensor.battery_discharge_period',
    forecast_today: 'sensor.forecast_today',
    forecast_tomorrow: 'sensor.forecast_tomorrow',
    savings_month: 'sensor.savings_month',
    grid_voltage: 'sensor.grid_voltage',
    grid_frequency: 'sensor.grid_frequency',
    grid_connected: 'binary_sensor.grid_connected',
    cell_delta: 'sensor.cell_delta',
    inverter_temperature: 'sensor.inverter_temperature',
    fan: 'light.fan',
    fan_rpm: ['sensor.fan_1_rpm', 'sensor.fan_2_rpm', 'sensor.fan_3_rpm'],
    fan_auto: 'input_boolean.fan_auto',
    fan_stall: 'binary_sensor.fan_stall',
    eod: 'number.eod',
  },
});
document.getElementById('wrap')!.appendChild(card);

// Thay HA xử lý nút: trên dev bấm là đổi ngay, không có hộp xác nhận.
let eod = 30;
let fanAuto = true;
card.addEventListener('hass-action', (e) => {
  const action = (e as CustomEvent).detail.config.tap_action;
  console.info('hass-action', action);
  if (action.perform_action) eod = action.data.value;
  else fanAuto = !fanAuto;
  apply(scenario, dark);
});

function dateAt(hour: number): Date {
  const d = new Date(2026, 10, 4);
  d.setMinutes(Math.round(hour * 60));
  return d;
}

const entity = (state: number | string, unit?: string, attributes: Record<string, unknown> = {}): HassEntity => ({
  entity_id: '',
  state: String(state),
  attributes: { unit_of_measurement: unit, ...attributes },
});

const detailed = (values: number[], dayOffset: number) =>
  values.map((pv_estimate, i) => {
    const period_start = new Date(2026, 10, 4 + dayOffset, i).toISOString();
    return { period_start, pv_estimate };
  });

function apply(s: Scenario, dark: boolean) {
  const states: Record<string, HassEntity> = {
    'sensor.pv_power': entity(s.pv, 'W'),
    'sensor.battery_power': entity(s.battery, 'W'),
    'sensor.battery_soc': entity(s.soc, '%'),
    'sensor.grid_power': entity(s.grid, 'W'),
  };
  if (!s.sparse) {
    Object.assign(states, {
      'sensor.pv_today': entity(s.pvToday, 'kWh'),
      'sensor.load_today': entity(s.loadToday, 'kWh'),
      'sensor.grid_import_today': entity(0.5, 'kWh'),
      'sensor.grid_export_today': entity(0, 'kWh'),
      'sensor.battery_charge_today': entity(6.3, 'kWh'),
      'sensor.battery_discharge_today': entity(5.7, 'kWh'),
      'sensor.battery_charge_period': entity(156.6, 'kWh'),
      'sensor.battery_discharge_period': entity(166.9, 'kWh'),
      'sensor.forecast_today': entity(42.39, 'kWh', { detailedHourly: detailed(FORECAST_TODAY, 0) }),
      'sensor.forecast_tomorrow': entity(30.19, 'kWh', { detailedHourly: detailed(FORECAST_TOMORROW, 1) }),
      'sensor.savings_month': entity(503477, 'VND'),
      'sensor.grid_voltage': entity(s.gridOnline === false ? 0 : 219.1, 'V'),
      'sensor.grid_frequency': entity(50.3, 'Hz'),
      'binary_sensor.grid_connected': entity(s.gridOnline === false ? 'off' : 'on'),
      'sensor.cell_delta': entity(4, 'mV'),
      'sensor.inverter_temperature': entity(s.temp ?? 47, '°C'),
      'light.fan': entity(s.fanOff ? 'off' : 'on'),
      'sensor.fan_1_rpm': entity(s.fanOff ? 0 : 2628, 'rpm'),
      'sensor.fan_2_rpm': entity(s.fanOff ? 0 : 2670, 'rpm'),
      'sensor.fan_3_rpm': entity(0, 'rpm'),
      'input_boolean.fan_auto': entity(fanAuto ? 'on' : 'off'),
      'binary_sensor.fan_stall': entity(s.stall ? 'on' : 'off'),
      'number.eod': entity(eod, '%'),
    });
  }
  const hass: HomeAssistant = {
    states,
    themes: { darkMode: dark },
    callWS: async <T,>() => {
      const start = new Date(2026, 10, 4).getTime() / 1000;
      const points = PV_BY_HALF_HOUR.map((w, i) => ({ s: String(w), lu: start + i * 1800 + 60 }));
      return { 'sensor.pv_power': points } as T;
    },
  };
  card.now = dateAt(s.hour);
  card.hass = hass;
}

let scenario = SCENARIOS[0];
let dark = false;
const bar = document.getElementById('bar')!;
for (const s of SCENARIOS) {
  const b = document.createElement('button');
  b.textContent = s.label;
  b.onclick = () => {
    scenario = s;
    (card as unknown as { _lastFetch: number })._lastFetch = 0;
    apply(scenario, dark);
  };
  bar.appendChild(b);
}
const toggle = document.createElement('button');
toggle.textContent = 'Sáng / tối';
toggle.onclick = () => {
  dark = !dark;
  document.body.dataset.dark = String(dark);
  apply(scenario, dark);
};
bar.appendChild(toggle);
apply(scenario, dark);
