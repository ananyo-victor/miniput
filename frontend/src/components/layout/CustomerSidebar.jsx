import React from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";

const CustomerSidebar = () => {
  const { authed: isAdmin } = useSelector((state) => state.admin);

  const navigate = useNavigate();
  const location = useLocation();

  const navButtonClass = (isActive) =>
    `w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition flex items-center gap-3 ${
      isActive ? "bg-yellow-200/50 text-gray-700" : "text-gray-400 hover:bg-gray-50"
    }`;

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col sticky top-0 h-screen">
      <div className="p-6 border-b border-gray-100">
        <p className="mk-bebas text-2xl text-[var(--mk-navy)]">SHOWROOM</p>
        <p className="text-[10px] font-bold text-gray-400 tracking-widest">B2B COLLECTIONS</p>
      </div>
      <nav className="flex-1 p-4 space-y-4">
        <button
          onClick={() => navigate("/customer/shop")}
          className={navButtonClass(location.pathname === "/customer/shop")}
        >
          <span className="inline-flex items-center justify-center w-5 text-lg leading-none">🏠</span>
          HOME
        </button>
        {!isAdmin && (
          <button
            onClick={() => navigate("/customer/cart")}
            className={navButtonClass(location.pathname === "/customer/cart")}
          >
            <span className="inline-flex items-center justify-center w-5 text-lg leading-none">🛒</span>
            CART
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => navigate("/admin/inventory")}
            className={navButtonClass(location.pathname === "/admin/inventory")}
          >
            <span className="inline-flex items-center justify-center w-5 text-lg leading-none">📦</span>
            INVENTORY
          </button>
        )}
        <button
          onClick={() => navigate("/customer/about")}
          className={navButtonClass(location.pathname === "/customer/about")}
        >
          <span className="inline-flex items-center justify-center w-5 text-lg leading-none">ℹ️</span>
          ABOUT
        </button>
      </nav>
      <div className="p-4 border-t border-gray-100 text-[10px] text-gray-400 font-bold">
        (c) 2026 MINIPUT | KWINK
      </div>
    </aside>
  );
};

export default CustomerSidebar;
