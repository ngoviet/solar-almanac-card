// Kiểu tối giản cho đối tượng `hass` mà Home Assistant truyền vào card.
export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown> & { unit_of_measurement?: string; friendly_name?: string };
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  themes?: { darkMode?: boolean };
  callWS?: <T>(message: Record<string, unknown>) => Promise<T>;
}

/** Một entity có thể khai báo dạng chuỗi hoặc object có thêm tuỳ chọn. */
export interface FlowEntityConfig {
  entity: string;
  /** Đảo dấu giá trị (khi biến tần dùng quy ước dấu ngược). */
  invert?: boolean;
}

export type EntityRef = string | FlowEntityConfig;

/**
 * Quy ước dấu (sau khi áp dụng `invert`):
 * - pv:      dương = đang phát
 * - battery: dương = đang xả, âm = đang sạc
 * - grid:    dương = mua điện, âm = bán điện
 * - load:    dương = đang tiêu thụ (bỏ trống thì tự tính khi đủ pv, battery, grid)
 */
export interface SolarAlmanacCardConfig {
  type: string;
  title?: string;
  /** Công suất (W) dưới ngưỡng này coi như không có dòng chảy. */
  threshold?: number;
  /** `auto` theo chế độ sáng/tối của Home Assistant. */
  theme?: 'auto' | 'dark' | 'light';
  /** Màu băng đầu card; `neutral` để dành màu đỏ cho cảnh báo. */
  band?: 'red' | 'neutral';
  /** Ẩn dải giờ và dòng chữ nhỏ để card thấp hơn. */
  compact?: boolean;
  /**
   * `columns` (mặc định): ba số lớn ngang hàng và dải hạt.
   * `flow`: sơ đồ Solar trên, lưới trái, nhà phải, pin dưới, nối qua biến tần; dây dày theo công suất.
   */
  layout?: 'columns' | 'flow';
  /** Công suất (W) ứng với dây dày nhất ở `layout: flow`; mặc định 5000. */
  flow_max_power?: number;
  /** Từng MPPT / chuỗi PV, hiện thành các ô trên nút Solar ở `layout: flow`. */
  mppts?: MpptConfig[];
  /** Dung lượng pin (kWh), dùng để tính thời gian còn chạy và thời gian đầy. */
  battery_capacity?: number;
  /** SOC (%) biến tần ngừng xả khi mất lưới. */
  battery_reserve?: number;
  /** Thuộc tính chứa dự báo theo giờ; bỏ trống thì dò các tên phổ biến. */
  forecast_attribute?: string;
  /** Vượt các ngưỡng này thì hiện cảnh báo bằng chữ dưới băng đỏ; `cell_delta_warn` tính bằng mV. */
  cell_delta_warn?: number;
  inverter_temperature_warn?: number;
  /** Nhãn dòng `savings_month`, khi số tiết kiệm không tính theo tháng dương lịch. */
  savings_label?: string;
  /** Nhãn dòng sạc/xả theo kỳ (`battery_charge_period`, `battery_discharge_period`). */
  battery_period_label?: string;
  /** Các mức SOC (%) bấm nhanh cho `entities.eod`. */
  eod_levels?: number[];
  entities: {
    pv?: EntityRef;
    battery?: EntityRef;
    battery_soc?: EntityRef;
    grid?: EntityRef;
    load?: EntityRef;
    /** Năng lượng trong ngày (Wh, kWh hoặc MWh). */
    pv_today?: EntityRef;
    load_today?: EntityRef;
    grid_import_today?: EntityRef;
    grid_export_today?: EntityRef;
    /** Năng lượng sạc vào / xả ra khỏi pin trong ngày và trong kỳ (Wh, kWh hoặc MWh). */
    battery_charge_today?: EntityRef;
    battery_discharge_today?: EntityRef;
    battery_charge_period?: EntityRef;
    battery_discharge_period?: EntityRef;
    /** Dự báo kWh; thuộc tính `detailedHourly` của Solcast tạo ra dải giờ. */
    forecast_today?: EntityRef;
    forecast_tomorrow?: EntityRef;
    /** Tiền tiết kiệm tháng này (đồng). */
    savings_month?: EntityRef;
    grid_voltage?: EntityRef;
    grid_frequency?: EntityRef;
    /** binary_sensor: `on` là còn lưới. */
    grid_connected?: EntityRef;
    cell_delta?: EntityRef;
    inverter_temperature?: EntityRef;
    /** Quạt tản nhiệt (light, fan hoặc switch). */
    fan?: EntityRef;
    /** Một hoặc nhiều sensor vòng quay; hiện số lớn nhất. */
    fan_rpm?: EntityRef | EntityRef[];
    /** input_boolean hoặc switch bật chế độ quạt tự động. */
    fan_auto?: EntityRef;
    /** binary_sensor: `on` là quạt kẹt. */
    fan_stall?: EntityRef;
    /** number: SOC (%) pin ngừng xả khi còn lưới. */
    eod?: EntityRef;
  };
}

export type FlowKey = 'pv' | 'battery' | 'grid';

export interface MpptConfig {
  name?: string;
  /** Công suất (W hoặc kW). */
  power: EntityRef;
  /** Điện áp phía tấm pin (V). */
  voltage?: EntityRef;
  /** Dòng phía tấm pin (A). */
  current?: EntityRef;
  /** Năng lượng hôm nay (Wh, kWh hoặc MWh). */
  energy_today?: EntityRef;
}
