---
name: Solar Almanac
description: Card Lovelace trình bày năng lượng trong nhà như một tờ lịch bloc treo tường
colors:
  sac-band: "#c4302b"
  sac-band-dark: "#8f1f1b"
  sac-on-band: "#ffffff"
  sac-solar: "#ac7a00"
  sac-solar-dark: "#e7a500"
  sac-battery: "#009655"
  sac-battery-dark: "#00ca75"
  sac-grid: "#0085e3"
  sac-grid-dark: "#6fb7ff"
  sac-surface: "#fffaf9"
  sac-surface-dark: "#2c1412"
  sac-fg: "#443331"
  sac-fg-dark: "#f2e5e3"
  sac-dim: "#7d5a56"
  sac-dim-dark: "#d6aca7"
  sac-border: "#e5d3d1"
  sac-border-dark: "#4f2d2b"
typography:
  metric-hero:
    fontFamily: "'SAC Numerals', 'Arial Narrow', var(--ha-font-family-body, Roboto, sans-serif)"
    fontSize: "calc(var(--u) * 92)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  metric:
    fontFamily: "'SAC Numerals', 'Arial Narrow', var(--ha-font-family-body, Roboto, sans-serif)"
    fontSize: "calc(var(--u) * 23)"
    fontWeight: 700
    lineHeight: 1.05
  status:
    fontFamily: "var(--ha-font-family-body, Roboto, sans-serif)"
    fontSize: "calc(var(--u) * 14.5)"
    fontWeight: 400
    lineHeight: 1.4
  body:
    fontFamily: "var(--ha-font-family-body, Roboto, sans-serif)"
    fontSize: "calc(var(--u) * 14)"
    fontWeight: 400
    lineHeight: 1.4
  band:
    fontFamily: "var(--ha-font-family-body, Roboto, sans-serif)"
    fontSize: "calc(var(--u) * 14)"
    fontWeight: 500
    lineHeight: 1.4
  small:
    fontFamily: "var(--ha-font-family-body, Roboto, sans-serif)"
    fontSize: "calc(var(--u) * 12.5)"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "var(--ha-font-family-body, Roboto, sans-serif)"
    fontSize: "max(11px, calc(var(--u) * 12))"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  mark: "calc(var(--u) * 2)"
  tile: "calc(var(--u) * 3)"
  state: "calc(var(--u) * 4)"
spacing:
  unit: "clamp(0.92px, 0.2427cqi, 1.7px)"
  hair: "calc(var(--u) * 2)"
  tight: "calc(var(--u) * 3)"
  snug: "calc(var(--u) * 5)"
  row: "calc(var(--u) * 9)"
  block: "calc(var(--u) * 12)"
  gutter: "calc(var(--u) * 14)"
components:
  band:
    backgroundColor: "{colors.sac-band}"
    textColor: "{colors.sac-on-band}"
    typography: "{typography.band}"
    padding: "calc(var(--u) * 9) calc(var(--u) * 14)"
  band-state-down:
    backgroundColor: "{colors.sac-on-band}"
    textColor: "{colors.sac-band}"
    rounded: "{rounded.state}"
    padding: "0 calc(var(--u) * 7)"
  alert:
    backgroundColor: "{colors.sac-on-band}"
    textColor: "{colors.sac-band}"
    padding: "calc(var(--u) * 5) calc(var(--u) * 14)"
  source-row:
    textColor: "{colors.sac-fg}"
    typography: "{typography.metric}"
    padding: "calc(var(--u) * 3) 0"
  hero-number:
    textColor: "{colors.sac-fg}"
    typography: "{typography.metric-hero}"
  soc-bar:
    backgroundColor: "{colors.sac-border}"
    rounded: "{rounded.mark}"
    height: "calc(var(--u) * 3)"
    width: "76%"
  mix-bar:
    rounded: "{rounded.mark}"
    height: "calc(var(--u) * 6)"
    width: "84%"
  hour-tile:
    backgroundColor: "color-mix(in oklch, var(--sac-solar) var(--level), var(--sac-surface))"
    rounded: "{rounded.tile}"
    height: "calc(var(--u) * 40)"
  hour-actual:
    backgroundColor: "{colors.sac-solar}"
  window-chip:
    backgroundColor: "{colors.sac-fg}"
    textColor: "{colors.sac-surface}"
    typography: "{typography.label}"
    rounded: "{rounded.tile}"
    padding: "calc(var(--u) * 2) calc(var(--u) * 4)"
  fine-print:
    textColor: "{colors.sac-dim}"
    typography: "{typography.small}"
  control-option:
    textColor: "{colors.sac-fg}"
    rounded: "{rounded.tile}"
    height: "max(36px, calc(var(--u) * 32))"
    padding: "0 calc(var(--u) * 9)"
  control-option-on:
    backgroundColor: "{colors.sac-fg}"
    textColor: "{colors.sac-surface}"
