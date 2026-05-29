import React from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/customerSlice";

const ProductCard = ({ product, onClick }) => {
  const dispatch = useDispatch();

  return (
    <div
      onClick={() => onClick && onClick(product)}
      className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-xl md:rounded-2xl"
    >
      <div className="relative aspect-[4/5] md:aspect-[3/4] bg-gray-100">
        <div className="absolute inset-0 bg-center bg-cover blur-lg scale-130" style={{ backgroundImage: `url(${product.imageUrl})` }} />
        <img src={product.imageUrl} alt={product.name} className="relative w-full h-full object-contain object-center" />
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
      </div>
    </div>
  );
};

export default ProductCard;
