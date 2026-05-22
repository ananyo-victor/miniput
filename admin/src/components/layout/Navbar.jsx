import React from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { setActiveCategory } from "../../store/homeSlice";
import { Package, Info, Store, ChevronLeft, Menu } from "lucide-react";

const Navbar = ({ isCollapsed, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeWorkspace } = useSelector((state) => state.workspace);

  const navItems = [
    { label: "Home", path: `/home/${activeWorkspace?.slug || "miniput"}`, icon: Store, key: "home" },
    { label: "Inventory", path: "/inventory", icon: Package, key: "inventory" },
    { label: "About", path: "/about", icon: Info, key: "about" },
  ];

  const handleNavClick = (item) => {
    if (item.key === "home") {
      dispatch(setActiveCategory("all"));
    }
    navigate(item.path);
  };

  const isActive = (item) => {
    if (item.key === "home") {
      return location.pathname.startsWith("/home/") || location.pathname === "/home" || location.pathname === "/miniput" || location.pathname === "/kwink";
    }
    if (item.path === "/inventory") return location.pathname === "/inventory";
    if (item.path === "/about") return location.pathname === "/about";
    return false;
  };

  return (
    <nav
      className={`z-40 flex flex-col bg-white transition-all duration-300 
        border-b border-gray-200 lg:border-b-0 lg:border-r lg:border-gray-200 lg:fixed lg:top-[72px] lg:bottom-0 lg:left-0 
        ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
    >
      <div className={`hidden lg:flex items-center border-b border-gray-100 ${isCollapsed ? "justify-center p-4" : "justify-between p-4"}`}>
        {!isCollapsed && <span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Navigation</span>}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-200 hover:text-[#0E2A4A] transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="flex overflow-x-auto lg:flex-col lg:py-4 lg:pr-4 lg:gap-1 mk-scroll-hidden">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              title={isCollapsed ? item.label : ""}
              className={`flex-1 flex items-center justify-center lg:justify-start py-3.5 text-xs font-black tracking-widest whitespace-nowrap transition-all duration-200
                border-b-2 lg:border-b-0 lg:rounded-r-xl lg:rounded-l-none
                ${isCollapsed ? "lg:px-0 lg:py-4 lg:justify-center lg:mx-auto lg:w-16 lg:rounded-xl" : "lg:px-5 lg:py-3.5"}
                ${
                  active
                    ? `border-[#0E2A4A] text-[#0E2A4A] lg:bg-[#f0f7f8] lg:border-l-4 lg:border-b-0`
                    : "border-transparent text-gray-500 lg:hover:bg-gray-50 lg:hover:text-[#0E2A4A] lg:border-l-4 lg:border-l-transparent lg:border-b-0"
                }
              `}
            >
              <Icon size={20} className={`hidden lg:block ${isCollapsed ? "lg:mx-auto" : "lg:mr-3"}`} strokeWidth={active ? 2.5 : 2} />
              <span className={`block ${isCollapsed ? "lg:hidden" : ""}`}>{item.label.toUpperCase()}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
