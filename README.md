# JOB PORTAL NODE.JS + EXPRESS + MYSQL

Dự án này được build theo yêu cầu đồ án web việc làm:
- Ứng viên: đăng ký, cập nhật hồ sơ, tải CV, ứng tuyển CV
- Nhà tuyển dụng: giới thiệu công ty, đăng tin việc làm, sửa tin, xem hồ sơ đã apply
- Admin: quản lý tuyển dụng, duyệt tin, quản lý nhà tuyển dụng, thống kê
- Trang chủ: hiển thị việc làm theo category và địa điểm
- Công nghệ: Node.js, Express, EJS, MySQL, JWT cookie auth

## 1) Cài đặt môi trường
- Cài Node.js LTS
- Cài XAMPP và bật Apache + MySQL
- Mở project bằng VS Code

## 2) Import database bằng XAMPP / phpMyAdmin
1. Mở phpMyAdmin
2. Tạo database hoặc import trực tiếp file `database.sql`
3. Nếu import thủ công:
   - tạo DB tên `job_portal_node`
   - chọn tab Import
   - chọn file `database.sql`
   - bấm Go

## 3) Cấu hình `.env`
- Copy file `.env.example` thành `.env`
- Sửa lại cho đúng MySQL của XAMPP

Ví dụ:
```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=job_portal_node
JWT_SECRET=doi-secret-key-khi-deploy
```

Nếu XAMPP của bạn chạy MySQL cổng 3307 thì sửa `DB_PORT=3307`.

## 4) Cài npm
Mở Terminal tại thư mục project rồi chạy:
```bash
npm install
```

Để chạy project:
```bash
npm run dev
```
hoặc
```bash
npm start
```

Sau đó mở:
```bash
http://localhost:3000
```

## 5) Tài khoản demo
- Admin: `admin@job.com` / `admin123`
- Nhà tuyển dụng: `employer@job.com` / `123456`
- Ứng viên: `candidate@job.com` / `123456`

## 6) Cấu trúc chính
```text
src/
  app.js
  config/db.js
  controllers/
  middleware/
  services/
  utils/
  views/
  public/
```

## 7) Ghi chú quan trọng
- CV upload lưu trong `src/public/uploads/cv`
- Logo công ty lưu trong `src/public/uploads/company`
- JWT đang lưu bằng cookie httpOnly để tiện dùng với web giao diện EJS
- Admin có thể duyệt tin tại `/admin/jobs`
- Tin mới từ nhà tuyển dụng mặc định ở trạng thái `pending`

## 8) Các lệnh npm bạn hỏi “tải lại npm gì đó”
Trong project này, các lệnh cần nhớ là:
```bash
npm install
npm run dev
npm start
```

Nếu thiếu package sau khi copy project sang máy khác, chỉ cần chạy lại:
```bash
npm install
```
