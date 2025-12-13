import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productAPI } from '../../api/product';
import { cartAPI } from '../../api/cart';
import { reviewAPI } from '../../api/review';
import { orderAPI } from '../../api/order';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import { formatCurrencyVND } from '../../utils/currency';
import ProductCard from '../../components/product/ProductCard';

const ShieldIcon = () => (
  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5l6-4 6 4v4.5c0 3.5-2.2 6.7-6 8.5-3.8-1.8-6-5-6-8.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 11.5l2 2 3-3.5" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10a9 9 0 0115.5-4.5L21 8m0-4v4h-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 14a9 9 0 01-15.5 4.5L3 16m0 4v-4h4" />
  </svg>
);

const TruckIcon = () => (
  <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
    <circle cx="7.5" cy="18" r="1.5" />
    <circle cx="18" cy="18" r="1.5" />
  </svg>
);

const COLOR_KEYWORDS = [
  'màu', 'đen', 'trắng', 'đỏ', 'xanh', 'vàng', 'tím', 'nâu', 'bạc', 'hồng', 'cam', 'xám', 'ghi',
  'black', 'white', 'red', 'blue', 'green', 'yellow', 'purple', 'brown', 'silver', 'gold', 'orange', 'gray', 'grey'
];
const SIZE_KEYWORDS = ['size', 's ', ' m', ' l', 'xl', 'xxl', 'cm', 'mm', 'inch', 'dài'];
const CAPACITY_KEYWORDS = ['gb', 'tb', 'ram', 'ssd', 'hz', 'ghz', 'rom', 'mb', 'storage', 'dung lượng', 'bộ nhớ'];

const containsKeyword = (values, keywords) =>
  values.some((value) => keywords.some((keyword) => value.includes(keyword)));

const guessOptionLabel = (values, idx) => {
  const normalized = values.map((value) => value.toLowerCase());
  if (containsKeyword(normalized, COLOR_KEYWORDS)) return 'Màu sắc';
  if (
    containsKeyword(normalized, SIZE_KEYWORDS) ||
    normalized.some((value) => /\b(x{0,2}[sml]{1,2})\b/.test(value))
  ) {
    return 'Kích cỡ';
  }
  if (containsKeyword(normalized, CAPACITY_KEYWORDS)) return 'Cấu hình';
  return `Tùy chọn ${idx + 1}`;
};

