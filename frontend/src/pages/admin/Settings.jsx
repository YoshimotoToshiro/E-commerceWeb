import { useEffect, useState } from 'react';
import { settingsAPI } from '../../api/settings';

export default function AdminSettings() {
  const [siteName, setSiteName] = useState('Tech Store');
  const [supportEmail, setSupportEmail] = useState('support@example.com');
  const [phone, setPhone] = useState('0123456789');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [twitter, setTwitter] = useState('');
  const [maintenance, setMaintenance] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await settingsAPI.get();
        const data = res?.data?.data || {};
        if (data.siteName) setSiteName(data.siteName);
        if (data.supportEmail) setSupportEmail(data.supportEmail);
        if (data.phone) setPhone(data.phone);
        if (data.facebook) setFacebook(data.facebook);
        if (data.instagram) setInstagram(data.instagram);
        if (data.twitter) setTwitter(data.twitter);
        if (data.maintenance) setMaintenance(data.maintenance === 'true' || data.maintenance === true);
      } catch (e) {
        setError('Không tải được cấu hình');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    settingsAPI.update({ siteName, supportEmail, phone, facebook, instagram, twitter, maintenance })
      .then(() => setMessage('Đã lưu cấu hình'))
      .catch(() => setError('Lưu cấu hình thất bại'))
      .finally(() => setSaving(false));
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Cấu hình hệ thống</h1>
      {loading ? (
        <div className="bg-white rounded-lg shadow p-6">Đang tải...</div>
      ) : (
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6 max-w-2xl">
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {message && <div className="text-emerald-600 text-sm">{message}</div>}
        <div>
          <label className="block text-sm font-medium mb-1">Tên website</label>
          <input
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Nhập tên website"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email hỗ trợ</label>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="support@domain.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Số điện thoại</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="0123456789"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Facebook URL</label>
            <input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instagram URL</label>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="https://instagram.com/yourpage"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Twitter URL</label>
            <input
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="https://twitter.com/yourpage"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            id="maintenance"
            type="checkbox"
            checked={maintenance}
            onChange={(e) => setMaintenance(e.target.checked)}
          />
          <label htmlFor="maintenance" className="text-sm">
            Bật chế độ bảo trì
          </label>
        </div>
        <div className="pt-2">
          <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-60" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </form>
      )}
    </div>
  );
}


