import { useEffect, useMemo, useState } from 'react';
import { statisticsAPI } from '../../api/statistics';
import { orderAPI } from '../../api/order';
import Loading from '../../components/common/Loading';
import BackButton from '../../components/common/BackButton';
import { formatCurrencyVND } from '../../utils/currency';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // day | month | year

  // KPIs
  const [summary, setSummary] = useState(null);
  const [newCustomersToday, setNewCustomersToday] = useState(0);
  const [todayCost, setTodayCost] = useState(0);

  // Charts
  const [revenueSeries, setRevenueSeries] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState([]); // Doanh thu theo ngày
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
      let hasError = false;

      // Load dashboard summary
      try {
        const summaryRes = await statisticsAPI.getDashboardSummary();
        if (summaryRes.data?.success) {
          setSummary(summaryRes.data.data);
        } else {
          console.error('Dashboard summary failed:', summaryRes.data);
          hasError = true;
        }
      } catch (err) {
        console.error('Error loading dashboard summary:', err);
        const errorMsg = err.response?.data?.message || err.message || 'Không thể tải tổng quan dashboard';
        toast.error(errorMsg);
        hasError = true;
      }

      // Load revenue
      let revenueDataLoaded = [];
      try {
        const revenueRes = await statisticsAPI.getRevenue({ period });
        console.log('Revenue API response:', revenueRes.data);
        if (revenueRes.data?.success) {
          const revenueData = revenueRes.data.data?.revenue || [];
          console.log('Revenue data:', revenueData, 'Length:', revenueData.length);
          
          // Nếu không có dữ liệu, log để debug
          if (revenueData.length === 0) {
            console.warn('No revenue data for period:', period, 'This is normal if there are no orders in this time range');
          }
          
          revenueDataLoaded = revenueData;
          setRevenueSeries(revenueData);
          
          // Nếu period='day', sử dụng dữ liệu này cho daily revenue chart
          if (period === 'day') {
            console.log('Using revenueSeries for daily revenue chart (period=day)');
            setDailyRevenue(revenueData);
          }
        } else {
          console.error('Revenue failed - no success:', revenueRes.data);
          setRevenueSeries([]);
          // Không hiển thị toast nếu chỉ là không có dữ liệu
          if (revenueRes.data?.message && !revenueRes.data.message.includes('dữ liệu')) {
            toast.error(revenueRes.data.message);
          }
        }
      } catch (err) {
        console.error('Error loading revenue:', err);
        const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Không thể tải dữ liệu doanh thu';
        console.error('Revenue error details:', {
          status: err.response?.status,
          statusText: err.response?.statusText,
          data: err.response?.data,
          message: errorMsg,
          fullError: err
        });
        setRevenueSeries([]);
        // Chỉ hiển thị toast nếu không phải lỗi 401/403 (đã được xử lý bởi interceptor)
        if (err.response?.status !== 401 && err.response?.status !== 403) {
          toast.error(errorMsg);
        }
      }

      // Load daily revenue for bar chart
      // Nếu period='day', đã set ở trên, không cần load lại
      // Nếu period khác, tải dữ liệu theo ngày riêng
      if (period !== 'day') {
        // Tải dữ liệu theo ngày riêng
        try {
          const dailyRevenueRes = await statisticsAPI.getRevenue({ period: 'day' });
          console.log('Daily revenue API response:', dailyRevenueRes.data);
          if (dailyRevenueRes.data?.success) {
            const dailyData = dailyRevenueRes.data.data?.revenue || [];
            console.log('Daily revenue data (raw):', dailyData, 'Length:', dailyData.length);
            
            // Kiểm tra và log từng item để debug
            dailyData.forEach((item, idx) => {
              console.log(`Daily revenue item ${idx}:`, {
                period: item.period,
                total: item.total,
                totalType: typeof item.total,
                parsed: parseFloat(item.total || 0),
                count: item.count
              });
            });
            
            // Không lọc bỏ dữ liệu, hiển thị tất cả (kể cả 0) để người dùng thấy đầy đủ
            setDailyRevenue(dailyData);
            
            if (dailyData.length === 0) {
              console.warn('No daily revenue data - checking if there are any orders at all...');
              // Thử kiểm tra xem có đơn hàng nào không
              try {
                const checkRes = await statisticsAPI.getOrderStats();
                if (checkRes.data?.success && checkRes.data.data?.summary?.totalOrders > 0) {
                  console.warn('There are orders in database but no daily revenue data. This might be a data issue.');
                }
              } catch (checkErr) {
                console.error('Error checking order stats:', checkErr);
              }
            }
          } else {
            console.error('Daily revenue failed - no success:', dailyRevenueRes.data);
            setDailyRevenue([]);
          }
        } catch (err) {
          console.error('Error loading daily revenue:', err);
          console.error('Daily revenue error details:', {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            message: err.response?.data?.message || err.message
          });
          setDailyRevenue([]);
          // Không hiển thị toast để tránh spam, chỉ log
        }
      }

      // Load top products
      try {
        const topRes = await statisticsAPI.getTopSellingProducts({ limit: 5 });
        if (topRes.data?.success) {
          setTopProducts(topRes.data.data.products || []);
        } else {
          console.error('Top products failed:', topRes.data);
          setTopProducts([]);
        }
      } catch (err) {
        console.error('Error loading top products:', err);
        setTopProducts([]);
        if (err.response?.status !== 401 && err.response?.status !== 403) {
          toast.error(err.response?.data?.message || 'Không thể tải sản phẩm bán chạy');
        }
      }

      // Load order stats
      try {
        const orderStatsRes = await statisticsAPI.getOrderStats();
        console.log('Order stats response:', orderStatsRes.data);
        if (orderStatsRes.data?.success) {
          const statusData = orderStatsRes.data.data.byStatus || [];
          console.log('Order status data:', statusData);
          setOrderStatusDist(statusData);
        } else {
          console.error('Order stats failed:', orderStatsRes.data);
          setOrderStatusDist([]);
        }
      } catch (err) {
        console.error('Error loading order stats:', err);
        setOrderStatusDist([]);
        if (err.response?.status !== 401 && err.response?.status !== 403) {
          toast.error(err.response?.data?.message || 'Không thể tải thống kê đơn hàng');
        }
      }

      // Load low stock
      try {
        const lowStockRes = await statisticsAPI.getLowStockProducts({ threshold: 10 });
        if (lowStockRes.data?.success) {
          setLowStockProducts(lowStockRes.data.data.products || []);
        } else {
          console.error('Low stock failed:', lowStockRes.data);
          setLowStockProducts([]);
        }
      } catch (err) {
        console.error('Error loading low stock:', err);
        setLowStockProducts([]);
        if (err.response?.status !== 401 && err.response?.status !== 403) {
          toast.error(err.response?.data?.message || 'Không thể tải sản phẩm sắp hết hàng');
        }
      }

      // Load recent orders
      try {
        const recentOrdersRes = await orderAPI.getOrders({ page: 1, limit: 8, sort: 'order_date', order: 'desc' });
        if (recentOrdersRes.data?.data?.orders) {
          setRecentOrders(recentOrdersRes.data.data.orders || []);
        } else {
          setRecentOrders([]);
        }
      } catch (err) {
        console.error('Error loading recent orders:', err);
        setRecentOrders([]);
        // Không hiển thị toast cho recent orders vì không quan trọng lắm
      }

      // Load revenue by employee
      try {
        const revenueByEmployeeRes = await statisticsAPI.getRevenueByEmployee();
        console.log('Revenue by employee response:', revenueByEmployeeRes.data);
        if (revenueByEmployeeRes.data?.success) {
          const employees = revenueByEmployeeRes.data.data.employees || [];
          console.log('Employees data:', employees);
          // Format data for GroupedBarChart: [{ group: 'Name', series: [{ label: 'Doanh thu', value: 100 }] }]
          const groupedData = employees.map(emp => ({
            group: emp.name || 'Unknown',
            series: [{ label: 'Doanh thu', value: emp.revenue || 0 }]
          }));
          console.log('Grouped data for chart:', groupedData);
          setGroupedRevenue(groupedData);
        } else {
          console.warn('Revenue by employee failed:', revenueByEmployeeRes.data);
          setGroupedRevenue([]);
        }
      } catch (err) {
        console.error('Error loading revenue by employee:', err);
        setGroupedRevenue([]);
        // Không hiển thị toast vì đây là tính năng phụ
      }

      // Load highlight employees
      try {
        const highlightRes = await statisticsAPI.getHighlightEmployees();
        if (highlightRes.data?.success) {
          setHighlightEmployees(highlightRes.data.data.employees || []);
        } else {
          setHighlightEmployees([]);
        }
      } catch (err) {
        console.error('Error loading highlight employees:', err);
        setHighlightEmployees([]);
        // Không hiển thị toast vì đây là tính năng phụ
      }

      // Placeholders for costs, new customers
      setTodayCost(0);
      setNewCustomersToday(0);

      if (hasError) {
        console.warn('Some dashboard data failed to load');
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      toast.error('Có lỗi xảy ra khi tải dashboard');
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
        <Card title="Doanh thu theo ngày">
          {dailyRevenue.length > 0 ? (
            <DailyRevenueBarChart data={dailyRevenue} />
          ) : (
            <div className="text-gray-500 text-sm py-8 text-center">Chưa có dữ liệu</div>
          )}
        </Card>
        <Card title="Tình trạng đơn hàng">
          {orderStatusDist.length > 0 ? (
            <OrderStatusPieChart data={orderStatusDist} />
          ) : (
            <div className="text-gray-500 text-sm py-8 text-center">Chưa có dữ liệu</div>
          )}
        </Card>
        <Card title="Top 5 sản phẩm bán chạy">
          {topProducts.length > 0 ? (
            <BarChart data={topProducts.map(p => ({ label: p.name, value: p.totalSold }))} />
          ) : (
            <div className="text-gray-500 text-sm py-8 text-center">Chưa có dữ liệu</div>
          )}
        </Card>
        <Card title="Doanh thu theo nhân viên/chi nhánh">
          {groupedRevenue && groupedRevenue.length > 0 ? (
            <GroupedBarChart data={groupedRevenue} />
          ) : (
            <div className="text-gray-500 text-sm py-8 text-center">Chưa có dữ liệu</div>
          )}
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
                {recentOrders.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-gray-500 text-center" colSpan={5}>Chưa có đơn hàng</td>
                  </tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order.id} className="border-t">
                      <td className="px-4 py-3 font-semibold text-primary">{order.order_code}</td>
                      <td className="px-4 py-3">{order.user?.full_name || order.user?.username || 'N/A'}</td>
                      <td className="px-4 py-3">{formatCurrencyVND(order.final_amount || 0)}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={order.status} />
                      </td>
                      <td className="px-4 py-3">{new Date(order.order_date).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))
                )}
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
                {lowStockProducts.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-gray-500 text-center" colSpan={3}>Không có sản phẩm sắp hết hàng</td>
                  </tr>
                ) : (
                  lowStockProducts.map(v => (
                    <tr key={v.id} className="border-t">
                      <td className="px-4 py-3">{v.product?.name} {v.variantName ? `- ${v.variantName}` : ''}</td>
                      <td className="px-4 py-3">#{v.product?.id}-{v.id}</td>
                      <td className="px-4 py-3">{v.stockQuantity}</td>
                    </tr>
                  ))
                )}
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
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-sm py-8 text-center">Chưa có dữ liệu</div>;
  }

  const width = 560;
  const height = 200;
  const padding = 24;
  const values = data.map(d => parseFloat(d.total || 0));
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

