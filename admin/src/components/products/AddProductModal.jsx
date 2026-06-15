import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
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
  Loader2,
  Hash,
  ChevronDown,
  Star
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
  isEditing = false,
}) => {
  const workspaces = useSelector((state) => state.workspace.items);
  const activeWorkspace = useSelector((state) => state.user.activeWorkspace);
  const activeWorkspaceId = useSelector((state) => state.user.selectedWorkspaceId);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const selectedWorkspaceId = activeWorkspaceId || "";


  const miniputOptions = [
    { id: "group-1-8", label: "1 to 8 (20X28)", values: ["1", "2", "3", "4", "5", "6", "7", "8"] }
  ];

  const kwinkOptions = [
    { id: "group-10-16", label: "10 to 16 (30X36)", values: ["10", "12", "14", "16"] },
    { id: "group-6-16", label: "6 to 16 (26X36)", values: ["6", "8", "10", "12", "14", "16"] }
  ];

  const productCategoryOptions = [
    { value: "shirt", label: "Shirt" },
    { value: "pant", label: "Pant" },
    { value: "jacket", label: "Jacket" },
    { value: "set", label: "Set" },
    { value: "other", label: "Other" }
  ];
  const defaultCategory = productCategoryOptions[0]?.value || "";

  const activeWorkspaceName = activeWorkspace?.name?.toLowerCase() || "";

  const isKwinkWorkspace = activeWorkspaceName === "kwink";

  const sizeOptions = isKwinkWorkspace ? kwinkOptions : miniputOptions;

  useEffect(() => {
    if (show && !newProduct.workspaceId && selectedWorkspaceId) {
      onFieldChange("workspaceId", selectedWorkspaceId);
    }
  }, [show, newProduct.workspaceId, selectedWorkspaceId, onFieldChange]);

  useEffect(() => {
    if (!show) return;

    if (!newProduct.sizeGroup && sizeOptions.length > 0) {
      onFieldChange("sizeGroup", sizeOptions[0].label);
      onFieldChange("piecesPerPack", sizeOptions[0].values.length);
    }
  }, [show, newProduct.sizeGroup, sizeOptions, onFieldChange]);

  useEffect(() => {
    if (!show) return;

    if (!newProduct.category && defaultCategory) {
      onFieldChange("category", defaultCategory);
    }
  }, [show, newProduct.category, onFieldChange, defaultCategory]);

  const handleGroupChange = (values, label, isChecked) => {
    onFieldChange("sizeGroup", isChecked ? label : "");
    onFieldChange("piecesPerPack", isChecked ? values.length : 0);
  };

  const isGroupSelected = (label) => newProduct.sizeGroup === label;

  const hasUploadingImages = imageUploads.some((item) => item.uploading);

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-[16px] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col max-h-[80vh] md:max-h-[90vh] overflow-hidden animate-[sfadeUp_0.3s_ease]">

        {/* Modal Header */}
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 md:p-5 lg:p-8 bg-[#f5f5f5]">
          <form id="add-product-form" onSubmit={onSubmit} className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden">

            {/* ARTICLE ID FIELD */}
            <div className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 border-b border-[#f2f2f2] min-h-[50px] md:min-h-[60px] focus-within:bg-[#fffdf5] transition-colors">
              <div className="text-[#0E2A4A] w-[24px] md:w-[28px] text-center shrink-0">
                <Hash size={18} />
              </div>
              <div className="flex-1 py-1">
                <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-0.5 block">
                  ARTICLE ID <span className="text-[#D63031]">*</span>
                </label>
                <input
                  required
                  value={newProduct.articleId || ""}
                  onChange={(e) => onFieldChange("articleId", e.target.value)}
                  className="w-full bg-transparent border-none text-[12px] md:text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                  placeholder="e.g. ART-9921"
                />
              </div>
            </div>

            {/* PRODUCT NAME */}
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
                  value={newProduct.name || ""}
                  onChange={(e) => onFieldChange("name", e.target.value)}
                  className="w-full bg-transparent border-none text-[12px] md:text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                  placeholder="e.g. Babla Shirt"
                />
              </div>
            </div>

            {/* WORKSPACE SELECTION */}
            <div className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 border-b border-[#f2f2f2] min-h-[50px] md:min-h-[60px] bg-[#f8fafc]">
              <div className="text-[#0E2A4A] w-[24px] md:w-[28px] text-center shrink-0">
                <BadgeCheck size={18} />
              </div>

              <div className="flex-1 py-1">
                <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-0.5 block">
                  ACTIVE WORKSPACE
                </label>

                <div className="text-[13px] md:text-[15px] font-black text-[#0E2A4A]">
                  {activeWorkspace?.name || "No Workspace Selected"}
                </div>
              </div>
            </div>

            {/* CATEGORY SELECTION */}
            <div className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 border-b border-[#f2f2f2] min-h-[50px] md:min-h-[60px] focus-within:bg-[#fffdf5] transition-colors relative">
              <div className="text-[#0E2A4A] w-[24px] md:w-[28px] text-center shrink-0">
                <Shapes size={18} />
              </div>
              <div className="flex-1 py-1 relative">
                <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-1 block">
                  CATEGORY
                </label>

                {/* Custom Dropdown matching TopBar.jsx */}
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={() => setShowCategoryDropdown((prev) => !prev)}
                    className="w-full flex items-center justify-between text-[12px] md:text-[14px] font-bold text-[#1a1a1a] outline-none bg-transparent"
                  >
                    <span>
                      {productCategoryOptions.find(opt => opt.value === newProduct.category)?.label
                        || productCategoryOptions[0]?.label}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform duration-200 ${showCategoryDropdown ? "rotate-180 text-[#0E2A4A]" : ""}`}
                    />
                  </button>

                  {showCategoryDropdown && (
                    <div className="absolute top-full mt-3 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                      {productCategoryOptions.map((option) => {
                        const isActive = newProduct.category === option.value;
                        return (
                          <button
                            type="button"
                            key={option.value}
                            onClick={() => {
                              onFieldChange("category", option.value);
                              setShowCategoryDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-[12px] md:text-[14px] font-bold transition-all flex items-center justify-between ${isActive ? "bg-[#f0f7f8] text-[#0E2A4A]" : "text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            {option.label}
                            {isActive && <div className="w-2 h-2 rounded-full bg-[#0E2A4A]" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SIZES GROUP SELECTION */}
            <div className="flex items-start gap-2 md:gap-3 px-3 py-3 md:px-4 md:py-4 border-b border-[#f2f2f2] min-h-[60px] focus-within:bg-[#fffdf5] transition-colors">
              <div className="text-[#0E2A4A] w-[24px] md:w-[28px] text-center shrink-0 mt-1">
                <Ruler size={18} />
              </div>
              <div className="flex-1 py-1">
                <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-2 block">
                  SIZES <span className="text-[#D63031]">*</span>
                </label>

                <div className="flex flex-col gap-2 mt-1">
                  {sizeOptions.map((opt) => {
                    const isChecked = isGroupSelected(opt.label);

                    return (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-[12px] md:text-[13px] font-bold cursor-pointer select-none transition-all ${isChecked
                          ? "bg-[#0E2A4A]/5 border-[#0E2A4A] text-[#0E2A4A]"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            handleGroupChange(
                              opt.values,
                              opt.label,
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4 rounded border-gray-300 text-[#0E2A4A] focus:ring-[#0E2A4A]"
                        />

                        <div className="flex flex-col">
                          <span>{opt.label}</span>

                          <span className="text-[10px] text-gray-400 font-normal mt-0.5">
                            Pack includes sizes:
                            {" "}
                            {opt.values.join(", ")}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* PRICE & STOCK */}
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
                    value={newProduct.price || ""}
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
                    value={newProduct.stock || ""}
                    onChange={(e) => onFieldChange("stock", e.target.value)}
                    className="w-full bg-transparent border-none text-[12px] md:text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc]"
                    placeholder="Units available"
                  />
                </div>
              </div>
            </div>

            {/* IMAGES */}
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

            {/* DESCRIPTION */}
            <div className="flex items-start gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 min-h-[60px] md:min-h-[80px] focus-within:bg-[#fffdf5] transition-colors">
              <div className="text-[#0E2A4A] w-[24px] md:w-[28px] text-center shrink-0 mt-1 md:mt-2">
                <FileText size={18} />
              </div>
              <div className="flex-1 py-1">
                <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-0.5 block">
                  DESCRIPTION
                </label>
                <textarea
                  value={newProduct.description || ""}
                  onChange={(e) => onFieldChange("description", e.target.value)}
                  className="w-full bg-transparent border-none text-[12px] md:text-[14px] font-bold text-[#1a1a1a] outline-none placeholder:text-[#ccc] resize-none h-14 md:h-20"
                  placeholder="Product details and special notes..."
                />
              </div>
            </div>

            {/* PRODUCT BADGES / TAGS */}
            <div className="flex items-start gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 border-b border-[#f2f2f2] min-h-[60px] focus-within:bg-[#fffdf5] transition-colors">
              <div className="text-[#0E2A4A] w-[24px] md:w-[28px] text-center shrink-0 mt-1">
                <Star size={18} />
              </div>
              <div className="flex-1 py-1">
                <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-2 block">
                  PRODUCT BADGES
                </label>
                <div className="flex flex-wrap gap-4 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProduct.isTrending || false}
                      onChange={(e) => onFieldChange("isTrending", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0E2A4A] focus:ring-[#0E2A4A]"
                    />
                    <span className="text-[10px] md:text-[12px] font-bold text-[#1a1a1a]">Trending</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProduct.isBestseller || false}
                      onChange={(e) => onFieldChange("isBestseller", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0E2A4A] focus:ring-[#0E2A4A]"
                    />
                    <span className="text-[10px] md:text-[12px] font-bold text-[#1a1a1a]">Bestseller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProduct.isNewRelease || false}
                      onChange={(e) => onFieldChange("isNewRelease", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0E2A4A] focus:ring-[#0E2A4A]"
                    />
                    <span className="text-[10px] md:text-[12px] font-bold text-[#1a1a1a]">New Release</span>
                  </label>
                </div>
              </div>
            </div>

            {/* DISCOUNT SECTION */}
            <div className="flex flex-col border-b border-[#f2f2f2] focus-within:bg-[#fffdf5] transition-colors">
              <div className="flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3">
                <div className="text-[#0E2A4A] w-[24px] md:w-[28px] text-center shrink-0">
                  <Tag size={18} />
                </div>
                <div className="flex-1 py-1">
                  <label className="flex items-center gap-2 cursor-pointer w-max">
                    <input
                      type="checkbox"
                      checked={newProduct.discountEnabled || false}
                      onChange={(e) => onFieldChange("discountEnabled", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-[#0E2A4A] focus:ring-[#0E2A4A]"
                    />
                    <span className="text-[10px] md:text-[12px] font-black tracking-[1.5px] text-[#1a1a1a] uppercase">
                      Enable Sale / Discount
                    </span>
                  </label>

                  {newProduct.discountEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                      <div>
                        <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-0.5 block">
                          Discount Type
                        </label>
                        <select
                          value={newProduct.discountType || "percent"}
                          onChange={(e) => onFieldChange("discountType", e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded p-1.5 text-[12px] font-bold outline-none"
                        >
                          <option value="percent">Percentage (%)</option>
                          <option value="fixed">Fixed Amount</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[7px] md:text-[9px] font-black tracking-[1.5px] text-[#888] uppercase mb-0.5 flex justify-between">
                          <span>Discount Value</span>
                          {newProduct.discountType === "percent" && (
                            <span className="text-gray-400 lowercase normal-case tracking-normal">(Max 90)</span>
                          )}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={newProduct.discountType === "percent" ? "90" : undefined}
                          value={newProduct.discountValue || ""}
                          onChange={(e) => {
                            let val = e.target.value;

                            if (val !== "") {
                              const num = Number(val);
                              const maxLimit = newProduct.discountType === "percent" ? 90 : Number(newProduct.price || 0);

                              if (num < 0) {
                                val = "0";
                              } else if (num > maxLimit) {
                                val = String(maxLimit);
                              }
                            }

                            onFieldChange("discountValue", val);
                          }}
                          className="w-full bg-white border border-gray-200 rounded p-1.5 text-[12px] font-bold outline-none"
                          placeholder="e.g. 20"
                        />
                      </div>
                      {/* Live Preview */}
                      <div className="md:col-span-2 mt-1 bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm">
                        <div>
                          <p className="text-[8px] md:text-[9px] text-green-800 font-black uppercase tracking-wider mb-1">Price Preview</p>
                          <div className="flex items-end gap-2">
                            <span className="text-xs text-green-600/70 line-through">₹{Number(newProduct.price || 0).toLocaleString()}</span>
                            <span className="text-lg md:text-xl font-black text-green-700">₹{
                              (() => {
                                const base = Number(newProduct.price || 0);
                                const val = Number(newProduct.discountValue || 0);
                                let fin = base;
                                if (newProduct.discountType === 'percent') fin = base - (base * Math.min(90, val) / 100);
                                else fin = Math.max(0, base - val);
                                return fin.toLocaleString();
                              })()
                            }</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Modal Actions Footer */}
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
