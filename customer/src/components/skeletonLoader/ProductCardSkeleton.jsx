import React from "react";

const ProductCardSkeleton = ({ count = 12 }) => {
  const items = Array.from({ length: count });

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {items.map((_, index) => (
        <div
          key={`product-card-skeleton-${index}`}
          className="overflow-hidden rounded-xl bg-white shadow-sm md:rounded-2xl"
          aria-hidden="true"
        >
          <div className="relative aspect-[4/5] md:aspect-[3/4] animate-pulse bg-gray-200">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-300 via-gray-200 to-gray-100" />

            <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
              <div className="h-3 w-4/5 rounded bg-white/70 md:h-3.5" />
              <div className="mt-1.5 h-3 w-3/5 rounded bg-white/70 md:h-3.5" />
              <div className="mt-3 h-4 w-1/3 rounded bg-white/80 md:h-5" />
            </div>

            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/10 px-2 py-1 md:hidden">
              <span className="h-1.5 w-1.5 rounded-full bg-white/75" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/45" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/45" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCardSkeleton;
