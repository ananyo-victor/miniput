import React from "react";
import { Link, useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { X, ShoppingCart, Info, Flame, Star, Zap, User, UserCircle, FileText, LogOut, Heart } from "lucide-react";
import { setActiveBrand, setActiveCategory } from "../../store/homeSlice";
import { logoutCustomer, openAuthModal, openProfileModal } from "../../store/authSlice";
import MiniputSign from "../../assests/MINIPUT_SIGN.png";
import KwinkSign from "../../assests/kwink_SIGN.png";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);
  const { authed, phone } = useSelector((state) => state.auth);
  const { name, profilePic } = useSelector((state) => state.user.profile);
  const favorites = useSelector((state) => state.favorites.items);
  const cartCount = cart.length;

  const isActiveBrand = (path) => location.pathname.includes(path);
  const isExactPath = (path) => location.pathname === path;

  const handleBrandClick = (brand) => {
    dispatch(setActiveBrand(brand));
    dispatch(setActiveCategory("all"));
    onClose();
  };

  const handleAccountClick = () => {
    if (authed) {
      dispatch(openProfileModal());
    } else {
      dispatch(openAuthModal());
    }
    onClose();
  };

  // Get first name or fallback to phone / "Sign In"
  const firstName = authed ? (name ? name.split(" ")[0] : phone) : "";

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
        className={`fixed top-0 left-0 h-full w-[280px] md:w-[320px] bg-white z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"
          } shadow-2xl flex flex-col`}
      >
        {/* Top Header: User Profile Section */}
        <div className="flex items-center justify-between p-5 bg-[var(--mk-navy)] text-white">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={handleAccountClick}
          >
            {authed && profilePic ? (
              <img
                src={profilePic}
                alt="Profile"
                className="w-11 h-11 rounded-full object-cover border-2 border-white/20 shadow-sm"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
                <User size={24} />
              </div>
            )}
            <span className="text-xl font-black tracking-wide">
              {authed ? `Hello, ${firstName}` : "Sign In"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Links Body */}
        <div className="flex-1 overflow-y-auto flex flex-col pb-6">

          {/* Section 1: Discover */}
          <div className="flex flex-col py-3">
            <Link to="/discover/trending" onClick={onClose} className="flex items-center gap-4 px-6 py-3.5 font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              <Flame size={20} className="text-orange-500" />
              Trending
            </Link>
            <Link to="/discover/bestsellers" onClick={onClose} className="flex items-center gap-4 px-6 py-3.5 font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              <Star size={20} className="text-yellow-500" />
              Bestsellers
            </Link>
            <Link to="/discover/new-releases" onClick={onClose} className="flex items-center gap-4 px-6 py-3.5 font-bold text-gray-700 hover:bg-gray-50 transition-colors">
              <Zap size={20} className="text-blue-500" />
              New Releases
            </Link>
          </div>

          <div className="border-t border-gray-100 mx-4"></div>

          {/* Section 2: Brands */}
          <div className="flex flex-col py-3">
            <h3 className="px-6 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Shop By Brand</h3>

            <Link
              to="/home/miniput"
              onClick={() => handleBrandClick("Miniput")}
              className={`flex items-center gap-4 px-6 py-3.5 font-bold transition-colors ${isActiveBrand("miniput") ? "bg-[var(--mk-sky)]/10 text-[var(--mk-navy)]" : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <div className="w-6 h-6 flex items-center justify-center bg-[var(--mk-sky)]/20 rounded-full border border-[var(--mk-sky)]/40 shrink-0">
                <img src={MiniputSign} alt="Miniput" className="w-4 h-4 object-contain" />
              </div>
              MINIPUT
            </Link>

            <Link
              to="/home/kwink"
              onClick={() => handleBrandClick("Kwink")}
              className={`flex items-center gap-4 px-6 py-3.5 font-bold transition-colors ${isActiveBrand("kwink") ? "bg-[var(--mk-green)]/10 text-[var(--mk-navy)]" : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <div className="w-6 h-6 flex items-center justify-center bg-[var(--mk-green)]/20 rounded-full border border-[var(--mk-green)]/40 shrink-0">
                <img src={KwinkSign} alt="Kwink" className="w-4 h-4 object-contain" />
              </div>
              KWINK
            </Link>
          </div>

          <div className="border-t border-gray-100 mx-4"></div>

          {/* Utility Links (Cart & Favorites) */}
          <div className="flex flex-col py-3">
            <h3 className="px-6 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Utility</h3>

            <Link
              to="/favorites"
              onClick={onClose}
              className={`flex items-center justify-between px-6 py-3.5 font-bold transition-colors ${isExactPath("/favorites") ? "bg-gray-100 text-[var(--mk-navy)]" : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center gap-4">
                <Heart size={20} className="text-gray-500" />
                Favorites
              </div>
              {favorites.length > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                  {favorites.length || 0}
                </span>
              )}
            </Link>

            <Link
              to="/orders"
              onClick={onClose}
              className={`flex items-center justify-between px-6 py-3.5 font-bold transition-colors ${isExactPath("/orders") ? "bg-gray-100 text-[var(--mk-navy)]" : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center gap-4">
                <ShoppingCart size={20} className="text-gray-500" />
                Your Orders
              </div>
            </Link>

            <Link
              to="/cart"
              onClick={onClose}
              className={`flex items-center justify-between px-6 py-3.5 font-bold transition-colors ${isExactPath("/cart") ? "bg-gray-100 text-[var(--mk-navy)]" : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <div className="flex items-center gap-4">
                <ShoppingCart size={20} className="text-gray-500" />
                Cart
              </div>
              {cartCount > 0 && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[var(--mk-red)] text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>


          <div className="border-t border-gray-100 mx-4"></div>

          {/* Section 3: Help & Settings */}
          <div className="flex flex-col py-3">
            <h3 className="px-6 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Help & Settings</h3>

            <button
              onClick={handleAccountClick}
              className="flex items-center gap-4 px-6 py-3.5 font-bold text-gray-700 hover:bg-gray-50 text-left w-full transition-colors"
            >
              <UserCircle size={20} className="text-gray-500" />
              Your Account
            </button>

            <Link
              to="/about"
              onClick={onClose}
              className={`flex items-center gap-4 px-6 py-3.5 font-bold transition-colors ${isExactPath("/about") ? "bg-gray-100 text-[var(--mk-navy)]" : "text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Info size={20} className="text-gray-500" />
              About Us
            </Link>

            <Link
              to="/terms"
              onClick={onClose}
              className={`flex items-center gap-4 px-6 py-3.5 font-bold transition-colors ${isExactPath("/terms") ? "bg-gray-100 text-[var(--mk-navy)]" : "text-gray-700 hover:bg-gray-50"}`}
            >
              <FileText size={20} className="text-gray-500" />
              Terms & Conditions
            </Link>

            {authed && (
              <button
                onClick={() => {
                  dispatch(logoutCustomer());
                  onClose();
                }}
                className="flex items-center gap-4 px-6 py-3.5 font-bold text-[var(--mk-red)] hover:bg-red-50 text-left w-full transition-colors"
              >
                <LogOut size={20} className="text-[var(--mk-red)]" />
                Sign Out
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Sidebar;

