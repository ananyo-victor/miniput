import React, { useEffect, useMemo, useRef, useState } from "react";

const ProductCard = ({ product, onClick }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartRef = useRef(null);
  const suppressClickRef = useRef(false);

  const productImages = useMemo(() => {
    const imageList = Array.isArray(product?.imageUrls) && product.imageUrls.length
      ? product.imageUrls
      : Array.isArray(product?.imageUrl)
        ? product.imageUrl
        : [product?.imageUrl];

    const normalized = imageList.filter((url) => typeof url === "string" && url.trim());
    return normalized.length ? normalized : ["https://via.placeholder.com/640x860?text=No+Image"];
  }, [product?.imageUrl, product?.imageUrls]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product?.id, productImages.length]);

  const handleCardClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }

    if (onClick) {
      onClick(product);
    }
  };

  const handleTouchStart = (event) => {
    if (productImages.length < 2) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    suppressClickRef.current = false;
  };

  const handleTouchEnd = (event) => {
    if (productImages.length < 2 || !touchStartRef.current) return;
    const touch = event.changedTouches?.[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const hasHorizontalSwipe = Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY);

    if (hasHorizontalSwipe) {
      suppressClickRef.current = true;
      setCurrentImageIndex((prev) => (
        deltaX < 0
          ? (prev + 1) % productImages.length
          : (prev - 1 + productImages.length) % productImages.length
      ));
    }

    touchStartRef.current = null;
  };

  const activeImage = productImages[currentImageIndex] || productImages[0];

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-xl md:rounded-2xl"
    >
      <div
        className="relative aspect-[4/5] md:aspect-[4/5] bg-gray-100 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 bg-center bg-cover blur-lg scale-130" style={{ backgroundImage: `url(${activeImage})` }} />
        <img src={activeImage} alt={product.name} className="relative w-full h-full object-contain object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 md:p-4 text-white">
          <p className="text-[10px] md:text-[11px] font-black tracking-wider uppercase leading-tight line-clamp-2">{product.name}</p>
          <div className="flex justify-between items-end mt-1">
            <div className="flex flex-col min-h-[36px] md:min-h-[40px] justify-end">
              {product.isDiscountActive ? (
                <>
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-[9px] md:text-[10px] text-gray-300 line-through">Rs.{product.originalPrice ?? product.price}</span>
                    <span className="text-[8px] md:text-[9px] bg-red-500 text-white px-1 py-0.5 rounded font-bold leading-none">{product.discountLabel}</span>
                  </div>
                  <p className="text-xs md:text-sm font-black text-[#FFB800]">Rs.{product.finalPrice}</p>
                </>
              ) : (
                <p className="text-xs md:text-sm font-bold">Rs.{product.price}</p>
              )}
            </div>
          </div>
        </div>
        {/* Pagination Dots */}
        {productImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 rounded-full bg-black/40 px-2 py-1">
            {productImages.map((_, index) => (
              <button
                key={`product-${product.id}-dot-${index}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Stops the card from opening
                  setCurrentImageIndex(index); // Changes the image
                }}
                className={`h-1.5 w-1.5 rounded-full p-0 border-none cursor-pointer ${index === currentImageIndex ? "bg-white" : "bg-white/45"
                  }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;