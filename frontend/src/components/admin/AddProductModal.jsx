import React from "react";
import {
  X,
  Tag,
  BadgeCheck,
  Shapes,
  Ruler,
  IndianRupee,
  Boxes,
  ImagePlus,
  Trash2,
  FileText,
  Save,
  Loader2
} from "lucide-react";

const AddProductModal = ({
  show,
  newProduct,
  submitting,
  imageUploads,
  maxImages,
  removingImageId,
  onClose,
  onSubmit,
  onFieldChange,
  onImageUpload,
  onDeleteImage,
  isEditing = false
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

  const hasUploadingImages = imageUploads.some((item) => item.uploading);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-[16px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col max-h-[80vh] md:max-h-[90vh] overflow-hidden animate-[sfadeUp_0.3s_ease]">
        <div className="bg-[#0E2A4A] px-4 py-3 md:px-5 md:py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-[18px] md:text-[24px] text-white tracking-[2px] font-['Bebas_Neue',_sans-serif] leading-none">
              {isEditing ? "EDIT PRODUCT" : "ADD NEW PRODUCT"}
            </h2>
            <p className="text-[8px] md:text-[10px] text-white/55 font-bold tracking-[1px] mt-1">
              {isEditing ? "UPDATE PRODUCT DETAILS" : "ENTER DETAILS TO UPDATE INVENTORY"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-[32px] h-[32px] md:w-[36px] md:h-[36px] bg-white/15 rounded-full flex items-center justify-center text-white text-[16px] md:text-[18px] hover:bg-white/25 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-8 bg-[#f5f5f5]">
          <form id="add-product-form" onSubmit={onSubmit} className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden">
            <div className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 border-b border-[#f2f2f2] min-h-[50px] md:min-h-[60px] focus-within:bg-[#fffdf5] transition-colors">
              <div className="text-[#0E2A4A] w-[24px] md:w-[28px] text-center shrink-0">
                <Tag size={18} />
              </div>
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
              <div className="text-[#0E2A4A] w-[24px] md:w-[28px] text-center shrink-0">
                <BadgeCheck size={18} />
              </div>
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
              <div className="text-[#0E2A4A] w-[24px] md:w-[28px] text-center shrink-0">
                <Shapes size={18} />
              </div>
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
              <div className="text-[#0E2A4A] w-[24px] md:w-[28px] text-center shrink-0">
                <Ruler size={18} />
              </div>
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
                <div className="text-[#0E2A4A] w-[24px] md:w-[28px] text-center shrink-0">
                  <IndianRupee size={18} />
                </div>
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
                <div className="text-[#0E2A4A] w-[24px] md:w-[28px] text-center shrink-0">
                  <Boxes size={18} />
                </div>
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
              <div className="text-[#0E2A4A] w-[24px] md:w-[28px] text-center shrink-0">
                <ImagePlus size={18} />
              </div>
              <div className="flex-1 py-1">
                <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-0.5 block">
                  IMAGE
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  multiple
                  className="hidden"
                  id="image-upload"
                  disabled={imageUploads.length >= maxImages}
                />
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="image-upload"
                    className={`cursor-pointer rounded px-2 md:px-3 py-1.5 md:py-2 text-[11px] md:text-[13px] font-bold transition-colors inline-flex items-center gap-1.5 ${imageUploads.length >= maxImages ? "bg-[#ddd] text-[#777] cursor-not-allowed" : "bg-[#f0f0f0] text-[#555] hover:bg-[#e8e8e8]"}`}
                  >
                    <ImagePlus size={14} />
                    {imageUploads.length >= maxImages ? "Limit Reached" : "Upload Images"}
                  </label>
                </div>
                <p className="mt-1 text-[10px] md:text-[11px] text-[#777] font-bold">
                  {imageUploads.length}/{maxImages} images
                </p>
                {imageUploads.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {imageUploads.map((item) => (
                      <div
                        key={item.localId}
                        className="relative h-12 md:h-16 w-12 md:w-16 overflow-hidden rounded bg-gray-200 border border-[#e5e5e5]"
                      >
                        <img src={item.previewUrl} alt="Product preview" className="h-full w-full object-cover" />

                        {item.uploading && (
                          <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                            <Loader2 size={16} className="animate-spin text-white" />
                          </div>
                        )}

                        {!item.uploading && (
                          <button
                            type="button"
                            onClick={() => onDeleteImage(item)}
                            disabled={removingImageId === item.localId}
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#D63031] text-white flex items-center justify-center disabled:opacity-60"
                            aria-label="Remove image"
                          >
                            {removingImageId === item.localId ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : (
                              <Trash2 size={11} />
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 min-h-[60px] md:min-h-[80px] focus-within:bg-[#fffdf5] transition-colors">
              <div className="text-[#0E2A4A] w-[24px] md:w-[28px] text-center shrink-0 mt-1 md:mt-2">
                <FileText size={18} />
              </div>
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
            className="flex-1 bg-[#f0f0f0] text-[#555] rounded-[14px] py-3 md:py-4 text-[11px] md:text-[13px] font-extrabold hover:bg-[#e8e8e8] transition-colors inline-flex items-center justify-center gap-2"
          >
            <X size={14} />
            CANCEL
          </button>
          <button
            type="submit"
            form="add-product-form"
            disabled={submitting || hasUploadingImages}
            className="flex-[2] bg-[#0E2A4A] text-white rounded-[14px] py-3 md:py-4 text-[12px] md:text-[14px] font-black tracking-[1px] disabled:opacity-60 hover:bg-[#1a3d6e] transition-colors hover:scale-[1.01] inline-flex items-center justify-center gap-2"
          >
            <Save size={14} />
            {submitting ? "SAVING..." : hasUploadingImages ? "WAITING FOR IMAGES..." : isEditing ? "UPDATE PRODUCT" : "SAVE PRODUCT"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
