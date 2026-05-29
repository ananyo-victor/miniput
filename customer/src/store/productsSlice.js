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
      workspaceId: typeof value.workspaceId === "string" ? value.workspaceId : ""
    };
  }

  return {
    includeHidden: false,
    workspaceId: ""
  };
};

export const fetchProducts = createAsyncThunk("products/fetch", async (options = false) => {
  const { includeHidden, workspaceId } = normalizeFetchOptions(options);
  const query = new URLSearchParams();

  if (includeHidden) {
    query.set("includeHidden", "true");
  }

  if (workspaceId) {
    query.set("workspaceId", workspaceId);
  }

  const queryString = query.toString();
  const { data } = await axios.get(`${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ""}`);
  return data;
});

const productsSlice = createSlice({
  name: "products",
  initialState: { items: [], loading: false, error: "" },
  reducers: {},
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
      });
  }
});

export default productsSlice.reducer;
