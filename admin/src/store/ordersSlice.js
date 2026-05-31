import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Fetch Orders
export const fetchOrdersThunk = createAsyncThunk(
  "orders/fetch",
  async (workspaceId) => {
    // Replace with your actual API endpoint once backend is ready
    // const { data } = await axios.get(`${API_BASE_URL}/api/orders?workspaceId=${workspaceId}`);
    // return data;

    // Mock data for UI development
    return [
      { id: "ORD-001", customerName: "Rahul Sharma", phone: "9876543210", address: "Vijay Nagar, Indore", items: [{ name: "Baby Romper Set", qty: 2, price: 399 }], total: 798, status: "pending", date: new Date().toISOString() },
      { id: "ORD-002", customerName: "Priya Singh", phone: "9123456780", address: "Palasia, Indore", items: [{ name: "Toddler Denim Jacket", qty: 1, price: 799 }], total: 799, status: "accepted", date: new Date(Date.now() - 86400000).toISOString() },
      { id: "ORD-003", customerName: "Amit Kumar", phone: "9988776655", address: "Bhawarkuan, Indore", items: [{ name: "Kids Graphic Tee", qty: 1, price: 599 }], total: 599, status: "rejected", date: new Date(Date.now() - 172800000).toISOString() },
    ];
  }
);

// Update Order Status (Accept/Reject)
export const updateOrderStatusThunk = createAsyncThunk(
  "orders/updateStatus",
  async ({ orderId, status }) => {
    // const { data } = await axios.patch(`${API_BASE_URL}/api/orders/${orderId}/status`, { status });
    // return data;
    
    // Returning mock payload to update state
    return { orderId, status }; 
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchOrdersThunk.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchOrdersThunk.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(updateOrderStatusThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex(order => order.id === action.payload.orderId);
        if (index !== -1) {
          state.items[index].status = action.payload.status;
        }
      });
  }
});

export default ordersSlice.reducer;
