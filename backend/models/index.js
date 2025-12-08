const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Supplier = require('./Supplier');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const ProductVariant = require('./ProductVariant');
const Promotion = require('./Promotion');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const OrderStatusHistory = require('./OrderStatusHistory');
const Review = require('./Review');
const Expense = require('./Expense');
const SystemLog = require('./SystemLog');
const Banner = require('./Banner');

// Associations
// User associations
User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart' });
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
User.hasMany(SystemLog, { foreignKey: 'user_id', as: 'logs' });
SystemLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Category associations
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });
Category.hasMany(Category, { foreignKey: 'parent_id', as: 'children' });

// Supplier associations
Supplier.hasMany(Product, { foreignKey: 'supplier_id', as: 'products' });

// Product associations
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Product.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
Product.hasMany(CartItem, { foreignKey: 'product_id', as: 'cartItems' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'orderItems' });
Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });

// ProductImage associations
ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// ProductVariant associations
ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
ProductVariant.hasMany(CartItem, { foreignKey: 'variant_id', as: 'cartItems' });
ProductVariant.hasMany(OrderItem, { foreignKey: 'variant_id', as: 'orderItems' });

// Cart associations
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });

// CartItem associations
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
CartItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

// Order associations
Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Order.belongsTo(User, { foreignKey: 'employee_id', as: 'employee' });
Order.belongsTo(Promotion, { foreignKey: 'promotion_id', as: 'promotion' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
Order.hasMany(OrderStatusHistory, { foreignKey: 'order_id', as: 'statusHistory' });

// OrderItem associations
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
OrderItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

// OrderStatusHistory associations
OrderStatusHistory.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
OrderStatusHistory.belongsTo(User, { foreignKey: 'updated_by', as: 'updater' });

// Review associations
Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Review.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Promotion associations
Promotion.hasMany(Order, { foreignKey: 'promotion_id', as: 'orders' });

module.exports = {
  sequelize,
  User,
  Category,
  Supplier,
  Product,
  ProductImage,
  ProductVariant,
  Promotion,
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderStatusHistory,
  Review,
  Expense,
  SystemLog,
  Banner
};

