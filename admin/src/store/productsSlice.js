import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getAdminAccessToken } from "../utils/adminToken";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAdminAuthHeaders = () => {
  if (typeof window === "undefined") {
    return {};
  }

  const token = getAdminAccessToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);

    reader.onerror = () => reject(new Error("Could not read file"));

    reader.readAsDataURL(file);
  });
}

const normalizeImageUrlList = (imageUrls, imageUrl) => {
  const source = Array.isArray(imageUrls) && imageUrls.length ? imageUrls : imageUrl;

  if (Array.isArray(source)) {
    return source
      .filter((url) => typeof url === "string" && url.trim())
      .map((url) => url.trim());
  }

  if (typeof source === "string" && source.trim()) {
    return [source.trim()];
  }

  return [];
};

const normalizeSizeList = (sizeValue) => {
  if (!Array.isArray(sizeValue)) {
    return [];
  }

  return sizeValue
    .map((item) => {
      if (item && typeof item === "object") {
        return Number(item.size);
      }
      return Number(item);
    })
    .filter((value) => Number.isFinite(value) && value >= 0);
};

const buildCreateProductPayload = (payload = {}) => {
  const normalizedSizes = normalizeSizeList(payload.size ?? payload.sizes);
  const discountEnabled = Boolean(payload.discountEnabled);

  return {
    articleId: typeof payload.articleId === "string" ? payload.articleId.trim() : "",
    name: typeof payload.name === "string" ? payload.name.trim() : "",
    category: typeof payload.category === "string" ? payload.category : "",
    price: Number(payload.price) || 0,
    stock: Number(payload.stock) || 0,
    workspaceId: payload.workspaceId || "",
    description: typeof payload.description === "string" ? payload.description : "",
    isHidden: Boolean(payload.isHidden),
    size: normalizedSizes,
    imageUrls: normalizeImageUrlList(payload.imageUrls, payload.imageUrl),
    discountType: discountEnabled ? payload.discountType || "percent" : null,
    discountValue: discountEnabled ? Number(payload.discountValue) || null : null
  };
};

const normalizeFetchOptions = (value = false) => {
  if (typeof value === "boolean") {
    return {
      includeHidden: value,
      workspaceId: ""
    };
  }

  if (value && typeof value === "object") {
    return {
      includeHidden: Boolean(value.includeHidden),
      workspaceId: typeof value.workspaceId === "string" ? value.workspaceId : ""
    };
  }

  return {
    includeHidden: false,
    workspaceId: ""
  };
};

export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (options = false) => {
    const { includeHidden, workspaceId } = normalizeFetchOptions(options);
    const query = new URLSearchParams();
    if (includeHidden) {
      query.set("includeHidden", "true");
    }
    if (workspaceId) {
      query.set("workspaceId", workspaceId);
    }

    const queryString = query.toString();
    const { data } = await axios.get(
      `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ""}`
    );

    return data;
  }
);

export const uploadProductImageThunk = createAsyncThunk(
  "products/uploadImage",
  async (file) => {
    const imageData = await fileToDataUrl(file);
    const { data } = await axios.post(
      `${API_BASE_URL}/api/uploads/product-image`,
      { imageData },
      {
        headers: getAdminAuthHeaders()
      }
    );

    return data;
  }
);

