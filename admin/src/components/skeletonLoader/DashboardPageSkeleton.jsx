import React from "react";

const DashboardPageSkeleton = () => {
  return (
    <div className="p-4 md:p-8 bg-[#f5f5f5] min-h-screen overflow-y-auto pb-24 mk-scroll-hidden animate-pulse">

      {/* Header Module Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="space-y-2">
          <div className="h-3 w-32 bg-gray-200 rounded-md"></div>
          <div className="h-7 w-56 bg-gray-200 rounded-md"></div>
        </div>

        <div className="flex items-center gap-3">
          <div className="h-[52px] w-40 bg-gray-100 border border-gray-100 rounded-xl"></div>
          <div className="h-[42px] w-[42px] bg-gray-100 border border-gray-200 rounded-xl hidden sm:block"></div>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={`kpi-${i}`} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                <div className="h-6 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="h-11 w-11 bg-gray-100 rounded-2xl"></div>
            </div>
            <div className="border-t border-gray-50 pt-3 mt-1">
              <div className="h-3 w-32 bg-gray-100 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-2">
              <div className="h-3 w-28 bg-gray-200 rounded"></div>
              <div className="h-5 w-44 bg-gray-200 rounded"></div>
            </div>
            <div className="h-6 w-32 bg-gray-100 rounded-full"></div>
          </div>
          <div className="h-72 w-full mt-4 bg-gray-100 rounded-2xl"></div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="space-y-2 mb-2">
            <div className="h-3 w-32 bg-gray-200 rounded"></div>
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
          </div>

          <div className="h-56 my-2 flex items-center justify-center">
            <div className="h-40 w-40 bg-gray-100 rounded-full"></div>
          </div>

          <div className="border-t border-gray-50 pt-4 flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={`legend-${i}`} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>
                  <div className="h-3 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-3 w-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPageSkeleton;
