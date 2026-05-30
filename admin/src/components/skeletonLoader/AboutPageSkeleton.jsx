import React from "react";

const AboutPageSkeleton = () => {
  return (
    <div className="flex-1 bg-[#f5f5f5] pb-10">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 animate-pulse">
        
        {/* Page Header Skeleton */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-5 py-5 sm:px-6">
          <div className="h-8 w-64 bg-gray-200 rounded-md mb-3"></div>
          <div className="h-4 w-96 bg-gray-100 rounded-md"></div>
        </div>

        <div className="mt-5 space-y-5">
          
          {/* Section 1: Showroom And Contact Skeleton */}
          <section className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="h-6 w-48 bg-gray-200 rounded-md mb-6"></div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                <div className="h-20 w-full bg-gray-100 border border-gray-200 rounded-xl"></div>
              </div>

              <div className="space-y-2">
                <div className="h-3 w-28 bg-gray-200 rounded"></div>
                <div className="h-[38px] w-full bg-gray-100 border border-gray-200 rounded-xl"></div>
              </div>

              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
                <div className="h-[38px] w-full bg-gray-100 border border-gray-200 rounded-xl"></div>
              </div>
            </div>
          </section>

          {/* Section 2: Workspace Content Skeleton */}
          <section className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
            <div className="flex items-start justify-between gap-3 mb-6">
              <div className="h-6 w-40 bg-gray-200 rounded-md"></div>
              <div className="h-6 w-28 bg-gray-200 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <div className="h-3 w-64 bg-gray-200 rounded mb-3"></div>
                {[1, 2, 3].map((i) => (
                  <div key={`point-${i}`} className="h-[38px] w-full bg-gray-100 border border-gray-200 rounded-xl"></div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="h-3 w-64 bg-gray-200 rounded mb-3"></div>
                {[1, 2, 3].map((i) => (
                  <div key={`tag-${i}`} className="h-[38px] w-full bg-gray-100 border border-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>

            {/* Hero Images Upload Box Skeleton */}
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-64 bg-gray-200 rounded"></div>
                </div>
                <div className="h-9 w-36 bg-gray-200 rounded-lg"></div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={`img-${i}`} className="h-28 w-full bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </section>

          {/* Sticky Bottom Button Skeleton */}
          <div className="sticky bottom-4 z-20">
            <div className="rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-lg">
              <div className="h-[44px] w-full bg-gray-200 rounded-xl"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AboutPageSkeleton;