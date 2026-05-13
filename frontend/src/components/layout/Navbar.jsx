import React from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";

const Navbar = () => {
  const cart = useSelector((state) => state.customer.cart);
  const cartCount = cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between">
      <Link to="/customer/shop" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[var(--mk-navy)] rounded-lg flex items-center justify-center text-white font-black italic text-xl">K</div>
        <div>
          <p className="mk-bebas mk-brand-gradient text-2xl tracking-wider leading-none">MINIPUT</p>
          <p className="text-[10px] font-black text-[var(--mk-navy)] tracking-[0.2em]">KIDS X KWINK</p>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <Link to="/customer/cart" className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
          <span className="text-xl">Cart</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[var(--mk-red)] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;