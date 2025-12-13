import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bannerAPI } from '../../api/banner';
import Loading from './Loading';

export default function Banner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
        goToNext();
      }, 5000); // Đổi banner mỗi 5 giây
      return () => clearInterval(interval);
    }
  }, [banners.length, currentIndex]);

  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToPrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  if (loading) return <Loading />;
  if (banners.length === 0) return null;

  return (
    <section className="rounded-lg mb-14 text-center relative overflow-hidden" style={{ height: 'clamp(320px, 40vw, 520px)', minHeight: '320px' }}>
      {/* Container với hiệu ứng slide */}
      <div 
        className="relative w-full h-full flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => {
  const bannerStyle = {
            backgroundColor: banner.background_color || '#1E40AF',
            color: banner.text_color || '#FFFFFF',
            backgroundImage: banner.background_image 
              ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${banner.background_image})`
      : undefined,
    backgroundSize: 'cover',
            backgroundPosition: 'center',
            minWidth: '100%',
            width: '100%',
            height: '100%',
            flexShrink: 0
  };

  return (
            <div
              key={banner.id || index}
              className="flex items-center justify-center p-16"
      style={bannerStyle}
    >
      <div className="relative z-10">
                {/* Không hiển thị tiêu đề, phụ đề và nút */}
              </div>
            </div>
          );
        })}
      </div>

      {/* Nút mũi tên trái */}
      {banners.length > 1 && (
        <button
          onClick={goToPrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all backdrop-blur-sm"
          aria-label="Banner trước"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        )}

      {/* Nút mũi tên phải */}
      {banners.length > 1 && (
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 rounded-full p-3 transition-all backdrop-blur-sm"
          aria-label="Banner sau"
          >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Dots indicator nếu có nhiều banner */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
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

