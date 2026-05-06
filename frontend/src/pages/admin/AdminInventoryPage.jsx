import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../store/productsSlice";
import {
  createProductThunk,
  deleteProductThunk,
  quickAddStockThunk,
  resetNewProduct,
  setNewProductField,
  toggleProductVisibilityThunk,
  uploadProductImageThunk
} from "../../store/adminSlice";
import AddProductModal from "../../components/admin/AddProductModal";

const statusMeta = (stock) => {
  if (stock > 50) return { key: "in-stock", label: "IN STOCK" };
  if (stock > 15) return { key: "limited", label: "LIMITED" };
  return { key: "low", label: "LOW/OUT" };
};

const filters = [
  { id: "all", label: "ALL" },
  { id: "in-stock", label: "IN STOCK" },
  { id: "limited", label: "LIMITED" },
  { id: "low", label: "LOW/OUT" },
  { id: "hidden", label: "HIDDEN" }
];

const buildSizeVariants = (sizes, totalStock) => {
  if (!Array.isArray(sizes)) {
    return [];
  }

  const cleanedSizes = sizes
    .map((size) => String(size || "").trim())
    .filter(Boolean);

  if (!cleanedSizes.length) {
    return [];
  }

  const normalizedStock = Math.max(0, Math.floor(Number(totalStock) || 0));
  const baseStock = Math.floor(normalizedStock / cleanedSizes.length);
  let remainder = normalizedStock % cleanedSizes.length;

  return cleanedSizes.map((size) => {
    const extra = remainder > 0 ? 1 : 0;
    remainder = Math.max(0, remainder - 1);

    return {
      size,
      stock: baseStock + extra
    };
  });
};

