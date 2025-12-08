-- Tech Store Database Schema
-- MySQL 8.0

CREATE DATABASE IF NOT EXISTS tech_store_db
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE tech_store_db;

-- Ensure current session uses UTF-8
SET NAMES 'utf8mb4';
SET CHARACTER SET utf8mb4;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role ENUM('user', 'employee', 'manager', 'admin') DEFAULT 'user',
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  category_id INT NOT NULL,
  supplier_id INT NOT NULL,
  brand VARCHAR(100),
  description TEXT,
  base_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  warranty_period INT COMMENT 'Thời gian bảo hành (tháng)',
  warranty_description TEXT,
  status ENUM('active', 'inactive', 'out_of_stock') DEFAULT 'active',
  is_featured BOOLEAN DEFAULT FALSE NOT NULL COMMENT 'Sản phẩm nổi bật',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);


-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product Variants Table
CREATE TABLE IF NOT EXISTS product_variants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  variant_name VARCHAR(100) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  stock_quantity INT DEFAULT 0,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  discount_type ENUM('percentage', 'fixed') NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  min_order_value DECIMAL(12, 2) DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  usage_limit INT COMMENT 'null = không giới hạn',
  used_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Carts Table
CREATE TABLE IF NOT EXISTS carts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  variant_id INT,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_code VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  employee_id INT,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(12, 2) DEFAULT 0,
  promotion_id INT,
  final_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  status ENUM('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_method ENUM('cash', 'bank_transfer', 'credit_card', 'e_wallet'),
  payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  shipping_phone VARCHAR(20) NOT NULL,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  delivery_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (employee_id) REFERENCES users(id),
  FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  variant_id INT,
  product_name VARCHAR(200) NOT NULL,
  variant_name VARCHAR(100),
  quantity INT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
);

-- Order Status History Table
CREATE TABLE IF NOT EXISTS order_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  status ENUM('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled') NOT NULL,
  updated_by INT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  order_id INT,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category ENUM('salary', 'rent', 'utilities', 'marketing', 'shipping', 'other') NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- System Logs Table
CREATE TABLE IF NOT EXISTS system_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(50),
  record_id INT,
  description TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Banners Table
