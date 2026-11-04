// Phần tính toán thuần: phân bổ công suất, định dạng số và câu trạng thái.

export interface Power {
  pv?: number;
  battery?: number;
  grid?: number;
  load?: number;
}

/** Công suất (W) trên từng cặp nguồn - đích. */
export interface Flows {
  solarHome: number;
  batteryHome: number;
  gridHome: number;
  solarBattery: number;
  solarGrid: number;
  gridBattery: number;
}

/** Tải tính từ cân bằng công suất khi không có entity riêng. */
export function resolveLoad(p: Power): number | undefined {
  if (p.load !== undefined) return p.load;
  if (p.pv === undefined && p.battery === undefined && p.grid === undefined) return undefined;
  return Math.max(0, (p.pv ?? 0) + (p.battery ?? 0) + (p.grid ?? 0));
}

/** Solar cấp cho nhà trước, phần dư sạc pin, sau cùng mới phát lên lưới. */
export function computeFlows(p: Power): Flows {
  const pv = Math.max(0, p.pv ?? 0);
  const load = Math.max(0, resolveLoad(p) ?? 0);
  const discharge = Math.max(0, p.battery ?? 0);
  const charge = Math.max(0, -(p.battery ?? 0));
  const buy = Math.max(0, p.grid ?? 0);
  const sell = Math.max(0, -(p.grid ?? 0));

  const solarHome = Math.min(pv, load);
  const batteryHome = Math.min(discharge, load - solarHome);
  const gridHome = Math.min(buy, Math.max(0, load - solarHome - batteryHome));
  const surplus = pv - solarHome;
  const solarBattery = Math.min(surplus, charge);
  const solarGrid = Math.min(surplus - solarBattery, sell);
  const gridBattery = Math.min(Math.max(0, charge - solarBattery), Math.max(0, buy - gridHome));

  return { solarHome, batteryHome, gridHome, solarBattery, solarGrid, gridBattery };
}

const VI = 'vi-VN';

export function formatNumber(v: number, digits = 1): string {
  return v.toLocaleString(VI, { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatPower(w: number): string {
  const abs = Math.abs(w);
  return abs >= 1000 ? `${formatNumber(abs / 1000, 2)}\u00a0kW` : `${Math.round(abs)}\u00a0W`;
}

/** Con số lớn giữa card: dưới 1 kW để W, trên 10 kW bớt một số lẻ. */
export function heroPower(w: number): { value: string; unit: string } {
  const abs = Math.abs(w);
  if (abs < 1000) return { value: String(Math.round(abs)), unit: 'W' };
  return { value: formatNumber(abs / 1000, abs >= 10000 ? 1 : 2), unit: 'kW' };
}

/** Công suất càng lớn, hạt chạy càng nhanh. */
export function flowDuration(w: number): number {
  const d = 2.5 - Math.log10(Math.abs(w) + 1) * 0.5;
  return Math.max(0.4, Math.min(2.5, d));
}

/** Số giờ pin còn chạy nếu mất lưới, với mức tải hiện tại. */
export function hoursLeft(socPct: number, capacityKwh: number, reservePct: number, loadW: number): number | undefined {
  if (loadW < 50) return undefined;
  return ((capacityKwh * Math.max(0, socPct - reservePct)) / 100) / (loadW / 1000);
}

export function hoursToFull(socPct: number, capacityKwh: number, chargeW: number): number | undefined {
  if (chargeW < 50 || socPct >= 100) return undefined;
  return ((capacityKwh * (100 - socPct)) / 100) / (chargeW / 1000);
}

/** Khung giờ tốt: dải liền nhau quanh giờ đỉnh, dự báo từ 70% đỉnh trở lên. */
export function bestWindow(forecast: Map<number, number>): { start: number; end: number } | undefined {
  let peakHour = -1;
  let peak = 0;
  for (const [hour, w] of forecast) {
    if (w > peak) {
      peak = w;
      peakHour = hour;
    }
  }
  if (peakHour < 0) return undefined;
  const good = (h: number) => (forecast.get(h) ?? 0) >= peak * 0.7;
  let start = peakHour;
  let end = peakHour;
  while (good(start - 1)) start--;
  while (good(end + 1)) end++;
  return { start, end: end + 1 };
}

export interface StatusInput {
  power: Power;
  flows: Flows;
  threshold: number;
  gridOnline?: boolean;
  runtime?: number;
  fullIn?: number;
}

export interface Status {
  lead: string;
  rest?: string;
}

/** Một câu trả lời "lúc này điện nhà đang đến từ đâu", tính bằng luật. */
export function statusLine({ power, flows, threshold, gridOnline, runtime, fullIn }: StatusInput): Status | undefined {
  const load = resolveLoad(power);
  if (load === undefined) return undefined;
  const share = (w: number) => Math.round((w / Math.max(load, 1)) * 100);

  if (gridOnline === false) {
    const rest = runtime !== undefined ? `pin còn chạy khoảng ${formatNumber(runtime)} giờ.` : `nhà đang dùng ${formatPower(load)}.`;
    return { lead: 'Đang mất lưới,', rest };
  }
  if (flows.solarGrid > threshold) {
    return { lead: 'Dư điện:', rest: `đang phát ${formatPower(flows.solarGrid)} lên lưới.` };
  }
  if (flows.solarBattery > threshold) {
    const note = fullIn !== undefined ? ` Đầy sau khoảng ${formatNumber(fullIn)} giờ.` : '';
    return { lead: 'Nắng dư,', rest: `đang sạc pin ${formatPower(power.battery ?? 0)}.${note}` };
  }
  if (flows.gridBattery > threshold) {
    return { lead: 'Lưới đang sạc pin', rest: `${formatPower(flows.gridBattery)}.` };
  }
  const solar = flows.solarHome > threshold;
  const battery = flows.batteryHome > threshold;
  const grid = flows.gridHome > threshold;
  if (solar && (battery || grid)) {
    const backup = [battery && `pin bù ${formatPower(flows.batteryHome)}`, grid && `lưới bù ${formatPower(flows.gridHome)}`].filter(Boolean);
    return { lead: `Solar cấp ${share(flows.solarHome)}% tải,`, rest: `${backup.join(', ')}.` };
  }
  if (battery && grid) {
    return { lead: `Pin đang gánh ${share(flows.batteryHome)}% tải,`, rest: `lưới bù ${formatPower(flows.gridHome)}.` };
  }
  const covers = (w: number) => load - w <= threshold;
  if (battery) return { lead: covers(flows.batteryHome) ? 'Pin đang gánh cả nhà.' : `Pin đang gánh ${share(flows.batteryHome)}% tải.` };
  if (grid) return { lead: covers(flows.gridHome) ? 'Nhà đang dùng điện lưới.' : `Lưới cấp ${share(flows.gridHome)}% tải.` };
  if (solar) return { lead: covers(flows.solarHome) ? 'Solar đủ cho cả nhà.' : `Solar cấp ${share(flows.solarHome)}% tải.` };
  return load > threshold ? undefined : { lead: 'Không có dòng công suất đáng kể.' };
}
