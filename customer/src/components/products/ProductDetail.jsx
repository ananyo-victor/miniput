import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Copy, Minus, Plus, Share2 } from "lucide-react";

const ProductDetail = ({ product, onBack, onAddToCart, onOrderNow }) => {
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
    if (stock > 50) return { label: "IN STOCK", color: "text-green-700" };
    if (stock > 20) return { label: "LIMITED STOCK", color: "text-yellow-600" };
    return { label: "LOW STOCK", color: "text-red-600" };
  };

  const stockInfo = getStockStatus(currentProduct.stock || 0);

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

  return (
    <div className="min-h-screen bg-white font-['Nunito',sans-serif] md:p-6 lg:p-10 flex justify-center">
      <div className="flex flex-col md:flex-row w-full max-w-[1200px] bg-white md:rounded-3xl md:shadow-sm md:overflow-hidden md:border md:border-gray-100">

        {/* Image Section - Adjusts for Desktop/Tablet */}
        <div className="relative h-[clamp(320px,50vw,480px)] md:h-auto md:min-h-[500px] lg:min-h-[650px] bg-[#e8e8e8] shrink-0 overflow-hidden md:w-1/2 flex items-center justify-center">
          <button
            onClick={onBack}
            className="absolute top-4 left-4 md:top-6 md:left-6 w-10 h-10 bg-white/70 hover:bg-white rounded-full flex items-center justify-center text-lg cursor-pointer z-20 shadow-sm border-none transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="absolute inset-0 bg-center bg-cover blur-lg scale-110 z-0" style={{ backgroundImage: `url(${productImages[currentImageIndex]})` }} />
          <div className="absolute inset-0 bg-black/10 z-0" />

          <img
            src={productImages[currentImageIndex]}
            alt={currentProduct.name}
            onClick={() => setShowPreview(true)}
            className="relative z-10 w-full h-full object-contain cursor-zoom-in"
          />

          {/* Commented out navigation, preserved from original */}
          {productImages.length > 1 && <button
            onClick={onPrevImage}
            className="absolute top-1/2 -translate-y-1/2 left-2.5 w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-xl shadow-md border-none cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft size={22} />
          </button>}

          {productImages.length > 1 && <button
            onClick={onNextImage}
            className="absolute top-1/2 -translate-y-1/2 right-2.5 w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-xl shadow-md border-none cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight size={22} />
          </button>}
        </div>

        {/* Details Section - Stacks on mobile, side-by-side on desktop */}
        <div className="bg-[#f5f5f5]/50 md:bg-white rounded-t-3xl -mt-6 md:mt-0 md:rounded-none flex-1 p-6 md:p-8 lg:p-12 z-10 relative flex flex-col justify-center w-full md:w-1/2">

          <div className="max-w-lg">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-black text-gray-900 uppercase tracking-wide">
                {currentProduct.name}
              </h1>
              <button
                onClick={handleShareProduct}
                className="shrink-0 h-10 px-3 bg-white md:bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full flex items-center gap-2 text-xs font-black text-gray-900 uppercase tracking-wider transition-colors shadow-sm"
                aria-label="Share product"
                type="button"
              >
                {shareStatus === "Link copied" || shareStatus === "Shared" ? <Check size={16} /> : <Share2 size={16} />}
                <span className="hidden sm:inline">{shareStatus || "Share"}</span>
              </button>
            </div>
            {shareStatus && (
              <div className="mb-3 flex items-center gap-1.5 text-xs font-bold text-green-700 uppercase tracking-wider">
                <Copy size={13} />
                {shareStatus === "Shared" ? "Product shared" : shareStatus}
              </div>
            )}
            <p className="text-sm md:text-base text-gray-500 mb-6 leading-relaxed">
              {currentProduct.description || "Premium quality material designed for maximum comfort and durability."}
            </p>

            <div className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider">Available Sizes</div>
            <div className="flex gap-2 mb-8 flex-wrap">
              {availableSizes.map((size) => (
                <div
                  key={size}
                  className="size-8 md:size-10 rounded-full flex items-center justify-center text-xs sm:text-base font-black bg-gray-950 text-white select-none"
                >
                  {size}
                </div>
              ))}
            </div>

            <div className="flex items-end justify-between mb-4 border-t border-gray-200 pt-6">
              <div>
                <div className="text-sm font-bold text-gray-600 mb-3 uppercase tracking-wider">Quantity</div>
                <div className="flex items-center gap-4 bg-white md:bg-gray-50 rounded-full p-1 shadow-sm border border-gray-100">
                  <button
                    onClick={() => handleQtyChange(-1)}
                    className="size-9 md:size-10 bg-gray-900 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    onChange={handleQuantityInput}
                    className="w-12 text-center text-xl font-black bg-transparent border-none focus:outline-none md:text-2xl"
                  />
                  <button
                    onClick={() => handleQtyChange(1)}
                    className="size-9 md:size-10 bg-gray-900 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

                {currentProduct.isDiscountActive ? (
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                      <span className="text-base md:text-lg line-through text-gray-400 font-bold">
                        Rs.{currentProduct.originalPrice ?? currentProduct.price}
                      </span>
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                        {currentProduct.discountLabel}
                      </span>
                    </div>
                    <div className="text-[28px] lg:text-4xl font-black text-red-600">
                      Rs.{currentProduct.finalPrice}
                    </div>
                  </div>
                ) : (
                  <div className="text-[28px] lg:text-4xl font-black text-gray-900">
                    Rs.{currentProduct.price}
                  </div>
                )}
              </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <button
                onClick={() => onOrderNow && onOrderNow({ ...currentProduct, quantity, selectedSizes })}
                className="flex-1 bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 rounded-2xl p-4 md:p-5 text-sm md:text-base font-black tracking-widest cursor-pointer transition-colors"
              >
                ORDER NOW
              </button>
              <button
                onClick={() => onAddToCart && onAddToCart({ ...currentProduct, quantity, selectedSizes })}
                className="flex-1 bg-gray-900 hover:bg-gray-800 hover:-translate-y-1 text-[#FFB800] border-none rounded-2xl p-4 md:p-5 text-sm md:text-base font-black tracking-widest cursor-pointer transition-all shadow-lg"
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
