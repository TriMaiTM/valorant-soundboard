# Kế hoạch: PWA Soundboard & Hỗ trợ Đi Net (Online Tunnel)

## 1. Goal (Mục tiêu)
- Biến giao diện điều khiển trên điện thoại thành **PWA (Progressive Web App)**: cài đặt ra màn hình chính iPhone/Android thành app riêng biệt, mở toàn màn hình, có phản hồi rung (haptic).
- Hỗ trợ đổi Wi-Fi tự động qua **mDNS / Bonjour** (`http://<tên-máy>.local:3000`).
- Giải quyết triệt để trường hợp **Đi Net / Khác mạng Wi-Fi / Dùng 4G**: Tích hợp chế độ **Online Tunnel** (Cloudflare / Localtunnel) sinh ra link HTTPS và **mã QR code** hiển thị ngay trên giao diện Engine máy tính để điện thoại quét phát dùng luôn.
- Cung cấp file chạy nhanh **1-Click** (`run.bat` / shortcut) trên Windows.

---

## 2. Scope & Files (Phạm vi và các file được phép chỉnh sửa)

### Allowed Files to Create / Modify:
1. `package.json`: Thêm script và dependencies cần thiết (tạo mã QR, Bonjour/Tunnel nếu cần).
2. `main.js`: Bổ sung endpoint lấy danh sách IP/Hostname, tích hợp tunnel mode (on-demand), phục vụ manifest/icon.
3. `engine.html`: Nâng cấp giao diện hiển thị địa chỉ LAN (`.local`), nút bật/tắt Online Tunnel, và hiển thị **Mã QR Code** để điện thoại quét.
4. `controller.html`: Nâng cấp giao diện hiện đại, tối ưu PWA trên điện thoại, thêm rung haptic khi bấm nút sound.
5. `manifest.json`: Cấu hình PWA (tên app, màu theme, icon, standalone mode).
6. `icons/`: Thư mục chứa icon app soundboard cho PWA.
7. `run.bat`: Script khởi động 1-click trên Windows.

### Non-Goals (Ngoài phạm vi):
- Không sửa đổi logic trộn âm thanh cốt lõi trong `engine.html` (`AudioContext`, `toCable`, `toMon`).
- Không can thiệp vào các file âm thanh trong thư mục `sounds/`.

---

## 3. Implementation Steps (Các bước thực hiện)

### Bước 1: Cấu hình PWA và Giao diện Controller
- Tạo `manifest.json` và tạo icon app soundboard.
- Cập nhật `controller.html`:
  - Thêm thẻ meta PWA (`apple-mobile-web-app-capable`, `theme-color`).
  - Giao diện mobile hiện đại, dạng grid nút bấm, có rung nhẹ (`navigator.vibrate`) khi bấm sound.
  - Tự động nhận diện WebSocket qua cả HTTP (LAN) lẫn HTTPS/WSS (khi chạy Online Tunnel).

### Bước 2: Hiển thị IP, mDNS và Mã QR trên Engine PC
- Cập nhật `main.js`:
  - Lấy IP mạng LAN cục bộ và hostname của máy tính.
  - Tích hợp module tạo QR Code (dùng thư viện nhẹ `qrcode` hoặc render SVG client-side không cần dependency nặng).
  - Tích hợp tùy chọn Cloudflare Quick Tunnel (không cần tài khoản, hoàn toàn miễn phí) để tạo link HTTPS truy cập từ ngoài Internet khi đi quán Net.
- Cập nhật `engine.html`:
  - Hiển thị link nội bộ: `http://<tên-máy>.local:3000`.
  - Hiển thị QR Code để điện thoại quét ngay tại chỗ.
  - Nút gạt "Bật chế độ Đi Net (4G / Khác mạng)" -> sinh link public và QR tương ứng.

### Bước 3: Tạo Shortcut 1-Click trên Windows
- Tạo file `run.bat` chuẩn để người dùng bấm đúp là chạy, tự động mở app mà không hiện cửa sổ console rườm rà.

---

## 4. Risks & Mitigations (Rủi ro và cách khắc phục)
- **Rủi ro ở quán Net:** Mạng máy trạm ở quán Net chặn các cổng hoặc chia tách VLAN với Wi-Fi.  
  -> *Khắc phục:* Sử dụng Cloudflare Tunnel (chạy qua cổng 443 HTTPS ra ngoài), bất kỳ mạng nào ra được Internet đều thông suốt.
- **Rủi ro HTTPS trên iOS PWA:** Khi chạy qua Internet Tunnel, kết nối là HTTPS và WSS, iOS cho phép cài PWA và chạy hoàn toàn mượt mà.

---

## 5. Verification Commands (Cách kiểm tra sau mỗi bước)
- Chạy thử app bằng lệnh: `npm start` hoặc click `run.bat`.
- Kiểm tra truy cập `http://localhost:3000/` trên trình duyệt: kiểm tra manifest và service worker.
- Kiểm tra tính năng tạo mã QR và link mDNS.
