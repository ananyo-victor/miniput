import React from "react";

const OrderCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 animate-pulse transition-all">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-4 mb-4">
        <div className="space-y-2 w-full md:w-auto">
          <div className="flex items-center gap-3">
            {/* Order ID */}
            <div className="h-6 w-24 bg-gray-200 rounded-md"></div>
            {/* Status Badge */}
            <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
          </div>
          {/* Date */}
          <div className="h-3 w-32 bg-gray-100 rounded"></div>
        </div>
        
        <div className="flex flex-col md:items-end space-y-2 w-full md:w-auto">
          {/* Customer Name */}
          <div className="h-5 w-32 bg-gray-200 rounded-md"></div>
          {/* Phone */}
          <div className="h-3 w-24 bg-gray-100 rounded"></div>
        </div>
      </div>

      {/* Body Skeleton */}
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <div className="flex-1 space-y-3 w-full">
          {/* Order Items Title */}
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
          
          <div className="space-y-3 pt-1">
            {/* Item 1 */}
            <div className="flex justify-between">
              <div className="h-4 w-40 bg-gray-100 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
            {/* Item 2 */}
            <div className="flex justify-between">
              <div className="h-4 w-32 bg-gray-100 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
          
          {/* Total Amount */}
          <div className="flex justify-between pt-3 border-t border-dashed border-gray-200 mt-2">
            <div className="h-5 w-28 bg-gray-200 rounded"></div>
            <div className="h-5 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-row md:flex-col gap-3 justify-end items-end md:w-48 shrink-0 w-full mt-4 md:mt-0">
          <div className="h-[40px] w-full bg-gray-200 rounded-xl"></div>
          <div className="h-[40px] w-full bg-gray-100 border border-gray-200 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};

export default OrderCardSkeleton;