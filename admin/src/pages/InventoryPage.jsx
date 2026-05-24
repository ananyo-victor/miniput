import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createProductThunk,
  deleteProductThunk,
  deleteUploadedProductImageThunk,
  fetchProducts,
  resetNewProduct,
  setEditingProductId,
  setNewProductField,
  toggleProductVisibilityThunk,
  updateProductThunk,
  uploadProductImageThunk
} from "../store/productsSlice";
import AddProductModal from "../components/products/AddProductModal";
import DeleteProductModal from "../components/products/DeleteProductModal";
import InventoryProductListSkeleton from "../components/skeletonLoader/InventoryProductListSkeleton";

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

const toImageUrlList = (value) => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.trim());
  }

  if (typeof value === "string" && value.trim()) {
    return [value];
  }

  return [];
};

const getPublicIdFromImageUrl = (url) => {
  if (typeof url !== "string" || !url.trim()) {
    return "";
  }

  try {
    const parsed = new URL(url);
    return parsed.pathname.replace(/^\/+/, "");
  } catch {
    return "";
  }
};

const InventoryPage = () => {
  const dispatch = useDispatch();
  const {
    items: products,
    loading,
    error,
    newProduct,
    editingProductId,
    productSaveLoading,
    visibilityUpdatingById
  } = useSelector((state) => state.products);
  const activeWorkspace = useSelector((state) => state.user.activeWorkspace);
  const activeWorkspaceId = useSelector((state) => state.user.selectedWorkspaceId);

  const [activeFilter, setActiveFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [imageUploads, setImageUploads] = useState([]);
  const [removingImageId, setRemovingImageId] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const maxImages = 9;

  useEffect(() => {
    dispatch(fetchProducts({ includeHidden: true, workspaceId: activeWorkspaceId }));
  }, [dispatch, activeWorkspaceId]);

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

  const handleOpenModal = () => {
    dispatch(setNewProductField({ key: "workspaceId", value: activeWorkspaceId || "" }));
    setShowAddModal(true);
  };

  const handleEditProduct = (product) => {
    dispatch(setNewProductField({ key: "articleId", value: product.articleId || "" }));
    dispatch(setNewProductField({ key: "name", value: product.name }));
    dispatch(setNewProductField({ key: "category", value: product.category || "Kids Wear" }));
    dispatch(setNewProductField({ key: "workspaceId", value: product.workspaceId || activeWorkspaceId || "" }));
    dispatch(setNewProductField({ key: "price", value: product.price }));
    dispatch(setNewProductField({ key: "stock", value: product.stock }));

    const sizes = Array.isArray(product.sizes)
      ? product.sizes.map(s => typeof s === 'object' ? String(s.size) : String(s))
      : (product.sizes ? String(product.sizes).split(",").map(s => s.trim()) : []);
    dispatch(setNewProductField({ key: "sizes", value: sizes }));
    const imageUrlsFromList = toImageUrlList(product.imageUrls);
    const existingImageUrls = imageUrlsFromList.length
      ? imageUrlsFromList
      : toImageUrlList(product.imageUrl);

    dispatch(setNewProductField({ key: "imageUrl", value: existingImageUrls[0] || "" }));
    dispatch(setNewProductField({ key: "imageUrls", value: existingImageUrls }));
    dispatch(setNewProductField({ key: "description", value: product.description || "" }));
    dispatch(setNewProductField({ key: "discountEnabled", value: Boolean(product.discountType) }));
    dispatch(setNewProductField({ key: "discountType", value: product.discountType || "percent" }));
    dispatch(setNewProductField({ key: "discountValue", value: product.discountValue || "" }));

    const newImageUploads = existingImageUrls.map((url, idx) => ({
      localId: `existing-${product.id}-${idx}`,
      previewUrl: url,
      uploading: false,
      imageUrl: url,
      publicId: getPublicIdFromImageUrl(url)
    }));
    setImageUploads(newImageUploads);

    dispatch(setEditingProductId(product.id));
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    imageUploads.forEach((item) => {
      if (item.previewUrl && item.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setShowAddModal(false);
    setImageUploads([]);
    setRemovingImageId("");
    dispatch(resetNewProduct());
  };

  const handleFieldChange = (key, value) => {
    dispatch(setNewProductField({ key, value }));
  };

  const handleCreateProduct = async (event) => {
    event.preventDefault();

    if (imageUploads.some((item) => item.uploading)) {
      window.alert("Please wait for all images to finish uploading.");
      return;
    }

    const stock = Number(newProduct.stock);
    const numericalSizesArray = Array.isArray(newProduct.sizes)
      ? newProduct.sizes.map((s) => Number(s)).filter((n) => !isNaN(n))
      : [];
    const sizeVariants = buildSizeVariants(numericalSizesArray, stock);

    const newImages = imageUploads.filter(item => !item.localId.startsWith('existing-'));

    const allImageUrls = editingProductId
      ? imageUploads.filter((item) => !item.uploading && item.imageUrl).map((item) => item.imageUrl)
      : newImages.filter((item) => !item.uploading && item.imageUrl).map((item) => item.imageUrl);

    if (!activeWorkspaceId) {
      window.alert("Please select a workspace.");
      return;
    }

    const payload = {
      ...newProduct,
      workspaceId: activeWorkspaceId,
      price: Number(newProduct.price),
      stock,
      imageUrls: allImageUrls
    };

    if (sizeVariants.length) {
      payload.sizes = sizeVariants;
    }

    payload.imageUrl = payload.imageUrls[0] || "";

    if (!sizeVariants.length) {
      delete payload.sizes;
    }

    let result;
    if (editingProductId) {
      result = await dispatch(updateProductThunk({ id: editingProductId, ...payload }));
    } else {
      result = await dispatch(createProductThunk(payload));
    }

    if ((editingProductId && updateProductThunk.fulfilled.match(result)) ||
      (!editingProductId && createProductThunk.fulfilled.match(result))) {
      handleCloseModal();
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) {
      return;
    }

    const availableSlots = Math.max(0, maxImages - imageUploads.length);
    const selectedFiles = files.slice(0, availableSlots);
    if (!selectedFiles.length) {
      event.target.value = "";
      window.alert(`You can upload up to ${maxImages} images only.`);
      return;
    }

    if (files.length > availableSlots) {
      window.alert(`Only ${availableSlots} image slot(s) were available. Extra files were ignored.`);
    }

    const pendingItems = selectedFiles.map((file) => {
      const localId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      return {
        localId,
        previewUrl: URL.createObjectURL(file),
        uploading: true,
        imageUrl: "",
        publicId: ""
      };
    });

    setImageUploads((prev) => [...prev, ...pendingItems]);
    event.target.value = "";

    await Promise.all(
      pendingItems.map(async (item, index) => {
        const result = await dispatch(uploadProductImageThunk(selectedFiles[index]));

        if (uploadProductImageThunk.fulfilled.match(result)) {
          const { imageUrl, publicId } = result.payload;
          setImageUploads((prev) =>
            prev.map((upload) =>
              upload.localId === item.localId
                ? { ...upload, uploading: false, imageUrl: imageUrl || "", publicId: publicId || "" }
                : upload
            )
          );
        } else {
          setImageUploads((prev) => {
            const target = prev.find((upload) => upload.localId === item.localId);
            if (target?.previewUrl) {
              URL.revokeObjectURL(target.previewUrl);
            }
            return prev.filter((upload) => upload.localId !== item.localId);
          });
          window.alert("One image upload failed. Please try again.");
        }
      })
    );
  };

  const handleDeleteImage = async (uploadItem) => {
    if (!uploadItem || uploadItem.uploading) {
      return;
    }

    const publicId = uploadItem.publicId || getPublicIdFromImageUrl(uploadItem.imageUrl || uploadItem.previewUrl);
    if (!publicId) {
      window.alert("This image cannot be deleted because its storage key could not be resolved.");
      return;
    }

    setRemovingImageId(uploadItem.localId);
    const result = await dispatch(deleteUploadedProductImageThunk(publicId));
    setRemovingImageId("");

    if (!deleteUploadedProductImageThunk.fulfilled.match(result)) {
      window.alert("Failed to remove image from bucket. Please try again.");
      return;
    }

    setImageUploads((prev) => {
      const target = prev.find((item) => item.localId === uploadItem.localId);
      if (target?.previewUrl && target.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.localId !== uploadItem.localId);
    });
  };

  const handleToggleVisibility = (product) =>
    dispatch(toggleProductVisibilityThunk({ id: product.id, isHidden: !product.isHidden }));
  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    await dispatch(deleteProductThunk(productToDelete.id));
    setIsDeleting(false);
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  useEffect(
    () => () => {
      imageUploads.forEach((item) => {
        if (item.previewUrl && item.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    },
    [imageUploads]
  );

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
              className={`inv-tab pb-2 text-[13px] font-black tracking-[0.5px] cursor-pointer whitespace-nowrap border-b-[3px] transition-colors ${active
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
            <>
              {Array.from({ length: 6 }).map((_, index) => (
                <InventoryProductListSkeleton key={index} />
              ))}
            </>
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
              const sizes = Array.isArray(product.size)
                ? product.size.join(", ")
                : product.size || "-";
              const status = statusMeta(Number(product.stock || 0));
              const isVisibilityUpdating = Object.prototype.hasOwnProperty.call(
                visibilityUpdatingById,
                product.id
              );
              const targetHiddenState = visibilityUpdatingById[product.id];

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
                        {product.articleId || "-"}
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
                      onClick={() => handleEditProduct(product)}
                      className="rounded-lg bg-[#e3f2fd] px-3 py-1.5 text-[11px] font-black text-[#1976d2] hover:bg-[#bbdefb] transition-colors"
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(product)}
                      disabled={isVisibilityUpdating}
                      className="rounded-lg bg-[#f0f0f0] px-3 py-1.5 text-[11px] font-black text-[#555] hover:bg-[#e8e8e8] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isVisibilityUpdating
                        ? (targetHiddenState ? "HIDING..." : "UNHIDING...")
                        : (product.isHidden ? "UNHIDE" : "HIDE")}
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
        submitting={productSaveLoading}
        onClose={handleCloseModal}
        onSubmit={handleCreateProduct}
        onFieldChange={handleFieldChange}
        onImageUpload={handleImageUpload}
        imageUploads={imageUploads}
        maxImages={maxImages}
        removingImageId={removingImageId}
        onDeleteImage={handleDeleteImage}
        isEditing={!!editingProductId}
      />

      <DeleteProductModal
        show={showDeleteModal}
        product={productToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default InventoryPage;
