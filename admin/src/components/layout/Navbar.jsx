import React from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setAdminField } from "../../store/adminSlice";
import { clearAdminToken } from "../../utils/adminToken";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    clearAdminToken();
    dispatch(setAdminField({ key: "authed", value: false }));
    navigate("/admin");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between">
      <Link to="/admin/inventory" className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[var(--mk-navy)] rounded-lg flex items-center justify-center text-white font-black italic text-xl">A</div>
        <div>
          <p className="mk-bebas mk-brand-gradient text-2xl tracking-wider leading-none">MINIPUT ADMIN</p>
          <p className="text-[10px] font-black text-[var(--mk-navy)] tracking-[0.2em]">INVENTORY CONTROL</p>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <button onClick={handleLogout} className="mk-pill bg-[var(--mk-navy)] text-white px-4 py-2 text-xs font-bold">
          LOGOUT
        </button>
      </div>
    </header>
  );
};

export default Navbar;