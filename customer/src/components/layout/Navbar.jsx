import React from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setActiveBrand, setActiveCategory } from "../../store/homeSlice";

const navItems = [
  { label: "Miniput", path: "/home/miniput", brand: "Miniput" },
  { label: "Kwink", path: "/home/kwink", brand: "Kwink" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isHiddenRoute = 
    location.pathname.includes("/cart") || 
    location.pathname.includes("/product") || 
    location.pathname.includes("/order") ||
    location.pathname.includes("/discover") ||
    location.pathname.includes("/terms");

  if (isHiddenRoute) {
    return null;
  }

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
    <div className="sticky top-[54px] lg:static z-40">
      <div className="flex bg-white border-b border-gray-100 sticky top-[54px] lg:top-[73px] z-40 shadow-sm">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNavClick(item)}
            className={`flex-1 py-3 lg:py-4 text-xs font-black tracking-widest border-b-[3px] transition ${
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