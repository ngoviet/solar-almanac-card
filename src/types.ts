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
 * - load:    dương = đang tiêu thụ (bỏ trống thì tự tính pv + battery + grid)
 */
export interface SolarAlmanacCardConfig {
  type: string;
  title?: string;
  /** Công suất (W) dưới ngưỡng này coi như không có dòng chảy. */
  threshold?: number;
  /** `auto` theo chế độ sáng/tối của Home Assistant. */
  theme?: 'auto' | 'dark' | 'light';
  /** Ẩn dải giờ và dòng chữ nhỏ để card thấp hơn. */
  compact?: boolean;
  /** Dung lượng pin (kWh), dùng để tính thời gian còn chạy và thời gian đầy. */
  battery_capacity?: number;
  /** SOC (%) biến tần ngừng xả khi mất lưới. */
  battery_reserve?: number;
  /** Thuộc tính chứa dự báo theo giờ; bỏ trống thì dò các tên phổ biến. */
  forecast_attribute?: string;
  /** Vượt các ngưỡng này thì hiện cảnh báo bằng chữ dưới băng đỏ; `cell_delta_warn` tính bằng mV. */
  cell_delta_warn?: number;
  inverter_temperature_warn?: number;
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
  };
}

export type FlowKey = 'pv' | 'battery' | 'grid';
