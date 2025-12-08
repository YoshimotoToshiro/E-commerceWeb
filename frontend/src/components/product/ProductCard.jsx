import { Link } from 'react-router-dom';
import { formatCurrencyVND } from '../../utils/currency';

// Hàm tách tên sản phẩm, loại bỏ thông số kỹ thuật
const getProductNameOnly = (fullName) => {
  if (!fullName) return '';
  
  // Tách theo các dấu phân cách phổ biến
  const separators = [' - ', ' | ', ' / ', ' • '];
  let name = fullName;
  
  for (const sep of separators) {
    if (name.includes(sep)) {
      name = name.split(sep)[0].trim();
      break;
    }
  }
  
  // Loại bỏ các pattern thông số phổ biến ở cuối tên
  const specPatterns = [
    /\s+\d+GB\s*$/i,
    /\s+\d+TB\s*$/i,
    /\s+\d+MB\s*$/i,
    /\s+\d+GB\s*-\s*[^-]+$/i,
    /\s+-\s*\d+GB\s*$/i,
    /\s+\([^)]*\)\s*$/,
    /\s+\[[^\]]*\]\s*$/
  ];
  
  for (const pattern of specPatterns) {
    name = name.replace(pattern, '').trim();
  }
  
  return name || fullName;
};

export default function ProductCard({ product }) {
  const finalPrice = product.finalPrice || (product.base_price * (1 - (product.discount_percent || 0) / 100));
  const discount = product.discount_percent || 0;
  const totalSold = product.totalSold || 0;
  const productNameOnly = getProductNameOnly(product.name);

  return (
    <Link
      to={`/products/${product.id}`}
      className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden hover:shadow-lg hover:border-accent/30 hover:scale-105 transform transition-all duration-300 w-full max-w-[200px] min-h-[300px] max-h-[340px] flex flex-col"
    >
      <div className="relative w-full h-[180px] flex-shrink-0">
        <img
          src={product.images?.[0]?.image_url || 'https://picsum.photos/300/300'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-2.5 flex-1 flex flex-col">
        <h3 className="font-medium text-base mb-1 line-clamp-2 min-h-[2.25rem] leading-tight flex-shrink-0">{productNameOnly}</h3>
        
        <div className="mt-auto pt-0.5 flex flex-col gap-1.5 flex-shrink-0">
          {discount > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 line-through text-xs">
                {formatCurrencyVND(product.base_price, { minimumFractionDigits: 0 })}
              </span>
              <span className="bg-accent text-white px-2 py-0.5 rounded text-xs font-semibold">
                -{discount}%
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-accent font-bold text-sm">
              {formatCurrencyVND(finalPrice, { minimumFractionDigits: 0 })}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {product.avgRating > 0 ? (
                <div className="flex items-center gap-1">
                  <div className="relative inline-flex items-center">
                    {/* 5 sao xám làm nền */}
                    <div className="flex text-gray-300 text-xs">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                    </div>
                    {/* Sao vàng chồng lên trên */}
                    <div 
                      className="absolute top-0 left-0 flex text-yellow-500 text-xs overflow-hidden"
                      style={{ width: `${(product.avgRating / 5) * 100}%` }}
                    >
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                    </div>
                  </div>
                  {product.reviewCount > 0 && (
                    <span className="text-xs text-gray-500">({product.reviewCount})</span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-gray-500">Mới ra mắt</span>
              )}
            </div>
            <span className="text-xs text-gray-500">
              Đã bán: <span className="font-medium text-gray-700">{totalSold}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

