import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import BackButton from '../../components/common/BackButton';
import { authAPI } from '../../api/auth';

export default function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [loading, setLoading] = useState(false);
  
  // State cho form đổi mật khẩu
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Call update user API
      toast.success('Cập nhật thành công');
    } catch (error) {
      toast.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res.data.success) {
        toast.success('Đổi mật khẩu thành công');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowChangePassword(false);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu';
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton className="mb-4" />
      <h1 className="text-3xl font-bold mb-6">Hồ sơ</h1>

      <div className="max-w-2xl space-y-6">
        {/* Thông tin cá nhân */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <p className="text-gray-600">Email: {user?.email}</p>
            <p className="text-gray-600">Username: {user?.username}</p>
            <p className="text-gray-600">Role: {user?.role}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Họ và tên</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Số điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Địa chỉ</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                rows="3"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </form>
        </div>

        {/* Đổi mật khẩu */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Đổi mật khẩu</h2>
            <button
              type="button"
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="text-primary hover:text-blue-700 font-medium"
            >
              {showChangePassword ? 'Ẩn' : 'Đổi mật khẩu'}
            </button>
          </div>

          {showChangePassword && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Mật khẩu phải có ít nhất 6 ký tự</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {passwordLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

