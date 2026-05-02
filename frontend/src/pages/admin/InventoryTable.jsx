import React from "react";
import { useDispatch } from "react-redux";
import { Plus, EyeOff, Trash2 } from 'lucide-react';
import { setAdminField } from "../../store/adminSlice";

export default function InventoryTable({ products }) {
  const dispatch = useDispatch();

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center">
        <h2 className="font-bold text-lg text-slate-800">Product Catalog</h2>
        <button 
          onClick={() => dispatch(setAdminField({ key: "showAdd", value: true }))}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all font-medium"
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-4">Product Details</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-400">ID: {p._id?.slice(-6) || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">₹ {p.price}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {p.stock} in units
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button title="Quick Stock +10" className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg"><Plus size={18} /></button>
                    <button title="Hide Product" className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg"><EyeOff size={18} /></button>
                    <button title="Delete" className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}