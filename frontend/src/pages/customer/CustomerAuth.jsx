import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { checkCustomerThunk, verifyCustomerThunk, setCustomerField, setAuthState } from "../../store/customerSlice";

export default function CustomerAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const customer = useSelector((s) => s.customer);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const sendOtp = async () => {
    if (!customer.phone.trim() || customer.phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await dispatch(checkCustomerThunk(customer.phone));
    } catch (err) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!customer.otp.trim() || customer.otp.length < 4) {
      setError("Please enter a valid OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await dispatch(verifyCustomerThunk({ phone: customer.phone, otp: customer.otp }));
      dispatch(setCustomerField({ key: "authStep", value: "email" }));
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const completeProfile = async () => {
    if (!customer.email.trim() || !customer.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await dispatch(verifyCustomerThunk({ phone: customer.phone, email: customer.email }));
      dispatch(setAuthState({
        authed: true,
        authStep: "mobile",
        phone: "",
        otp: "",
        email: ""
      }));
      navigate("/customer/shop");
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-4 rounded-full">
              <ShoppingCart className="text-blue-600" size={28} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Customer Login</h2>
          <p className="text-slate-500 text-sm">
            {customer.authStep === "mobile" && "Step 1: Phone Number"}
            {customer.authStep === "otp" && "Step 2: Verify OTP"}
            {customer.authStep === "email" && "Step 3: Complete Profile"}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {customer.authStep === "mobile" && (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-2">Phone Number</label>
              <input
                type="tel"
                value={customer.phone}
                onChange={(e) => dispatch(setCustomerField({ key: "phone", value: e.target.value }))}
                placeholder="10-digit phone number"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={sendOtp}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-4 py-2.5 rounded-lg font-semibold transition-all"
            >
              {loading ? "Sending OTP..." : "Get OTP"}
            </button>
          </div>
        )}

        {customer.authStep === "otp" && (
          <div className="space-y-4">
            <p className="text-slate-600 text-sm">Enter the OTP sent to {customer.phone}</p>
            <div>
              <label className="block text-slate-700 font-semibold mb-2">OTP</label>
              <input
                type="text"
                value={customer.otp}
                onChange={(e) => dispatch(setCustomerField({ key: "otp", value: e.target.value }))}
                placeholder="4-digit OTP"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
              />
            </div>
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-4 py-2.5 rounded-lg font-semibold transition-all"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {customer.authStep === "email" && (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-2">Email Address</label>
              <input
                type="email"
                value={customer.email}
                onChange={(e) => dispatch(setCustomerField({ key: "email", value: e.target.value }))}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={completeProfile}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white px-4 py-2.5 rounded-lg font-semibold transition-all"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
