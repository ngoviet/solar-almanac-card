---
version: 1
slug: "src-solar-flow-card-ts"
primary_target: "src/solar-flow-card.ts"
related_targets: []
---

# Solar Flow Card: card Lovelace

Scope: toàn bộ card. Visitor mode: Operate. Người dùng liếc vài giây trên điện thoại, nhìn từ xa trên tablet treo tường, đọc chi tiết trên máy tính.

Task: biết điện lúc này từ đâu, canh giờ dùng tải lớn, biết mức dự phòng, theo dõi tình trạng máy. Dữ liệu ngoài luồng chính đều tuỳ chọn.

Memorable moment: dải giờ tốt dùng tải lớn, thứ card khác không có.

## Direction contract

THESIS: Mỗi ngày là một tờ lịch: một con số thật to cho lúc này và dải giờ tốt để dùng tải lớn. Từ chối sơ đồ năm vòng tròn nối về biến tần.

OWN-WORLD: Băng đỏ đầu tờ, nền giấy tint đỏ của palette-axi, chữ một màu mực, số đặc đậm khổ lớn. Màu chỉ dành cho ba nguồn và băng đỏ. Tải trung tính.

STORY: Nhìn số to là biết nhà dùng bao nhiêu; ba dòng nguồn và câu trạng thái nói điện từ đâu; dải giờ nói nên chạy máy giặt lúc nào; dòng chữ nhỏ cuối tờ cho chi tiết.

FIRST VIEWPORT: Băng đỏ: ngày, tiêu đề, trạng thái lưới. Giữa: cột nguồn trái, số kW lớn ở giữa, cột dự phòng phải. Đường có hạt nối từng nguồn vào con số. Dưới: câu trạng thái, dải giờ, chữ nhỏ.

FORM: Tờ lịch bloc treo tường, candidate 3 của danh sách, seed: 463dbeeae96806b4. Mọi dấu trên dải giờ là số liệu thật (từ Ikeda). Màu chỉ ở nơi có nghĩa (từ Lexicon). Co giãn theo trọn ô (từ Doujin). Một đơn vị chi phối toàn card (từ Zoo).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

Tag mới thay cho `solar-flow-card`, và ngôn ngữ ngoài tiếng Việt.
