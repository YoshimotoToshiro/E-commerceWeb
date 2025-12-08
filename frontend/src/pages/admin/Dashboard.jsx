import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'Reports & Export',
      description: 'Xem báo cáo tổng quan và xuất dữ liệu ra CSV/Excel/PDF',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <path d="M14 2v6h6"/>
          <path d="M16 13H8"/>
          <path d="M16 17H8"/>
          <path d="M10 9H8"/>
        </svg>
      ),
      to: '/admin/reports',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      title: 'Quản lý Users',
      description: 'Thêm/sửa/xóa người dùng và phân quyền hệ thống.',
      icon: '👥',
      to: '/admin/users',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Cấu hình hệ thống',
      description: 'Thiết lập tham số hệ thống và cấu hình nâng cao.',
      icon: '⚙️',
      to: '/admin/settings',
      color: 'from-amber-500 to-orange-600'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Bảng điều khiển Admin</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <button
            key={c.title}
            onClick={() => navigate(c.to)}
            className={`relative overflow-hidden bg-gradient-to-br ${c.color} text-white rounded-2xl shadow-lg p-8 transition-transform hover:scale-[1.01] text-left`}
          >
            <div className="text-5xl mb-4">{c.icon}</div>
            <div className="text-2xl font-semibold">{c.title}</div>
            <div className="mt-2 text-white/90">{c.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
