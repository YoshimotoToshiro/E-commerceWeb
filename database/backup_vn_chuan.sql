-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: tech_store_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `banners`
--

DROP TABLE IF EXISTS `banners`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `banners` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `subtitle` varchar(300) DEFAULT NULL,
  `button_text` varchar(50) DEFAULT 'Xem sản phẩm',
  `button_link` varchar(255) DEFAULT '/products',
  `background_image` varchar(500) DEFAULT NULL,
  `background_color` varchar(50) DEFAULT '#1E40AF',
  `text_color` varchar(50) DEFAULT '#FFFFFF',
  `position` int DEFAULT '1',
  `is_active` tinyint(1) DEFAULT '1',
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_banners_active` (`is_active`),
  KEY `idx_banners_position` (`position`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `banners`
--

LOCK TABLES `banners` WRITE;
/*!40000 ALTER TABLE `banners` DISABLE KEYS */;
INSERT INTO `banners` VALUES (1,'Comback to school','','','','https://img.freepik.com/premium-psd/laptop-sale-banner-design-template_987701-2743.jpg?semt=ais_hybrid','#1E40AF','#FFFFFF',1,1,NULL,NULL,'2025-12-01 02:13:33','2025-12-13 11:27:58'),(2,'Chào hè','','','','https://img.freepik.com/premium-psd/gaming-laptop-banner-template-design_1073294-46.jpg?w=2000','#1E40AF','#FFFFFF',1,1,NULL,NULL,'2025-12-12 09:24:33','2025-12-13 11:25:30');
/*!40000 ALTER TABLE `banners` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `variant_id` int DEFAULT NULL,
  `quantity` int DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `variant_id` (`variant_id`),
  KEY `idx_cart_items_cart` (`cart_id`),
  CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `cart_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cart_items`
--

LOCK TABLES `cart_items` WRITE;
/*!40000 ALTER TABLE `cart_items` DISABLE KEYS */;
INSERT INTO `cart_items` VALUES (1,1,2,5,1,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(2,1,17,NULL,1,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(6,4,34,38,1,'2025-12-01 02:58:45','2025-12-01 03:04:25');
/*!40000 ALTER TABLE `cart_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carts`
--

LOCK TABLES `carts` WRITE;
/*!40000 ALTER TABLE `carts` DISABLE KEYS */;
INSERT INTO `carts` VALUES (1,4,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(2,5,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(3,6,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(4,2,'2025-12-01 02:14:03','2025-12-01 02:14:03'),(5,1,'2025-12-01 03:04:40','2025-12-01 03:04:40'),(6,3,'2025-12-12 03:24:09','2025-12-12 03:24:09'),(7,7,'2025-12-12 03:45:23','2025-12-12 03:45:23');
/*!40000 ALTER TABLE `carts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `parent_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `parent_id` (`parent_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Điện thoại','Điện thoại thông minh và phụ kiện',NULL,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(2,'Laptop','Laptop và máy tính xách tay',NULL,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(3,'Tablet','Máy tính bảng',NULL,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(4,'Phụ kiện','Phụ kiện công nghệ',NULL,'2025-12-01 02:13:33','2025-12-01 02:13:33');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expenses`
--

DROP TABLE IF EXISTS `expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expenses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` enum('salary','rent','utilities','marketing','shipping','other') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `description` text,
  `expense_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expenses`
--

