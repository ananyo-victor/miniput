import React from "react";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/customerSlice";

const ProductCard = ({ product, onClick }) => {
  const dispatch = useDispatch();

  return (
    <div
      onClick={() => onClick && onClick(product)}
      className="bg-white rounded-3xl overflow-hidden shadow-sm group hover:shadow-xl transition-shadow cursor-pointer"
    >
      <div className="aspect-[3/4] relative bg-gray-100">
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
          <p className="text-[11px] font-black tracking-wider uppercase">{product.name}</p>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm font-bold">Rs.{product.price}</p>
            <button
              onClick={(event) => {
                event.stopPropagation();
                dispatch(addToCart({ ...product, quantity: 1 }));
              }}
              className="bg-white text-[var(--mk-navy)] px-3 py-1 rounded-lg text-[10px] font-black hover:bg-[var(--mk-yellow)] transition"
            >
              + ADD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
