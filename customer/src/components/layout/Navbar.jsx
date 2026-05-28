import React from "react";
import { ShoppingCart, Menu } from 'lucide-react';
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import MiniputSign from "../../assests/MINIPUT_SIGN.png";
import KwinkSign from "../../assests/kwink_SIGN.png";
import { setActiveBrand, setActiveCategory } from "../../store/homeSlice";

const navItems = [
  { label: "Miniput", path: "/home/miniput", brand: "Miniput" },
  { label: "Kwink", path: "/home/kwink", brand: "Kwink" },
];

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.customer.cart);
  const cartCount = cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);

  const handleNavClick = (item) => {
    if (item.brand) {
      dispatch(setActiveBrand(item.brand));
      dispatch(setActiveCategory("all"));
    }
    navigate(item.path);
  };

  const isActive = (item) => {
    if (item.brand === "Miniput") return location.pathname.includes("miniput");
    if (item.brand === "Kwink") return location.pathname.includes("kwink");
    return false;
  };

  const getActiveBorderClass = (item) => {
    if (item.brand === "Miniput") return "border-[var(--mk-sky)]";
    if (item.brand === "Kwink") return "border-[var(--mk-green)]";
    return "border-[var(--mk-yellow)]";
  };

  return (
    <div className="sticky top-0 lg:static z-40">
      {/* Mobile header visible only on smaller screens */}
      <header className="lg:hidden border-b border-gray-100 bg-white/95 backdrop-blur px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="p-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          
          {!location.pathname.includes("kwink") && (
            <Link to="/home/miniput" className="flex items-center">
              <img src={MiniputSign} alt="Miniput sign" className="h-10 w-auto object-contain" />
            </Link>
          )}
          {!location.pathname.includes("miniput") && (
            <Link to="/home/kwink" className="flex items-center">
              <img src={KwinkSign} alt="Kwink sign" className="h-10 w-auto object-contain" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--mk-red)] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Navigation tabs remain visible on all screens (Now just Brands) */}
      <div className="flex bg-white border-b border-gray-100 sticky top-[57px] lg:top-[73px] z-40 shadow-sm">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNavClick(item)}
            className={`flex-1 py-4 text-xs font-black tracking-widest border-b-[3px] transition ${
              isActive(item)
                ? `${getActiveBorderClass(item)} text-[var(--mk-navy)]`
                : "border-transparent text-gray-400 hover:bg-gray-50"
            }`}
          >
            {item.label.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navbar;