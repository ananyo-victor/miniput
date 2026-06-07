import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardData } from '../store/analyticsSlice';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, ShoppingBag, AlertTriangle, Tag, 
  ArrowUpRight, Sparkles, Shirt, Layers, Calendar
} from 'lucide-react';

// Premium 2026 Fashion Palette matching index.css variables
const FASHION_COLORS = {
  navy: '#0e2a4a',
  orange: '#e85a1d',
  yellow: '#ffb800',
  green: '#83a963',
  sky: '#7dc1ca',
  muted: '#888888',
  bgLight: '#f8f9fa'
};

const PIE_COLORS = [FASHION_COLORS.green, FASHION_COLORS.yellow, '#d63031'];

const DashboardPage = () => {
  const dispatch = useDispatch();
  
  // Selectors matching the exact Redux architectural slice paths
  const activeWorkspaceId = useSelector((state) => state.user?.activeWorkspace?.id);
  const currentWorkspaceName = useSelector((state) => state.user?.activeWorkspace?.name || 'All Collections');
  const { data, status, error } = useSelector((state) => state.analytics);

  useEffect(() => {
    if (activeWorkspaceId) {
      dispatch(fetchDashboardData(activeWorkspaceId));
    }
  }, [dispatch, activeWorkspaceId]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f5f5]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-[#0e2a4a] animate-spin"></div>
        </div>
        <span className="mt-4 text-xs font-bold tracking-widest text-[#0e2a4a] uppercase font-['Montserrat']">
          Curating Analytics Matrix...
        </span>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="p-6 md:p-8 bg-[#f5f5f5] min-h-screen font-['Nunito']">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-red-100 p-6 shadow-sm flex items-center gap-4">
          <AlertTriangle className="text-[#d63031] shrink-0" size={32} />
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Analytics pipeline error</h3>
            <p className="text-xs text-gray-500 mt-1 font-medium">{error || "Failed to establish synchronization with the data layer."}</p>
          </div>
        </div>
      </div>
    );
  }

  // Graceful fallback for non-connected/mock environments 
  const kpis = data?.kpis || { totalRevenue: 12450.80, pendingOrdersCount: 14, lowStockCount: 3, activeDiscountsCount: 5 };
  const charts = data?.charts || {
    orderStatusData: [
      { name: 'Jan', count: 45 }, { name: 'Feb', count: 72 }, { name: 'Mar', count: 61 },
      { name: 'Apr', count: 95 }, { name: 'May', count: 120 }, { name: 'Jun', count: 84 }
    ],
    stockDistribution: [
      { name: 'Optimal Stock', value: 65 }, { name: 'Limited Run', value: 25 }, { name: 'Out of Stock', value: 10 }
    ]
  };

  return (
    <div className="p-4 md:p-8 bg-[#f5f5f5] min-h-screen font-['Nunito'] overflow-y-auto pb-24 mk-scroll-hidden">
      
      {/* Header Module */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-orange-50 text-[#e85a1d]"><Sparkles size={16} /></span>
            <span className="text-[10px] font-black tracking-widest text-[#e85a1d] uppercase font-['Montserrat']">Performance Matrix</span>
          </div>
          <h1 className="text-3xl font-['Bebas_Neue'] tracking-[1.5px] text-[#0e2a4a]">
            STUDIO OVERVIEW
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-left min-w-[160px]">
            <span className="block text-[9px] font-black text-gray-400 uppercase tracking-wider">Active Workspace</span>
            <span className="text-xs font-black text-[#0e2a4a] flex items-center gap-1.5 mt-0.5">
              <Layers size={12} className="text-[#7dc1ca]" /> {currentWorkspaceName}
            </span>
          </div>
          <div className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#0e2a4a] cursor-pointer transition-colors shadow-sm hidden sm:block">
            <Calendar size={18} />
          </div>
        </div>
      </div>

      {/* Asymmetric Bento Grid Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          title="Gross Revenue"
          value={`₹${kpis.totalRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={TrendingUp}
          trend="+18.4% this week"
          colorClass="text-[#0e2a4a]"
          bgIcon="bg-blue-50 text-[#0e2a4a]"
        />
        <KpiCard
          title="Fulfillment Queue"
          value={kpis.pendingOrdersCount || 0}
          icon={ShoppingBag}
          trend="Requires fast processing"
          colorClass="text-[#e85a1d]"
          bgIcon="bg-orange-50 text-[#e85a1d]"
        />
        <KpiCard
          title="SKU Inventory Risk"
          value={kpis.lowStockCount || 0}
          icon={Shirt}
          trend="Items low or out of stock"
          colorClass="text-[#d63031]"
          bgIcon="bg-red-50 text-[#d63031]"
        />
        <KpiCard
          title="Active Promotions"
          value={kpis.activeDiscountsCount || 0}
          icon={Tag}
          trend="Driving conversion momentum"
          colorClass="text-[#ffb800]"
          bgIcon="bg-amber-50 text-[#ffb800]"
        />
      </div>

      {/* Primary Analytics Visualization Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Deep Dive Performance Area Chart */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#888888] uppercase font-['Montserrat']">Sales Lifecycle</span>
                <h2 className="text-lg font-black text-[#1a1a1a] tracking-tight mt-0.5">Order Volume Streams</h2>
              </div>
              <span className="text-[11px] font-bold text-gray-500 bg-gray-50 border border-gray-100 rounded-full px-3 py-1">Continuous Metrics</span>
            </div>
          </div>
          
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.orderStatusData || []} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={FASHION_COLORS.sky} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={FASHION_COLORS.sky} stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#aaaaaa" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#aaaaaa" fontSize={11} tickLine={false} axisLine={false} dx={-5} />
                <Tooltip 
                  contentStyle={{ background: '#0e2a4a', borderRadius: '14px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
                  labelStyle={{ color: '#ffffff', fontWeight: '800', fontFamily: 'Montserrat', fontSize: '11px' }}
                  itemStyle={{ color: '#ffb800', fontSize: '13px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" name="Orders" stroke={FASHION_COLORS.sky} strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fashion Collection Inventory Health Radial Visualizer */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black tracking-widest text-[#888888] uppercase font-['Montserrat']">Assortment Auditing</span>
            <h2 className="text-lg font-black text-[#1a1a1a] tracking-tight mt-0.5">Inventory Allocation</h2>
          </div>
          
          <div className="h-56 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.stockDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {(charts.stockDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: '#fff', borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 8px 20px rgba(0,0,0,0.06)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#1a1a1a' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Elegant contextual interior center-label for luxury brands */}
            <div className="absolute text-center flex flex-col items-center justify-center">
              <span className="text-[10px] font-extrabold text-gray-400 tracking-widest uppercase">Healthy</span>
              <span className="text-2xl font-['Bebas_Neue'] tracking-wide text-[#0e2a4a] mt-0.5">
                {charts.stockDistribution?.[0]?.value || 100}%
              </span>
            </div>
          </div>

          <div className="border-t border-gray-50 pt-4 flex flex-col gap-2">
            {(charts.stockDistribution || []).map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-gray-500 font-bold">{item.name}</span>
                </div>
                <span className="font-black text-gray-800">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal reusable Asymmetrical Bento UI Asset Component
const KpiCard = ({ title, value, icon: Icon, trend, colorClass, bgIcon }) => (
  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md group">
    <div className="flex justify-between items-start mb-4">
      <div>
        <span className="text-[9px] font-black text-gray-400 tracking-widest uppercase font-['Montserrat'] block mb-1">
          {title}
        </span>
        <span className={`text-2xl font-['Bebas_Neue'] tracking-[0.5px] ${colorClass}`}>
          {value}
        </span>
      </div>
      <div className={`p-3 rounded-2xl ${bgIcon} transition-transform duration-300 group-hover:scale-105`}>
        <Icon size={20} />
      </div>
    </div>
    
    <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-1">
      <span className="text-[11px] font-semibold text-gray-400 tracking-wide truncate">
        {trend}
      </span>
      <ArrowUpRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
    </div>
  </div>
);

export default DashboardPage;