---

# Design System: Solar Almanac

## Overview

**Creative North Star: "Tờ Lịch Bloc"**

Mỗi ngày là một tờ lịch treo tường: băng đỏ đầu tờ, một con số thật to cho lúc này, và dải giờ tốt để dùng tải lớn. Người xem liếc là biết nhà đang dùng bao nhiêu; đọc xuống thì biết điện từ đâu, nên chạy máy giặt lúc nào, rồi mới đến dòng chữ nhỏ cuối tờ.

Hệ này in trên giấy, không phải dựng trên bảng điều khiển. Nền là giấy tint đỏ của palette-axi, chữ là mực trung tính, số là khối đặc đậm khổ lớn. Mật độ cao nhưng phân tầng rõ: một số lớn, ba số vừa, phần còn lại là chữ nhỏ. Màu chỉ xuất hiện ở nơi có nghĩa, và mọi dấu trên dải giờ đều là số liệu thật, không có trang trí.

Card sống trong shadow DOM của dashboard Home Assistant, cạnh những card khác. Nó thừa kế font thân bài và chế độ sáng/tối của HA, chỉ mang theo ba thứ của riêng mình: bảng màu, bộ số nhúng và đơn vị `--u`. Hệ này từ chối sơ đồ năm vòng tròn nối về biến tần: nguồn đi vào con số, không đi vào một hình vẽ của hệ thống.

**Key Characteristics:**
- Một đơn vị `--u` chi phối mọi kích thước; card rộng ra thì chữ lớn theo để đọc từ xa.
- Băng đỏ đầu tờ là mảng màu đặc duy nhất của card.
- Số dùng Barlow Condensed Bold nhúng; chữ thường theo font của Home Assistant.
- Chỉ ba nguồn và băng đỏ mang màu; tải và chữ dùng mực trung tính.
- Cảnh báo luôn là chữ, không bao giờ chỉ là màu.

## Colors

Bảng màu sinh bằng palette-axi (`generate --seed 25 --mode both --roles solar=80,battery=155,grid=250`), neutral tint về hue đỏ, có đủ hai bộ sáng và tối; tên có hậu tố `-dark` là giá trị của cùng biến CSS khi `data-mode='dark'`.

