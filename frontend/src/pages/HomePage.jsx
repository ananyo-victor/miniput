import React from "react";
import { useNavigate } from "react-router";
import { ShoppingCart, Lock } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-indigo-600 mb-2">KWINK</h1>
          <p className="text-slate-600 text-sm">x MINIPUT</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => navigate("/customer/auth")}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center gap-3 transition-all font-semibold"
          >
            <ShoppingCart size={20} /> Customer Login
          </button>

          <button
            onClick={() => navigate("/admin/auth")}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center gap-3 transition-all font-semibold"
          >
            <Lock size={20} /> Admin Dashboard
          </button>
        </div>

        <p className="text-center text-slate-500 text-xs mt-8">
          Secure access required for both customer and admin sections
        </p>
      </div>
    </div>
  );
}
