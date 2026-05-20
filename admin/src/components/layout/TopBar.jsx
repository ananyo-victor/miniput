import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Search, LogOut, User, ChevronDown } from "lucide-react";
import { clearAdminToken, getAdminAuthFromStorage } from "../../utils/adminToken";
import { setAdminField } from "../../store/adminSlice";
import { setActiveBrand, setActiveCategory } from "../../store/homeSlice";
import MiniputLogo from "../../assests/MINIPUT_LOGO.png";
import KwinkLogo from "../../assests/kwink_LOGO.png";

const TopBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeBrand } = useSelector((state) => state.home);
  const auth = getAdminAuthFromStorage();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    clearAdminToken();
    dispatch(setAdminField({ key: "authed", value: false }));
    navigate("/");
  };

  const isKwink = location.pathname.includes("kwink") || activeBrand === "Kwink";

  const handleBrandSwitch = (brand) => {
    dispatch(setActiveBrand(brand));
    dispatch(setActiveCategory("all"));
    setIsDropdownOpen(false);

    if (location.pathname === "/inventory") {
      return;
    }

    navigate(`/home/${brand.toLowerCase()}`);
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

  return (
    // UPDATED: Changed background to white, text to navy, added bottom border
    <header className="bg-white text-[#0E2A4A] border-b border-gray-200 flex flex-col lg:flex-row items-center justify-between px-4 py-3 lg:py-0 lg:h-[72px] sticky top-0 z-[60] w-full gap-3 lg:gap-6">
      
      <div className="flex items-center justify-between w-full lg:w-auto lg:contents">
        
        {/* Left: Branding with Dropdown */}
        <div className="flex items-center shrink-0 lg:w-[200px] relative" ref={dropdownRef}>
          {/* UPDATED: Removed white background box, integrated seamlessly */}
          <div 
            className="px-2 py-1.5 rounded-xl flex items-center justify-between h-[40px] lg:h-[48px] cursor-pointer w-[140px] lg:w-full transition-colors hover:bg-gray-50" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img 
              src={isKwink ? KwinkLogo : MiniputLogo} 
              alt={isKwink ? "Kwink" : "Miniput"} 
              className="h-full w-auto object-contain max-w-[80%]"
            />
            <ChevronDown 
              size={18} 
              className={`text-gray-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} 
            />
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-full min-w-[150px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 z-50">
              <button
                onClick={() => handleBrandSwitch("Miniput")}
                className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center justify-between transition-colors ${
                  !isKwink ? "bg-[#f0f7f8] text-[#0E2A4A]" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Miniput Kids
                {!isKwink && <div className="w-2 h-2 rounded-full bg-[#FFB800]"></div>}
              </button>
              <button
                onClick={() => handleBrandSwitch("Kwink")}
                className={`w-full text-left px-4 py-3 text-sm font-bold flex items-center justify-between transition-colors ${
                  isKwink ? "bg-[#f0f7f8] text-[#0E2A4A]" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Kwink
                {isKwink && <div className="w-2 h-2 rounded-full bg-[#83a963]"></div>}
              </button>
            </div>
          )}
        </div>

        {/* Right: User Info & Logout */}
        <div className="flex items-center gap-2 lg:gap-5 shrink-0 lg:order-3">
          <div className="flex flex-col items-end lg:items-start leading-tight cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
            {/* UPDATED: Text colors to match the light theme */}
            <span className="text-[10px] lg:text-[11px] text-gray-500 font-semibold">Hello, {auth?.userId || 'Admin'}</span>
            <span className="text-[11px] lg:text-[13px] font-black text-[#0E2A4A] flex items-center gap-1">
              <User size={12} className="lg:hidden"/> Account
            </span>
          </div>
          
          {/* UPDATED: Logout button to match light theme */}
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

      {/* Middle: Search Bar */}
      <div className="flex-1 w-full lg:max-w-3xl order-last lg:order-2">
        {/* UPDATED: Search bar with subtle border, matching corners, and a Navy button for better symmetry */}
        <div className="flex w-full rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#0E2A4A] focus-within:ring-1 focus-within:ring-[#0E2A4A] transition-all bg-gray-50 h-[40px] lg:h-[44px]">
          <select className="bg-transparent text-gray-600 text-xs lg:text-sm font-semibold px-2 lg:px-3 outline-none border-r border-gray-200 hidden md:block cursor-pointer hover:bg-gray-100">
            <option>All Categories</option>
            <option>Shirts</option>
            <option>Pants</option>
            <option>Sets</option>
          </select>
          <input 
            type="text" 
            placeholder="Search products..." 
            className="flex-1 bg-transparent px-3 lg:px-4 py-2 text-gray-800 text-sm lg:text-base outline-none w-full placeholder:text-gray-400"
          />
          {/* <button className="bg-[#0E2A4A] hover:bg-[#1a3d6e] px-4 lg:px-6 flex items-center justify-center transition-colors text-white">
            <Search size={18} strokeWidth={2.5} />
          </button> */}
        </div>
      </div>

    </header>
  );
};

export default TopBar;
