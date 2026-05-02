import React, { useMemo } from "react";
import { DollarSign, Box, TrendingUp } from 'lucide-react';

export default function DashboardStats({ products }) {
  const totalRevenue = useMemo(() =>
    products.reduce((sum, p) => sum + Number(p.price || 0) * Math.max(Number(p.stock || 0), 0), 0),
    [products]
  );

  const avgPrice = products.length ? (totalRevenue / products.length).toFixed(0) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard 
        title="Total Inventory Value" 
        value={`₹ ${totalRevenue.toLocaleString()}`} 
        icon={<DollarSign className="text-emerald-600" />} 
        trend="+12.5%" 
      />
      <StatCard 
        title="Total Products" 
        value={products.length} 
        icon={<Box className="text-blue-600" />} 
        trend="+3 new" 
      />
      <StatCard 
        title="Average Price" 
        value={`₹ ${avgPrice}`} 
        icon={<TrendingUp className="text-indigo-600" />} 
        trend="Stable" 
      />
    </div>
  );
}

function StatCard({ title, value, icon, trend }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{trend}</span>
      </div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-bold text-slate-900 mt-1">{value}</h3>
    </div>
  );
}