---
name: video-ve-dep-3d
description: Dựng video TikTok dọc 9:16 kiểu "Vẻ đẹp Hóa học / Vật lý / Sinh học" — 3D neon thật (Remotion + Three.js, bloom, kính, bi–que), chữ HUD, mọi chuyển động bám beat nhạc phonk, không lời đọc. Dùng khi được nhờ làm video series "Vẻ đẹp <môn>", video 3D neon HUD theo chủ đề (vd "Hóa học trong 1 cốc trà sữa", "trong chiếc smartphone"), hoặc sửa/nghiệm thu một video loại này.
---

# Video "Vẻ đẹp <môn học>": 3D neon HUD bám beat

Video dọc 1080×1920, khoảng 65s, không có lời đọc. 1 chủ đề đời thường được tách thành 6 "góc" kiến thức, mỗi góc là 1 chương với 1 màu neon riêng. Bản mẫu đã đạt: `vi-du/tra-sua/` ("Hóa học trong 1 cốc trà sữa"). Engine nằm ở `template/`.

## Luật cứng (bản bị chê đều do phạm mấy luật này)

1. **3D thật bằng Three.js.** Không vẽ SVG/CSS rồi gọi là 3D. Vật chính dùng `MeshPhysicalMaterial` và phải có environment map. `meshBasicMaterial` chỉ dùng cho vạch sáng, viền, tia.
2. **Vật chính cao ≤ 45% khung** và nằm gọn trong khung ngắm (y 660–1350). Không dùng tấm phẳng to làm nền.
3. **Máy quay không bao giờ đứng im:** luôn xoay quanh vật hoặc tiến lại chậm, và rung nhẹ theo beat.
4. **Mỗi chương có diễn biến hoá học:** lắp ráp → biến đổi → kết quả. Không chấp nhận chỉ 1 vật đứng xoay.
5. **Mọi mốc đều bám lưới nhịp:** cắt cảnh, chữ bật, rung máy quay. Cảnh "wow" nhất đặt đúng drop lớn thứ 2.
6. **Không cháy trắng, không màn đen trống, không vật đè chữ.**
7. **Số liệu trên HUD phải được soát và có nguồn trước khi dựng.** Không ghi tên/logo công ty trong video.
8. **Nghiệm thu bằng ảnh tĩnh trước khi render full** (render full tốn 8–10 phút, ảnh tĩnh chỉ ~1s/ảnh).

## Quy trình

| Bước | Việc | Đầu ra |
|---|---|---|
| 0 | Chọn chủ đề **đời thường** có 6 góc kiến thức, không đi theo mục lục SGK. Làm bảng 6 chương: màu, thành phần, kiến thức, **diễn biến 3D**, bài SGK | `plan.md`, chờ duyệt |
| 1 | Chép `template/` sang thư mục làm việc **ngoài Drive** rồi `npm install` | thư mục dự án |
| 2 | Đo nhạc: `python tools/do_nhip.py public/<nhac>.mp3 --drop <giây drop chính>`. Dán `BPM`, `LECH_S` vào `src/nhip.ts`; chia `MOC` (ô nhịp bắt đầu từng chương) theo đoạn nhạc | lưới nhịp |
| 3 | Viết toàn bộ chữ HUD ra bảng, đưa AI khác (Codex…) fact-check có nguồn theo `references/soat-so-lieu.md`. Sửa chữ theo kết quả | `fact-check.md` |
| 4 | Dựng **1 chương thử** (cảnh wow), render ~8s cho người duyệt | clip thử |
| 5 | Dựng các chương còn lại theo `references/ky-thuat-3d.md` + `references/bo-cuc-doc.md` | code |
| 6 | Xuất ảnh tĩnh mỗi chương 2 ảnh + frame drop 2, ghép bảng soi, **tự soi** theo `references/nghiem-thu.md`. Ô nào trượt thì sửa và soi lại | bảng soi |
| 7 | Render full `--concurrency=2`, tự xem 1 lượt | mp4 |

## Engine (`template/`)

