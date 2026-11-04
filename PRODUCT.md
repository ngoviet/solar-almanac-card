# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: chủ nhà có hệ điện mặt trời chạy Home Assistant, với bất kỳ hãng biến tần nào. Card được công bố công khai; chủ dự án dùng nó cho hệ Luxpower 6.5 kW của chính mình.

Họ mở card trên ba nơi: điện thoại (xem nhanh vài giây), tablet treo tường (nhìn từ xa, bật lâu) và máy tính (đọc chi tiết).

## Product Purpose

Card Lovelace cho thấy năng lượng trong nhà đang đi đâu, và giúp ra quyết định từ đó. Bốn việc chính, ngang hàng:

- biết điện lúc này đến từ Solar, pin hay lưới;
- canh giờ dùng tải lớn dựa trên sản lượng và dự báo;
- biết mức dự phòng khi mất điện: lưới còn không, pin còn chạy được bao lâu;
- theo dõi tình trạng hệ thống: pin, nhiệt độ, sản lượng, tiền tiết kiệm, bất thường.

Thành công là người dùng trả lời được các câu hỏi đó mà không phải mở app của hãng hoặc thêm card khác.

## Positioning

Chưa chốt. Đang xét: một card gộp cả tức thời, trong ngày và dự báo, thay vì chỉ hiện luồng tức thời.

## Operating Context

Card chạy trong dashboard Home Assistant, cạnh các card khác, trên mọi cỡ màn hình và theo chế độ sáng/tối của HA. Dữ liệu đến từ entity của từng integration, nên tên, đơn vị và quy ước dấu khác nhau giữa các hãng.

## Capabilities and Constraints

- Lit, TypeScript, Vite; build ra một tệp `dist/solar-almanac-card.js`; cài qua HACS.
- Hỗ trợ `W` và `kW`, có `invert` để đảo dấu theo từng entity.
- Quy ước sau khi đảo dấu: pin dương là xả, lưới dương là mua.
- Mọi entity ngoài luồng chính phải là tuỳ chọn; thiếu dữ liệu thì card vẫn hoạt động.
- Hỗ trợ ngôn ngữ chưa chốt: hiện chỉ có tiếng Việt, trong khi card công khai cho mọi hãng.

## Brand Commitments

Màu sắc phải sinh và kiểm tra bằng palette-axi (chủ dự án yêu cầu).

## Evidence on Hand

- Dữ liệu thật từ Home Assistant của chủ dự án (Luxpower, Solcast), dùng được để thử.
- Khảo sát GitHub và cộng đồng ngày 04/11/2026: `reference/de-xuat-giao-dien.html` (không commit).
- Chưa có người dùng ngoài, đánh giá hay số liệu sử dụng. Không được tự tạo.

## Product Principles

- Câu trả lời đi trước số liệu: nhìn vài giây phải biết tình hình.
- Không gắn với một hãng: mọi thứ riêng của hãng nằm trong cấu hình.
- Cấu hình dễ là tính năng, vì đây là phàn nàn lặp lại nhiều nhất của loại card này.
- Thiếu dữ liệu thì ẩn gọn, không hiện số sai.
- Con số phải đối chiếu được: tính ra từ đâu thì nói rõ.

## Accessibility & Inclusion

Không nhận biết thông tin chỉ bằng màu; tôn trọng `prefers-reduced-motion`; chữ đọc được từ xa trên tablet treo tường.
