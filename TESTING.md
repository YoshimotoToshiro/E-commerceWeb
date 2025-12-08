# 🧪 Testing Guide - Tech Store

## Test với Postman/Thunder Client

### 1. Auth Endpoints

#### Register
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "test",
  "email": "test@test.com",
  "password": "Test@123",
  "full_name": "Test User"
}
```

#### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@test.com",
  "password": "Test@123"
}

Response: {
  "success": true,
  "data": {
    "accessToken": "...",
    "user": {...}
  }
}
```

#### Get Current User (cần token)
```
GET http://localhost:5000/api/auth/me
Authorization: Bearer <your-access-token>
```

#### Refresh Token
```
POST http://localhost:5000/api/auth/refresh
```

#### Logout
```
POST http://localhost:5000/api/auth/logout
Authorization: Bearer <your-access-token>
```

### 2. Products (Public)

#### Get All Products
```
GET http://localhost:5000/api/products
GET http://localhost:5000/api/products?search=laptop&category=1&page=1&limit=12
```

#### Get Product by ID
```
GET http://localhost:5000/api/products/1
```

#### Get Categories
```
GET http://localhost:5000/api/products/categories
```

### 3. Cart (Protected - cần token)

#### Get Cart
```
GET http://localhost:5000/api/cart
Authorization: Bearer <your-access-token>
```

#### Add Item to Cart
```
POST http://localhost:5000/api/cart/items
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "product_id": 1,
  "variant_id": 1,
  "quantity": 2
}
```

#### Update Cart Item
```
PUT http://localhost:5000/api/cart/items/1
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Remove Cart Item
```
DELETE http://localhost:5000/api/cart/items/1
Authorization: Bearer <your-access-token>
```

### 4. Orders (Protected)

#### Create Order
```
POST http://localhost:5000/api/orders
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "shipping_address": "123 Đường ABC, Quận XYZ",
  "shipping_phone": "0123456789",
  "payment_method": "bank_transfer",
  "promotion_code": ""
}
```

#### Get Orders
```
GET http://localhost:5000/api/orders
GET http://localhost:5000/api/orders?status=pending
Authorization: Bearer <your-access-token>
```

#### Get Order by ID
```
GET http://localhost:5000/api/orders/1
Authorization: Bearer <your-access-token>
```

#### Update Order Status (Employee+)
```
PUT http://localhost:5000/api/orders/1/status
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "status": "confirmed",
  "notes": "Đã xác nhận đơn hàng"
}
```

### 5. Reviews

#### Get Product Reviews
```
GET http://localhost:5000/api/reviews/products/1
```

#### Create Review (User, đã mua)
```
POST http://localhost:5000/api/reviews
Authorization: Bearer <your-access-token>
Content-Type: application/json

{
  "product_id": 1,
  "order_id": 1,
  "rating": 5,
  "comment": "Sản phẩm rất tốt!"
}
```

### 6. Promotions

#### Get Promotions
```
GET http://localhost:5000/api/promotions
GET http://localhost:5000/api/promotions?active=true
```

#### Validate Promotion Code
```
POST http://localhost:5000/api/promotions/validate
Content-Type: application/json

{
  "code": "SALE2024",
  "orderValue": 1000000
}
```

### 7. Statistics (Manager+)

#### Get Revenue
```
GET http://localhost:5000/api/statistics/revenue?period=month
Authorization: Bearer <manager-token>
```

#### Get Order Stats
```
GET http://localhost:5000/api/statistics/orders
Authorization: Bearer <manager-token>
```

#### Get Top Selling Products
```
GET http://localhost:5000/api/statistics/products/top-selling?limit=10
Authorization: Bearer <manager-token>
```

#### Get Low Stock Products
```
GET http://localhost:5000/api/statistics/products/low-stock?threshold=10
Authorization: Bearer <manager-token>
```

#### Get Dashboard Summary
```
GET http://localhost:5000/api/statistics/dashboard
Authorization: Bearer <manager-token>
```

### 8. Users (Manager+/Admin)

#### Get All Users
```
GET http://localhost:5000/api/users?role=user&page=1&limit=20
Authorization: Bearer <manager-token>
```

#### Get User by ID
```
GET http://localhost:5000/api/users/1
Authorization: Bearer <token>
```

#### Update User
```
PUT http://localhost:5000/api/users/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "New Name",
  "phone": "0987654321"
}
```

#### Update User Role (Admin only)
```
PUT http://localhost:5000/api/users/1/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "manager"
}
```

#### Get System Logs (Admin only)
```
GET http://localhost:5000/api/users/logs?page=1&limit=50
Authorization: Bearer <admin-token>
```

---

## Test Frontend

1. Mở http://localhost:3000
2. Register account mới
3. Login → kiểm tra redirect dựa vào role
4. Test các chức năng:
   - Search sản phẩm
   - Add to cart
   - Checkout
   - View orders

---

## Common Issues & Solutions

### XAMPP - Can't connect MySQL
- Check MySQL đang chạy trong XAMPP
- Kiểm tra port: 3306
- User: root, Password: (trống)

### Docker - Database not ready
```bash
# Đợi MySQL khởi động xong (healthcheck)
docker-compose logs db

# Restart nếu cần
docker-compose restart backend
```

### Port đã được sử dụng
- XAMPP dùng 3306 → Docker dùng 3307
- Frontend: 3000
- Backend: 5000

### CORS Error
Đảm bảo backend đã cấu hình CORS:
```javascript
// backend/server.js
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

---

## Test Accounts (sau khi seed data)

- **Admin**: admin@techstore.com / Admin@123
- **Manager**: manager@techstore.com / Manager@123
- **User**: user@techstore.com / User@123

