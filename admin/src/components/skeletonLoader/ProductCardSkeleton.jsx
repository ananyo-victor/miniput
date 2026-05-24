import React from "react";

const ProductCardSkeleton = () => {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm animate-pulse md:rounded-2xl">
      {/* Image */}
      <div className="aspect-[4/5] bg-gray-200" />

      {/* Content */}
      <div className="p-3">
        {/* Title */}
        <div className="h-3 w-3/4 rounded bg-gray-200 mb-3" />

        {/* Price Row */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 rounded bg-gray-300" />
          <div className="h-5 w-12 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;