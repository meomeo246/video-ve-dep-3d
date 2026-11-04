# Kỹ thuật cho ra "chất" 3D neon

Các thông số dưới đây đã thử trên bản trà sữa. Muốn đổi thì soi ảnh tĩnh trước và sau khi đổi.

## Ánh sáng và vật liệu

| Thứ | Cách làm | Thông số |
|---|---|---|
| Bloom | `EffectComposer → RenderPass → UnrealBloomPass → OutputPass`, chiếm vòng render bằng `useFrame(() => composer.render(), 1)`. Có sẵn trong `src/three/Bloom.tsx` | strength 0.75, radius 0.5, **threshold 0.72** |
| Environment | `RoomEnvironment` + PMREM (`<MoiTruong />` trong `src/three/PhanTu.tsx`) | `environmentIntensity` **0.3** |
| Bi phân tử, vật rắn | `MeshPhysicalMaterial` (có sẵn `useVatLieuBong(mau)`) | clearcoat 1, roughness 0.25, emissive ≤ 0.06 |
| Bi carbon | Xám đậm `#7d8a99` | Để trắng thì bloom ăn sạch |
| Kính | `ShaderMaterial` Fresnel `pow(1 - abs(dot(N, V)), 3)`, blending cộng, `depthWrite: false` | Hệ số sáng ~**0.4** (để 1.9 là cốc cháy trắng) |
| Chất lỏng đổi màu | Shader với biên `smoothstep` quanh độ cao `front`, cộng nhiễu sin theo góc và độ cao để ra vệt xoáy, thêm 1 dải sáng ngay mép biên | — |
| Vạch sáng, viền, tia | `meshBasicMaterial` hoặc `LineBasicMaterial` | Chỉ dùng cho mấy thứ này, đừng dùng cho vật chính |

**Cháy trắng** xảy ra khi environment + đèn + emissive + bloom cộng dồn. Hạ từng thứ một, đừng hạ bloom trước.

## Nền

Đã có sẵn trong `src/three/Nen.tsx`:
- Bụi bokeh: `Points` dùng sprite mềm, trôi lên
- Sàn lưới: shader mờ dần ra xa
- Bệ tròn nhiều vòng: có vòng gạch xoay, vòng sóng loé theo beat

Cảnh nào cũng dùng chung nền này. Không thêm tấm phẳng to phía sau vật.

## Chuyển động theo nhạc

- `xung(f, chuKy)` = `exp(-(f mod chuKy)/τ)`: dùng cho rung máy quay, độ sáng viền, scale vật mỗi phách.
- `nay(t)`: hàm overshoot cho chữ hoặc vật bật ra.
- Chữ intro bật từng từ, mỗi từ 1 phách.
- Máy quay: `src/three/MayQuay.tsx`. Cảnh tự tính `pos` theo frame (vd góc = f·0.01 để xoay quanh vật, bán kính giảm dần để tiến lại), `lac = 0.04 * xung(f)` để rung theo phách.

## Mẹo dựng hình

- **Nhiều vật giống nhau thì dùng `InstancedMesh`** (mạng băng 128 O + 256 H vẫn mượt).
- Chuỗi xoắn rải hạt nhìn như hạt rơi lung tung → nối các mắt bằng 1 sợi `TubeGeometry`.
- Mạng băng Ih: dựng kiểu wurtzite (c/a = 1,633, u = 3/8), nối các O–O ở khoảng cách lân cận, mỗi O nhận 2 H. Muốn **thấy lục giác** thì xoay trục c hướng vào máy quay.
- Intro kiểu "hạt tụ thành phân tử": ~2.600 hạt trong 1 shader có 2 vị trí (vị trí xoáy ↔ vị trí trên mặt các nguyên tử), trộn theo `uM`, mỗi hạt có độ trễ riêng.
- Chữ Ọ trong "HỌC" thay bằng vòng sáng + chấm.
