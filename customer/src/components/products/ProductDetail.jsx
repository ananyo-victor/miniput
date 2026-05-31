import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Copy, Minus, Plus, Share2, Heart } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavorite } from "../../store/favoriteSlice";

const ProductDetail = ({ product, onBack, onPrev, onNext, onAddToCart, onOrderNow }) => {
  const currentProduct = useMemo(
    () =>
      product || {
        id: "fallback-1",
        name: "Sweatshirt & Jogger",
        brand: "Miniput",
        price: 599,
        imageUrl: "https://via.placeholder.com/640x860/F3E8A6/0E2A4A?text=Miniput+Product",
        stock: 85,
        sizes: ["26", "28", "30", "32", "34"]
      },
    [product]
  );
  
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites.items);
  const isFavorite = favorites.some((item) => item.id === currentProduct.id);

  console.log("Rendering ProductDetail for product:", currentProduct)
  const [quantity, setQuantity] = useState(1);
  const availableSizes = useMemo(
    () => currentProduct.size || currentProduct.sizes || [],
    [currentProduct.size, currentProduct.sizes]
  );
  const [selectedSizes, setSelectedSizes] = useState([availableSizes[0] || "26"]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  const productImages = useMemo(() => {
    if (Array.isArray(currentProduct.imageUrls) && currentProduct.imageUrls.length) {
      return currentProduct.imageUrls;
    }
    return [currentProduct.imageUrl];
  }, [currentProduct.imageUrls, currentProduct.imageUrl]);

  useEffect(() => {
    setQuantity(1);
    setSelectedSizes([availableSizes[0] || "26"]);
    setCurrentImageIndex(0);
    setShareStatus("");
  }, [availableSizes, currentProduct.id]);

  useEffect(() => {
    if (!shareStatus) return undefined;
    const timer = window.setTimeout(() => setShareStatus(""), 2400);
    return () => window.clearTimeout(timer);
  }, [shareStatus]);

  const productShareUrl = useMemo(() => {
    const path = `/product/${encodeURIComponent(currentProduct.id)}`;
    if (typeof window === "undefined") return path;
    return new URL(path, window.location.origin).toString();
  }, [currentProduct.id]);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    dispatch(toggleFavorite(currentProduct));
  };

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

  const copyShareLink = async () => {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(productShareUrl);
      return;
    }

    const textArea = document.createElement("textarea");
    textArea.value = productShareUrl;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  };

  const handleShareProduct = async () => {
    const shareData = {
      title: currentProduct.name,
      text: `Check out ${currentProduct.name} on Miniput.`,
      url: productShareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus("Shared");
        return;
      }

      await copyShareLink();
      setShareStatus("Link copied");
    } catch (error) {
      if (error?.name === "AbortError") return;

      try {
        await copyShareLink();
        setShareStatus("Link copied");
      } catch {
        setShareStatus("Copy failed");
      }
    }
  };

  const unitPrice = Number(currentProduct.isDiscountActive ? currentProduct.finalPrice : currentProduct.price) || 0;
  const unitOriginalPrice = Number(currentProduct.originalPrice ?? currentProduct.price) || 0;

  const totalAmount = unitPrice * quantity;
  const totalOriginalAmount = unitOriginalPrice * quantity;

  return (
    <div className="w-full flex justify-center items-start lg:items-center p-4 md:p-6 lg:p-8 min-h-[calc(100vh-140px)] font-['Nunito',sans-serif]">
      <div className="flex flex-col md:flex-row w-full max-w-[1250px] bg-white rounded-2xl md:rounded-[24px] shadow-sm overflow-hidden border border-gray-100 lg:h-[calc(100vh-140px)] lg:max-h-[800px]">

        {/* Image Section */}
        <div className="relative h-[400px] md:h-full bg-[#e8e8e8] shrink-0 overflow-hidden md:w-1/2 flex items-center justify-center">
          <button
            onClick={onBack}
            className="absolute top-4 left-4 md:top-5 md:left-5 w-9 h-9 bg-white/70 hover:bg-white rounded-full flex items-center justify-center text-lg cursor-pointer z-20 shadow-sm border-none transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="absolute inset-0 bg-center bg-cover blur-lg scale-110 z-0" style={{ backgroundImage: `url(${productImages[currentImageIndex]})` }} />
          <div className="absolute inset-0 bg-black/10 z-0" />

          <img
            src={productImages[currentImageIndex]}
            alt={currentProduct.name}
            onClick={() => setShowPreview(true)}
            className="relative z-10 w-full h-full object-contain cursor-zoom-in"
          />

          {/* Previous Button */}
          {productImages.length > 1 && (
            <button
              onClick={onPrevImage}
              className="absolute top-1/2 -translate-y-1/2 left-2.5 w-9 h-9 bg-white/50 hover:bg-white/80 rounded-full flex items-center justify-center text-xl shadow-md border-none cursor-pointer z-20 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Next Button */}
          {productImages.length > 1 && (
            <button
              onClick={onNextImage}
              className="absolute top-1/2 -translate-y-1/2 right-2.5 w-9 h-9 bg-white/50 hover:bg-white/80 rounded-full flex items-center justify-center text-xl shadow-md border-none cursor-pointer z-20 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          )}

          {/* Image Pagination Dots */}
          {productImages.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 rounded-full bg-black/40 px-2 py-1 z-20">
              {productImages.map((_, index) => (
                <button
                  key={`detail-dot-${index}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`h-1.5 w-1.5 rounded-full p-0 border-none cursor-pointer transition-colors ${
                    index === currentImageIndex ? "bg-white" : "bg-white/45"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="bg-white rounded-t-3xl -mt-6 md:mt-0 md:rounded-none flex-1 p-5 md:p-6 lg:p-8 z-10 relative flex flex-col w-full md:w-1/2 overflow-y-auto mk-scroll-hidden">

          {/* UTILITY BAR */}
          <div className="flex items-center justify-between w-full max-w-lg mb-4">

            <div className="flex items-center gap-2">
                {/* Share Button */}
                <button
                  onClick={handleShareProduct}
                  className="shrink-0 h-7 px-3 bg-white md:bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full flex items-center gap-1.5 text-[9px] font-black text-gray-900 uppercase tracking-wider transition-colors shadow-sm"
                  aria-label="Share product"
                  type="button"
                >
                  {shareStatus === "Link copied" || shareStatus === "Shared" ? <Check size={12} /> : <Share2 size={12} />}
                  <span>{shareStatus || "Share"}</span>
                </button>

                {/* Favorite Button */}
                <button
                  onClick={handleFavoriteClick}
                  className="shrink-0 h-7 px-3 bg-white md:bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider transition-colors shadow-sm"
                  type="button"
                >
                  <Heart size={12} className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"} />
                  <span className={isFavorite ? "text-red-500" : "text-gray-900"}>{isFavorite ? "Saved" : "Save"}</span>
                </button>
            </div>

            {/* Product Navigation (PREV / NEXT) */}
            {(onPrev || onNext) && (
              <div className="flex items-center gap-2.5 text-[9px] font-black text-gray-400 tracking-widest uppercase">
                <button onClick={onPrev} type="button" className="flex items-center gap-0.5 hover:text-gray-900 transition-colors">
                  <ChevronLeft size={13} strokeWidth={3} /> PREV
                </button>
                <span className="text-gray-200 font-normal">|</span>
                <button onClick={onNext} type="button" className="flex items-center gap-0.5 hover:text-gray-900 transition-colors">
                  NEXT <ChevronRight size={13} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="max-w-lg my-auto w-full">

            {/* Title */}
            <h1 className="text-xl lg:text-2xl font-black text-gray-900 uppercase tracking-wide mb-1.5 leading-tight">
              {currentProduct.name}
            </h1>

            {/* Description */}
            <p className="text-[13px] md:text-sm text-gray-500 mb-4 leading-snug">
              {currentProduct.description || "Premium quality material designed for maximum comfort and durability."}
            </p>

            <div className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Included Sizes</div>
            <div className="flex gap-2 mb-5 flex-wrap">
              {availableSizes.map((size) => (
                <div
                  key={size}
                  className="size-8 md:minw-10 md:h-10 px-3 rounded-full flex items-center justify-center text-sm font-black bg-gray-100 text-[#1a1a1a] shadow-sm"
                >
                  {size}
                </div>
              ))}
            </div>

            <div className="flex items-end justify-between mb-2 border-t border-gray-200 pt-4">
              <div>
                <div className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wider">Quantity</div>
                <div className="flex items-center gap-3 bg-white md:bg-gray-50 rounded-full p-1 shadow-sm border border-gray-100">
                  <button
                    onClick={() => handleQtyChange(-1)}
                    className="size-8 md:size-9 bg-gray-900 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    onChange={handleQuantityInput}
                    className="w-10 text-center text-lg font-black bg-transparent border-none focus:outline-none"
                  />
                  <button
                    onClick={() => handleQtyChange(1)}
                    className="size-8 md:size-9 bg-gray-900 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Display Dynamic Amounts */}
              {currentProduct.isDiscountActive ? (
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5 mb-0.5">
                    <span className="text-sm line-through text-gray-400 font-bold">
                      Rs.{totalOriginalAmount.toLocaleString()}
                    </span>
                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                      {currentProduct.discountLabel}
                    </span>
                  </div>
                  <div className="text-2xl lg:text-3xl font-black text-red-600 leading-none">
                    Rs.{totalAmount.toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="text-2xl lg:text-3xl font-black text-gray-900 leading-none">
                  Rs.{totalAmount.toLocaleString()}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={() => onOrderNow && onOrderNow({ ...currentProduct, quantity, selectedSizes })}
                className="flex-1 bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 rounded-[14px] p-3 md:p-3.5 text-xs md:text-sm font-black tracking-widest cursor-pointer transition-colors"
              >
                ORDER NOW
              </button>
              <button
                onClick={() => onAddToCart && onAddToCart({ productId: currentProduct.id, quantity, size:selectedSizes })}
                className="flex-1 bg-gray-900 hover:bg-gray-800 hover:-translate-y-1 text-[#FFB800] border-none rounded-[14px] p-3 md:p-3.5 text-xs md:text-sm font-black tracking-widest cursor-pointer transition-all shadow-lg"
              >
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Image Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center backdrop-blur-sm">
          <button
            onClick={() => setShowPreview(false)}
            className="absolute top-6 right-6 text-white/70 hover:text-white text-3xl z-50 transition-colors"
          >
            ✕
          </button>

          {productImages.length > 1 && <button
            onClick={onPrevImage}
            className="absolute left-4 md:left-10 text-white hover:bg-white/20 bg-white/10 p-3 md:p-4 rounded-full transition-colors"
          >
            <ChevronLeft size={32} />
          </button>}

          <img
            src={productImages[currentImageIndex]}
            alt={currentProduct.name}
            className="max-w-[90%] max-h-[90vh] object-contain"
          />

          {productImages.length > 1 && <button
            onClick={onNextImage}
            className="absolute right-4 md:right-10 text-white hover:bg-white/20 bg-white/10 p-3 md:p-4 rounded-full transition-colors"
          >
            <ChevronRight size={32} />
          </button>}
        </div>
      )}
    </div>
  );
};

export default ProductDetail;