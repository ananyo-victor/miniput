import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      workspaceId: typeof value.workspaceId === "string" ? value.workspaceId : "",
      badge: typeof value.badge === "string" ? value.badge : ""
    };
  }

  return {
    includeHidden: false,
    workspaceId: "",
    badge: ""
  };
};

const buildRequestKey = (value = {}) => {
  const options = normalizeFetchOptions(value);
  return JSON.stringify({
    includeHidden: Boolean(options.includeHidden),
    workspaceId: String(options.workspaceId || ""),
    badge: String(options.badge || "")
  });
};

export const fetchProducts = createAsyncThunk("products/fetch", async (options = false) => {
  const { includeHidden, workspaceId, badge } = normalizeFetchOptions(options);
  const query = new URLSearchParams();

  if (includeHidden) query.set("includeHidden", "true");
  if (workspaceId) query.set("workspaceId", workspaceId);
  if (badge) query.set("badge", badge);

  const queryString = query.toString();
  const { data } = await axios.get(`${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ""}`);
  return data;
});

const initialState = {
  items: [],
  loading: false,
  error: "",
  currentRequestKey: ""
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    resetProductsState: (state, action) => {
      const options = normalizeFetchOptions(action.payload || false);
      state.items = [];
      state.loading = true;
      state.error = "";
      state.currentRequestKey = buildRequestKey(options);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        state.loading = true;
        state.error = "";
        state.currentRequestKey = buildRequestKey(action.meta.arg);
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        const requestKey = buildRequestKey(action.meta.arg);
        if (state.currentRequestKey && state.currentRequestKey !== requestKey) {
          return;
        }

        state.loading = false;
        state.items = action.payload;
        state.currentRequestKey = requestKey;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        const requestKey = buildRequestKey(action.meta.arg);
        if (state.currentRequestKey && state.currentRequestKey !== requestKey) {
          return;
        }

        state.loading = false;
        state.error = action.error.message || "Failed loading products";
      });
  }
});

export const { resetProductsState } = productsSlice.actions;
export default productsSlice.reducer;
