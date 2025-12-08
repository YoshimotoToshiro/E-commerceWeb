const bcrypt = require('bcryptjs');
const { User, Category, Supplier, Product, ProductImage, ProductVariant } = require('../models');

async function seedData() {
  try {
    console.log('🌱 Bắt đầu seed data...');

    // Tạo admin account
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const admin = await User.findOrCreate({
      where: { email: 'admin@techstore.com' },
      defaults: {
        username: 'admin',
        email: 'admin@techstore.com',
        password: adminPassword,
        full_name: 'System Admin',
        role: 'admin',
        status: 'active'
      }
    });
    console.log('✅ Admin user created');

    // Tạo manager account
    const managerPassword = await bcrypt.hash('Manager@123', 10);
    const manager = await User.findOrCreate({
      where: { email: 'manager@techstore.com' },
      defaults: {
        username: 'manager',
        email: 'manager@techstore.com',
        password: managerPassword,
        full_name: 'Manager User',
        role: 'manager',
        status: 'active'
      }
    });
    console.log('✅ Manager user created');

    // Tạo test user
    const userPassword = await bcrypt.hash('User@123', 10);
    const user = await User.findOrCreate({
      where: { email: 'user@techstore.com' },
      defaults: {
        username: 'user',
        email: 'user@techstore.com',
        password: userPassword,
        full_name: 'Test User',
        role: 'user',
        status: 'active'
      }
    });
    console.log('✅ Test user created');

    // Tạo categories (chỉ 4 danh mục chính)
    const [laptop, phone, tablet, accessory] = await Promise.all([
      Category.findOrCreate({
        where: { name: 'Laptop' },
        defaults: { name: 'Laptop', description: 'Laptop và máy tính xách tay' }
      }),
      Category.findOrCreate({
        where: { name: 'Điện thoại' },
        defaults: { name: 'Điện thoại', description: 'Điện thoại thông minh và phụ kiện' }
      }),
      Category.findOrCreate({
        where: { name: 'Tablet' },
        defaults: { name: 'Tablet', description: 'Máy tính bảng' }
      }),
      Category.findOrCreate({
        where: { name: 'Phụ kiện' },
        defaults: { name: 'Phụ kiện', description: 'Phụ kiện công nghệ' }
      })
    ]);
    console.log('✅ Categories created');

    // Tạo suppliers
    const [apple, dell] = await Promise.all([
      Supplier.findOrCreate({
        where: { name: 'Apple Inc.' },
        defaults: {
          name: 'Apple Inc.',
          contact_person: 'Tim Cook',
          email: 'contact@apple.com',
          phone: '0123456789',
          status: 'active'
        }
      }),
      Supplier.findOrCreate({
        where: { name: 'Dell Technologies' },
        defaults: {
          name: 'Dell Technologies',
          contact_person: 'Michael Dell',
          email: 'sales@dell.com',
          phone: '0987654321',
          status: 'active'
        }
      })
    ]);
    console.log('✅ Suppliers created');

    // Tạo sample products
    const laptopCategory = laptop[0];
    const phoneCategory = phone[0];
    const appleSupplier = apple[0];
    const dellSupplier = dell[0];

    // Sample Laptop
    const [macbook] = await Product.findOrCreate({
      where: { name: 'MacBook Pro 14" M3' },
      defaults: {
        name: 'MacBook Pro 14" M3',
        category_id: laptopCategory.id,
        supplier_id: appleSupplier.id,
        brand: 'Apple',
        description: 'MacBook Pro 14 inch với chip M3, hiệu năng mạnh mẽ',
        base_price: 49990000,
        discount_percent: 5,
        warranty_period: 12,
        warranty_description: 'Bảo hành chính hãng 12 tháng',
        status: 'active'
      }
    });

    if (macbook[1]) { // Nếu mới tạo
      await ProductImage.bulkCreate([
        {
          product_id: macbook[0].id,
          image_url: 'https://picsum.photos/seed/macbook-pro-1/600/600',
          is_primary: true,
          display_order: 0
        },
        {
          product_id: macbook[0].id,
          image_url: 'https://picsum.photos/seed/macbook-pro-2/600/600',
          is_primary: false,
          display_order: 1
        }
      ]);

      await ProductVariant.bulkCreate([
        {
          product_id: macbook[0].id,
          variant_name: '512GB - Bạc',
          sku: 'MBP14-M3-512-SILVER',
          stock_quantity: 10,
          price_adjustment: 0,
          status: 'active'
        },
        {
          product_id: macbook[0].id,
          variant_name: '1TB - Xám',
          sku: 'MBP14-M3-1TB-GRAY',
          stock_quantity: 5,
          price_adjustment: 5000000,
          status: 'active'
        }
      ]);
    }

    // Sample Phone
    const [iphone] = await Product.findOrCreate({
      where: { name: 'iPhone 15 Pro Max' },
      defaults: {
        name: 'iPhone 15 Pro Max',
        category_id: phoneCategory.id,
        supplier_id: appleSupplier.id,
        brand: 'Apple',
        description: 'iPhone 15 Pro Max 256GB, camera 48MP',
        base_price: 32990000,
        discount_percent: 3,
        warranty_period: 12,
        warranty_description: 'Bảo hành chính hãng 12 tháng',
        status: 'active'
      }
    });

    if (iphone[1]) {
      await ProductImage.bulkCreate([
        {
          product_id: iphone[0].id,
          image_url: 'https://picsum.photos/seed/iphone-15-pro-max-1/600/600',
          is_primary: true,
          display_order: 0
        }
      ]);

      await ProductVariant.bulkCreate([
        {
          product_id: iphone[0].id,
          variant_name: '256GB - Titan Xanh',
          sku: 'IP15PM-256-TITAN-BLUE',
          stock_quantity: 20,
          price_adjustment: 0,
          status: 'active'
        },
        {
          product_id: iphone[0].id,
          variant_name: '512GB - Titan Xanh',
          sku: 'IP15PM-512-TITAN-BLUE',
          stock_quantity: 15,
          price_adjustment: 5000000,
          status: 'active'
        }
      ]);
    }

    console.log('✅ Sample products created');

    console.log('\n🎉 Seed data completed successfully!');
    console.log('\n📝 Test Accounts:');
    console.log('Admin: admin@techstore.com / Admin@123');
    console.log('Manager: manager@techstore.com / Manager@123');
    console.log('User: user@techstore.com / User@123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();

