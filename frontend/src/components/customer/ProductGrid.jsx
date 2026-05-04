import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { addToCart } from "../../store/customerSlice";

const ProductGrid = ({ products }) => {
  const dispatch = useDispatch();
  
  // Requirement #3 Check: Is the user an Admin?
  const { authed: isAdmin } = useSelector((state) => state.admin);

  const handleAddToCart = (product) => {
    // Standard safety check
    if (isAdmin) return; 
    
    dispatch(addToCart({ ...product, quantity: 1 }));
    // Optional: Trigger a small toast notification here
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div 
          key={product.id} 
          className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
        >
          {/* Product Image */}
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <img 
              src={product.image || "https://via.placeholder.com/400"} 
              alt={product.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {product.stock <= 0 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-white text-gray-900 px-4 py-1 rounded-full font-bold text-xs uppercase tracking-widest">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-5">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">
                  {product.category}
                </p>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">
                  {product.name}
                </h3>
              </div>
              <p className="text-lg font-black text-gray-900">
                ₹{product.price}
              </p>
            </div>

            {/* CTA Button: Hidden or replaced for Admin */}
            <div className="mt-4">
              {isAdmin ? (
                <div className="w-full py-3 px-4 bg-gray-100 text-gray-400 rounded-xl text-center text-sm font-bold border border-dashed border-gray-300 cursor-default">
                  Admin View Only
                </div>
              ) : (
                <button 
                  disabled={product.stock <= 0}
                  onClick={() => handleAddToCart(product)}
                  className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    product.stock <= 0 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-900 text-white hover:bg-blue-600 active:scale-95 shadow-lg shadow-gray-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;