import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { Package, Clock, CheckCircle, QrCode, CreditCard, Truck, Ban, Copy, Check } from "lucide-react";
import { fetchMyOrdersThunk } from "../store/orderSlice";
import { openAuthModal } from "../store/authSlice";
import OrdersPageSkeleton from "../components/skeletonLoader/OrdersPageSkeleton";

const STAGES = [
  { id: "pending", label: "Order Placed", icon: Clock },
  { id: "accepted", label: "Accepted", icon: CheckCircle },
  { id: "payment_pending", label: "Awaiting Payment", icon: QrCode },
  { id: "payment_received", label: "Payment Received", icon: CreditCard },
  { id: "shipped", label: "Shipped", icon: Truck },
];

const STAGE_INDEX = STAGES.reduce((acc, stage, index) => {
  acc[stage.id] = index;
  return acc;
}, {});

const formatDate = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const OrderProgress = ({ status }) => {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 text-[#D63031] mt-4">
        <Ban size={16} />
        <span className="text-xs font-bold tracking-wide">ORDER CANCELLED</span>
      </div>
    );
  }

  const currentIndex = STAGE_INDEX[status] ?? 0;

  return (
    <div className="flex items-center mt-5 overflow-x-auto pb-1">
      {STAGES.map((stage, index) => {
        const Icon = stage.icon;
        const isDone = index <= currentIndex;
        return (
          <React.Fragment key={stage.id}>
            <div className="flex flex-col items-center min-w-[72px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  isDone
                    ? "bg-[var(--mk-navy)] border-[var(--mk-navy)] text-white"
                    : "bg-white border-gray-200 text-gray-300"
                }`}
              >
                <Icon size={14} />
              </div>
              <span
                className={`mt-1.5 text-[10px] font-bold text-center leading-tight ${
                  isDone ? "text-[var(--mk-navy)]" : "text-gray-300"
                }`}
              >
                {stage.label}
              </span>
            </div>
            {index < STAGES.length - 1 && (
              <div
                className={`h-0.5 flex-1 min-w-[20px] ${
                  index < currentIndex ? "bg-[var(--mk-navy)]" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const OrderCard = ({ order }) => {
  const items = order?.parsedOrder?.items || [];
  const orderLabel = order.orderNumber || `ORDER #${String(order.id).slice(0, 8).toUpperCase()}`;
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(orderLabel);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (_error) {
      // ignore clipboard failures
    }
  };

  return (
    <div className="mk-card border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-bold text-gray-400 tracking-wide">
              {orderLabel}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy order ID"
              className="text-gray-400 hover:text-(--mk-navy) transition-colors cursor-pointer"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      {items.length > 0 && (
        <ul className="mt-4 space-y-1">
          {items.map((item, index) => (
            <li key={index} className="text-sm text-[var(--mk-navy)] flex items-center justify-between">
              <span className="font-semibold">{item.name}</span>
              <span className="text-gray-500">Qty: {item.qty}</span>
            </li>
          ))}
        </ul>
      )}

      <OrderProgress status={order.status} />
    </div>
  );
};

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authed = useSelector((state) => state.auth.authed);
  const { items: orders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    if (authed) {
      dispatch(fetchMyOrdersThunk());
    } else {
      dispatch(openAuthModal());
    }
  }, [dispatch, authed]);

  return (
    <div className="flex-1 flex flex-col bg-[#f5f5f5] pb-10 h-full">
      <section className="bg-[var(--mk-orange)] px-4 sm:px-8 py-4 sm:py-5 text-center shadow-sm">
        <h1 className="mk-bebas text-3xl sm:text-5xl text-white tracking-[0.12em]">
          MY ORDERS
        </h1>
      </section>

      {!authed ? (
        <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="mk-card max-w-md w-full p-8 text-center border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="flex justify-center mb-4">
              <Package size={42} className="text-gray-300" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-black text-[var(--mk-navy)]">Sign in to view your orders</h2>
            <p className="mt-2 text-sm text-gray-500">Log in to see the orders you've placed over WhatsApp.</p>
            <button
              onClick={() => dispatch(openAuthModal())}
              className="inline-block mt-6 px-6 py-3.5 rounded-xl text-xs font-black tracking-[0.08em] bg-[var(--mk-navy)] text-[var(--mk-yellow)] hover:-translate-y-0.5 transition-transform shadow-md"
            >
              SIGN IN
            </button>
          </div>
        </main>
      ) : loading ? (
        <OrdersPageSkeleton />
      ) : error ? (
        <main className="flex-1 flex items-center justify-center p-10">
          <p className="text-sm text-[#D63031]">{error}</p>
        </main>
      ) : orders.length === 0 ? (
        <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
          <div className="mk-card max-w-md w-full p-8 text-center border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="flex justify-center mb-4">
              <Package size={42} className="text-gray-300" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-black text-[var(--mk-navy)]">No orders yet</h2>
            <p className="mt-2 text-sm text-gray-500">Orders you place over WhatsApp will show up here.</p>
            <button
              onClick={() => navigate('/home')}
              className="inline-block mt-6 px-6 py-3.5 rounded-xl text-xs font-black tracking-[0.08em] bg-[var(--mk-navy)] text-[var(--mk-yellow)] hover:-translate-y-0.5 transition-transform shadow-md"
            >
              DISCOVER PRODUCTS
            </button>
          </div>
        </main>
      ) : (
        <main className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 mt-6 md:mt-8 space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </main>
      )}
    </div>
  );
};

export default OrdersPage;
