import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { setAdminField } from "../../store/adminSlice";

const AdminAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userId, password, otp, authStep } = useSelector((state) => state.admin);

  const update = (key, value) => {
    dispatch(setAdminField({ key, value }));
  };

  const handleNext = (event) => {
    event.preventDefault();

    if (authStep < 3) {
      update("authStep", authStep + 1);
      return;
    }

    update("authed", true);
    navigate("/admin/inventory");
  };

  const handleBack = () => {
    update("authStep", authStep - 1);
  };

  return (
    <div className="min-h-screen bg-[var(--mk-bg)] grid md:grid-cols-[44%_56%]">
      <section className="bg-[var(--mk-yellow)] p-8 md:p-10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-[radial-gradient(circle_at_20%_25%,#0e2a4a_0,transparent_38%),radial-gradient(circle_at_80%_70%,#e85a1d_0,transparent_34%)]" />
        </div>
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <p className="mk-bebas text-6xl leading-none mk-brand-gradient">MINIPUT</p>
            <p className="text-xs font-black tracking-[0.34em] text-[var(--mk-navy)] -mt-1">KIDS X KWINK</p>
          </div>
          <div>
            <h1 className="mk-bebas text-5xl sm:text-6xl text-[var(--mk-navy)] tracking-[0.08em]">ADMIN LOGIN</h1>
            <p className="mt-3 text-sm font-bold text-[var(--mk-navy)]/75 max-w-sm">
              Internal panel access for inventory, visibility controls, and order operations.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 sm:p-10 md:p-14 flex items-center">
        <div className="w-full max-w-md mx-auto">
          <h2 className="mk-bebas text-5xl text-[var(--mk-navy)] tracking-[0.06em]">WELCOME</h2>
          <p className="text-sm text-gray-500 mt-1">Complete each step to access admin controls.</p>

          <form onSubmit={handleNext} className="mt-6 space-y-4">
            {authStep === 1 && (
              <label className="block">
                <span className="text-xs font-black tracking-[0.08em] text-gray-500">USER ID</span>
                <input
                  type="text"
                  required
                  value={userId}
                  onChange={(e) => update("userId", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold focus:outline-none focus:border-[var(--mk-navy)]"
                  placeholder="Enter admin id"
                />
              </label>
            )}

            {authStep === 2 && (
              <label className="block">
                <span className="text-xs font-black tracking-[0.08em] text-gray-500">PASSWORD</span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => update("password", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold focus:outline-none focus:border-[var(--mk-navy)]"
                  placeholder="Enter password"
                />
              </label>
            )}

            {authStep === 3 && (
              <label className="block">
                <span className="text-xs font-black tracking-[0.08em] text-gray-500">OTP</span>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => update("otp", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-2xl tracking-[0.35em] font-black focus:outline-none focus:border-[var(--mk-navy)]"
                  placeholder="000000"
                />
              </label>
            )}

            <div className="pt-2 flex gap-3">
              {authStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 rounded-xl border border-gray-200 py-3 text-xs font-black tracking-[0.08em] text-gray-500"
                >
                  BACK
                </button>
              )}

              <button
                type="submit"
                className="flex-[1.4] rounded-xl bg-[var(--mk-navy)] py-3 text-xs font-black tracking-[0.08em] text-[var(--mk-yellow)]"
              >
                {authStep === 3 ? "ENTER PANEL" : "CONTINUE"}
              </button>
            </div>
          </form>

          <button
            type="button"
            onClick={() => navigate("/customer/shop")}
            className="mt-6 text-xs font-bold text-gray-500 hover:text-[var(--mk-navy)]"
          >
            BACK TO SHOWROOM
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminAuth;