# Solar Almanac

Card Lovelace cho Home Assistant, trình bày hệ điện mặt trời như **tờ lịch của hôm nay**: nhìn một lần biết nhà đang dùng bao nhiêu, điện từ đâu tới, mất điện thì pin chạy được bao lâu và giờ nào nên bật tải lớn.

Không gắn với hãng biến tần nào: chỉ cần sensor công suất `pv`, `battery`, `grid`; hệ không có pin hoặc không nối lưới thì khai thêm `load`. Phần còn lại là tuỳ chọn, thiếu entity nào phần tương ứng tự ẩn.

![Card Solar Almanac trên dashboard Home Assistant](docs/solar-almanac-card.png)

Lấy cảm hứng từ [sunsynk-power-flow-card](https://github.com/slipx06/sunsynk-power-flow-card) (MIT, © slipx06).

## Cài đặt

Qua HACS: **HACS → Custom repositories**, thêm `ngoviet/solar-almanac-card` với loại **Dashboard**, rồi cài **Solar Almanac**. Bản build `dist/solar-almanac-card.js` có sẵn trong repo nên không cần tự build.

Cài tay:

1. Chép `dist/solar-almanac-card.js` vào `config/www/solar-almanac-card.js` của HA
2. Thêm resource: **Settings → Dashboards → Resources** → `/local/solar-almanac-card.js` (JavaScript module)

## Cấu hình

Tối thiểu:

```yaml
type: custom:solar-almanac-card
entities:
  pv: sensor.pv_power
  battery: sensor.battery_power
  battery_soc: sensor.battery_soc
  grid: sensor.grid_power
```

Đầy đủ, ví dụ với LuxPower và Solcast:

```yaml
type: custom:solar-almanac-card
title: Luxpower 6.5kW
battery_capacity: 17.15   # kWh, để tính giờ còn chạy và giờ đầy
battery_reserve: 2        # %, mức biến tần ngừng xả khi mất lưới
entities:
  pv: sensor.luxpower_inverter_pv_pv_power
  battery: sensor.luxpower_inverter_battery_battery_flow
  battery_soc: sensor.luxpower_inverter_battery_battery_soc
  grid: sensor.luxpower_inverter_grid_grid_flow
  pv_today: sensor.luxpower_inverter_pv_pv_energy_today
  load_today: sensor.luxpower_inverter_home_consumption_today_calculated
  grid_import_today: sensor.luxpower_inverter_grid_energy_from_grid_today
  grid_export_today: sensor.luxpower_inverter_grid_energy_to_grid_today
  forecast_today: sensor.technology_solcast_pv_forecast_forecast_today
  forecast_tomorrow: sensor.technology_solcast_pv_forecast_forecast_tomorrow
  grid_voltage: sensor.luxpower_inverter_grid_grid_voltage
  grid_frequency: sensor.luxpower_inverter_grid_grid_frequency
  grid_connected: binary_sensor.luxpower_inverter_grid_grid_connected
  # Khu điều khiển, bỏ trống thì không hiện
  fan: light.luxpower_fan_controller_luxpower_fan_both_speed
  fan_rpm:
    - sensor.luxpower_fan_controller_fan_1_rpm
    - sensor.luxpower_fan_controller_fan_2_rpm
  fan_auto: input_boolean.luxpower_dual_fan_auto_speed
  fan_stall: binary_sensor.luxpower_fan_controller_luxpower_fan_controller_fan_stall_alarm
  eod: number.luxpower_inverter_battery_on_grid_cut_off_soc
```

### Tuỳ chọn

| Tuỳ chọn           | Mặc định | Ý nghĩa                                                        |
|--------------------|----------|----------------------------------------------------------------|
| `title`            | —        | Tên hiện trên băng đỏ, ẩn khi card quá hẹp                     |
| `theme`            | `auto`   | `auto` theo chế độ sáng/tối của HA, hoặc `light`, `dark`       |
| `compact`          | `false`  | Ẩn dải giờ và dòng chữ nhỏ; khu điều khiển vẫn hiện            |
| `threshold`        | `10`     | W, dưới mức này coi như không có dòng chảy                     |
| `battery_capacity` | —        | kWh, cần để hiện "Nếu mất điện" và "Đầy sau"                   |
| `battery_reserve`  | `0`      | %, phần pin không dùng khi tính thời gian còn chạy             |
| `forecast_attribute` | tự dò  | Tên thuộc tính dự báo; tự dò `detailedHourly`, `detailedForecast`, `watts` |
| `cell_delta_warn`  | —        | mV, vượt ngưỡng này hiện cảnh báo bằng chữ dưới băng đỏ        |
| `inverter_temperature_warn` | — | Như trên, cho nhiệt độ biến tần                               |
| `eod_levels`       | `[10, 20, 30]` | %, các mức bấm nhanh cho `eod`                           |

### Entity

| Entity                                                    | Dùng cho                                       |
|-----------------------------------------------------------|------------------------------------------------|
| `pv`, `battery`, `grid`                                   | Ba nguồn và đường hạt                          |
| `load`                                                    | Số to giữa card; bỏ trống thì tự tính pv + battery + grid, chỉ khi khai đủ cả ba. Hệ không có pin hoặc không khai `grid` (hệ 25.6V DC) phải khai `load`, nếu không thì mất số to, thời gian còn chạy và dòng "Pin còn" |
| `battery_soc`                                             | Phần trăm pin, thanh SOC                       |
| `pv_today`, `load_today`, `grid_import_today`, `grid_export_today` | Tổng ngày; `grid_import_today` và `load_today` tạo chỉ số Tự cấp |
| `forecast_today`, `forecast_tomorrow`                     | Giá trị kWh, cộng thuộc tính dự báo theo giờ để dựng dải giờ |
| `grid_connected`, `grid_voltage`                          | Trạng thái lưới trên băng đỏ, báo mất lưới     |
| `savings_month`, `cell_delta`, `inverter_temperature`, `grid_frequency` | Dòng chữ nhỏ cuối tờ             |
| `fan`, `fan_rpm`, `fan_auto`                              | Dòng quạt tản nhiệt: `fan` (light, fan hoặc switch) cho biết bật/tắt, `fan_rpm` một hoặc danh sách sensor vòng quay, hiện số lớn nhất; `fan_auto` (input_boolean hoặc switch) thành nút Tự động |
| `fan_stall`                                               | binary_sensor, `on` thì hiện cảnh báo quạt kẹt dưới băng đỏ |
| `eod`                                                     | Dòng EOD lưới: entity `number` (hoặc `input_number`) là SOC pin ngừng xả khi còn lưới, mỗi mức trong `eod_levels` là một nút |

### Khu điều khiển

Khai `fan`, `fan_rpm` hoặc `eod` thì cuối card có thêm khu điều khiển; không khai, hoặc entity không có trong HA, thì khu đó tự bỏ qua. Nút Tự động bật/tắt `fan_auto`. Nút mức EOD gọi `<domain>.set_value` và HA hỏi xác nhận trước khi ghi, vì giá trị này ghi thẳng vào biến tần; bấm mức đang chọn thì không làm gì. Bấm nhãn bên trái mở chi tiết entity.

Mỗi entity viết dạng chuỗi, hoặc dạng object khi cần đảo dấu:

```yaml
battery:
  entity: sensor.battery_power
  invert: true   # nếu biến tần báo dương = sạc
```

Quy ước dấu (sau `invert`):

| Entity  | Dương        | Âm        |
|---------|--------------|-----------|
| pv      | đang phát    | —         |
| battery | xả           | sạc       |
| grid    | mua điện     | bán điện  |
| load    | tiêu thụ     | —         |

Card tự quy đổi theo `unit_of_measurement`: công suất nhận `W`, `kW`; năng lượng nhận `Wh`, `kWh`, `MWh`; `cell_delta` nhận `mV`, `V`.

Nguồn đã khai mà không đọc được thì dòng của nó hiện `—`, thanh tỉ lệ và câu trạng thái ẩn; riêng lúc `grid_connected` báo mất lưới thì lưới được tính bằng 0. Không có `load` mà thiếu một trong ba nguồn thì không tính được tải: số to giữa card hiện `—`, thanh tỉ lệ và câu trạng thái ẩn. Hệ không có pin hoặc không nối lưới (không khai `grid`) luôn thiếu nguồn trong ba nguồn, nên phải khai `load` mới có số to, thời gian còn chạy và dòng "Pin còn" ở cột dự phòng.

### Dải giờ

"Giờ tốt dùng tải lớn" là chuỗi giờ liền nhau quanh giờ đỉnh, có dự báo từ 70% đỉnh trở lên. Khi khung giờ hôm nay đã qua, dải giờ chuyển sang ngày mai.

Thuộc tính dự báo có thể là mảng dòng (`period_start`, `datetime` hoặc `time` đi với `pv_estimate` tính bằng kW, hoặc `watts`, `power` tính bằng W) hoặc object `{thời điểm: W}`. Không có dự báo thì dải chỉ hiện sản lượng thực theo giờ, đọc từ lịch sử của `pv` và làm mới mỗi 5 phút.

## Phát triển

```bash
npm install
npm run dev        # mở dev/index.html với dữ liệu giả
npm run build      # typecheck + build ra dist/
npm run watch      # build lại mỗi khi sửa
```

- `src/solar-almanac-card.ts` — card chính (Lit)
- `src/flows.ts` — phân bổ công suất, định dạng số, câu trạng thái, khung giờ tốt
- `src/history.ts` — lịch sử trong ngày và dự báo theo giờ
- `src/theme.ts` — màu sáng/tối sinh bằng palette-axi
- `src/font.ts` — font số nhúng base64
- `src/types.ts` — kiểu config và `hass`
- `dev/` — trang thử với `hass` giả, có các tình huống sạc, xả, phát lưới, mất lưới, cảnh báo, quạt tắt, thiếu dữ liệu
- `PRODUCT.md`, `DESIGN.md` — định hướng sản phẩm và hệ thiết kế

## Giấy phép

MIT. Font số Barlow Condensed © The Barlow Project Authors, nhúng dưới SIL Open Font License 1.1, xem [licenses/Barlow-OFL.txt](licenses/Barlow-OFL.txt).
