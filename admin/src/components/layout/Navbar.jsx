import React from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { setActiveCategory } from "../../store/homeSlice";
import { Package, Info, Store, ShoppingBag, UserCog, LayoutDashboard } from "lucide-react"; 
import { getWorkspaceHomePath, isHomeRoute } from "../../utils/workspaceRouting";

const Navbar = ({ onNavigate, isCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeWorkspace = useSelector((state) => state.user.activeWorkspace);

  // Grouped Navigation Items
  const navGroups = [
    {
      title: "MAIN",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, key: "dashboard" },
        { label: "Home", path: getWorkspaceHomePath(activeWorkspace?.slug), icon: Store, key: "home" },
        { label: "Orders", path: "/orders", icon: ShoppingBag, key: "orders" },
        { label: "Inventory", path: "/inventory", icon: Package, key: "inventory" },
      ]
    },
    {
      title: "HELP & SETTINGS",
      items: [
        { label: "Account Settings", path: "/settings", icon: UserCog, key: "settings" }, // New Link
        { label: "About", path: "/about", icon: Info, key: "about" },
      ]
    }
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
    <div className="flex flex-col gap-6 overflow-y-auto py-4 px-3">
      {navGroups.map((group, index) => (
        <div key={group.title} className="flex flex-col gap-2">
          
          {/* Section Heading & Divider */}
          {!isCollapsed ? (
            <div className={`px-4 text-[11px] font-black tracking-widest text-gray-400 uppercase ${
              index !== 0 ? 'mt-2 border-t border-gray-100 pt-6' : 'pt-2'
            }`}>
              {group.title}
            </div>
          ) : (
            // Show only a divider when collapsed (except for the first item)
            index !== 0 && <div className="border-t border-gray-100 mx-3 mt-2 pt-4"></div>
          )}

          {/* Navigation Links inside the section */}
          <div className="flex flex-col gap-1.5">
            {group.items.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  title={isCollapsed ? item.label : ""} // Shows label on hover when collapsed
                  className={`flex items-center ${
                    isCollapsed ? "justify-center px-0 mx-2" : "justify-start px-4 mx-0"
                  } rounded-xl py-3 text-sm font-bold tracking-wide transition-all duration-200 ${
                    active
                      ? "bg-[#7dc1ca] text-white shadow-sm"
                      : "text-[#0E2A4A] hover:bg-gray-50 hover:text-[#7dc1ca]"
                  }`}
                >
                  <Icon
                    size={20}
                    className={isCollapsed ? "mx-auto" : "mr-4"}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  {/* Render text if not collapsed */}
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Navbar;