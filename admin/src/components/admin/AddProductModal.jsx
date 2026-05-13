import React from "react";

const AddProductModal = ({
  show,
  newProduct,
  submitting,
  uploadingImage,
  onClose,
  onSubmit,
  onFieldChange,
  onImageUpload,
  onDeleteImage
}) => {
  if (!show) {
    return null;
  }

  const sizesValue = Array.isArray(newProduct.sizes)
    ? newProduct.sizes.join(", ")
    : newProduct.sizes || "";

  const handleSizesChange = (value) => {
    const parsedSizes = value
      .split(",")
      .map((size) => size.trim())
      .filter(Boolean);

    onFieldChange("sizes", parsedSizes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-[16px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col max-h-[80vh] md:max-h-[90vh] overflow-hidden animate-[sfadeUp_0.3s_ease]">
        <div className="bg-[#0E2A4A] px-4 py-3 md:px-5 md:py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-[18px] md:text-[24px] text-white tracking-[2px] font-['Bebas_Neue',_sans-serif] leading-none">
              ADD NEW PRODUCT
            </h2>
            <p className="text-[8px] md:text-[10px] text-white/55 font-bold tracking-[1px] mt-1">
              ENTER DETAILS TO UPDATE INVENTORY
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-[32px] h-[32px] md:w-[36px] md:h-[36px] bg-white/15 rounded-full flex items-center justify-center text-white text-[16px] md:text-[18px] hover:bg-white/25 transition-colors"
          >
            X
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-8 bg-[#f5f5f5]">
          <form id="add-product-form" onSubmit={onSubmit} className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden">
            <div className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 border-b border-[#f2f2f2] min-h-[50px] md:min-h-[60px] focus-within:bg-[#fffdf5] transition-colors">
              <div className="text-[16px] md:text-[20px] w-[24px] md:w-[28px] text-center shrink-0">N</div>
              <div className="flex-1 py-1">
                <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-0.5 block">
                  PRODUCT NAME <span className="text-[#D63031]">*</span>
                </label>
                <input
                  required
                  value={newProduct.name}
                  onChange={(e) => onFieldChange("name", e.target.value)}
                  className="w-full bg-transparent border-none text-[12px] md:text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                  placeholder="e.g. Babla Shirt"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 border-b border-[#f2f2f2] min-h-[50px] md:min-h-[60px] focus-within:bg-[#fffdf5] transition-colors">
              <div className="text-[16px] md:text-[20px] w-[24px] md:w-[28px] text-center shrink-0">B</div>
              <div className="flex-1 py-1">
                <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-0.5 block">
                  BRAND
                </label>
                <select
                  value={newProduct.brand || "Miniput"}
                  onChange={(e) => onFieldChange("brand", e.target.value)}
                  className="w-full bg-transparent border-none text-[12px] md:text-[14px] font-bold text-[#1a1a1a] outline-none appearance-none cursor-pointer"
                >
                  <option value="Miniput">Miniput</option>
                  <option value="Kwink">Kwink</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 border-b border-[#f2f2f2] min-h-[50px] md:min-h-[60px] focus-within:bg-[#fffdf5] transition-colors">
              <div className="text-[16px] md:text-[20px] w-[24px] md:w-[28px] text-center shrink-0">C</div>
              <div className="flex-1 py-1">
                <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-0.5 block">
                  CATEGORY
                </label>
                <select
                  value={newProduct.category}
                  onChange={(e) => onFieldChange("category", e.target.value)}
                  className="w-full bg-transparent border-none text-[12px] md:text-[14px] font-bold text-[#1a1a1a] outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select Category...</option>
                  <option value="shirt">Shirt</option>
                  <option value="pant">Pant</option>
                  <option value="jacket">Jacket</option>
                  <option value="set">Set</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 border-b border-[#f2f2f2] min-h-[50px] md:min-h-[60px] focus-within:bg-[#fffdf5] transition-colors">
              <div className="text-[16px] md:text-[20px] w-[24px] md:w-[28px] text-center shrink-0">S</div>
              <div className="flex-1 py-1">
                <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-0.5 block">
                  SIZES
                </label>
                <input
                  value={sizesValue}
                  onChange={(e) => handleSizesChange(e.target.value)}
                  className="w-full bg-transparent border-none text-[12px] md:text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                  placeholder="e.g. 38, 40, 42"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row border-b border-[#f2f2f2]">
              <div className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 border-b sm:border-b-0 sm:border-r border-[#f2f2f2] min-h-[50px] md:min-h-[60px] flex-1 focus-within:bg-[#fffdf5] transition-colors">
                <div className="text-[16px] md:text-[20px] w-[24px] md:w-[28px] text-center shrink-0">Rs</div>
                <div className="flex-1 py-1">
                  <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-0.5 block">
                    PRICE <span className="text-[#D63031]">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) => onFieldChange("price", e.target.value)}
                    className="w-full bg-transparent border-none text-[12px] md:text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 min-h-[50px] md:min-h-[60px] flex-1 focus-within:bg-[#fffdf5] transition-colors">
                <div className="text-[16px] md:text-[20px] w-[24px] md:w-[28px] text-center shrink-0">Q</div>
                <div className="flex-1 py-1">
                  <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-0.5 block">
                    STOCK <span className="text-[#D63031]">*</span>
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={newProduct.stock}
                    onChange={(e) => onFieldChange("stock", e.target.value)}
                    className="w-full bg-transparent border-none text-[12px] md:text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                    placeholder="Units available"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 border-b border-[#f2f2f2] min-h-[50px] md:min-h-[60px] focus-within:bg-[#fffdf5] transition-colors">
              <div className="text-[16px] md:text-[20px] w-[24px] md:w-[28px] text-center shrink-0">I</div>
              <div className="flex-1 py-1">
                <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-0.5 block">
                  IMAGE
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={uploadingImage}
                />
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer rounded px-2 md:px-3 py-1.5 md:py-2 text-[11px] md:text-[13px] font-bold transition-colors ${uploadingImage ? "bg-[#ddd] text-[#777] cursor-not-allowed" : "bg-[#f0f0f0] text-[#555] hover:bg-[#e8e8e8]"}`}
                  >
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                  </label>
                  {newProduct.imageUrl && (
                    <button
                      type="button"
                      onClick={onDeleteImage}
                      className="rounded bg-[#fff5f5] px-2 md:px-3 py-1.5 md:py-2 text-[10px] md:text-[12px] font-bold text-[#D63031] hover:bg-[#fde8e8] transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {newProduct.imageUrl && (
                  <div className="mt-2 h-12 md:h-16 w-12 md:w-16 overflow-hidden rounded bg-gray-200">
                    <img src={newProduct.imageUrl} alt="Product preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 min-h-[60px] md:min-h-[80px] focus-within:bg-[#fffdf5] transition-colors">
              <div className="text-[16px] md:text-[20px] w-[24px] md:w-[28px] text-center shrink-0 mt-1 md:mt-2">D</div>
              <div className="flex-1 py-1">
                <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-0.5 block">
                  DESCRIPTION
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => onFieldChange("description", e.target.value)}
                  className="w-full bg-transparent border-none text-[12px] md:text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc] resize-none h-14 md:h-20"
                  placeholder="Product details and special notes..."
                />
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white px-4 py-3 md:px-5 md:py-4 flex gap-2 md:gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] shrink-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-[#f0f0f0] text-[#555] rounded-[14px] py-3 md:py-4 text-[11px] md:text-[13px] font-extrabold hover:bg-[#e8e8e8] transition-colors"
          >
            CANCEL
          </button>
          <button
            type="submit"
            form="add-product-form"
            disabled={submitting}
            className="flex-[2] bg-[#0E2A4A] text-white rounded-[14px] py-3 md:py-4 text-[12px] md:text-[14px] font-black tracking-[1px] disabled:opacity-60 hover:bg-[#1a3d6e] transition-colors hover:scale-[1.01]"
          >
            {submitting ? "SAVING..." : "SAVE PRODUCT"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;

