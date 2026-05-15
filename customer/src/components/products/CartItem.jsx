import React from "react";

const Button = ({ 
  children, 
  onClick, 
  type = "button", 
  variant = "primary", // primary, secondary, outline, danger, ghost, brand
  size = "md",      
  className = "", 
  disabled = false,
  isLoading = false,
  icon: Icon = null 
}) => {

  const baseStyles = "inline-flex items-center justify-center font-extrabold tracking-wide transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed uppercase font-['Nunito']";

  const variants = {
    // Custom Brand Styles from Source 9
    primary: "bg-[#0E2A4A] text-white hover:bg-[#1a3d6e] shadow-md",
    secondary: "bg-[#FFB800] text-[#0E2A4A] hover:bg-[#e6a600]",
    brand: "bg-[#25D366] text-white hover:bg-[#1aab52]", // WhatsApp Green
    outline: "bg-transparent border-2 border-[#0E2A4A] text-[#0E2A4A] hover:bg-[#0E2A4A] hover:text-white",
    danger: "bg-[#D63031] text-white hover:bg-red-700",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100"
  };

  const sizes = {
    sm: "px-4 py-2 text-[10px] rounded-lg gap-1.5",
    md: "px-6 py-3.5 text-xs rounded-xl gap-2",
    lg: "px-8 py-4 text-sm rounded-2xl gap-2.5",
    xl: "px-10 py-5 text-base rounded-2xl gap-3"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {isLoading ? (
        <span className="animate-spin mr-2">✦</span>
      ) : (
        <>
          {Icon && <Icon className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;