### Primary
- **Đỏ Băng Lịch** (`sac-band`, #c4302b sáng / `sac-band-dark`, #8f1f1b tối): nền băng đầu tờ; cũng là màu chữ của trạng thái "Mất lưới" và dòng cảnh báo. Giá trị được chỉnh tay để chữ trắng đạt 4,5:1.
- **Trắng Trên Băng** (`sac-on-band`, #ffffff, chung hai chế độ): chữ trên băng; đảo vai thành nền khi cần báo động.

### Secondary
Ba màu nguồn nằm trên cùng một dải sáng, chỉ dùng cho dấu đồ hoạ: ô vuông nhãn, hạt, thanh tỉ lệ, thanh SOC, ô giờ.
- **Vàng Nắng** (`sac-solar`, #ac7a00 sáng / `sac-solar-dark`, #e7a500 tối): Solar, và toàn bộ dải giờ.
- **Xanh Lá Pin** (`sac-battery`, #009655 sáng / `sac-battery-dark`, #00ca75 tối): pin và thanh SOC.
- **Xanh Trời Lưới** (`sac-grid`, #0085e3 sáng / `sac-grid-dark`, #6fb7ff tối): lưới điện.

### Neutral
- **Giấy Hồng** (`sac-surface`, #fffaf9 sáng / `sac-surface-dark`, #2c1412 tối): nền tờ giấy. Bản tối là giấy nâu đỏ, không phải đen.
- **Mực Nâu** (`sac-fg`, #443331 sáng / `sac-fg-dark`, #f2e5e3 tối): mọi con số, câu trạng thái, nền nhãn khung giờ tốt, viền giờ hiện tại, viền focus.
- **Mực Nhạt** (`sac-dim`, #7d5a56 sáng / `sac-dim-dark`, #d6aca7 tối): nhãn, chú thích, chữ nhỏ cuối tờ. Bản sáng được chỉnh tay để đạt 4,5:1.
- **Viền Giấy** (`sac-border`, #e5d3d1 sáng / `sac-border-dark`, #4f2d2b tối): đường nền của hạt, rãnh thanh SOC, đoạn tải chưa rõ nguồn trên thanh tỉ lệ, đường kẻ trên chữ nhỏ.

### Named Rules
**Quy tắc Ba Nguồn.** Chỉ Solar, pin, lưới và băng đỏ mang màu. Tải không có màu riêng: thanh tỉ lệ dưới số lớn cho thấy tải đến từ đâu bằng chính màu của nguồn.

**Quy tắc Mực Một Hue.** Số và chữ thân bài luôn ở hai bậc mực trung tính, không bao giờ ở màu nguồn. Màu nguồn chế độ sáng chỉ đạt khoảng 3,7:1 trên giấy: đủ cho dấu đồ hoạ, không đủ cho chữ.

**Quy tắc palette-axi.** Màu mới phải sinh và kiểm tra bằng palette-axi, rồi thêm đủ cả hai chế độ vào `src/theme.ts`.

## Typography

**Display Font:** Barlow Condensed Bold (`SAC Numerals`, với Arial Narrow và font HA làm dự phòng)
**Body Font:** font thân bài của Home Assistant (`--ha-font-family-body`, với Roboto, sans-serif)

**Character:** Khối số hẹp, đặc, đọc như chữ in trên tờ lịch, đặt cạnh chữ thường trung tính để card vẫn thuộc về dashboard. Toàn card bật `tabular-nums`.

### Hierarchy
- **metric-hero** (700, 92u, 1.08, giãn chữ -0.02em): số công suất nhà đang dùng, mỗi card chỉ một lần.
- **metric** (700, 23u, 1.05): công suất ba nguồn và ba chỉ số dự phòng.
- **status** (400, 14.5u, 1.4): câu trạng thái; vế đầu đậm 600. Căn giữa, `text-wrap: balance`.
- **body** (400, 14u, 1.4): cỡ gốc của tờ giấy.
- **band** (500, 14u, 1.4): ngày trên băng; tiêu đề trên băng lùi về 400.
- **small** (400, 12.5u, 1.4): tiêu đề dải giờ và chữ nhỏ cuối tờ; giá trị trong chữ nhỏ dùng 500.
- **label** (400, sàn 11px, 12u, 1.4): nhãn nguồn và nhãn dự phòng; nhãn khung giờ tốt dùng cùng cỡ ở 600, line-height 1.25, rộng bằng khung và nhô đều hai bên khi khung ngắn hơn chữ, không cắt chữ; số giờ dưới ô dùng 11u với cùng sàn.

### Named Rules
**Quy tắc Bộ Số.** `SAC Numerals` là bộ con chỉ có chữ số và ký hiệu đơn vị. Chữ thường không bao giờ đi vào `.num`: phần đơn vị dạng chữ như "giờ", "kWh" quay về font thân bài (`small`, 12u, 500).

**Quy tắc Sàn 11px.** Chữ nhỏ dùng `max(11px, …)` để không tụt dưới ngưỡng đọc được khi card hẹp.

## Layout

Mọi kích thước tính theo `--u` (`spacing.unit`), đặt trên `.page` để `cqi` đo theo bề rộng `ha-card` (`container-type: inline-size`). Mốc tham chiếu: card 412px thì 1u bằng 1px. `--u` kẹp từ 0.92px (card khoảng 380px) đến 1.7px (card khoảng 700px). Co giãn chỉ theo chiều ngang; chiều cao do nội dung quyết định.

Từ trên xuống: băng đỏ, các dòng cảnh báo nếu có, vùng sống, câu trạng thái, dải giờ, chữ nhỏ, khu điều khiển. Lề hai bên luôn là 14u (`gutter`). Vùng sống là lưới bốn cột: nguồn 112u, đường nối co giãn (tối thiểu 16u), số lớn 158u, dự phòng 84u (không có mục dự phòng thì cột này bằng 0). Khi card rộng hơn mốc kẹp của `--u`, phần dư đổ hết vào cột đường nối.

Từ 367px trở xuống, khi lưới bốn cột không còn đủ 398u kể cả lề: cột dự phòng xuống thành hàng ngang dưới vùng sống, ẩn tiêu đề trên băng, ẩn nhãn giờ chẵn theo vị trí, chữ nhỏ về một cột. Chế độ `compact` bỏ dải giờ và chữ nhỏ, giữ khu điều khiển. Thiếu dữ liệu thì khối đó biến mất; bố cục khép lại, không để ô rỗng.

## Elevation & Depth

Tờ giấy phẳng. Card không tự thêm bóng nào; chiều sâu đến từ mảng màu đặc của băng đỏ và từ tương phản mực trên giấy. Khung ngoài (bo góc, viền, bóng nếu có) thuộc theme của `ha-card`; card chỉ đặt `overflow: hidden` để băng đỏ theo đúng góc bo đó. Các đường kẻ 1px là thứ duy nhất phân vùng.

### Named Rules
**Quy tắc Giấy Phẳng.** Không có bóng trong tờ giấy. Trạng thái được báo bằng đảo màu và viền mực, không bằng nâng khối.

## Shapes

Góc gần như vuông, như mép giấy bị cắt. Ba bậc bo theo `--u`: `mark` 2u cho dấu nhỏ (ô nhãn, thanh SOC, thanh tỉ lệ), `tile` 3u cho ô giờ và nhãn khung giờ tốt, `state` 4u cho nhãn "Mất lưới". Hình cong duy nhất là đường hạt đi vào số lớn. Hạt là chấm tròn tạo bởi nét đứt có đầu tròn.

## Components

Thẳng thắn và in sẵn: mỗi thành phần là một dấu trên tờ giấy, bấm được thì mở chi tiết của entity qua `hass-more-info`. Ngoại lệ duy nhất là các nút trong khu điều khiển: chúng ghi giá trị, giao cho HA qua sự kiện `hass-action`.

### Băng đầu tờ
- **Cấu trúc:** ngày bên trái, tiêu đề tuỳ chọn bị cắt bằng dấu ba chấm, trạng thái lưới đẩy sát phải, căn theo đường chân chữ.
- **Mất lưới:** nhãn đảo màu, trắng nền đỏ chữ, đậm 700, bo `state`. Chữ "Mất lưới" tự nói trạng thái.

### Dòng cảnh báo
- **Style:** dải trắng chữ đỏ đậm 600 cỡ 13.5u nằm ngay dưới băng, kẻ đỏ 1px phía dưới. Giữ nền trắng ở cả hai chế độ để nổi lên khỏi giấy.
- **Nội dung:** luôn là một câu có giá trị và ngưỡng, ví dụ "Nhiệt biến tần 62 °C, vượt ngưỡng 60 °C". Báo động dạng bật/tắt không có số thì câu nói rõ việc cần làm: "Quạt tản nhiệt bị kẹt, cần kiểm tra".

### Dòng nguồn
- **Cấu trúc:** nhãn `label` có ô vuông màu 9u phía trước, kèm chiều và SOC bằng chữ ("xả", "sạc", "mua", "phát"), bên dưới là số `metric`.
- **SOC:** số phần trăm trong nhãn pin dùng bộ số `SAC Numerals` 17u, màu Mực Nâu, vì đây là thông số quan trọng nhất của dòng pin; phần nhãn còn lại giữ `label`.
- **Thanh SOC:** chỉ ở dòng pin, cao 3u, rộng 76%, lõi màu pin trên rãnh Viền Giấy.
- **Hover:** nhãn chuyển từ Mực Nhạt sang Mực Nâu, chỉ trên thiết bị có hover.

### Đường hạt
- **Style:** đường nền 1px Viền Giấy, hạt 3.5px đầu tròn màu nguồn với nét đứt `0.1 14.9`, cả hai `non-scaling-stroke`.
- **Chuyển động:** Web Animations ngoài vòng render, tốc độ theo log công suất (0.4 đến 2.5 giây mỗi chu kỳ), đảo chiều khi giá trị âm; dưới `threshold` thì hạt ẩn.
- **Giảm chuyển động:** với `prefers-reduced-motion` hạt đứng yên; chiều dòng vẫn được nói bằng chữ ở nhãn nguồn.

### Số lớn
- **Style:** `metric-hero` màu Mực Nâu, dưới là đơn vị kèm "nhà đang dùng" màu Mực Nhạt.
- **Thanh tỉ lệ:** cao 6u, rộng 84%, chia theo phần công suất mỗi nguồn cấp cho nhà, phần tải chưa rõ nguồn là đoạn trung tính `--sac-border`, cách nhau 2u, mỗi đoạn tối thiểu 3u.

### Cột dự phòng
- **Style:** danh sách định nghĩa ba dòng chia đều chiều cao: nhãn `label`, giá trị `metric`, đơn vị chữ `small` về font thân bài.
- **Nội dung:** thời gian chạy khi mất điện, tỉ lệ tự cấp, sản lượng dự báo ngày mai; thiếu dòng nào thì ẩn dòng đó.

### Dải giờ (thành phần đặc trưng)
- **Ô giờ:** cao 40u, bo `tile`, cách nhau 2u. Nền trộn Vàng Nắng vào giấy theo dự báo (6% đến 76%), cột đặc Vàng Nắng từ đáy lên là sản lượng thực.
- **Khung giờ tốt:** nhãn nền Mực Nâu chữ giấy, nằm trên đúng các cột giờ của khung, ghi "11–14h". Khung là dải liền nhau quanh đỉnh dự báo, từ 70% đỉnh trở lên.
- **Giờ hiện tại:** viền mực 2u quanh ô, cách ô 1u.
- **Tương tác:** hover, chạm hoặc focus một ô thì dòng đầu dải đổi từ chú giải sang số liệu của giờ đó, đậm 600 màu Mực Nâu.

### Chữ nhỏ cuối tờ
- **Style:** lưới hai cột phía dưới đường kẻ 1px, dòng đầu trải hết chiều rộng; nhãn Mực Nhạt bên trái, giá trị Mực Nâu 500 bên phải.

### Khu điều khiển
- **Cấu trúc:** nằm sau chữ nhỏ, kẻ 1px Viền Giấy phía trên, cỡ `small`. Mỗi dòng một việc: nhãn Mực Nhạt kèm giá trị Mực Nâu 500 bên trái (bấm mở chi tiết), nút bên phải. Dòng quạt: số vòng/phút cao nhất trong các sensor, `Tắt` khi quạt tắt, nút `Tự động`. Dòng EOD lưới: một nút cho mỗi mức trong `eod_levels`; giá trị hiện tại không trùng mức nào thì hiện số cạnh nhãn.
- **Nút:** viền 1px Viền Giấy, bo `tile`, chữ Mực Nâu 500, cao tối thiểu 36px để bấm bằng ngón tay. Đang bật hoặc đang chọn thì đảo mực như nhãn khung giờ tốt: nền Mực Nâu, chữ giấy, 600. Không glow, không màu nguồn. Chưa đọc được trạng thái thì nút khoá, chữ Mực Nhạt.
- **Ghi:** nút phát `hass-action`; mức EOD kèm `confirmation` để HA hỏi lại trước khi ghi vào biến tần. Bấm mức đang chọn thì không làm gì.
- **Tự bỏ qua:** không khai entity, hoặc entity không có trong HA, thì dòng đó không vẽ; không còn dòng nào thì cả khu biến mất. Không lặp nhiệt độ biến tần vì chữ nhỏ đã có; quạt kẹt lên dòng cảnh báo.

### Focus
- **Style:** mọi nút dùng viền mực 2u, cách 1u, chỉ khi `:focus-visible`.

## Do's and Don'ts

### Do:
- **Do** tính mọi cỡ chữ, khoảng cách và bo góc theo `calc(var(--u) * n)`; px thẳng chỉ dành cho đường kẻ 1px, nét hạt 3.5px, sàn chữ 11px và sàn bấm 36px.
- **Do** đặt `--u` bên trong container (`.page`), không đặt trên `:host` hay `ha-card`, vì `cqi` phải đo được `ha-card`.
- **Do** cài `@font-face` vào `document`, vì khai báo trong shadow DOM không có tác dụng.
- **Do** để cảnh báo là chữ có giá trị và ngưỡng: "Mất lưới" trên băng, câu đầy đủ ở dòng cảnh báo.
- **Do** chọn màu qua các biến `--sac-*` để hai chế độ sáng tối đổi cùng lúc.
- **Do** để mỗi dấu trên dải giờ phản ánh số liệu thật.
- **Do** bọc mọi hiệu ứng hover trong `@media (hover: hover)`.

### Don't:
- **Don't** cho tải một màu riêng, và **don't** thêm màu thứ năm nếu nó không phải một nguồn điện.
- **Don't** dùng màu nguồn cho chữ hay số.
- **Don't** vẽ sơ đồ năm vòng tròn nối về biến tần.
- **Don't** thêm con số thứ hai cỡ `metric-hero`.
- **Don't** thêm bóng vào bên trong tờ giấy.
- **Don't** đưa chữ thường vào `.num`.
- **Don't** hiện số giả khi thiếu dữ liệu: ẩn khối đó, hoặc dùng dấu gạch khi nguồn đã cấu hình mà chưa có giá trị.
