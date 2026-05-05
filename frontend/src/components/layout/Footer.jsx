import React from "react";
import { Link, useLocation } from "react-router";
import { useSelector } from "react-redux";

const Footer = () => {
  const { authed: isAdmin } = useSelector((state) => state.admin);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 lg:hidden">
      <div className="max-w-screen-xl mx-auto px-4 py-2">
        <div className="flex justify-around items-end">
          <Link to="/customer/shop" className="flex flex-col items-center group">
            <img src="/path-to-your-icons/home-icon.png" alt="Home" className="w-8 h-8 mb-1" />
            <span className={`text-xs font-bold ${isActive("/customer/shop") ? "text-blue-900" : "text-gray-400"}`}>
              Home
            </span>
            {isActive("/customer/shop") && <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-0.5"></div>}
          </Link>

          {isAdmin && (
            <Link to="/customer/inventory" className="flex flex-col items-center group">
              <img src="/path-to-your-icons/box-icon.png" alt="Inventory" className="w-8 h-8 mb-1" />
              <span className={`text-xs font-bold ${isActive("/customer/inventory") ? "text-blue-900" : "text-gray-400"}`}>
                Inventory
              </span>
            </Link>
          )}

          <Link to="/customer/cart" className="flex flex-col items-center group">
            <img src="/path-to-your-icons/cart-icon.png" alt="Cart" className="w-8 h-8 mb-1" />
            <span className={`text-xs font-bold ${isActive("/customer/cart") ? "text-blue-900" : "text-gray-400"}`}>
              Cart
            </span>
          </Link>

          <Link to="/customer/about" className="flex flex-col items-center group">
            <div className="w-8 h-8 bg-blue-500 flex items-center justify-center border-2 border-black mb-1">
              <span className="text-white font-serif font-bold">i</span>
            </div>
            <span className={`text-xs font-bold ${isActive("/customer/about") ? "text-blue-900" : "text-gray-400"}`}>
              About
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
