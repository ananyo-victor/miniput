import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import ProductCard from "../../components/customer/ProductCard";
import { fetchProducts } from "../../store/productsSlice";

const CustomerPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts(false));
  }, [dispatch]);

  const [activeBrand, setActiveBrand] = useState("Miniput");
  const [activeCategory, setActiveCategory] = useState("all");

  // ✅ Category Filters
  const CATEGORY_FILTERS = [
    { key: "all", label: "ALL" },
    { key: "tshirt", icon: "👕" },
    { key: "jeans", icon: "👖" },
    { key: "jacket", icon: "🧥" },
    { key: "dress", icon: "👗" },
    { key: "shorts", icon: "🩳" },
  ];

  // ✅ Combined Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const brandMatch =
        (p.brand || "").toLowerCase() === activeBrand.toLowerCase();

      const categoryMatch =
        activeCategory === "all" ||
        (p.category || "").toLowerCase() === activeCategory;

      return brandMatch && categoryMatch;
    });
  }, [products, activeBrand, activeCategory]);

  return (
    <div className="flex-1 flex flex-col">
      {/* ✅ BRAND TABS (TOP) */}
      <div className="flex bg-white border-b border-gray-100 sticky top-[65px] z-40">
        {["Miniput", "Kwink"].map((brand) => (
          <button
            key={brand}
            onClick={() => {
              setActiveBrand(brand);
              setActiveCategory("all"); // ✅ reset category
            }}
            className={`flex-1 py-4 text-xs font-black tracking-widest border-b-2 transition ${activeBrand === brand
                ? "border-[var(--mk-yellow)] text-[var(--mk-navy)]"
                : "border-transparent text-gray-400"
              }`}
          >
            {brand.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ✅ HERO SECTION */}
      <section
        className={`p-8 ${activeBrand === "Miniput"
            ? "bg-[var(--mk-yellow)]"
            : "bg-[#5A7A3A]"
          } text-white transition-colors duration-500`}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-end">
          <div>
            <h1
              className={`tracking-tighter leading-none ${activeBrand === "Miniput"
                  ? "mk-bebas text-[clamp(36px,6vw,72px)] bg-[linear-gradient(90deg,#E85A1D,#FFB800,#3aa34a,#0E2A4A,#c03fa1)] bg-clip-text text-transparent"
                  : activeBrand === "Kwink"
                    ? "text-4xl italic font-black text-white [font-family:'Nunito',sans-serif]"
                    : "mk-bebas text-6xl sm:text-8xl"
                }`}
            >
              {activeBrand}
            </h1>
            <p className="text-xs font-black tracking-[0.3em] opacity-80 mt-2">{activeBrand === "Miniput" ? "KIDS" : "YOUR SHIRT, YOUR STORY"}</p>
          </div>
          <div className="hidden sm:block text-8xl">{activeBrand === "Miniput" ? "👧🧒" : "👦"}</div>
        </div>
      </section>

      {/* ✅ CATEGORY FILTER (UNDER BRAND) */}
      <div className="bg-white border-b border-gray-100 sticky top-[113px] z-30">
        <div className="flex gap-3 overflow-x-auto px-4 py-3">
          {CATEGORY_FILTERS.map((filter) => {
            const isActive = activeCategory === filter.key;

            return (
              <button
                key={filter.key}
                onClick={() => setActiveCategory(filter.key)}
                className={`flex items-center justify-center min-w-[48px] h-[48px] rounded-full transition ${isActive
                    ? `${activeBrand === "Miniput" ? "bg-[var(--mk-yellow)]" : "bg-[var(--mk-green)]"} text-black`
                    : "bg-black text-white"
                  }`}
              >
                {filter.label ? (
                  <span className="text-xs font-bold">
                    {filter.label}
                  </span>
                ) : (
                  <span className="text-lg">{filter.icon}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ✅ PRODUCT GRID */}
      <main className="p-4 sm:p-8 flex-1 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="text-center text-gray-400 py-20 font-semibold">
            Loading products...
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-20 font-semibold">
            {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-400 py-20 font-semibold">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() =>
                  navigate(`/customer/product/${product.id}`, {
                    state: { product },
                  })
                }
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerPage;
