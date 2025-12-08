import { useEffect, useState } from 'react';
import { settingsAPI } from '../../api/settings';

export default function Footer() {
  const [settings, setSettings] = useState({
    siteName: 'Tech Store',
    supportEmail: 'contact@techstore.com',
    phone: '0123456789',
    facebook: '',
    instagram: '',
    twitter: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await settingsAPI.getPublic();
        const data = res?.data?.data || {};
        setSettings((prev) => ({ ...prev, ...data }));
      } catch {
        // ignore - use defaults
      }
    };
    load();
  }, []);

  const { siteName, supportEmail, phone, facebook, instagram, twitter } = settings;

  const SocialLink = ({ href, children }) => {
    if (!href) return null;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-300 hover:text-white transition-colors"
      >
        {children}
      </a>
    );
  };

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">🛒 {siteName}</h3>
            <p className="text-gray-400">
              Website bán hàng công nghệ uy tín, chất lượng
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Liên hệ</h4>
            <p className="text-gray-400">Email: {supportEmail}</p>
            <p className="text-gray-400">Phone: {phone}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Theo dõi</h4>
            <div className="flex gap-4 text-sm">
              <SocialLink href={facebook}>Facebook</SocialLink>
              <SocialLink href={instagram}>Instagram</SocialLink>
              <SocialLink href={twitter}>Twitter</SocialLink>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 {siteName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

