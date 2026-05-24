import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { LogOut, User, ChevronDown } from "lucide-react";
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

const TopBar = () => {
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
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    clearAdminToken();
    dispatch(setAdminField({ key: "authed", value: false }));
    navigate("/");
  };

  const isHomePage = location.pathname === "/home" || location.pathname.startsWith("/home/") || location.pathname === "/miniput" || location.pathname === "/kwink";

  const handleWorkspaceSwitch = async (workspace) => {
    console.log("Switching to workspace:", workspace);
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
    <header className="bg-white text-[#0E2A4A] border-b border-gray-200 flex flex-col lg:flex-row items-center justify-between px-4 py-3 lg:py-0 lg:h-[72px] sticky top-0 z-[40] w-full gap-3 lg:gap-6">
      <div className="flex items-center justify-between w-full lg:w-auto lg:contents">
        <div className="flex items-center shrink-0 lg:w-[220px] relative" ref={dropdownRef}>
          <button
            type="button"
            className="px-3 py-1.5 rounded-xl flex items-center justify-between h-[40px] lg:h-[48px] cursor-pointer w-[180px] lg:w-full transition-colors hover:bg-gray-50 border border-gray-200"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="font-black text-sm truncate">{activeWorkspace?.name || "Workspace"}</span>
            <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[180px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 z-50">
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

        <div className="flex items-center gap-2 lg:gap-5 shrink-0 lg:order-3">
          <div className="flex flex-col items-end lg:items-start leading-tight cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
            <span className="text-[10px] lg:text-[11px] text-gray-500 font-semibold">Hello, {auth?.fullName || "Admin"}</span>
            <span className="text-[11px] lg:text-[13px] font-black text-[#0E2A4A] flex items-center gap-1">
              <User size={12} className="lg:hidden" /> Account
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 hover:bg-red-50 hover:text-red-600 text-gray-500 p-2 lg:px-3 lg:py-2 rounded-xl transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
            <span className="hidden lg:inline font-bold text-sm">Logout</span>
          </button>
        </div>
      </div>

      {isHomePage && (
        <div className="flex-1 w-full lg:max-w-3xl order-last lg:order-2">
          <div className="flex w-full rounded-2xl border border-gray-200 overflow-hidden focus-within:border-[#0E2A4A] focus-within:ring-2 focus-within:ring-[#0E2A4A]/10 transition-all bg-white shadow-sm h-[44px] lg:h-[48px]">

            <div className="relative hidden md:flex items-center bg-gray-50 border-r border-gray-200">
              <select
                value={activeCategory}
                onChange={(event) =>
                  dispatch(setActiveCategory(event.target.value))
                }
                className="appearance-none bg-transparent text-[#0E2A4A] text-sm font-semibold pl-4 pr-10 h-full outline-none cursor-pointer hover:bg-gray-100 transition-colors min-w-[180px]">
                {categoryOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    className="bg-white text-[#0E2A4A]"
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="flex-1 bg-transparent px-4 font-semibold text-gray-800 text-sm lg:text-base outline-none w-full placeholder:text-gray-400"/>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;
