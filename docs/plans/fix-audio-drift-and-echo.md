# Kế hoạch: Khắc Phục Hiện Tượng Trầm/Chậm Tiếng (Clock Drift) và Vọng Mic

## 1. Goal (Mục tiêu)
- **Khắc phục triệt để hiện tượng SFX bị chậm dần và hạ cao độ (pitch drop):**
  - Tách luồng SFX khỏi bộ đệm WebRTC MediaStream chạy ngầm (nguyên nhân gây clock drift).
  - Sử dụng cơ chế phát âm thanh độc lập trực tiếp (Discrete Audio Engine via setSinkId): SFX luôn giữ 100% tốc độ gốc và cao độ gốc, không bao giờ bị méo tiếng sau thời gian dài.
- **Khắc phục hiện tượng nghe tiếng gõ phím/tiếng mic của chính mình:**
  - Tự động nhận diện thiết bị thông minh: Tự chọn `CABLE Input` cho Output, tự chọn Loa/Tai nghe thật cho Monitoring, tự chọn Mic thật cho Microphone.
  - Khóa bảo vệ an toàn: Nếu Output và Monitoring bị chọn trùng thiết bị, hiển thị cảnh báo đỏ và tuyệt đối không phát mic vào tai nghe của người dùng.
- **Đóng gói lại bản Portable EXE:**
  - Build file `dist/Valorant-Soundboard-Portable.exe` mới.
  - Cập nhật GitHub và kích hoạt release `v1.4.0`.

---

## 2. Scope & Files

### Allowed Files to Modify:
1. `engine.html`:
   - Thiết lập thuật toán tự động chọn thiết bị thông minh (Smart Device Detection) khi nạp danh sách devices.
   - Thêm banner cảnh báo an toàn khi Output trùng Monitor.
   - Viết lại cơ chế Audio: Mic chuyển thẳng vào CABLE Output; SFX phát độc lập bằng HTMLAudioElement + setSinkId vào cả CABLE và Tai nghe (có buffer delay 300ms).
2. `docs/plans/fix-audio-drift-and-echo.md`: Kế hoạch và tiến độ.

---

## 3. Implementation Steps

### Bước 1: Nâng cấp Audio Engine & Smart Detection trong `engine.html` [x]
- [x] Smart Device Selection: Tự nhận diện Mic thật, CABLE Input cho Output, Tai nghe thật cho Monitor.
- [x] Safety Guard: Cảnh báo đỏ khi Output trùng Monitor và chặn vòng lặp mic vọng vào tai nghe.
- [x] Discrete Audio Engine: Phát SFX trực tiếp qua `setSinkId` loại bỏ hoàn toàn hiện tượng hạ cao độ / chậm tiếng (clock drift) của WebRTC buffer.
- [x] Nút Start/Stop linh hoạt, cập nhật thiết bị động khi thay đổi dropdown.
- [x] Thêm cờ `autoplay-policy: no-user-gesture-required` trong `main.js`.

### Bước 2: Kiểm tra & Build lại Portable EXE [x]
- [x] Chạy `npm run dist:portable` tạo thành công `dist/Valorant-Soundboard-Portable.exe`.
- [x] Merge vào `main`, push lên GitHub và tạo tag `v1.4.0`.
