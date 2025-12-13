import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../../api/product';
import ProductCard from '../../components/product/ProductCard';
import Loading from '../../components/common/Loading';
import Banner from '../../components/common/Banner';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productAPI.getProducts({ limit: 10, is_featured: true, sort: 'createdAt', order: 'DESC' })
      .then(res => {
        if (res.data.success) {
          setProducts(res.data.data.products);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Banner Section */}
      <Banner />

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">Sản phẩm nổi bật</h2>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm hover:shadow"
          >
            Xem tất cả
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 justify-items-center">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

