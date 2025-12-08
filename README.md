# 🛒 TECH STORE - Website Bán Hàng Công Nghệ

Website bán hàng công nghệ với đầy đủ tính năng quản lý đơn hàng, sản phẩm, và người dùng.

## 🚀 Stack

- **Frontend**: React + Tailwind CSS + Vite
- **Backend**: Node.js + Express + Sequelize
- **Database**: MySQL 8.0
- **Auth**: JWT (access + refresh token)
- **Deploy**: Docker + Docker Compose

## 🎨 Màu sắc

- Primary: `#1E40AF` (xanh dương đậm)
- Secondary: `#F3F4F6` (xám nhạt)
- Accent: `#F97316` (cam tươi)

## 📋 Yêu cầu

- Node.js 18+
- MySQL 8.0 (hoặc Docker)
- npm hoặc yarn

## 🛠️ Cài đặt

### Chế độ 1: Development với XAMPP

1. Bật XAMPP → Start Apache + MySQL
2. Tạo database: `tech_store_db`
3. Import file `database/init.sql`

4. Cài đặt dependencies:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

5. Tạo file `.env` từ `.env.example` và cấu hình

6. Chạy:
```bash
# Từ root
npm run dev

# Hoặc chạy riêng
npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2
```

### Chế độ 2: Docker

```bash
# Tạo .env từ .env.example và cấu hình
cp .env.example .env

# Build và chạy
docker-compose up --build

# Chạy background
docker-compose up -d

# Xem logs
docker-compose logs -f

# Dừng
docker-compose down
```

## 📁 Cấu trúc dự án

```
.
├── backend/          # Express API
├── frontend/         # React App
├── database/         # SQL scripts
├── docker-compose.yml
└── README.md
```

## 🔐 Phân quyền

- **Public**: Xem sản phẩm, tìm kiếm
- **User**: Mua hàng, xem đơn hàng, đánh giá
- **Employee**: Quản lý đơn hàng
- **Manager**: Quản lý sản phẩm, thống kê
- **Admin**: Quản lý users, báo cáo hoạt động người dùng

## 📝 API Endpoints

Xem chi tiết trong file `backend/README.md`

## 🧪 Testing

Sử dụng Postman/Thunder Client để test API endpoints.

Xem chi tiết trong file `TESTING.md`

## 📄 License

ISC

