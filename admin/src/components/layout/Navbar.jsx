import React from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { setActiveCategory } from "../../store/homeSlice";
import { setActiveWorkspaceLocal, updateActiveWorkspaceThunk } from "../../store/userSlice";
import { clearAdminToken, getAdminAuthFromStorage } from "../../utils/adminToken";
import { setAdminField } from "../../store/authSlice";
import { Package, Info, Store, ChevronLeft, Menu, X, LogOut, ShoppingBag } from "lucide-react";
import MiniputSign from "../../assests/MINIPUT_SIGN.png";
import KwinkSign from "../../assests/kwink_SIGN.png";

const Navbar = ({ isCollapsed, toggleSidebar, isMobileMenuOpen, closeMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeWorkspace = useSelector((state) => state.user.activeWorkspace);
  const workspaces = useSelector((state) => state.workspace.items);
  const auth = getAdminAuthFromStorage();

  const navItems = [
    { label: "Home", path: `/home/${activeWorkspace?.slug || "miniput"}`, icon: Store, key: "home", desktopOnly: true },
    { label: "Orders", path: "/orders", icon: ShoppingBag, key: "orders" },
    { label: "Inventory", path: "/inventory", icon: Package, key: "inventory" },
    { label: "About", path: "/about", icon: Info, key: "about" },
  ];

  const handleNavClick = (item) => {
    if (item.key === "home") {
      dispatch(setActiveCategory("all"));
    }
    navigate(item.path);
  };

  const handleWorkspaceSwitch = (workspace) => {
    dispatch(setActiveWorkspaceLocal(workspace));
    dispatch(setActiveCategory("all"));
    
    if (auth?.userId) {
      dispatch(
        updateActiveWorkspaceThunk({
          id: auth.userId,
          workspaceId: workspace.id,
        })
      );
    }

    const shouldStayOnCurrentPage =
      location.pathname === "/inventory" || location.pathname === "/about";

    if (!shouldStayOnCurrentPage) {
      navigate(`/home/${workspace.slug}`);
    }
    if (closeMobileMenu) closeMobileMenu();
  };

  const handleLogout = () => {
    clearAdminToken();
    dispatch(setAdminField({ key: "authed", value: false }));
    navigate("/");
  };

  const isActive = (item) => {
    if (item.key === "home") {
      return location.pathname.startsWith("/home/") || location.pathname === "/home" || location.pathname === "/miniput" || location.pathname === "/kwink";
    }
    if (item.path === "/inventory") return location.pathname === "/inventory";
    if (item.path === "/orders") return location.pathname === "/orders";
    if (item.path === "/about") return location.pathname === "/about";
    return false;
  };

  return (
    <>
      {/* Mobile Dark Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[60] lg:hidden transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* Side Navigation Panel */}
      <nav
        className={`fixed top-0 left-0 h-full bg-white z-[70] transition-transform duration-300 w-64 lg:z-40 lg:top-[72px] lg:bottom-0 lg:border-r lg:border-gray-200 flex flex-col
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        `}
      >
        {/* Mobile Header (Shown on small screens) */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 lg:hidden shrink-0">
          <span className="text-xl font-black text-[#0E2A4A] tracking-wider uppercase">Menu</span>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Desktop Header (Shown on large screens) */}
        <div className={`hidden lg:flex items-center border-b border-gray-100 shrink-0 ${isCollapsed ? "justify-center p-4" : "justify-between p-4"}`}>
          {!isCollapsed && <span className="font-bold text-xs text-gray-400 uppercase tracking-widest">Navigation</span>}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-200 hover:text-[#0E2A4A] transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-col py-6 px-4 gap-3 overflow-y-auto flex-1">

          {/* MOBILE ONLY: Workspace switchers replacing 'Home' */}
          <div className="flex flex-col gap-3 lg:hidden mb-1">
            {workspaces.map((workspace) => {
              const isMiniput = workspace.slug.toLowerCase() === 'miniput';
              const iconSrc = isMiniput ? MiniputSign : KwinkSign;
              
              const active = 
                location.pathname.includes(`/home/${workspace.slug}`) || 
                (activeWorkspace?.id === workspace.id && (location.pathname === "/home" || location.pathname.startsWith("/home/")));
              
              return (
                <button
                  key={workspace.id}
                  onClick={() => handleWorkspaceSwitch(workspace)}
                  className={`flex items-center py-3.5 px-5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 justify-start ${
                    active
                      ? "bg-[#7dc1ca] text-white shadow-sm"
                      : "text-[#0E2A4A] hover:bg-gray-50 hover:text-[#7dc1ca]"
                  }`}
                >
                  <img 
                    src={iconSrc} 
                    alt={workspace.name} 
                    className="w-5 h-5 mr-4 object-contain"
                    style={{ filter: active ? 'brightness(0) invert(1)' : 'none' }} 
                  />
                  <span>{workspace.name.toUpperCase()}</span>
                </button>
              );
            })}
          </div>

          {/* STANDARD LINKS */}
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            
            return (
              <button
                key={item.label}
                onClick={() => {
                  handleNavClick(item);
                  if (closeMobileMenu) closeMobileMenu();
                }}
                title={isCollapsed ? item.label : ""}
                className={`
                  ${item.desktopOnly ? 'hidden lg:flex' : 'flex'}
                  items-center py-3.5 px-5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200
                  ${isCollapsed ? "lg:justify-center lg:px-0" : "justify-start"}
                  ${
                    active
                      ? "bg-[#7dc1ca] text-white shadow-sm" // Matches UI image active color
                      : "text-[#0E2A4A] hover:bg-gray-50 hover:text-[#7dc1ca]"
                  }
                `}
              >
                <Icon size={20} className={`${isCollapsed ? "lg:mx-auto" : "mr-4"}`} strokeWidth={active ? 2.5 : 2} />
                <span className={`block ${isCollapsed ? "lg:hidden" : ""}`}>{item.label.toUpperCase()}</span>
              </button>
            );
          })}
        </div>

        {/* LOGOUT BUTTON AT THE BOTTOM (Mobile Only) */}
        <div className="lg:hidden p-4 border-t border-gray-100 shrink-0">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full py-3.5 px-5 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 text-red-500 hover:bg-red-50 hover:text-red-600 justify-start`}
          >
            <LogOut size={20} className="mr-4" strokeWidth={2.5} />
            <span className="block">LOGOUT</span>
          </button>
        </div>

      </nav>
    </>
  );
};

export default Navbar;
