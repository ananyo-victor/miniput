import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Menu } from "lucide-react";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navButtonClass = (isActive) =>
    `w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition flex items-center gap-3 ${
      isActive ? "bg-yellow-200/50 text-gray-700" : "text-gray-400 hover:bg-gray-50"
    }`;

  return (
    <aside
      className={`hidden lg:flex ${
        collapsed ? "w-20" : "w-64"
      } bg-white border-r border-gray-200 flex-col sticky top-0 h-screen transition-all duration-300`}
    >
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        {!collapsed && (
          <div>
            <p className="mk-bebas text-2xl text-[var(--mk-navy)]">ADMIN PANEL</p>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest">MINIPUT INVENTORY</p>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-4">
        <button
          onClick={() => navigate("/admin/inventory")}
          className={navButtonClass(location.pathname === "/admin/inventory")}
        >
          <span className="inline-flex items-center justify-center w-12 text-xs leading-none font-black">STOCK</span>
          {!collapsed && "INVENTORY"}
        </button>
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-gray-100 text-[10px] text-gray-400 font-bold">
          (c) 2026 MINIPUT | ADMIN
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;