export const deleteUploadedProductImageThunk = createAsyncThunk(
  "products/deleteUploadedImage",
  async (publicId) => {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/uploads/delete-image`,
      { publicId },
      {
        headers: getAdminAuthHeaders()
      }
    );

    return data;
  }
);

export const createProductThunk = createAsyncThunk(
  "products/create",
  async (payload, { dispatch, getState }) => {
    const requestBody = buildCreateProductPayload(payload);
    const { data } = await axios.post(
      `${API_BASE_URL}/api/products`,
      requestBody,
      {
        headers: getAdminAuthHeaders()
      }
    );

    const activeWorkspaceId = getState()?.workspace?.activeWorkspaceId;
    await dispatch(fetchProducts({
      includeHidden: true,
      workspaceId: activeWorkspaceId
    }));

    return data;
  }
);

export const updateProductThunk = createAsyncThunk(
  "products/update",
  async (payload, { dispatch, getState }) => {
    const { id, ...updateData } = payload;
    const requestBody = buildCreateProductPayload(updateData);
    const { data } = await axios.put(
      `${API_BASE_URL}/api/products/${id}`,
      requestBody,
      {
        headers: getAdminAuthHeaders()
      }
    );

    const activeWorkspaceId = getState()?.workspace?.activeWorkspaceId;
    await dispatch(fetchProducts({
      includeHidden: true,
      workspaceId: activeWorkspaceId
    }));

    return data;
  }
);

export const deleteProductThunk = createAsyncThunk(
  "products/delete",
  async (id, { dispatch, getState }) => {
    const { data } = await axios.delete(`${API_BASE_URL}/api/products/${id}`,
      {
        headers: getAdminAuthHeaders()
      }
    );

    const activeWorkspaceId = getState()?.workspace?.activeWorkspaceId;
    await dispatch(fetchProducts({
      includeHidden: true,
      workspaceId: activeWorkspaceId
    }));

    return data;
  }
);

export const toggleProductVisibilityThunk = createAsyncThunk(
  "products/toggleVisibility",
  async ({ id, isHidden }) => {
    const { data } = await axios.patch(
      `${API_BASE_URL}/api/products/${id}/visibility`,
      { isHidden },
      {
        headers: getAdminAuthHeaders()
      }
    );

    return { ...data, id, isHidden };
  }
);

const initialState = {
  items: [],
  loading: false,
  error: "",
  view: "dashboard",
  showAdd: false,
  uploadStatus: "No image uploaded yet",
  productSaveLoading: false,
  visibilityUpdatingById: {},
  editingProductId: null,
  newProduct: {
    articleId: "",
    name: "",
    category: "Kids Wear",
    workspaceId: "",
    price: "",
    stock: "",
    sizes: [],
    imageUrl: "",
    imageUrls: [],
    description: "",
    discountEnabled: false,
    discountType: "percent",
    discountValue: ""
  }
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setNewProductField: (state, action) => {
      const { key, value } = action.payload;
      state.newProduct[key] = value;
    },
    setEditingProductId: (state, action) => {
      state.editingProductId = action.payload;
    },
    resetNewProduct: (state) => {
      state.newProduct = initialState.newProduct;
      state.uploadStatus = "No image uploaded yet";
      state.showAdd = false;
      state.editingProductId = null;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed loading products";
      })
      .addCase(uploadProductImageThunk.pending, (state) => {
        state.uploadStatus = "Uploading...";
      })
      .addCase(uploadProductImageThunk.fulfilled, (state, action) => {
        const uploadedUrl = action.payload.imageUrl || "";
        if (uploadedUrl) {
          state.newProduct.imageUrls =
            [
              ...(state.newProduct
                .imageUrls || []),
              uploadedUrl
            ];
          state.newProduct.imageUrl = state.newProduct.imageUrls[0] || uploadedUrl;
        }
        state.uploadStatus = "Uploaded successfully";
      })
      .addCase(uploadProductImageThunk.rejected, (state) => {
        state.uploadStatus = "Upload failed";
      })
      .addCase(createProductThunk.pending, (state) => {
        state.productSaveLoading = true;
      })
      .addCase(createProductThunk.fulfilled, (state) => {
        state.productSaveLoading = false;
        state.newProduct = initialState.newProduct;
        state.uploadStatus = "No image uploaded yet";
        state.showAdd = false;
      })
      .addCase(createProductThunk.rejected, (state) => {
        state.productSaveLoading = false;
      })
      .addCase(updateProductThunk.pending, (state) => {
        state.productSaveLoading = true;
      })
      .addCase(updateProductThunk.fulfilled, (state) => {
        state.productSaveLoading = false;
        state.newProduct = initialState.newProduct;
        state.uploadStatus = "No image uploaded yet";
        state.showAdd = false;
        state.editingProductId = null;
      })
      .addCase(updateProductThunk.rejected, (state) => {
        state.productSaveLoading = false;
      })
      .addCase(toggleProductVisibilityThunk.pending, (state, action) => {
        const { id, isHidden } = action.meta.arg;
        state.visibilityUpdatingById[id] = isHidden;
        state.items = state.items.map((item) =>
          item.id === id
            ? {
              ...item,
              isHidden
            }
            : item
        );
      })
      .addCase(toggleProductVisibilityThunk.fulfilled, (state, action) => {
        const { id, product, isHidden } = action.payload || {};
        if (id) {
          delete state.visibilityUpdatingById[id];
        }
        state.items = state.items.map((item) =>
          item.id === id
            ? {
              ...item,
              ...(product || {}),
              isHidden
            }
            : item
        );
      })
      .addCase(toggleProductVisibilityThunk.rejected, (state, action) => {
        const { id, isHidden } = action.meta.arg || {};
        if (!id) {
          return;
        }
        delete state.visibilityUpdatingById[id];
        state.items = state.items.map((item) =>
          item.id === id
            ? {
              ...item,
              isHidden: !isHidden
            }
            : item
        );
      });
  }
});

export const {
  setNewProductField,
  resetNewProduct,
  setEditingProductId
} = productsSlice.actions;

export default productsSlice.reducer;