Remotion 4.0.230 + @react-three/fiber 8 + three 0.169. Chỉ dùng mấy gói này; cần bloom thì đã có `three/examples/jsm`, không cài gói mới.

| File | Vai trò | Khi làm chủ đề mới |
|---|---|---|
| `src/nhip.ts` | Lưới nhịp (`BPM`, `LECH_S`, `MOC`), danh sách 6 chương, các hàm `xung`, `mo`, `em`, `nay` | Sửa số + `CHUONG` |
| `src/three/Bloom.tsx` | UnrealBloom (strength 0.75, radius 0.5, threshold 0.72) | Giữ |
| `src/three/Nen.tsx` | Bụi bokeh, sàn lưới neon, bệ tròn loé theo beat | Giữ |
| `src/three/MayQuay.tsx` | Máy quay đi theo frame: cảnh tự tính `pos`/`nhin` mỗi frame (xoay, tiến lại); `lac` là độ rung (cho bằng `xung(...)`) | Giữ |
| `src/three/PhanTu.tsx` + `duLieu.ts` | `MoiTruong` (RoomEnvironment 0.3), `useVatLieuBong` (vật liệu bóng chuẩn), `PhanTuBiQue` (bi–que từ toạ độ xyz) | Thêm phân tử vào `duLieu.ts`; vật mới dùng `useVatLieuBong` |
| `src/three/Coc.tsx` | Cốc kính Fresnel, chất lỏng đổi màu bằng shader | Dùng lại nếu có cảnh cốc |
| `src/Hud.tsx`, `src/Chu.tsx` | HUD dọc: badge chương, chấm tiến độ, tiêu đề, công thức, chip, khung ngắm | Giữ, chỉ đổi chữ |
| `src/Video.tsx`, `src/Root.tsx` | Ghép intro + 6 chương + outro + nhạc | Đổi import cảnh |
| `src/canh/*` | Cảnh của bản trà sữa (ví dụ) | **Viết mới** theo chủ đề |
| `tools/do_nhip.py` | Đo BPM, phách 0, độ to từng ô nhịp | — |
| `tools/stills.mjs` | Render ảnh tĩnh: `node tools/stills.mjs <CompositionId> 0,400,900` → `out/still/` | — |
| `tools/beat_tam.py` | Tạo beat phonk tạm, không dính bản quyền, để dựng thử khi chưa có nhạc | — |

Lệnh:
```bash
npm install
npx remotion studio                                           # xem trên trình duyệt
node tools/stills.mjs TraSua 200,1000,1500,1900               # ảnh tĩnh
npx remotion render TraSua out/video.mp4 --concurrency=2 --gl=angle
```

## Môi trường

- Node ≥ 18, ffmpeg, Python 3 + numpy (để chạy `do_nhip.py`). Chrome cho Remotion tự tải ở lần chạy đầu.
- **Font:** Bahnschrift (có sẵn trên Windows). Máy Linux/Mac thì cài **Barlow** (Google Fonts, miễn phí); code đã khai báo Barlow làm font dự phòng.
- **GPU yếu (2GB, kiểu GT 1030 / Quadro P400): bắt buộc `--concurrency=2`.** Mỗi luồng render giữ 1 bộ bloom 1080×1920, để 4 luồng là tràn VRAM. 2 luồng chạy khoảng 4 frame/s.
- Nhạc: file `.mp3` để trong `public/`, **không commit lên git**. Nhạc lấy từ clip TikTok có rủi ro bản quyền: hoặc chọn nhạc trong thư viện TikTok lúc đăng, hoặc người đăng tự chịu.

## Tài liệu kèm

- `references/ky-thuat-3d.md`: thông số vật liệu, bloom, shader, máy quay
- `references/bo-cuc-doc.md`: chia vùng màn dọc + cỡ chữ
- `references/soat-so-lieu.md`: đề fact-check mẫu + các câu hay viết sai
- `references/nghiem-thu.md`: checklist soi ảnh tĩnh + lỗi thường gặp (lấy từ bản bị chê)
- `vi-du/tra-sua/`: bảng soi của bản đạt, đề và kết quả fact-check
