import React from "react";
import { useNavigate } from "react-router";

const CustomerSidebar = () => {
  const navigate = useNavigate();

  return (
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
        © 2026 MINIPUT • KWINK
      </div>
    </aside>
  );
};

export default CustomerSidebar;
