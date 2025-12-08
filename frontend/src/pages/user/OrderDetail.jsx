import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../../api/order';
import Loading from '../../components/common/Loading';
import BackButton from '../../components/common/BackButton';
import { formatCurrencyVND, moneyToWordsVn } from '../../utils/currency';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await orderAPI.getOrderById(id);
        if (res.data?.success) {
          setOrder(res.data.data.order);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleConfirmReceived = async () => {
    try {
      const res = await orderAPI.confirmReceived(id);
      if (res.data.success) {
        toast.success('Đã xác nhận nhận hàng thành công');
        // Reload order data
        const orderRes = await orderAPI.getOrderById(id);
        if (orderRes.data?.success) {
          setOrder(orderRes.data.data.order);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  if (loading) return <Loading />;
  if (!order) return <div className="container mx-auto px-4 py-8">Không tìm thấy đơn hàng</div>;

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

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton className="mb-4" />

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Chi tiết đơn hàng</h1>
          <p className="text-gray-600">
            Mã đơn: <span className="font-medium">{order.order_code}</span>
          </p>
          <p className="text-gray-600">
            Ngày đặt: {new Date(order.order_date || order.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold mb-4">Sản phẩm</h2>
        <div className="divide-y">
          {order.items?.map((item) => {
            const productId = item.product_id || item.product?.id;
            const productImage = item.product?.images?.[0]?.image_url || null;
            return (
              <div key={item.id} className="py-4 flex gap-4 items-start">
                {productImage && (
                  <Link 
                    to={productId ? `/products/${productId}` : '#'}
                    className="flex-shrink-0"
                  >
                    <img 
                      src={productImage} 
                      alt={item.product_name}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                    />
                  </Link>
                )}
                <div className="flex-1 flex justify-between items-start">
                  <div className="flex-1">
                    {productId ? (
                      <Link to={`/products/${productId}`} className="text-primary hover:underline font-medium">
                        {item.product_name}
                      </Link>
                    ) : (
                      <span className="font-medium">{item.product_name}</span>
                    )}
                    {item.variant_name && (
                      <div className="text-gray-600 text-sm mt-1">Phân loại: {item.variant_name}</div>
                    )}
                    <div className="text-gray-500 text-sm mt-1">Số lượng: x{item.quantity}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-gray-600 text-sm">{formatCurrencyVND(item.unit_price || 0)}</div>
                    <div className="font-semibold text-base mt-1">{formatCurrencyVND(item.subtotal || 0)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 border-t pt-4 space-y-2 text-sm">
          {order.promotion && (
            <div className="flex justify-between">
              <span>Mã khuyến mãi: {order.promotion.code}</span>
              <span className="text-green-600">-{(order.discount_amount || 0).toLocaleString('vi-VN')} ₫</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span>{formatCurrencyVND(order.total_amount || 0)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Thành tiền</span>
            <span className="text-accent">{formatCurrencyVND(order.final_amount || order.total_amount || 0)}</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Bằng chữ: {moneyToWordsVn(order.final_amount || order.total_amount || 0)}
          </div>
        </div>
      </div>

      {order.status === 'shipping' && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <button
            onClick={handleConfirmReceived}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            Đã nhận được hàng
          </button>
        </div>
      )}
    </div>
  );
}


