import React from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { setAdminField } from "../../store/adminSlice";
import { clearAdminToken } from "../../utils/adminToken";
import MiniputLogo from "../../../public/assests/MINIPUT_LOGO.png";
import KwinkLogo from "../../../public/assests/kwink_LOGO.png";
import MiniputSign from "../../../public/assests/MINIPUT_SIGN.png";
import KwinkSign from "../../../public/assests/kwink_SIGN.png";

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
        <div className="flex items-center gap-2">
          <img src={MiniputSign} alt="Miniput sign" className="h-10 w-auto object-contain" />
          <img src={KwinkSign} alt="Kwink sign" className="h-10 w-auto object-contain" />
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
