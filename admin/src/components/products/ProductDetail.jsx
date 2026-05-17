import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus
} from "lucide-react";

const ProductDetail = ({ product, onBack, onAddToCart, onOrderNow }) => {
  const currentProduct = useMemo(
    () =>
      product || {
        id: "fallback-1",
        name: "Sweatshirt & Jogger",
        brand: "Miniput",
        price: 599,
        imageUrl:
          "https://via.placeholder.com/640x860/F3E8A6/0E2A4A?text=Miniput+Product",
        stock: 85,
        size: [26, 28, 30, 32, 34],
        imageUrls: [],
        description: ""
      },
    [product]
  );

  const [quantity, setQuantity] = useState(1);

  const [selectedSizes, setSelectedSizes] = useState([
    currentProduct.size?.[0] || 1
  ]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [showPreview, setShowPreview] = useState(false);

  const productImages = useMemo(() => {
    if (
      Array.isArray(currentProduct.imageUrls) &&
      currentProduct.imageUrls.length
    ) {
      return currentProduct.imageUrls;
    }

    return [currentProduct.imageUrl];
  }, [currentProduct.imageUrls, currentProduct.imageUrl]);

  useEffect(() => {
    setQuantity(1);

    setSelectedSizes([
      currentProduct.size?.[0] || 1
    ]);

    setCurrentImageIndex(0);
  }, [currentProduct.id, currentProduct.size]);

  const onPrevImage = () => {
    setCurrentImageIndex(
      (prev) =>
        (prev - 1 + productImages.length) %
        productImages.length
    );
  };

  const onNextImage = () => {
    setCurrentImageIndex(
      (prev) =>
        (prev + 1) % productImages.length
    );
  };

  const handleQtyChange = (delta) => {
    setQuantity((prev) =>
      Math.max(
        1,
        Math.min(
          currentProduct.stock || 999,
          prev + delta
        )
      )
    );
  };

  const handleQuantityInput = (e) => {
    const value = e.target.value.replace(
      /[^0-9]/g,
      ""
    );

    if (value === "") {
      setQuantity(1);
      return;
    }

    const numValue = parseInt(value, 10);

    setQuantity(
      Math.max(
        1,
        Math.min(
          currentProduct.stock || 999,
          numValue
        )
      )
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes((prev) => {
      if (prev.includes(size)) {
        return prev.length === 1
          ? prev
          : prev.filter(
            (item) => item !== size
          );
      }

      return [...prev, size];
    });
  };

  const getStockStatus = (stock) => {
    if (stock > 50) {
      return {
        label: "IN STOCK",
        color: "text-green-700"
      };
    }

    if (stock > 20) {
      return {
        label: "LIMITED STOCK",
        color: "text-yellow-600"
      };
    }

    return {
      label: "LOW STOCK",
      color: "text-red-600"
    };
  };

  const stockInfo = getStockStatus(
    currentProduct.stock || 0
  );

  return (
    <div className="flex flex-col min-h-screen bg-white font-['Nunito',sans-serif]">

      <div className="relative h-[clamp(280px,40vw,480px)] bg-[#e8e8e8] shrink-0 overflow-hidden">

        <button
          onClick={onBack}
          className="absolute top-3.5 left-3.5 w-9 h-9 bg-white/50 rounded-full flex items-center justify-center z-20 shadow-md"
        >
          <ArrowLeft size={18} />
        </button>

        <img
          src={
            productImages[
            currentImageIndex
            ]
          }
          alt={currentProduct.name}
          onClick={() =>
            setShowPreview(true)
          }
          className="w-full h-full object-contain cursor-zoom-in"
        />

        {productImages.length > 1 && (
          <>
            <button
              onClick={onPrevImage}
              className="absolute top-1/2 left-2.5 -translate-y-1/2 w-10 h-10 bg-white/50 rounded-full flex items-center justify-center shadow-md"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              onClick={onNextImage}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 w-10 h-10 bg-white/50 rounded-full flex items-center justify-center shadow-md"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      <div className="bg-[#f5f5f5]/50 rounded-t-3xl -mt-5 flex-1 p-5 md:max-w-[600px] md:mx-auto md:w-full z-10 relative flex flex-col">

        <h1 className="text-xl font-black text-gray-900 mb-1 uppercase tracking-wide">
          {currentProduct.name}
        </h1>

        <p className="text-sm text-gray-500 mb-4">
          {currentProduct.description}
        </p>

        <div className="text-xs font-bold text-gray-600 mb-2">
          Size
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {(currentProduct.size || []).map(
            (size) => (
              <button
                key={size}
                onClick={() =>
                  toggleSize(size)
                }
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black transition-colors ${selectedSizes.includes(
                  size
                )
                  ? "bg-[#FFB800] text-gray-900"
                  : "bg-gray-900 text-white"
                  }`}
              >
                {size}
              </button>
            )
          )}
        </div>

        <div className="flex items-center justify-between mb-3">

          <div>
            <div className="text-sm font-bold text-gray-600 mb-2">
              Quantity
            </div>

            <div className="flex items-center gap-4">

              <button
                onClick={() =>
                  handleQtyChange(-1)
                }
                className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center"
              >
                <Minus size={16} />
              </button>

              <input
                type="text"
                value={quantity}
                onChange={
                  handleQuantityInput
                }
                className="w-16 text-center text-xl font-black border-b border-gray-300 focus:outline-none"
              />

              <button
                onClick={() =>
                  handleQtyChange(1)
                }
                className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center"
              >
                <Plus size={16} />
              </button>

            </div>
          </div>

          <div className="text-3xl font-black">
            Rs.{currentProduct.price}
          </div>

        </div>

        <div
          className={`text-xs font-bold mb-4 ${stockInfo.color}`}
        >
          {stockInfo.label} (
          {currentProduct.stock || 0}
          {" "}UNITS)
        </div>

        <div className="flex gap-3">

          <button
            onClick={() =>
              onOrderNow?.({
                ...currentProduct,
                quantity,
                selectedSizes
              })
            }
            className="flex-1 bg-gray-900 text-[#FFB800] rounded-2xl p-4 font-black"
          >
            ORDER NOW
          </button>

          <button
            onClick={() =>
              onAddToCart?.({
                ...currentProduct,
                quantity,
                selectedSizes
              })
            }
            className="flex-1 bg-gray-900 text-[#FFB800] rounded-2xl p-4 font-black"
          >
            ADD TO CART
          </button>

        </div>

      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">

          <button
            onClick={() =>
              setShowPreview(false)
            }
            className="absolute top-5 right-5 text-white text-3xl"
          >
            ✕
          </button>

          <button
            onClick={onPrevImage}
            className="absolute left-4 text-white bg-black/40 p-2 rounded-full"
          >
            <ChevronLeft size={30} />
          </button>

          <img
            src={
              productImages[
              currentImageIndex
              ]
            }
            alt={currentProduct.name}
            className="max-w-[95%] max-h-[95%] object-contain"
          />

          <button
            onClick={onNextImage}
            className="absolute right-4 text-white bg-black/40 p-2 rounded-full"
          >
            <ChevronRight size={30} />
          </button>

        </div>
      )}

    </div>
  );
};

export default ProductDetail;