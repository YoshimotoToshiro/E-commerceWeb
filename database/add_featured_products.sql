-- Add is_featured column to products table
-- Run this script to add the featured products feature

ALTER TABLE products 
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE NOT NULL 
COMMENT 'Sản phẩm nổi bật' 
AFTER status;

-- Optional: Set some existing products as featured (uncomment if needed)
-- UPDATE products SET is_featured = TRUE WHERE id IN (1, 2, 3, 4, 5);

