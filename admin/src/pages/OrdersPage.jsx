import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrdersThunk, updateOrderStatusThunk } from "../store/ordersSlice";
import { CheckCircle, XCircle, Clock, Package } from "lucide-react";
import OrderCardSkeleton from "../components/skeletonLoader/OrderCardSkeleton";

const filters = [
    { id: "all", label: "ALL ORDERS" },
    { id: "pending", label: "PENDING" },
    { id: "accepted", label: "ACCEPTED" },
    { id: "rejected", label: "REJECTED" }
];

const OrdersPage = () => {
    const dispatch = useDispatch();
    const { items: orders, loading } = useSelector((state) => state.orders);
    const activeWorkspaceId = useSelector((state) => state.user.selectedWorkspaceId);
    const [activeFilter, setActiveFilter] = useState("pending");

    useEffect(() => {
        if (activeWorkspaceId) {
            dispatch(fetchOrdersThunk(activeWorkspaceId));
        }
    }, [dispatch, activeWorkspaceId]);

    const filteredOrders = useMemo(() => {
        if (activeFilter === "all") return orders;
        return orders.filter(order => order.status === activeFilter);
    }, [orders, activeFilter]);

    const handleStatusUpdate = (orderId, status) => {
        if (window.confirm(`Are you sure you want to ${status} this order?`)) {
            dispatch(updateOrderStatusThunk({ orderId, status }));
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="bg-[#fff8e1] text-[#d49000] px-3 py-1 rounded-full text-xs font-black tracking-wider flex items-center gap-1"><Clock size={12} /> PENDING</span>;
            case 'accepted': return <span className="bg-[#e6f4ea] text-[#2d7d46] px-3 py-1 rounded-full text-xs font-black tracking-wider flex items-center gap-1"><CheckCircle size={12} /> ACCEPTED</span>;
            case 'rejected': return <span className="bg-[#fde8e8] text-[#D63031] px-3 py-1 rounded-full text-xs font-black tracking-wider flex items-center gap-1"><XCircle size={12} /> REJECTED</span>;
            default: return null;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f5f5f5] font-['Nunito',_sans-serif]">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-[#f0f0f0] px-5 py-4 md:px-8">
                <h1 className="text-xl md:text-4xl text-[#0E2A4A] tracking-[2px] font-['Bebas_Neue',_sans-serif] leading-none">
                    MANAGE ORDERS
                </h1>
            </div>

            {/* Tabs */}
            <div className="flex px-5 pt-3 pb-0 gap-6 bg-white border-b border-[#eee] overflow-x-auto shrink-0 scrollbar-hide">
                {filters.map((filter) => (
                    <div
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`pb-3 text-[13px] font-black tracking-[0.5px] cursor-pointer whitespace-nowrap border-b-[3px] transition-colors ${activeFilter === filter.id ? "border-[#0E2A4A] text-[#0E2A4A]" : "border-transparent text-[#999] hover:text-[#0E2A4A]"
                            }`}
                    >
                        {filter.label} ({filter.id === 'all' ? orders.length : orders.filter(o => o.status === filter.id).length})
                    </div>
                ))}
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-5xl mx-auto w-full">
                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <OrderCardSkeleton key={`skeleton-${index}`} />
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center text-[#666] shadow-sm">
                        <Package size={48} className="mx-auto mb-3 text-gray-300" />
                        <p className="font-bold text-lg">No orders found.</p>
                        <p className="text-sm">When customers place orders, they will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="font-black text-lg text-[#1a1a1a]">{order.id}</span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <p className="text-xs text-gray-500 font-bold">{new Date(order.date).toLocaleString()}</p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-sm font-black text-[#0E2A4A] uppercase">{order.customerName}</p>
                                        <p className="text-xs text-gray-600 font-bold">{order.phone}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    <div className="flex-1 space-y-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Items</p>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm font-bold text-gray-800">
                                                <span>{item.qty} x {item.name}</span>
                                                <span>Rs. {item.price * item.qty}</span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between text-base font-black text-[#1a1a1a] pt-2 border-t border-dashed border-gray-200 mt-2">
                                            <span>Total Amount</span>
                                            <span>Rs. {order.total}</span>
                                        </div>
                                    </div>

                                    {order.status === 'pending' && (
                                        <div className="flex flex-row md:flex-col gap-3 justify-end items-end md:w-48 shrink-0">
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'accepted')}
                                                className="w-full bg-[#0E2A4A] text-white font-black text-xs px-4 py-3 rounded-xl hover:bg-[#1a3d6e] transition-colors shadow-sm flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={16} /> ACCEPT ORDER
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(order.id, 'rejected')}
                                                className="w-full bg-[#fff5f5] text-[#D63031] font-black text-xs px-4 py-3 rounded-xl hover:bg-[#fde8e8] transition-colors border border-red-100 flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={16} /> REJECT ORDER
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;