import { formatCurrencyVND } from '../../utils/currency';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../../api/order';
import Loading from '../../components/common/Loading';
import BackButton from '../../components/common/BackButton';
import toast from 'react-hot-toast';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await orderAPI.getOrders();
      if (res.data.success) {
        setOrders(res.data.data.orders);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReceived = async (orderId) => {
    try {
      const res = await orderAPI.confirmReceived(orderId);
      if (res.data.success) {
        toast.success('Đã xác nhận nhận hàng thành công');
        loadOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipping: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      processing: 'Đang xử lý',
      shipping: 'Đang giao hàng',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton className="mb-4" />
      <h1 className="text-3xl font-bold mb-6">Lịch sử đơn hàng</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl mb-4">Chưa có đơn hàng nào</p>
          <Link to="/products" className="text-primary hover:underline">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Link
                    to={`/user/orders/${order.id}`}
                    className="font-semibold text-lg hover:text-primary"
                  >
                    {order.order_code}
                  </Link>
                  <p className="text-sm text-gray-600">
                    {new Date(order.order_date).toLocaleString('vi-VN')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="mb-4">
                {order.items?.slice(0, 3).map(item => {
                  const productId = item.product_id || item.product?.id;
                  return (
                  <div key={item.id} className="flex justify-between text-sm mb-1">
                    <span>
                      {productId ? (
                        <Link to={`/products/${productId}`} className="text-primary hover:underline">
                          {item.product_name}
                        </Link>
                      ) : (
                        item.product_name
                      )}
                      {item.variant_name && ` - ${item.variant_name}`} x{item.quantity}
                    </span>
                    <span>{formatCurrencyVND(item.subtotal || 0)}</span>
                  </div>
                )})}
                {order.items?.length > 3 && (
                  <p className="text-sm text-gray-600">... và {order.items.length - 3} sản phẩm khác</p>
                )}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-gray-600">Tổng cộng:</span>
                <span className="text-accent font-bold text-lg">
                  {order.final_amount.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              {order.status === 'shipping' && (
                <div className="mt-4 pt-4 border-t">
                  <button
                    onClick={() => handleConfirmReceived(order.id)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Đã nhận được hàng
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

