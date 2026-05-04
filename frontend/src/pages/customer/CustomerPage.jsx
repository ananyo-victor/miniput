import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../../components/layout/Navbar";
import ProductCard from "../../components/customer/ProductCard";
import { DEMO_PRODUCTS } from "../../data/demoProducts";

const CustomerPage = () => {
  const navigate = useNavigate();
  const products = DEMO_PRODUCTS;
  const [activeBrand, setActiveBrand] = useState("Miniput");

  const filteredProducts = useMemo(() => {
    return products.filter((p) => (p.brand || "").toLowerCase() === activeBrand.toLowerCase());
  }, [products, activeBrand]);

  return (
    <div className="flex-1 flex flex-col">
      <Navbar />

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

      <section
        className={`p-8 ${activeBrand === "Miniput" ? "bg-[var(--mk-yellow)]" : "bg-[#5A7A3A]"} text-white transition-colors duration-500`}
      >
        <div className="max-w-6xl mx-auto flex justify-between items-end">
          <div>
            <h1 className="mk-bebas text-6xl sm:text-8xl tracking-tighter leading-none">{activeBrand}</h1>
            <p className="text-xs font-black tracking-[0.3em] opacity-80 mt-2">PREMIUM WHOLESALE SHOWROOM</p>
          </div>
          <div className="hidden sm:block text-8xl grayscale brightness-200 opacity-50">{activeBrand === "Miniput" ? "??" : "??"}</div>
        </div>
      </section>

      <main className="p-4 sm:p-8 flex-1 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
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
  );
};

export default CustomerPage;
