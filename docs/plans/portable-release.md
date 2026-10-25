# Kế hoạch: Portable EXE, Quản lý SFX (Thêm/Xóa), Phím tắt NumPad & Release GitHub

## 1. Goal (Mục tiêu)
- **Quản lý SFX dễ dàng:**
  - Nút "Mở thư mục Sounds" trên Engine PC (`shell.openPath`): Bấm một phát mở ngay thư mục chứa âm thanh trên Windows để kéo thả, copy, xóa file MP3/WAV tùy ý.
  - Hỗ trợ thêm/xóa file âm thanh trực tiếp qua API và giao diện, tự động đồng bộ realtime qua WebSocket.
  - Khi chạy Portable EXE: Tự động khởi tạo và ưu tiên thư mục `sounds/` nằm cạnh file EXE hoặc trong thư mục người dùng để không bị mất dữ liệu.
- **Phím tắt toàn cục (Global Shortcuts) trong Valorant:**
  - Tự động gán cụm phím số `NumPad 1` -> `NumPad 9` cho các âm thanh.
  - Gán phím `NumPad 0` để **Dừng tất cả âm thanh (Stop All)** ngay lập tức khi đang bắn nhau.
  - Hoạt động ngầm xuyên qua game Valorant Fullscreen mà không cần Alt-Tab hay cầm điện thoại.
  - Hiển thị badge phím tắt trên giao diện để người dùng dễ nhớ.
- **Ẩn hoàn toàn Terminal:**
  - Khởi động qua `run.vbs` (0-console), bấm dấu [X] đóng cửa sổ là dọn dẹp sạch toàn bộ server ngầm.
- **Đóng gói Portable EXE:**
  - Dùng `electron-builder` tạo 1 file duy nhất `Valorant Soundboard.exe` không cần cài đặt.
- **GitHub Repository & Release:**
  - Kết nối remote `https://github.com/TriMaiTM/valorant-soundboard.git`, đẩy branch lên và tạo release kèm file EXE.

---

## 2. Scope & Files (Phạm vi và danh sách file)

### Allowed Files to Create / Modify:
1. `main.js`: Quản lý đường dẫn thư mục `sounds` (hỗ trợ portable), đăng ký dải phím tắt `num1`-`num9` và `num0` (Stop), IPC / endpoint mở thư mục sounds (`shell.openPath`), dọn dẹp khi tắt app.
2. `engine.html`: Thêm nút "Mở thư mục âm thanh", hiển thị danh sách hotkeys tương ứng, hỗ trợ nút xóa/thêm sound.
3. `controller.html`: Hiển thị badge phím tắt trên nút sound để tiện theo dõi.
4. `run.vbs`: Script khởi động ngầm không hiện Terminal.
5. `create-shortcut.bat`: Tạo shortcut Desktop trỏ tới `run.vbs`.
6. `package.json`: Cấu hình `electron-builder` với target `portable`.
7. `docs/plans/portable-release.md`: Kế hoạch và tiến độ.

---

## 3. Implementation Steps (Các bước thực hiện)

### Bước 1: Quản lý Thư mục SFX & Phím tắt NumPad Toàn Cục [x]
- Cập nhật `main.js`: [x]
  - Định vị `SOUNDS_DIR`: Nếu `app.isPackaged` thì dùng `path.join(path.dirname(app.getPath('exe')), 'sounds')` (cạnh file exe) hoặc copy sẵn sound mẫu vào nếu chưa có. [x]
  - Đăng ký global shortcut: [x]
    - `num1` -> `num9`: Phát sound tương ứng theo thứ tự index. [x]
    - `num0`: Dừng tất cả âm thanh. [x]
  - Thêm endpoint `/open-sounds-dir` mở Windows File Explorer bằng `electron.shell.openPath`. [x]
  - Thêm logic dọn dẹp khi đóng cửa sổ (`win.on('closed')`). [x]

### Bước 2: Nâng cấp Giao diện Engine & Controller [x]
- Cập nhật `engine.html`: [x]
  - Thêm nút "📂 Mở Thư Mục Sounds" để thêm/xóa file MP3 trực tiếp bằng Explorer. [x]
  - Thêm bảng hiển thị phím tắt `[Num 1] ... [Num 9]` tương ứng từng sound và `[Num 0]` Stop. [x]
- Cập nhật `controller.html`: [x]
  - Hiển thị nhãn nhỏ phím tắt (Num 1, Num 2...) trên từng nút để người dùng vừa nhìn điện thoại vừa bấm phím nếu muốn. [x]

### Bước 3: Launcher Chạy Ngầm (0-Terminal) [x]
- Tạo `run.vbs` chạy ẩn 100%. [x]
- Cập nhật `create-shortcut.bat` tạo shortcut gọi `run.vbs`. [x]

### Bước 4: Đóng Gói Portable EXE với electron-builder [x]
- Cấu hình `package.json` với script `dist:portable`. [x]
- Chạy build và kiểm tra file `dist/Valorant-Soundboard-Portable.exe` (105 MB). [x]

### Bước 5: Đẩy Code & Tạo GitHub Release [ ]
- `git remote add origin https://github.com/TriMaiTM/valorant-soundboard.git` [x]
- Đẩy branch và tạo tag release trên GitHub. [ ]
