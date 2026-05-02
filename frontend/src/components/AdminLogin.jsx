import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft } from 'lucide-react';
import { adminStep1Thunk } from "../../store/adminSlice";
import { setAdminField } from "../../store/adminSlice";

export default function AdminLogin({ onBack }) {
  const dispatch = useDispatch();
  const admin = useSelector((s) => s.admin);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleStep1 = async () => {
    if (!admin.userId.trim() || !admin.password.trim()) {
      setError("Please enter both User ID and Password");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await dispatch(adminStep1Thunk({ userId: admin.userId, password: admin.password }));
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async () => {
    if (!admin.otp.trim()) {
      setError("Please enter OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await fetch(import.meta.env.VITE_API_BASE_URL + "/api/auth/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: admin.userId, otp: admin.otp })
      });

      if (!response.ok) throw new Error("OTP verification failed");
      
      const data = await response.json();
      if (data.success) {
        dispatch(setAdminField({ key: "authed", value: true }));
      } else {
        setError("Invalid OTP");
      }
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Admin Login</h2>
          <p className="text-slate-500 text-sm">Step {admin.authStep} of 2</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        {admin.authStep === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-2">User ID</label>
              <input
                type="text"
                value={admin.userId}
                onChange={(e) => dispatch(setAdminField({ key: "userId", value: e.target.value }))}
                placeholder="Enter your User ID"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-2">Password</label>
              <input
                type="password"
                value={admin.password}
                onChange={(e) => dispatch(setAdminField({ key: "password", value: e.target.value }))}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleStep1}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white px-4 py-2.5 rounded-lg font-semibold transition-all"
            >
              {loading ? "Verifying..." : "Verify Credentials"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-slate-600 text-sm">Enter the OTP sent to your registered phone/email</p>
            <div>
              <label className="block text-slate-700 font-semibold mb-2">OTP</label>
              <input
                type="text"
                value={admin.otp}
                onChange={(e) => dispatch(setAdminField({ key: "otp", value: e.target.value }))}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center text-lg tracking-widest"
              />
            </div>
            <button
              onClick={handleStep2}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white px-4 py-2.5 rounded-lg font-semibold transition-all"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
