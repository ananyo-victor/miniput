import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Flame, Star, Zap } from "lucide-react";
import ProductCard from "../components/products/ProductCard";
import ProductCardSkeleton from "../components/skeletonLoader/ProductCardSkeleton";
import { fetchProducts } from "../store/productsSlice";

const TABS = [
  { id: "trending", label: "Trending", icon: Flame, iconColor: "text-orange-500" },
  { id: "bestsellers", label: "Bestsellers", icon: Star, iconColor: "text-yellow-500" },
  { id: "new-releases", label: "New Releases", icon: Zap, iconColor: "text-blue-500" },
];

const DiscoverPage = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);

  // Validate the tab from the URL, fallback to 'trending'
  const activeTabId = TABS.find((t) => t.id === tab) ? tab : "trending";

  // Fetch products if not already loaded
  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  // Apply basic sorting/filtering logic to differentiate the tabs visually
  // (In a real app, this might trigger different API endpoints)
  const displayProducts = useMemo(() => {
    if (!products.length) return [];
    const copy = [...products];
    
    if (activeTabId === "trending") {
      // Sort by highest price for trending demo
      return copy.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (activeTabId === "bestsellers") {
      // Sort by lowest stock for bestsellers demo
      return copy.sort((a, b) => (a.stock || 0) - (b.stock || 0));
    } else if (activeTabId === "new-releases") {
      // Reverse order for new releases demo
      return copy.reverse();
    }
    return copy;
  }, [products, activeTabId]);

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f5] pb-10 min-h-full">
      {/* Header & Tabs Section */}
      <section className="bg-white px-4 sm:px-8 pt-6 pb-0 shadow-sm sticky top-[54px] lg:top-[73px] z-30">
        <div className="max-w-[1440px] mx-auto w-full">
          <h1 className="mk-bebas text-3xl sm:text-4xl text-[var(--mk-navy)] tracking-[0.08em] mb-4">
            DISCOVER
          </h1>
          <div className="flex gap-6 overflow-x-auto mk-scroll-hidden border-b border-gray-100">
            {TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTabId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => navigate(`/discover/${t.id}`)}
                  className={`flex items-center gap-2 pb-3 px-1 border-b-[3px] transition-colors whitespace-nowrap ${
                    isActive
                      ? "border-[var(--mk-navy)] text-[var(--mk-navy)] font-black"
                      : "border-transparent text-gray-500 hover:text-gray-800 font-bold"
                  }`}
                >
                  <Icon size={18} className={isActive ? t.iconColor : "text-gray-400"} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 sm:px-6 lg:px-8 mt-6">
        {loading ? (
          <ProductCardSkeleton count={10} />
        ) : error ? (
          <div className="bg-white rounded-2xl p-8 text-center text-red-500 shadow-sm border border-gray-100">
            {error}
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-400 shadow-sm border border-gray-100 font-bold">
            No products found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {displayProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() =>
                  navigate(`/product/${product.id}`, { state: { product } })
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DiscoverPage;