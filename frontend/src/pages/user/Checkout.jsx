import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI } from '../../api/cart';
import { orderAPI } from '../../api/order';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import BackButton from '../../components/common/BackButton';
import { formatCurrencyVND, moneyToWordsVn } from '../../utils/currency';

export default function Checkout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Chặn manager, admin và employee đặt hàng
  useEffect(() => {
    if (user && (user.role === 'manager' || user.role === 'admin' || user.role === 'employee')) {
      toast.error('Tài khoản manager, admin và employee không thể đặt hàng');
      navigate('/products');
    }
  }, [user, navigate]);
  const [formData, setFormData] = useState({
    shipping_address: user?.address || '',
    shipping_phone: user?.phone || '',
    payment_method: 'bank_transfer',
    promotion_code: ''
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const res = await cartAPI.getCart();
      if (res.data.success) {
        setCart(res.data.data.cart);
        if (!formData.shipping_address && user?.address) {
          setFormData(prev => ({ ...prev, shipping_address: user.address }));
        }
        if (!formData.shipping_phone && user?.phone) {
          setFormData(prev => ({ ...prev, shipping_phone: user.phone }));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Chặn manager, admin và employee đặt hàng
    if (user && (user.role === 'manager' || user.role === 'admin' || user.role === 'employee')) {
      toast.error('Tài khoản manager, admin và employee không thể đặt hàng');
      navigate('/products');
      return;
    }

    setSubmitting(true);

    try {
      const res = await orderAPI.createOrder(formData);
      if (res.data.success) {
        toast.success('Đặt hàng thành công!');
        navigate('/user/orders');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-xl mb-4">Giỏ hàng trống</p>
        <button
          onClick={() => navigate('/products')}
          className="text-primary hover:underline"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton className="mb-4" />
      <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Thông tin giao hàng</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Địa chỉ giao hàng *</label>
                <textarea
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Số điện thoại *</label>
                <input
                  type="tel"
                  value={formData.shipping_phone}
                  onChange={(e) => setFormData({ ...formData, shipping_phone: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Phương thức thanh toán</h2>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="bank_transfer">Chuyển khoản ngân hàng</option>
              <option value="cash">Tiền mặt</option>
              <option value="credit_card">Thẻ tín dụng</option>
              <option value="e_wallet">Ví điện tử</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Mã khuyến mãi</h2>
            <input
              type="text"
              value={formData.promotion_code}
              onChange={(e) => setFormData({ ...formData, promotion_code: e.target.value })}
              placeholder="Nhập mã khuyến mãi (nếu có)"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Đơn hàng</h2>
            <div className="space-y-2 mb-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span>{formatCurrencyVND(item.subtotal)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Tổng cộng:</span>
                <span className="text-accent">{formatCurrencyVND(cart.total)}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Bằng chữ: {moneyToWordsVn(cart.total)}
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-3 bg-accent text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
            >
              {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

