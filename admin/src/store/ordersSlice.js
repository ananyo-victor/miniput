import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchOrdersThunk = createAsyncThunk(
  "orders/fetch",
  async () => {
    const { data } = await axios.get(`${API_BASE_URL}/api/whatsapp/orders`);
    return data;
  }
);

export const acceptOrderThunk = createAsyncThunk(
  "orders/accept",
  async (orderId) => {
    const { data } = await axios.patch(
      `${API_BASE_URL}/api/whatsapp/${orderId}/accept`,
      {}
    );
    return data;
  }
);

export const rejectOrderThunk = createAsyncThunk(
  "orders/reject",
  async (orderId) => {
    const { data } = await axios.patch(
      `${API_BASE_URL}/api/whatsapp/${orderId}/reject`,
      {}
    );
    return data;
  }
);

export const sendQrThunk = createAsyncThunk(
  "orders/sendQr",
  async (orderId) => {
    const { data } = await axios.patch(
      `${API_BASE_URL}/api/whatsapp/${orderId}/send-qr`,
      {}
    );
    return data;
  }
);

export const paymentConfirmedThunk = createAsyncThunk(
  "orders/paymentConfirmed",
  async (orderId) => {
    const { data } = await axios.patch(
      `${API_BASE_URL}/api/whatsapp/${orderId}/payment-confirmed`,
      {}
    );
    return data;
  }
);

export const markPaymentReceivedThunk = createAsyncThunk(
  "orders/markPaymentReceived",
  async (orderId) => {
    const { data } = await axios.patch(
      `${API_BASE_URL}/api/whatsapp/${orderId}/payment-received`,
      {}
    );
    return data;
  }
);

export const markPaymentNotReceivedThunk = createAsyncThunk(
  "orders/markPaymentNotReceived",
  async (orderId) => {
    const { data } = await axios.patch(
      `${API_BASE_URL}/api/whatsapp/${orderId}/payment-not-received`,
      {}
    );
    return data;
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    orderReceived: (state, action) => {
      const exists = state.items.some((o) => o.id === action.payload.id);
      if (!exists) state.items.unshift(action.payload);
    },
    orderUpdated: (state, action) => {
      const idx = state.items.findIndex((o) => o.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrdersThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // Replace the updated order in-place for all status-changing actions
      .addCase(acceptOrderThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(rejectOrderThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(sendQrThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o.id === action.meta.arg.orderId);
        if (idx !== -1) state.items[idx].status = "payment_pending";
      })
      .addCase(paymentConfirmedThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o.id === action.meta.arg);
        if (idx !== -1) state.items[idx].status = "shipped";
      })
      .addCase(markPaymentReceivedThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o.id === action.meta.arg);
        if (idx !== -1) state.items[idx].status = "payment_received";
      })
      .addCase(markPaymentNotReceivedThunk.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o.id === action.meta.arg);
        if (idx !== -1) state.items[idx].status = "cancelled";
      });
  },
});

export const { orderReceived, orderUpdated } = ordersSlice.actions;

export default ordersSlice.reducer;
