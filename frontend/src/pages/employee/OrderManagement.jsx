import { useEffect, useState } from 'react';
import { orderAPI } from '../../api/order';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import { formatCurrencyVND, moneyToWordsVn } from '../../utils/currency';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [selectedStatus]);

  const loadOrders = async () => {
    try {
      const params = selectedStatus ? { status: selectedStatus } : {};
      const res = await orderAPI.getOrders(params);
      if (res.data.success) {
        setOrders(res.data.data.orders);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, { status: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      loadOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleOrderClick = async (orderId) => {
    setLoadingDetail(true);
    try {
      const res = await orderAPI.getOrderById(orderId);
      console.log('Order detail response:', res.data);
      if (res.data && res.data.success) {
        setSelectedOrder(res.data.data.order);
      } else {
        toast.error('Không thể tải chi tiết đơn hàng');
        console.error('Unexpected response format:', res.data);
      }
    } catch (error) {
      console.error('Error loading order detail:', error);
      toast.error(error.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
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

  // Hiển thị chi tiết đơn hàng
  if (selectedOrder) {
    console.log('Rendering order detail:', selectedOrder);
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={handleBackToList}
          className="mb-4 text-primary hover:underline flex items-center gap-2"
        >
          ← Quay lại danh sách
        </button>

        {loadingDetail ? (
          <Loading />
        ) : selectedOrder ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">Chi tiết đơn hàng</h1>
                <p className="text-gray-600">Mã đơn: {selectedOrder.order_code || 'N/A'}</p>
              </div>
              {selectedOrder.status && (
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusText(selectedOrder.status)}
                </span>
              )}
            </div>

            {/* Thông tin khách hàng */}
            {selectedOrder.user && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-3">Thông tin khách hàng</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Họ tên:</p>
                    <p className="font-semibold">{selectedOrder.user?.full_name || selectedOrder.user?.username || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email:</p>
                    <p className="font-semibold">{selectedOrder.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Số điện thoại:</p>
                    <p className="font-semibold">{selectedOrder.user?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Địa chỉ:</p>
                    <p className="font-semibold">{selectedOrder.user?.address || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Danh sách sản phẩm */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Sản phẩm</h2>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left">Sản phẩm</th>
                        <th className="px-4 py-3 text-left">Biến thể</th>
                        <th className="px-4 py-3 text-right">Số lượng</th>
                        <th className="px-4 py-3 text-right">Đơn giá</th>
                        <th className="px-4 py-3 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id} className="border-t">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-semibold">{item.product_name || 'N/A'}</p>
                              {item.product?.brand && (
                                <p className="text-sm text-gray-600">{item.product.brand}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">{item.variant_name || 'N/A'}</td>
                          <td className="px-4 py-3 text-right">{item.quantity || 0}</td>
                          <td className="px-4 py-3 text-right">
                            {formatCurrencyVND(item.unit_price || 0)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold">
                            {formatCurrencyVND(item.subtotal || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">Không có sản phẩm nào</p>
              )}
            </div>

            {/* Tổng tiền */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Tạm tính:</span>
                <span className="font-semibold">
                  {formatCurrencyVND(selectedOrder.subtotal_amount || 0)}
                </span>
              </div>
              {selectedOrder.promotion && (
                <div className="flex justify-between items-center mb-2 text-green-600">
                  <span>Giảm giá ({selectedOrder.promotion.code}):</span>
                  <span className="font-semibold">
                    -{formatCurrencyVND(selectedOrder.discount_amount || 0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-lg font-semibold">Tổng cộng:</span>
                <span className="text-xl font-bold text-accent">
                  {formatCurrencyVND(selectedOrder.final_amount || 0)}
                </span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Bằng chữ: {moneyToWordsVn(selectedOrder.final_amount || 0)}
              </div>
            </div>

            {/* Lịch sử trạng thái */}
            {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Lịch sử trạng thái</h2>
                <div className="space-y-2">
                  {selectedOrder.statusHistory.map((history, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <span className={`px-3 py-1 rounded text-sm ${getStatusColor(history.status)}`}>
                        {getStatusText(history.status)}
                      </span>
                      <span className="text-sm text-gray-600">
                        {new Date(history.created_at).toLocaleString('vi-VN')}
                      </span>
                      {history.updater && (
                        <span className="text-sm text-gray-600">
                          bởi {history.updater.full_name || history.updater.username}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cập nhật trạng thái */}
            <div className="pt-4 border-t">
              <h2 className="text-xl font-semibold mb-3">Cập nhật trạng thái</h2>
              <select
                value={selectedOrder.status || 'pending'}
                onChange={(e) => {
                  handleStatusChange(selectedOrder.id, e.target.value);
                  // Cập nhật lại selectedOrder sau khi thay đổi
                  setTimeout(() => {
                    handleOrderClick(selectedOrder.id);
                  }, 500);
                }}
                className="px-4 py-2 border rounded-lg"
              >
                <option value="pending">Chờ xử lý</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="shipping">Đang giao hàng</option>
                <option value="delivered">Đã giao hàng</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <p className="text-red-500">Không thể tải chi tiết đơn hàng</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quản lý đơn hàng</h1>

      <div className="mb-4">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="shipping">Đang giao hàng</option>
          <option value="delivered">Đã giao hàng</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Mã đơn</th>
              <th className="px-4 py-3 text-left">Khách hàng</th>
              <th className="px-4 py-3 text-left">Tổng tiền</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Ngày đặt</th>
              <th className="px-4 py-3 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr 
                key={order.id} 
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  console.log('Order clicked:', order.id, order);
                  handleOrderClick(order.id);
                }}
              >
                <td className="px-4 py-3 font-semibold text-primary">{order.order_code}</td>
                <td className="px-4 py-3">
                  {order.user?.full_name || order.user?.username}
                </td>
                <td className="px-4 py-3">
                  {formatCurrencyVND(order.final_amount)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-sm ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(order.order_date).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="shipping">Đang giao hàng</option>
                    <option value="delivered">Đã giao hàng</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

