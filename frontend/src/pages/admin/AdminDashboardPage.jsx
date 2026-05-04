import React, { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../store/productsSlice";

const AdminDashboardPage = ({ onLogout }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.admin.userId);
  const products = useSelector((state) => state.products.items);

  useEffect(() => {
    dispatch(fetchProducts(true));
  }, [dispatch]);

  const stats = useMemo(() => {
    const total = products.length;
    const lowStock = products.filter((item) => Number(item.stock || 0) <= 15).length;
    const hidden = products.filter((item) => item.isHidden).length;

    return [
      { label: "Total Products", value: total },
      { label: "Low Stock", value: lowStock },
      { label: "Hidden Products", value: hidden }
    ];
  }, [products]);

  return (
    <div className="mk-shell min-h-screen bg-[var(--mk-bg)]">
      <header className="bg-[var(--mk-navy)] text-white px-5 sm:px-8 py-5 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <p className="mk-bebas text-4xl tracking-[0.08em]">ADMIN PANEL</p>
          <p className="text-xs text-white/70 font-bold">Signed in as {userId || "Admin"}</p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/customer/shop"
            className="px-4 py-2 rounded-xl text-xs font-black tracking-[0.08em] bg-white/10 text-white"
          >
            OPEN SHOP
          </Link>
          <button
            onClick={onLogout}
            className="px-4 py-2 rounded-xl text-xs font-black tracking-[0.08em] bg-[var(--mk-red)] text-white"
          >
            LOGOUT
          </button>
        </div>
      </header>

      <main className="p-5 sm:p-8">
        <div className="grid md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <article key={stat.label} className="mk-card p-5">
              <p className="text-xs font-black text-gray-500 tracking-[0.08em]">{stat.label.toUpperCase()}</p>
              <p className="mt-2 text-4xl font-black text-[var(--mk-navy)]">{stat.value}</p>
            </article>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-6">
          <article className="mk-card p-6">
            <h2 className="text-2xl font-black text-[var(--mk-navy)]">Inventory Control</h2>
            <p className="mt-2 text-sm text-gray-500">Manage stock, hide/unhide products, and clean old listings.</p>
            <button
              type="button"
              onClick={() => navigate("/admin/inventory")}
              className="mt-5 px-5 py-3 rounded-xl text-xs font-black tracking-[0.08em] bg-[var(--mk-navy)] text-[var(--mk-yellow)]"
            >
              GO TO INVENTORY
            </button>
          </article>

          <article className="mk-card p-6 bg-[var(--mk-yellow)]/15">
            <h2 className="text-2xl font-black text-[var(--mk-navy)]">Storefront Check</h2>
            <p className="mt-2 text-sm text-gray-600">Preview the customer-facing design and product visibility instantly.</p>
            <button
              type="button"
              onClick={() => navigate("/customer/shop")}
              className="mt-5 px-5 py-3 rounded-xl text-xs font-black tracking-[0.08em] bg-[var(--mk-navy)] text-[var(--mk-yellow)]"
            >
              VIEW SHOWROOM
            </button>
          </article>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
