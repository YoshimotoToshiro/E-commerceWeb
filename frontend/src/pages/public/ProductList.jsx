import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../../api/product';
import ProductCard from '../../components/product/ProductCard';
import Loading from '../../components/common/Loading';
import FilterSidebar from '../../components/product/FilterSidebar';

export default function ProductList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });

  useEffect(() => {
    // Cập nhật filters từ URL params
    setFilters({
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      priceMin: searchParams.get('priceMin') || '',
      priceMax: searchParams.get('priceMax') || '',
      page: parseInt(searchParams.get('page')) || 1,
    });
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    const params = {
      ...filters,
      page: filters.page || 1,
      limit: 12,
    };
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });

    productAPI.getProducts(params)
      .then(res => {
        if (res.data.success) {
          setProducts(res.data.data.products);
          setPagination(res.data.data.pagination);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [filters]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    navigate(`/products?${params.toString()}`);
  };

  const hasSearchQuery = filters.search && filters.search.trim();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* Filter Sidebar - chỉ hiển thị khi có từ khóa tìm kiếm */}
        {hasSearchQuery && (
          <div className="flex-shrink-0">
            <FilterSidebar />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">
              {hasSearchQuery ? `Kết quả tìm kiếm: "${filters.search}"` : 'Danh sách sản phẩm'}
            </h1>
            {hasSearchQuery && (
              <button
                onClick={() => navigate('/products')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Xem tất cả sản phẩm
              </button>
            )}
          </div>

          {loading ? (
            <Loading />
          ) : (
            <>
              <div className={`grid gap-3 justify-items-center ${
                hasSearchQuery 
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4' 
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5'
              }`}>
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <span className="px-4 py-2">
                    Trang {filters.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page >= pagination.totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

