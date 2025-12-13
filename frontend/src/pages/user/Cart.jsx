import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartAPI } from '../../api/cart';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import BackButton from '../../components/common/BackButton';
import { formatCurrencyVND, moneyToWordsVn } from '../../utils/currency';

export default function Cart() {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Chặn manager, admin và employee truy cập giỏ hàng
  useEffect(() => {
    if (user && (user.role === 'manager' || user.role === 'admin' || user.role === 'employee')) {
      toast.error('Tài khoản manager, admin và employee không thể đặt hàng');
      navigate('/products');
    }
  }, [user, navigate]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await cartAPI.getCart();
      if (res.data.success) {
        setCart(res.data.data.cart);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await cartAPI.updateItem(itemId, { quantity: newQuantity });
      await loadCart();
      toast.success('Cập nhật giỏ hàng thành công');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await cartAPI.removeItem(itemId);
      await loadCart();
      toast.success('Đã xóa sản phẩm');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    }
  };

  if (loading) return <Loading />;
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl mb-4">Giỏ hàng trống</p>
        <Link to="/products" className="text-primary hover:underline">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton className="mb-4" />
      <h1 className="text-3xl font-bold mb-6">Giỏ hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            {cart.items.map(item => (
              <div key={item.id} className="flex gap-4 pb-6 mb-6 border-b last:border-0">
                <img
                  src={item.product.image || 'https://via.placeholder.com/100'}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <Link
                    to={`/products/${item.product.id}`}
                    className="font-semibold hover:text-primary"
                  >
                    {item.product.name}
                  </Link>
                  {item.variant && (
                    <p className="text-sm text-gray-600">{item.variant.name}</p>
                  )}
                  <p className="text-accent font-bold mt-2">
                    {formatCurrencyVND(item.unitPrice)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => {
                        const maxQty = item.variant?.stock_quantity || item.product?.stock_quantity || 999;
                        if (item.quantity < maxQty) {
                          handleUpdateQuantity(item.id, item.quantity + 1);
                        }
                      }}
                      className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={(() => {
                        const maxQty = item.variant?.stock_quantity || item.product?.stock_quantity || 999;
                        return item.quantity >= maxQty;
                      })()}
                    >
                      +
                    </button>
                  </div>
                  {(() => {
                    const maxQty = item.variant?.stock_quantity || item.product?.stock_quantity;
                    if (maxQty !== undefined && maxQty !== null) {
                      return (
                        <span className="text-xs text-gray-500">
                          Còn lại: {maxQty}
                        </span>
                      );
                    }
                    return null;
                  })()}
                  <p className="font-semibold">
                    {formatCurrencyVND(item.subtotal)}
                  </p>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Tổng kết</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{formatCurrencyVND(cart.total)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Tổng cộng:</span>
                <span className="text-accent">{formatCurrencyVND(cart.total)}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Bằng chữ: {moneyToWordsVn(cart.total)}
              </div>
            </div>
            <button
              onClick={() => navigate('/user/checkout')}
              disabled={user?.role === 'manager' || user?.role === 'admin' || user?.role === 'employee'}
              className="w-full px-4 py-3 bg-accent text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {(user?.role === 'manager' || user?.role === 'admin' || user?.role === 'employee') ? 'Không thể đặt hàng' : 'Thanh toán'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

