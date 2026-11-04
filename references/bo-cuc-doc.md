# Bố cục dọc 1080×1920

Đây là bố cục dựng riêng cho khung dọc, không phải bố cục ngang đặt lên khung dọc.

| Vùng (y, px) | Nội dung |
|---|---|
| 0–140 | Để trống (thanh trên của TikTok) |
| 150–290 | Trái: badge số chương + chủ đề. Phải: tên series + 6 chấm tiến độ. Dưới: tiêu đề chương |
| 318–700 | Công thức to + 2–4 dòng mô tả + hàng chip |
| 660–1350 | Sân khấu 3D, có khung ngắm 4 góc |
| 1380–1540 | Thang đo / thanh thời gian (pH, % pin…) |
| > 1560 | Để trống cho caption TikTok |

## Cỡ chữ

| Thành phần | Cỡ |
|---|---|
| Chữ intro "VẺ ĐẸP / HOÁ HỌC" | ~150px, 2 dòng, lề trái phải ≥ 60px |
| Tiêu đề chương | 74px |
| Công thức | 120–170px. Công thức dài thì xuống ~90px hoặc ngắt 2 dòng |
| Dòng mô tả | 30–34px |
| Chip | ≥ 22px |
| Chữ nào dưới 18px | Bỏ, trên điện thoại không đọc được |

## Font và chữ

- Font: `Bahnschrift, Barlow, "Segoe UI", Arial, sans-serif` (biến `FONT` trong `src/Hud.tsx`). **Không dùng font monospace** (Consolas…), vì dấu tiếng Việt bị chồng lên nhau.
- Chỉ số dưới/trên làm bằng `<span>` thu nhỏ. Đừng dùng ký tự unicode ₂ ⁺, font thiếu glyph.
- Chữ có dấu cao (Ẫ, Ố) bị cắt đầu khi trượt trong khung `overflow: hidden` → thêm `paddingTop: 16; marginTop: -16`.
- Không thêm chữ trang trí kiểu "STAGE_3D // CAM_FOV: 42°": người xem không đọc được, chỉ thêm rối.
- Không ghi tên hay logo công ty trong video.
