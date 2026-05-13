import React from "react";
import { Link, useLocation } from "react-router";
import { Home, ShoppingCart, Info } from "lucide-react";

const Footer = () => {
  const location = useLocation();
  const isOrderPage = location.pathname === "/customer/order";

  const isActive = (path) => location.pathname === path;
  const iconColor = (path) => (isActive(path) ? "text-blue-900" : "text-gray-400");

  if (isOrderPage) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="max-w-screen-xl mx-auto px-4 py-2">
        <div className="flex justify-around items-end">
          <Link to="/customer/shop" className="flex flex-col items-center group">
            <Home size={18} className={`transition-colors ${iconColor("/customer/shop")}`} />
            <span className={`text-xs font-bold mt-1 ${isActive("/customer/shop") ? "text-blue-900" : "text-gray-400"}`}>
              Home
            </span>
            {isActive("/customer/shop") && <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-0.5"></div>}
          </Link>

          <Link to="/customer/cart" className="flex flex-col items-center group">
            <ShoppingCart size={18} className={`transition-colors ${iconColor("/customer/cart")}`} />
            <span className={`text-xs font-bold mt-1 ${isActive("/customer/cart") ? "text-blue-900" : "text-gray-400"}`}>
              Cart
            </span>
            {isActive("/customer/cart") && <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-0.5"></div>}
          </Link>

          <Link to="/customer/about" className="flex flex-col items-center group">
            <Info size={18} className={`transition-colors ${iconColor("/customer/about")}`} />
            <span className={`text-xs font-bold mt-1 ${isActive("/customer/about") ? "text-blue-900" : "text-gray-400"}`}>
              About
            </span>
            {isActive("/customer/about") && <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-0.5"></div>}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;