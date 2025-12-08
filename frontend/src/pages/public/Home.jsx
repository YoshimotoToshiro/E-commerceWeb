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
            className="text-primary hover:underline"
          >
            Xem tất cả →
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

