import React from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { setActiveCategory } from "../../store/homeSlice";
import { Package, Info, Store, ShoppingBag } from "lucide-react";
import { getWorkspaceHomePath, isHomeRoute } from "../../utils/workspaceRouting";

const Navbar = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeWorkspace = useSelector((state) => state.user.activeWorkspace);

  const navItems = [
    { label: "Home", path: getWorkspaceHomePath(activeWorkspace?.slug), icon: Store, key: "home" },
    { label: "Orders", path: "/orders", icon: ShoppingBag, key: "orders" },
    { label: "Inventory", path: "/inventory", icon: Package, key: "inventory" },
    { label: "About", path: "/about", icon: Info, key: "about" },
  ];

  const handleNavClick = (item) => {
    if (item.key === "home") {
      dispatch(setActiveCategory("all"));
    }
    navigate(item.path);
    if (onNavigate) {
      onNavigate();
    }
  };

  const isActive = (item) => {
    if (item.key === "home") {
      return isHomeRoute(location.pathname);
    }
    return location.pathname === item.path;
  };

  return (
    <div className="flex flex-col gap-3 overflow-y-auto py-6 px-4">
      {navItems.map((item) => {
        const active = isActive(item);
        const Icon = item.icon;

        return (
          <button
            key={item.label}
            onClick={() => handleNavClick(item)}
            className={`flex items-center justify-start rounded-xl py-3.5 px-5 text-sm font-bold tracking-wide transition-all duration-200 ${active
              ? "bg-[#7dc1ca] text-white shadow-sm"
              : "text-[#0E2A4A] hover:bg-gray-50 hover:text-[#7dc1ca]"
              }`}
          >
            <Icon size={20} className="mr-4" strokeWidth={active ? 2.5 : 2} />
            <span>{item.label.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Navbar;
