import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import ProductCard from "../components/products/ProductCard";
import { Heart } from "lucide-react";
import { fetchAboutThunk } from "../store/aboutSlice";

const FavoritesPage = () => {
  const favorites = useSelector((state) => state.favorites.items);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAboutThunk());
  }, [dispatch]);

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f5] pb-10 h-full">
      {/* Slimmed Down Header Section */}
      <section className="bg-[var(--mk-orange)] px-4 sm:px-8 py-4 sm:py-5 text-center shadow-sm">
        <h1 className="mk-bebas text-3xl sm:text-5xl text-white tracking-[0.12em] flex items-center justify-center gap-3">
           FAVORITES
        </h1>
      </section>

      {favorites.length === 0 ? (
         <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
           {/* Refined Empty State Card */}
           <div className="mk-card max-w-md w-full p-8 text-center border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
             <div className="flex justify-center mb-4">
                 <Heart size={42} className="text-gray-300" strokeWidth={1.5} />
             </div>
             <h2 className="text-xl font-black text-[var(--mk-navy)]">No favorites yet</h2>
             <p className="mt-2 text-sm text-gray-500">Tap the heart icon on any product to save it for later.</p>
             <button
               onClick={() => navigate('/home')}
               className="inline-block mt-6 px-6 py-3.5 rounded-xl text-xs font-black tracking-[0.08em] bg-[var(--mk-navy)] text-[var(--mk-yellow)] hover:-translate-y-0.5 transition-transform shadow-md"
             >
               DISCOVER PRODUCTS
             </button>
           </div>
         </main>
      ) : (
        <main className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 mt-6 md:mt-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {favorites.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() =>
                  navigate(`/product/${product.id}`, {
                    state: { product }
                  })
                }
              />
            ))}
          </div>
        </main>
      )}
    </div>
  );
};

export default FavoritesPage;