// Biểu đồ cột ngang (Bar Chart) - cho top sản phẩm
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

function GroupedBarChart({ data }) {
  // expected: [{ group: 'Nhân viên A', series: [{ label:'Doanh thu', value: 100 }]}]
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-sm py-8 text-center">Chưa có dữ liệu</div>;
  }
  
  console.log('GroupedBarChart data:', data);

  const width = 560;
  const height = 220;
  const padding = 32;
  const groups = data;
  const seriesLabels = [...new Set(groups.flatMap(g => g.series.map(s => s.label)))];
  const max = Math.max(1, ...groups.flatMap(g => g.series.map(s => s.value || 0)));
  
  // Đảm bảo có ít nhất 2 groups để chart không quá rộng
  const minGroups = Math.max(2, groups.length);
  const groupW = (width - padding * 2) / minGroups;
  const barW = Math.min((groupW - 12) / Math.max(1, seriesLabels.length), groupW * 0.8);
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="relative">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {groups.map((g, gi) => {
          const centerX = padding + (gi + 0.5) * groupW;
          return (
            <g key={gi}>
              {g.series.map((s, si) => {
                const h = ((s.value || 0) / max) * (height - padding * 2);
                const x = centerX - (barW * seriesLabels.length) / 2 + si * barW;
                const y = height - padding - h;
                return (
                  <g key={si}>
                    <rect 
                      x={x} 
                      y={y} 
                      width={barW - 2} 
                      height={h} 
                      fill={colors[si % colors.length]} 
                      rx="4"
                    />
                    {h > 20 && (
                      <text 
                        x={x + (barW - 2) / 2} 
                        y={y - 5} 
                        fontSize="9" 
                        textAnchor="middle" 
                        fill="#374151"
                        fontWeight="500"
                      >
                        {formatCurrencyVND(s.value || 0).replace('₫', '').trim()}
                      </text>
                    )}
                  </g>
                );
              })}
              <text 
                x={centerX} 
                y={height - 6} 
                fontSize="10" 
                textAnchor="middle" 
                fill="#6b7280"
              >
                {g.group?.slice(0, 15) || ''}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Biểu đồ cột cho doanh thu theo ngày
function DailyRevenueBarChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-sm py-8 text-center">Chưa có dữ liệu</div>;
  }

  // Debug log
  console.log('DailyRevenueBarChart rendering with data:', data);

  const width = 450;
  const height = 220;
  const padding = { top: 15, right: 15, bottom: 35, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const values = data.map(d => {
    const val = parseFloat(d.total || 0);
    console.log('Parsing value:', d.total, '->', val);
    return val;
  });
  const labels = data.map(d => {
    // Format date: YYYY-MM-DD -> DD/MM
    const dateStr = d.period || '';
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length >= 3) {
        return `${parts[2]}/${parts[1]}`;
      }
    }
    return dateStr;
  });
  const max = Math.max(1, ...values);
  
  console.log('Chart values:', values, 'Max:', max, 'Labels:', labels);
  
  const barCount = data.length;
  const barWidth = Math.min((chartWidth / Math.max(1, barCount)) * 0.8, 30);
  const barSpacing = chartWidth / Math.max(1, barCount);

  return (
    <div className="relative">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const value = max * ratio;
          const y = padding.top + chartHeight - (chartHeight * ratio);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                fontSize="9"
                textAnchor="end"
                fill="#6b7280"
              >
                {formatCurrencyVND(value).replace('₫', '').trim()}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {values.map((v, i) => {
          const barHeight = (v / max) * chartHeight;
          const x = padding.left + (i * barSpacing) + (barSpacing - barWidth) / 2;
          const y = padding.top + chartHeight - barHeight;
          
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#3b82f6"
                rx="4"
              />
                    {barHeight > 15 && (
                      <text
                        x={x + barWidth / 2}
                        y={y - 4}
                        fontSize="8"
                        textAnchor="middle"
                        fill="#374151"
                        fontWeight="500"
                      >
                        {formatCurrencyVND(v).replace('₫', '').trim()}
                      </text>
                    )}
                    <text
                      x={x + barWidth / 2}
                      y={height - padding.bottom + 12}
                      fontSize="8"
                      textAnchor="middle"
                      fill="#6b7280"
                      transform={`rotate(-45 ${x + barWidth / 2} ${height - padding.bottom + 12})`}
                    >
                      {labels[i] || ''}
                    </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Biểu đồ tròn cho tình trạng đơn hàng
function OrderStatusPieChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-sm py-8 text-center">Chưa có dữ liệu</div>;
  }

  const width = 250;
  const height = 250;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 15;

  // Tính tổng và góc cho mỗi phần
  const total = data.reduce((sum, item) => sum + parseInt(item.count || 0), 0);
  if (total === 0) {
    return <div className="text-gray-500 text-sm py-8 text-center">Chưa có dữ liệu</div>;
  }

  // Màu sắc cho từng trạng thái
  const statusColors = {
    pending: '#fbbf24',
    confirmed: '#3b82f6',
    processing: '#8b5cf6',
    shipping: '#6366f1',
    delivered: '#10b981',
    cancelled: '#ef4444',
  };

  const statusLabels = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao hàng',
    delivered: 'Đã hoàn thành',
    cancelled: 'Đã hủy',
  };

  let currentAngle = -90; // Bắt đầu từ trên cùng

  // Tính toán các cung
  const segments = data.map((item) => {
    const count = parseInt(item.count || 0);
    const percentage = (count / total) * 100;
    const angle = (count / total) * 360;
    
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    // Tính toán điểm bắt đầu và kết thúc của cung
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    // Tính vị trí label (giữa cung)
    const labelAngle = (startAngle + endAngle) / 2;
    const labelAngleRad = (labelAngle * Math.PI) / 180;
    const labelRadius = radius * 0.7;
    const labelX = centerX + labelRadius * Math.cos(labelAngleRad);
    const labelY = centerY + labelRadius * Math.sin(labelAngleRad);

    return {
      ...item,
      pathData,
      percentage: percentage.toFixed(1),
      labelX,
      labelY,
      color: statusColors[item.status] || '#9ca3af',
      label: statusLabels[item.status] || item.status,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        {segments.map((segment, i) => (
          <g key={i}>
            <path
              d={segment.pathData}
              fill={segment.color}
              stroke="#fff"
              strokeWidth="2"
            />
            {parseFloat(segment.percentage) > 5 && (
              <text
                x={segment.labelX}
                y={segment.labelY}
                fontSize="10"
                textAnchor="middle"
                fill="#fff"
                fontWeight="600"
              >
                {segment.percentage}%
              </text>
            )}
          </g>
        ))}
      </svg>
      
      {/* Legend */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {segments.map((segment, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-gray-700">{segment.label}</span>
            <span className="text-gray-500">({segment.count})</span>
          </div>
        ))}
      </div>
    </div>
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
