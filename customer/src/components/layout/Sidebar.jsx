import React from "react";
import { Link, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { X, ShoppingCart, Info, Store } from "lucide-react";
import { setActiveBrand, setActiveCategory } from "../../store/homeSlice";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.customer.cart);
  const cartCount = cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);

  const isActiveBrand = (path) => location.pathname.includes(path);
  const isExactPath = (path) => location.pathname === path;

  const handleBrandClick = (brand) => {
    dispatch(setActiveBrand(brand));
    dispatch(setActiveCategory("all"));
    onClose();
  };

  return (
    <>
      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-white z-[70] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-2xl flex flex-col`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-2xl font-black text-[var(--mk-navy)] tracking-widest mk-bebas">MENU</h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 py-4 flex flex-col gap-2 px-3">
          {/* Brand Links */}
          <Link
            to="/home/miniput"
            onClick={() => handleBrandClick("Miniput")}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-colors ${
              isActiveBrand("miniput") ? "bg-[var(--mk-sky)] text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Store size={20} />
            MINIPUT
          </Link>

          <Link
            to="/home/kwink"
            onClick={() => handleBrandClick("Kwink")}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-colors ${
              isActiveBrand("kwink") ? "bg-[var(--mk-green)] text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Store size={20} />
            KWINK
          </Link>

          <div className="my-2 border-t border-gray-100"></div>

          {/* Utility Links */}
          <Link
            to="/cart"
            onClick={onClose}
            className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-colors ${
              isExactPath("/cart") ? "bg-[var(--mk-navy)] text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-4">
              <ShoppingCart size={20} />
              CART
            </div>
            {cartCount > 0 && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                isExactPath("/cart") ? "bg-white text-[var(--mk-navy)]" : "bg-[var(--mk-red)] text-white"
              }`}>
                {cartCount}
              </span>
            )}
          </Link>

          <Link
            to="/about"
            onClick={onClose}
            className={`flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-colors ${
              isExactPath("/about") ? "bg-[var(--mk-navy)] text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Info size={20} />
            ABOUT US
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;