const AdminInventoryPage = () => {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);
  const { newProduct } = useSelector((state) => state.admin);

  const [activeFilter, setActiveFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts(true));
  }, [dispatch]);

  const counts = useMemo(() => {
    const map = { all: products.length, "in-stock": 0, limited: 0, low: 0, hidden: 0 };

    products.forEach((product) => {
      const key = statusMeta(Number(product.stock || 0)).key;
      map[key] += 1;
      if (product.isHidden) {
        map.hidden += 1;
      }
    });

    return map;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (activeFilter === "all") {
      return products;
    }

    if (activeFilter === "hidden") {
      return products.filter((item) => item.isHidden);
    }

    return products.filter(
      (item) => !item.isHidden && statusMeta(Number(item.stock || 0)).key === activeFilter
    );
  }, [activeFilter, products]);

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  const handleOpenModal = () => setShowAddModal(true);

  const handleCloseModal = () => {
    setShowAddModal(false);
    setSubmitting(false);
    dispatch(resetNewProduct());
  };

  const handleFieldChange = (key, value) => {
    dispatch(setNewProductField({ key, value }));
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const stock = Number(newProduct.stock);
    const sizeVariants = buildSizeVariants(newProduct.sizes, stock);
    const payload = {
      ...newProduct,
      price: Number(newProduct.price),
      stock,
      sizes: sizeVariants
    };

    if (!sizeVariants.length) {
      delete payload.sizes;
    }

    const result = await dispatch(createProductThunk(payload));
    setSubmitting(false);
    if (createProductThunk.fulfilled.match(result)) {
      handleCloseModal();
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingImage(true);
    const result = await dispatch(uploadProductImageThunk(file));
    setUploadingImage(false);
    event.target.value = "";

    if (!uploadProductImageThunk.fulfilled.match(result)) {
      window.alert("Image upload failed. Please try again.");
    }
  };

  const handleDeleteImage = () => {
    dispatch(setNewProductField({ key: "imageUrl", value: "" }));
  };

  const handleQuickAdd = (product) =>
    dispatch(quickAddStockThunk({ id: product.id, stock: product.stock }));
  const handleToggleVisibility = (product) =>
    dispatch(toggleProductVisibilityThunk({ id: product.id, isHidden: !product.isHidden }));
  const handleDelete = (product) => {
    if (window.confirm(`Delete ${product.name}?`)) dispatch(deleteProductThunk(product.id));
  };

  const getStatusTone = (stock) => {
    const status = statusMeta(Number(stock || 0)).key;
    if (status === "in-stock") return "bg-[#e6f4ea] text-[#2d7d46]";
    if (status === "limited") return "bg-[#fff8e1] text-[#d49000]";
    return "bg-[#fde8e8] text-[#D63031]";
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f5] font-['Nunito',_sans-serif]">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-[#f0f0f0] px-5 py-4 md:px-8">
        <div>
          <h1 className="text-3xl md:text-4xl text-[#0E2A4A] tracking-[2px] font-['Bebas_Neue',_sans-serif] leading-none">
            MANAGE PRODUCTS
          </h1>
          <p className="text-[10px] md:text-[11px] font-bold text-[#888] tracking-[1.5px] mt-1 uppercase">
            Admin Inventory Dashboard
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenModal}
          className="rounded-[12px] bg-[#0E2A4A] px-5 py-3 text-[13px] md:text-[15px] font-extrabold text-white shadow-md transition-transform hover:scale-[1.02] hover:bg-[#1a3d6e]"
        >
          + ADD PRODUCT
        </button>
      </div>

      <div className="inv-tabs flex px-3.5 pt-2.5 pb-0 gap-5 bg-white border-b border-[#eee] overflow-x-auto shrink-0 scrollbar-hide">
        {filters.map((filter) => {
          const active = activeFilter === filter.id;
          let colorClass = "text-[#999]";
          let hoverClass = "";

          if (active) {
            if (filter.id === "in-stock") colorClass = "text-[#2d7d46]";
            else if (filter.id === "limited") colorClass = "text-[#d49000]";
            else if (filter.id === "low") colorClass = "text-[#D63031]";
            else colorClass = "text-[#0E2A4A]";
          } else {
            if (filter.id === "in-stock") hoverClass = "hover:text-[#2d7d46]";
            else if (filter.id === "limited") hoverClass = "hover:text-[#d49000]";
            else if (filter.id === "low") hoverClass = "hover:text-[#D63031]";
            else hoverClass = "hover:text-[#0E2A4A]";
          }

          return (
            <div
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`inv-tab pb-2 text-[13px] font-black tracking-[0.5px] cursor-pointer whitespace-nowrap border-b-[3px] transition-colors ${
                active
                  ? `border-current ${colorClass}`
                  : `border-transparent text-[#999] ${hoverClass}`
              }`}
            >
              {filter.label} ({counts[filter.id] ?? 0})
            </div>
          );
        })}
      </div>

      <div className="inv-list flex-1 overflow-y-auto px-4 py-3 pb-[100px] md:px-8 md:py-4 scrollbar-hide">
        <div className="max-w-7xl mx-auto">
          {loading && (
            <div className="rounded-2xl bg-white p-6 text-center text-sm font-bold text-[#666] shadow-md">
              Loading inventory...
            </div>
          )}
          {error && (
            <div className="rounded-2xl bg-[#fff5f5] p-6 text-center text-sm font-bold text-[#D63031] shadow-md">
              {error}
            </div>
          )}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="rounded-2xl bg-white p-6 text-center text-sm font-bold text-[#666] shadow-md">
              No products found in this category.
            </div>
          )}

          {!loading &&
            !error &&
            filteredProducts.map((product) => {
              const imageSrc = product.imageUrl || "";
              const sizes = Array.isArray(product.sizes)
                ? product.sizes.join(", ")
                : product.sizes || "-";
              const status = statusMeta(Number(product.stock || 0));

              return (
                <div
                  key={product.id}
                  className="inv-item flex flex-col bg-white rounded-2xl p-3.5 mb-2.5 shadow-md transition-transform hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3">
                    <div className="inv-img flex items-center justify-center flex-shrink-0 w-16 h-16 rounded-xl bg-[#e8e8e8] text-[28px] overflow-hidden">
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        product.name?.charAt(0)?.toUpperCase() || "P"
                      )}
                    </div>

                    <div className="inv-info flex-1">
                      <div className="inv-name text-sm font-black text-[#1a1a1a] uppercase">
                        {product.name}
                      </div>
                      <div className="inv-brand text-xs font-bold text-[#0E2A4A] mb-1">
                        {product.brand || "KWINK"}
                      </div>
                      <div className="inv-sizes text-xs text-[#666] tracking-wide mb-0.5">
                        SIZE {sizes}
                      </div>
                    </div>

                    <div className="inv-price-right flex-col items-end text-right">
                      <div
                        className={`status-badge text-xs font-black tracking-wide px-2 py-[3px] rounded-full mb-1 inline-block ${getStatusTone(
                          product.stock
                        )}`}
                      >
                        {status.label}
                      </div>
                      <div className="inv-unit-count text-xs text-[#999] leading-tight">
                        {product.stock ?? 0} UNITS
                      </div>
                      <div className="inv-price text-lg font-black text-[#1a1a1a]">
                        Rs.{product.price ?? 0}/-
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end border-t border-[#f0f0f0] pt-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(product)}
                      className="rounded-lg bg-[#f0f0f0] px-3 py-1.5 text-[11px] font-black text-[#555] hover:bg-[#e8e8e8] transition-colors"
                    >
                      +10 STOCK
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(product)}
                      className="rounded-lg bg-[#f0f0f0] px-3 py-1.5 text-[11px] font-black text-[#555] hover:bg-[#e8e8e8] transition-colors"
                    >
                      {product.isHidden ? "UNHIDE" : "HIDE"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      className="rounded-lg bg-[#fff5f5] px-3 py-1.5 text-[11px] font-black text-[#D63031] hover:bg-[#fde8e8] transition-colors"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <AddProductModal
        show={showAddModal}
        newProduct={newProduct}
        submitting={submitting}
        uploadingImage={uploadingImage}
        onClose={handleCloseModal}
        onSubmit={handleCreateProduct}
        onFieldChange={handleFieldChange}
        onImageUpload={handleImageUpload}
        onDeleteImage={handleDeleteImage}
      />
    </div>
  );
};

export default AdminInventoryPage;

