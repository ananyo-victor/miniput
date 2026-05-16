import React from "react";
import { ShoppingCart } from 'lucide-react';
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { setAdminField } from "../../store/adminSlice";
import { clearAdminToken } from "../../utils/adminToken";
import MiniputSign from "../../../public/assests/MINIPUT_SIGN.png";
import KwinkSign from "../../../public/assests/kwink_SIGN.png";
import { setActiveBrand, setActiveCategory } from "../../store/homeSlice";

const navItems = [
  { label: "Miniput", path: "/home/miniput", brand: "Miniput" },
  { label: "Kwink", path: "/home/kwink", brand: "Kwink" },
  { label: "Cart", path: "/cart" },
  { label: "About Us", path: "/about" },
];

const Navbar = () => {
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
    if (item.path === "/cart") {
      return location.pathname === "/cart";
    }

    if (item.path === "/about") {
      return location.pathname === "/about";
    }

    if (item.brand === "Miniput") {
      return location.pathname.includes("miniput");
    }

    if (item.brand === "Kwink") {
      return location.pathname.includes("kwink");
    }

    return false;
  };

  const getActiveBorderClass = (item) => {
    if (item.brand === "Miniput") return "border-[var(--mk-sky)]";
    if (item.brand === "Kwink") return "border-[var(--mk-green)]";
    if (item.path === "/cart") return "border-black";
    if (item.path === "/about") return "border-gray-200";
    return "border-[var(--mk-yellow)]";
  };

  return (
    <div className="sticky top-0 z-50">
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur px-4 sm:px-6 py-1 flex items-center justify-between">
        <Link to="/home/miniput" className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {!location.pathname.includes("kwink") && <img src={MiniputSign} alt="Miniput sign" className="h-10 sm:h-15 w-auto object-contain" />}
            {!location.pathname.includes("miniput") && <img src={KwinkSign} alt="Kwink sign" className="h-10 sm:h-15 w-auto object-contain" />}
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <ShoppingCart />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--mk-red)] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>
      <div className="flex bg-white border-b border-gray-100 sticky top-[65px] z-40">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNavClick(item)}
            className={`flex-1 py-4 text-xs font-black tracking-widest border-b-[3px] transition ${isActive(item)
              ? `${getActiveBorderClass(item)} text-[var(--mk-navy)]`
              : "border-transparent text-gray-400"
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
