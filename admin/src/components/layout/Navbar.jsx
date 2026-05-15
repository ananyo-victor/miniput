import React from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setAdminField } from "../../store/adminSlice";
import { clearAdminToken } from "../../utils/adminToken";
import MiniputSign from "../../../public/assests/MINIPUT_SIGN.png";
import KwinkSign from "../../../public/assests/kwink_SIGN.png";
import { setActiveBrand, setActiveCategory } from "../../store/homeSlice";

const navItems = [
  { label: "Miniput", path: "/home/miniput", brand: "Miniput" },
  { label: "Kwink", path: "/home/kwink", brand: "Kwink" },
  { label: "Inventory", path: "/inventory" },
  { label: "About", path: "/about" },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    clearAdminToken();
    dispatch(setAdminField({ key: "authed", value: false }));
    navigate("/");
  };

  const handleNavClick = (item) => {
    if (item.brand) {
      dispatch(setActiveBrand(item.brand));
      dispatch(setActiveCategory("all"));
    }

    navigate(item.path);
  };

  const isActive = (item) => {
    if (item.path === "/inventory") {
      return location.pathname === "/inventory";
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

  return (
    <div className="sticky top-0 z-50">
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/home/miniput" className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {!location.pathname.includes("kwink") && <img src={MiniputSign} alt="Miniput sign" className="h-10 w-auto object-contain" />}
            {!location.pathname.includes("miniput") && <img src={KwinkSign} alt="Kwink sign" className="h-10 w-auto object-contain" />}
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <button onClick={handleLogout} className="mk-pill bg-[var(--mk-navy)] text-white px-4 py-2 text-xs font-bold">
            LOGOUT
          </button>
        </div>
      </header>
      <div className="flex bg-white border-b border-gray-100 sticky top-[65px] z-40">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNavClick(item)}
            className={`flex-1 py-4 text-xs font-black tracking-widest border-b-2 transition ${isActive(item)
                ? "border-[var(--mk-yellow)] text-[var(--mk-navy)]"
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
