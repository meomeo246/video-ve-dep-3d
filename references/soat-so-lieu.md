# Soát số liệu chữ HUD

Video không có lời đọc, mỗi con số trên màn hình chính là nội dung. Phải soát **trước khi dựng**, vì sửa chữ sau khi đã căn bố cục rất mất công.

## Cách làm

1. Viết **toàn bộ** chữ sẽ hiện lên màn hình thành 1 bảng: `# | Chương | Câu trên màn hình`.
2. Giao cho 1 AI khác có tra web (Codex, Gemini…) soát theo đề mẫu dưới đây. Không tự soát chữ do chính mình viết.
3. Sửa chữ theo kết quả, lưu lại file kết quả cạnh code (`fact-check.md`).
4. Chip, chú thích nhỏ cũng phải soát. Bản smartphone đã sót 3 chip vì chỉ soát dòng chính.

## Đề mẫu

Ví dụ đầy đủ ở `vi-du/tra-sua/de-fact-check.md`.

```
Fact-check chữ HUD video "<tên>", TikTok 9:16 cho học sinh THPT, không lời đọc. Việc của m:
1. Kiểm từng dòng, ghi ĐÚNG / SAI / CẦN SỬA, kèm 1 URL nguồn gốc (Wikipedia, PubChem, sách, bài báo;
   không dùng link redirect).
2. Dòng sai hoặc mơ hồ: đề xuất câu thay ≤ 40 ký tự, vẫn đúng khoa học.
3. Cột "Bài SGK": bài tương ứng trong SGK chương trình GDPT 2018, bộ Kết nối tri thức (lớp, số bài,
   tên bài). Không chắc thì ghi [CẦN NGUỒN], không đoán.
Làm luôn, không hỏi lại, không sửa file nào. Trả 1 bảng markdown + 3–5 dòng ghi chú.

| # | Chương | Câu trên màn hình |
|---|---|---|
...
```

## Mấy lỗi hay gặp

| Kiểu lỗi | Ví dụ sai → đúng |
|---|---|
| Viết "=" cho "gồm" | "Saccharose = glucose + fructose" → "gồm gốc glucose + gốc fructose" |
| Mốc cứng trong khi thực tế dao động | "caramel hoá ở 160 °C", "bể KNO₃ 400 °C" → bỏ số, hoặc ghi "nóng chảy" |
| Tuyệt đối hoá | "Vàng trơ tuyệt đối" → "bền trong không khí thường" |
| Thiếu điều kiện đo | "Eg = 1,12 eV" → "≈ 1,12 eV (300 K)"; "ΔH = 6,01" → "≈ +6,01 kJ/mol ở 0 °C" |
| Con số không có nguồn chắc | "1 cốc 50–150 mg caffeine", "99,9999999% Si" → bỏ |
| Gộp khái niệm | "nhẹ hơn" → "khối lượng riêng nhỏ hơn"; màng giọt béo là "lipid–protein", không chỉ "protein" |
| Gắn SGK quá đà | "1 cốc = 6 bài SGK" → "6 góc Hoá học trong 1 cốc trà sữa" |
