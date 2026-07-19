import React from "react";

const OrderCardSkeleton = () => (
  <div className="mk-card border border-gray-100 shadow-sm p-5">
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <div className="h-3 w-28 rounded bg-gray-200" />
        <div className="mt-2 h-3.5 w-20 rounded bg-gray-200" />
      </div>
    </div>

    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-32 rounded bg-gray-200" />
        <div className="h-3.5 w-14 rounded bg-gray-200" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3.5 w-24 rounded bg-gray-200" />
        <div className="h-3.5 w-14 rounded bg-gray-200" />
      </div>
    </div>

    <div className="flex items-center mt-5 overflow-x-auto pb-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center min-w-[72px]">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="mt-1.5 h-2 w-12 rounded bg-gray-200" />
          </div>
          {index < 4 && <div className="h-0.5 flex-1 min-w-[20px] bg-gray-200" />}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const OrdersPageSkeleton = ({ count = 3 }) => {
  const items = Array.from({ length: count });

  return (
    <main
      className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 mt-6 md:mt-8 space-y-4 animate-pulse"
      aria-hidden="true"
    >
      {items.map((_, index) => (
        <OrderCardSkeleton key={`order-skeleton-${index}`} />
      ))}
    </main>
  );
};

export default OrdersPageSkeleton;