CREATE TABLE IF NOT EXISTS banners (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  button_text VARCHAR(50) DEFAULT 'Xem sản phẩm',
  button_link VARCHAR(255) DEFAULT '/products',
  background_image VARCHAR(500),
  background_color VARCHAR(50) DEFAULT '#1E40AF',
  text_color VARCHAR(50) DEFAULT '#FFFFFF',
  position INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATETIME,
  end_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  `key` VARCHAR(100) PRIMARY KEY,
  `value` TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default settings
INSERT INTO system_settings (`key`, `value`) VALUES
('siteName', 'Tech Store'),
('supportEmail', 'support@example.com'),
('phone', '0123456789'),
('facebook', ''),
('instagram', ''),
('twitter', ''),
('maintenance', 'false')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_supplier ON products(supplier_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_system_logs_user ON system_logs(user_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_banners_active ON banners(is_active);
CREATE INDEX idx_banners_position ON banners(position);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert Users
-- Password: 123456 (bcrypt hash - tất cả user dùng chung password này)
-- Hash được tạo bằng: bcrypt.hashSync('123456', 10)
INSERT INTO users (username, email, password, full_name, phone, address, role, status) VALUES
('admin', 'admin@techstore.com', '$2a$10$k1w1D0lrBCz2ab2e/KtCN.81oxM8AB8L37gMPGO4mRvrXnJ60EcbC', 'Admin User', '0901234567', '123 Admin Street, Ho Chi Minh City', 'admin', 'active'),
('manager01', 'manager@techstore.com', '$2a$10$k1w1D0lrBCz2ab2e/KtCN.81oxM8AB8L37gMPGO4mRvrXnJ60EcbC', 'Manager User', '0901234568', '456 Manager Street, Ho Chi Minh City', 'manager', 'active'),
('employee01', 'employee@techstore.com', '$2a$10$k1w1D0lrBCz2ab2e/KtCN.81oxM8AB8L37gMPGO4mRvrXnJ60EcbC', 'Employee User', '0901234569', '789 Employee Street, Ho Chi Minh City', 'employee', 'active'),
('user01', 'user01@example.com', '$2a$10$k1w1D0lrBCz2ab2e/KtCN.81oxM8AB8L37gMPGO4mRvrXnJ60EcbC', 'Nguyen Van A', '0901111111', '100 User Street, Ho Chi Minh City', 'user', 'active'),
('user02', 'user02@example.com', '$2a$10$k1w1D0lrBCz2ab2e/KtCN.81oxM8AB8L37gMPGO4mRvrXnJ60EcbC', 'Tran Thi B', '0902222222', '200 User Street, Ha Noi', 'user', 'active'),
('user03', 'user03@example.com', '$2a$10$k1w1D0lrBCz2ab2e/KtCN.81oxM8AB8L37gMPGO4mRvrXnJ60EcbC', 'Le Van C', '0903333333', '300 User Street, Da Nang', 'user', 'active');

-- Insert Categories (chỉ 4 danh mục chính)
INSERT INTO categories (name, description, parent_id) VALUES
('Điện thoại', 'Điện thoại thông minh và phụ kiện', NULL),
('Laptop', 'Laptop và máy tính xách tay', NULL),
('Tablet', 'Máy tính bảng', NULL),
('Phụ kiện', 'Phụ kiện công nghệ', NULL);

-- Insert Suppliers
INSERT INTO suppliers (name, contact_person, email, phone, address, status) VALUES
('Apple Vietnam', 'John Smith', 'contact@apple.vn', '1900123456', 'Apple Store, Vincom Center, Ho Chi Minh City', 'active'),
('Samsung Vietnam', 'Park Ji-hoon', 'contact@samsung.vn', '1900123457', 'Samsung Store, Landmark 81, Ho Chi Minh City', 'active'),
('Xiaomi Vietnam', 'Li Wei', 'contact@xiaomi.vn', '1900123458', 'Xiaomi Store, Aeon Mall, Ho Chi Minh City', 'active'),
('ASUS Vietnam', 'Chen Ming', 'contact@asus.vn', '1900123459', 'ASUS Store, District 1, Ho Chi Minh City', 'active'),
('Dell Vietnam', 'Michael Brown', 'contact@dell.vn', '1900123460', 'Dell Store, District 3, Ho Chi Minh City', 'active'),
('HP Vietnam', 'David Wilson', 'contact@hp.vn', '1900123461', 'HP Store, District 7, Ho Chi Minh City', 'active'),
('Google Vietnam', 'Emily Nguyen', 'contact@googledevices.vn', '1900123462', 'Google Store, District 1, Ho Chi Minh City', 'active'),
('OPPO Vietnam', 'Tran Minh', 'support@oppo.vn', '1900123463', 'Oppo Experience Store, Nguyen Trai, Ho Chi Minh City', 'active'),
('OnePlus Vietnam', 'Pham Long', 'hello@oneplus.vn', '1900123464', 'OnePlus Hub, District 3, Ho Chi Minh City', 'active'),
('Vivo Vietnam', 'Le Tuan', 'contact@vivo.vn', '1900123465', 'Vivo Store, Bitexco, Ho Chi Minh City', 'active'),
('realme Vietnam', 'Nguyen Gia', 'support@realme.vn', '1900123466', 'Realme Brandshop, District 10, Ho Chi Minh City', 'active'),
('Honor Vietnam', 'Pham Duy', 'info@honor.vn', '1900123467', 'Honor Experience Store, Vincom Dong Khoi, Ho Chi Minh City', 'active'),
('Nothing Technology Vietnam', 'Chan Hoang', 'hello@nothing.vn', '1900123468', 'Nothing Pop-up, Crescent Mall, Ho Chi Minh City', 'active'),
('Motorola Vietnam', 'Vo Khanh', 'support@motorola.vn', '1900123469', 'Motorola Service Center, District 5, Ho Chi Minh City', 'active'),
('Sony Vietnam', 'Fujita Ken', 'contact@sony.vn', '1900123470', 'Sony Center Crescent Mall, Ho Chi Minh City', 'active'),
('Huawei Vietnam', 'Zhang Wei', 'support@huawei.vn', '1900123471', 'Huawei Experience Store, Saigon Centre, Ho Chi Minh City', 'active'),
('Lenovo Vietnam', 'Doan Phuc', 'lenovo@lenovo.vn', '1900123472', 'Lenovo Exclusive Store, District 1, Ho Chi Minh City', 'active'),
('Microsoft Vietnam', 'Pham Khoa', 'surface@microsoft.vn', '1900123473', 'Surface Hub, Nguyen Thi Minh Khai, Ho Chi Minh City', 'active'),
('Acer Vietnam', 'Lam Quoc', 'contact@acer.vn', '1900123474', 'Acer Concept Store, District 7, Ho Chi Minh City', 'active'),
('Razer Asia', 'Jason Tan', 'sea@razer.com', '1900123475', 'RazerStore, Funan Mall, Singapore', 'active'),
('Garmin Vietnam', 'Nguyen Loc', 'support@garmin.vn', '1900123476', 'Garmin Brand Store, District 1, Ho Chi Minh City', 'active'),
('Bose Vietnam', 'Tran Ly', 'info@bose.vn', '1900123477', 'Bose Store, District 3, Ho Chi Minh City', 'active'),
('Logitech Vietnam', 'Hoang Luong', 'hello@logitech.vn', '1900123478', 'Logitech Flagship Store, Crescent Mall, Ho Chi Minh City', 'active'),
('DJI Vietnam', 'Vu Ho', 'support@dji.vn', '1900123479', 'DJI Authorized Store, District 1, Ho Chi Minh City', 'active'),
('Anker Vietnam', 'Pham Ha', 'support@anker.vn', '1900123480', 'Anker Experience Store, District 3, Ho Chi Minh City', 'active');

-- Insert Products
INSERT INTO products (name, category_id, supplier_id, brand, description, base_price, discount_percent, warranty_period, warranty_description, status) VALUES
-- iPhone
('iPhone 15 Pro Max 256GB', 1, 1, 'Apple', 'iPhone 15 Pro Max với chip A17 Pro, camera 48MP, màn hình 6.7 inch Super Retina XDR, pin lên đến 29 giờ video. Thiết kế titan cao cấp, chống nước IP68.', 29990000, 5, 12, 'Bảo hành chính hãng 12 tháng, đổi mới 1 đổi 1 trong 15 ngày đầu', 'active'),
('iPhone 15 128GB', 1, 1, 'Apple', 'iPhone 15 với chip A16 Bionic, camera kép 48MP, màn hình 6.1 inch Super Retina XDR. Thiết kế nhôm cao cấp, chống nước IP68.', 21990000, 0, 12, 'Bảo hành chính hãng 12 tháng', 'active'),
('iPhone 14 Pro 256GB', 1, 1, 'Apple', 'iPhone 14 Pro với chip A16 Bionic, camera 48MP, Dynamic Island, màn hình 6.1 inch Super Retina XDR ProMotion.', 24990000, 10, 12, 'Bảo hành chính hãng 12 tháng', 'active'),

-- Samsung
('Samsung Galaxy S24 Ultra 256GB', 1, 2, 'Samsung', 'Galaxy S24 Ultra với chip Snapdragon 8 Gen 3, camera 200MP, bút S Pen, màn hình 6.8 inch Dynamic AMOLED 2X, pin 5000mAh.', 26990000, 8, 12, 'Bảo hành chính hãng 12 tháng, đổi mới 1 đổi 1 trong 30 ngày đầu', 'active'),
('Samsung Galaxy S23 128GB', 1, 2, 'Samsung', 'Galaxy S23 với chip Snapdragon 8 Gen 2, camera 50MP, màn hình 6.1 inch Dynamic AMOLED 2X, pin 3900mAh.', 17990000, 12, 12, 'Bảo hành chính hãng 12 tháng', 'active'),
('Samsung Galaxy Z Fold5 512GB', 1, 2, 'Samsung', 'Galaxy Z Fold5 màn hình gập, chip Snapdragon 8 Gen 2, camera 50MP, màn hình ngoài 6.2 inch, màn hình trong 7.6 inch.', 39990000, 5, 12, 'Bảo hành chính hãng 12 tháng, bảo hành màn hình gập 1 năm', 'active'),

-- Xiaomi
('Xiaomi 14 Pro 512GB', 1, 3, 'Xiaomi', 'Xiaomi 14 Pro với chip Snapdragon 8 Gen 3, camera Leica 50MP, màn hình 6.73 inch AMOLED 120Hz, pin 4880mAh sạc nhanh 120W.', 19990000, 10, 12, 'Bảo hành chính hãng 12 tháng', 'active'),
('Xiaomi Redmi Note 13 Pro 256GB', 1, 3, 'Xiaomi', 'Redmi Note 13 Pro với chip Snapdragon 7s Gen 2, camera 200MP, màn hình 6.67 inch AMOLED 120Hz, pin 5100mAh sạc nhanh 67W.', 7990000, 5, 12, 'Bảo hành chính hãng 12 tháng', 'active'),

-- Laptop Gaming
('ASUS ROG Strix G16 2024', 2, 4, 'ASUS', 'Laptop gaming ASUS ROG Strix G16 với CPU Intel Core i7-13650HX, GPU RTX 4060 8GB, RAM 16GB DDR5, SSD 512GB, màn hình 16 inch FHD 165Hz.', 29990000, 8, 24, 'Bảo hành chính hãng 24 tháng, hỗ trợ kỹ thuật 24/7', 'active'),
('Dell Alienware m16 R2', 2, 5, 'Dell', 'Laptop gaming Dell Alienware m16 với CPU Intel Core i9-14900HX, GPU RTX 4070 8GB, RAM 32GB DDR5, SSD 1TB, màn hình 16 inch QHD 240Hz.', 49990000, 5, 24, 'Bảo hành chính hãng 24 tháng, Premium Support', 'active'),

-- Laptop Office
('MacBook Pro 14 inch M3', 2, 1, 'Apple', 'MacBook Pro 14 inch với chip Apple M3, RAM 18GB, SSD 512GB, màn hình Liquid Retina XDR 14.2 inch, pin lên đến 22 giờ.', 42990000, 0, 12, 'Bảo hành chính hãng 12 tháng, AppleCare+ có sẵn', 'active'),
('Dell XPS 13 Plus', 2, 5, 'Dell', 'Laptop Dell XPS 13 Plus với CPU Intel Core i7-1360P, RAM 16GB LPDDR5, SSD 512GB, màn hình 13.4 inch OLED 4K Touch.', 32990000, 10, 12, 'Bảo hành chính hãng 12 tháng', 'active'),
('HP Spectre x360 14', 2, 6, 'HP', 'Laptop HP Spectre x360 14 với CPU Intel Core i7-1355U, RAM 16GB, SSD 1TB, màn hình 14 inch OLED Touch 2.8K, có thể xoay 360 độ.', 28990000, 12, 12, 'Bảo hành chính hãng 12 tháng', 'active'),

-- Tablet
('iPad Pro 12.9 inch M2 256GB', 3, 1, 'Apple', 'iPad Pro 12.9 inch với chip Apple M2, màn hình Liquid Retina XDR 12.9 inch, hỗ trợ Apple Pencil và Magic Keyboard.', 29990000, 5, 12, 'Bảo hành chính hãng 12 tháng', 'active'),
('iPad Air 11 inch M2 256GB', 3, 1, 'Apple', 'iPad Air 11 inch với chip Apple M2, màn hình Liquid Retina 11 inch, hỗ trợ Apple Pencil 2.', 18990000, 8, 12, 'Bảo hành chính hãng 12 tháng', 'active'),
('Samsung Galaxy Tab S9 Ultra', 3, 2, 'Samsung', 'Galaxy Tab S9 Ultra với chip Snapdragon 8 Gen 2, màn hình 14.6 inch Dynamic AMOLED 2X, bút S Pen, pin 11200mAh.', 24990000, 10, 12, 'Bảo hành chính hãng 12 tháng', 'active'),

-- Phụ kiện - Tai nghe
('AirPods Pro 2 (USB-C)', 4, 1, 'Apple', 'Tai nghe AirPods Pro 2 với chip H2, chống ồn chủ động, không gian âm thanh cá nhân hóa, chống nước IPX4.', 6990000, 0, 12, 'Bảo hành chính hãng 12 tháng', 'active'),
('Samsung Galaxy Buds2 Pro', 4, 2, 'Samsung', 'Tai nghe Samsung Galaxy Buds2 Pro với chống ồn chủ động, chất lượng âm thanh 24-bit, pin 8 giờ + hộp 20 giờ.', 3990000, 15, 12, 'Bảo hành chính hãng 12 tháng', 'active'),
('Sony WH-1000XM5', 4, 3, 'Sony', 'Tai nghe chụp tai Sony WH-1000XM5 với chống ồn tốt nhất, pin 30 giờ, sạc nhanh 3 phút = 3 giờ nghe.', 8990000, 10, 12, 'Bảo hành chính hãng 12 tháng', 'active'),

-- Phụ kiện - Sạc dự phòng
('Anker PowerCore 20000mAh', 4, 3, 'Anker', 'Pin sạc dự phòng Anker PowerCore 20000mAh, sạc nhanh 20W, 2 cổng USB-A, 1 cổng USB-C, thiết kế nhỏ gọn.', 1290000, 5, 12, 'Bảo hành 18 tháng', 'active'),
('Xiaomi Mi Power Bank 3 20000mAh', 4, 3, 'Xiaomi', 'Pin sạc dự phòng Xiaomi Mi Power Bank 3 20000mAh, sạc nhanh 18W, 2 cổng USB-A, 1 cổng USB-C.', 899000, 10, 12, 'Bảo hành 12 tháng', 'active'),

-- Phụ kiện - Ốp lưng
('Apple MagSafe Case iPhone 15 Pro', 4, 1, 'Apple', 'Ốp lưng chính hãng Apple MagSafe cho iPhone 15 Pro, hỗ trợ sạc không dây MagSafe, bảo vệ toàn diện.', 1990000, 0, 0, 'Không bảo hành', 'active'),
('Samsung Clear Standing Cover Galaxy S24', 4, 2, 'Samsung', 'Ốp lưng trong suốt Samsung Clear Standing Cover cho Galaxy S24, có thể đứng được, bảo vệ camera.', 890000, 10, 0, 'Không bảo hành', 'active'),

-- Smartphone mở rộng
('Google Pixel 8 Pro 256GB', 1, 7, 'Google', 'Pixel 8 Pro với chip Google Tensor G3, camera 50MP, công nghệ Magic Eraser và màn hình LTPO 120Hz 6.7 inch.', 25990000, 5, 12, 'Bảo hành chính hãng Google 12 tháng', 'active'),
('Google Pixel 8 128GB', 1, 7, 'Google', 'Pixel 8 sở hữu màn hình 6.2 inch Actua Display, camera 50MP và AI Pixel giúp xử lý ảnh, bảo mật Titan M2.', 19990000, 5, 12, 'Bảo hành chính hãng Google 12 tháng', 'active'),
('Samsung Galaxy S24+ 512GB', 1, 2, 'Samsung', 'Galaxy S24+ với Snapdragon 8 Gen 3 for Galaxy, màn hình QHD+ 6.7 inch, pin 4900mAh và Galaxy AI mới nhất.', 24990000, 8, 12, 'Bảo hành chính hãng Samsung 12 tháng', 'active'),
('Samsung Galaxy Z Flip5 512GB', 1, 2, 'Samsung', 'Galaxy Z Flip5 với bản lề Flex Hinge siêu bền, màn hình Flex Window 3.4 inch và camera góc rộng 12MP.', 27990000, 7, 12, 'Bảo hành chính hãng Samsung 12 tháng, hỗ trợ thay màn hình gập 1 năm', 'active'),
('OPPO Find X7 Ultra', 1, 8, 'OPPO', 'Find X7 Ultra trang bị cụm camera Hasselblad 1-inch kép, chip Snapdragon 8 Gen 3 và sạc SuperVOOC 100W.', 23990000, 6, 12, 'Bảo hành chính hãng OPPO 12 tháng', 'active'),
('OnePlus 12 16GB/512GB', 1, 9, 'OnePlus', 'OnePlus 12 với màn hình ProXDR 120Hz, chip Snapdragon 8 Gen 3 và hệ thống sạc SUPERVOOC 100W.', 20990000, 5, 12, 'Bảo hành chính hãng OnePlus 12 tháng', 'active'),
('vivo X100 Pro 16GB/512GB', 1, 10, 'vivo', 'vivo X100 Pro hợp tác Zeiss, cảm biến 1 inch, chip Dimensity 9300 và pin 5400mAh sạc nhanh 120W.', 22990000, 5, 12, 'Bảo hành chính hãng vivo 12 tháng', 'active'),
('realme GT5 Pro 16GB/512GB', 1, 11, 'realme', 'realme GT5 Pro với viền siêu mỏng, chip Snapdragon 8 Gen 3, camera tele 3x và sạc SuperVOOC 100W.', 18990000, 6, 12, 'Bảo hành chính hãng realme 12 tháng', 'active'),
('Honor Magic6 Pro 12GB/512GB', 1, 12, 'Honor', 'Honor Magic6 Pro trang bị camera Falcon Capture 180MP, chip Snapdragon 8 Gen 3 và pin silicon-carbon 5600mAh.', 21990000, 7, 12, 'Bảo hành chính hãng Honor 12 tháng', 'active'),
('Nothing Phone (2) 12GB/512GB', 1, 13, 'Nothing', 'Nothing Phone (2) với thiết kế Glyph nâng cấp, Snapdragon 8+ Gen 1, màn hình 6.7 inch 120Hz và Nothing OS 2.0.', 16990000, 4, 12, 'Bảo hành chính hãng Nothing 12 tháng', 'active'),
('Motorola Razr 40 Ultra', 1, 14, 'Motorola', 'Razr 40 Ultra sở hữu màn hình ngoài 3.6 inch 144Hz, bản lề giọt nước bền bỉ và thân máy phủ kính Gorilla Victus.', 24990000, 10, 12, 'Bảo hành chính hãng Motorola 12 tháng', 'active'),
('Sony Xperia 1 V', 1, 15, 'Sony', 'Xperia 1 V với cảm biến Exmor T mới, màn hình 4K OLED 21:9 và phím chụp ảnh chuyên nghiệp.', 29990000, 8, 12, 'Bảo hành chính hãng Sony 12 tháng', 'active'),
('ASUS ROG Phone 8 Pro 24GB/1TB', 1, 4, 'ASUS', 'ROG Phone 8 Pro với Snapdragon 8 Gen 3, tản nhiệt AeroActive và chế độ X Mode tối ưu chơi game.', 34990000, 5, 24, 'Bảo hành chính hãng ASUS 24 tháng', 'active'),
('Xiaomi 13T Pro 12GB/512GB', 1, 3, 'Xiaomi', 'Xiaomi 13T Pro camera Leica Summicron, Dimensity 9200+, sạc HyperCharge 120W và màn hình 144Hz.', 15990000, 10, 12, 'Bảo hành chính hãng Xiaomi 12 tháng', 'active'),
('Huawei Mate 60 Pro 12GB/512GB', 1, 16, 'Huawei', 'Mate 60 Pro với thiết kế Clous de Paris, camera XMAGE 48MP, màn hình LTPO 120Hz và hỗ trợ vệ tinh.', 27990000, 5, 12, 'Bảo hành chính hãng Huawei 12 tháng', 'active'),

-- Laptop mở rộng
('MacBook Air 15 inch M3 512GB', 2, 1, 'Apple', 'MacBook Air 15 inch M3 với màn hình Liquid Retina, thời lượng pin 18 giờ và thiết kế siêu mỏng 11.5mm.', 37990000, 3, 12, 'Bảo hành chính hãng Apple 12 tháng', 'active'),
('MacBook Pro 16 inch M3 Max 1TB', 2, 1, 'Apple', 'MacBook Pro 16 inch dùng chip M3 Max 16-core CPU, GPU 40-core, màn hình XDR và pin 22 giờ.', 76990000, 2, 12, 'Bảo hành chính hãng Apple 12 tháng (hỗ trợ AppleCare+)', 'active'),
('Lenovo Yoga 9i 14 Gen 9', 2, 17, 'Lenovo', 'Yoga 9i Gen 9 với bản lề Sound Bar, màn hình OLED 2.8K cảm ứng và Intel Core Ultra 7.', 42990000, 7, 24, 'Bảo hành chính hãng Lenovo Premium Care 24 tháng', 'active'),
('Lenovo Legion 9i 16 2024', 2, 17, 'Lenovo', 'Legion 9i 16 trang bị làm mát chất lỏng, GPU RTX 4090 16GB và mini-LED 3.2K 165Hz.', 79990000, 5, 24, 'Bảo hành chính hãng Lenovo Legion Ultimate 24 tháng', 'active'),
('Microsoft Surface Laptop Studio 2', 2, 18, 'Microsoft', 'Surface Laptop Studio 2 với bản lề Dynamic Woven, GPU RTX 4060 và màn hình PixelSense Flow 120Hz.', 69990000, 6, 24, 'Bảo hành chính hãng Microsoft 24 tháng', 'active'),
('HP Envy 16 2024', 2, 6, 'HP', 'HP Envy 16 màn hình 16 inch 120Hz, CPU Intel Core Ultra và GPU RTX 4060 dành cho sáng tạo.', 36990000, 8, 24, 'Bảo hành chính hãng HP 24 tháng, hỗ trợ onsite', 'active'),
('Dell XPS 14 9440', 2, 5, 'Dell', 'Dell XPS 14 viền siêu mỏng, màn hình 3.2K OLED, CPU Intel Core Ultra 7 và RTX 4050.', 45990000, 5, 24, 'Bảo hành chính hãng Dell Premium Support 24 tháng', 'active'),
('ASUS Zenbook 14 OLED UX3405', 2, 4, 'ASUS', 'Zenbook 14 OLED UX3405 nhẹ 1.2kg, OLED 3K 120Hz và pin 75Wh cho 16 giờ sử dụng.', 32990000, 9, 24, 'Bảo hành chính hãng ASUS 24 tháng', 'active'),
('Acer Swift X 16 2024', 2, 19, 'Acer', 'Swift X 16 sử dụng Ryzen 9 7940HS, GPU RTX 4050 và màn hình OLED 3.2K 120Hz.', 28990000, 10, 24, 'Bảo hành chính hãng Acer 24 tháng', 'active'),
('Razer Blade 16 (2024)', 2, 20, 'Razer', 'Razer Blade 16 khung CNC, mini-LED dual-mode 240Hz/120Hz và RTX 4090 16GB.', 84990000, 4, 24, 'Bảo hành chính hãng Razer 24 tháng', 'active'),

-- Tablet mở rộng
('iPad Pro 11 inch M4 Wi-Fi 512GB', 3, 1, 'Apple', 'iPad Pro 11 inch M4 với màn hình Tandem OLED, Apple Pencil Pro và chip M4 mạnh mẽ.', 36990000, 3, 12, 'Bảo hành chính hãng Apple 12 tháng', 'active'),
('Samsung Galaxy Tab S9 FE+ 5G', 3, 2, 'Samsung', 'Galaxy Tab S9 FE+ màn hình 12.4 inch 90Hz, kháng nước IP68 và bút S Pen đi kèm.', 15990000, 12, 12, 'Bảo hành chính hãng Samsung 12 tháng', 'active'),
('Xiaomi Pad 6 Pro 512GB', 3, 3, 'Xiaomi', 'Xiaomi Pad 6 Pro với Snapdragon 8+ Gen 1, màn hình 144Hz 11 inch và pin kép 8600mAh.', 12990000, 8, 12, 'Bảo hành chính hãng Xiaomi 12 tháng', 'active'),
('Lenovo Tab Extreme', 3, 17, 'Lenovo', 'Lenovo Tab Extreme 14.5 inch OLED 3K, chip Dimensity 9000 và bàn phím từ đi kèm.', 24990000, 10, 24, 'Bảo hành chính hãng Lenovo 24 tháng', 'active'),
('Huawei MatePad Pro 13.2', 3, 16, 'Huawei', 'MatePad Pro 13.2 màn hình OLED 144Hz cực mỏng 5.5mm, hỗ trợ M-Pencil thế hệ 3.', 28990000, 7, 12, 'Bảo hành chính hãng Huawei 12 tháng', 'active'),

-- Phụ kiện & thiết bị đeo mở rộng
('Apple Watch Series 9 GPS 45mm', 4, 1, 'Apple', 'Apple Watch Series 9 với chip S9 SiP, cử chỉ Double Tap và theo dõi sức khỏe toàn diện.', 11990000, 5, 12, 'Bảo hành chính hãng Apple 12 tháng', 'active'),
('Samsung Galaxy Watch6 Classic LTE 47mm', 4, 2, 'Samsung', 'Galaxy Watch6 Classic khung thép, bezel xoay vật lý và đo huyết áp, ECG tại chỗ.', 10990000, 8, 12, 'Bảo hành chính hãng Samsung 12 tháng', 'active'),
('Garmin Fenix 7 Pro Sapphire Solar', 4, 21, 'Garmin', 'Fenix 7 Pro Sapphire Solar với kính Power Sapphire, pin đến 22 ngày và hàng trăm chế độ thể thao.', 19990000, 5, 24, 'Bảo hành chính hãng Garmin 24 tháng', 'active'),
('Sony WF-1000XM5', 4, 15, 'Sony', 'Tai nghe True Wireless Sony WF-1000XM5 chống ồn HD QN2e, driver Dynamic Driver X và pin 8 giờ.', 6490000, 7, 12, 'Bảo hành chính hãng Sony 12 tháng', 'active'),
('Bose QuietComfort Ultra Headphones', 4, 22, 'Bose', 'Bose QuietComfort Ultra với Immersive Audio, ANC chủ động và thiết kế sang trọng.', 8990000, 6, 12, 'Bảo hành chính hãng Bose 12 tháng', 'active'),
('Logitech MX Master 3S', 4, 23, 'Logitech', 'Chuột Logitech MX Master 3S cảm biến 8K DPI, cuộn MagSpeed và kết nối đa thiết bị.', 2490000, 5, 12, 'Bảo hành chính hãng Logitech 12 tháng', 'active'),
('DJI Osmo Mobile 6', 4, 24, 'DJI', 'Gimbal DJI Osmo Mobile 6 với ActiveTrack 6.0, cần kéo và bảng điều khiển tích hợp.', 3890000, 5, 12, 'Bảo hành chính hãng DJI 12 tháng', 'active'),
('Anker 737 Power Bank (PowerCore 24K)', 4, 25, 'Anker', 'Pin dự phòng Anker 737 công suất 140W, màn hình thông minh và pin 24.000mAh.', 4490000, 10, 18, 'Bảo hành chính hãng Anker 18 tháng', 'active'),
('Razer Basilisk V3 Pro', 4, 20, 'Razer', 'Chuột Razer Basilisk V3 Pro 30K DPI Focus Pro, Hyperspeed Wireless và 13 vùng LED.', 3990000, 6, 12, 'Bảo hành chính hãng Razer 12 tháng', 'active'),
('Sony PlayStation 5 Slim (Phiên bản ổ đĩa)', 4, 15, 'Sony', 'PlayStation 5 Slim với SSD 1TB, hỗ trợ ray tracing và tay cầm DualSense cải tiến.', 14990000, 8, 12, 'Bảo hành chính hãng Sony 12 tháng', 'active');

-- Insert Product Images (Hình ảnh thật - sử dụng URL từ các nguồn uy tín)
-- Lưu ý: Bạn có thể thay thế bằng đường dẫn local: /images/products/iphone-15-pro-max-1.jpg
-- Hoặc tải hình ảnh về và lưu trong thư mục public/images/products/
-- Khuyến nghị: Xóa dữ liệu cũ trước khi nạp lại để tránh trùng lặp
-- TRUNCATE TABLE product_images;

INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
-- 1. iPhone 15 Pro Max
(1, 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-1.jpg', TRUE, 1),

-- 2. iPhone 15
(2, 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-1.jpg', TRUE, 1),

-- 3. iPhone 14 Pro
(3, 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-pro-3.jpg', TRUE, 1),

-- 4. Samsung Galaxy S24 Ultra (Sửa lỗi ảnh)
(4, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-5g-1.jpg', TRUE, 1),

-- 5. Samsung Galaxy S23
(5, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s23-5g-1.jpg', TRUE, 1),

-- 6. Samsung Galaxy Z Fold5 (Sửa lỗi ảnh)
(6, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-z-fold5-1.jpg', TRUE, 1),

-- 7. Xiaomi 14 Pro
(7, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-pro-1.jpg', TRUE, 1),

-- 8. Xiaomi Redmi Note 13 Pro
(8, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-1.jpg', TRUE, 1),

-- 9. ASUS ROG Strix G16 2024 (Thay bằng link Amazon ổn định)
(9, 'https://m.media-amazon.com/images/I/715M7X82rHL._AC_SL1500_.jpg', TRUE, 1),

-- 10. Dell Alienware m16 R2 (Thay bằng link Amazon ổn định)
(10, 'https://m.media-amazon.com/images/I/71F1wV+z1oL._AC_SL1500_.jpg', TRUE, 1),

-- 11. MacBook Pro 14 (M3)
(11, 'https://fdn2.gsmarena.com/vv/pics/apple/apple-macbook-pro-14-2023-1.jpg', TRUE, 1),

-- 12. Dell XPS 13 Plus (Sửa lỗi ảnh)
(12, 'https://m.media-amazon.com/images/I/71W690s2BLL._AC_SL1500_.jpg', TRUE, 1),

-- 13. HP Spectre x360 14
(13, 'https://m.media-amazon.com/images/I/610tL-x+T+L._AC_SL1000_.jpg', TRUE, 1),

-- 14. iPad Pro 12.9
(14, 'https://fdn2.gsmarena.com/vv/pics/apple/apple-ipad-pro-129-2022-1.jpg', TRUE, 1),

-- 15. iPad Air 11
(15, 'https://fdn2.gsmarena.com/vv/pics/apple/apple-ipad-air-2022-1.jpg', TRUE, 1),

-- 16. Samsung Galaxy Tab S9 Ultra (Sửa lỗi ảnh)
(16, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-tab-s9-ultra-1.jpg', TRUE, 1),

-- 17. AirPods Pro 2
(17, 'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg', TRUE, 1),

-- 18. Samsung Galaxy Buds2 Pro (Sửa lỗi ảnh)
(18, 'https://m.media-amazon.com/images/I/61Qqg+T8HSL._AC_SL1500_.jpg', TRUE, 1),

-- 19. Sony WH-1000XM5 (Sửa lỗi ảnh)
(19, 'https://m.media-amazon.com/images/I/51SKmu2G9FL._AC_SL1000_.jpg', TRUE, 1),

-- 20. Anker PowerCore 20000mAh (Sửa lỗi ảnh)
(20, 'https://m.media-amazon.com/images/I/71R60Q2j33L._AC_SL1500_.jpg', TRUE, 1),

-- 21. Xiaomi Mi Power Bank 3 (Sửa lỗi ảnh)
(21, 'https://m.media-amazon.com/images/I/51w+3+z+XlL._AC_SL1000_.jpg', TRUE, 1),

-- 22. Apple MagSafe Case iPhone 15 Pro (Sửa lỗi ảnh)
(22, 'https://m.media-amazon.com/images/I/41c4N5-yXNL._AC_SL1000_.jpg', TRUE, 1),

-- 23. Samsung Clear Standing Cover (Sửa lỗi ảnh)
(23, 'https://m.media-amazon.com/images/I/61s+i-W1LGL._AC_SL1500_.jpg', TRUE, 1),

-- 24. Google Pixel 8 Pro
(24, 'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8-pro-1.jpg', TRUE, 1),

-- 25. Google Pixel 8
(25, 'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8-1.jpg', TRUE, 1),

-- 26. Samsung Galaxy S24+ (Sửa lỗi ảnh)
(26, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-plus-5g-1.jpg', TRUE, 1),

-- 27. Samsung Galaxy Z Flip5 (Sửa lỗi ảnh)
(27, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-z-flip5-1.jpg', TRUE, 1),

-- 28. OPPO Find X7 Ultra
(28, 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-find-x7-ultra-1.jpg', TRUE, 1),

-- 29. OnePlus 12
(29, 'https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-12-1.jpg', TRUE, 1),

-- 30. vivo X100 Pro (Sửa lỗi ảnh)
(30, 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-x100-pro-white-1.jpg', TRUE, 1),

-- 31. realme GT5 Pro
(31, 'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt5-pro-1.jpg', TRUE, 1),

-- 32. Honor Magic6 Pro
(32, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-magic6-pro-1.jpg', TRUE, 1),

-- 33. Nothing Phone (2)
(33, 'https://fdn2.gsmarena.com/vv/pics/nothing/nothing-phone2-1.jpg', TRUE, 1),

-- 34. Motorola Razr 40 Ultra (Sửa lỗi ảnh)
(34, 'https://fdn2.gsmarena.com/vv/pics/motorola/motorola-razr40-ultra-1.jpg', TRUE, 1),

-- 35. Sony Xperia 1 V
(35, 'https://fdn2.gsmarena.com/vv/pics/sony/sony-xperia-1-v-1.jpg', TRUE, 1),

-- 36. ASUS ROG Phone 8 Pro (Sửa lỗi ảnh)
(36, 'https://fdn2.gsmarena.com/vv/pics/asus/asus-rog-phone-8-pro-1.jpg', TRUE, 1),

-- 37. Xiaomi 13T Pro
(37, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-13t-pro-1.jpg', TRUE, 1),

-- 38. Huawei Mate 60 Pro (Sửa lỗi ảnh)
(38, 'https://fdn2.gsmarena.com/vv/pics/huawei/huawei-mate-60-pro-1.jpg', TRUE, 1),

-- 39. MacBook Air 15 M3 (Sửa lỗi ảnh)
(39, 'https://m.media-amazon.com/images/I/719C6bJv8jL._AC_SL1500_.jpg', TRUE, 1),

-- 40. MacBook Pro 16 M3 Max
(40, 'https://m.media-amazon.com/images/I/618d5bS2lUL._AC_SL1500_.jpg', TRUE, 1),

-- 41. Lenovo Yoga 9i 14 Gen 9 (Sửa lỗi ảnh - Dùng link Amazon)
(41, 'https://m.media-amazon.com/images/I/71Y+2jHqJBL._AC_SL1500_.jpg', TRUE, 1),

-- 42. Lenovo Legion 9i 16 2024 (Sửa lỗi ảnh - Dùng link review/retail)
(42, 'https://m.media-amazon.com/images/I/71S-vU3O9LL._AC_SL1500_.jpg', TRUE, 1),

-- 43. Microsoft Surface Laptop Studio 2 (Sửa lỗi ảnh)
(43, 'https://m.media-amazon.com/images/I/61U+lS1-dJL._AC_SL1200_.jpg', TRUE, 1),

-- 44. HP Envy 16 2024 (Sửa lỗi ảnh)
(44, 'https://m.media-amazon.com/images/I/71c3qF7+nEL._AC_SL1500_.jpg', TRUE, 1),

-- 45. Dell XPS 14 9440 (Sửa lỗi ảnh)
(45, 'https://m.media-amazon.com/images/I/71h3+v-tW+L._AC_SL1500_.jpg', TRUE, 1),

-- 46. ASUS Zenbook 14 OLED UX3405 (Sửa lỗi ảnh)
(46, 'https://m.media-amazon.com/images/I/71c+g0XmHdL._AC_SL1500_.jpg', TRUE, 1),

-- 47. Acer Swift X 16 2024 (Sửa lỗi ảnh)
(47, 'https://m.media-amazon.com/images/I/71XmXQ-i+hL._AC_SL1500_.jpg', TRUE, 1),

-- 48. Razer Blade 16 2024 (Sửa lỗi ảnh)
(48, 'https://m.media-amazon.com/images/I/71g-uYl32XL._AC_SL1500_.jpg', TRUE, 1),

-- 49. iPad Pro 11 M4
(49, 'https://m.media-amazon.com/images/I/61s1Dk2iYCL._AC_SL1500_.jpg', TRUE, 1),

-- 50. Galaxy Tab S9 FE+
(50, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-tab-s9-fe-plus-1.jpg', TRUE, 1),

-- 51. Xiaomi Pad 6 Pro
(51, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-pad-6-pro-1.jpg', TRUE, 1),

-- 52. Lenovo Tab Extreme
(52, 'https://fdn2.gsmarena.com/vv/pics/lenovo/lenovo-tab-extreme-1.jpg', TRUE, 1),

-- 53. Huawei MatePad Pro 13.2
(53, 'https://fdn2.gsmarena.com/vv/pics/huawei/huawei-matepad-pro-132-1.jpg', TRUE, 1),

-- 54. Apple Watch Series 9
(54, 'https://m.media-amazon.com/images/I/71XMTLtZd5L._AC_SL1500_.jpg', TRUE, 1),

-- 55. Galaxy Watch6 Classic
(55, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-watch6-classic-1.jpg', TRUE, 1),

-- 56. Garmin Fenix 7 Pro Sapphire Solar (Sửa lỗi ảnh)
(56, 'https://m.media-amazon.com/images/I/71Iq6jXo7PL._AC_SL1500_.jpg', TRUE, 1),

-- 57. Sony WF-1000XM5 (Sửa lỗi ảnh)
(57, 'https://m.media-amazon.com/images/I/51PL3qLr2WL._AC_SL1200_.jpg', TRUE, 1),

-- 58. Bose QuietComfort Ultra Headphones (Sửa lỗi ảnh)
(58, 'https://m.media-amazon.com/images/I/51n8XN6j9HL._AC_SL1000_.jpg', TRUE, 1),

-- 59. Logitech MX Master 3S (Sửa lỗi ảnh)
(59, 'https://m.media-amazon.com/images/I/61ni3t1ryQL._AC_SL1500_.jpg', TRUE, 1),

-- 60. DJI Osmo Mobile 6 (Sửa lỗi ảnh)
(60, 'https://m.media-amazon.com/images/I/61bWcC-yv+L._AC_SL1500_.jpg', TRUE, 1),

-- 61. Anker 737 Power Bank (Sửa lỗi ảnh)
(61, 'https://m.media-amazon.com/images/I/61F1W1DZcHL._AC_SL1500_.jpg', TRUE, 1),

-- 62. Razer Basilisk V3 Pro (Sửa lỗi ảnh)
(62, 'https://m.media-amazon.com/images/I/61Uq9j1iEEL._AC_SL1500_.jpg', TRUE, 1),

-- 63. Sony PlayStation 5 Slim (Phiên bản ổ đĩa - Sửa lỗi ảnh)
(63, 'https://m.media-amazon.com/images/I/51eO-j88XhL._AC_SL1000_.jpg', TRUE, 1);
-- Insert Product Variants
INSERT INTO product_variants 
(product_id, variant_name, sku, stock_quantity, price_adjustment, status) 
VALUES
-- iPhone 15 Pro Max - Màu sắc
(1, 'Titan tự nhiên', 'IP15PM-256-TN', 50, 0, 'active'),
(1, 'Titan xanh', 'IP15PM-256-TB', 30, 0, 'active'),
(1, 'Titan trắng', 'IP15PM-256-TT', 40, 0, 'active'),
(1, 'Titan đen', 'IP15PM-256-TD', 45, 0, 'active'),

-- iPhone 15 - Màu sắc
(2, 'Xanh dương', 'IP15-128-XD', 100, 0, 'active'),
(2, 'Hồng', 'IP15-128-H', 80, 0, 'active'),
(2, 'Vàng', 'IP15-128-V', 90, 0, 'active'),
(2, 'Xanh lá', 'IP15-128-XL', 85, 0, 'active'),
(2, 'Đen', 'IP15-128-D', 95, 0, 'active'),

-- Samsung Galaxy S24 Ultra - Dung lượng
(4, '256GB - Đen', 'S24U-256-D', 60, 0, 'active'),
(4, '256GB - Tím', 'S24U-256-T', 50, 0, 'active'),
(4, '512GB - Đen', 'S24U-512-D', 40, 5000000, 'active'),
(4, '512GB - Tím', 'S24U-512-T', 35, 5000000, 'active'),

-- Laptop - RAM/SSD
(9, '16GB/512GB', 'ROG-G16-16-512', 25, 0, 'active'),
(9, '32GB/1TB', 'ROG-G16-32-1T', 15, 5000000, 'active'),
(11, '18GB/512GB', 'MBP14-M3-18-512', 30, 0, 'active'),
(11, '18GB/1TB', 'MBP14-M3-18-1T', 20, 5000000, 'active'),

-- iPad Pro - Dung lượng
(14, '256GB - WiFi', 'IPADP-12.9-256-W', 40, 0, 'active'),
(14, '512GB - WiFi', 'IPADP-12.9-512-W', 25, 5000000, 'active'),
(14, '256GB - 5G', 'IPADP-12.9-256-5G', 30, 3000000, 'active');

-- Insert Promotions
INSERT INTO promotions (code, name, discount_type, discount_value, min_order_value, start_date, end_date, usage_limit, used_count) VALUES
('WELCOME10', 'Giảm 10% cho khách hàng mới', 'percentage', 10, 1000000, '2024-01-01', '2024-12-31', 1000, 0),
('SALE20', 'Giảm 20% đơn hàng trên 5 triệu', 'percentage', 20, 5000000, '2024-01-01', '2024-12-31', NULL, 0),
('FIXED50K', 'Giảm 50.000đ cho đơn hàng trên 2 triệu', 'fixed', 50000, 2000000, '2024-01-01', '2024-12-31', 5000, 0),
('BLACKFRIDAY', 'Giảm 30% Black Friday', 'percentage', 30, 3000000, '2024-11-20', '2024-11-30', NULL, 0),
('NEWYEAR2025', 'Giảm 15% năm mới 2025', 'percentage', 15, 1000000, '2024-12-25', '2025-01-15', 2000, 0);

-- Insert Carts for users
INSERT INTO carts (user_id) VALUES
(4), (5), (6);

-- Insert Cart Items
INSERT INTO cart_items (cart_id, product_id, variant_id, quantity) VALUES
(1, 2, 5, 1),  -- user01: iPhone 15 xanh dương (variant_id=5)
(1, 17, NULL, 1),  -- user01: AirPods Pro 2 (không có variant)
(2, 4, 10, 1),  -- user02: Samsung S24 Ultra 256GB đen (variant_id=10)
(2, 18, NULL, 1),  -- user02: Galaxy Buds2 Pro (không có variant)
(3, 11, 16, 1);  -- user03: MacBook Pro 14 18GB/512GB (variant_id=16)

-- Insert Orders (một số đơn hàng mẫu)
INSERT INTO orders (order_code, user_id, employee_id, total_amount, discount_amount, promotion_id, final_amount, status, payment_method, payment_status, shipping_address, shipping_phone, order_date) VALUES
('ORD001', 4, 3, 28990000, 2899000, 1, 26091000, 'delivered', 'bank_transfer', 'paid', '100 User Street, Ho Chi Minh City', '0901111111', '2024-01-15 10:30:00'),
('ORD002', 5, 3, 30980000, 0, NULL, 30980000, 'shipping', 'credit_card', 'paid', '200 User Street, Ha Noi', '0902222222', '2024-01-20 14:20:00'),
('ORD003', 6, NULL, 42990000, 0, NULL, 42990000, 'pending', 'cash', 'pending', '300 User Street, Da Nang', '0903333333', '2024-01-25 09:15:00');

-- Insert Order Items
INSERT INTO order_items (order_id, product_id, variant_id, product_name, variant_name, quantity, unit_price, subtotal) VALUES
(1, 2, 5, 'iPhone 15 128GB', 'Xanh dương', 1, 21990000, 21990000),
(1, 17, NULL, 'AirPods Pro 2 (USB-C)', NULL, 1, 6990000, 6990000),
(2, 4, 10, 'Samsung Galaxy S24 Ultra 256GB', '256GB - Đen', 1, 26990000, 26990000),
(2, 18, NULL, 'Samsung Galaxy Buds2 Pro', NULL, 1, 3990000, 3990000),
(3, 11, 16, 'MacBook Pro 14 inch M3', '18GB/512GB', 1, 42990000, 42990000);

-- Insert Order Status History
INSERT INTO order_status_history (order_id, status, updated_by, notes) VALUES
(1, 'pending', NULL, 'Đơn hàng được tạo'),
(1, 'confirmed', 3, 'Nhân viên xác nhận đơn hàng'),
(1, 'processing', 3, 'Đang chuẩn bị hàng'),
(1, 'shipping', 3, 'Đã giao cho đơn vị vận chuyển'),
(1, 'delivered', 3, 'Đã giao hàng thành công'),
(2, 'pending', NULL, 'Đơn hàng được tạo'),
(2, 'confirmed', 3, 'Nhân viên xác nhận đơn hàng'),
(2, 'processing', 3, 'Đang chuẩn bị hàng'),
(2, 'shipping', 3, 'Đã giao cho đơn vị vận chuyển'),
(3, 'pending', NULL, 'Đơn hàng được tạo');

-- Insert Reviews
INSERT INTO reviews (product_id, user_id, order_id, rating, comment, status) VALUES
(2, 4, 1, 5, 'iPhone 15 rất đẹp, camera tốt, pin trâu. Giao hàng nhanh, đóng gói cẩn thận. Rất hài lòng!', 'approved'),
(17, 4, 1, 5, 'AirPods Pro 2 chất lượng âm thanh tuyệt vời, chống ồn rất tốt. Đáng đồng tiền bát gạo!', 'approved'),
(4, 5, 2, 4, 'Samsung S24 Ultra màn hình đẹp, camera 200MP chụp rất nét. Pin trâu, dùng cả ngày không lo hết pin.', 'approved'),
(18, 5, 2, 5, 'Galaxy Buds2 Pro âm thanh hay, pin lâu, thiết kế đẹp. Rất đáng mua!', 'approved');

-- Insert Expenses
INSERT INTO expenses (category, amount, description, expense_date) VALUES
('salary', 50000000, 'Lương tháng 1/2024', '2024-01-05'),
('rent', 15000000, 'Tiền thuê mặt bằng tháng 1/2024', '2024-01-01'),
('utilities', 5000000, 'Tiền điện nước tháng 1/2024', '2024-01-10'),
('marketing', 10000000, 'Chi phí quảng cáo Facebook, Google tháng 1/2024', '2024-01-15'),
('shipping', 3000000, 'Chi phí vận chuyển tháng 1/2024', '2024-01-20'),
('other', 2000000, 'Chi phí khác tháng 1/2024', '2024-01-25');

-- Insert System Logs
INSERT INTO system_logs (user_id, action, table_name, record_id, description, ip_address) VALUES
(1, 'LOGIN', 'users', 1, 'Admin đăng nhập hệ thống', '192.168.1.100'),
(2, 'LOGIN', 'users', 2, 'Manager đăng nhập hệ thống', '192.168.1.101'),
(3, 'UPDATE', 'orders', 1, 'Nhân viên cập nhật trạng thái đơn hàng', '192.168.1.102'),
(3, 'UPDATE', 'orders', 2, 'Nhân viên cập nhật trạng thái đơn hàng', '192.168.1.102'),
(4, 'CREATE', 'orders', 1, 'Khách hàng tạo đơn hàng mới', '192.168.1.103'),
(5, 'CREATE', 'orders', 2, 'Khách hàng tạo đơn hàng mới', '192.168.1.104'),
(6, 'CREATE', 'orders', 3, 'Khách hàng tạo đơn hàng mới', '192.168.1.105'),
(4, 'CREATE', 'reviews', 1, 'Khách hàng đánh giá sản phẩm', '192.168.1.103'),
(5, 'CREATE', 'reviews', 3, 'Khách hàng đánh giá sản phẩm', '192.168.1.104');

-- Insert Banners
INSERT INTO banners (title, subtitle, button_text, button_link, background_color, text_color, position, is_active) VALUES
('Chào mừng đến Tech Store', 'Nơi mua sắm công nghệ uy tín, chất lượng', 'Xem sản phẩm', '/products', '#1E40AF', '#FFFFFF', 1, TRUE);



