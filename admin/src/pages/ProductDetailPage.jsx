import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router";
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import { fetchProducts } from "../store/productsSlice";

const ProductDetailPage = () => {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((state) => state.products);
  const { activeWorkspaceId } = useSelector((state) => state.workspace);

  const selectedProduct = useMemo(
    () => location.state?.product || products.find((item) => item.id === productId),
    [location.state, productId, products]
  );

  const currentIndex = useMemo(
    () => products.findIndex((item) => item.id === selectedProduct?.id),
    [products, selectedProduct]
  );

  const currentProduct = useMemo(
    () =>
      selectedProduct || {
        id: "fallback-1",
        name: "Sweatshirt & Jogger",
        brand: "Miniput",
        price: 599,
        imageUrl: "https://via.placeholder.com/640x860/F3E8A6/0E2A4A?text=Miniput+Product",
        stock: 85,
        sizes: ["26", "28", "30", "32", "34"],
      },
    [selectedProduct]
  );

  const [quantity, setQuantity] = useState(1);
  const [selectedSizes, setSelectedSizes] = useState([
    currentProduct.size?.[0] || currentProduct.sizes?.[0] || "26",
  ]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const productImages = useMemo(() => {
    if (Array.isArray(currentProduct.imageUrls) && currentProduct.imageUrls.length) {
      return currentProduct.imageUrls;
    }
    return [currentProduct.imageUrl];
  }, [currentProduct.imageUrls, currentProduct.imageUrl]);

  const goToIndex = (index) => {
    if (index < 0 || index >= products.length) return;
    const nextProduct = products[index];
    navigate(`/product/${nextProduct.id}`, { state: { product: nextProduct } });
  };

  useEffect(() => {
    if (!products.length) {
      dispatch(
        fetchProducts({
          includeHidden: false,
          workspaceId: selectedProduct?.workspaceId || activeWorkspaceId
        })
      );
    }
  }, [dispatch, products.length, selectedProduct?.workspaceId, activeWorkspaceId]);

  useEffect(() => {
    if (!loading && !selectedProduct) {
      navigate("/home", { replace: true });
    }
  }, [loading, selectedProduct, navigate]);

  useEffect(() => {
    setQuantity(1);
    setSelectedSizes([currentProduct.size?.[0] || currentProduct.sizes?.[0] || "26"]);
    setCurrentImageIndex(0);
  }, [currentProduct.id, currentProduct.sizes, currentProduct.size]);

  const onPrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  const onNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const handleQtyChange = (delta) => {
    setQuantity((prev) => Math.max(1, Math.min(currentProduct.stock || 999, prev + delta)));
  };

  const handleQuantityInput = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value === "") {
      setQuantity(1);
      return;
    }
    const numValue = parseInt(value, 10);
    setQuantity(Math.max(1, Math.min(currentProduct.stock || 999, numValue)));
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) => {
      if (prev.includes(size)) {
        return prev.length === 1 ? prev : prev.filter((item) => item !== size);
      }
      return [...prev, size];
    });
  };

  const getStockStatus = (stock) => {
    if (stock > 50) return { label: "IN STOCK", color: "text-[#2d7d46] bg-[#e6f4ea] border-[#2d7d46]/20" };
    if (stock > 20) return { label: "LIMITED STOCK", color: "text-[#d49000] bg-[#fff8e1] border-[#d49000]/20" };
    return { label: "LOW STOCK", color: "text-[#D63031] bg-[#fde8e8] border-[#D63031]/20" };
  };

  const stockInfo = getStockStatus(currentProduct.stock || 0);
  const availableSizes = currentProduct.size || currentProduct.sizes || [];

  if (!selectedProduct) return null;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#f5f5f5] font-['Nunito',sans-serif] md:p-6 lg:p-8 flex items-center justify-center">
      <div className="flex flex-col md:flex-row w-full max-w-[1000px] h-full max-h-[600px] bg-white md:rounded-2xl md:shadow-md md:border md:border-gray-200 overflow-hidden">
        <div className="relative h-[45%] md:h-full w-full md:w-1/2 shrink-0 bg-[#f0f0f0] group">
          <button
            onClick={() => navigate("/home")}
            className="absolute top-4 left-4 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors z-20 text-[#0E2A4A]"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <img
            src={productImages[currentImageIndex]}
            alt={currentProduct.name}
            onClick={() => setShowPreview(true)}
            className="w-full h-full object-cover cursor-zoom-in"
          />

          {productImages.length > 1 && (
            <>
              <button
                onClick={onPrevImage}
                className="absolute top-1/2 -translate-y-1/2 left-4 w-9 h-9 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors md:opacity-0 group-hover:opacity-100 text-[#0E2A4A]"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={onNextImage}
                className="absolute top-1/2 -translate-y-1/2 right-4 w-9 h-9 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors md:opacity-0 group-hover:opacity-100 text-[#0E2A4A]"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center bg-white rounded-t-3xl -mt-6 md:mt-0 p-6 lg:p-10 relative z-10 w-full md:w-1/2 mk-scroll-hidden overflow-y-auto">
          <div className="max-w-md mx-auto w-full flex flex-col h-full">
            <div className="flex justify-end items-center gap-3 mb-4 pb-2 border-b border-gray-100">
              <button
                onClick={() => goToIndex(currentIndex - 1)}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#888] hover:text-[#0E2A4A] transition-colors"
              >
                <ChevronLeft size={14} strokeWidth={3} /> Prev
              </button>
              <div className="w-px h-3 bg-gray-300"></div>
              <button
                onClick={() => goToIndex(currentIndex + 1)}
                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#888] hover:text-[#0E2A4A] transition-colors"
              >
                Next <ChevronRight size={14} strokeWidth={3} />
              </button>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-[#1a1a1a] mb-2 uppercase tracking-wide leading-tight mt-2">
              {currentProduct.name}
            </h1>
            <p className="text-sm text-[#666] mb-6 leading-relaxed">
              {currentProduct.description || "Premium quality material designed for maximum comfort and durability."}
            </p>

            <div className="text-[11px] font-bold text-[#888] mb-3 uppercase tracking-widest">Available Sizes</div>
            <div className="flex gap-2 mb-8 flex-wrap">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black select-none shadow-sm transition-colors ${
                    selectedSizes.includes(size) ? "bg-[#0E2A4A] text-white" : "bg-gray-100 text-[#1a1a1a]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="flex items-end justify-between mb-4 border-t border-[#f0f0f0] pt-6 mt-auto">
              <div>
                <div className="text-[11px] font-bold text-[#888] mb-3 uppercase tracking-widest">Quantity</div>
                <div className="flex items-center gap-3 bg-gray-50 rounded-full p-1 shadow-inner border border-gray-100">
                  <button
                    onClick={() => handleQtyChange(-1)}
                    className="w-9 h-9 bg-white hover:bg-gray-100 text-[#0E2A4A] rounded-full flex items-center justify-center transition-colors shadow-sm border border-gray-200"
                  >
                    <Minus size={16} strokeWidth={2.5} />
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    onChange={handleQuantityInput}
                    className="w-10 text-center text-lg font-black bg-transparent border-none focus:outline-none text-[#1a1a1a]"
                  />
                  <button
                    onClick={() => handleQtyChange(1)}
                    className="w-9 h-9 bg-white hover:bg-gray-100 text-[#0E2A4A] rounded-full flex items-center justify-center transition-colors shadow-sm border border-gray-200"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {currentProduct.isDiscountActive ? (
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <span className="text-sm line-through text-gray-400 font-bold">
                      Rs.{currentProduct.originalPrice ?? currentProduct.price}
                    </span>
                    <span className="text-[10px] bg-red-50 text-[#D63031] px-2 py-0.5 rounded font-black uppercase tracking-wider border border-red-100">
                      {currentProduct.discountLabel}
                    </span>
                  </div>
                  <div className="text-3xl lg:text-4xl font-black text-[#D63031]">Rs.{currentProduct.finalPrice}</div>
                </div>
              ) : (
                <div className="text-3xl lg:text-4xl font-black text-[#1a1a1a]">Rs.{currentProduct.price}</div>
              )}
            </div>

            <div className={`mt-6 inline-flex items-center px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${stockInfo.color}`}>
              {stockInfo.label} &bull; {currentProduct.stock || 0} ITEMS
            </div>
          </div>
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center backdrop-blur-sm">
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-50"
          >
            <X size={20} />
          </button>

          {productImages.length > 1 && (
            <button
              onClick={onPrevImage}
              className="absolute left-4 md:left-10 text-white hover:bg-white/20 bg-white/10 p-3 md:p-4 rounded-full transition-colors z-50"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <img
            src={productImages[currentImageIndex]}
            alt={currentProduct.name}
            className="w-auto h-auto max-w-[90%] max-h-[90vh] object-contain"
          />

          {productImages.length > 1 && (
            <button
              onClick={onNextImage}
              className="absolute right-4 md:right-10 text-white hover:bg-white/20 bg-white/10 p-3 md:p-4 rounded-full transition-colors z-50"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
