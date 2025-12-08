import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import BackButton from '../../components/common/BackButton';
import { userAPI } from '../../api/user';

const roleBadge = (role) => {
  const base = 'px-2 py-0.5 rounded text-xs font-semibold';
  switch (role) {
    case 'admin':
      return `${base} bg-purple-100 text-purple-700`;
    case 'manager':
      return `${base} bg-blue-100 text-blue-700`;
    case 'employee':
      return `${base} bg-emerald-100 text-emerald-700`;
    default:
      return `${base} bg-gray-100 text-gray-700`;
  }
};

const INITIAL_FORM_STATE = {
  username: '',
  email: '',
  full_name: '',
  password: '',
  phone: '',
  address: '',
  role: 'user',
  status: 'active',
};

export default function UserManagement() {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(() => ({ ...INITIAL_FORM_STATE }));
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        search: query || undefined,
        role: role !== 'ALL' ? role : undefined,
        status: status !== 'ALL' ? status : undefined,
        page: 1,
        limit: 100,
      };
      const res = await userAPI.getUsers(params);
      const data = res?.data?.data?.users || [];
      setRows(data);
    } catch (e) {
      setError('Không tải được danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [query, role, status]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({ ...INITIAL_FORM_STATE });
    setFormError('');
    setShowForm(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      full_name: user.full_name || '',
      password: '',
      phone: user.phone || '',
      address: user.address || '',
      role: user.role || 'user',
      status: user.status || 'active',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({ ...INITIAL_FORM_STATE });
    setFormError('');
    setSubmitting(false);
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!editingUser && !formData.password) {
      setFormError('Vui lòng nhập mật khẩu tạm cho người dùng mới.');
      return;
    }

    if (!formData.username || !formData.email || !formData.full_name) {
      setFormError('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    const payload = {
      username: formData.username.trim(),
      email: formData.email.trim(),
      full_name: formData.full_name.trim(),
      phone: formData.phone ? formData.phone.trim() : null,
      address: formData.address ? formData.address.trim() : null,
      role: formData.role,
      status: formData.status,
    };

    if (!editingUser) {
      payload.password = formData.password;
    } else if (formData.password) {
      payload.password = formData.password;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        await userAPI.updateUser(editingUser.id, payload);
        toast.success('Cập nhật người dùng thành công');
      } else {
        await userAPI.createUser(payload);
        toast.success('Tạo người dùng thành công');
      }
      handleCloseModal();
      await fetchUsers();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Không thể lưu người dùng. Vui lòng thử lại.';
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    const confirmMessage =
      nextStatus === 'inactive'
        ? `Khóa tài khoản ${user.username}?`
        : `Mở khóa tài khoản ${user.username}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await userAPI.updateUser(user.id, { status: nextStatus });
      toast.success(
        nextStatus === 'inactive'
          ? 'Đã khóa tài khoản'
          : 'Đã mở khóa tài khoản'
      );
      await fetchUsers();
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Không thể cập nhật trạng thái người dùng.';
      toast.error(message);
    }
  };

  const users = rows;

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton className="mb-4" />
      <h1 className="text-3xl font-bold mb-6">Quản lý người dùng</h1>

      <div className="bg-white rounded-lg shadow p-6">
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên, username, email..."
              className="border rounded px-3 py-2 w-64"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
              <option value="user">User</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Vô hiệu</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              onClick={handleOpenCreate}
            >
              + Thêm mới
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-2 border-b">User</th>
                <th className="px-4 py-2 border-b">Họ tên</th>
                <th className="px-4 py-2 border-b">Email</th>
                <th className="px-4 py-2 border-b">Vai trò</th>
                <th className="px-4 py-2 border-b">Trạng thái</th>
                <th className="px-4 py-2 border-b">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    Đang tải danh sách người dùng...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    Không có người dùng phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b last:border-b-0">
                    <td className="px-4 py-2">{u.username}</td>
                    <td className="px-4 py-2">{u.full_name}</td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">
                      <span className={roleBadge(u.role)}>{u.role}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          u.status === 'active'
                            ? 'px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700'
                            : 'px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700'
                        }
                      >
                        {u.status === 'active' ? 'Hoạt động' : 'Vô hiệu'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <button
                          className="px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                          onClick={() => handleOpenEdit(u)}
                        >
                          Sửa
                        </button>
                        <button
                          className={`px-2 py-1 rounded text-white transition ${
                            u.status === 'active'
                              ? 'bg-rose-600 hover:bg-rose-700'
                              : 'bg-emerald-600 hover:bg-emerald-700'
                          }`}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.status === 'active' ? 'Khóa' : 'Mở'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="text-sm text-gray-500 mt-3">
          {loading ? 'Đang tải...' : `Hiển thị ${users.length} người dùng`}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}
              </h2>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700"
                onClick={handleCloseModal}
              >
                ✕
              </button>
            </div>
            {formError && (
              <div className="mb-3 text-sm text-red-600">{formError}</div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleFormChange('username', e.target.value)}
                    className={`w-full border rounded px-3 py-2 ${
                      editingUser ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={!!editingUser}
                    placeholder="vd: admin01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleFormChange('email', e.target.value)}
                    className={`w-full border rounded px-3 py-2 ${
                      editingUser ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    disabled={!!editingUser}
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Họ tên *
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) =>
                      handleFormChange('full_name', e.target.value)
                    }
                    className="w-full border rounded px-3 py-2"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Vai trò
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleFormChange('role', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="user">User</option>
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Vô hiệu</option>
                    <option value="banned">Bị chặn</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleFormChange('phone', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="0967xxx..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Địa chỉ
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  {editingUser ? 'Mật khẩu mới (tuỳ chọn)' : 'Mật khẩu tạm *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder={
                    editingUser
                      ? 'Để trống nếu không đổi mật khẩu'
                      : 'Nhập mật khẩu tạm cho người dùng'
                  }
                />
                {editingUser && (
                  <p className="text-xs text-gray-500 mt-1">
                    Để trống nếu không muốn thay đổi mật khẩu.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                  onClick={handleCloseModal}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Đang lưu...'
                    : editingUser
                    ? 'Cập nhật'
                    : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