const parseOptionValue = (value) => {
  let working = value;
  let image = null;
  const imageMatch = working.match(/\[img:(.*?)\]/i);
  if (imageMatch) {
    image = imageMatch[1].trim();
    working = working.replace(imageMatch[0], '').trim();
  }
  const segments = working.split('|').map((segment) => segment.trim()).filter(Boolean);
  const mainText = segments[0] || working;
  const subText = segments[1] || '';

  return {
    raw: value,
    mainText,
    subText,
    image
  };
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedParts, setSelectedParts] = useState([]); // các tùy chọn theo vị trí
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewPagination, setReviewPagination] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '', order_id: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const productId = product?.id;
  const canReview = user?.role === 'user';

  const loadProductReviews = async (page = 1) => {
    if (!product?.id) return;
    setReviewLoading(true);
    setReviewError('');
    try {
      const response = await reviewAPI.getProductReviews(product.id, {
        page,
        limit: 5,
      });
      if (response.data.success) {
        const { reviews: fetchedReviews = [], pagination } = response.data.data;
        setReviews((prev) => (page === 1 ? fetchedReviews : [...prev, ...fetchedReviews]));
        setReviewPagination(pagination);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Không thể tải danh sách đánh giá';
      setReviewError(message);
      toast.error(message);
    } finally {
      setReviewLoading(false);
    }
  };

  const loadEligibleOrders = async () => {
    if (!isAuthenticated || !product?.id) return;
    setOrdersLoading(true);
    try {
      const response = await orderAPI.getOrders({
        status: 'delivered',
        page: 1,
        limit: 50
      });
      if (response.data.success) {
        const orders = response.data.data.orders || [];
        const matched = orders
          .filter(order => Array.isArray(order.items) && order.items.some(item => {
            const itemProductId = item.product_id ?? item.product?.id;
            return itemProductId && Number(itemProductId) === Number(product.id);
          }))
          .map(order => ({
            id: order.id,
            code: order.order_code || `ORD-${order.id}`,
            deliveredAt: order.updatedAt || order.order_date
          }));
        setEligibleOrders(matched);
        if (matched.length > 0) {
          // Tự động chọn đơn hàng đầu tiên (mới nhất)
          setReviewForm(prev => ({
            ...prev,
            order_id: String(matched[0].id)
          }));
        } else {
          setReviewForm(prev => ({
            ...prev,
            order_id: ''
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load delivered orders', error);
      toast.error('Không thể kiểm tra đơn hàng đã nhận');
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleLoadMoreReviews = () => {
    if (reviewPagination && reviewPagination.page < reviewPagination.totalPages) {
      loadProductReviews(reviewPagination.page + 1);
    }
  };

  const handleSelectRating = (value) => {
    setReviewForm(prev => ({ ...prev, rating: value }));
  };

  const handleReviewInputChange = (field, value) => {
    setReviewForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để đánh giá sản phẩm');
      navigate('/login');
      return;
    }
    if (!reviewForm.rating) {
      toast.error('Vui lòng chọn số sao đánh giá');
      return;
    }
    if (!reviewForm.order_id || eligibleOrders.length === 0) {
      toast.error('Bạn cần mua và nhận được sản phẩm này trước khi đánh giá');
      return;
    }

    if (!canReview) {
      toast.error('Tài khoản của bạn không có quyền gửi đánh giá');
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await reviewAPI.createReview({
        product_id: product.id,
        order_id: Number(reviewForm.order_id),
        rating: reviewForm.rating,
        comment: reviewForm.comment?.trim() || ''
      });
      const createdReview = response?.data?.data?.review;
      toast.success(response?.data?.message || 'Đánh giá đã được gửi thành công');
      setReviewForm(prev => ({
        ...prev,
        rating: 0,
        comment: '',
        order_id: ''
      }));
      
      // Reload reviews from server to get updated list
      setReviews([]);
      setReviewPagination(null);
      await loadProductReviews(1);
      
      // Also update eligible orders to remove the one that was just reviewed
      loadEligibleOrders();
    } catch (error) {
      const message = error.response?.data?.message || 'Gửi đánh giá thất bại';
      toast.error(message);
    } finally {
      setSubmittingReview(false);
    }
  };

  useEffect(() => {
    productAPI.getProductById(id)
      .then(res => {
        if (res.data.success) {
          const data = res.data.data;
          setProduct(data);
          setReviews([]);
          setReviewPagination(null);
          if (data.variants && data.variants.length > 0) {
            setSelectedVariant(data.variants[0].id);
            // Khởi tạo selectedParts từ biến thể đầu tiên
            const firstParts = data.variants[0].variant_name
              .split('-')
              .map(s => s.trim())
              .filter(Boolean);
            setSelectedParts(firstParts);
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // Điều chỉnh quantity khi variant hoặc stock thay đổi
  useEffect(() => {
    if (!product) return;
    const variant = product.variants?.find(v => v.id === selectedVariant);
    const maxQty = variant 
      ? variant.stock_quantity 
      : (typeof product.stock_quantity === 'number' ? product.stock_quantity : 999);
    
    if (quantity > maxQty) {
      setQuantity(Math.max(1, maxQty));
    }
  }, [selectedVariant, product]);

  useEffect(() => {
    // Reset ảnh hiện tại khi đổi sản phẩm
    setCurrentImageIndex(0);
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    loadProductReviews(1);
  }, [productId]);

  useEffect(() => {
    if (!product?.category_id) return;

    setRelatedLoading(true);
    productAPI.getProducts({ category: product.category_id, limit: 8, page: 1 })
      .then(res => {
        if (res.data.success) {
          const products = res.data.data.products || [];
          const filtered = products.filter(item => item.id !== product.id);
          setRelatedProducts(filtered.slice(0, 5));
        }
      })
      .catch(err => {
        console.error('Failed to load related products', err);
        setRelatedProducts([]);
      })
      .finally(() => setRelatedLoading(false));
  }, [product]);

  useEffect(() => {
    if (productId && isAuthenticated) {
      loadEligibleOrders();
    } else {
      setEligibleOrders([]);
      setReviewForm(prev => ({ ...prev, order_id: '' }));
    }
  }, [productId, isAuthenticated]);

  // Reload eligible orders when page becomes visible (user returns from order page)
  useEffect(() => {
    if (!productId || !isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadEligibleOrders();
      }
    };

    const handleFocus = () => {
      loadEligibleOrders();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [productId, isAuthenticated]);

  // Hàm normalize để chuẩn hóa giá trị variant cho việc so sánh
  const normalizeValue = (value) => {
    if (!value) return '';
    return value
      .replace(/\s+/g, ' ')  // Thay nhiều khoảng trắng thành 1 khoảng
      .replace(/\s*\/\s*/g, '/')  // Chuẩn hóa dấu / (loại bỏ khoảng trắng quanh dấu /)
      .trim()
      .toLowerCase();
  };

  // Parse variants thành các nhóm tùy chọn theo vị trí: "A - B - C" => nhóm 0: A*, nhóm 1: B*, ...
  const parsedVariants = (product?.variants || []).map(v => ({
    ...v,
    parts: v.variant_name.split('-').map(s => s.trim()).filter(Boolean),
    normalizedParts: v.variant_name.split('-').map(s => normalizeValue(s.trim())).filter(Boolean)
  }));

  const optionCount = parsedVariants.reduce((max, v) => Math.max(max, v.parts.length), 0);
  const optionValues = Array.from({ length: optionCount }, (_, idx) => {
    // Lấy tất cả giá trị tại vị trí idx, normalize và loại bỏ trùng lặp
    const values = parsedVariants
      .map(v => v.parts[idx])
      .filter(Boolean);
    // Sử dụng Map để giữ giá trị gốc nhưng so sánh bằng giá trị normalized
    const uniqueMap = new Map();
    values.forEach((val) => {
      const normalized = normalizeValue(val);
      if (!uniqueMap.has(normalized)) {
        uniqueMap.set(normalized, val); // Giữ giá trị gốc
      }
    });
    return Array.from(uniqueMap.values());
  });
  
  const optionGroups = optionValues.map((values, idx) => ({
    index: idx,
    label: guessOptionLabel(values, idx),
    options: values.map((value) => parseOptionValue(value))
  }));
  
  // Debug log để kiểm tra
  if (optionGroups.length > 0) {
    console.log('=== DEBUG VARIANTS ===');
    console.log('Parsed variants:', parsedVariants);
    console.log('Option groups:', optionGroups);
    console.log('Option groups details:', optionGroups.map(g => ({
      index: g.index,
      label: g.label,
      optionsCount: g.options.length,
      options: g.options.map(o => o.raw)
    })));
  }

const matchLabel = (label = '', keywords = []) =>
  keywords.some(keyword => label.toLowerCase().includes(keyword));

const colorLabelKeywords = ['màu', 'color', 'màu sắc'];
const storageLabelKeywords = ['cấu hình', 'storage', 'dung lượng', 'phiên bản', 'version', 'ram', 'rom', 'bộ nhớ', 'size', 'kích cỡ'];

// Hàm kiểm tra xem nhóm có phải là cấu hình dựa trên nội dung giá trị
const isStorageGroupByContent = (group) => {
  const values = group.options.map(opt => opt.mainText.toLowerCase()).join(' ');
  return CAPACITY_KEYWORDS.some(keyword => values.includes(keyword));
};

// Tìm colorGroup: ưu tiên tìm bằng keywords, nếu không có thì lấy nhóm đầu tiên
let colorGroup = optionGroups.find(group => matchLabel(group.label, colorLabelKeywords));
if (!colorGroup && optionGroups.length > 0) {
  colorGroup = optionGroups[0];
}

// Tìm storageGroup: ưu tiên tìm bằng keywords, sau đó bằng nội dung, cuối cùng lấy nhóm thứ 2
let storageGroup = optionGroups.find(group =>
  group.index !== colorGroup?.index && matchLabel(group.label, storageLabelKeywords)
);

// Nếu không tìm thấy storageGroup bằng label, thử tìm bằng nội dung
if (!storageGroup && optionGroups.length > 1) {
  storageGroup = optionGroups.find(group => 
    group.index !== colorGroup?.index && isStorageGroupByContent(group)
  ) || null;
}

// Nếu vẫn không tìm thấy storageGroup, lấy nhóm thứ 2 (nếu có)
// Điều kiện hiển thị sẽ xử lý việc chỉ hiển thị khi có > 1 option
if (!storageGroup && optionGroups.length > 1) {
  // Tìm tất cả các nhóm không phải colorGroup, sắp xếp theo index và lấy nhóm đầu tiên
  const otherGroups = optionGroups.filter(group => group.index !== colorGroup?.index);
  if (otherGroups.length > 0) {
    // Sắp xếp theo index và lấy nhóm đầu tiên (nhóm thứ 2 sau màu sắc)
    otherGroups.sort((a, b) => a.index - b.index);
    storageGroup = otherGroups[0];
  }
}

// Debug log
if (optionGroups.length > 0) {
  console.log('Color group:', colorGroup ? {
    index: colorGroup.index,
    label: colorGroup.label,
    optionsCount: colorGroup.options.length
  } : null);
  console.log('Storage group:', storageGroup ? {
    index: storageGroup.index,
    label: storageGroup.label,
    optionsCount: storageGroup.options.length,
    options: storageGroup.options.map(o => o.raw)
  } : null);
  console.log('All groups:', optionGroups.map(g => ({
    index: g.index,
    label: g.label,
    optionsCount: g.options.length
  })));
}

// Lọc các nhóm đã được sử dụng (colorGroup và storageGroup)
const usedGroupIndexes = new Set([colorGroup?.index, storageGroup?.index].filter(idx => typeof idx === 'number'));
const additionalGroups = optionGroups.filter(group => !usedGroupIndexes.has(group.index));

const colorMap = {
  đen: '#111827',
  black: '#111827',
  trắng: '#f3f4f6',
  white: '#f3f4f6',
  bạc: '#d1d5db',
  silver: '#d1d5db',
  vàng: '#fbbf24',
  gold: '#fbbf24',
  xanh: '#1d4ed8',
  blue: '#2563eb',
  tím: '#7c3aed',
  purple: '#7c3aed',
  đỏ: '#dc2626',
  red: '#dc2626',
  cam: '#f97316',
  orange: '#f97316',
  lục: '#16a34a',
  green: '#16a34a'
};

const resolveColor = (label = '') => {
  const key = label.toLowerCase();
  const found = Object.keys(colorMap).find(color => key.includes(color));
  return found ? colorMap[found] : '#9ca3af';
};

  const findMatchingVariantId = (parts) => {
    const found = parsedVariants.find(v => {
      // Tất cả vị trí đã chọn phải khớp (so sánh normalized)
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) {
          const normalizedSelected = normalizeValue(parts[i]);
          if (v.normalizedParts[i] !== normalizedSelected) return false;
        }
      }
      return true;
    });
    return found?.id ?? null;
  };

  const isOptionValueAvailable = (positionIdx, value, currentParts) => {
    // Kiểm tra có biến thể nào khớp các phần đã chọn + value tại vị trí đang xét
    const candidateParts = [...currentParts];
    candidateParts[positionIdx] = value;
    const normalizedCandidate = candidateParts.map(p => normalizeValue(p));
    return parsedVariants.some(v => {
      for (let i = 0; i < normalizedCandidate.length; i++) {
        if (normalizedCandidate[i] && v.normalizedParts[i] !== normalizedCandidate[i]) return false;
      }
      return true;
    });
  };

  const handleSelectOption = (positionIdx, value) => {
    const nextParts = [...selectedParts];
    
    // Nếu đang chọn màu (colorGroup), kiểm tra xem cấu hình hiện tại có còn hợp lệ không
    if (colorGroup && positionIdx === colorGroup.index && storageGroup) {
      const currentConfig = nextParts[storageGroup.index];
      
      // Nếu có cấu hình đã chọn, kiểm tra xem cấu hình đó có tồn tại với màu mới không
      if (currentConfig) {
        const testParts = [...nextParts];
        testParts[positionIdx] = value; // Màu mới
        // Kiểm tra xem có variant nào khớp với màu mới + cấu hình cũ không
        const isValid = parsedVariants.some(v => {
          const normalizedNewColor = normalizeValue(value);
          const normalizedCurrentConfig = normalizeValue(currentConfig);
          return v.normalizedParts[colorGroup.index] === normalizedNewColor &&
                 v.normalizedParts[storageGroup.index] === normalizedCurrentConfig;
        });
        
        // Nếu cấu hình cũ không hợp lệ với màu mới, reset nó
        if (!isValid) {
          nextParts[storageGroup.index] = '';
        }
      }
    }
    
    nextParts[positionIdx] = value;
    setSelectedParts(nextParts);
    const matchId = findMatchingVariantId(nextParts);
    if (matchId) {
      setSelectedVariant(matchId);
    }
  };
  
  // Lọc các cấu hình có sẵn dựa trên màu đã chọn
  // Nếu chưa chọn màu, trả về tất cả các cấu hình
  const getAvailableConfigs = () => {
    if (!storageGroup) return [];
    
    const selectedColor = colorGroup ? selectedParts[colorGroup.index] : null;
    
    // Nếu chưa chọn màu, trả về tất cả các cấu hình
    if (!selectedColor) {
      return storageGroup.options;
    }
    
    // Lọc các variant có màu đã chọn
    const variantsWithColor = parsedVariants.filter(v => {
      const normalizedSelectedColor = normalizeValue(selectedColor);
      return v.normalizedParts[colorGroup.index] === normalizedSelectedColor;
    });
    
    // Lấy các cấu hình từ các variant đó
    const configSet = new Set();
    variantsWithColor.forEach(v => {
      if (v.parts[storageGroup.index]) {
        configSet.add(v.parts[storageGroup.index]);
      }
    });
    
    // Trả về các option của storageGroup mà có trong configSet
    return storageGroup.options.filter(option => 
      configSet.has(option.raw)
    );
  };
  
  // Kiểm tra xem một cấu hình có khả dụng cho màu đã chọn không
  const isConfigAvailableForColor = (configValue) => {
    if (!storageGroup || !colorGroup) return true;
    
    const selectedColor = selectedParts[colorGroup.index];
    
    // Nếu chưa chọn màu, tất cả cấu hình đều khả dụng
    if (!selectedColor) return true;
    
    // Kiểm tra xem có variant nào có màu đã chọn + cấu hình này không
    const normalizedSelectedColor = normalizeValue(selectedColor);
    const normalizedConfig = normalizeValue(configValue);
    
    return parsedVariants.some(v => {
      return v.normalizedParts[colorGroup.index] === normalizedSelectedColor &&
             v.normalizedParts[storageGroup.index] === normalizedConfig;
    });
  };

  const images = product?.images && product.images.length > 0
    ? product.images
    : [{ image_url: 'https://picsum.photos/600/600' }];

  const hasMultipleImages = images.length > 1;

  const goPrevImage = () => {
    if (!hasMultipleImages) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goNextImage = () => {
    if (!hasMultipleImages) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const formatReviewDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(new Date(dateStr));
    } catch (error) {
      return '';
    }
  };

  const selectImage = (idx) => {
    setCurrentImageIndex(idx);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      navigate('/login');
      return;
    }

    // Chặn manager và admin thêm vào giỏ hàng
    if (user && (user.role === 'manager' || user.role === 'admin')) {
      toast.error('Tài khoản manager và admin không thể đặt hàng');
      return;
    }

    try {
      await cartAPI.addItem({
        product_id: product.id,
        variant_id: selectedVariant,
        quantity
      });
      toast.success('Đã thêm vào giỏ hàng');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để mua hàng');
      navigate('/login');
      return;
    }

    // Chặn manager, admin và employee mua hàng
    if (user && (user.role === 'manager' || user.role === 'admin' || user.role === 'employee')) {
      toast.error('Tài khoản manager, admin và employee không thể đặt hàng');
      return;
    }

    await handleAddToCart();
    navigate('/user/cart');
  };

  if (loading) return <Loading />;
  if (!product) return <div>Sản phẩm không tồn tại</div>;

  const breadcrumbs = [
    { label: 'Trang chủ', to: '/' },
    { label: 'Danh sách sản phẩm', to: '/products' },
    { label: product.name }
  ];

  const variant = product.variants?.find(v => v.id === selectedVariant);
  
  // Đảm bảo parse đúng số từ backend
  const basePrice = parseFloat(product.base_price) || 0;
  const discountPercent = parseFloat(product.discount_percent) || 0;
  const priceAdjustment = variant ? (parseFloat(variant.price_adjustment) || 0) : 0;
  
  // Debug log để kiểm tra giá
  if (process.env.NODE_ENV === 'development') {
    console.log('Product price debug:', {
      basePrice,
      discountPercent,
      priceAdjustment,
      variant: variant?.variant_name
    });
  }
  
  // Giá của 1 sản phẩm (không nhân với quantity)
  const unitPrice = basePrice * (1 - discountPercent / 100) + priceAdjustment;
  // Tổng giá khi nhân với quantity (dùng cho thêm vào giỏ hàng)
  const finalPrice = unitPrice * quantity;
  const infoEntries = [
    product.brand ? { label: 'Thương hiệu', value: product.brand } : null,
    product.sku ? { label: 'Mã sản phẩm', value: product.sku } : null,
    typeof product.stock_quantity === 'number'
      ? { label: 'Tồn kho', value: product.stock_quantity > 0 ? `${product.stock_quantity} sản phẩm` : 'Hết hàng' }
      : null
  ].filter(Boolean);
  const reviewAverage = Number(product.avgRating || 0).toFixed(1);
  const reviewCountRaw = reviewPagination?.total ?? (product.reviewCount ?? reviews.length ?? 0);
  const reviewCount = Number(reviewCountRaw) || 0;
  const totalSold = typeof product.totalSold === 'number' ? product.totalSold : 0;
  const formattedReviewCount = reviewCount.toLocaleString('vi-VN');
  const formattedTotalSold = totalSold.toLocaleString('vi-VN');

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-6 text-sm text-gray-600" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <li key={`${crumb.label}-${idx}`} className="flex items-center gap-2">
                {crumb.to && !isLast ? (
                  <Link
                    to={crumb.to}
                    className="text-gray-500 transition hover:text-primary"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="font-semibold text-gray-900">{crumb.label}</span>
                )}
                {!isLast && <span className="text-gray-400">/</span>}
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div className="max-w-xl">
          <div className="mb-4 relative">
            <img
              src={images[currentImageIndex]?.image_url}
              alt={product.name}
              className="w-full rounded-lg object-contain max-h-[420px] md:max-h-[520px]"
            />
            {hasMultipleImages && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={goPrevImage}
                  className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/60"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={goNextImage}
                  className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/60"
                >
                  ›
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          {hasMultipleImages && (
            <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-6 gap-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectImage(idx)}
                  className={`border rounded overflow-hidden ${idx === currentImageIndex ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'}`}
                >
                  <img
                    src={img.image_url}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-16 md:h-20 object-cover hover:opacity-80"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-600">
            <div className="inline-flex items-center gap-1 font-semibold text-yellow-500">
              <span aria-hidden="true">⭐</span>
              <span>{reviewAverage}</span>
            </div>
            <span className="text-gray-300">•</span>
            <div className="font-medium">{formattedReviewCount} lượt đánh giá</div>
            <span className="text-gray-300">•</span>
            <div className="font-medium">{formattedTotalSold} lượt bán</div>
          </div>

          <div className="mb-6 space-y-2 rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-extrabold text-accent">
              {formatCurrencyVND(unitPrice)}
            </span>
            {product.discount_percent > 0 && (
                <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
                  -{product.discount_percent}%
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Giá gốc:{' '}
              <span className="font-semibold text-gray-700 line-through">
                  {formatCurrencyVND(product.base_price)}
                </span>
            </div>
          </div>

          {/* Color Selector */}
          {(() => {
            // Tìm nhóm cấu hình (nhóm thứ 2 sau màu sắc)
            const secondGroup = optionGroups.find(group => 
              group.index !== colorGroup?.index && group.options.length > 1
            );
            const configGroup = storageGroup || secondGroup;
            
            // Hiển thị màu sắc nếu:
            // 1. Có nhiều hơn 1 màu, HOẶC
            // 2. Có 1 màu nhưng có nhóm cấu hình (để người dùng biết màu đang chọn)
            const shouldShowColor = colorGroup && (
              colorGroup.options.length > 1 || 
              (colorGroup.options.length === 1 && configGroup)
            );
            
            return shouldShowColor ? (
              <div className="mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Màu sắc</p>
                    <p className="text-xs text-gray-500">Chọn màu bạn yêu thích</p>
                  </div>
                  {selectedParts[colorGroup.index] && (
                    <span className="text-xs text-primary font-medium">
                      Đang chọn: {parseOptionValue(selectedParts[colorGroup.index]).mainText}
                </span>
            )}
            </div>
                <div className="flex flex-wrap gap-3">
                  {colorGroup.options.map(option => {
                    const isSelected = selectedParts[colorGroup.index] === option.raw;
                    // Màu sắc luôn available (không disable)
                    const isAvailable = true;
                    const swatchColor = resolveColor(option.mainText);
                    return (
                      <button
                        key={`color-${option.raw}`}
                        type="button"
                        onClick={() => handleSelectOption(colorGroup.index, option.raw)}
                        className={[
                          'flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm transition',
                          isSelected ? 'border-primary bg-primary/5 text-primary shadow-sm' : 'border-gray-200 bg-white hover:border-primary/40',
                          'cursor-pointer'
                        ].join(' ')}
                      >
                        <span
                          className="h-9 w-9 rounded-full border border-white shadow ring-2 ring-gray-200"
                          style={{ backgroundColor: swatchColor }}
                        />
                        <span className="font-medium">{option.mainText}</span>
                      </button>
                    );
                  })}
          </div>
              </div>
            ) : null;
          })()}

          {/* Storage/Configuration Selector */}
          {(() => {
            // Tìm nhóm thứ 2 (sau màu sắc) để hiển thị như cấu hình
            const secondGroup = optionGroups.find(group => 
              group.index !== colorGroup?.index && group.options.length > 1
            );
            
            // Ưu tiên storageGroup nếu có, nếu không thì dùng secondGroup
            const configGroup = storageGroup || secondGroup;
            
            if (!configGroup || configGroup.options.length <= 1) return null;
            
            // Luôn hiển thị cấu hình, không phụ thuộc vào việc đã chọn màu hay chưa
            return (
              <div className="mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {configGroup.label === 'Cấu hình' || configGroup.label === 'Storage' || configGroup.label === 'Dung lượng' 
                        ? 'Cấu hình' 
                        : configGroup.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {colorGroup && selectedParts[colorGroup.index]
                        ? 'Lựa chọn cấu hình phù hợp nhu cầu'
                        : 'Chọn cấu hình (có thể chọn trước hoặc sau khi chọn màu)'}
                    </p>
                    </div>
                  {selectedParts[configGroup.index] && (
                    <span className="text-xs text-primary font-medium">
                      Đang chọn: {parseOptionValue(selectedParts[configGroup.index]).mainText}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {configGroup.options.map(option => {
                    const isSelected = selectedParts[configGroup.index] === option.raw;
                    // Kiểm tra xem cấu hình này có khả dụng cho màu đã chọn (nếu có)
                    const isAvailable = isConfigAvailableForColor(option.raw);
                    return (
                      <button
                        key={`storage-${option.raw}`}
                        type="button"
                        onClick={() => isAvailable && handleSelectOption(configGroup.index, option.raw)}
                        disabled={!isAvailable}
                        className={[
                          'rounded-xl border px-4 py-2 text-sm font-semibold transition',
                          isSelected ? 'border-primary bg-primary text-white shadow-md' : 'border-gray-200 bg-white hover:border-primary/60',
                          isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                        ].join(' ')}
                      >
                        <div>{option.mainText}</div>
                        {option.subText && <div className="text-xs font-normal">{option.subText}</div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Additional Groups */}
          {additionalGroups.length > 0 && (
            <div className="mb-4 space-y-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
              {additionalGroups.map(group => (
                <div key={`${group.label}-${group.index}`} className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{group.label}</p>
                    <div className="flex flex-wrap gap-2">
                    {group.options.map(option => {
                      const isSelected = selectedParts[group.index] === option.raw;
                      const isAvailable = isOptionValueAvailable(group.index, option.raw, selectedParts);
                        return (
                          <button
                          key={`extra-${option.raw}`}
                            type="button"
                          onClick={() => isAvailable && handleSelectOption(group.index, option.raw)}
                            className={[
                            'rounded-lg border px-3 py-2 text-sm transition',
                            isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 bg-white hover:border-primary/40',
                            isAvailable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                            ].join(' ')}
                          >
                          {option.mainText}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Quantity */}
          <div className="mb-4 space-y-1">
            <label className="block font-semibold">Số lượng:</label>
            <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value) || 1;
                  const maxQty = variant 
                    ? variant.stock_quantity 
                    : (typeof product.stock_quantity === 'number' ? product.stock_quantity : 999);
                  setQuantity(Math.max(1, Math.min(newValue, maxQty)));
                }}
                className="w-20 px-4 py-2 border rounded-lg text-center"
                min="1"
                max={variant 
                  ? variant.stock_quantity 
                  : (typeof product.stock_quantity === 'number' ? product.stock_quantity : undefined)}
              />
              <button
                onClick={() => {
                  const maxQty = variant 
                    ? variant.stock_quantity 
                    : (typeof product.stock_quantity === 'number' ? product.stock_quantity : 999);
                  setQuantity(Math.min(quantity + 1, maxQty));
                }}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={(() => {
                  const maxQty = variant 
                    ? variant.stock_quantity 
                    : (typeof product.stock_quantity === 'number' ? product.stock_quantity : 999);
                  return quantity >= maxQty;
                })()}
              >
                +
              </button>
              </div>
              <span className="text-sm text-gray-500">
                {variant
                  ? variant.stock_quantity > 0
                    ? `${variant.stock_quantity} sản phẩm còn lại`
                    : 'Biến thể này tạm hết hàng'
                  : typeof product.stock_quantity === 'number'
                    ? product.stock_quantity > 0
                      ? `${product.stock_quantity} sản phẩm còn lại`
                      : 'Sản phẩm tạm hết hàng'
                    : 'Tình trạng: đang cập nhật'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mb-4 space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row">
            {(user?.role === 'manager' || user?.role === 'admin' || user?.role === 'employee') ? (
              <>
                <button
                  disabled
                  className="flex-1 rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-400 cursor-not-allowed"
                >
                  Không thể thêm vào giỏ
                </button>
                <button
                  disabled
                  className="flex-1 rounded-xl bg-gray-300 px-6 py-3 font-semibold text-gray-500 cursor-not-allowed"
                >
                  Không thể mua hàng
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 rounded-xl border border-primary/30 px-6 py-3 font-semibold text-primary shadow-sm transition hover:border-primary hover:bg-primary/5"
                >
                  Thêm vào giỏ
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-md transition hover:bg-orange-600"
                >
                  Mua ngay
                </button>
              </>
            )}
            </div>
            <div className="grid gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <ShieldIcon />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Bảo hành chính hãng</p>
                  <p className="text-xs text-gray-500">12 tháng toàn quốc</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshIcon />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Đổi trả linh hoạt</p>
                  <p className="text-xs text-gray-500">Trong 30 ngày</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TruckIcon />
                <div>
                  <p className="text-sm font-semibold text-gray-800">Miễn phí vận chuyển</p>
                  <p className="text-xs text-gray-500">Nội thành & ngoại tỉnh</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <section className="mt-12">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-8">
          <header className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">Thông tin sản phẩm</h2>
            <p className="text-gray-500 text-sm">
              Tìm hiểu chi tiết về sản phẩm, chính sách bảo hành và các thông tin liên quan.
            </p>
          </header>
          {infoEntries.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {infoEntries.map((item) => (
                <div key={item.label} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {item.label}
                  </div>
                  <div className="mt-1 text-sm text-gray-700">{item.value}</div>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Mô tả sản phẩm</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description || 'Thông tin mô tả đang được cập nhật.'}
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Chính sách bảo hành</h3>
              {product.warranty_period ? (
                <p className="text-gray-600 leading-relaxed">
                  {product.warranty_description || `Bảo hành ${product.warranty_period} tháng.`}
                </p>
              ) : (
                <p className="text-gray-500">Thông tin bảo hành sẽ được cập nhật sau.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Đánh giá sản phẩm</h2>
              <p className="text-gray-500 text-sm">Cảm nhận từ khách hàng đã sử dụng sản phẩm.</p>
            </div>
            {reviewCount > 0 && (
              <div className="flex items-center gap-4 rounded-2xl border border-yellow-100 bg-yellow-50 px-5 py-4">
                <div className="text-4xl font-bold text-yellow-500 leading-none">{reviewAverage}</div>
                <div className="text-sm text-gray-700">
                  <div className="font-semibold text-gray-900">{reviewAverage} / 5</div>
                  <div>{reviewCount} lượt đánh giá</div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Viết đánh giá của bạn</h3>
                <p className="text-sm text-gray-500">Chia sẻ trải nghiệm sau khi hoàn tất đơn hàng.</p>
              </div>
            </div>
            {!isAuthenticated ? (
              <div className="flex flex-col gap-3 rounded-xl border border-dashed border-gray-200 bg-white/70 px-4 py-3 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
                <span>Bạn cần đăng nhập để có thể viết đánh giá.</span>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-white hover:bg-blue-700"
                >
                  Đăng nhập ngay
                </button>
              </div>
            ) : ordersLoading ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white/80 px-4 py-3 text-sm text-gray-500">
                Đang kiểm tra đơn hàng đã giao của bạn...
              </div>
            ) : !canReview ? (
              <div className="rounded-xl border border-dashed border-yellow-200 bg-yellow-50/80 px-4 py-3 text-sm text-yellow-700">
                Chỉ tài khoản khách hàng mới có thể gửi đánh giá sản phẩm.
              </div>
            ) : eligibleOrders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-red-100 bg-red-50/70 px-4 py-3 text-sm text-red-600">
                Bạn chỉ có thể đánh giá sau khi đã nhận được hàng. Vui lòng xác nhận "Đã nhận được hàng" trong đơn hàng của bạn trước khi đánh giá.
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Chất lượng sản phẩm *
                  </label>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }).map((_, idx) => {
                      const value = idx + 1;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleSelectRating(value)}
                          className={`text-2xl ${value <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          aria-label={`${value} sao`}
                        >
                          ★
                        </button>
                      );
                    })}
                    {reviewForm.rating > 0 && (
                      <span className="text-sm text-gray-600">{reviewForm.rating} / 5</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Nhận xét (không bắt buộc)
                  </label>
                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => handleReviewInputChange('comment', e.target.value)}
                    rows={4}
                    placeholder="Chia sẻ trải nghiệm sử dụng sản phẩm..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={submittingReview || !reviewForm.rating || !reviewForm.order_id || eligibleOrders.length === 0}
                    className="inline-flex items-center rounded-lg bg-primary px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {reviewError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
              {reviewError}
            </div>
          )}

          {reviewLoading && reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
              Đang tải đánh giá...
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
              Chưa có đánh giá nào cho sản phẩm này.
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-5 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {(review.user?.full_name || review.user?.username || 'KH').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {review.user?.full_name || review.user?.username || 'Khách hàng'}
                        </div>
                        {review.createdAt && (
                          <div className="text-xs text-gray-500">
                            {formatReviewDate(review.createdAt)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {review.status && review.status !== 'approved' && (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          Đang chờ duyệt
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-yellow-500">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <span key={idx} className={idx < review.rating ? 'text-yellow-500' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-sm text-gray-700">{review.rating}/5</span>
                      </div>
                    </div>
                  </div>
                  {review.comment ? (
                    <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">{review.comment}</p>
                  ) : (
                    <p className="mt-3 text-sm text-gray-400 italic">Người dùng không để lại nhận xét.</p>
                  )}
                </article>
              ))}
            </div>
          )}

          {reviewPagination && reviewPagination.page < reviewPagination.totalPages && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleLoadMoreReviews}
                disabled={reviewLoading}
                className="inline-flex items-center rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reviewLoading ? 'Đang tải...' : 'Xem thêm đánh giá'}
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mt-12 mb-4">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Các sản phẩm bạn có thể thích</h2>
              <p className="text-gray-500 text-sm">Khám phá thêm những lựa chọn tương tự dành cho bạn.</p>
            </div>
          </div>
          {relatedLoading ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
              Đang tải gợi ý...
            </div>
          ) : relatedProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
              Hiện chưa có gợi ý sản phẩm phù hợp.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 justify-items-center">
              {relatedProducts.map(item => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

