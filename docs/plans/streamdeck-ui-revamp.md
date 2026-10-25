# Kế hoạch: Thiết Kế Lại Giao Diện Stream Deck Chuẩn Pro (Lucide Icons & English)

## 1. Goal (Mục tiêu)
- **Cân đối bố cục:** Mở rộng panel Audio Router và Mobile Controller ở trên (thoáng đãng, QR code to rõ hơn, dễ thao tác); thu gọn panel Stream Deck bên dưới cân đối, tinh tế.
- **Loại bỏ hoàn toàn Emoji:** Thay thế toàn bộ bằng bộ vector icons tối giản phong cách **Lucide Icons** (đường nét thanh lịch, stroke 2px, chuẩn gaming gear).
- **Tinh giản nút phím tắt thô (`num0`, `num1`...):**
  - Bỏ các nút text thô trên góc pad.
  - Thay bằng biểu tượng 3 gạch / 3 chấm (`more-horizontal` / `sliders`) tinh tế.
  - Khi nhấp vào mở menu popover nhanh: xem phím hiện tại, đổi phím ("Record Keybind"), hoặc xóa phím ("Clear").
- **Chuyển các nút thuốc trên header thành icon đơn kèm tooltip hover:**
  - Nút Thư mục Sounds -> Icon Folder đơn, hover hiện tooltip "Open Sounds Folder".
  - Nút Reset phím -> Icon Rotate-CCW đơn, hover hiện tooltip "Reset Default Keybinds".
- **Chuyển toàn bộ ngôn ngữ sang tiếng Anh:** Giao diện chuyên nghiệp chuẩn quốc tế trên cả máy tính (`engine.html`) và điện thoại (`controller.html`).

---

## 2. Scope & Files (Phạm vi và danh sách file)

### Allowed Files to Create / Modify:
1. `engine.html`:
   - Tái cấu trúc layout: Mở rộng top grid (Audio Router + Mobile QR), tối ưu kích thước Stream Deck grid.
   - Tích hợp inline SVG Lucide icons (folder, rotate-ccw, mic, volume-2, radio, sliders, qr-code, square, zap, more-horizontal).
   - Thiết kế lại Pad Stream Deck: Icon Lucide, nhãn phím tinh tế, nút 3 gạch mở popover gán keybind.
   - Chuyển toàn bộ nhãn, thông báo và modal sang English.
2. `controller.html`:
   - Thay emoji bằng Lucide icons (volume-2, square, search, wifi, radio).
   - Thiết kế pad Stream Deck cảm ứng gọn gàng, hiện đại.
   - Chuyển toàn bộ ngôn ngữ sang English.
3. `main.js`: Cập nhật tiêu đề cửa sổ Electron và nhãn mặc định sang English.
4. `docs/plans/streamdeck-ui-revamp.md`: Kế hoạch và tiến độ.

### Non-Goals (Ngoài phạm vi):
- Không thay đổi logic Web Audio API (`AudioContext`, `toCable`, `toMon`).
- Không đổi logic lưu trữ file `keybinds.json` hay routing WebSocket.

---

## 3. Implementation Steps (Các bước thực hiện)

### Bước 1: Nâng cấp `engine.html` [x]
- Chuyển layout sang 2 hàng cân đối: [x]
  - Hàng 1 (Top): Audio Router (trái) + Mobile Connection (phải) với QR code to rõ (96px), select box hiện đại. [x]
  - Hàng 2 (Stream Deck): Lưới các pad LCD tinh xảo với icon Lucide. [x]
- Thay thế toàn bộ header pills bằng icon đơn (`Lucide folder`, `Lucide rotate-ccw`) có tooltip. [x]
- Thay nút text `num1`, `num2` thô bằng nút 3 chấm/3 gạch Lucide mở menu gán phím tắt nhanh. [x]
- Dịch 100% giao diện sang English. [x]

### Bước 2: Nâng cấp `controller.html` [x]
- Thay toàn bộ emoji bằng Lucide SVG icons. [x]
- Tối ưu pad Stream Deck trên mobile (LCD screen effect, viền neon, rung haptic). [x]
- Dịch 100% giao diện sang English. [x]

### Bước 3: Cập nhật `main.js` & Kiểm tra [x]
- Chuyển title window sang English: "Valorant Stream Deck". [x]
- Chạy kiểm tra `node --check main.js`. [x]

### Bước 4: Đóng gói lại Portable EXE & Cập nhật GitHub [x]
- Chạy `npm run dist:portable`. [x]
- Commit, merge vào `main`, push lên GitHub và tạo tag release mới. [x]
