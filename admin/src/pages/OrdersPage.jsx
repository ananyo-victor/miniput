import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import {
    fetchOrdersThunk,
    acceptOrderThunk,
    rejectOrderThunk,
    sendQrThunk,
    paymentConfirmedThunk,
    markPaymentReceivedThunk,
    markPaymentNotReceivedThunk,
    orderReceived,
    orderUpdated,
} from "../store/ordersSlice";
import { CheckCircle, XCircle, Clock, Package, QrCode, Truck, CreditCard, Ban, RefreshCw } from "lucide-react";
import OrderCardSkeleton from "../components/skeletonLoader/OrderCardSkeleton";
import ConfirmActionModal from "../components/orders/ConfirmActionModal";

const confirmActions = {
    accept: {
        title: "Accept Order",
        message: "Accept this order?",
        confirmLabel: "ACCEPT",
        confirmVariant: "accept",
        thunk: acceptOrderThunk,
    },
    reject: {
        title: "Reject Order",
        message: "Reject this order? The customer will be notified.",
        confirmLabel: "REJECT",
        confirmVariant: "reject",
        thunk: rejectOrderThunk,
    },
    sendQr: {
        title: "Send QR Code",
        message: "Send the payment QR code to the customer?",
        confirmLabel: "SEND",
        thunk: sendQrThunk,
    },
    markPaymentReceived: {
        title: "Confirm Payment Received",
        message: "Confirm that payment was received for this order?",
        confirmLabel: "CONFIRM",
        thunk: markPaymentReceivedThunk,
    },
    markPaymentNotReceived: {
        title: "Mark Payment Not Received",
        message: "Mark payment as not received? This will cancel the order and notify the customer.",
        confirmLabel: "MARK NOT RECEIVED",
        thunk: markPaymentNotReceivedThunk,
    },
    paymentConfirmed: {
        title: "Confirm & Ship",
        message: "Confirm payment received? This will mark the order as shipped.",
        confirmLabel: "CONFIRM & SHIP",
        thunk: paymentConfirmedThunk,
    },
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const filters = [
    { id: "all", label: "ALL ORDERS" },
    { id: "pending", label: "PENDING" },
    { id: "accepted", label: "ACCEPTED" },
    { id: "payment_pending", label: "AWAITING PAYMENT" },
    { id: "payment_received", label: "PAYMENT RECEIVED" },
    { id: "shipped", label: "SHIPPED" },
    { id: "cancelled", label: "CANCELLED" },
];

const OrdersPage = () => {
    const dispatch = useDispatch();
    const { items: orders, loading } = useSelector((state) => state.orders);
    const workspaces = useSelector((state) => state.workspace.items);
    const activeWorkspaceId = useSelector((state) => state.user.selectedWorkspaceId);
    const location = useLocation();
    const incomingFilter = location.state?.filter;
    const [activeFilter, setActiveFilter] = useState(
        filters.some((filter) => filter.id === incomingFilter) ? incomingFilter : "pending"
    );
    const [pendingAction, setPendingAction] = useState(null);
    const [isProcessingAction, setIsProcessingAction] = useState(false);

    useEffect(() => {
        if (activeWorkspaceId) {
            dispatch(fetchOrdersThunk());
        }
    }, [dispatch, activeWorkspaceId]);

    useEffect(() => {
        const socket = io(API_BASE_URL, { transports: ["websocket"] });

        socket.on("new-order-received", (order) => dispatch(orderReceived(order)));
        socket.on("order-updated", (order) => dispatch(orderUpdated(order)));

        return () => socket.disconnect();
    }, [dispatch]);

    const handleRefresh = () => dispatch(fetchOrdersThunk());

    const filteredOrders = useMemo(() => {
        if (activeFilter === "all") return orders;
        return orders.filter((order) => order.status === activeFilter);
    }, [orders, activeFilter]);

    const handleAccept = (orderId) => setPendingAction({ type: "accept", orderId });
    const handleReject = (orderId) => setPendingAction({ type: "reject", orderId });
    const handleSendQr = (orderId) => setPendingAction({ type: "sendQr", orderId });
    const handleMarkPaymentReceived = (orderId) => setPendingAction({ type: "markPaymentReceived", orderId });
    const handleMarkPaymentNotReceived = (orderId) => setPendingAction({ type: "markPaymentNotReceived", orderId });
    const handlePaymentConfirmed = (orderId) => setPendingAction({ type: "paymentConfirmed", orderId });

    const handleConfirmAction = async () => {
        if (!pendingAction) return;
        const action = confirmActions[pendingAction.type];
        setIsProcessingAction(true);
        try {
            await dispatch(action.thunk(pendingAction.orderId)).unwrap();
        } finally {
            setIsProcessingAction(false);
            setPendingAction(null);
        }
    };

    const handleCancelAction = () => setPendingAction(null);

    const getItemBrandName = (order, item) => {
        const orderItem = order.items?.find((oi) => oi.code === item.code);
        if (!orderItem?.workspaceId) return null;
        return workspaces.find((workspace) => workspace.id === orderItem.workspaceId)?.name || null;
    };

    const getStatusBadge = (status) => {
        const map = {
            pending: { bg: "bg-[#fff8e1]", text: "text-[#d49000]", icon: <Clock size={12} />, label: "PENDING" },
            accepted: { bg: "bg-[#e6f4ea]", text: "text-[#2d7d46]", icon: <CheckCircle size={12} />, label: "ACCEPTED" },
            payment_pending: { bg: "bg-[#e8f0fe]", text: "text-[#1a73e8]", icon: <QrCode size={12} />, label: "AWAITING PAYMENT" },
            payment_received: { bg: "bg-[#f3e8fd]", text: "text-[#7b1fa2]", icon: <CreditCard size={12} />, label: "PAYMENT RECEIVED" },
            shipped: { bg: "bg-[#e6f4ea]", text: "text-[#2d7d46]", icon: <Truck size={12} />, label: "SHIPPED" },
            cancelled: { bg: "bg-[#fde8e8]", text: "text-[#D63031]", icon: <Ban size={12} />, label: "CANCELLED" },
        };
        const s = map[status];
        if (!s) return null;
        return (
            <span className={`${s.bg} ${s.text} px-3 py-1 rounded-full text-xs font-black tracking-wider flex items-center gap-1`}>
                {s.icon} {s.label}
            </span>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f5f5f5] font-['Nunito',_sans-serif]">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-[#f0f0f0] px-5 py-4 md:px-8">
                <h1 className="text-xl md:text-4xl text-[#0E2A4A] tracking-[2px] font-['Bebas_Neue',_sans-serif] leading-none">
                    MANAGE ORDERS
                </h1>
                <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-wider text-[#0E2A4A] border border-[#0E2A4A] hover:bg-[#0E2A4A] hover:text-white transition-colors disabled:opacity-50"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                    REFRESH
                </button>
            </div>

            {/* Tabs */}
            <div className="flex px-5 pt-3 pb-0 gap-6 bg-white border-b border-[#eee] overflow-x-auto shrink-0 scrollbar-hide">
                {filters.map((filter) => (
                    <div
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`pb-3 text-[13px] font-black tracking-[0.5px] cursor-pointer whitespace-nowrap border-b-[3px] transition-colors ${
                            activeFilter === filter.id
                                ? "border-[#0E2A4A] text-[#0E2A4A]"
                                : "border-transparent text-[#999] hover:text-[#0E2A4A]"
                        }`}
                    >
                        {filter.label} ({filter.id === "all" ? orders.length : orders.filter((o) => o.status === filter.id).length})
                    </div>
                ))}
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-5xl mx-auto w-full">
                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <OrderCardSkeleton key={i} />
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
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 transition-all hover:shadow-md">
                                {/* Card Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                                            <span className="font-black text-lg text-[#1a1a1a] font-mono">{order.id}</span>
                                            {getStatusBadge(order.status)}
                                        </div>
                                        <p className="text-xs text-gray-500 font-bold">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-left md:text-right">
                                        <p className="text-sm font-black text-[#0E2A4A] uppercase">{order.customerName}</p>
                                        <p className="text-xs text-gray-600 font-bold">{order.customerPhone}</p>
                                    </div>
                                </div>

                                {/* Order Details */}
                                <div className="mb-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order Details</p>
                                    {order.parsedOrder ? (
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm">
                                                {[
                                                    ["Party", order.parsedOrder.partyName],
                                                    ["Phone", order.parsedOrder.phone],
                                                    ["Address", order.parsedOrder.address],
                                                    ["Transport", order.parsedOrder.transport],
                                                    ["GST", order.parsedOrder.gst],
                                                    ["Agent", order.parsedOrder.agent],
                                                    ["Filled By", order.parsedOrder.filledBy],
                                                    ["Remarks", order.parsedOrder.remarks],
                                                ].filter(([, v]) => v).map(([label, value]) => (
                                                    <div key={label}>
                                                        <span className="text-xs text-gray-400 font-bold uppercase">{label}: </span>
                                                        <span className="font-bold text-gray-800">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            {order.parsedOrder.items?.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Items</p>
                                                    <div className="rounded-xl border border-gray-100 overflow-hidden">
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-gray-50">
                                                                <tr>
                                                                    <th className="text-left px-3 py-2 text-xs font-black text-gray-500 uppercase">Item</th>
                                                                    <th className="text-left px-3 py-2 text-xs font-black text-gray-500 uppercase">Code</th>
                                                                    <th className="text-left px-3 py-2 text-xs font-black text-gray-500 uppercase">Brand</th>
                                                                    <th className="text-right px-3 py-2 text-xs font-black text-gray-500 uppercase">Qty</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {order.parsedOrder.items.map((item, i) => (
                                                                    <tr key={i} className="border-t border-gray-100">
                                                                        <td className="px-3 py-2 font-bold text-gray-800">{item.name}</td>
                                                                        <td className="px-3 py-2 font-mono text-gray-600">{item.code}</td>
                                                                        <td className="px-3 py-2 font-bold text-gray-600 uppercase">{getItemBrandName(order, item) || "—"}</td>
                                                                        <td className="px-3 py-2 font-black text-right text-[#0E2A4A]">{item.qty}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm font-bold text-gray-800 whitespace-pre-wrap">{order.orderMessage}</p>
                                    )}
                                </div>

                                {/* Payment Screenshot */}
                                {order.paymentScreenshotUrl && (
                                    <div className="mb-4">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Screenshot</p>
                                        <a href={`/api/whatsapp/media/${order.paymentScreenshotUrl}`} target="_blank" rel="noreferrer">
                                            <img
                                                src={`/api/whatsapp/media/${order.paymentScreenshotUrl}`}
                                                alt="Payment screenshot"
                                                className="max-h-48 rounded-xl border border-gray-200 object-contain cursor-pointer hover:opacity-90 transition"
                                            />
                                        </a>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3 items-end">

                                    {/* pending → Accept / Reject */}
                                    {order.status === "pending" && (
                                        <div className="flex flex-row gap-3">
                                            <button
                                                onClick={() => handleAccept(order.id)}
                                                className="bg-[#0E2A4A] text-white font-black text-xs px-4 py-3 rounded-xl hover:bg-[#1a3d6e] transition-colors shadow-sm flex items-center gap-2"
                                            >
                                                <CheckCircle size={16} /> ACCEPT ORDER
                                            </button>
                                            <button
                                                onClick={() => handleReject(order.id)}
                                                className="bg-[#fff5f5] text-[#D63031] font-black text-xs px-4 py-3 rounded-xl hover:bg-[#fde8e8] transition-colors border border-red-100 flex items-center gap-2"
                                            >
                                                <XCircle size={16} /> REJECT ORDER
                                            </button>
                                        </div>
                                    )}

                                    {/* accepted → Send QR */}
                                    {order.status === "accepted" && (
                                        <button
                                            onClick={() => handleSendQr(order.id)}
                                            className="bg-[#0E2A4A] text-white font-black text-xs px-4 py-3 rounded-xl hover:bg-[#1a3d6e] transition-colors shadow-sm flex items-center gap-2 whitespace-nowrap"
                                        >
                                            <QrCode size={16} /> SEND QR
                                        </button>
                                    )}

                                    {/* payment_pending → Received Payment / Didn't Receive Payment */}
                                    {order.status === "payment_pending" && (
                                        <div className="flex flex-row gap-3">
                                            <button
                                                onClick={() => handleMarkPaymentReceived(order.id)}
                                                className="bg-[#0E2A4A] text-white font-black text-xs px-4 py-3 rounded-xl hover:bg-[#1a3d6e] transition-colors shadow-sm flex items-center gap-2"
                                            >
                                                <CreditCard size={16} /> RECEIVED PAYMENT
                                            </button>
                                            <button
                                                onClick={() => handleMarkPaymentNotReceived(order.id)}
                                                className="bg-[#fff5f5] text-[#D63031] font-black text-xs px-4 py-3 rounded-xl hover:bg-[#fde8e8] transition-colors border border-red-100 flex items-center gap-2"
                                            >
                                                <XCircle size={16} /> DIDN'T RECEIVE PAYMENT
                                            </button>
                                        </div>
                                    )}

                                    {/* payment_received → Confirm Payment */}
                                    {order.status === "payment_received" && (
                                        <button
                                            onClick={() => handlePaymentConfirmed(order.id)}
                                            className="bg-[#7b1fa2] text-white font-black text-xs px-4 py-3 rounded-xl hover:bg-[#6a1090] transition-colors shadow-sm flex items-center gap-2"
                                        >
                                            <CreditCard size={16} /> PAYMENT RECEIVED — CONFIRM & SHIP
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmActionModal
                show={!!pendingAction}
                title={pendingAction ? confirmActions[pendingAction.type].title : ""}
                message={pendingAction ? confirmActions[pendingAction.type].message : ""}
                confirmLabel={pendingAction ? confirmActions[pendingAction.type].confirmLabel : ""}
                confirmVariant={pendingAction ? confirmActions[pendingAction.type].confirmVariant || "default" : "default"}
                isProcessing={isProcessingAction}
                onConfirm={handleConfirmAction}
                onCancel={handleCancelAction}
            />
        </div>
    );
};

export default OrdersPage;
