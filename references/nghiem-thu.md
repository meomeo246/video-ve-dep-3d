# Nghiệm thu bằng ảnh tĩnh

## Cách soi

```bash
# 2 ảnh mỗi chương (đầu + giữa chương) + intro + frame drop 2 + outro
node tools/stills.mjs <CompositionId> 200,450,560,650,760,860,960,1060,1160,1300,1440,1600,1700,1900
cd out/still && ffmpeg -y -pattern_type glob -i '*.jpg' -vf "scale=360:-1,tile=7x2" ../bang-soi.jpg
```
(ffmpeg trên Windows không có `-pattern_type glob`: đặt tên ảnh `%03d.jpg` rồi dùng `-i %03d.jpg`.)

Lấy số frame từ `src/nhip.ts`: `batDau(i)` là frame đầu chương i, `oNhip(n)` là frame đầu ô nhịp n.

## Checklist: từng ô phải qua hết

- [ ] Vật có bóng, có phản chiếu. Không phải chấm tròn phẳng, không phải lục giác dán
- [ ] Vật chính ≤ 45% chiều cao khung, nằm trong khung ngắm, không đè chữ
- [ ] Không có mảng cháy trắng lớn, không có ô sân khấu đen trống
- [ ] Chữ đúng cỡ trong `bo-cuc-doc.md`, dấu không bị cắt hay chồng, không lẹm mép
- [ ] Intro có chữ "VẺ ĐẸP <MÔN>" to, nằm trọn trong khung
- [ ] So 2 ảnh cùng 1 chương thì thấy được **diễn biến** (vật đổi trạng thái), không chỉ là góc quay khác
- [ ] Frame drop 2 đúng là cảnh "wow" (đổi màu, bùng sáng…)
- [ ] Không có tên/logo công ty, chữ đúng với bản đã fact-check
- [ ] `npx tsc --noEmit -p .` không có lỗi

Có ô nào trượt thì sửa xong soi lại, đạt hết mới render full.

## Lỗi thường gặp (lấy từ các bản bị chê)

| Thấy gì | Do đâu | Sửa |
|---|---|---|
| Chấm tròn phẳng như hình dán | `meshBasicMaterial` cho vật chính; không có environment map | `MeshPhysicalMaterial` + RoomEnvironment (xem `ky-thuat-3d.md`) |
| Vật phủ kín khung | Dùng tấm phẳng / hộp / đĩa kích thước ~3–3,6 đơn vị, máy quay cách ~3,8 | Thu vật lại, bỏ tấm nền, để sàn lưới + bokeh làm nền |
| Nửa màn vàng trắng cháy | Mặt phẳng `meshBasicMaterial` màu sáng, cộng bloom | Bỏ mặt phẳng; tia/laser làm bằng vạch mảnh |
| Vài giây màn đen trước drop | Vật hiện quá muộn | Đoạn nhạc nghỉ vẫn phải có vật đang hình thành dần |
| Vật bé xíu đứng im giữa màn | Máy quay cố định, không có diễn biến | `MayQuay` + diễn biến lắp ráp → biến đổi → kết quả |
| Nửa dưới khung dọc bỏ trống | Bê bố cục ngang sang | Bố cục dọc riêng (`bo-cuc-doc.md`) |
| Chữ "HỌC" lẹm mép phải ở intro | Chữ 1 dòng quá dài | 2 dòng "VẺ ĐẸP / HOÁ HỌC", căn giữa |
| [H⁺] hiện "0,2·10⁻⁴" | Làm tròn mũ bằng `ceil` | Chuẩn hoá bằng `floor(-pH)` |

## Render

- `npx remotion render <Id> out/<ten>.mp4 --concurrency=2 --gl=angle`
- GPU 2GB: 2 luồng chạy ~4 frame/s, bài 65s mất khoảng 8 phút. Để 4 luồng là tràn VRAM, ước tính lên tới 3 tiếng.
- Render xong thì tự xem 1 lượt có tiếng, để kiểm chỗ cắt cảnh có rơi đúng beat không.
