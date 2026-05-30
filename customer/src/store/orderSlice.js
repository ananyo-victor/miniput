import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { clearCart } from "./cartSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const sanitizeOrderPayload = (payload = {}) => {
  const rest = { ...payload };
  delete rest.workspaceId;
  delete rest.brand;
  delete rest.variantId;

  const items = Array.isArray(payload?.items) ? payload.items : [];
  const sanitizedItems = items.map((item) => {
    if (!item || typeof item !== "object") {
      return item;
    }
    const nextItem = { ...item };
    delete nextItem.brand;
    delete nextItem.variantId;
    return nextItem;
  });

  return {
    ...rest,
    items: sanitizedItems
  };
};

export const createOrderThunk = createAsyncThunk(
  "orders/createOrder",
  async (payload, { dispatch, rejectWithValue }) => {
    try {
      const sanitizedPayload = sanitizeOrderPayload(payload);
      const { data } = await axios.post(`${API_BASE_URL}/api/orders`, sanitizedPayload);
      dispatch(clearCart());
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create order");
    }
  }
);

const orderSlice = createSlice({
  name: "orders",
  initialState: {
    creating: false,
    createError: "",
    lastCreatedOrder: null
  },
  reducers: {
    clearOrderError: (state) => {
      state.createError = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrderThunk.pending, (state) => {
        state.creating = true;
        state.createError = "";
      })
      .addCase(createOrderThunk.fulfilled, (state, action) => {
        state.creating = false;
        state.lastCreatedOrder = action.payload || null;
      })
      .addCase(createOrderThunk.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || "Failed to create order";
      });
  }
});

export const { clearOrderError } = orderSlice.actions;
export default orderSlice.reducer;
