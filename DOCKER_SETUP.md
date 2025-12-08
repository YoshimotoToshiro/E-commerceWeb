# Hướng dẫn chạy Docker

## Bước 1: Tạo file .env

Tạo file `.env` ở thư mục root (cùng cấp với `docker-compose.yml`) với nội dung sau:

```env
# Database Configuration
DB_ROOT_PASSWORD=rootpassword123
DB_NAME=tech_store_db
DB_USER=tech_user
DB_PASSWORD=tech_password123

# Backend Configuration
NODE_ENV=development
DB_HOST=db
DB_PORT=3306
PORT=5000
JWT_SECRET=dev-secret-key-change-in-production-please-use-strong-secret
JWT_REFRESH_SECRET=dev-refresh-secret-key-change-in-production-please-use-strong-secret
CORS_ORIGIN=http://localhost:3000

# Frontend Configuration
FRONTEND_PORT=3000
BACKEND_PORT=5000
VITE_API_URL=http://backend:5000/api
```

**Lưu ý:** 
- Thay đổi các giá trị password và secret key trong production
- `DB_HOST=db` là tên service trong docker-compose, không đổi thành `localhost`
- `VITE_API_URL` đã trỏ tới `http://backend:5000/api` để frontend có thể gọi backend qua tên service Docker; nếu chạy frontend ngoài Docker thì đổi thành `http://localhost:5000/api`

## Bước 2: Chạy Docker

```bash
# Build và start tất cả services
docker-compose up -d --build

# Xem logs
docker-compose logs -f

# Xem logs của từng service
docker-compose logs -f backend
docker-compose logs -f db
docker-compose logs -f frontend

# Stop services
docker-compose down

# Stop và xóa volumes (xóa database)
docker-compose down -v
```

## Bước 3: Kiểm tra

1. **Database**: Kiểm tra container `tech_store_db` đang chạy
2. **Backend**: Truy cập http://localhost:5000/api/health
3. **Frontend**: Truy cập http://localhost:3000

## Troubleshooting

### Backend không kết nối được database
- Kiểm tra logs: `docker-compose logs backend`
- Đảm bảo database đã sẵn sàng: `docker-compose logs db`
- Kiểm tra file `.env` có đúng không

### Port đã được sử dụng
- Đổi port trong file `.env`:
  - `BACKEND_PORT=5001`
  - `FRONTEND_PORT=3001`
  - `DB_PORT=3308`

### Container tự động restart
- Xem logs để tìm lỗi: `docker-compose logs [service_name]`
- Kiểm tra file `.env` có đầy đủ biến môi trường không

### Database connection timeout
- Backend sẽ tự động retry 10 lần, mỗi lần cách nhau 5 giây
- Nếu vẫn lỗi, kiểm tra:
  - Database container đã chạy chưa
  - Healthcheck của database đã pass chưa
  - Thông tin kết nối trong `.env` có đúng không

## Các cải tiến đã thực hiện

1. ✅ Thêm retry logic cho database connection (10 lần, mỗi 5 giây)
2. ✅ Cải thiện healthcheck cho database (15 retries, 30s start period)
3. ✅ Thêm default values cho tất cả biến môi trường trong docker-compose
4. ✅ Hỗ trợ cả development và production mode
5. ✅ Cải thiện network configuration
6. ✅ Tăng timeout cho database connection (60s)
7. ✅ Backend listen trên 0.0.0.0 để có thể truy cập từ host

