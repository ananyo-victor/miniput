import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../../components/layout/Navbar";
// import { fetchProducts } from "../../store/productsSlice";
import ProductCard from "../../components/customer/ProductCard";
import { DEMO_PRODUCTS } from "../../data/demoProducts";

const CustomerPage = () => {
  // const { items: products, loading } = useSelector((state) => state.products);
  const navigate = useNavigate();
  const products = DEMO_PRODUCTS;
  const [activeBrand, setActiveBrand] = useState("Miniput");

  // API disabled for demo mode:
  // useEffect(() => {
  //   dispatch(fetchProducts(false));
  // }, [dispatch]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => (p.brand || "").toLowerCase() === activeBrand.toLowerCase());
  }, [products, activeBrand]);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f5f5f5]">
      {/* Sidebar - Only visible on Laptop (lg) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-100">
          <p className="mk-bebas text-2xl text-[var(--mk-navy)]">SHOWROOM</p>
          <p className="text-[10px] font-bold text-gray-400 tracking-widest">B2B COLLECTIONS</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => navigate("/customer/shop")}
            className="w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition text-gray-500 hover:bg-gray-50"
          >
            HOME
          </button>
          <button
            onClick={() => navigate("/customer/cart")}
            className="w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition text-gray-500 hover:bg-gray-50"
          >
            CART
          </button>
          <button
            onClick={() => navigate("/customer/about")}
            className="w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition text-gray-500 hover:bg-gray-50"
          >
            ABOUT
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100 text-[10px] text-gray-400 font-bold">
          � 2026 MINIPUT � KWINK
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        {/* Mobile Tab Switcher (Hidden on LG) */}
        <div className="flex bg-white border-b border-gray-100 sticky top-[65px] z-40">
          {["Miniput", "Kwink"].map((brand) => (
            <button
              key={brand}
              onClick={() => setActiveBrand(brand)}
              className={`flex-1 py-4 text-xs font-black tracking-widest border-b-2 transition ${
                activeBrand === brand ? "border-[var(--mk-yellow)] text-[var(--mk-navy)]" : "border-transparent text-gray-400"
              }`}
            >
              {brand.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Brand Hero Section */}
        <section className={`p-8 ${activeBrand === "Miniput" ? "bg-[var(--mk-yellow)]" : "bg-[#5A7A3A]"} text-white transition-colors duration-500`}>
          <div className="max-w-6xl mx-auto flex justify-between items-end">
            <div>
              <h1 className="mk-bebas text-6xl sm:text-8xl tracking-tighter leading-none">{activeBrand}</h1>
              <p className="text-xs font-black tracking-[0.3em] opacity-80 mt-2">PREMIUM WHOLESALE SHOWROOM</p>
            </div>
            <div className="hidden sm:block text-8xl grayscale brightness-200 opacity-50">
              {activeBrand === "Miniput" ? "??" : "??"}
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <main className="p-4 sm:p-8 flex-1 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => navigate(`/customer/product/${product.id}`, { state: { product } })}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CustomerPage;
