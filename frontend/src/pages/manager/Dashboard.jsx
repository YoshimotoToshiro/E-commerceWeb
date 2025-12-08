import { useEffect, useMemo, useState } from 'react';
import { statisticsAPI } from '../../api/statistics';
import { orderAPI } from '../../api/order';
import Loading from '../../components/common/Loading';
import BackButton from '../../components/common/BackButton';
import { formatCurrencyVND } from '../../utils/currency';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('day'); // day | month | year

  // KPIs
  const [summary, setSummary] = useState(null);
  const [newCustomersToday, setNewCustomersToday] = useState(0);
  const [todayCost, setTodayCost] = useState(0);

  // Charts
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [orderStatusDist, setOrderStatusDist] = useState([]);
  const [groupedRevenue, setGroupedRevenue] = useState([]); // placeholder if backend not ready

  // Tables
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [highlightEmployees, setHighlightEmployees] = useState([]); // placeholder

  useEffect(() => {
    loadAll();
  }, [period]);

  const loadAll = async () => {
    try {
      setLoading(true);

      const [
        summaryRes,
        revenueRes,
        topRes,
        orderStatsRes,
        lowStockRes,
        recentOrdersRes
      ] = await Promise.all([
        statisticsAPI.getDashboardSummary(),
        statisticsAPI.getRevenue({ period }),
        statisticsAPI.getTopSellingProducts({ limit: 5 }),
        statisticsAPI.getOrderStats(),
        statisticsAPI.getLowStockProducts({ threshold: 10 }),
        orderAPI.getOrders({ page: 1, limit: 8, sort: 'order_date', order: 'desc' }),
      ]);

      if (summaryRes.data?.success) setSummary(summaryRes.data.data);
      if (revenueRes.data?.success) setRevenueSeries(revenueRes.data.data.revenue || []);
      if (topRes.data?.success) setTopProducts(topRes.data.data.products || []);
      if (orderStatsRes.data?.success) setOrderStatusDist(orderStatsRes.data.data.byStatus || []);
      if (lowStockRes.data?.success) setLowStockProducts(lowStockRes.data.data.products || []);
      if (recentOrdersRes.data?.data?.orders) setRecentOrders(recentOrdersRes.data.data.orders || []);

      // Placeholders for costs, new customers, highlight employees, grouped revenue
      setTodayCost(0);
      setNewCustomersToday(0);
      setHighlightEmployees([]);
      setGroupedRevenue([]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      <BackButton className="mb-4" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold">📊 Bảng Thống Kê Tổng Quan</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Khoảng thời gian</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="day">Theo ngày</option>
            <option value="month">Theo tháng</option>
            <option value="year">Theo năm</option>
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <KPI icon="🛒" label="Tổng đơn hàng" value={(summary?.todayOrders ?? 0).toLocaleString('vi-VN')} tone="primary" />
        <KPI icon="💰" label="Doanh thu hôm nay" value={formatCurrencyVND(summary?.todayRevenue || 0)} tone="accent" />
        <KPI icon="📉" label="Chi phí hôm nay" value={formatCurrencyVND(todayCost || 0)} tone="red" />
        <KPI icon="📈" label="Lợi nhuận" value={formatCurrencyVND((summary?.todayRevenue || 0) - (todayCost || 0))} tone="green" />
        <KPI icon="👥" label="Khách hàng mới" value={(newCustomersToday ?? 0).toLocaleString('vi-VN')} tone="indigo" />
        <KPI icon="📦" label="SP sắp hết hàng" value={(summary?.lowStockCount ?? 0).toLocaleString('vi-VN')} tone="yellow" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card title="Doanh thu theo thời gian">
          <LineChart data={revenueSeries} />
        </Card>
        <Card title="Top 5 sản phẩm bán chạy">
          <BarChart data={topProducts.map(p => ({ label: p.name, value: p.totalSold }))} />
        </Card>
        <Card title="Tỷ lệ trạng thái đơn hàng">
          <PieChart data={orderStatusDist.map(s => ({ label: s.status, value: s.count }))} />
        </Card>
        <Card title="Doanh thu theo nhân viên/chi nhánh">
          <GroupedBarChart data={groupedRevenue} />
        </Card>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Đơn hàng gần nhất">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Mã đơn</th>
                  <th className="px-4 py-3 text-left">Khách hàng</th>
                  <th className="px-4 py-3 text-left">Tổng tiền</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Ngày đặt</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.id} className="border-t">
                    <td className="px-4 py-3 font-semibold text-primary">{order.order_code}</td>
                    <td className="px-4 py-3">{order.user?.full_name || order.user?.username}</td>
                    <td className="px-4 py-3">{formatCurrencyVND(order.final_amount || 0)}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={order.status} />
                    </td>
                    <td className="px-4 py-3">{new Date(order.order_date).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Sản phẩm sắp hết hàng">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-left">Mã</th>
                  <th className="px-4 py-3 text-left">Tồn kho</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(v => (
                  <tr key={v.id} className="border-t">
                    <td className="px-4 py-3">{v.product?.name} {v.variantName ? `- ${v.variantName}` : ''}</td>
                    <td className="px-4 py-3">#{v.product?.id}-{v.id}</td>
                    <td className="px-4 py-3">{v.stockQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <Card title="Nhân viên nổi bật">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Tên nhân viên</th>
                  <th className="px-4 py-3 text-left">Số đơn xử lý</th>
                  <th className="px-4 py-3 text-left">Doanh thu đóng góp</th>
                </tr>
              </thead>
              <tbody>
                {highlightEmployees.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-gray-500" colSpan={3}>Chưa có dữ liệu</td>
                  </tr>
                ) : (
                  highlightEmployees.map(emp => (
                    <tr key={emp.id} className="border-t">
                      <td className="px-4 py-3">{emp.name}</td>
                      <td className="px-4 py-3">{emp.orderCount}</td>
                      <td className="px-4 py-3">{formatCurrencyVND(emp.revenue || 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

function KPI({ icon, label, value, tone }) {
  const toneClass = useMemo(() => {
    switch (tone) {
      case 'accent': return 'text-accent';
      case 'primary': return 'text-primary';
      case 'red': return 'text-red-600';
      case 'green': return 'text-green-600';
      case 'indigo': return 'text-indigo-600';
      case 'yellow': return 'text-yellow-600';
      default: return 'text-gray-900';
    }
  }, [tone]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-2xl">{icon}</div>
      <div className="text-gray-600 mt-1">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${toneClass}`}>{value}</div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}

// Lightweight charts without external libs
function LineChart({ data }) {
  const width = 560;
  const height = 200;
  const padding = 24;
  const values = data.map(d => d.total || 0);
  const max = Math.max(1, ...values);
  const points = data.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / Math.max(1, data.length - 1);
    const y = height - padding - (values[i] / max) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points} />
    </svg>
  );
}

function BarChart({ data }) {
  const width = 560;
  const height = 200;
  const padding = 24;
  const values = data.map(d => d.value || 0);
  const labels = data.map(d => d.label);
  const max = Math.max(1, ...values);
  const barW = (width - padding * 2) / Math.max(1, values.length);

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      {values.map((v, i) => {
        const h = (v / max) * (height - padding * 2);
        const x = padding + i * barW + 6;
        const y = height - padding - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW - 12} height={h} fill="#10b981" rx="4" />
            <text x={x + (barW - 12) / 2} y={height - 6} fontSize="10" textAnchor="middle" fill="#6b7280">
              {labels[i]?.slice(0, 8) || ''}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PieChart({ data }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1;
  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];
  let cumulative = 0;
  const radius = 90;
  const cx = 110, cy = 110;

  const slices = data.map((d, i) => {
    const value = d.value || 0;
    const angle = (value / total) * Math.PI * 2;
    const x1 = cx + radius * Math.cos(cumulative);
    const y1 = cy + radius * Math.sin(cumulative);
    cumulative += angle;
    const x2 = cx + radius * Math.cos(cumulative);
    const y2 = cy + radius * Math.sin(cumulative);
    const largeArc = angle > Math.PI ? 1 : 0;
    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return <path key={i} d={pathData} fill={colors[i % colors.length]} />;
  });

  return (
    <div className="flex items-center gap-4">
      <svg width="220" height="220" viewBox="0 0 220 220">
        {slices}
      </svg>
      <div className="text-sm space-y-1">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded" style={{ background: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'][i % 6] }} />
            <span>{d.label}</span>
            <span className="text-gray-500">({d.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupedBarChart({ data }) {
  // expected: [{ group: 'Nhân viên A', series: [{ label:'Doanh thu', value: 100 }]}]
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-sm">Chưa có dữ liệu</div>;
  }

  const width = 560;
  const height = 220;
  const padding = 32;
  const groups = data;
  const seriesLabels = [...new Set(groups.flatMap(g => g.series.map(s => s.label)))];
  const max = Math.max(1, ...groups.flatMap(g => g.series.map(s => s.value || 0)));
  const groupW = (width - padding * 2) / groups.length;
  const barW = (groupW - 12) / Math.max(1, seriesLabels.length);
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
      {groups.map((g, gi) => (
        <g key={gi}>
          {g.series.map((s, si) => {
            const h = ((s.value || 0) / max) * (height - padding * 2);
            const x = padding + gi * groupW + 6 + si * barW;
            const y = height - padding - h;
            return <rect key={si} x={x} y={y} width={barW - 6} height={h} fill={colors[si % colors.length]} rx="4" />;
          })}
          <text x={padding + gi * groupW + groupW / 2} y={height - 6} fontSize="10" textAnchor="middle" fill="#6b7280">
            {g.group?.slice(0, 10) || ''}
          </text>
        </g>
      ))}
    </svg>
  );
}

function StatusPill({ status }) {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipping: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  const cls = map[status] || 'bg-gray-100 text-gray-800';
  const text = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao hàng',
    delivered: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
  }[status] || status;
  return <span className={`px-2 py-1 rounded text-sm ${cls}`}>{text}</span>;
}
