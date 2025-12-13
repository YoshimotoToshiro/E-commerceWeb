import { useEffect, useState } from 'react';
import { bannerAPI } from '../../api/banner';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import BackButton from '../../components/common/BackButton';

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    button_text: 'Xem sản phẩm',
    button_link: '/products',
    background_image: '',
    background_color: '#1E40AF',
    text_color: '#FFFFFF',
    position: 1,
    is_active: true,
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      const res = await bannerAPI.getBanners();
      if (res.data.success) {
        setBanners(res.data.data.banners);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách banner');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        subtitle: '', // Bỏ phụ đề
        button_text: '', // Bỏ text nút
        button_link: '', // Bỏ link nút
        background_color: '#1E40AF', // Màu nền mặc định
        start_date: formData.start_date || null,
        end_date: formData.end_date || null
      };

      if (editingBanner) {
        await bannerAPI.updateBanner(editingBanner.id, submitData);
        toast.success('Cập nhật banner thành công');
      } else {
        await bannerAPI.createBanner(submitData);
        toast.success('Tạo banner thành công');
      }
      
      setShowForm(false);
      setEditingBanner(null);
      resetForm();
      loadBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      button_text: banner.button_text || 'Xem sản phẩm',
      button_link: banner.button_link || '/products',
      background_image: banner.background_image || '',
      background_color: banner.background_color || '#1E40AF',
      text_color: banner.text_color || '#FFFFFF',
      position: banner.position || 1,
      is_active: banner.is_active !== undefined ? banner.is_active : true,
      start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
      end_date: banner.end_date ? banner.end_date.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      return;
    }

    try {
      await bannerAPI.deleteBanner(id);
      toast.success('Xóa banner thành công');
      loadBanners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      button_text: 'Xem sản phẩm',
      button_link: '/products',
      background_image: '',
      background_color: '#1E40AF',
      text_color: '#FFFFFF',
      position: 1,
      is_active: true,
      start_date: '',
      end_date: ''
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBanner(null);
    resetForm();
  };

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton className="mb-4" />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Banner</h1>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
          >
            + Thêm Banner
          </button>
        )}
      </div>

      {showForm ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner Mới'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">URL hình nền</label>
                <input
                  type="text"
                  value={formData.background_image}
                  onChange={(e) => setFormData({ ...formData, background_image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Màu chữ</label>
                <input
                  type="color"
                  value={formData.text_color}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  className="w-full h-10 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Vị trí</label>
                <input
                  type="number"
                  min="1"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ngày kết thúc</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm font-medium">
                Kích hoạt
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
              >
                {editingBanner ? 'Cập nhật' : 'Tạo mới'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Tiêu đề</th>
              <th className="px-4 py-3 text-left">Vị trí</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Ngày tạo</th>
              <th className="px-4 py-3 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {banners.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  Chưa có banner nào
                </td>
              </tr>
            ) : (
              banners.map(banner => (
                <tr key={banner.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold">{banner.title}</td>
                  <td className="px-4 py-3">{banner.position}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      banner.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {banner.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(banner.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