LOCK TABLES `expenses` WRITE;
/*!40000 ALTER TABLE `expenses` DISABLE KEYS */;
INSERT INTO `expenses` VALUES (1,'salary',50000000.00,'Lương tháng 1/2024','2024-01-05','2025-12-01 02:13:33','2025-12-01 02:13:33'),(2,'rent',15000000.00,'Tiền thuê mặt bằng tháng 1/2024','2024-01-01','2025-12-01 02:13:33','2025-12-01 02:13:33'),(3,'utilities',5000000.00,'Tiền điện nước tháng 1/2024','2024-01-10','2025-12-01 02:13:33','2025-12-01 02:13:33'),(4,'marketing',10000000.00,'Chi phí quảng cáo Facebook, Google tháng 1/2024','2024-01-15','2025-12-01 02:13:33','2025-12-01 02:13:33'),(5,'shipping',3000000.00,'Chi phí vận chuyển tháng 1/2024','2024-01-20','2025-12-01 02:13:33','2025-12-01 02:13:33'),(6,'other',2000000.00,'Chi phí khác tháng 1/2024','2024-01-25','2025-12-01 02:13:33','2025-12-01 02:13:33');
/*!40000 ALTER TABLE `expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `variant_id` int DEFAULT NULL,
  `product_name` varchar(200) NOT NULL,
  `variant_name` varchar(100) DEFAULT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  KEY `variant_id` (`variant_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (1,1,2,5,'iPhone 15 128GB','Xanh dương',1,21990000.00,21990000.00,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(2,1,17,NULL,'AirPods Pro 2 (USB-C)',NULL,1,6990000.00,6990000.00,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(3,2,4,NULL,'Samsung Galaxy S24 Ultra 256GB','256GB - Đen',1,26990000.00,26990000.00,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(4,2,18,NULL,'Samsung Galaxy Buds2 Pro',NULL,1,3990000.00,3990000.00,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(5,3,11,NULL,'MacBook Pro 14 inch M3','18GB/512GB',1,42990000.00,42990000.00,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(6,4,4,NULL,'Samsung Galaxy S24 Ultra 256GB',NULL,1,24830800.00,24830800.00,'2025-12-12 03:33:35','2025-12-12 03:33:35'),(7,4,18,NULL,'Samsung Galaxy Buds2 Pro',NULL,1,3391500.00,3391500.00,'2025-12-12 03:33:35','2025-12-12 03:33:35'),(8,4,40,135,'MacBook Pro 16 inch M3 Max 1TB','Đen - 12GB/256GB',2,75450200.00,150900400.00,'2025-12-12 03:33:35','2025-12-12 03:33:35'),(9,5,11,NULL,'MacBook Pro 14 inch M3',NULL,1,42990000.00,42990000.00,'2025-12-12 04:01:07','2025-12-12 04:01:07'),(10,6,41,134,'Lenovo Yoga 9i 14 Gen 9','Vàng - 12GB/256GB',1,39980700.00,39980700.00,'2025-12-12 04:34:12','2025-12-12 04:34:12'),(11,7,42,136,'Lenovo Legion 9i 16 2024','Đen - 12GB/256GB',1,75990500.00,75990500.00,'2025-12-12 04:35:16','2025-12-12 04:35:16'),(12,8,4,90,'Samsung Galaxy S24 Ultra 256GB','256GB - Đen',1,24830800.00,24830800.00,'2025-12-12 09:08:05','2025-12-12 09:08:05'),(13,8,4,92,'Samsung Galaxy S24 Ultra 256GB','512GB - Đen',1,29830800.00,29830800.00,'2025-12-12 09:08:05','2025-12-12 09:08:05'),(14,8,4,93,'Samsung Galaxy S24 Ultra 256GB','512GB - Tím',1,29830800.00,29830800.00,'2025-12-12 09:08:05','2025-12-12 09:08:05'),(15,9,38,132,'Huawei Mate 60 Pro 12GB/512GB','Tím - 12GB/256GB',1,26590500.00,26590500.00,'2025-12-13 11:34:35','2025-12-13 11:34:35'),(16,10,25,103,'Google Pixel 8 128GB','Cam - 12GB/256GB',1,18990500.00,18990500.00,'2025-12-13 11:38:02','2025-12-13 11:38:02');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_status_history`
--

DROP TABLE IF EXISTS `order_status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_status_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `status` enum('pending','confirmed','processing','shipping','delivered','cancelled') NOT NULL,
  `updated_by` int DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_status_history_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_status_history`
--

LOCK TABLES `order_status_history` WRITE;
/*!40000 ALTER TABLE `order_status_history` DISABLE KEYS */;
INSERT INTO `order_status_history` VALUES (1,1,'pending',NULL,'Đơn hàng được tạo','2025-12-01 02:13:33','2025-12-01 02:13:33'),(2,1,'confirmed',3,'Nhân viên xác nhận đơn hàng','2025-12-01 02:13:33','2025-12-01 02:13:33'),(3,1,'processing',3,'Đang chuẩn bị hàng','2025-12-01 02:13:33','2025-12-01 02:13:33'),(4,1,'shipping',3,'Đã giao cho đơn vị vận chuyển','2025-12-01 02:13:33','2025-12-01 02:13:33'),(5,1,'delivered',3,'Đã giao hàng thành công','2025-12-01 02:13:33','2025-12-01 02:13:33'),(6,2,'pending',NULL,'Đơn hàng được tạo','2025-12-01 02:13:33','2025-12-01 02:13:33'),(7,2,'confirmed',3,'Nhân viên xác nhận đơn hàng','2025-12-01 02:13:33','2025-12-01 02:13:33'),(8,2,'processing',3,'Đang chuẩn bị hàng','2025-12-01 02:13:33','2025-12-01 02:13:33'),(9,2,'shipping',3,'Đã giao cho đơn vị vận chuyển','2025-12-01 02:13:33','2025-12-01 02:13:33'),(10,3,'pending',NULL,'Đơn hàng được tạo','2025-12-01 02:13:33','2025-12-01 02:13:33'),(11,2,'delivered',3,'Chuyển từ shipping sang delivered','2025-12-12 03:24:16','2025-12-12 03:24:16'),(12,4,'pending',5,'Đơn hàng được tạo','2025-12-12 03:33:35','2025-12-12 03:33:35'),(13,4,'shipping',3,'Chuyển từ pending sang shipping','2025-12-12 03:33:52','2025-12-12 03:33:52'),(14,4,'delivered',5,'Khách hàng xác nhận đã nhận hàng','2025-12-12 03:34:00','2025-12-12 03:34:00'),(15,3,'delivered',7,'Chuyển từ pending sang delivered','2025-12-12 03:45:41','2025-12-12 03:45:41'),(16,5,'pending',6,'Đơn hàng được tạo','2025-12-12 04:01:07','2025-12-12 04:01:07'),(17,5,'delivered',7,'Chuyển từ pending sang delivered','2025-12-12 04:01:21','2025-12-12 04:01:21'),(18,6,'pending',6,'Đơn hàng được tạo','2025-12-12 04:34:12','2025-12-12 04:34:12'),(19,7,'pending',6,'Đơn hàng được tạo','2025-12-12 04:35:16','2025-12-12 04:35:16'),(20,8,'pending',6,'Đơn hàng được tạo','2025-12-12 09:08:05','2025-12-12 09:08:05'),(21,7,'shipping',3,'Chuyển từ pending sang shipping','2025-12-12 09:08:15','2025-12-12 09:08:15'),(22,7,'delivered',6,'Khách hàng xác nhận đã nhận hàng','2025-12-12 09:13:32','2025-12-12 09:13:32'),(23,9,'pending',6,'Đơn hàng được tạo','2025-12-13 11:34:35','2025-12-13 11:34:35'),(24,9,'shipping',7,'Chuyển từ pending sang shipping','2025-12-13 11:34:47','2025-12-13 11:34:47'),(25,9,'delivered',6,'Khách hàng xác nhận đã nhận hàng','2025-12-13 11:34:56','2025-12-13 11:34:56'),(26,10,'pending',5,'Đơn hàng được tạo','2025-12-13 11:38:02','2025-12-13 11:38:02'),(27,10,'shipping',3,'Chuyển từ pending sang shipping','2025-12-13 11:38:13','2025-12-13 11:38:13'),(28,10,'delivered',5,'Khách hàng xác nhận đã nhận hàng','2025-12-13 11:38:44','2025-12-13 11:38:44'),(29,10,'pending',3,'Chuyển từ delivered sang pending','2025-12-13 11:55:52','2025-12-13 11:55:52'),(30,10,'shipping',3,'Chuyển từ pending sang shipping','2025-12-13 11:56:01','2025-12-13 11:56:01');
/*!40000 ALTER TABLE `order_status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_code` varchar(50) NOT NULL,
  `user_id` int NOT NULL,
  `employee_id` int DEFAULT NULL,
  `total_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `promotion_id` int DEFAULT NULL,
  `final_amount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `status` enum('pending','confirmed','processing','shipping','delivered','cancelled') DEFAULT 'pending',
  `payment_method` enum('cash','bank_transfer','credit_card','e_wallet') DEFAULT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `shipping_address` text NOT NULL,
  `shipping_phone` varchar(20) NOT NULL,
  `order_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `delivery_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_code` (`order_code`),
  KEY `employee_id` (`employee_id`),
  KEY `promotion_id` (`promotion_id`),
  KEY `idx_orders_user` (`user_id`),
  KEY `idx_orders_status` (`status`),
  KEY `idx_orders_date` (`order_date`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`),
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`promotion_id`) REFERENCES `promotions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD001',4,3,28990000.00,2899000.00,1,26091000.00,'delivered','bank_transfer','paid','100 User Street, Ho Chi Minh City','0901111111','2024-01-15 10:30:00',NULL,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(2,'ORD002',5,3,30980000.00,0.00,NULL,30980000.00,'delivered','credit_card','paid','200 User Street, Ha Noi','0902222222','2024-01-20 14:20:00',NULL,'2025-12-01 02:13:33','2025-12-12 03:24:16'),(3,'ORD003',6,7,42990000.00,0.00,NULL,42990000.00,'delivered','cash','pending','300 User Street, Da Nang','0903333333','2024-01-25 09:15:00',NULL,'2025-12-01 02:13:33','2025-12-12 03:45:41'),(4,'ORD-1765510415178-253C9343',5,3,179122700.00,0.00,NULL,179122700.00,'delivered','cash','pending','200 User Street, Ha Noi','0902222222','2025-12-12 03:33:35',NULL,'2025-12-12 03:33:35','2025-12-12 03:34:00'),(5,'ORD-1765512067351-7ECDBEE8',6,7,42990000.00,0.00,NULL,42990000.00,'delivered','bank_transfer','pending','300 User Street, Da Nang','0903333333','2025-12-12 04:01:07',NULL,'2025-12-12 04:01:07','2025-12-12 04:01:21'),(6,'ORD-1765514052242-2AE7CF0B',6,NULL,39980700.00,0.00,NULL,39980700.00,'pending','cash','pending','300 User Street, Da Nang','0903333333','2025-12-12 04:34:12',NULL,'2025-12-12 04:34:12','2025-12-12 04:34:12'),(7,'ORD-1765514116903-D481C5B1',6,3,75990500.00,0.00,NULL,75990500.00,'delivered','cash','pending','300 User Street, Da Nang','0903333333','2025-12-12 04:35:16',NULL,'2025-12-12 04:35:16','2025-12-12 09:13:32'),(8,'ORD-1765530485784-F7357F7A',6,NULL,84492400.00,0.00,NULL,84492400.00,'pending','cash','pending','300 User Street, Da Nang','0903333333','2025-12-12 09:08:05',NULL,'2025-12-12 09:08:05','2025-12-12 09:08:05'),(9,'ORD-1765625675644-8C96D1F7',6,7,26590500.00,0.00,NULL,26590500.00,'delivered','bank_transfer','pending','300 User Street, Da Nang','0903333333','2025-12-13 11:34:35',NULL,'2025-12-13 11:34:35','2025-12-13 11:34:56'),(10,'ORD-1765625882104-159B82A9',5,3,18990500.00,0.00,NULL,18990500.00,'shipping','cash','pending','200 User Street, Ha Noi','0902222222','2025-12-13 11:38:02',NULL,'2025-12-13 11:38:02','2025-12-13 11:56:01');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_images`
--

DROP TABLE IF EXISTS `product_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=165 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_images`
--

LOCK TABLES `product_images` WRITE;
/*!40000 ALTER TABLE `product_images` DISABLE KEYS */;
INSERT INTO `product_images` VALUES (1,1,'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-1.jpg',1,1,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(2,2,'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-1.jpg',1,1,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(14,14,'https://fdn2.gsmarena.com/vv/pics/apple/apple-ipad-pro-129-2022-1.jpg',1,1,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(15,15,'https://fdn2.gsmarena.com/vv/pics/apple/apple-ipad-air-2022-1.jpg',1,1,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(65,35,'https://fdn2.gsmarena.com/vv/pics/sony/sony-xperia-1-v-1.jpg',1,0,'2025-12-01 02:26:43','2025-12-01 02:26:43'),(81,34,'https://tse2.mm.bing.net/th/id/OIP.t8lh0BkrI4J5T5bFHP3YQgHaFt?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:30:16','2025-12-01 02:30:16'),(83,30,'https://tse4.mm.bing.net/th/id/OIP.p6ukISot3Y3RABC-MjJa3wHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:30:45','2025-12-01 02:30:45'),(85,27,'https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6548/6548838_sd.jpg',1,0,'2025-12-01 02:31:29','2025-12-01 02:31:29'),(87,33,'https://fdn2.gsmarena.com/vv/pics/nothing/nothing-phone2-1.jpg',1,0,'2025-12-01 02:31:40','2025-12-01 02:31:40'),(90,26,'https://th.bing.com/th/id/OIP.FpxLz2z3K0uTLDDu0ZNBMgHaHc?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:32:25','2025-12-01 02:32:25'),(91,26,'https://static1.pocketnowimages.com/wordpress/wp-content/uploads/2024/01/pbi-samsung-galaxy-s24-ultra.png',0,1,'2025-12-01 02:32:25','2025-12-01 02:32:25'),(95,62,'https://m.media-amazon.com/images/I/71L-flqtTwL.jpg',1,0,'2025-12-01 02:34:25','2025-12-01 02:34:25'),(97,61,'https://tse4.mm.bing.net/th/id/OIP.sTD_rSQgk_QgZuoL-dbMYAHaDC?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:35:40','2025-12-01 02:35:40'),(98,60,'https://tse4.mm.bing.net/th/id/OIP.tXsRB46--D83_K81iuw7pQHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:36:59','2025-12-01 02:36:59'),(99,55,'https://s13emagst.akamaized.net/products/58734/58733480/images/res_15b9eed832b01f262e934b51e5b7ec1a.jpg',1,0,'2025-12-01 02:37:35','2025-12-01 02:37:35'),(101,37,'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-13t-pro-1.jpg',1,0,'2025-12-01 02:38:59','2025-12-01 02:38:59'),(107,32,'https://fdn2.gsmarena.com/vv/pics/honor/honor-magic6-pro-1.jpg',1,0,'2025-12-01 02:40:36','2025-12-01 02:40:36'),(109,31,'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt5-pro-1.jpg',1,0,'2025-12-01 02:40:43','2025-12-01 02:40:43'),(111,28,'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-find-x7-ultra-1.jpg',1,0,'2025-12-01 02:41:20','2025-12-01 02:41:20'),(112,56,'https://m.media-amazon.com/images/I/71xr9LGXt+L._AC_SL1500_.jpg',1,0,'2025-12-01 02:41:47','2025-12-01 02:41:47'),(113,57,'https://tse3.mm.bing.net/th/id/OIP.BfaRpy_6M2qBeV49y-tq3wHaEv?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:42:23','2025-12-01 02:42:23'),(114,54,'https://m.media-amazon.com/images/I/71XMTLtZd5L._AC_SL1500_.jpg',1,0,'2025-12-01 02:42:56','2025-12-01 02:42:56'),(115,53,'https://tse1.mm.bing.net/th/id/OIP.jMEvWBdjESu3aieBENnifQHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:43:20','2025-12-01 02:43:20'),(116,51,'https://www.vopmart.com/media/magefan_blog/Xiaomi_Pad_6_Pro.jpg',1,0,'2025-12-01 02:44:11','2025-12-01 02:44:11'),(118,4,'https://tse1.mm.bing.net/th/id/OIP.FpxLz2z3K0uTLDDu0ZNBMgHaHc?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:44:39','2025-12-01 02:44:39'),(119,10,'https://tse3.mm.bing.net/th/id/OIP._smHc2imAf10Mt4zZAZbeQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:44:59','2025-12-01 02:44:59'),(120,9,'https://th.bing.com/th/id/OIP.OgnggewQqw496_NGRipLHAHaFH?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:45:28','2025-12-01 02:45:28'),(121,6,'https://th.bing.com/th/id/OIP.8feF2OGgeRWgaowH0QmC-QHaHa?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:45:59','2025-12-01 02:45:59'),(122,11,'https://tse4.mm.bing.net/th/id/OIP.dyS_sksggcPo2OxzVqihjgHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:46:27','2025-12-01 02:46:27'),(123,3,'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-pro-3.jpg',1,0,'2025-12-01 02:46:40','2025-12-01 02:46:40'),(124,5,'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s23-5g-1.jpg',1,0,'2025-12-01 02:46:49','2025-12-01 02:46:49'),(125,18,'https://static1.pocketnowimages.com/wordpress/wp-content/uploads/2022/10/PBI-Samsung-Galaxy-Buds-2-Pro.png',1,0,'2025-12-01 02:47:32','2025-12-01 02:47:32'),(126,25,'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8-1.jpg',1,0,'2025-12-01 02:47:44','2025-12-01 02:47:44'),(128,23,'https://tse1.mm.bing.net/th/id/OIP.26ufSgsN1tb6IEADYHAsfwHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:48:36','2025-12-01 02:48:36'),(129,22,'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MT233?wid=2000&hei=2000&fmt=jpeg&qlt=95&.v=1693248327138',1,0,'2025-12-01 02:49:03','2025-12-01 02:49:03'),(130,21,'https://a.scdn.gr/images/sku_images/028126/28126975/20191014130536_3c5ddcb3.jpeg',1,0,'2025-12-01 02:49:50','2025-12-01 02:49:50'),(131,21,'https://tse2.mm.bing.net/th/id/OIP.VP7EPDSUepvAVn6XFGzzqAHaHa?w=920&h=920&rs=1&pid=ImgDetMain&o=7&rm=3',0,1,'2025-12-01 02:49:50','2025-12-01 02:49:50'),(132,19,'https://m.media-amazon.com/images/I/51SKmu2G9FL._AC_SL1000_.jpg',1,0,'2025-12-01 02:50:08','2025-12-01 02:50:08'),(135,49,'https://tse1.mm.bing.net/th/id/OIP.WKburUxZC2aB-z2I4FFi3wHaIm?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:51:00','2025-12-01 02:51:00'),(137,50,'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-tab-s9-fe-plus-1.jpg',1,0,'2025-12-01 02:51:34','2025-12-01 02:51:34'),(138,59,'https://m.media-amazon.com/images/I/61ni3t1ryQL._AC_SL1500_.jpg',1,0,'2025-12-01 02:51:53','2025-12-01 02:51:53'),(140,58,'https://tse1.explicit.bing.net/th/id/OIP.azAvhTeaaSu7q6VfSoYlnQHaJK?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:52:00','2025-12-01 02:52:00'),(141,8,'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-1.jpg',1,0,'2025-12-01 02:52:14','2025-12-01 02:52:14'),(142,52,'https://fdn2.gsmarena.com/vv/pics/lenovo/lenovo-tab-extreme-1.jpg',1,0,'2025-12-01 02:52:32','2025-12-01 02:52:32'),(143,7,'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-pro-1.jpg',1,0,'2025-12-01 02:52:42','2025-12-01 02:52:42'),(144,24,'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8-pro-1.jpg',1,0,'2025-12-01 02:52:47','2025-12-01 02:52:47'),(145,20,'https://th.bing.com/th/id/OIP.iDDTeYe_-PI_83WE1ok9pQHaFH?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:53:11','2025-12-01 02:53:11'),(147,17,'https://m.media-amazon.com/images/I/61SUj2aKoEL._AC_SL1500_.jpg',1,0,'2025-12-01 02:53:50','2025-12-01 02:53:50'),(148,16,'https://cdn.comparez-malin.fr/img/samsung/2023/34580/samsung-galaxy-tab-s9-ultra-anthracite-1.jpg',1,0,'2025-12-01 02:54:16','2025-12-01 02:54:16'),(149,13,'https://tse4.mm.bing.net/th/id/OIP.E7hwd1W45ADgG-A_pmVEFAHaGb?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:55:36','2025-12-01 02:55:36'),(150,12,'https://th.bing.com/th/id/OIP.XVqG6TcKEdcpf2eNhFgpyAHaF-?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:56:01','2025-12-01 02:56:01'),(151,38,'https://th.bing.com/th/id/OIP.Ioyv2DjohVGFhrhFD9NQoAHaIT?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:56:05','2025-12-01 02:56:05'),(152,48,'https://tse1.mm.bing.net/th/id/OIP.LabP0y26jLnmBFrwFKjfMgHaEq?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:56:06','2025-12-01 02:56:06'),(153,41,'https://tse3.mm.bing.net/th/id/OIP.LxXIASySY_UGr2Sd1eeEPwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-01 02:56:07','2025-12-01 02:56:07'),(154,40,'https://m.media-amazon.com/images/I/618d5bS2lUL._AC_SL1500_.jpg',1,0,'2025-12-01 02:56:08','2025-12-01 02:56:08'),(155,42,'https://laptopmedia.com/wp-content/uploads/2024/02/2-20-e1707726714879.jpg',1,0,'2025-12-01 02:56:09','2025-12-01 02:56:09'),(156,47,'https://us.v-cdn.net/6036147/uploads/57XGUMGDO2WA/swift-x-14-2024.png',1,0,'2025-12-12 02:49:27','2025-12-12 02:49:27'),(157,46,'https://th.bing.com/th/id/OIP.GWIqQGzM5w3xOzdaEZ-OoAHaFC?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-12 02:49:28','2025-12-12 02:49:28'),(158,45,'https://laptoptcc.com/media/product/45354-dell-xps-14-laptoptcc-4.jpg',1,0,'2025-12-12 02:49:29','2025-12-12 02:49:29'),(159,44,'https://www.notebookcheck.net/fileadmin/_processed_/9/7/csm_HP_Envy_16_4_0b063ce8f4.jpg',1,0,'2025-12-12 02:49:30','2025-12-12 02:49:30'),(160,43,'https://tse1.mm.bing.net/th/id/OIP.L_lo-Xzc6NsLHeiwY1rGsQHaFr?rs=1&pid=ImgDetMain&o=7&rm=3',1,0,'2025-12-12 02:49:30','2025-12-12 02:49:30'),(161,39,'https://m.media-amazon.com/images/I/719C6bJv8jL._AC_SL1500_.jpg',1,0,'2025-12-12 02:49:38','2025-12-12 02:49:38'),(162,29,'https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-12-1.jpg',1,0,'2025-12-12 08:25:01','2025-12-12 08:25:01'),(163,29,'https://tse3.mm.bing.net/th/id/OIP.A0uZWNVS-oFmcvJB5Y2YVAHaHa?cb=ucfimg2&ucfimg=1&w=2000&h=2000&rs=1&pid=ImgDetMain&o=7&rm=3',0,1,'2025-12-12 08:25:01','2025-12-12 08:25:01'),(164,36,'https://fdn2.gsmarena.com/vv/pics/asus/asus-rog-phone-8-pro-1.jpg',1,0,'2025-12-12 08:31:10','2025-12-12 08:31:10');
/*!40000 ALTER TABLE `product_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_variants`
--

DROP TABLE IF EXISTS `product_variants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product_variants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `variant_name` varchar(100) NOT NULL,
  `sku` varchar(50) DEFAULT NULL,
  `stock_quantity` int DEFAULT '0',
  `price_adjustment` decimal(10,2) DEFAULT '0.00',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=145 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_variants`
--

LOCK TABLES `product_variants` WRITE;
/*!40000 ALTER TABLE `product_variants` DISABLE KEYS */;
INSERT INTO `product_variants` VALUES (1,1,'Titan tự nhiên','IP15PM-256-TN',50,0.00,'active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(2,1,'Titan xanh','IP15PM-256-TB',30,0.00,'active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(3,1,'Titan trắng','IP15PM-256-TT',40,0.00,'active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(4,1,'Titan đen','IP15PM-256-TD',45,0.00,'active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(5,2,'Xanh dương','IP15-128-XD',100,0.00,'active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(6,2,'Hồng','IP15-128-H',80,0.00,'active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(7,2,'Vàng','IP15-128-V',90,0.00,'active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(8,2,'Xanh lá','IP15-128-XL',85,0.00,'active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(9,2,'Đen','IP15-128-D',95,0.00,'active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(18,14,'256GB - WiFi','IPADP-12.9-256-W',40,0.00,'active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(19,14,'512GB - WiFi','IPADP-12.9-512-W',25,5000000.00,'active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(20,14,'256GB - 5G','IPADP-12.9-256-5G',30,3000000.00,'active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(22,35,'Đen - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:26:43','2025-12-01 02:26:43'),(38,34,'Hồng - 12GB/256GB',NULL,34,0.00,'active','2025-12-01 02:30:16','2025-12-01 02:30:16'),(40,30,'Xanh nhạt - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:30:45','2025-12-01 02:30:45'),(42,27,'Đen - 12GB/256GB',NULL,344,0.00,'active','2025-12-01 02:31:29','2025-12-01 02:31:29'),(44,33,'Đen - 12GB/256GB',NULL,1,0.00,'active','2025-12-01 02:31:40','2025-12-01 02:31:40'),(47,26,'Đen - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:32:25','2025-12-01 02:32:25'),(48,26,'Cam - 8GB/256GB',NULL,3,0.00,'active','2025-12-01 02:32:25','2025-12-01 02:32:25'),(55,62,'Đen - Có dây',NULL,3,0.00,'active','2025-12-01 02:34:25','2025-12-01 02:34:25'),(56,62,'Đen - Không dây',NULL,4,0.00,'active','2025-12-01 02:34:25','2025-12-01 02:34:25'),(59,61,'Trắng - 20000mAh',NULL,34,0.00,'active','2025-12-01 02:35:40','2025-12-01 02:35:40'),(60,60,'Đen - Tiêu chuẩn',NULL,32,0.00,'active','2025-12-01 02:36:59','2025-12-01 02:36:59'),(61,60,'Đen - Kẹp đèn',NULL,32,0.00,'active','2025-12-01 02:36:59','2025-12-01 02:36:59'),(62,55,'Đen - Nam',NULL,32,0.00,'active','2025-12-01 02:37:35','2025-12-01 02:37:35'),(63,55,'Trắng - Nữ',NULL,2,0.00,'active','2025-12-01 02:37:35','2025-12-01 02:37:35'),(66,37,'Xanh dương - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:38:59','2025-12-01 02:38:59'),(72,32,'Trắng - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:40:36','2025-12-01 02:40:36'),(74,31,'Cam - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:40:43','2025-12-01 02:40:43'),(76,28,'Đen - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:41:20','2025-12-01 02:41:20'),(77,56,'Đen - 12GB/256GB',NULL,37,0.00,'active','2025-12-01 02:41:47','2025-12-01 02:41:47'),(78,57,'Đen - Kèm dây sạc',NULL,32,0.00,'active','2025-12-01 02:42:23','2025-12-01 02:42:23'),(79,54,'Đen - 40mm',NULL,3,0.00,'active','2025-12-01 02:42:56','2025-12-01 02:42:56'),(80,54,'Trắng - 44mm',NULL,0,0.00,'active','2025-12-01 02:42:56','2025-12-01 02:42:56'),(81,53,'Trắng - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:43:20','2025-12-01 02:43:20'),(82,51,'Đen - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:44:11','2025-12-01 02:44:11'),(83,51,'Bạc - 12GB/256GB',NULL,12,0.00,'active','2025-12-01 02:44:11','2025-12-01 02:44:11'),(84,51,'Trắng - 16GB/256GB',NULL,4,0.00,'active','2025-12-01 02:44:11','2025-12-01 02:44:11'),(85,51,'Xanh dương - 32GB/512GB',NULL,43,0.00,'active','2025-12-01 02:44:11','2025-12-01 02:44:11'),(90,4,'256GB - Đen',NULL,59,0.00,'active','2025-12-01 02:44:39','2025-12-12 09:08:05'),(91,4,'256GB - Tím',NULL,50,0.00,'active','2025-12-01 02:44:39','2025-12-01 02:44:39'),(92,4,'512GB - Đen',NULL,39,5000000.00,'active','2025-12-01 02:44:39','2025-12-12 09:08:05'),(93,4,'512GB - Tím',NULL,34,5000000.00,'active','2025-12-01 02:44:39','2025-12-12 09:08:05'),(94,10,'Đen - 12GB/256GB',NULL,4,0.00,'active','2025-12-01 02:44:59','2025-12-01 02:44:59'),(95,9,'Đen - 12GB/256GB',NULL,25,0.00,'active','2025-12-01 02:45:28','2025-12-01 02:45:28'),(96,9,'Hồng - 32GB/1TB',NULL,15,5000000.00,'active','2025-12-01 02:45:28','2025-12-01 02:45:28'),(97,6,'Đen - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:45:59','2025-12-01 02:45:59'),(98,11,'Trắng - 18GB/512GB',NULL,30,0.00,'active','2025-12-01 02:46:28','2025-12-01 02:46:28'),(99,11,'Đen - 18GB/1TB',NULL,20,5000000.00,'active','2025-12-01 02:46:28','2025-12-01 02:46:28'),(100,3,'Trắng - 18GB/1TB',NULL,32,0.00,'active','2025-12-01 02:46:40','2025-12-01 02:46:40'),(101,5,'TÍm - 18GB/1TB',NULL,32,0.00,'active','2025-12-01 02:46:49','2025-12-01 02:46:49'),(102,18,'Tím - Tặng kèm đóc sạc',NULL,32,0.00,'active','2025-12-01 02:47:32','2025-12-01 02:47:32'),(103,25,'Cam - 12GB/256GB',NULL,31,0.00,'active','2025-12-01 02:47:44','2025-12-13 11:38:02'),(105,23,'Trắng - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:48:36','2025-12-01 02:48:36'),(106,22,'Trắng - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:49:03','2025-12-01 02:49:03'),(107,21,'Đen - 20000mAh',NULL,32,0.00,'active','2025-12-01 02:49:50','2025-12-01 02:49:50'),(108,21,'Trắng - 10000mAh',NULL,32,0.00,'active','2025-12-01 02:49:50','2025-12-01 02:49:50'),(109,19,'Đen - Không dây',NULL,2,0.00,'active','2025-12-01 02:50:08','2025-12-01 02:50:08'),(112,49,'Đen - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:51:00','2025-12-01 02:51:00'),(114,50,'Trắng - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:51:34','2025-12-01 02:51:34'),(115,59,'Đen - Không dây',NULL,32,0.00,'active','2025-12-01 02:51:53','2025-12-01 02:51:53'),(118,58,'Trắng - Có dây',NULL,32,0.00,'active','2025-12-01 02:52:00','2025-12-01 02:52:00'),(119,58,'Trắng - Bluetooth',NULL,42,0.00,'active','2025-12-01 02:52:00','2025-12-01 02:52:00'),(120,8,'Xanh dương - 12GB/256GB',NULL,320,0.00,'active','2025-12-01 02:52:14','2025-12-01 02:52:14'),(121,52,'Bạc - 12GB/256GB',NULL,3,0.00,'active','2025-12-01 02:52:32','2025-12-01 02:52:32'),(122,7,'Đen - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:52:42','2025-12-01 02:52:42'),(123,24,'Xanh dương - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:52:47','2025-12-01 02:52:47'),(124,20,'Đen - 20000mAh',NULL,4,0.00,'active','2025-12-01 02:53:11','2025-12-01 02:53:11'),(127,17,'Trắng - USB',NULL,32,0.00,'active','2025-12-01 02:53:50','2025-12-01 02:53:50'),(128,17,'Trắng - Không dây',NULL,0,0.00,'active','2025-12-01 02:53:50','2025-12-01 02:53:50'),(129,16,'Đen - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:54:16','2025-12-01 02:54:16'),(130,13,'Trắng - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:55:36','2025-12-01 02:55:36'),(131,12,'Bạc - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:56:01','2025-12-01 02:56:01'),(132,38,'Tím - 12GB/256GB',NULL,3,0.00,'active','2025-12-01 02:56:05','2025-12-13 11:34:35'),(133,48,'Đen - 12GB/256GB',NULL,32,0.00,'active','2025-12-01 02:56:06','2025-12-01 02:56:06'),(134,41,'Vàng - 12GB/256GB',NULL,29,0.00,'active','2025-12-01 02:56:07','2025-12-12 04:34:12'),(135,40,'Đen - 12GB/256GB',NULL,30,0.00,'active','2025-12-01 02:56:08','2025-12-12 03:33:35'),(136,42,'Đen - 12GB/256GB',NULL,323,0.00,'active','2025-12-01 02:56:09','2025-12-12 04:35:16'),(137,47,'Đen - 12GB/256GB',NULL,32,0.00,'active','2025-12-12 02:49:27','2025-12-12 02:49:27'),(138,46,'Trắng - 12GB/256GB',NULL,32,0.00,'active','2025-12-12 02:49:28','2025-12-12 02:49:28'),(139,45,'Trắng - 12GB/256GB',NULL,3,0.00,'active','2025-12-12 02:49:29','2025-12-12 02:49:29'),(140,44,'Trắng - 12GB/256GB',NULL,32,0.00,'active','2025-12-12 02:49:30','2025-12-12 02:49:30'),(141,43,'Xám - 12GB/256GB',NULL,32,0.00,'active','2025-12-12 02:49:30','2025-12-12 02:49:30'),(142,39,'Đen - 12GB/256GB',NULL,32,0.00,'active','2025-12-12 02:49:38','2025-12-12 02:49:38'),(143,29,'Bạc - 12GB/256GB',NULL,32,0.00,'active','2025-12-12 08:25:01','2025-12-12 08:25:01'),(144,36,'Đen - 12GB/256GB',NULL,32,0.00,'active','2025-12-12 08:31:10','2025-12-12 08:31:10');
/*!40000 ALTER TABLE `product_variants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `category_id` int NOT NULL,
  `supplier_id` int NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `description` text,
  `base_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `discount_percent` decimal(5,2) DEFAULT '0.00',
  `warranty_period` int DEFAULT NULL COMMENT 'Thời gian bảo hành (tháng)',
  `warranty_description` text,
  `status` enum('active','inactive','out_of_stock') DEFAULT 'active',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0' COMMENT 'Sản phẩm nổi bật',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_category` (`category_id`),
  KEY `idx_products_supplier` (`supplier_id`),
  KEY `idx_products_status` (`status`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `products_ibfk_2` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'iPhone 15 Pro Max 256GB',1,1,'Apple','iPhone 15 Pro Max với chip A17 Pro, camera 48MP, màn hình 6.7 inch Super Retina XDR, pin lên đến 29 giờ video. Thiết kế titan cao cấp, chống nước IP68.',29990000.00,5.00,12,'Bảo hành chính hãng 12 tháng, đổi mới 1 đổi 1 trong 15 ngày đầu','active',0,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(2,'iPhone 15 128GB',1,1,'Apple','iPhone 15 với chip A16 Bionic, camera kép 48MP, màn hình 6.1 inch Super Retina XDR. Thiết kế nhôm cao cấp, chống nước IP68.',21990000.00,0.00,12,'Bảo hành chính hãng 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(3,'iPhone 14 Pro 256GB',1,1,'Apple','iPhone 14 Pro với chip A16 Bionic, camera 48MP, Dynamic Island, màn hình 6.1 inch Super Retina XDR ProMotion.',24990000.00,10.00,12,'Bảo hành chính hãng 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:46:40'),(4,'Samsung Galaxy S24 Ultra 256GB',1,2,'Samsung','Galaxy S24 Ultra với chip Snapdragon 8 Gen 3, camera 200MP, bút S Pen, màn hình 6.8 inch Dynamic AMOLED 2X, pin 5000mAh.',26990000.00,8.00,12,'Bảo hành chính hãng 12 tháng, đổi mới 1 đổi 1 trong 30 ngày đầu','active',0,'2025-12-01 02:13:33','2025-12-01 02:44:39'),(5,'Samsung Galaxy S23 128GB',1,2,'Samsung','Galaxy S23 với chip Snapdragon 8 Gen 2, camera 50MP, màn hình 6.1 inch Dynamic AMOLED 2X, pin 3900mAh.',17990000.00,12.00,12,'Bảo hành chính hãng 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:46:49'),(6,'Samsung Galaxy Z Fold5 512GB',1,2,'Samsung','Galaxy Z Fold5 màn hình gập, chip Snapdragon 8 Gen 2, camera 50MP, màn hình ngoài 6.2 inch, màn hình trong 7.6 inch.',39990000.00,5.00,12,'Bảo hành chính hãng 12 tháng, bảo hành màn hình gập 1 năm','active',0,'2025-12-01 02:13:33','2025-12-01 02:45:59'),(7,'Xiaomi 14 Pro 512GB',1,3,'Xiaomi','Xiaomi 14 Pro với chip Snapdragon 8 Gen 3, camera Leica 50MP, màn hình 6.73 inch AMOLED 120Hz, pin 4880mAh sạc nhanh 120W.',19990000.00,10.00,12,'Bảo hành chính hãng 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:52:42'),(8,'Xiaomi Redmi Note 13 Pro 256GB',1,3,'Xiaomi','Redmi Note 13 Pro với chip Snapdragon 7s Gen 2, camera 200MP, màn hình 6.67 inch AMOLED 120Hz, pin 5100mAh sạc nhanh 67W.',7990000.00,5.00,12,'Bảo hành chính hãng 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:52:14'),(9,'ASUS ROG Strix G16 2024',2,4,'ASUS','Laptop gaming ASUS ROG Strix G16 với CPU Intel Core i7-13650HX, GPU RTX 4060 8GB, RAM 16GB DDR5, SSD 512GB, màn hình 16 inch FHD 165Hz.',29990000.00,8.00,24,'Bảo hành chính hãng 24 tháng, hỗ trợ kỹ thuật 24/7','active',0,'2025-12-01 02:13:33','2025-12-01 02:45:28'),(10,'Dell Alienware m16 R2',2,5,'Dell','Laptop gaming Dell Alienware m16 với CPU Intel Core i9-14900HX, GPU RTX 4070 8GB, RAM 32GB DDR5, SSD 1TB, màn hình 16 inch QHD 240Hz.',49990000.00,5.00,24,'Bảo hành chính hãng 24 tháng, Premium Support','active',0,'2025-12-01 02:13:33','2025-12-01 02:44:59'),(11,'MacBook Pro 14 inch M3',2,1,'Apple','MacBook Pro 14 inch với chip Apple M3, RAM 18GB, SSD 512GB, màn hình Liquid Retina XDR 14.2 inch, pin lên đến 22 giờ.',42990000.00,0.00,12,'Bảo hành chính hãng 12 tháng, AppleCare+ có sẵn','active',0,'2025-12-01 02:13:33','2025-12-01 02:46:27'),(12,'Dell XPS 13 Plus',2,5,'Dell','Laptop Dell XPS 13 Plus với CPU Intel Core i7-1360P, RAM 16GB LPDDR5, SSD 512GB, màn hình 13.4 inch OLED 4K Touch.',32990000.00,10.00,12,'Bảo hành chính hãng 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:56:01'),(13,'HP Spectre x360 14',2,6,'HP','Laptop HP Spectre x360 14 với CPU Intel Core i7-1355U, RAM 16GB, SSD 1TB, màn hình 14 inch OLED Touch 2.8K, có thể xoay 360 độ.',28990000.00,12.00,12,'Bảo hành chính hãng 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:55:36'),(14,'iPad Pro 12.9 inch M2 256GB',3,1,'Apple','iPad Pro 12.9 inch với chip Apple M2, màn hình Liquid Retina XDR 12.9 inch, hỗ trợ Apple Pencil và Magic Keyboard.',29990000.00,5.00,12,'Bảo hành chính hãng 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(15,'iPad Air 11 inch M2 256GB',3,1,'Apple','iPad Air 11 inch với chip Apple M2, màn hình Liquid Retina 11 inch, hỗ trợ Apple Pencil 2.',18990000.00,8.00,12,'Bảo hành chính hãng 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(16,'Samsung Galaxy Tab S9 Ultra',3,2,'Samsung','Galaxy Tab S9 Ultra với chip Snapdragon 8 Gen 2, màn hình 14.6 inch Dynamic AMOLED 2X, bút S Pen, pin 11200mAh.',24990000.00,10.00,12,'Bảo hành chính hãng 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:54:16'),(17,'AirPods Pro 2 (USB-C)',4,1,'Apple','Tai nghe AirPods Pro 2 với chip H2, chống ồn chủ động, không gian âm thanh cá nhân hóa, chống nước IPX4.',6990000.00,0.00,12,'Bảo hành chính hãng 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:53:50'),(18,'Samsung Galaxy Buds2 Pro',4,2,'Samsung','Tai nghe Samsung Galaxy Buds2 Pro với chống ồn chủ động, chất lượng âm thanh 24-bit, pin 8 giờ + hộp 20 giờ.',3990000.00,15.00,12,'Bảo hành chính hãng 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:47:32'),(19,'Sony WH-1000XM5',4,3,'Sony','Tai nghe chụp tai Sony WH-1000XM5 với chống ồn tốt nhất, pin 30 giờ, sạc nhanh 3 phút = 3 giờ nghe.',8990000.00,10.00,12,'Bảo hành chính hãng 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:50:08'),(20,'Anker PowerCore 20000mAh',4,3,'Anker','Pin sạc dự phòng Anker PowerCore 20000mAh, sạc nhanh 20W, 2 cổng USB-A, 1 cổng USB-C, thiết kế nhỏ gọn.',1290000.00,5.00,12,'Bảo hành 18 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:53:11'),(21,'Xiaomi Mi Power Bank 3 20000mAh',4,3,'Xiaomi','Pin sạc dự phòng Xiaomi Mi Power Bank 3 20000mAh, sạc nhanh 18W, 2 cổng USB-A, 1 cổng USB-C.',899000.00,10.00,12,'Bảo hành 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:49:50'),(22,'Apple MagSafe Case iPhone 15 Pro',4,1,'Apple','Ốp lưng chính hãng Apple MagSafe cho iPhone 15 Pro, hỗ trợ sạc không dây MagSafe, bảo vệ toàn diện.',1990000.00,0.00,NULL,'Không bảo hành','active',0,'2025-12-01 02:13:33','2025-12-01 02:49:03'),(23,'Samsung Clear Standing Cover Galaxy S24',4,2,'Samsung','Ốp lưng trong suốt Samsung Clear Standing Cover cho Galaxy S24, có thể đứng được, bảo vệ camera.',890000.00,10.00,NULL,'Không bảo hành','active',0,'2025-12-01 02:13:33','2025-12-01 02:48:36'),(24,'Google Pixel 8 Pro 256GB',1,7,'Google','Pixel 8 Pro với chip Google Tensor G3, camera 50MP, công nghệ Magic Eraser và màn hình LTPO 120Hz 6.7 inch.',25990000.00,5.00,12,'Bảo hành chính hãng Google 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:52:47'),(25,'Google Pixel 8 128GB',1,7,'Google','Pixel 8 sở hữu màn hình 6.2 inch Actua Display, camera 50MP và AI Pixel giúp xử lý ảnh, bảo mật Titan M2.',19990000.00,5.00,12,'Bảo hành chính hãng Google 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:47:44'),(26,'Samsung Galaxy S24+ 512GB',1,2,'Samsung','Galaxy S24+ với Snapdragon 8 Gen 3 for Galaxy, màn hình QHD+ 6.7 inch, pin 4900mAh và Galaxy AI mới nhất.',24990000.00,8.00,12,'Bảo hành chính hãng Samsung 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:32:25'),(27,'Samsung Galaxy Z Flip5 512GB',1,2,'Samsung','Galaxy Z Flip5 với bản lề Flex Hinge siêu bền, màn hình Flex Window 3.4 inch và camera góc rộng 12MP.',27990000.00,7.00,12,'Bảo hành chính hãng Samsung 12 tháng, hỗ trợ thay màn hình gập 1 năm','active',0,'2025-12-01 02:13:33','2025-12-01 02:31:29'),(28,'OPPO Find X7 Ultra',1,8,'OPPO','Find X7 Ultra trang bị cụm camera Hasselblad 1-inch kép, chip Snapdragon 8 Gen 3 và sạc SuperVOOC 100W.',23990000.00,6.00,12,'Bảo hành chính hãng OPPO 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:41:20'),(29,'OnePlus 12 16GB/512GB',1,9,'OnePlus','OnePlus 12 với màn hình ProXDR 120Hz, chip Snapdragon 8 Gen 3 và hệ thống sạc SUPERVOOC 100W.',20990000.00,5.00,12,'Bảo hành chính hãng OnePlus 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-12 08:25:01'),(30,'vivo X100 Pro 16GB/512GB',1,10,'vivo','vivo X100 Pro hợp tác Zeiss, cảm biến 1 inch, chip Dimensity 9300 và pin 5400mAh sạc nhanh 120W.',22990000.00,5.00,12,'Bảo hành chính hãng vivo 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:30:45'),(31,'realme GT5 Pro 16GB/512GB',1,11,'realme','realme GT5 Pro với viền siêu mỏng, chip Snapdragon 8 Gen 3, camera tele 3x và sạc SuperVOOC 100W.',18990000.00,6.00,12,'Bảo hành chính hãng realme 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:40:43'),(32,'Honor Magic6 Pro 12GB/512GB',1,12,'Honor','Honor Magic6 Pro trang bị camera Falcon Capture 180MP, chip Snapdragon 8 Gen 3 và pin silicon-carbon 5600mAh.',21990000.00,7.00,12,'Bảo hành chính hãng Honor 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:40:36'),(33,'Nothing Phone (2) 12GB/512GB',1,13,'Nothing','Nothing Phone (2) với thiết kế Glyph nâng cấp, Snapdragon 8+ Gen 1, màn hình 6.7 inch 120Hz và Nothing OS 2.0.',16990000.00,4.00,12,'Bảo hành chính hãng Nothing 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:31:40'),(34,'Motorola Razr 40 Ultra',1,14,'Motorola','Razr 40 Ultra sở hữu màn hình ngoài 3.6 inch 144Hz, bản lề giọt nước bền bỉ và thân máy phủ kính Gorilla Victus.',24990000.00,10.00,12,'Bảo hành chính hãng Motorola 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:30:16'),(35,'Sony Xperia 1 V',1,15,'Sony','Xperia 1 V với cảm biến Exmor T mới, màn hình 4K OLED 21:9 và phím chụp ảnh chuyên nghiệp.',29990000.00,8.00,12,'Bảo hành chính hãng Sony 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:26:43'),(36,'ASUS ROG Phone 8 Pro 24GB/1TB',1,4,'ASUS','ROG Phone 8 Pro với Snapdragon 8 Gen 3, tản nhiệt AeroActive và chế độ X Mode tối ưu chơi game.',34990000.00,5.00,24,'Bảo hành chính hãng ASUS 24 tháng','out_of_stock',0,'2025-12-01 02:13:33','2025-12-12 08:31:10'),(37,'Xiaomi 13T Pro 12GB/512GB',1,3,'Xiaomi','Xiaomi 13T Pro camera Leica Summicron, Dimensity 9200+, sạc HyperCharge 120W và màn hình 144Hz.',15990000.00,10.00,12,'Bảo hành chính hãng Xiaomi 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:38:59'),(38,'Huawei Mate 60 Pro 12GB/512GB',1,16,'Huawei','Mate 60 Pro với thiết kế Clous de Paris, camera XMAGE 48MP, màn hình LTPO 120Hz và hỗ trợ vệ tinh.',27990000.00,5.00,12,'Bảo hành chính hãng Huawei 12 tháng','active',1,'2025-12-01 02:13:33','2025-12-01 02:56:05'),(39,'MacBook Air 15 inch M3 512GB',2,1,'Apple','MacBook Air 15 inch M3 với màn hình Liquid Retina, thời lượng pin 18 giờ và thiết kế siêu mỏng 11.5mm.',37990000.00,3.00,12,'Bảo hành chính hãng Apple 12 tháng','active',1,'2025-12-01 02:13:33','2025-12-12 02:49:38'),(40,'MacBook Pro 16 inch M3 Max 1TB',2,1,'Apple','MacBook Pro 16 inch dùng chip M3 Max 16-core CPU, GPU 40-core, màn hình XDR và pin 22 giờ.',76990000.00,2.00,12,'Bảo hành chính hãng Apple 12 tháng (hỗ trợ AppleCare+)','active',1,'2025-12-01 02:13:33','2025-12-01 02:56:08'),(41,'Lenovo Yoga 9i 14 Gen 9',2,17,'Lenovo','Yoga 9i Gen 9 với bản lề Sound Bar, màn hình OLED 2.8K cảm ứng và Intel Core Ultra 7.',42990000.00,7.00,24,'Bảo hành chính hãng Lenovo Premium Care 24 tháng','active',1,'2025-12-01 02:13:33','2025-12-01 02:56:07'),(42,'Lenovo Legion 9i 16 2024',2,17,'Lenovo','Legion 9i 16 trang bị làm mát chất lỏng, GPU RTX 4090 16GB và mini-LED 3.2K 165Hz.',79990000.00,5.00,24,'Bảo hành chính hãng Lenovo Legion Ultimate 24 tháng','active',1,'2025-12-01 02:13:33','2025-12-01 02:56:09'),(43,'Microsoft Surface Laptop Studio 2',2,18,'Microsoft','Surface Laptop Studio 2 với bản lề Dynamic Woven, GPU RTX 4060 và màn hình PixelSense Flow 120Hz.',69990000.00,6.00,24,'Bảo hành chính hãng Microsoft 24 tháng','active',1,'2025-12-01 02:13:33','2025-12-12 02:49:30'),(44,'HP Envy 16 2024',2,6,'HP','HP Envy 16 màn hình 16 inch 120Hz, CPU Intel Core Ultra và GPU RTX 4060 dành cho sáng tạo.',36990000.00,8.00,24,'Bảo hành chính hãng HP 24 tháng, hỗ trợ onsite','active',1,'2025-12-01 02:13:33','2025-12-12 02:49:30'),(45,'Dell XPS 14 9440',2,5,'Dell','Dell XPS 14 viền siêu mỏng, màn hình 3.2K OLED, CPU Intel Core Ultra 7 và RTX 4050.',45990000.00,5.00,24,'Bảo hành chính hãng Dell Premium Support 24 tháng','active',1,'2025-12-01 02:13:33','2025-12-12 02:49:29'),(46,'ASUS Zenbook 14 OLED UX3405',2,4,'ASUS','Zenbook 14 OLED UX3405 nhẹ 1.2kg, OLED 3K 120Hz và pin 75Wh cho 16 giờ sử dụng.',32990000.00,9.00,24,'Bảo hành chính hãng ASUS 24 tháng','active',1,'2025-12-01 02:13:33','2025-12-12 02:49:28'),(47,'Acer Swift X 16 2024',2,19,'Acer','Swift X 16 sử dụng Ryzen 9 7940HS, GPU RTX 4050 và màn hình OLED 3.2K 120Hz.',28990000.00,10.00,24,'Bảo hành chính hãng Acer 24 tháng','active',1,'2025-12-01 02:13:33','2025-12-12 02:49:27'),(48,'Razer Blade 16 (2024)',2,20,'Razer','Razer Blade 16 khung CNC, mini-LED dual-mode 240Hz/120Hz và RTX 4090 16GB.',84990000.00,4.00,24,'Bảo hành chính hãng Razer 24 tháng','active',1,'2025-12-01 02:13:33','2025-12-01 02:56:06'),(49,'iPad Pro 11 inch M4 Wi-Fi 512GB',3,1,'Apple','iPad Pro 11 inch M4 với màn hình Tandem OLED, Apple Pencil Pro và chip M4 mạnh mẽ.',36990000.00,3.00,12,'Bảo hành chính hãng Apple 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:51:00'),(50,'Samsung Galaxy Tab S9 FE+ 5G',3,2,'Samsung','Galaxy Tab S9 FE+ màn hình 12.4 inch 90Hz, kháng nước IP68 và bút S Pen đi kèm.',15990000.00,12.00,12,'Bảo hành chính hãng Samsung 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:51:34'),(51,'Xiaomi Pad 6 Pro 512GB',3,3,'Xiaomi','Xiaomi Pad 6 Pro với Snapdragon 8+ Gen 1, màn hình 144Hz 11 inch và pin kép 8600mAh.',12990000.00,8.00,12,'Bảo hành chính hãng Xiaomi 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:44:11'),(52,'Lenovo Tab Extreme',3,17,'Lenovo','Lenovo Tab Extreme 14.5 inch OLED 3K, chip Dimensity 9000 và bàn phím từ đi kèm.',24990000.00,10.00,24,'Bảo hành chính hãng Lenovo 24 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:52:32'),(53,'Huawei MatePad Pro 13.2',3,16,'Huawei','MatePad Pro 13.2 màn hình OLED 144Hz cực mỏng 5.5mm, hỗ trợ M-Pencil thế hệ 3.',28990000.00,7.00,12,'Bảo hành chính hãng Huawei 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:43:20'),(54,'Apple Watch Series 9 GPS 45mm',4,1,'Apple','Apple Watch Series 9 với chip S9 SiP, cử chỉ Double Tap và theo dõi sức khỏe toàn diện.',11990000.00,5.00,12,'Bảo hành chính hãng Apple 12 tháng','active',1,'2025-12-01 02:13:33','2025-12-01 02:42:56'),(55,'Samsung Galaxy Watch6 Classic LTE 47mm',4,2,'Samsung','Galaxy Watch6 Classic khung thép, bezel xoay vật lý và đo huyết áp, ECG tại chỗ.',10990000.00,8.00,12,'Bảo hành chính hãng Samsung 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:37:35'),(56,'Garmin Fenix 7 Pro Sapphire Solar',4,21,'Garmin','Fenix 7 Pro Sapphire Solar với kính Power Sapphire, pin đến 22 ngày và hàng trăm chế độ thể thao.',19990000.00,5.00,24,'Bảo hành chính hãng Garmin 24 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:41:47'),(57,'Sony WF-1000XM5',4,15,'Sony','Tai nghe True Wireless Sony WF-1000XM5 chống ồn HD QN2e, driver Dynamic Driver X và pin 8 giờ.',6490000.00,7.00,12,'Bảo hành chính hãng Sony 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:42:23'),(58,'Bose QuietComfort Ultra Headphones',4,22,'Bose','Bose QuietComfort Ultra với Immersive Audio, ANC chủ động và thiết kế sang trọng.',8990000.00,6.00,12,'Bảo hành chính hãng Bose 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:52:00'),(59,'Logitech MX Master 3S',4,23,'Logitech','Chuột Logitech MX Master 3S cảm biến 8K DPI, cuộn MagSpeed và kết nối đa thiết bị.',2490000.00,5.00,12,'Bảo hành chính hãng Logitech 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:51:53'),(60,'DJI Osmo Mobile 6',4,24,'DJI','Gimbal DJI Osmo Mobile 6 với ActiveTrack 6.0, cần kéo và bảng điều khiển tích hợp.',3890000.00,5.00,12,'Bảo hành chính hãng DJI 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:36:59'),(61,'Anker 737 Power Bank (PowerCore 24K)',4,25,'Anker','Pin dự phòng Anker 737 công suất 140W, màn hình thông minh và pin 24.000mAh.',4490000.00,10.00,18,'Bảo hành chính hãng Anker 18 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:35:40'),(62,'Razer Basilisk V3 Pro',4,20,'Razer','Chuột Razer Basilisk V3 Pro 30K DPI Focus Pro, Hyperspeed Wireless và 13 vùng LED.',3990000.00,6.00,12,'Bảo hành chính hãng Razer 12 tháng','active',0,'2025-12-01 02:13:33','2025-12-01 02:34:25');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `promotions`
--

DROP TABLE IF EXISTS `promotions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `promotions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(200) NOT NULL,
  `discount_type` enum('percentage','fixed') NOT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `min_order_value` decimal(12,2) DEFAULT '0.00',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `usage_limit` int DEFAULT NULL COMMENT 'null = không giới hạn',
  `used_count` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `promotions`
--

LOCK TABLES `promotions` WRITE;
/*!40000 ALTER TABLE `promotions` DISABLE KEYS */;
INSERT INTO `promotions` VALUES (1,'WELCOME10','Giảm 10% cho khách hàng mới','percentage',10.00,1000000.00,'2024-01-01','2024-12-31',1000,0,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(2,'SALE20','Giảm 20% đơn hàng trên 5 triệu','percentage',20.00,5000000.00,'2024-01-01','2024-12-31',NULL,0,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(3,'FIXED50K','Giảm 50.000đ cho đơn hàng trên 2 triệu','fixed',50000.00,2000000.00,'2024-01-01','2024-12-31',5000,0,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(4,'BLACKFRIDAY','Giảm 30% Black Friday','percentage',30.00,3000000.00,'2024-11-20','2024-11-30',NULL,0,'2025-12-01 02:13:33','2025-12-01 02:13:33'),(5,'NEWYEAR2025','Giảm 15% năm mới 2025','percentage',15.00,1000000.00,'2024-12-25','2025-01-15',2000,0,'2025-12-01 02:13:33','2025-12-01 02:13:33');
/*!40000 ALTER TABLE `promotions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_id` int DEFAULT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `idx_reviews_product` (`product_id`),
  KEY `idx_reviews_user` (`user_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `reviews_chk_1` CHECK (((`rating` >= 1) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (1,2,4,1,5,'iPhone 15 rất đẹp, camera tốt, pin trâu. Giao hàng nhanh, đóng gói cẩn thận. Rất hài lòng!','approved','2025-12-01 02:13:33','2025-12-01 02:13:33'),(2,17,4,1,5,'AirPods Pro 2 chất lượng âm thanh tuyệt vời, chống ồn rất tốt. Đáng đồng tiền bát gạo!','approved','2025-12-01 02:13:33','2025-12-01 02:13:33'),(3,4,5,2,4,'Samsung S24 Ultra màn hình đẹp, camera 200MP chụp rất nét. Pin trâu, dùng cả ngày không lo hết pin.','approved','2025-12-01 02:13:33','2025-12-01 02:13:33'),(4,18,5,2,5,'Galaxy Buds2 Pro âm thanh hay, pin lâu, thiết kế đẹp. Rất đáng mua!','approved','2025-12-01 02:13:33','2025-12-01 02:13:33'),(5,40,5,4,4,'đẹp','approved','2025-12-12 03:34:07','2025-12-12 03:34:07'),(6,38,6,9,4,'Màn hình to , nhanh , pin trâu','approved','2025-12-13 11:35:18','2025-12-13 11:35:18'),(7,25,5,10,5,'sản phẩm tốt , nhân viên nhiệt tình','approved','2025-12-13 11:39:00','2025-12-13 11:39:00');
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
INSERT INTO `suppliers` VALUES (1,'Apple Vietnam','John Smith','contact@apple.vn','1900123456','Apple Store, Vincom Center, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(2,'Samsung Vietnam','Park Ji-hoon','contact@samsung.vn','1900123457','Samsung Store, Landmark 81, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(3,'Xiaomi Vietnam','Li Wei','contact@xiaomi.vn','1900123458','Xiaomi Store, Aeon Mall, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(4,'ASUS Vietnam','Chen Ming','contact@asus.vn','1900123459','ASUS Store, District 1, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(5,'Dell Vietnam','Michael Brown','contact@dell.vn','1900123460','Dell Store, District 3, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(6,'HP Vietnam','David Wilson','contact@hp.vn','1900123461','HP Store, District 7, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(7,'Google Vietnam','Emily Nguyen','contact@googledevices.vn','1900123462','Google Store, District 1, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(8,'OPPO Vietnam','Tran Minh','support@oppo.vn','1900123463','Oppo Experience Store, Nguyen Trai, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(9,'OnePlus Vietnam','Pham Long','hello@oneplus.vn','1900123464','OnePlus Hub, District 3, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(10,'Vivo Vietnam','Le Tuan','contact@vivo.vn','1900123465','Vivo Store, Bitexco, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(11,'realme Vietnam','Nguyen Gia','support@realme.vn','1900123466','Realme Brandshop, District 10, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(12,'Honor Vietnam','Pham Duy','info@honor.vn','1900123467','Honor Experience Store, Vincom Dong Khoi, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(13,'Nothing Technology Vietnam','Chan Hoang','hello@nothing.vn','1900123468','Nothing Pop-up, Crescent Mall, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(14,'Motorola Vietnam','Vo Khanh','support@motorola.vn','1900123469','Motorola Service Center, District 5, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(15,'Sony Vietnam','Fujita Ken','contact@sony.vn','1900123470','Sony Center Crescent Mall, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(16,'Huawei Vietnam','Zhang Wei','support@huawei.vn','1900123471','Huawei Experience Store, Saigon Centre, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(17,'Lenovo Vietnam','Doan Phuc','lenovo@lenovo.vn','1900123472','Lenovo Exclusive Store, District 1, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(18,'Microsoft Vietnam','Pham Khoa','surface@microsoft.vn','1900123473','Surface Hub, Nguyen Thi Minh Khai, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(19,'Acer Vietnam','Lam Quoc','contact@acer.vn','1900123474','Acer Concept Store, District 7, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(20,'Razer Asia','Jason Tan','sea@razer.com','1900123475','RazerStore, Funan Mall, Singapore','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(21,'Garmin Vietnam','Nguyen Loc','support@garmin.vn','1900123476','Garmin Brand Store, District 1, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(22,'Bose Vietnam','Tran Ly','info@bose.vn','1900123477','Bose Store, District 3, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(23,'Logitech Vietnam','Hoang Luong','hello@logitech.vn','1900123478','Logitech Flagship Store, Crescent Mall, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(24,'DJI Vietnam','Vu Ho','support@dji.vn','1900123479','DJI Authorized Store, District 1, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(25,'Anker Vietnam','Pham Ha','support@anker.vn','1900123480','Anker Experience Store, District 3, Ho Chi Minh City','active','2025-12-01 02:13:33','2025-12-01 02:13:33');
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_logs`
--

DROP TABLE IF EXISTS `system_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `record_id` int DEFAULT NULL,
  `description` text,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_system_logs_user` (`user_id`),
  KEY `idx_system_logs_action` (`action`),
  CONSTRAINT `system_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=256 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_logs`
--

LOCK TABLES `system_logs` WRITE;
/*!40000 ALTER TABLE `system_logs` DISABLE KEYS */;
INSERT INTO `system_logs` VALUES (1,1,'LOGIN','users',1,'Admin đăng nhập hệ thống','192.168.1.100','2025-12-01 02:13:33','2025-12-01 02:13:33'),(2,2,'LOGIN','users',2,'Manager đăng nhập hệ thống','192.168.1.101','2025-12-01 02:13:33','2025-12-01 02:13:33'),(3,3,'UPDATE','orders',1,'Nhân viên cập nhật trạng thái đơn hàng','192.168.1.102','2025-12-01 02:13:33','2025-12-01 02:13:33'),(4,3,'UPDATE','orders',2,'Nhân viên cập nhật trạng thái đơn hàng','192.168.1.102','2025-12-01 02:13:33','2025-12-01 02:13:33'),(5,4,'CREATE','orders',1,'Khách hàng tạo đơn hàng mới','192.168.1.103','2025-12-01 02:13:33','2025-12-01 02:13:33'),(6,5,'CREATE','orders',2,'Khách hàng tạo đơn hàng mới','192.168.1.104','2025-12-01 02:13:33','2025-12-01 02:13:33'),(7,6,'CREATE','orders',3,'Khách hàng tạo đơn hàng mới','192.168.1.105','2025-12-01 02:13:33','2025-12-01 02:13:33'),(8,4,'CREATE','reviews',1,'Khách hàng đánh giá sản phẩm','192.168.1.103','2025-12-01 02:13:33','2025-12-01 02:13:33'),(9,5,'CREATE','reviews',3,'Khách hàng đánh giá sản phẩm','192.168.1.104','2025-12-01 02:13:33','2025-12-01 02:13:33'),(10,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-01 02:15:01','2025-12-01 02:15:01'),(11,5,'LOGIN',NULL,NULL,'User user02 đăng nhập','172.18.0.1','2025-12-01 02:15:04','2025-12-01 02:15:04'),(12,5,'LOGOUT',NULL,NULL,'User user02 đăng xuất','172.18.0.1','2025-12-01 02:15:07','2025-12-01 02:15:07'),(13,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-01 02:15:09','2025-12-01 02:15:09'),(14,2,'UPDATE','products',44,'Cập nhật sản phẩm: HP Envy 16 2024','172.18.0.1','2025-12-01 02:26:33','2025-12-01 02:26:33'),(15,2,'UPDATE','products',35,'Cập nhật sản phẩm: Sony Xperia 1 V','172.18.0.1','2025-12-01 02:26:43','2025-12-01 02:26:43'),(16,2,'UPDATE','products',43,'Cập nhật sản phẩm: Microsoft Surface Laptop Studio 2','172.18.0.1','2025-12-01 02:27:09','2025-12-01 02:27:09'),(17,2,'UPDATE','products',43,'Cập nhật sản phẩm: Microsoft Surface Laptop Studio 2','172.18.0.1','2025-12-01 02:27:10','2025-12-01 02:27:10'),(18,2,'UPDATE','products',43,'Cập nhật sản phẩm: Microsoft Surface Laptop Studio 2','172.18.0.1','2025-12-01 02:27:11','2025-12-01 02:27:11'),(19,2,'UPDATE','products',43,'Cập nhật sản phẩm: Microsoft Surface Laptop Studio 2','172.18.0.1','2025-12-01 02:27:14','2025-12-01 02:27:14'),(20,2,'UPDATE','products',44,'Cập nhật sản phẩm: HP Envy 16 2024','172.18.0.1','2025-12-01 02:27:37','2025-12-01 02:27:37'),(21,2,'UPDATE','products',42,'Cập nhật sản phẩm: Lenovo Legion 9i 16 2024','172.18.0.1','2025-12-01 02:28:05','2025-12-01 02:28:05'),(22,2,'UPDATE','products',42,'Cập nhật sản phẩm: Lenovo Legion 9i 16 2024','172.18.0.1','2025-12-01 02:28:06','2025-12-01 02:28:06'),(23,2,'UPDATE','products',42,'Cập nhật sản phẩm: Lenovo Legion 9i 16 2024','172.18.0.1','2025-12-01 02:28:07','2025-12-01 02:28:07'),(24,2,'UPDATE','products',42,'Cập nhật sản phẩm: Lenovo Legion 9i 16 2024','172.18.0.1','2025-12-01 02:28:09','2025-12-01 02:28:09'),(25,2,'UPDATE','products',41,'Cập nhật sản phẩm: Lenovo Yoga 9i 14 Gen 9','172.18.0.1','2025-12-01 02:28:31','2025-12-01 02:28:31'),(26,2,'UPDATE','products',38,'Cập nhật sản phẩm: Huawei Mate 60 Pro 12GB/512GB','172.18.0.1','2025-12-01 02:29:04','2025-12-01 02:29:04'),(27,2,'UPDATE','products',45,'Cập nhật sản phẩm: Dell XPS 14 9440','172.18.0.1','2025-12-01 02:29:49','2025-12-01 02:29:49'),(28,2,'UPDATE','products',45,'Cập nhật sản phẩm: Dell XPS 14 9440','172.18.0.1','2025-12-01 02:29:51','2025-12-01 02:29:51'),(29,2,'UPDATE','products',45,'Cập nhật sản phẩm: Dell XPS 14 9440','172.18.0.1','2025-12-01 02:29:51','2025-12-01 02:29:51'),(30,2,'UPDATE','products',45,'Cập nhật sản phẩm: Dell XPS 14 9440','172.18.0.1','2025-12-01 02:29:54','2025-12-01 02:29:54'),(31,2,'UPDATE','products',34,'Cập nhật sản phẩm: Motorola Razr 40 Ultra','172.18.0.1','2025-12-01 02:30:16','2025-12-01 02:30:16'),(32,2,'UPDATE','products',30,'Cập nhật sản phẩm: vivo X100 Pro 16GB/512GB','172.18.0.1','2025-12-01 02:30:40','2025-12-01 02:30:40'),(33,2,'UPDATE','products',30,'Cập nhật sản phẩm: vivo X100 Pro 16GB/512GB','172.18.0.1','2025-12-01 02:30:45','2025-12-01 02:30:45'),(34,2,'UPDATE','products',27,'Cập nhật sản phẩm: Samsung Galaxy Z Flip5 512GB','172.18.0.1','2025-12-01 02:31:18','2025-12-01 02:31:18'),(35,2,'UPDATE','products',27,'Cập nhật sản phẩm: Samsung Galaxy Z Flip5 512GB','172.18.0.1','2025-12-01 02:31:29','2025-12-01 02:31:29'),(36,2,'UPDATE','products',33,'Cập nhật sản phẩm: Nothing Phone (2) 12GB/512GB','172.18.0.1','2025-12-01 02:31:37','2025-12-01 02:31:37'),(37,2,'UPDATE','products',33,'Cập nhật sản phẩm: Nothing Phone (2) 12GB/512GB','172.18.0.1','2025-12-01 02:31:40','2025-12-01 02:31:40'),(38,2,'UPDATE','products',26,'Cập nhật sản phẩm: Samsung Galaxy S24+ 512GB','172.18.0.1','2025-12-01 02:32:21','2025-12-01 02:32:21'),(39,2,'UPDATE','products',26,'Cập nhật sản phẩm: Samsung Galaxy S24+ 512GB','172.18.0.1','2025-12-01 02:32:25','2025-12-01 02:32:25'),(40,2,'DELETE','products',63,'Xóa sản phẩm: Sony PlayStation 5 Slim (Phiên bản ổ đĩa)','172.18.0.1','2025-12-01 02:33:14','2025-12-01 02:33:14'),(41,2,'UPDATE','products',62,'Cập nhật sản phẩm: Razer Basilisk V3 Pro','172.18.0.1','2025-12-01 02:34:04','2025-12-01 02:34:04'),(42,2,'UPDATE','products',62,'Cập nhật sản phẩm: Razer Basilisk V3 Pro','172.18.0.1','2025-12-01 02:34:09','2025-12-01 02:34:09'),(43,2,'UPDATE','products',62,'Cập nhật sản phẩm: Razer Basilisk V3 Pro','172.18.0.1','2025-12-01 02:34:14','2025-12-01 02:34:14'),(44,2,'UPDATE','products',62,'Cập nhật sản phẩm: Razer Basilisk V3 Pro','172.18.0.1','2025-12-01 02:34:25','2025-12-01 02:34:25'),(45,2,'UPDATE','products',54,'Cập nhật sản phẩm: Apple Watch Series 9 GPS 45mm','172.18.0.1','2025-12-01 02:35:01','2025-12-01 02:35:01'),(46,2,'UPDATE','products',61,'Cập nhật sản phẩm: Anker 737 Power Bank (PowerCore 24K)','172.18.0.1','2025-12-01 02:35:40','2025-12-01 02:35:40'),(47,2,'UPDATE','products',60,'Cập nhật sản phẩm: DJI Osmo Mobile 6','172.18.0.1','2025-12-01 02:36:59','2025-12-01 02:36:59'),(48,2,'UPDATE','products',55,'Cập nhật sản phẩm: Samsung Galaxy Watch6 Classic LTE 47mm','172.18.0.1','2025-12-01 02:37:35','2025-12-01 02:37:35'),(49,2,'UPDATE','products',58,'Cập nhật sản phẩm: Bose QuietComfort Ultra Headphones','172.18.0.1','2025-12-01 02:38:23','2025-12-01 02:38:23'),(50,2,'UPDATE','products',37,'Cập nhật sản phẩm: Xiaomi 13T Pro 12GB/512GB','172.18.0.1','2025-12-01 02:38:59','2025-12-01 02:38:59'),(51,2,'UPDATE','products',47,'Cập nhật sản phẩm: Acer Swift X 16 2024','172.18.0.1','2025-12-01 02:39:27','2025-12-01 02:39:27'),(52,2,'UPDATE','products',46,'Cập nhật sản phẩm: ASUS Zenbook 14 OLED UX3405','172.18.0.1','2025-12-01 02:39:49','2025-12-01 02:39:49'),(53,2,'UPDATE','products',48,'Cập nhật sản phẩm: Razer Blade 16 (2024)','172.18.0.1','2025-12-01 02:40:17','2025-12-01 02:40:17'),(54,2,'UPDATE','products',36,'Cập nhật sản phẩm: ASUS ROG Phone 8 Pro 24GB/1TB','172.18.0.1','2025-12-01 02:40:26','2025-12-01 02:40:26'),(55,2,'UPDATE','products',32,'Cập nhật sản phẩm: Honor Magic6 Pro 12GB/512GB','172.18.0.1','2025-12-01 02:40:33','2025-12-01 02:40:33'),(56,2,'UPDATE','products',32,'Cập nhật sản phẩm: Honor Magic6 Pro 12GB/512GB','172.18.0.1','2025-12-01 02:40:36','2025-12-01 02:40:36'),(57,2,'UPDATE','products',31,'Cập nhật sản phẩm: realme GT5 Pro 16GB/512GB','172.18.0.1','2025-12-01 02:40:41','2025-12-01 02:40:41'),(58,2,'UPDATE','products',31,'Cập nhật sản phẩm: realme GT5 Pro 16GB/512GB','172.18.0.1','2025-12-01 02:40:43','2025-12-01 02:40:43'),(59,2,'UPDATE','products',29,'Cập nhật sản phẩm: OnePlus 12 16GB/512GB','172.18.0.1','2025-12-01 02:40:51','2025-12-01 02:40:51'),(60,2,'UPDATE','products',28,'Cập nhật sản phẩm: OPPO Find X7 Ultra','172.18.0.1','2025-12-01 02:41:20','2025-12-01 02:41:20'),(61,2,'UPDATE','products',56,'Cập nhật sản phẩm: Garmin Fenix 7 Pro Sapphire Solar','172.18.0.1','2025-12-01 02:41:47','2025-12-01 02:41:47'),(62,2,'UPDATE','products',57,'Cập nhật sản phẩm: Sony WF-1000XM5','172.18.0.1','2025-12-01 02:42:23','2025-12-01 02:42:23'),(63,2,'UPDATE','products',54,'Cập nhật sản phẩm: Apple Watch Series 9 GPS 45mm','172.18.0.1','2025-12-01 02:42:56','2025-12-01 02:42:56'),(64,2,'UPDATE','products',53,'Cập nhật sản phẩm: Huawei MatePad Pro 13.2','172.18.0.1','2025-12-01 02:43:20','2025-12-01 02:43:20'),(65,2,'UPDATE','products',51,'Cập nhật sản phẩm: Xiaomi Pad 6 Pro 512GB','172.18.0.1','2025-12-01 02:44:11','2025-12-01 02:44:11'),(66,2,'UPDATE','products',4,'Cập nhật sản phẩm: Samsung Galaxy S24 Ultra 256GB','172.18.0.1','2025-12-01 02:44:33','2025-12-01 02:44:33'),(67,2,'UPDATE','products',4,'Cập nhật sản phẩm: Samsung Galaxy S24 Ultra 256GB','172.18.0.1','2025-12-01 02:44:39','2025-12-01 02:44:39'),(68,2,'UPDATE','products',10,'Cập nhật sản phẩm: Dell Alienware m16 R2','172.18.0.1','2025-12-01 02:44:59','2025-12-01 02:44:59'),(69,2,'UPDATE','products',9,'Cập nhật sản phẩm: ASUS ROG Strix G16 2024','172.18.0.1','2025-12-01 02:45:28','2025-12-01 02:45:28'),(70,2,'UPDATE','products',6,'Cập nhật sản phẩm: Samsung Galaxy Z Fold5 512GB','172.18.0.1','2025-12-01 02:45:59','2025-12-01 02:45:59'),(71,2,'UPDATE','products',11,'Cập nhật sản phẩm: MacBook Pro 14 inch M3','172.18.0.1','2025-12-01 02:46:28','2025-12-01 02:46:28'),(72,2,'UPDATE','products',3,'Cập nhật sản phẩm: iPhone 14 Pro 256GB','172.18.0.1','2025-12-01 02:46:40','2025-12-01 02:46:40'),(73,2,'UPDATE','products',5,'Cập nhật sản phẩm: Samsung Galaxy S23 128GB','172.18.0.1','2025-12-01 02:46:49','2025-12-01 02:46:49'),(74,2,'UPDATE','products',18,'Cập nhật sản phẩm: Samsung Galaxy Buds2 Pro','172.18.0.1','2025-12-01 02:47:32','2025-12-01 02:47:32'),(75,2,'UPDATE','products',25,'Cập nhật sản phẩm: Google Pixel 8 128GB','172.18.0.1','2025-12-01 02:47:44','2025-12-01 02:47:44'),(76,2,'UPDATE','products',24,'Cập nhật sản phẩm: Google Pixel 8 Pro 256GB','172.18.0.1','2025-12-01 02:48:09','2025-12-01 02:48:09'),(77,2,'UPDATE','products',23,'Cập nhật sản phẩm: Samsung Clear Standing Cover Galaxy S24','172.18.0.1','2025-12-01 02:48:36','2025-12-01 02:48:36'),(78,2,'UPDATE','products',22,'Cập nhật sản phẩm: Apple MagSafe Case iPhone 15 Pro','172.18.0.1','2025-12-01 02:49:03','2025-12-01 02:49:03'),(79,2,'UPDATE','products',21,'Cập nhật sản phẩm: Xiaomi Mi Power Bank 3 20000mAh','172.18.0.1','2025-12-01 02:49:50','2025-12-01 02:49:50'),(80,2,'UPDATE','products',19,'Cập nhật sản phẩm: Sony WH-1000XM5','172.18.0.1','2025-12-01 02:50:08','2025-12-01 02:50:08'),(81,2,'UPDATE','products',41,'Cập nhật sản phẩm: Lenovo Yoga 9i 14 Gen 9','172.18.0.1','2025-12-01 02:50:25','2025-12-01 02:50:25'),(82,2,'UPDATE','products',39,'Cập nhật sản phẩm: MacBook Air 15 inch M3 512GB','172.18.0.1','2025-12-01 02:50:37','2025-12-01 02:50:37'),(83,2,'UPDATE','products',49,'Cập nhật sản phẩm: iPad Pro 11 inch M4 Wi-Fi 512GB','172.18.0.1','2025-12-01 02:51:00','2025-12-01 02:51:00'),(84,2,'UPDATE','products',40,'Cập nhật sản phẩm: MacBook Pro 16 inch M3 Max 1TB','172.18.0.1','2025-12-01 02:51:11','2025-12-01 02:51:11'),(85,2,'UPDATE','products',50,'Cập nhật sản phẩm: Samsung Galaxy Tab S9 FE+ 5G','172.18.0.1','2025-12-01 02:51:34','2025-12-01 02:51:34'),(86,2,'UPDATE','products',59,'Cập nhật sản phẩm: Logitech MX Master 3S','172.18.0.1','2025-12-01 02:51:53','2025-12-01 02:51:53'),(87,2,'UPDATE','products',58,'Cập nhật sản phẩm: Bose QuietComfort Ultra Headphones','172.18.0.1','2025-12-01 02:51:56','2025-12-01 02:51:56'),(88,2,'UPDATE','products',58,'Cập nhật sản phẩm: Bose QuietComfort Ultra Headphones','172.18.0.1','2025-12-01 02:52:00','2025-12-01 02:52:00'),(89,2,'UPDATE','products',8,'Cập nhật sản phẩm: Xiaomi Redmi Note 13 Pro 256GB','172.18.0.1','2025-12-01 02:52:14','2025-12-01 02:52:14'),(90,2,'UPDATE','products',52,'Cập nhật sản phẩm: Lenovo Tab Extreme','172.18.0.1','2025-12-01 02:52:32','2025-12-01 02:52:32'),(91,2,'UPDATE','products',7,'Cập nhật sản phẩm: Xiaomi 14 Pro 512GB','172.18.0.1','2025-12-01 02:52:42','2025-12-01 02:52:42'),(92,2,'UPDATE','products',24,'Cập nhật sản phẩm: Google Pixel 8 Pro 256GB','172.18.0.1','2025-12-01 02:52:47','2025-12-01 02:52:47'),(93,2,'UPDATE','products',20,'Cập nhật sản phẩm: Anker PowerCore 20000mAh','172.18.0.1','2025-12-01 02:53:11','2025-12-01 02:53:11'),(94,2,'UPDATE','products',17,'Cập nhật sản phẩm: AirPods Pro 2 (USB-C)','172.18.0.1','2025-12-01 02:53:46','2025-12-01 02:53:46'),(95,2,'UPDATE','products',17,'Cập nhật sản phẩm: AirPods Pro 2 (USB-C)','172.18.0.1','2025-12-01 02:53:50','2025-12-01 02:53:50'),(96,2,'UPDATE','products',16,'Cập nhật sản phẩm: Samsung Galaxy Tab S9 Ultra','172.18.0.1','2025-12-01 02:54:16','2025-12-01 02:54:16'),(97,2,'UPDATE','products',13,'Cập nhật sản phẩm: HP Spectre x360 14','172.18.0.1','2025-12-01 02:55:36','2025-12-01 02:55:36'),(98,2,'UPDATE','products',12,'Cập nhật sản phẩm: Dell XPS 13 Plus','172.18.0.1','2025-12-01 02:56:01','2025-12-01 02:56:01'),(99,2,'UPDATE','products',38,'Cập nhật sản phẩm: Huawei Mate 60 Pro 12GB/512GB','172.18.0.1','2025-12-01 02:56:05','2025-12-01 02:56:05'),(100,2,'UPDATE','products',48,'Cập nhật sản phẩm: Razer Blade 16 (2024)','172.18.0.1','2025-12-01 02:56:06','2025-12-01 02:56:06'),(101,2,'UPDATE','products',41,'Cập nhật sản phẩm: Lenovo Yoga 9i 14 Gen 9','172.18.0.1','2025-12-01 02:56:07','2025-12-01 02:56:07'),(102,2,'UPDATE','products',40,'Cập nhật sản phẩm: MacBook Pro 16 inch M3 Max 1TB','172.18.0.1','2025-12-01 02:56:08','2025-12-01 02:56:08'),(103,2,'UPDATE','products',42,'Cập nhật sản phẩm: Lenovo Legion 9i 16 2024','172.18.0.1','2025-12-01 02:56:09','2025-12-01 02:56:09'),(104,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-01 03:04:36','2025-12-01 03:04:36'),(105,1,'LOGIN',NULL,NULL,'User admin đăng nhập','172.18.0.1','2025-12-01 03:04:40','2025-12-01 03:04:40'),(106,1,'LOGIN',NULL,NULL,'User admin đăng nhập','172.18.0.1','2025-12-09 01:11:27','2025-12-09 01:11:27'),(107,1,'LOGOUT',NULL,NULL,'User admin đăng xuất','172.18.0.1','2025-12-09 01:11:30','2025-12-09 01:11:30'),(108,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-09 01:11:32','2025-12-09 01:11:32'),(109,2,'UPDATE','products',47,'Cập nhật sản phẩm: Acer Swift X 16 2024','172.18.0.1','2025-12-12 02:49:27','2025-12-12 02:49:27'),(110,2,'UPDATE','products',46,'Cập nhật sản phẩm: ASUS Zenbook 14 OLED UX3405','172.18.0.1','2025-12-12 02:49:28','2025-12-12 02:49:28'),(111,2,'UPDATE','products',45,'Cập nhật sản phẩm: Dell XPS 14 9440','172.18.0.1','2025-12-12 02:49:29','2025-12-12 02:49:29'),(112,2,'UPDATE','products',44,'Cập nhật sản phẩm: HP Envy 16 2024','172.18.0.1','2025-12-12 02:49:30','2025-12-12 02:49:30'),(113,2,'UPDATE','products',43,'Cập nhật sản phẩm: Microsoft Surface Laptop Studio 2','172.18.0.1','2025-12-12 02:49:30','2025-12-12 02:49:30'),(114,2,'UPDATE','products',39,'Cập nhật sản phẩm: MacBook Air 15 inch M3 512GB','172.18.0.1','2025-12-12 02:49:38','2025-12-12 02:49:38'),(115,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-12 03:24:02','2025-12-12 03:24:02'),(116,3,'LOGIN',NULL,NULL,'User employee01 đăng nhập','172.18.0.1','2025-12-12 03:24:09','2025-12-12 03:24:09'),(117,3,'UPDATE','orders',2,'Cập nhật trạng thái đơn hàng ORD002: shipping → delivered','172.18.0.1','2025-12-12 03:24:16','2025-12-12 03:24:16'),(118,3,'LOGOUT',NULL,NULL,'User employee01 đăng xuất','172.18.0.1','2025-12-12 03:24:17','2025-12-12 03:24:17'),(119,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-12 03:24:20','2025-12-12 03:24:20'),(120,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-12 03:33:20','2025-12-12 03:33:20'),(121,5,'LOGIN',NULL,NULL,'User user02 đăng nhập','172.18.0.1','2025-12-12 03:33:26','2025-12-12 03:33:26'),(122,5,'CREATE','orders',4,'Tạo đơn hàng: ORD-1765510415178-253C9343','172.18.0.1','2025-12-12 03:33:35','2025-12-12 03:33:35'),(123,5,'LOGOUT',NULL,NULL,'User user02 đăng xuất','172.18.0.1','2025-12-12 03:33:37','2025-12-12 03:33:37'),(124,3,'LOGIN',NULL,NULL,'User employee01 đăng nhập','172.18.0.1','2025-12-12 03:33:40','2025-12-12 03:33:40'),(125,3,'UPDATE','orders',4,'Cập nhật trạng thái đơn hàng ORD-1765510415178-253C9343: pending → shipping','172.18.0.1','2025-12-12 03:33:52','2025-12-12 03:33:52'),(126,3,'LOGOUT',NULL,NULL,'User employee01 đăng xuất','172.18.0.1','2025-12-12 03:33:54','2025-12-12 03:33:54'),(127,5,'LOGIN',NULL,NULL,'User user02 đăng nhập','172.18.0.1','2025-12-12 03:33:57','2025-12-12 03:33:57'),(128,5,'UPDATE','orders',4,'Khách hàng xác nhận đã nhận đơn hàng ORD-1765510415178-253C9343','172.18.0.1','2025-12-12 03:34:00','2025-12-12 03:34:00'),(129,5,'CREATE','reviews',5,'Tạo đánh giá cho sản phẩm ID: 40','172.18.0.1','2025-12-12 03:34:07','2025-12-12 03:34:07'),(130,5,'LOGOUT',NULL,NULL,'User user02 đăng xuất','172.18.0.1','2025-12-12 03:34:12','2025-12-12 03:34:12'),(131,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-12 03:34:15','2025-12-12 03:34:15'),(132,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-12 03:39:03','2025-12-12 03:39:03'),(133,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-12 03:43:13','2025-12-12 03:43:13'),(134,1,'LOGIN',NULL,NULL,'User admin đăng nhập','172.18.0.1','2025-12-12 03:43:17','2025-12-12 03:43:17'),(135,1,'CREATE','users',7,'Tạo user mới: Zodiac','172.18.0.1','2025-12-12 03:44:47','2025-12-12 03:44:47'),(136,1,'LOGOUT',NULL,NULL,'User admin đăng xuất','172.18.0.1','2025-12-12 03:44:58','2025-12-12 03:44:58'),(137,1,'LOGIN',NULL,NULL,'User admin đăng nhập','172.18.0.1','2025-12-12 03:45:13','2025-12-12 03:45:13'),(138,1,'LOGOUT',NULL,NULL,'User admin đăng xuất','172.18.0.1','2025-12-12 03:45:17','2025-12-12 03:45:17'),(139,7,'LOGIN',NULL,NULL,'User Zodiac đăng nhập','172.18.0.1','2025-12-12 03:45:23','2025-12-12 03:45:23'),(140,7,'UPDATE','orders',3,'Cập nhật trạng thái đơn hàng ORD003: pending → delivered','172.18.0.1','2025-12-12 03:45:41','2025-12-12 03:45:41'),(141,7,'LOGOUT',NULL,NULL,'User Zodiac đăng xuất','172.18.0.1','2025-12-12 03:45:43','2025-12-12 03:45:43'),(142,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-12 03:45:46','2025-12-12 03:45:46'),(143,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-12 03:46:22','2025-12-12 03:46:22'),(144,1,'LOGIN',NULL,NULL,'User admin đăng nhập','172.18.0.1','2025-12-12 03:46:27','2025-12-12 03:46:27'),(145,1,'LOGOUT',NULL,NULL,'User admin đăng xuất','172.18.0.1','2025-12-12 03:46:30','2025-12-12 03:46:30'),(146,1,'LOGIN',NULL,NULL,'User admin đăng nhập','172.18.0.1','2025-12-12 03:46:40','2025-12-12 03:46:40'),(147,1,'LOGOUT',NULL,NULL,'User admin đăng xuất','172.18.0.1','2025-12-12 03:46:53','2025-12-12 03:46:53'),(148,7,'LOGIN',NULL,NULL,'User Zodiac đăng nhập','172.18.0.1','2025-12-12 03:46:56','2025-12-12 03:46:56'),(149,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-12 03:47:09','2025-12-12 03:47:09'),(150,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-12 04:00:53','2025-12-12 04:00:53'),(151,5,'LOGIN',NULL,NULL,'User user02 đăng nhập','172.18.0.1','2025-12-12 04:00:57','2025-12-12 04:00:57'),(152,5,'LOGOUT',NULL,NULL,'User user02 đăng xuất','172.18.0.1','2025-12-12 04:00:58','2025-12-12 04:00:58'),(153,6,'LOGIN',NULL,NULL,'User user03 đăng nhập','172.18.0.1','2025-12-12 04:01:03','2025-12-12 04:01:03'),(154,6,'CREATE','orders',5,'Tạo đơn hàng: ORD-1765512067351-7ECDBEE8','172.18.0.1','2025-12-12 04:01:07','2025-12-12 04:01:07'),(155,6,'LOGOUT',NULL,NULL,'User user03 đăng xuất','172.18.0.1','2025-12-12 04:01:10','2025-12-12 04:01:10'),(156,7,'LOGIN',NULL,NULL,'User Zodiac đăng nhập','172.18.0.1','2025-12-12 04:01:18','2025-12-12 04:01:18'),(157,7,'UPDATE','orders',5,'Cập nhật trạng thái đơn hàng ORD-1765512067351-7ECDBEE8: pending → delivered','172.18.0.1','2025-12-12 04:01:21','2025-12-12 04:01:21'),(158,7,'LOGOUT',NULL,NULL,'User Zodiac đăng xuất','172.18.0.1','2025-12-12 04:01:23','2025-12-12 04:01:23'),(159,6,'LOGIN',NULL,NULL,'User user03 đăng nhập','172.18.0.1','2025-12-12 04:01:26','2025-12-12 04:01:26'),(160,6,'LOGOUT',NULL,NULL,'User user03 đăng xuất','172.18.0.1','2025-12-12 04:01:29','2025-12-12 04:01:29'),(161,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-12 04:01:33','2025-12-12 04:01:33'),(162,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-12 04:13:55','2025-12-12 04:13:55'),(163,1,'LOGIN',NULL,NULL,'User admin đăng nhập','172.18.0.1','2025-12-12 04:14:00','2025-12-12 04:14:00'),(164,1,'LOGOUT',NULL,NULL,'User admin đăng xuất','172.18.0.1','2025-12-12 04:18:59','2025-12-12 04:18:59'),(165,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-12 04:19:02','2025-12-12 04:19:02'),(166,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-12 04:33:59','2025-12-12 04:33:59'),(167,6,'LOGIN',NULL,NULL,'User user03 đăng nhập','172.18.0.1','2025-12-12 04:34:04','2025-12-12 04:34:04'),(168,6,'CREATE','orders',6,'Tạo đơn hàng: ORD-1765514052242-2AE7CF0B','172.18.0.1','2025-12-12 04:34:12','2025-12-12 04:34:12'),(169,6,'LOGOUT',NULL,NULL,'User user03 đăng xuất','172.18.0.1','2025-12-12 04:34:13','2025-12-12 04:34:13'),(170,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-12 04:34:16','2025-12-12 04:34:16'),(171,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-12 04:35:03','2025-12-12 04:35:03'),(172,6,'LOGIN',NULL,NULL,'User user03 đăng nhập','172.18.0.1','2025-12-12 04:35:06','2025-12-12 04:35:06'),(173,6,'CREATE','orders',7,'Tạo đơn hàng: ORD-1765514116903-D481C5B1','172.18.0.1','2025-12-12 04:35:16','2025-12-12 04:35:16'),(174,6,'LOGOUT',NULL,NULL,'User user03 đăng xuất','172.18.0.1','2025-12-12 04:35:18','2025-12-12 04:35:18'),(175,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-12 04:35:21','2025-12-12 04:35:21'),(176,2,'UPDATE','products',29,'Cập nhật sản phẩm: OnePlus 12 16GB/512GB','172.18.0.1','2025-12-12 08:25:01','2025-12-12 08:25:01'),(177,2,'UPDATE','products',36,'Cập nhật sản phẩm: ASUS ROG Phone 8 Pro 24GB/1TB','172.18.0.1','2025-12-12 08:31:10','2025-12-12 08:31:10'),(178,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-12 08:38:40','2025-12-12 08:38:40'),(179,1,'LOGIN',NULL,NULL,'User admin đăng nhập','172.18.0.1','2025-12-12 08:38:44','2025-12-12 08:38:44'),(180,1,'LOGOUT',NULL,NULL,'User admin đăng xuất','172.18.0.1','2025-12-12 08:42:23','2025-12-12 08:42:23'),(181,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-12 08:42:26','2025-12-12 08:42:26'),(182,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-12 09:07:44','2025-12-12 09:07:44'),(183,6,'LOGIN',NULL,NULL,'User user03 đăng nhập','172.18.0.1','2025-12-12 09:07:49','2025-12-12 09:07:49'),(184,6,'CREATE','orders',8,'Tạo đơn hàng: ORD-1765530485784-F7357F7A','172.18.0.1','2025-12-12 09:08:05','2025-12-12 09:08:05'),(185,6,'LOGOUT',NULL,NULL,'User user03 đăng xuất','172.18.0.1','2025-12-12 09:08:08','2025-12-12 09:08:08'),(186,3,'LOGIN',NULL,NULL,'User employee01 đăng nhập','172.18.0.1','2025-12-12 09:08:11','2025-12-12 09:08:11'),(187,3,'UPDATE','orders',7,'Cập nhật trạng thái đơn hàng ORD-1765514116903-D481C5B1: pending → shipping','172.18.0.1','2025-12-12 09:08:15','2025-12-12 09:08:15'),(188,3,'LOGOUT',NULL,NULL,'User employee01 đăng xuất','172.18.0.1','2025-12-12 09:08:17','2025-12-12 09:08:17'),(189,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-12 09:08:20','2025-12-12 09:08:20'),(190,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-12 09:13:16','2025-12-12 09:13:16'),(191,3,'LOGIN',NULL,NULL,'User employee01 đăng nhập','172.18.0.1','2025-12-12 09:13:19','2025-12-12 09:13:19'),(192,3,'LOGOUT',NULL,NULL,'User employee01 đăng xuất','172.18.0.1','2025-12-12 09:13:21','2025-12-12 09:13:21'),(193,6,'LOGIN',NULL,NULL,'User user03 đăng nhập','172.18.0.1','2025-12-12 09:13:23','2025-12-12 09:13:23'),(194,6,'UPDATE','orders',7,'Khách hàng xác nhận đã nhận đơn hàng ORD-1765514116903-D481C5B1','172.18.0.1','2025-12-12 09:13:32','2025-12-12 09:13:32'),(195,6,'LOGOUT',NULL,NULL,'User user03 đăng xuất','172.18.0.1','2025-12-12 09:13:35','2025-12-12 09:13:35'),(196,3,'LOGIN',NULL,NULL,'User employee01 đăng nhập','172.18.0.1','2025-12-12 09:13:39','2025-12-12 09:13:39'),(197,3,'LOGOUT',NULL,NULL,'User employee01 đăng xuất','172.18.0.1','2025-12-12 09:13:42','2025-12-12 09:13:42'),(198,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-12 09:13:46','2025-12-12 09:13:46'),(199,2,'CREATE','banners',2,'Tạo banner: Banner Laptop','172.18.0.1','2025-12-12 09:24:33','2025-12-12 09:24:33'),(200,2,'UPDATE','banners',2,'Cập nhật banner: Chào hè giảm deal siêu shock','172.18.0.1','2025-12-12 09:27:05','2025-12-12 09:27:05'),(201,2,'UPDATE','banners',1,'Cập nhật banner: Chào mừng đến Tech Store','172.18.0.1','2025-12-12 09:28:19','2025-12-12 09:28:19'),(202,2,'UPDATE','banners',1,'Cập nhật banner: Chào mừng đến Tech Store','172.18.0.1','2025-12-12 09:28:52','2025-12-12 09:28:52'),(203,2,'UPDATE','banners',2,'Cập nhật banner: ','172.18.0.1','2025-12-13 11:23:22','2025-12-13 11:23:22'),(204,2,'UPDATE','banners',1,'Cập nhật banner: ','172.18.0.1','2025-12-13 11:23:35','2025-12-13 11:23:35'),(205,2,'UPDATE','banners',2,'Cập nhật banner: Chào hè','172.18.0.1','2025-12-13 11:25:30','2025-12-13 11:25:30'),(206,2,'UPDATE','banners',1,'Cập nhật banner: Comback to school','172.18.0.1','2025-12-13 11:27:58','2025-12-13 11:27:58'),(207,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-13 11:34:23','2025-12-13 11:34:23'),(208,6,'LOGIN',NULL,NULL,'User user03 đăng nhập','172.18.0.1','2025-12-13 11:34:27','2025-12-13 11:34:27'),(209,6,'CREATE','orders',9,'Tạo đơn hàng: ORD-1765625675644-8C96D1F7','172.18.0.1','2025-12-13 11:34:35','2025-12-13 11:34:35'),(210,6,'LOGOUT',NULL,NULL,'User user03 đăng xuất','172.18.0.1','2025-12-13 11:34:36','2025-12-13 11:34:36'),(211,3,'LOGIN',NULL,NULL,'User employee01 đăng nhập','172.18.0.1','2025-12-13 11:34:39','2025-12-13 11:34:39'),(212,3,'LOGOUT',NULL,NULL,'User employee01 đăng xuất','172.18.0.1','2025-12-13 11:34:41','2025-12-13 11:34:41'),(213,7,'LOGIN',NULL,NULL,'User Zodiac đăng nhập','172.18.0.1','2025-12-13 11:34:44','2025-12-13 11:34:44'),(214,7,'UPDATE','orders',9,'Cập nhật trạng thái đơn hàng ORD-1765625675644-8C96D1F7: pending → shipping','172.18.0.1','2025-12-13 11:34:47','2025-12-13 11:34:47'),(215,7,'LOGOUT',NULL,NULL,'User Zodiac đăng xuất','172.18.0.1','2025-12-13 11:34:51','2025-12-13 11:34:51'),(216,6,'LOGIN',NULL,NULL,'User user03 đăng nhập','172.18.0.1','2025-12-13 11:34:53','2025-12-13 11:34:53'),(217,6,'UPDATE','orders',9,'Khách hàng xác nhận đã nhận đơn hàng ORD-1765625675644-8C96D1F7','172.18.0.1','2025-12-13 11:34:56','2025-12-13 11:34:56'),(218,6,'CREATE','reviews',6,'Tạo đánh giá cho sản phẩm ID: 38','172.18.0.1','2025-12-13 11:35:18','2025-12-13 11:35:18'),(219,6,'LOGOUT',NULL,NULL,'User user03 đăng xuất','172.18.0.1','2025-12-13 11:35:25','2025-12-13 11:35:25'),(220,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-13 11:35:29','2025-12-13 11:35:29'),(221,2,'CHANGE_PASSWORD',NULL,NULL,'User manager01 đổi mật khẩu','172.18.0.1','2025-12-13 11:37:19','2025-12-13 11:37:19'),(222,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-13 11:37:22','2025-12-13 11:37:22'),(223,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-13 11:37:25','2025-12-13 11:37:25'),(224,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-13 11:37:37','2025-12-13 11:37:37'),(225,5,'LOGIN',NULL,NULL,'User user02 đăng nhập','172.18.0.1','2025-12-13 11:37:40','2025-12-13 11:37:40'),(226,5,'CREATE','orders',10,'Tạo đơn hàng: ORD-1765625882104-159B82A9','172.18.0.1','2025-12-13 11:38:02','2025-12-13 11:38:02'),(227,5,'LOGOUT',NULL,NULL,'User user02 đăng xuất','172.18.0.1','2025-12-13 11:38:07','2025-12-13 11:38:07'),(228,3,'LOGIN',NULL,NULL,'User employee01 đăng nhập','172.18.0.1','2025-12-13 11:38:11','2025-12-13 11:38:11'),(229,3,'UPDATE','orders',10,'Cập nhật trạng thái đơn hàng ORD-1765625882104-159B82A9: pending → shipping','172.18.0.1','2025-12-13 11:38:13','2025-12-13 11:38:13'),(230,3,'LOGOUT',NULL,NULL,'User employee01 đăng xuất','172.18.0.1','2025-12-13 11:38:15','2025-12-13 11:38:15'),(231,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-13 11:38:22','2025-12-13 11:38:22'),(232,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-13 11:38:37','2025-12-13 11:38:37'),(233,5,'LOGIN',NULL,NULL,'User user02 đăng nhập','172.18.0.1','2025-12-13 11:38:40','2025-12-13 11:38:40'),(234,5,'UPDATE','orders',10,'Khách hàng xác nhận đã nhận đơn hàng ORD-1765625882104-159B82A9','172.18.0.1','2025-12-13 11:38:44','2025-12-13 11:38:44'),(235,5,'CREATE','reviews',7,'Tạo đánh giá cho sản phẩm ID: 25','172.18.0.1','2025-12-13 11:39:00','2025-12-13 11:39:00'),(236,5,'LOGOUT',NULL,NULL,'User user02 đăng xuất','172.18.0.1','2025-12-13 11:39:02','2025-12-13 11:39:02'),(237,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-13 11:39:07','2025-12-13 11:39:07'),(238,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-13 11:40:04','2025-12-13 11:40:04'),(239,1,'LOGIN',NULL,NULL,'User admin đăng nhập','172.18.0.1','2025-12-13 11:40:07','2025-12-13 11:40:07'),(240,1,'LOGOUT',NULL,NULL,'User admin đăng xuất','172.18.0.1','2025-12-13 11:44:14','2025-12-13 11:44:14'),(241,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-13 11:44:17','2025-12-13 11:44:17'),(242,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-13 11:44:23','2025-12-13 11:44:23'),(243,5,'LOGIN',NULL,NULL,'User user02 đăng nhập','172.18.0.1','2025-12-13 11:44:26','2025-12-13 11:44:26'),(244,5,'LOGOUT',NULL,NULL,'User user02 đăng xuất','172.18.0.1','2025-12-13 11:47:42','2025-12-13 11:47:42'),(245,1,'LOGIN',NULL,NULL,'User admin đăng nhập','172.18.0.1','2025-12-13 11:47:48','2025-12-13 11:47:48'),(246,1,'LOGOUT',NULL,NULL,'User admin đăng xuất','172.18.0.1','2025-12-13 11:50:55','2025-12-13 11:50:55'),(247,5,'LOGIN',NULL,NULL,'User user02 đăng nhập','172.18.0.1','2025-12-13 11:50:59','2025-12-13 11:50:59'),(248,5,'LOGOUT',NULL,NULL,'User user02 đăng xuất','172.18.0.1','2025-12-13 11:53:43','2025-12-13 11:53:43'),(249,1,'LOGIN',NULL,NULL,'User admin đăng nhập','172.18.0.1','2025-12-13 11:53:47','2025-12-13 11:53:47'),(250,1,'LOGOUT',NULL,NULL,'User admin đăng xuất','172.18.0.1','2025-12-13 11:54:32','2025-12-13 11:54:32'),(251,2,'LOGIN',NULL,NULL,'User manager01 đăng nhập','172.18.0.1','2025-12-13 11:54:36','2025-12-13 11:54:36'),(252,2,'LOGOUT',NULL,NULL,'User manager01 đăng xuất','172.18.0.1','2025-12-13 11:54:42','2025-12-13 11:54:42'),(253,3,'LOGIN',NULL,NULL,'User employee01 đăng nhập','172.18.0.1','2025-12-13 11:54:46','2025-12-13 11:54:46'),(254,3,'UPDATE','orders',10,'Cập nhật trạng thái đơn hàng ORD-1765625882104-159B82A9: delivered → pending','172.18.0.1','2025-12-13 11:55:52','2025-12-13 11:55:52'),(255,3,'UPDATE','orders',10,'Cập nhật trạng thái đơn hàng ORD-1765625882104-159B82A9: pending → shipping','172.18.0.1','2025-12-13 11:56:01','2025-12-13 11:56:01');
/*!40000 ALTER TABLE `system_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `system_settings` (
  `key` varchar(100) NOT NULL,
  `value` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES ('facebook','https://www.facebook.com/long.tien.986','2025-12-01 02:13:33','2025-12-01 03:04:48'),('instagram','https://www.facebook.com/long.tien.986','2025-12-01 02:13:33','2025-12-01 03:04:48'),('maintenance','false','2025-12-01 02:13:33','2025-12-01 03:04:48'),('phone','0123456789','2025-12-01 02:13:33','2025-12-01 03:04:48'),('siteName','Tech Store','2025-12-01 02:13:33','2025-12-01 03:04:48'),('supportEmail','support@example.com','2025-12-01 02:13:33','2025-12-01 03:04:48'),('twitter','https://www.facebook.com/long.tien.986','2025-12-01 02:13:33','2025-12-01 03:04:48');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `role` enum('user','employee','manager','admin') DEFAULT 'user',
  `status` enum('active','inactive','banned') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@techstore.com','$2a$10$k1w1D0lrBCz2ab2e/KtCN.81oxM8AB8L37gMPGO4mRvrXnJ60EcbC','Admin User','0901234567','123 Admin Street, Ho Chi Minh City','admin','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(2,'manager01','manager@techstore.com','$2a$10$Pb.apxoEOeSW3a5F9JonyuKCfzYuhxVx6D0YRR0.uZRmLhVGADyOy','Manager User','0901234568','456 Manager Street, Ho Chi Minh City','manager','active','2025-12-01 02:13:33','2025-12-13 11:37:19'),(3,'employee01','employee@techstore.com','$2a$10$k1w1D0lrBCz2ab2e/KtCN.81oxM8AB8L37gMPGO4mRvrXnJ60EcbC','Employee User','0901234569','789 Employee Street, Ho Chi Minh City','employee','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(4,'user01','user01@example.com','$2a$10$k1w1D0lrBCz2ab2e/KtCN.81oxM8AB8L37gMPGO4mRvrXnJ60EcbC','Nguyen Van A','0901111111','100 User Street, Ho Chi Minh City','user','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(5,'user02','user02@example.com','$2a$10$k1w1D0lrBCz2ab2e/KtCN.81oxM8AB8L37gMPGO4mRvrXnJ60EcbC','Tran Thi B','0902222222','200 User Street, Ha Noi','user','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(6,'user03','user03@example.com','$2a$10$k1w1D0lrBCz2ab2e/KtCN.81oxM8AB8L37gMPGO4mRvrXnJ60EcbC','Le Van C','0903333333','300 User Street, Da Nang','user','active','2025-12-01 02:13:33','2025-12-01 02:13:33'),(7,'Zodiac','employee02@techstore.com','$2a$10$tOWLTybvtUQfBeYt1lAfA.bs4EpSu.2hvq0yq.sPKQD6YAE353ibG','Nguyễn Huy Nghĩa','03123123123','Hà Nội Cầu GIấy','employee','active','2025-12-12 03:44:47','2025-12-12 03:44:47');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-13 13:19:37
