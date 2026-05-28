import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingCart, ChevronDown, Menu } from "lucide-react";
import MiniputSign from "../../assests/MINIPUT_SIGN.png";
import KwinkSign from "../../assests/kwink_SIGN.png";
import { setActiveCategory } from "../../store/homeSlice";

const CATEGORIES = [
  { label: "All Categories", value: "all" },
  { label: "T-Shirts", value: "tshirt" },
  { label: "Jeans/Pants", value: "jeans" },
  { label: "Jackets", value: "jacket" },
  { label: "Sets", value: "set" },
  { label: "Shorts", value: "shorts" }
];

const Topbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  const cart = useSelector((state) => state.customer.cart);
  const activeCategory = useSelector((state) => state.home.activeCategory);
  
  const cartCount = cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isKwink = location.pathname.includes("kwink");
  const isMiniput = !isKwink; 

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategorySelect = (value) => {
    dispatch(setActiveCategory(value));
    setIsDropdownOpen(false);
    
    if (!location.pathname.includes("/home")) {
      navigate(`/home/${isMiniput ? "miniput" : "kwink"}`);
    }
  };

  const selectedCategoryLabel = CATEGORIES.find(c => c.value === activeCategory)?.label || "All Categories";

  return (
    <div className="hidden lg:flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Left side: Hamburger + Active Brand Logo */}
      <div className="flex-shrink-0 w-52 flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        {isMiniput && (
          <Link to="/home/miniput" className="flex items-center gap-2">
            <img src={MiniputSign} alt="Miniput sign" className="h-12 w-auto object-contain" />
          </Link>
        )}
        {isKwink && (
          <Link to="/home/kwink" className="flex items-center gap-2">
            <img src={KwinkSign} alt="Kwink sign" className="h-12 w-auto object-contain" />
          </Link>
        )}
      </div>

      {/* Middle: Search Bar with Categories */}
      <div className="flex-1 max-w-2xl mx-8 relative" ref={dropdownRef}>
        <div className="flex items-center w-full bg-white border border-[#0E2A4A]/20 rounded-xl focus-within:border-[var(--mk-navy)] transition-colors">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between px-4 py-2.5 text-[14px] text-gray-700 hover:bg-gray-50 rounded-l-xl border-r border-[#0E2A4A]/20 min-w-[160px]"
          >
            <span>{selectedCategoryLabel}</span>
            <ChevronDown size={16} className={`text-[#0E2A4A] transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-4 py-2.5 text-[14px] bg-transparent outline-none rounded-r-xl text-gray-700 placeholder:text-gray-400"
          />
        </div>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-[220px] bg-white border border-gray-100 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] py-2 z-50">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategorySelect(cat.value)}
                className={`w-full flex items-center justify-between px-5 py-3 text-[14px] hover:bg-[#f8f9fa] transition-colors ${
                  activeCategory === cat.value ? "text-[var(--mk-navy)] bg-[#f8f9fa]" : "text-gray-700"
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

      {/* Right side: Cart Option */}
      <div className="flex-shrink-0 w-52 flex justify-end items-center">
        <Link to="/cart" className="relative p-2.5 bg-gray-100 rounded-full hover:bg-gray-200 transition text-gray-700">
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[var(--mk-red)] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
};

export default Topbar;