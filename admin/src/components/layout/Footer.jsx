import React from "react";
import { Link, useLocation } from "react-router";
import { Package } from "lucide-react";

const Footer = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  const iconColor = (path) => (isActive(path) ? "text-blue-900" : "text-gray-400");

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="max-w-screen-xl mx-auto px-4 py-2">
        <div className="flex justify-center items-end">
          <Link to="/admin/inventory" className="flex flex-col items-center group">
            <Package size={18} className={`transition-colors ${iconColor("/admin/inventory")}`} />
            <span className={`text-xs font-bold mt-1 ${isActive("/admin/inventory") ? "text-blue-900" : "text-gray-400"}`}>
              Inventory
            </span>
            {isActive("/admin/inventory") && <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-0.5"></div>}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;