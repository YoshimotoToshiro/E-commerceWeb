# 🚀 Quick Start Guide - Tech Store

## Cài đặt nhanh

### Chế độ 1: Development với XAMPP

1. **Bật XAMPP**
   - Start Apache + MySQL

2. **Tạo Database**
   ```sql
   CREATE DATABASE tech_store_db;
   ```
   - Import file `database/init.sql` vào phpMyAdmin

3. **Cài đặt Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Chỉnh sửa .env với thông tin database XAMPP
   npm run dev
   ```

4. **Cài đặt Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Seed Data (tùy chọn)**
   ```bash
   cd backend
   npm run db:seed
   ```

6. **Truy cập**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

---

### Chế độ 2: Docker

1. **Tạo file .env**
   ```bash
   cp .env.example .env
   # Chỉnh sửa các giá trị cần thiết
   ```

2. **Build và chạy**
   ```bash
   docker-compose up --build
   ```

3. **Chạy background**
   ```bash
   docker-compose up -d
   ```

4. **Xem logs**
   ```bash
   docker-compose logs -f
   ```

5. **Dừng**
   ```bash
   docker-compose down
   ```

---

## Cấu trúc dự án

```
.
├── backend/              # Express API
│   ├── config/          # Database, JWT config
│   ├── controllers/     # Business logic
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── scripts/         # Database scripts
│   └── server.js        # Entry point
│
├── frontend/            # React App
│   ├── src/
│   │   ├── api/         # API calls
│   │   ├── components/   # React components
│   │   ├── context/     # Auth context
│   │   ├── layouts/     # Layout components
│   │   └── pages/       # Page components
│   └── vite.config.js
│
├── database/            # SQL scripts
│   └── init.sql         # Database schema
│
├── docker-compose.yml   # Docker config
└── README.md
```

---

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tech_store_db
DB_USER=root
DB_PASSWORD=
JWT_SECRET=dev-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-key
CORS_ORIGIN=http://localhost:3000
PORT=5000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
```

---

## Phân quyền

- **Public**: Xem sản phẩm, tìm kiếm
- **User**: Mua hàng, xem đơn hàng, đánh giá
- **Employee**: Quản lý đơn hàng
- **Manager**: Quản lý sản phẩm, thống kê
- **Admin**: Quản lý users, báo cáo hoạt động người dùng

---

## API Endpoints

Xem chi tiết trong file `TESTING.md`

---

## Troubleshooting

### Database connection error
- Kiểm tra MySQL đang chạy
- Kiểm tra thông tin trong .env
- Test connection: `mysql -u root -p`

### Port already in use
- Backend: Đổi PORT trong .env
- Frontend: Đổi port trong vite.config.js
- Kill process: `lsof -ti:5000 | xargs kill` (Mac/Linux)

### CORS errors
- Đảm bảo CORS_ORIGIN trong backend .env đúng với frontend URL

---

## Next Steps

1. ✅ Setup database và chạy seed data
2. ✅ Test API endpoints với Postman
3. ✅ Test frontend flow
4. ✅ Customize theo nhu cầu
5. ✅ Deploy production

