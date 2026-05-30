import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingCart, ChevronDown, Menu, User } from "lucide-react";
import MiniputSign from "../../assests/MINIPUT_SIGN.png";
import KwinkSign from "../../assests/kwink_SIGN.png";
import { setActiveCategory, setActiveBrand, setSearchQuery } from "../../store/homeSlice";
import { openAuthModal, openProfileModal } from "../../store/customerSlice"; // New imports

const CATEGORIES = [
  { label: "All Categories", value: "all" },
  { label: "T-Shirts", value: "tshirt" },
  { label: "Jeans/Pants", value: "jeans" },
  { label: "Jackets", value: "jacket" },
  { label: "Sets", value: "set" },
  { label: "Shorts", value: "shorts" }
];

const BrandIcon = ({ brand, className = "" }) => {
  const isMiniput = brand === "Miniput";
  const iconSrc = isMiniput ? MiniputSign : KwinkSign;
  const iconAlt = `${brand} sign`;

  return (
    <span
      className={`flex h-9 w-9 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-full border ${isMiniput
          ? "border-[var(--mk-sky)]/35 bg-[var(--mk-sky)]/15"
          : "border-[var(--mk-green)]/35 bg-[var(--mk-green)]/15"
        } ${className}`}
    >
      <img
        src={iconSrc}
        alt={iconAlt}
        className="h-7 w-7 lg:h-10 lg:w-10 object-contain"
      />
    </span>
  );
};

const Topbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  const cart = useSelector((state) => state.cart.items);
  const { authed, phone } = useSelector((state) => state.auth);
  const { name, profilePic } = useSelector((state) => state.customerAccount.profile);
  const activeCategory = useSelector((state) => state.home.activeCategory);
  const storedSearchQuery = useSelector((state) => state.home.searchQuery);

  const cartCount = cart.length
  const [searchInput, setSearchInput] = useState(storedSearchQuery);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isCartPage = location.pathname.includes("/cart");
  const isKwink = location.pathname.includes("kwink");
  const isMiniput = !isKwink && !isCartPage;
  const isOrderPage = location.pathname.includes("/order");
  const isAboutPage = location.pathname.includes("/about");
  const isProductDetailPage = location.pathname.includes("/product/");
  const hideSearchAndCategory = isCartPage || isOrderPage || isProductDetailPage || isAboutPage;

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
    setSearchInput(storedSearchQuery);
  }, [storedSearchQuery]);

  useEffect(() => {
    if (hideSearchAndCategory) {
      return;
    }

    const timer = window.setTimeout(() => {
      dispatch(setSearchQuery(searchInput));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [dispatch, hideSearchAndCategory, searchInput]);

  const handleCategorySelect = (value) => {
    dispatch(setActiveCategory(value));
    setIsDropdownOpen(false);

    if (!location.pathname.includes("/home")) {
      navigate(`/home/miniput`);
      dispatch(setActiveBrand("Miniput"));
    }
  };

  const handleBrandClick = (brand) => {
    dispatch(setActiveBrand(brand));
    dispatch(setActiveCategory("all"));
  };

  const selectedCategoryLabel = CATEGORIES.find(c => c.value === activeCategory)?.label || "All Categories";

  return (
    <div className="flex items-center justify-between px-3 lg:px-6 py-2 lg:py-3 bg-white border-b border-gray-100 sticky top-0 z-50 gap-2 lg:gap-4">
      {/* Left: Menu & Brand */}
      <div className="flex-shrink-0 flex items-center gap-2 lg:gap-4">
        <button
          onClick={onMenuClick}
          className="p-1.5 lg:p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>

        {isCartPage || isAboutPage ? (
          <div className="flex items-center gap-2 lg:gap-3">
            <Link
              to="/home/miniput"
              onClick={() => handleBrandClick("Miniput")}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <BrandIcon brand="Miniput" className="h-8 w-8 lg:h-10 lg:w-10" />
            </Link>
            <div className="w-[1px] lg:w-[1.5px] h-4 lg:h-6 bg-gray-200"></div>
            <Link
              to="/home/kwink"
              onClick={() => handleBrandClick("Kwink")}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <BrandIcon brand="Kwink" className="h-8 w-8 lg:h-10 lg:w-10" />
            </Link>
          </div>
        ) : (
          <>
            {isMiniput && (
              <Link to="/home/miniput" className="flex items-center gap-2">
                <BrandIcon brand="Miniput" />
              </Link>
            )}
            {isKwink && (
              <Link to="/home/kwink" className="flex items-center gap-2">
                <BrandIcon brand="Kwink" />
              </Link>
            )}
          </>
        )}
      </div>

      {/* Middle: Search Bar with Categories */}
      {!hideSearchAndCategory && (
        <div className="flex-1 max-w-2xl lg:mx-8 relative" ref={dropdownRef}>
          <div className="flex items-center w-full bg-white border border-[#0E2A4A]/20 rounded-xl focus-within:border-[var(--mk-navy)] transition-colors h-[38px] lg:h-[44px]">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="hidden md:flex items-center justify-between px-4 h-full text-[14px] text-gray-700 hover:bg-gray-50 rounded-l-xl border-r border-[#0E2A4A]/20 min-w-[160px]"
            >
              <span>{selectedCategoryLabel}</span>
              <ChevronDown size={16} className={`text-[#0E2A4A] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-3 lg:px-4 h-full text-[12px] lg:text-[14px] bg-transparent outline-none rounded-xl md:rounded-l-none md:rounded-r-xl text-gray-700 placeholder:text-gray-400 w-full"
            />
          </div>

          {isDropdownOpen && (
            <div className="hidden md:block absolute top-full left-0 mt-1.5 w-[220px] bg-white border border-gray-100 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] py-2 z-50">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategorySelect(cat.value)}
                  className={`w-full flex items-center justify-between px-5 py-3 text-[14px] hover:bg-[#f8f9fa] transition-colors ${activeCategory === cat.value ? "text-[var(--mk-navy)] bg-[#f8f9fa]" : "text-gray-700"
                    }`}
                >
                  <span>{cat.label}</span>
                  {activeCategory === cat.value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--mk-navy)]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Right side: Login & Cart */}
      <div className="flex-shrink-0 flex justify-end items-center gap-2 lg:gap-5">

        {/* User Login/Profile Widget */}
        {authed ? (
          <div
            onClick={() => dispatch(openProfileModal())}
            // ⬇️ CHANGED: Removed "hidden sm:flex" and replaced with "flex"
            className="flex items-center gap-1.5 lg:gap-2 cursor-pointer hover:bg-gray-50 p-1 lg:p-1.5 rounded-xl transition-colors"
          >
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-7 h-7 lg:w-8 lg:h-8 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-gray-100 flex items-center justify-center text-[var(--mk-navy)] border border-gray-200">
                <User size={16} className="lg:w-[18px] lg:h-[18px]" />
              </div>
            )}
            <div className="flex flex-col text-left mr-0.5 lg:mr-1">
              <span className="text-[9px] lg:text-[10px] text-gray-500 leading-none mb-0.5">Hello,</span>
              <span className="text-[11px] lg:text-sm font-black text-[var(--mk-navy)] leading-none truncate max-w-[65px] lg:max-w-[100px]">
                {name || phone}
              </span>
            </div>
          </div>
        ) : (
          <button
            onClick={() => dispatch(openAuthModal())}
            className="flex items-center justify-center p-2 lg:p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-700"
            title="Login"
          >
            <User className="size-5 md:size-7" />
          </button>
        )}

        {/* Divider */}
        {/* ⬇️ CHANGED: Removed "hidden sm:block" so it shows on mobile too */}
        <div className="w-[1px] h-6 lg:h-8 bg-gray-200 mx-1 lg:mx-0"></div>

        <Link to="/cart" className="relative p-2 lg:p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-700">
          <svg className="size-5 md:size-7" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M24-16C10.7-16 0-5.3 0 8S10.7 32 24 32l45.3 0c3.9 0 7.2 2.8 7.9 6.6l52.1 286.3c6.2 34.2 36 59.1 70.8 59.1L456 384c13.3 0 24-10.7 24-24s-10.7-24-24-24l-255.9 0c-11.6 0-21.5-8.3-23.6-19.7l-5.1-28.3 303.6 0c30.8 0 57.2-21.9 62.9-52.2L568.9 69.9C572.6 50.2 557.5 32 537.4 32l-412.7 0-.4-2c-4.8-26.6-28-46-55.1-46L24-16zM208 512a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm224 0a48 48 0 1 0 0-96 48 48 0 1 0 0 96z" /></svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 lg:-top-1.5 lg:-right-1.5 bg-[var(--mk-red)] text-white text-[9px] lg:text-[10px] font-bold w-4 h-4 lg:w-5 lg:h-5 rounded-full flex items-center justify-center border-2 border-white">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
};

export default Topbar;
