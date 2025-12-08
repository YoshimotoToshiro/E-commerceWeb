import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bannerAPI } from '../../api/banner';
import Loading from './Loading';

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    bannerAPI.getActiveBanners()
      .then(res => {
        if (res.data.success) {
          setBanners(res.data.data.banners);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Auto slide nếu có nhiều banner
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000); // Đổi banner mỗi 5 giây
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  if (loading) return <Loading />;
  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  const bannerStyle = {
    backgroundColor: currentBanner.background_color || '#1E40AF',
    color: currentBanner.text_color || '#FFFFFF',
    backgroundImage: currentBanner.background_image 
      ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${currentBanner.background_image})`
      : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  };

  return (
    <section 
      className="rounded-lg p-12 mb-12 text-center relative overflow-hidden"
      style={bannerStyle}
    >
      <div className="relative z-10">
        <h1 className="text-4xl font-bold mb-4">{currentBanner.title}</h1>
        {currentBanner.subtitle && (
          <p className="text-xl mb-8">{currentBanner.subtitle}</p>
        )}
        {currentBanner.button_text && (
          <Link
            to={currentBanner.button_link || '/products'}
            className="inline-block px-8 py-3 bg-accent rounded-lg hover:bg-orange-600 transition"
          >
            {currentBanner.button_text}
          </Link>
        )}
      </div>

      {/* Dots indicator nếu có nhiều banner */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

