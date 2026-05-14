import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { adminLoginThunk, setAdminField } from "../store/adminSlice";
import BackgroundImage from "../../public/assests/DecoBG.png";
import MiniputLogo from "../../public/assests/MINIPUT_LOGO.png";
import KwinkLogo from "../../public/assests/kwink_LOGO.png";

const LoginForm = ({
  showCancel = false,
  handleNext,
  userId,
  setUserId,
  password,
  setPassword,
  canSubmit,
  authLoading,
  handleCancel,
  authError,
}) => (
  <form onSubmit={handleNext} className="mt-6 space-y-3 mk-montserrat-slim">
    <input
      type="text"
      required
      value={userId}
      onChange={(e) => setUserId(e.target.value)}
      className="w-full rounded-lg bg-gray-300 px-4 py-[9px] text-sm font-light tracking-[0.18em] text-[#9ca2a7] placeholder:text-[#7f868c] focus:outline-none focus:border-[#7eb2b6]"
      placeholder="USERNAME"
    />
    <input
      type="password"
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full rounded-lg bg-gray-300 px-4 py-[9px] text-sm font-light tracking-[0.18em] text-[#9ca2a7] placeholder:text-[#7f868c] focus:outline-none focus:border-[#7eb2b6]"
      placeholder="PASSWORD"
    />

    <button
      type="submit"
      disabled={!canSubmit}
      className="w-full rounded-lg py-[9px] text-sm font-normal text-gray-600 bg-slate-200 disabled:text-gray-400 "
    >
      {authLoading ? "AUTHENTICATING..." : "Continue"}
    </button>

    <p className="pt-1 text-center text-base font-light text-[#a9adb2]">Need help?</p>

    {showCancel && (
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={handleCancel}
          className="rounded-lg border border-[#dfdfdf] px-8 py-2 text-xs font-light tracking-[0.22em] text-[#d2d2d2]"
        >
          CANCEL
        </button>
      </div>
    )}

    {authError && <p className="text-center text-xs font-normal text-red-600">{authError}</p>}
  </form>
);

const DecoLayer = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <img
      src={BackgroundImage}
      alt=""
      aria-hidden="true"
      className="absolute inset-0 h-full w-full object-cover object-center"
    />
  </div>
);

const AuthPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { authLoading, authError } = useSelector((state) => state.admin);

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // If needed, sync from Redux, but for now, keep local
  }, []);

  const handleNext = async (event) => {
    event.preventDefault();

    if (!userId.trim() || !password.trim()) {
      return;
    }

    const result = await dispatch(adminLoginThunk({ userId, password }));
    if (adminLoginThunk.fulfilled.match(result)) {
      navigate("/inventory");
    }
  };

  const handleCancel = () => {
    setUserId("");
    setPassword("");
    dispatch(setAdminField({ key: "authError", value: "" }));
    dispatch(setAdminField({ key: "authStep", value: 1 }));
  };

  const canSubmit = Boolean(userId.trim() && password.trim() && !authLoading);

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-screen overflow-hidden border border-black/45 bg-[#4fc2cb] lg:grid lg:min-h-screen lg:grid-cols-[42%_58%]">
        <section className="relative hidden overflow-hidden bg-[#4fc2cb] px-8 py-10 lg:flex lg:flex-col lg:justify-between">
          <DecoLayer />
          <div className="relative z-10 bg-white w-fit rounded-[32px] px-6 py-8 text-center">
            <img src={MiniputLogo} alt="Miniput Kids" className="h-auto w-[190px]" />
            <img src={KwinkLogo} alt="Kwink" className="h-auto w-[170px]" />
          </div>
        </section>

        <section className="hidden bg-[#efefef] px-8 py-10 lg:flex lg:items-center">
          <div className="mx-auto w-full max-w-[410px]">
            <h1 className="mk-intro-rust-bold text-[78px] leading-[0.85] tracking-[0.08em] text-[var(--mk-green)]">LOGIN</h1>
            <p className="mt-1 text-sm font-light text-[#a8adb2] mk-montserrat-slim">Enter your credentials to manage</p>
            <LoginForm
              handleNext={handleNext}
              userId={userId}
              setUserId={setUserId}
              password={password}
              setPassword={setPassword}
              canSubmit={canSubmit}
              authLoading={authLoading}
              handleCancel={handleCancel}
              authError={authError}
            />
          </div>
        </section>

        <section className="relative min-h-screen overflow-hidden bg-[#4fc2cb] lg:hidden">
          <DecoLayer />

          <div className="absolute bottom-0 right-0 rounded-tl-[34px] bg-[#efefef] px-6 pb-auto pt-9 h-[75%] w-[90%] md:left-1/2 md:top-1/2 md:w-[72%] md:max-w-[680px] md:max-h-fit md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px] md:px-10 md:py-10">
            <div className="text-center md:hidden">
              <img src={MiniputLogo} alt="Miniput Kids" className="mx-auto h-auto w-[150px]" />
              <img src={KwinkLogo} alt="Kwink" className="mx-auto h-auto w-[150px]" />
            </div>

            <div className="hidden items-center justify-center gap-6 md:flex">
              <div>
                <img src={MiniputLogo} alt="Miniput Kids" className="h-auto w-[190px]" />
              </div>
              <div className="h-9 w-px bg-[#d5d5d5]" />
              <div>
                <img src={KwinkLogo} alt="Kwink" className="h-auto w-[170px]" />
              </div>
            </div>

            <div className="mx-auto mt-6 w-full max-w-[430px]">
              <h1 className="text-center mk-intro-rust-bold text-[60px] leading-[0.85] tracking-[0.08em] text-[var(--mk-green)] md:text-[84px]">
                LOGIN
              </h1>
              <p className="mt-1 text-center text-sm font-light text-[#a8adb2] mk-montserrat-slim">
                Enter your credentials to manage
              </p>
              <LoginForm
                handleNext={handleNext}
                userId={userId}
                setUserId={setUserId}
                password={password}
                setPassword={setPassword}
                canSubmit={canSubmit}
                authLoading={authLoading}
                handleCancel={handleCancel}
                authError={authError}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthPage;
