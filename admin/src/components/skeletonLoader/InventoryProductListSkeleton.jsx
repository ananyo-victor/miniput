const InventoryProductListSkeleton = () => {
  return (
    <div className="animate-pulse flex flex-col bg-white rounded-2xl p-3.5 mb-2.5 shadow-md">
      <div className="flex items-center gap-3">
        {/* Image */}
        <div className="w-16 h-16 rounded-xl bg-[#e8e8e8]" />

        {/* Product Info */}
        <div className="flex-1">
          <div className="h-4 w-40 rounded bg-[#e8e8e8] mb-2" />
          <div className="h-3 w-24 rounded bg-[#eeeeee] mb-2" />
          <div className="h-3 w-32 rounded bg-[#f2f2f2]" />
        </div>

        {/* Right Section */}
        <div className="flex flex-col items-end gap-2">
          <div className="h-5 w-20 rounded-full bg-[#eeeeee]" />
          <div className="h-3 w-16 rounded bg-[#f2f2f2]" />
          <div className="h-5 w-24 rounded bg-[#e8e8e8]" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end border-t border-[#f0f0f0] pt-2 mt-2">
        <div className="h-8 w-16 rounded-lg bg-[#e8e8e8]" />
        <div className="h-8 w-20 rounded-lg bg-[#eeeeee]" />
        <div className="h-8 w-20 rounded-lg bg-[#f2f2f2]" />
      </div>
    </div>
  );
};

export default InventoryProductListSkeleton;