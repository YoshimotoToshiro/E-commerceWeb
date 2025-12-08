import { useEffect, useState } from 'react';
import { productAPI } from '../../api/product';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import BackButton from '../../components/common/BackButton';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    supplier_id: '',
    brand: '',
    description: '',
    base_price: '',
    discount_percent: 0,
    warranty_period: '',
    warranty_description: '',
    status: 'active',
    is_featured: false,
    images: [{ url: '', is_primary: true, display_order: 0 }],
    variants: [{ variant_name: '', sku: '', stock_quantity: 0, price_adjustment: 0 }]
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [pagination.page, searchTerm, statusFilter]);

  const loadData = async () => {
    try {
      const [categoriesRes, suppliersRes] = await Promise.all([
        productAPI.getCategories(),
        productAPI.getSuppliers()
      ]);
      
      if (categoriesRes.data.success) {
        // Flatten categories để dễ chọn
        const flattenCategories = (cats) => {
          let result = [];
          cats.forEach(cat => {
            result.push({ id: cat.id, name: cat.name });
            if (cat.children && cat.children.length > 0) {
              result.push(...flattenCategories(cat.children));
            }
          });
          return result;
        };
        setCategories(flattenCategories(categoriesRes.data.data.categories));
      }
      if (suppliersRes.data.success) {
        setSuppliers(suppliersRes.data.data.suppliers);
      }
    } catch (error) {
      toast.error('Không thể tải dữ liệu');
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      };
      const res = await productAPI.getProducts(params);
      if (res.data.success) {
        setProducts(res.data.data.products);
        setPagination({
          ...pagination,
          totalPages: res.data.data.pagination.totalPages,
          total: res.data.data.pagination.total
        });
      }
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Xử lý images: filter và sắp xếp lại để ảnh chính ở đầu
      const validImages = formData.images.filter(img => img.url.trim() !== '');
      const primaryImageIndex = validImages.findIndex(img => img.is_primary);
      const sortedImages = primaryImageIndex >= 0
        ? [
            validImages[primaryImageIndex],
            ...validImages.filter((_, i) => i !== primaryImageIndex)
          ].map((img, index) => ({
            ...img,
            is_primary: index === 0,
            display_order: index
          }))
        : validImages.map((img, index) => ({
            ...img,
            is_primary: index === 0,
            display_order: index
          }));

      // Validate: Mỗi sản phẩm phải có ít nhất 1 biến thể với màu sắc và cấu hình
      const basePrice = parseFloat(formData.base_price) || 0;
      const validVariants = formData.variants
        .filter(v => v.color.trim() !== '' && v.config.trim() !== '')
        .map(v => {
          // Tính price_adjustment từ price: nếu price có giá trị thì price_adjustment = price - base_price
          const variantPrice = v.price ? parseFloat(v.price) : null;
          const priceAdjustment = variantPrice !== null ? variantPrice - basePrice : 0;
          
          return {
            variant_name: `${v.color.trim()} - ${v.config.trim()}`,
            sku: null, // Không còn SKU, set null để tránh lỗi duplicate
            stock_quantity: v.stock_quantity,
            price_adjustment: priceAdjustment
          };
        });
      
      if (validVariants.length === 0) {
        toast.error('Mỗi sản phẩm phải có ít nhất 1 phân loại với màu sắc và cấu hình');
        return;
      }

      const submitData = {
        ...formData,
        base_price: parseFloat(formData.base_price),
        discount_percent: parseFloat(formData.discount_percent) || 0,
        category_id: parseInt(formData.category_id),
        supplier_id: parseInt(formData.supplier_id),
        warranty_period: formData.warranty_period ? parseInt(formData.warranty_period) : null,
        images: sortedImages,
        variants: validVariants
      };

      if (editingProduct) {
        await productAPI.updateProduct(editingProduct.id, submitData);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await productAPI.createProduct(submitData);
        toast.success('Tạo sản phẩm thành công');
      }
      
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = async (productId) => {
    try {
      const res = await productAPI.getProductById(productId);
      if (res.data.success) {
        const product = res.data.data;
        setEditingProduct(product);
        setFormData({
          name: product.name || '',
          category_id: product.category_id || '',
          supplier_id: product.supplier_id || '',
          brand: product.brand || '',
          description: product.description || '',
          base_price: product.base_price || '',
          discount_percent: product.discount_percent || 0,
          warranty_period: product.warranty_period || '',
          warranty_description: product.warranty_description || '',
          status: product.status || 'active',
          is_featured: product.is_featured || false,
          images: product.images && product.images.length > 0
            ? product.images.map(img => ({
                url: img.image_url,
                is_primary: img.is_primary,
                display_order: img.display_order
              }))
            : [{ url: '', is_primary: true, display_order: 0 }],
          variants: product.variants && product.variants.length > 0
            ? product.variants.map(v => {
                // Parse variant_name thành color và config
                const parts = v.variant_name.split('-').map(s => s.trim()).filter(Boolean);
                // Tính price từ price_adjustment: nếu có price_adjustment thì price = base_price + price_adjustment
                const basePrice = parseFloat(product.base_price) || 0;
                const priceAdjustment = parseFloat(v.price_adjustment) || 0;
                const variantPrice = priceAdjustment !== 0 ? basePrice + priceAdjustment : '';
                return {
                  color: parts[0] || '',
                  config: parts[1] || '',
                stock_quantity: v.stock_quantity,
                  price: variantPrice,
                  discount_percent: 0 // Không có discount_percent riêng cho variant trong database
                };
              })
            : [{ color: '', config: '', stock_quantity: 0, price: '', discount_percent: 0 }]
        });
        setShowForm(true);
      }
    } catch (error) {
      toast.error('Không thể tải thông tin sản phẩm');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }

    // Set loading state
    setDeletingIds(prev => new Set(prev).add(id));

    try {
      const response = await productAPI.deleteProduct(id);
      
      // Kiểm tra response có tồn tại không
      if (!response || !response.data) {
        throw new Error('Không nhận được phản hồi từ server');
      }

      if (response.data.success) {
      toast.success('Xóa sản phẩm thành công');
        // Reset về trang 1 và reload danh sách
        setPagination(prev => ({ ...prev, page: 1 }));
        await loadProducts();
      } else {
        toast.error(response.data.message || 'Có lỗi xảy ra khi xóa sản phẩm');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Có lỗi xảy ra khi xóa sản phẩm';
      
      if (error.response) {
        // Server trả về response nhưng có lỗi
        errorMessage = error.response.data?.message || 
                      error.response.statusText || 
                      `Lỗi ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        // Request được gửi nhưng không nhận được response
        errorMessage = 'Không thể kết nối đến server. Vui lòng thử lại sau.';
      } else {
        // Lỗi khác
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      // Remove loading state
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      // Lấy đầy đủ thông tin sản phẩm bao gồm images và variants
      const res = await productAPI.getProductById(product.id);
      if (!res.data.success) {
        toast.error('Không thể tải thông tin sản phẩm');
        return;
      }
      
      const fullProduct = res.data.data;
      const newFeaturedStatus = !product.is_featured;
      
      // Chuẩn bị images
      const images = fullProduct.images && fullProduct.images.length > 0
        ? fullProduct.images.map(img => ({
            url: img.image_url,
            is_primary: img.is_primary,
            display_order: img.display_order
          }))
        : [];
      
      // Chuẩn bị variants - bắt buộc phải có ít nhất 1 variant
      const basePrice = parseFloat(fullProduct.base_price) || 0;
      const variants = fullProduct.variants && fullProduct.variants.length > 0
        ? fullProduct.variants.map(v => {
            const priceAdjustment = parseFloat(v.price_adjustment) || 0;
            return {
              variant_name: v.variant_name,
              sku: null,
              stock_quantity: v.stock_quantity,
              price_adjustment: priceAdjustment
            };
          })
        : [];
      
      // Kiểm tra nếu không có variants thì không thể update
      if (variants.length === 0) {
        toast.error('Sản phẩm phải có ít nhất 1 phân loại để thực hiện thao tác này');
        return;
      }
      
      // Gửi đầy đủ dữ liệu để update
      const updateResponse = await productAPI.updateProduct(product.id, {
        name: fullProduct.name,
        category_id: fullProduct.category_id,
        supplier_id: fullProduct.supplier_id,
        brand: fullProduct.brand || '',
        description: fullProduct.description || '',
        base_price: fullProduct.base_price,
        discount_percent: fullProduct.discount_percent || 0,
        warranty_period: fullProduct.warranty_period || null,
        warranty_description: fullProduct.warranty_description || '',
        status: fullProduct.status,
        is_featured: newFeaturedStatus,
        images: images,
        variants: variants
      });
      
      if (updateResponse.data.success) {
      toast.success(newFeaturedStatus ? 'Đã đánh dấu sản phẩm nổi bật' : 'Đã bỏ đánh dấu sản phẩm nổi bật');
      loadProducts();
      } else {
        toast.error(updateResponse.data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Toggle featured error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi cập nhật sản phẩm';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category_id: '',
      supplier_id: '',
      brand: '',
      description: '',
      base_price: '',
      discount_percent: 0,
      warranty_period: '',
      warranty_description: '',
      status: 'active',
      is_featured: false,
      images: [{ url: '', is_primary: true, display_order: 0 }],
      variants: [{ color: '', config: '', stock_quantity: 0, price: '', discount_percent: 0 }]
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    resetForm();
  };

  const addImage = () => {
    setFormData({
      ...formData,
      images: [...formData.images, { url: '', is_primary: false, display_order: formData.images.length }]
    });
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    if (newImages.length > 0 && !newImages.some(img => img.is_primary)) {
      newImages[0].is_primary = true;
    }
    setFormData({ ...formData, images: newImages });
  };

  const setPrimaryImage = (index) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      is_primary: i === index
    }));
    setFormData({ ...formData, images: newImages });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { color: '', config: '', stock_quantity: 0, price: '', discount_percent: 0 }]
    });
  };

  const removeVariant = (index) => {
    if (formData.variants.length <= 1) {
      toast.error('Mỗi sản phẩm phải có ít nhất 1 phân loại');
      return;
    }
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading && products.length === 0) return <Loading />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý sản phẩm</h1>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
          >
            + Thêm sản phẩm
          </button>
        )}
      </div>
      <BackButton className="mb-4" />

      {!showForm && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Còn hàng</option>
              <option value="out_of_stock">Hết hàng</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
            >
              Tìm kiếm
            </button>
          </form>
        </div>
      )}

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={handleCancel} />
          <div className="relative bg-white rounded-lg shadow max-h-[90vh] w-full max-w-4xl overflow-auto p-6">
            <button
              type="button"
              onClick={handleCancel}
              className="absolute top-3 right-3 rounded-full w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100"
              aria-label="Đóng"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4">
              {editingProduct ? 'Chỉnh sửa Sản phẩm' : 'Thêm Sản phẩm Mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Danh mục *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nhà cung cấp *</label>
                  <select
                    required
                    value={formData.supplier_id}
                    onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Chọn nhà cung cấp</option>
                    {suppliers.map(sup => (
                      <option key={sup.id} value={sup.id}>{sup.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Thương hiệu</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Giá gốc (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Giảm giá (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Thời gian bảo hành (tháng)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.warranty_period}
                    onChange={(e) => setFormData({ ...formData, warranty_period: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="active">Còn hàng</option>
                    <option value="out_of_stock">Hết hàng</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="is_featured" className="ml-2 text-sm font-medium">
                    Sản phẩm nổi bật
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Mô tả bảo hành</label>
                <textarea
                  value={formData.warranty_description}
                  onChange={(e) => setFormData({ ...formData, warranty_description: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Images */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Hình ảnh sản phẩm</label>
                  <button
                    type="button"
                    onClick={addImage}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                  >
                    + Thêm ảnh
                  </button>
                </div>
                {formData.images.map((img, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="URL hình ảnh"
                      value={img.url}
                      onChange={(e) => {
                        const newImages = [...formData.images];
                        newImages[index].url = e.target.value;
                        setFormData({ ...formData, images: newImages });
                      }}
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(index)}
                      className={`px-3 py-2 rounded text-sm ${
                        img.is_primary
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {img.is_primary ? 'Ảnh chính' : 'Đặt làm ảnh chính'}
                    </button>
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Variants */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Phân loại sản phẩm *</label>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
                  >
                    + Thêm biến thể
                  </button>
                </div>
                {formData.variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Màu sắc (VD: Đen)"
                      value={variant.color}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[index].color = e.target.value;
                        setFormData({ ...formData, variants: newVariants });
                      }}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Cấu hình (VD: 16GB/512GB)"
                      value={variant.config}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[index].config = e.target.value;
                        setFormData({ ...formData, variants: newVariants });
                      }}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Số lượng"
                      min="0"
                      value={variant.stock_quantity}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[index].stock_quantity = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, variants: newVariants });
                      }}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      placeholder="Giá (để trống = giá gốc)"
                      min="0"
                      step="1000"
                      value={variant.price}
                      onChange={(e) => {
                        const newVariants = [...formData.variants];
                        newVariants[index].price = e.target.value;
                        setFormData({ ...formData, variants: newVariants });
                      }}
                      className="px-3 py-2 border rounded-lg"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Phần trăm giảm giá"
                        min="0"
                        max="100"
                        value={variant.discount_percent}
                        onChange={(e) => {
                          const newVariants = [...formData.variants];
                          newVariants[index].discount_percent = parseFloat(e.target.value) || 0;
                          setFormData({ ...formData, variants: newVariants });
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
                >
                  {editingProduct ? 'Cập nhật' : 'Tạo mới'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">Hình ảnh</th>
              <th className="px-4 py-3 text-left">Tên sản phẩm</th>
              <th className="px-4 py-3 text-left">Danh mục</th>
              <th className="px-4 py-3 text-left">Giá</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">Nổi bật</th>
              <th className="px-4 py-3 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                  Chưa có sản phẩm nào
                </td>
              </tr>
            ) : (
              products.map(product => {
                const primaryImage = product.images?.[0]?.image_url;
                const finalPrice = product.finalPrice || (product.base_price * (1 - (product.discount_percent || 0) / 100));
                return (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/64';
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{product.name}</div>
                      {product.brand && (
                        <div className="text-sm text-gray-500">{product.brand}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {product.category?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">
                        {new Intl.NumberFormat('vi-VN').format(finalPrice)} đ
                      </div>
                      {product.discount_percent > 0 && (
                        <div className="text-sm text-gray-500 line-through">
                          {new Intl.NumberFormat('vi-VN').format(product.base_price)} đ
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status === 'active' ? 'Còn hàng' : 'Hết hàng'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {product.is_featured ? (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
                          ⭐ Nổi bật
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(product.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleToggleFeatured(product)}
                          className={`px-3 py-1 rounded text-sm ${
                            product.is_featured
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                              : 'bg-gray-500 text-white hover:bg-gray-600'
                          }`}
                        >
                          {product.is_featured ? 'Bỏ nổi bật' : 'Nổi bật'}
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingIds.has(product.id)}
                          className={`px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm ${
                            deletingIds.has(product.id) ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {deletingIds.has(product.id) ? 'Đang xóa...' : 'Xóa'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Trang {pagination.page} / {pagination.totalPages} ({pagination.total} sản phẩm)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
