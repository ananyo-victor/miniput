import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../components/layout/Navbar";
import { deleteProductThunk, quickAddStockThunk, toggleProductVisibilityThunk } from "../../store/adminSlice";
import { fetchProducts } from "../../store/productsSlice";

const statusMeta = (stock) => {
  if (stock > 50) return { key: "in-stock", label: "IN STOCK", tone: "bg-green-100 text-green-700" };
  if (stock > 15) return { key: "limited", label: "LIMITED", tone: "bg-amber-100 text-amber-700" };
  return { key: "low", label: "LOW", tone: "bg-red-100 text-red-700" };
};

const AdminInventory = () => {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);

  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchProducts(true));
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") {
      return products;
    }

    if (activeFilter === "hidden") {
      return products.filter((item) => item.isHidden);
    }

    return products.filter((item) => statusMeta(Number(item.stock || 0)).key === activeFilter);
  }, [activeFilter, products]);

  const counts = useMemo(() => {
    const map = { all: products.length, "in-stock": 0, limited: 0, low: 0, hidden: 0 };

    products.forEach((product) => {
      map[statusMeta(Number(product.stock || 0)).key] += 1;
      if (product.isHidden) {
        map.hidden += 1;
      }
    });

    return map;
  }, [products]);

  const filters = [
    { id: "all", label: "ALL" },
    { id: "in-stock", label: "IN STOCK" },
    { id: "limited", label: "LIMITED" },
    { id: "low", label: "LOW" },
    { id: "hidden", label: "HIDDEN" }
  ];

  return (
    <div className="mk-shell flex flex-col">
      <Navbar />

      <section className="bg-white border-b border-gray-100 px-5 sm:px-7 py-5">
        <h1 className="mk-bebas text-5xl sm:text-6xl text-[var(--mk-navy)] tracking-[0.08em]">INVENTORY</h1>
        <p className="text-sm text-gray-500">Track stock, visibility, and quick restocks from one panel.</p>
      </section>

      <section className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3">
        <div className="flex gap-2 overflow-x-auto mk-scroll-hidden">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-[11px] font-black tracking-[0.08em] whitespace-nowrap transition ${
                activeFilter === filter.id
                  ? "bg-[var(--mk-navy)] text-[var(--mk-yellow)]"
                  : "bg-gray-100 text-gray-500 hover:text-[var(--mk-navy)]"
              }`}
            >
              {filter.label} ({counts[filter.id] || 0})
            </button>
          ))}
        </div>
      </section>

      <main className="flex-1 bg-[var(--mk-bg)] px-4 sm:px-6 py-5">
        {loading && <p className="text-sm font-bold text-gray-500">Loading inventory...</p>}
        {!loading && error && <p className="text-sm font-bold text-[var(--mk-red)]">{error}</p>}

        <div className="space-y-3">
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="mk-card p-7 text-center text-sm font-black text-gray-500">NO PRODUCTS IN THIS FILTER</div>
          )}

          {filteredProducts.map((product) => {
            const stock = Number(product.stock || 0);
            const status = statusMeta(stock);

            return (
              <article key={product._id || product.id} className="mk-card p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center text-xl">
                  <img
                    src={product.imageUrl || "https://via.placeholder.com/120?text=Item"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-black truncate">{product.name}</h2>
                  <p className="text-xs font-bold tracking-[0.08em] text-gray-500">
                    {String(product.brand || "").toUpperCase()} | {String(product.category || "GENERAL").toUpperCase()}
                  </p>
                </div>

                <div className="text-left sm:text-right min-w-[140px]">
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black tracking-[0.07em] ${status.tone}`}>
                    {status.label}
                  </span>
                  <p className="mt-2 text-sm font-bold text-gray-500">{stock} units</p>
                  <p className="text-xl font-black">Rs {Number(product.price || 0).toLocaleString()}</p>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => dispatch(quickAddStockThunk({ id: product._id, stock }))}
                    className="px-3 py-2 rounded-xl bg-[var(--mk-navy)] text-[var(--mk-yellow)] text-[10px] font-black tracking-[0.08em]"
                  >
                    +10 STOCK
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        toggleProductVisibilityThunk({
                          id: product._id,
                          isHidden: !product.isHidden
                        })
                      )
                    }
                    className="px-3 py-2 rounded-xl bg-gray-100 text-[10px] font-black tracking-[0.08em] text-gray-600"
                  >
                    {product.isHidden ? "UNHIDE" : "HIDE"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete ${product.name}?`)) {
                        dispatch(deleteProductThunk(product._id));
                      }
                    }}
                    className="px-3 py-2 rounded-xl bg-red-100 text-[10px] font-black tracking-[0.08em] text-red-700"
                  >
                    DELETE
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default AdminInventory;