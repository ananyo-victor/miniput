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
      <div className="aspect-[3/4] relative bg-gray-100">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
          <p className="text-[11px] font-black tracking-wider uppercase">{product.name}</p>
          <div className="flex justify-between items-end mt-1">
            <div className="flex flex-col min-h-[40px] justify-end">
              {product.isDiscountActive ? (
                <>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-300 line-through">Rs.{product.originalPrice ?? product.price}</span>
                    <span className="text-[9px] bg-red-500 text-white px-1 py-0.5 rounded font-bold">{product.discountLabel}</span>
                  </div>
                  <p className="text-sm font-black text-[#FFB800]">Rs.{product.finalPrice}</p>
                </>
              ) : (
                <p className="text-sm font-bold">Rs.{product.price}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
