# Kế hoạch: Giao diện Stream Deck & Tùy Biến Keybinds Toàn Cục

## 1. Goal (Mục tiêu)
- **Tùy biến Keybind toàn cục linh hoạt:**
  - Cho phép người dùng click để gán phím tắt bất kỳ (F1-F12, phím chữ, tổ hợp phím như Ctrl/Alt/Shift, NumPad) cho từng âm thanh và phím Dừng (Stop All).
  - Lưu trữ cấu hình keybinds bền vững vào file `keybinds.json` (nằm cạnh file EXE hoặc thư mục dữ liệu).
  - Tự động đăng ký qua Electron `globalShortcut` và cập nhật tức thì không cần khởi động lại app.
- **Thiết kế Giao diện Stream Deck chuyên nghiệp:**
  - Giao diện controller dạng lưới phím LCD Stream Deck (vát cạnh, viền phát sáng RGB, phản hồi xúc giác).
  - Hiển thị badge phím tắt rõ ràng trên từng phím (`[ F1 ]`, `[ Num 1 ]`...).
  - Hiệu ứng sóng âm / visualizer sống động khi một phím đang phát âm thanh.
  - Chế độ cấu hình phím trực tiếp trên giao diện Engine máy tính: Bấm "Gán phím" -> Nhấn phím trên bàn phím -> Lưu tự động.
- **Đóng gói lại Portable EXE & Cập nhật GitHub:**
  - Build bản `dist/Valorant-Soundboard-Portable.exe` mới nhất.
  - Commit và đẩy lên GitHub repo.

---

## 2. Scope & Files (Phạm vi và danh sách file)

### Allowed Files to Create / Modify:
1. `main.js`:
   - Quản lý đọc/ghi `keybinds.json`.
   - Endpoint `/keybinds` (GET để lấy danh sách phím, POST để lưu phím mới).
   - Hàm `registerCustomHotkeys()` đăng ký phím tắt theo cấu hình `keybinds.json`.
2. `engine.html`:
   - Nâng cấp giao diện thành phong cách Stream Deck Studio.
   - Thêm modal hoặc inline popover "Bấm phím để gán keybind".
   - Cung cấp nút xóa keybind hoặc đặt lại mặc định (Reset to NumPad).
3. `controller.html`:
   - Nâng cấp giao diện Mobile thành một bàn Stream Deck thu nhỏ cực đẹp.
   - Hiển thị nhãn keybind thực tế tương ứng với cấu hình trên máy tính.
4. `package.json`: Giữ cấu hình build portable.
5. `docs/plans/streamdeck-keybinds.md`: Kế hoạch và tiến độ.

### Non-Goals (Ngoài phạm vi):
- Không thay đổi thuật toán định tuyến âm thanh Web Audio cốt lõi.
- Không xóa các sound effect mẫu trong thư mục `sounds/`.

---

## 3. Implementation Steps (Các bước thực hiện)

### Bước 1: Backend Quản Lý Keybinds (`main.js`) [x]
- Tạo hàm lưu/đọc `keybinds.json` (tự động fallback về `num1`-`num9` và `num0` nếu chưa có cấu hình). [x]
- Thêm API: [x]
  - `GET /keybinds`: Lấy cấu hình phím hiện tại. [x]
  - `POST /keybinds`: Cập nhật cấu hình phím cho một hoặc nhiều sound. [x]
  - `POST /keybinds/reset`: Đặt lại phím NumPad mặc định. [x]
- Đăng ký `globalShortcut` theo keybinds mới, bắt lỗi phím không hợp lệ. [x]

### Bước 2: Giao Diện Stream Deck Studio trên Engine PC (`engine.html`) [x]
- Thiết kế lưới phím Stream Deck pads (LCD key aesthetic, glow viền, active pulse). [x]
- Thêm chức năng gán phím: Click vào nút "Đổi phím" trên pad -> Lắng nghe `keydown` trên trình duyệt -> Chuyển thành format Electron accelerator (ví dụ: `F5`, `Control+Shift+A`, `Num1`) -> Gọi API lưu lại. [x]
- Đồng bộ phím tắt in-game Valorant ngay lập tức. [x]

### Bước 3: Giao Diện Mobile Stream Deck (`controller.html`) [x]
- Thiết kế pad Stream Deck cảm ứng trên điện thoại. [x]
- Hiển thị nhãn phím tắt chính xác được cấu hình từ PC. [x]
- Thêm hiệu ứng rung haptic và animation nảy phím xúc giác. [x]

### Bước 4: Đóng Gói Lại Portable EXE & Cập Nhật GitHub [x]
- Chạy `npm run dist:portable` tạo bản EXE mới. [x]
- Commit, push lên GitHub nhánh `main`, tạo tag `v1.2.0`. [x]
