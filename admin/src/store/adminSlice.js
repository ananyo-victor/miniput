import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { fetchProducts } from "./productsSlice";
import { getAdminAccessToken, setAdminTokens, clearAdminToken } from "../utils/adminToken";

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
    return source.filter((url) => typeof url === "string" && url.trim()).map((url) => url.trim());
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
    brand: typeof payload.brand === "string" && payload.brand ? payload.brand : "Miniput",
    description: typeof payload.description === "string" ? payload.description : "",
    isHidden: Boolean(payload.isHidden),
    size: normalizedSizes,
    imageUrls: normalizeImageUrlList(payload.imageUrls, payload.imageUrl),
    discountType: discountEnabled ? payload.discountType || "percent" : null,
    discountValue: discountEnabled ? Number(payload.discountValue) || null : null,
  };
};

// --- AUTH & PRODUCTS THUNKS ---
export const adminStep1Thunk = createAsyncThunk("admin/step1", async ({ userId, password }) => {
  const { data } = await axios.post(`${API_BASE_URL}/api/auth/admin/step1`, { userId, password });
  return data;
});

export const adminLoginThunk = createAsyncThunk(
  "admin/login",
  async ({ userId, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/admin/login`, { userId, password });
      if (data.success && data.accessToken) {
        setAdminTokens(data.accessToken, data.refreshToken);
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const uploadProductImageThunk = createAsyncThunk("admin/uploadImage", async (file) => {
  const imageData = await fileToDataUrl(file);
  const { data } = await axios.post(
    `${API_BASE_URL}/api/uploads/product-image`,
    { imageData },
    { headers: getAdminAuthHeaders() }
  );
  return data;
});

export const deleteUploadedProductImageThunk = createAsyncThunk(
  "admin/deleteUploadedImage",
  async (publicId) => {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/uploads/delete-image`,
      { publicId },
      { headers: getAdminAuthHeaders() }
    );
    return data;
  }
);

export const createProductThunk = createAsyncThunk("admin/createProduct", async (payload, { dispatch }) => {
  const requestBody = buildCreateProductPayload(payload);
  const { data } = await axios.post(`${API_BASE_URL}/api/products`, requestBody, { headers: getAdminAuthHeaders() });
  await dispatch(fetchProducts(true));
  return data;
});


export const toggleProductVisibilityThunk = createAsyncThunk(
  "admin/toggleVisibility",
  async ({ id, isHidden }, { dispatch }) => {
    const { data } = await axios.patch(
      `${API_BASE_URL}/api/products/${id}/visibility`,
      { isHidden },
      { headers: getAdminAuthHeaders() }
    );
    await dispatch(fetchProducts(true));
    return data;
  }
);

export const deleteProductThunk = createAsyncThunk("admin/deleteProduct", async (id, { dispatch }) => {
  const { data } = await axios.delete(`${API_BASE_URL}/api/products/${id}`, { headers: getAdminAuthHeaders() });
  await dispatch(fetchProducts(true));
  return data;
});

export const updateProductThunk = createAsyncThunk("admin/updateProduct", async (payload, { dispatch }) => {
  const { id, ...updateData } = payload;
  const requestBody = buildCreateProductPayload(updateData);
  const { data } = await axios.put(`${API_BASE_URL}/api/products/${id}`, requestBody, { headers: getAdminAuthHeaders() });
  await dispatch(fetchProducts(true));
  return data;
});

export const fetchAboutContentThunk = createAsyncThunk("admin/fetchAboutContent", async () => {
  const { data } = await axios.get(`${API_BASE_URL}/api/content/about`);
  return data;
});

export const fetchBrandHomeContentThunk = createAsyncThunk("admin/fetchBrandHomeContent", async (brand) => {
  const { data } = await axios.get(`${API_BASE_URL}/api/content/home/${brand.toLowerCase()}`);
  return data;
});

export const updateAboutContentThunk = createAsyncThunk("admin/updateAboutContent", async (payload) => {
  const { data } = await axios.put(`${API_BASE_URL}/api/content/about`, payload, { headers: getAdminAuthHeaders() });
  return data;
});

export const updateBrandHomeContentThunk = createAsyncThunk("admin/updateBrandHomeContent", async ({ brand, payload }) => {
  const { data } = await axios.put(`${API_BASE_URL}/api/content/home/${brand.toLowerCase()}`, payload, { headers: getAdminAuthHeaders() });
  return data;
});

const initialState = {
  authStep: 1,
  userId: "",
  password: "",
  authed: false,
  view: "dashboard",
  showAdd: false,
  uploadStatus: "No image uploaded yet",
  authLoading: false,
  authError: "",
  productSaveLoading: false,
  editingProductId: null,
  newProduct: {
    articleId: "",
    name: "",
    category: "Kids Wear",
    brand: "Miniput",
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

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminField: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
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
    },
    setTokens: (state, action) => {},
    logout: (state) => {
      clearAdminToken();
      state.authed = false;
      state.userId = "";
      state.password = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(adminStep1Thunk.fulfilled, (state) => {
        state.authStep = 2;
      })
      .addCase(adminLoginThunk.pending, (state) => {
        state.authLoading = true;
        state.authError = "";
      })
      .addCase(adminLoginThunk.fulfilled, (state, action) => {
        state.authLoading = false;
        state.authError = "";
        state.authed = true;
      })
      .addCase(adminLoginThunk.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload || "Login failed";
      })
      .addCase(uploadProductImageThunk.pending, (state) => {
        state.uploadStatus = "Uploading...";
      })
      .addCase(uploadProductImageThunk.fulfilled, (state, action) => {
        const uploadedUrl = action.payload.imageUrl || "";
        if (uploadedUrl) {
          state.newProduct.imageUrls = [...(state.newProduct.imageUrls || []), uploadedUrl];
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
      });
  }
});

export const { setAdminField, setNewProductField, resetNewProduct, setEditingProductId, logout, setTokens } = adminSlice.actions;
export default adminSlice.reducer;
