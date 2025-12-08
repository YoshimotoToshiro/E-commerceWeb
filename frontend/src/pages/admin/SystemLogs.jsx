import { useEffect, useMemo, useState } from 'react';
import BackButton from '../../components/common/BackButton';
import { userAPI } from '../../api/user';

const ACTION_LEVEL = (action) => {
  if (action === 'ERROR' || action === 'DELETE') return 'ERROR';
  if (action === 'WARN' || action === 'UPDATE') return 'WARN';
  return 'INFO';
};

const levelBadge = (level) => {
  const base = 'px-2 py-0.5 rounded text-xs font-semibold';
  switch (level) {
    case 'ERROR':
      return `${base} bg-red-100 text-red-700`;
    case 'WARN':
      return `${base} bg-amber-100 text-amber-700`;
    default:
      return `${base} bg-emerald-100 text-emerald-700`;
  }
};

export default function SystemLogs() {
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logsRaw, setLogsRaw] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await userAPI.getSystemLogs({ page: 1, limit: 200 });
        const rows = res?.data?.data?.logs || [];
        setLogsRaw(rows);
      } catch (e) {
        setError('Không tải được log hệ thống');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const logs = useMemo(() => {
    const normalized = logsRaw.map((l) => ({
      id: l.id,
      time: l.createdAt || l.created_at,
      level: ACTION_LEVEL(l.action),
      user: l.user?.full_name || l.user?.username || 'system',
      action: `${l.action}${l.table_name ? ` ${l.table_name}` : ''}${l.description ? ` - ${l.description}` : ''}`,
    }));
    return normalized.filter((l) => {
      const matchesLevel = level === 'ALL' || l.level === level;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        l.user.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q);
      return matchesLevel && matchesQuery;
    });
  }, [query, level]);

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton className="mb-4" />
      <h1 className="text-3xl font-bold mb-6">Báo cáo hoạt động người dùng</h1>

      <div className="bg-white rounded-lg shadow p-6">
        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
          <div className="flex gap-2">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="ALL">Tất cả mức</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo user, hành động..."
              className="border rounded px-3 py-2 w-64"
            />
          </div>
          <div className="text-sm text-gray-500">
            {loading ? 'Đang tải...' : `Hiển thị ${logs.length} bản ghi`}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-2 border-b">Thời gian</th>
                <th className="px-4 py-2 border-b">Mức</th>
                <th className="px-4 py-2 border-b">User</th>
                <th className="px-4 py-2 border-b">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id} className="border-b last:border-b-0">
                  <td className="px-4 py-2">{l.time}</td>
                  <td className="px-4 py-2">
                    <span className={levelBadge(l.level)}>{l.level}</span>
                  </td>
                  <td className="px-4 py-2">{l.user}</td>
                  <td className="px-4 py-2">{l.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3">Nguồn: Hệ thống</p>
      </div>
    </div>
  );
}

