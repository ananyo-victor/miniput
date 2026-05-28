import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, User, ChevronDown, Menu } from "lucide-react";
import { clearAdminToken, getAdminAuthFromStorage } from "../../utils/adminToken";
import { setActiveCategory, setSearchQuery } from "../../store/homeSlice";
import { setActiveWorkspaceLocal, updateActiveWorkspaceThunk } from "../../store/userSlice";
import { setAdminField } from "../../store/authSlice";

const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "tshirt", label: "T-Shirts" },
  { value: "jeans", label: "Jeans/Pants" },
  { value: "jacket", label: "Jackets" },
  { value: "set", label: "Sets" },
  { value: "shorts", label: "Shorts" }
];

const TopBar = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const auth = getAdminAuthFromStorage();
  const workspaces = useSelector((state) => state.workspace.items);
  const activeWorkspace = useSelector((state) => state?.user?.activeWorkspace ?? null);
  const activeCategory = useSelector((state) => state.home.activeCategory);
  const searchQuery = useSelector((state) => state.home.searchQuery);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [showCategories, setShowCategories] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    clearAdminToken();
    dispatch(setAdminField({ key: "authed", value: false }));
    navigate("/");
  };

  const isHomePage = location.pathname === "/home" || location.pathname.startsWith("/home/") || location.pathname === "/miniput" || location.pathname === "/kwink";

  const selectedCategory = categoryOptions.find((item) => item.value === activeCategory) || categoryOptions[0];

  const handleWorkspaceSwitch = async (workspace) => {
    dispatch(setActiveWorkspaceLocal(workspace));
    dispatch(setActiveCategory("all"));
    dispatch(setSearchQuery(""));
    setSearchInput("");

    if (auth?.userId) {
      dispatch(
        updateActiveWorkspaceThunk({
          id: auth.userId,
          workspaceId: workspace.id,
        })
      );
    }

    setIsDropdownOpen(false);

    if (location.pathname !== "/inventory") {
      navigate(`/home/${workspace.slug}`);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!isHomePage) {
      return;
    }

    const timer = window.setTimeout(() => {
      dispatch(setSearchQuery(searchInput));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [dispatch, isHomePage, searchInput]);

  return (
    <header className="bg-white text-[#0E2A4A] border-b border-gray-200 flex flex-row items-center justify-between px-2 md:px-4 h-[60px] lg:h-[72px] sticky top-0 z-50 w-full gap-2 lg:gap-6">
      
      {/* LEFT SECTION: Hamburger Menu (Mobile) / Workspace Switcher (Desktop) */}
      <div className="flex items-center shrink-0 relative lg:w-[220px]" ref={dropdownRef}>
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 md:p-2 text-[#0E2A4A] hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={24} strokeWidth={2.5} />
        </button>

        {/* Desktop Workspace Switcher (Hidden on Mobile) */}
        <button
          type="button"
          className="hidden lg:flex px-3 py-1.5 rounded-xl items-center justify-between h-[48px] cursor-pointer w-full transition-colors hover:bg-gray-50 border border-gray-200"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span className="font-black text-sm truncate">{activeWorkspace?.name || "Workspace"}</span>
          <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Desktop Dropdown */}
        {isDropdownOpen && (
          <div className="hidden lg:block absolute top-full left-0 mt-2 w-full min-w-[180px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 z-50">
            {workspaces.map((workspace) => {
              const isActive = workspace.id === activeWorkspace?.id;
              return (
                <button
                  key={workspace.id}
                  onClick={() => handleWorkspaceSwitch(workspace)}
                  className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center justify-between transition-colors ${isActive ? "bg-[#f0f7f8] text-[#0E2A4A]" : "text-gray-600 hover:bg-gray-50"
                    }`}
                >
                  <span className="truncate">{workspace.name}</span>
                  {isActive && <div className="w-2 h-2 rounded-full bg-[#0E2A4A]"></div>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* MIDDLE SECTION: Search Bar */}
      {isHomePage && (
        <div className="flex-1 w-full lg:max-w-3xl">
          <div className="flex w-full rounded-xl lg:rounded-2xl border border-gray-200 overflow-visible focus-within:border-[#0E2A4A] focus-within:ring-2 focus-within:ring-[#0E2A4A]/10 transition-all bg-white shadow-sm h-[38px] lg:h-[48px]">

            {/* Category Dropdown (Hidden on Mobile) */}
            <div className="relative hidden md:flex items-center bg-gray-50 border-r border-gray-200 min-w-[190px] rounded-l-2xl">
              <button
                onClick={() => setShowCategories((prev) => !prev)}
                className="w-full h-full flex items-center justify-between px-4 text-sm font-semibold text-[#0E2A4A] hover:bg-gray-100 transition-colors rounded-l-2xl"
              >
                <span>{selectedCategory?.label}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${showCategories ? "rotate-180" : ""}`}
                />
              </button>
              {showCategories && (
                <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
                  {categoryOptions.map((option) => {
                    const isActive = activeCategory === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          dispatch(setActiveCategory(option.value));
                          setShowCategories(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm font-semibold transition-all flex items-center justify-between ${isActive ? "bg-[#f0f7f8] text-[#0E2A4A]" : "text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {option.label}
                        {isActive && <div className="w-2 h-2 rounded-full bg-[#0E2A4A]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="flex-1 bg-transparent px-3 lg:px-4 font-semibold text-gray-800 text-xs lg:text-base outline-none w-full placeholder:text-gray-400 rounded-xl lg:rounded-r-2xl" 
            />
          </div>
        </div>
      )}

      {/* RIGHT SECTION: User Profile & Desktop Logout */}
      <div className="flex items-center shrink-0 lg:gap-2">
        <div className="flex space-x-1 md:space-x-2 items-center leading-tight hover:bg-[#f0f7f8] p-1 md:p-2 lg:p-3 rounded-xl transition-colors">
          <User className="size-5 lg:size-6" />
          <div className="flex flex-col items-start ml-0.5 md:ml-0">
            <span className="block text-[10px] lg:text-[12px] text-gray-500 font-semibold leading-none mb-[2px]">Hello,</span>
            <span className="flex text-[11px] lg:text-[15px] font-black text-[#0E2A4A] items-center gap-1 leading-none">{auth?.fullName || "Admin"}</span>
          </div>
        </div>

        {/* RESTORED: Desktop Logout Button (Hidden on Mobile) */}
        <button
          onClick={handleLogout}
          className="hidden lg:flex items-center gap-1.5 hover:bg-red-50 hover:text-red-600 text-gray-500 p-2 lg:px-3 lg:py-2 rounded-xl transition-colors"
          title="Logout"
        >
          <LogOut size={18} />
          <span className="font-bold text-sm">Logout</span>
        </button>
      </div>

    </header>
  );
};

export default TopBar;