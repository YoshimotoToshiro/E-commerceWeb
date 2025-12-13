import { useEffect, useMemo, useState } from 'react';
import { orderAPI } from '../../api/order';
import { userAPI } from '../../api/user';
import { productAPI } from '../../api/product';
import BackButton from '../../components/common/BackButton';

const REPORT_TYPES = [
  { id: 'revenue', label: 'Doanh thu / Thống kê đơn hàng' },
  { id: 'users', label: 'Khách hàng / User hoạt động' },
  { id: 'inventory', label: 'Sản phẩm / Kho hàng' }
];

const TIME_RANGES = [
  { id: 'day', label: 'Ngày' },
  { id: 'week', label: 'Tuần' },
  { id: 'month', label: 'Tháng' },
  { id: 'year', label: 'Năm' }
];

function downloadBlob(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCSV(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const s = String(v ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const lines = [
    headers.join(','),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))
  ];
  return lines.join('\n');
}

function openPrintWindow(html) {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>Export PDF</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
          th { background: #f4f4f5; }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
  win.close();
}

export default function Reports() {
  const [reportType, setReportType] = useState('revenue');
  const [timeRange, setTimeRange] = useState('month');
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [rawRows, setRawRows] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (reportType === 'revenue') {
          // Dùng danh sách đơn hàng để hiển thị chi tiết (pagination server)
          const res = await orderAPI.getOrders({ page, limit: pageSize });
          if (res.data?.success) {
            const orders = res.data.data.orders || [];
            setTotal(res.data.data.pagination?.total || orders.length);
            const mapped = orders.map(o => ({
              id: o.id,
              orderCode: o.code || `ORD-${o.id}`,
              customer: o.user?.full_name || o.user?.username || `#${o.user?.id ?? ''}`,
              total: o.final_amount ?? o.total_amount ?? 0,
              status: o.status,
              date: (o.order_date || o.createdAt || '').toString().slice(0, 10),
              _rawDate: o.order_date || o.createdAt
            }));
            setRawRows(mapped);
          } else {
            setRawRows([]); setTotal(0);
          }
        } else if (reportType === 'users') {
          // Hỗ trợ search server-side
          const params = { page, limit: pageSize };
          if (query?.trim()) params.search = query.trim();
          const res = await userAPI.getUsers(params);
          if (res.data?.success) {
            const users = res.data.data.users || [];
            setTotal(res.data.data.pagination?.total || users.length);
            const mapped = users.map(u => ({
              id: u.id,
              username: u.username,
              fullName: u.full_name,
              email: u.email,
              actions: u.actionCount ?? null,
              lastActive: (u.last_active || u.updatedAt || u.createdAt || '').toString().slice(0, 16).replace('T', ' '),
              _rawDate: u.last_active || u.updatedAt || u.createdAt
            }));
            setRawRows(mapped);
          } else {
            setRawRows([]); setTotal(0);
          }
        } else if (reportType === 'inventory') {
          // Sản phẩm/kho, hỗ trợ search server-side
          const params = { page, limit: pageSize };
          if (query?.trim()) params.search = query.trim();
          const res = await productAPI.getProducts(params);
          if (res.data?.success) {
            const products = res.data.data.products || [];
            setTotal(res.data.data.pagination?.total || products.length);
            const mapped = products.map(p => ({
              id: p.id,
              sku: p.sku || `SKU-${p.id}`,
              product: p.name,
              stock: p.variants?.[0]?.stock_quantity ?? p.stock_quantity ?? null,
              price: p.finalPrice ?? p.base_price,
              updatedAt: (p.updatedAt || p.createdAt || '').toString().slice(0, 16).replace('T', ' '),
              _rawDate: p.updatedAt || p.createdAt
            }));
            setRawRows(mapped);
          } else {
            setRawRows([]); setTotal(0);
          }
        }
      } catch (e) {
        console.error(e);
        setRawRows([]); setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, page, query]);

  const headers = useMemo(() => {
    if (reportType === 'revenue') return ['id', 'orderCode', 'customer', 'total', 'status', 'date'];
    if (reportType === 'users') {
      const hasActions = rawRows.some(r => r.actions !== undefined && r.actions !== null && r.actions !== '');
      return ['id', 'username', 'fullName', 'email', ...(hasActions ? ['actions'] : []), 'lastActive'];
    }
    if (reportType === 'inventory') {
      const hasStock = rawRows.some(r => r.stock !== undefined && r.stock !== null && r.stock !== '');
      return ['id', 'sku', 'product', ...(hasStock ? ['stock'] : []), 'price', 'updatedAt'];
    }
    return [];
  }, [reportType, rawRows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = rawRows;
    // với revenue & inventory, query đã áp dụng server-side cho inventory; revenue không có search server-side → có thể lọc client bổ sung
    if (reportType !== 'users') {
      rows = rows.filter((r) => !q || Object.values(r).some((v) => String(v).toLowerCase().includes(q)));
    }
    // Giả lập time range filter đơn giản theo date-like field
    const now = new Date();
    const threshold = {
      day: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
      week: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7),
      month: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()),
      year: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    }[timeRange];

    const dateKey = reportType === 'revenue' ? '_rawDate' : reportType === 'users' ? '_rawDate' : '_rawDate';
    rows = rows.filter((r) => {
      const d = new Date(r[dateKey] || 0);
      return !isNaN(d) && d >= threshold;
    });

    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      if (sortDir === 'asc') return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });

    return rows;
  }, [rawRows, query, timeRange, sortKey, sortDir, reportType]);

  const totalPages = Math.max(1, Math.ceil((reportType === 'users' || reportType === 'inventory' || reportType === 'revenue' ? total : filtered.length) / pageSize));
  const pageRows = useMemo(() => {
    // Với dữ liệu đã phân trang từ server, filtered đã là trang hiện tại
    if (reportType === 'users' || reportType === 'inventory' || reportType === 'revenue') {
      return filtered;
    }
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, reportType]);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleExportCSV = () => {
    const csv = toCSV(filtered);
    downloadBlob(csv, `${reportType}-${timeRange}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleExportExcel = () => {
    // Không dùng thư viện, xuất CSV có thể mở bằng Excel
    const csv = toCSV(filtered);
    downloadBlob(csv, `${reportType}-${timeRange}.xlsx`, 'application/vnd.ms-excel');
  };

  const handleExportPDF = () => {
    const tableHtml = `
      <h2>Reports & Export - ${REPORT_TYPES.find((t) => t.id === reportType)?.label}</h2>
      <p>Time range: ${TIME_RANGES.find((t) => t.id === timeRange)?.label}</p>
      <table>
        <thead>
          <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${filtered
            .map(
              (r) => `<tr>${headers.map((h) => `<td>${r[h] ?? ''}</td>`).join('')}</tr>`
            )
            .join('')}
        </tbody>
      </table>
    `;
    openPrintWindow(tableHtml);
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <BackButton className="mb-4" />
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Reports & Export</h1>

        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="px-3 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900">
            Export CSV
          </button>
          <button onClick={handleExportExcel} className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">
            Export Excel
          </button>
          <button onClick={handleExportPDF} className="px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700">
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-slate-500 mb-2">Loại báo cáo</div>
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setReportType(t.id); setPage(1); }}
                className={`px-3 py-2 rounded-lg border ${reportType === t.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-slate-500 mb-2">Thời gian</div>
          <div className="flex flex-wrap gap-2">
            {TIME_RANGES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTimeRange(t.id); setPage(1); }}
                className={`px-3 py-2 rounded-lg border ${timeRange === t.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="text-sm text-slate-500 mb-2">Tìm kiếm</div>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Tìm trong bảng..."
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {loading && (
          <div className="px-4 py-6 text-slate-500">Đang tải dữ liệu…</div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left">
              <tr>
                {headers.map((h) => (
                  <th key={h} className="px-4 py-3 border-b text-sm font-semibold text-slate-600 cursor-pointer select-none" onClick={() => handleSort(h)}>
                    <div className="flex items-center gap-2">
                      <span>{h}</span>
                      {sortKey === h ? <span>{sortDir === 'asc' ? '▲' : '▼'}</span> : null}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.id} className="odd:bg-white even:bg-slate-50">
                  {headers.map((h) => (
                    <td key={h} className="px-4 py-3 border-b text-sm text-slate-700 whitespace-nowrap">
                      {(() => {
                        const v = r[h];
                        if (v === 0) return 0;
                        return (v === undefined || v === null || v === '') ? '-' : v;
                      })()}
                    </td>
                  ))}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={headers.length} className="px-4 py-8 text-center text-slate-500">
                    Không có dữ liệu phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3">
          <div className="text-sm text-slate-600">
            Trang {page} / {totalPages} — Tổng {(reportType === 'users' || reportType === 'inventory' || reportType === 'revenue') ? total : filtered.length} dòng
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              disabled={page <= 1}
            >
              Trước
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50"
              disabled={page >= totalPages}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


