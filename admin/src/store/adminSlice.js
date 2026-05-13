import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { fetchProducts } from "./productsSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAdminAuthHeaders = () => {
  if (typeof window === "undefined") {
    return {};
  }

  const token = window.localStorage.getItem("adminToken");
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

export const adminStep1Thunk = createAsyncThunk("admin/step1", async ({ userId, password }) => {
  const { data } = await axios.post(`${API_BASE_URL}/api/auth/admin/step1`, { userId, password });
  return data;
});

export const adminLoginThunk = createAsyncThunk(
  "admin/login",
  async ({ userId, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/admin/login`, { userId, password });
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

export const createProductThunk = createAsyncThunk("admin/createProduct", async (payload, { dispatch }) => {
  const { data } = await axios.post(`${API_BASE_URL}/api/products`, payload, { headers: getAdminAuthHeaders() });
  await dispatch(fetchProducts(true));
  return data;
});

export const quickAddStockThunk = createAsyncThunk(
  "admin/quickAddStock",
  async ({ id, stock }, { dispatch }) => {
    const { data } = await axios.put(
      `${API_BASE_URL}/api/products/${id}`,
      { stock: Number(stock || 0) + 10 },
      { headers: getAdminAuthHeaders() }
    );
    await dispatch(fetchProducts(true));
    return data;
  }
);

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
  newProduct: {
    name: "",
    category: "Kids Wear",
    brand: "Miniput",
    price: "",
    stock: "",
    sizes: [],
    imageUrl: "",
    description: ""
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
    resetNewProduct: (state) => {
      state.newProduct = initialState.newProduct;
      state.uploadStatus = "No image uploaded yet";
      state.showAdd = false;
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
        if (action.payload?.token) {
          localStorage.setItem("adminToken", action.payload.token);
        }
      })
      .addCase(adminLoginThunk.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload || "Login failed";
      })
      .addCase(uploadProductImageThunk.pending, (state) => {
        state.uploadStatus = "Uploading...";
      })
      .addCase(uploadProductImageThunk.fulfilled, (state, action) => {
        state.newProduct.imageUrl = action.payload.imageUrl;
        state.uploadStatus = "Uploaded successfully";
      })
      .addCase(uploadProductImageThunk.rejected, (state) => {
        state.uploadStatus = "Upload failed";
      })
      .addCase(createProductThunk.fulfilled, (state) => {
        state.newProduct = initialState.newProduct;
        state.uploadStatus = "No image uploaded yet";
        state.showAdd = false;
      });
  }
});

export const { setAdminField, setNewProductField, resetNewProduct } = adminSlice.actions;
export default adminSlice.reducer;

