import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, ArrowRight } from "lucide-react";
import {
  closeAuthModal,
  setAuthField,
  checkCustomerThunk,
  verifyCustomerThunk
} from "../../store/authSlice";

const RESEND_COOLDOWN = 60;

const AuthModal = () => {
  const dispatch = useDispatch();
  const { isAuthModalOpen, authStep, phone, otp, authError } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (authStep === "otp") {
      startResendTimer();
    } else {
      clearInterval(timerRef.current);
      setResendTimer(0);
    }
    return () => clearInterval(timerRef.current);
  }, [authStep]);

  const startResendTimer = () => {
    clearInterval(timerRef.current);
    setResendTimer(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  if (!isAuthModalOpen) return null;

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (phone.length === 10) {
      setLoading(true);
      await dispatch(checkCustomerThunk(phone));
      setLoading(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (phone.length === 10 && resendTimer === 0) {
      setLoading(true);
      await dispatch(checkCustomerThunk(phone));
      setLoading(false);
      startResendTimer();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length > 3) {
      setLoading(true);
      await dispatch(verifyCustomerThunk({ phone, otp }));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden animate-[sfadeUp_0.3s_ease]">

        {/* Header */}
        <div className="bg-[var(--mk-navy)] p-6 text-center relative">
          <button
            onClick={() => dispatch(closeAuthModal())}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="mk-bebas text-3xl tracking-widest text-white">
            {authStep === "mobile" ? "LOGIN / REGISTER" : "VERIFY OTP"}
          </h2>
          <p className="text-white/80 text-xs font-bold uppercase tracking-wide mt-1">
            {authStep === "mobile"
              ? "To place bulk orders seamlessly"
              : `Code sent to +91 ${phone}`}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8">
          {authStep === "mobile" ? (
            <form onSubmit={handlePhoneSubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 block">
                  Mobile Number
                </label>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[var(--mk-navy)] focus-within:bg-white transition-colors">
                  <span className="text-gray-500 font-bold">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => dispatch(setAuthField({ key: "phone", value: e.target.value.replace(/\D/g, "") }))}
                    placeholder="Enter 10 digit number"
                    className="flex-1 bg-transparent border-none outline-none font-bold text-gray-900"
                    autoFocus
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={phone.length !== 10 || loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-[var(--mk-navy)] text-[var(--mk-yellow)] text-xs font-black tracking-[0.09em] disabled:opacity-50 transition-opacity"
              >
                {loading ? "SENDING OTP..." : "GET OTP"} <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase mb-2 block">
                  One Time Password
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => dispatch(setAuthField({ key: "otp", value: e.target.value.replace(/\D/g, "") }))}
                  placeholder="Enter OTP"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none font-bold text-gray-900 text-center tracking-[0.5em] focus:border-[var(--mk-navy)] focus:bg-white transition-colors"
                  autoFocus
                />
              </div>
              {authError && (
                <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider text-center mt-1">
                  {authError}
                </p>
              )}
              <button
                type="submit"
                disabled={otp.length < 4 || loading}
                className="w-full py-4 rounded-xl bg-[#2d7d46] text-white text-xs font-black tracking-[0.09em] hover:bg-[#246638] disabled:opacity-50 transition-colors"
              >
                {loading ? "VERIFYING..." : "VERIFY & CONTINUE"}
              </button>

              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={() => dispatch(setAuthField({ key: "authStep", value: "mobile" }))}
                  className="text-[11px] font-bold text-gray-400 hover:text-[var(--mk-navy)] uppercase tracking-wider transition-colors"
                >
                  ← Change Number
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading || resendTimer > 0}
                  className="text-[11px] font-bold text-[var(--mk-navy)] hover:text-blue-800 uppercase tracking-wider transition-colors disabled:opacity-50"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

