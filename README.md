# 🏭 Hệ thống Phiếu Nhập Kho (Warehouse Receipt)

## Tech Stack
- **Backend:** TypeScript + Node.js + Express
- **Database:** PostgreSQL
- **Frontend:** HTML + CSS + JavaScript (served by Express)

## Cấu trúc thư mục
```
warehouse-receipt-app/
├── backend/          # API server
│   └── src/
│       ├── config/       # Database connection
│       ├── controllers/  # Route handlers
│       ├── interfaces/   # TypeScript interfaces
│       ├── models/       # Database models
│       ├── routes/       # Express routes
│       ├── services/     # Business logic
│       ├── app.ts        # Express app
│       └── server.ts     # Entry point
├── frontend/         # Static frontend
│   ├── pages/        # HTML pages
│   ├── css/          # Stylesheets
│   └── js/           # JavaScript
└── sql/              # Database scripts
```

## Cài đặt & Chạy

### 1. Tạo database PostgreSQL
```sql
CREATE DATABASE warehouse_db;
```
Sau đó chạy file `sql/init.sql` để tạo bảng.

### 2. Cấu hình .env
Sửa file `backend/.env` với thông tin PostgreSQL của bạn.

### 3. Cài dependencies & chạy
```bash
cd backend
npm install
npm run dev
```

### 4. Truy cập
- Trang chủ: http://localhost:3000
- Tạo phiếu: http://localhost:3000/create
- API: http://localhost:3000/api/receipts

## API Endpoints
| Method | URL | Mô tả |
|--------|-----|--------|
| GET | /api/receipts | Danh sách phiếu |
| POST | /api/receipts | Tạo phiếu mới |
| GET | /api/receipts/:id | Chi tiết phiếu |
| DELETE | /api/receipts/:id | Xóa phiếu |
| PATCH | /api/receipts/:id/status | Cập nhật trạng thái |
