// Đọc sản lượng trong ngày và dự báo theo giờ để dựng dải giờ.
import type { HomeAssistant } from './types';

/** Một điểm của `history/history_during_period` khi minimal_response; `lu` tính bằng giây. */
interface HistoryPoint {
  s?: unknown;
  lu?: unknown;
}

export type HistoryResponse = Record<string, HistoryPoint[]>;

export function startOfDay(now: Date): number {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
}

export async function fetchToday(hass: HomeAssistant, entityId: string, now: Date): Promise<HistoryPoint[]> {
  if (!hass.callWS) throw new Error('hass.callWS không khả dụng');
  const res = await hass.callWS<HistoryResponse>({
    type: 'history/history_during_period',
    start_time: new Date(startOfDay(now)).toISOString(),
    end_time: now.toISOString(),
    entity_ids: [entityId],
    minimal_response: true,
    no_attributes: true,
  });
  return res[entityId] ?? [];
}

/**
 * Trung bình công suất theo giờ, đến giờ hiện tại.
 * Sensor chỉ ghi khi đổi giá trị, nên giờ không có mẫu giữ giá trị giờ trước.
 */
export function toHourly(points: HistoryPoint[], now: Date, scale: number): Map<number, number> {
  const dayStart = startOfDay(now);
  const sum = new Array<number>(24).fill(0);
  const count = new Array<number>(24).fill(0);
  for (const p of points) {
    const value = typeof p.s === 'string' ? parseFloat(p.s) : NaN;
    if (Number.isNaN(value) || typeof p.lu !== 'number') continue;
    const hour = Math.floor((p.lu * 1000 - dayStart) / 3_600_000);
    if (hour < 0 || hour > 23) continue;
    sum[hour] += value * scale;
    count[hour] += 1;
  }
  const out = new Map<number, number>();
  let held = 0;
  for (let hour = 0; hour <= now.getHours(); hour++) {
    if (count[hour]) held = sum[hour] / count[hour];
    out.set(hour, held);
  }
  return out;
}

/** Tên thuộc tính dự báo của Solcast và Open-Meteo Solar Forecast. */
export const FORECAST_ATTRIBUTES = ['detailedHourly', 'detailedForecast', 'watts'];

type ForecastRow = Record<string, unknown>;

/** Mỗi dòng là `[thời điểm, W]`; Solcast báo kW trong `pv_estimate`, các nguồn khác báo W. */
function forecastRows(raw: unknown): Array<[unknown, number]> {
  if (Array.isArray(raw)) {
    return (raw as ForecastRow[]).map((row) => {
      const at = row.period_start ?? row.datetime ?? row.time;
      return [at, row.pv_estimate !== undefined ? Number(row.pv_estimate) * 1000 : Number(row.watts ?? row.power)];
    });
  }
  if (raw && typeof raw === 'object') return Object.entries(raw).map(([at, w]) => [at, Number(w)]);
  return [];
}

/**
 * Trung bình theo giờ của ngày `day`, vì có nguồn báo mỗi 30 hoặc 15 phút
 * và có nguồn gộp nhiều ngày vào một thuộc tính.
 */
export function parseForecast(raw: unknown, day: Date): Map<number, number> {
  const sum = new Map<number, number>();
  const count = new Map<number, number>();
  for (const [when, w] of forecastRows(raw)) {
    const at = new Date(when as string | number | Date);
    if (Number.isNaN(at.getTime()) || Number.isNaN(w) || startOfDay(at) !== startOfDay(day)) continue;
    const hour = at.getHours();
    sum.set(hour, (sum.get(hour) ?? 0) + w);
    count.set(hour, (count.get(hour) ?? 0) + 1);
  }
  return new Map([...sum].map(([hour, w]) => [hour, w / count.get(hour)!]));
}
