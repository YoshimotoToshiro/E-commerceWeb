const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');

async function cleanupCategories() {
  try {
    console.log('🔄 Đang kết nối database...');
    await sequelize.authenticate();
    console.log('✅ Kết nối database thành công');

    console.log('🔄 Đang chạy script cleanup categories...');

    // Bước 1: Cập nhật sản phẩm từ danh mục con về danh mục cha
    console.log('📝 Bước 1: Cập nhật sản phẩm...');
    
    await sequelize.query(`
      UPDATE products p
      INNER JOIN categories c ON p.category_id = c.id
      SET p.category_id = 1 
      WHERE c.parent_id = 1
    `, { raw: true });
    console.log('✅ Đã cập nhật sản phẩm từ danh mục con của "Điện thoại"');

    await sequelize.query(`
      UPDATE products p
      INNER JOIN categories c ON p.category_id = c.id
      SET p.category_id = 2 
      WHERE c.parent_id = 2
    `, { raw: true });
    console.log('✅ Đã cập nhật sản phẩm từ danh mục con của "Laptop"');

    await sequelize.query(`
      UPDATE products p
      INNER JOIN categories c ON p.category_id = c.id
      SET p.category_id = 3 
      WHERE c.parent_id = 3
    `, { raw: true });
    console.log('✅ Đã cập nhật sản phẩm từ danh mục con của "Tablet"');

    await sequelize.query(`
      UPDATE products p
      INNER JOIN categories c ON p.category_id = c.id
      SET p.category_id = 4 
      WHERE c.parent_id = 4
    `, { raw: true });
    console.log('✅ Đã cập nhật sản phẩm từ danh mục con của "Phụ kiện"');

    // Bước 2: Xóa tất cả danh mục con
    console.log('\n🗑️  Bước 2: Xóa danh mục con...');
    const [deleteResult] = await sequelize.query(
      'DELETE FROM categories WHERE parent_id IS NOT NULL',
      { raw: true }
    );
    console.log(`✅ Đã xóa ${deleteResult.affectedRows || 0} danh mục con`);

    // Bước 3: Xóa các danh mục không phải 4 danh mục chính
    console.log('\n🗑️  Bước 3: Xóa danh mục không hợp lệ...');
    const [deleteInvalidResult] = await sequelize.query(
      `DELETE FROM categories WHERE name NOT IN ('Điện thoại', 'Laptop', 'Tablet', 'Phụ kiện')`,
      { raw: true }
    );
    console.log(`✅ Đã xóa ${deleteInvalidResult.affectedRows || 0} danh mục không hợp lệ`);

    // Kiểm tra kết quả
    const [results] = await sequelize.query(
      'SELECT * FROM categories ORDER BY id',
      { raw: true }
    );

    console.log('\n📊 Kết quả sau khi cleanup:');
    console.table(results);

    console.log('\n✅ Hoàn thành! Đã xóa tất cả danh mục con.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

cleanupCategories();

