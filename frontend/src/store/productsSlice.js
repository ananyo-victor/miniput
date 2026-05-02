import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const fetchProducts = createAsyncThunk("products/fetch", async (includeHidden = false) => {
  const { data } = await axios.get(`${API_BASE_URL}/api/products${includeHidden ? "?includeHidden=true" : ""}`);
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
