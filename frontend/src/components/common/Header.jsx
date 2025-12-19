import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { cartAPI } from '../../api/cart';
import { useEffect, useState } from 'react';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      cartAPI.getCart()
        .then(res => {
          if (res.data.success) {
            const items = res.data.data.cart.items || [];
            setCartCount(items.reduce((sum, item) => sum + item.quantity, 0));
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    const category = searchParams.get('category');
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    if (category) params.set('category', category);
    if (priceMin) params.set('priceMin', priceMin);
    if (priceMax) params.set('priceMax', priceMax);
    navigate(`/products?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-[#ff6a21] via-[#ff5a1f] to-[#ff3c1f] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 text-white">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center justify-center text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                fill="none"
                className="h-11 w-11"
                aria-hidden="true"
              >
                <g stroke="#2563EB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8h4.2l1.3 7.2h11a1.4 1.4 0 0 0 1.36-1.08l1-4.36A1.2 1.2 0 0 0 23.72 8H10.4" />
                  <path d="M13.4 23.6h7.5" />
                  <circle cx="13.2" cy="25.6" r="2" fill="#2563EB" stroke="none" />
                  <circle cx="22.8" cy="25.6" r="2" fill="#2563EB" stroke="none" />
                  <path d="M9.8 11.5h11.8" strokeDasharray="2.5 3" />
                  <path d="M12.6 10V15.2" strokeDasharray="2 3" />
                  <path d="M18.4 11.5v3.7" strokeDasharray="2 3" />
                  <path d="M18.4 5.5l3.2 2.5" />
                  <path d="M18.4 5.5h-4.6" />
                  <circle cx="18.4" cy="5.5" r="1" fill="#2563EB" stroke="none" />
                  <circle cx="13.8" cy="5.5" r="0.9" fill="#2563EB" stroke="none" />
                </g>
              </svg>
            </div>
            <div className="leading-tight">
              <span className="text-xl font-semibold text-white">Tech Store</span>
              <span className="block text-xs text-white/80">Mua sắm công nghệ</span>
            </div>
          </Link>

          <div className="flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-10 pr-12 py-2.5 border border-transparent rounded-lg bg-white text-gray-700 shadow focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-transparent transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#ff3c1f] text-white px-4 py-1.5 rounded-md hover:bg-[#ff250f] transition-colors flex items-center gap-1.5 shadow"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm font-medium">Tìm</span>
                </button>
              </div>
            </form>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-white/90 hover:text-white"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-white/90 text-[#ff3c1f] font-semibold hover:bg-white"
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <>
                {user?.role === 'user' && (
                  <Link
                    to="/user/cart"
                    className="relative flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path d="M4 6h2l3.6 9.59a1 1 0 0 0 .92.66H17a1 1 0 0 0 .95-.68L20 9H7" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="9" cy="20" r="1.4" />
                      <circle cx="17" cy="20" r="1.4" />
                    </svg>
                    <span>Giỏ hàng</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-white text-[#ff3c1f] text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}

                <div
                  className="relative"
                  onMouseEnter={() => setShowUserMenu(true)}
                  onMouseLeave={() => setShowUserMenu(false)}
                >
                  <button className="flex items-center gap-2 px-4 py-2 text-white/90 hover:text-white">
                    <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-[#ff3c1f]">
                      {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span>{user?.full_name || user?.username}</span>
                    <span>▼</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 top-full pt-2 w-48 z-50">
                      <div className="bg-white rounded-lg shadow-lg py-2 text-gray-700">
                        <Link
                          to="/user/profile"
                          className="block px-4 py-2 hover:bg-gray-100"
                        >
                          👤 Hồ sơ
                        </Link>
                        {user?.role === 'user' && (
                          <Link
                            to="/user/orders"
                            className="block px-4 py-2 hover:bg-gray-100"
                          >
                            📦 Đơn hàng
                          </Link>
                        )}
                        {user?.role === 'employee' && (
                          <Link
                            to="/employee/orders"
                            className="block px-4 py-2 hover:bg-gray-100"
                          >
                            📋 Quản lý đơn hàng
                          </Link>
                        )}
                        {user?.role === 'admin' ? (
                          <>
                            <Link
                              to="/user/profile"
                              className="block px-4 py-2 hover:bg-gray-100"
                            >
                              👤 Hồ sơ
                            </Link>
                            <Link
                              to="/admin/dashboard"
                              className="block px-4 py-2 hover:bg-gray-100"
                            >
                              🛠️ Admin Dashboard
                            </Link>
                          </>
                        ) : (
                          ['manager'].includes(user?.role) && (
                            <>
                              <Link
                                to="/manager/dashboard"
                                className="block px-4 py-2 hover:bg-gray-100"
                              >
                                📊 Thống kê
                              </Link>
                              <Link
                                to="/manager/products"
                                className="block px-4 py-2 hover:bg-gray-100"
                              >
                                🛍️ Quản lý sản phẩm
                              </Link>
                              <Link
                                to="/manager/banners"
                                className="block px-4 py-2 hover:bg-gray-100"
                              >
                                🎨 Quản lý Banner
                              </Link>
                              <Link
                                to="/manager/suppliers"
                                className="block px-4 py-2 hover:bg-gray-100"
                              >
                                🏢 Quản lý nhà cung cấp
                              </Link>
                            </>
                          )
                        )}
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                        >
                          🚪 Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

