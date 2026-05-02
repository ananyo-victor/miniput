import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { LayoutDashboard, Package, Search, LogOut } from 'lucide-react';
import DashboardStats from "./DashboardStats";
import InventoryTable from "./InventoryTable";
import { setAdminField } from "../../store/adminSlice";
import { fetchProducts } from "../../store/productsSlice";

export default function AdminDashboardPage({ onLogout }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const admin = useSelector((s) => s.admin);
  const products = useSelector((s) => s.products.items);

  useEffect(() => {
    if (admin.authed) {
      dispatch(fetchProducts(true));
    }
  }, [admin.authed, dispatch]);

  const setView = (view) => dispatch(setAdminField({ key: "view", value: view }));

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <h2 className="text-2xl font-black tracking-tight text-indigo-600">KWINK<span className="text-slate-400">.</span></h2>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${admin.view === 'dashboard' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setView('inventory')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${admin.view === 'inventory' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Package size={20} /> Inventory
          </button>
        </nav>
        <div className="p-6 mt-auto border-t border-slate-100 space-y-3">
          <div className="bg-slate-900 rounded-2xl p-4 text-white">
            <p className="text-xs text-slate-400">Logged in as</p>
            <p className="font-medium truncate">Admin@kwink.in</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl transition-all font-semibold"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-10 px-8 py-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 capitalize">{admin.view} Overview</h1>
            <p className="text-slate-500 text-sm">Welcome back, here is what's happening today.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 w-64" />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {admin.view === "dashboard" && <DashboardStats products={products} />}
          {admin.view === "inventory" && <InventoryTable products={products} />}
        </div>
      </main>
    </div>
  );
}