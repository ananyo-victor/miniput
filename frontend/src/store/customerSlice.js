import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const checkCustomerThunk = createAsyncThunk("customer/check", async (phone) => {
  const { data } = await axios.post(`${API_BASE_URL}/api/auth/customer/check`, { phone });
  return data;
});

export const verifyCustomerThunk = createAsyncThunk("customer/verify", async (payload) => {
  const { data } = await axios.post(`${API_BASE_URL}/api/auth/customer/verify`, payload);
  return data;
});

export const createOrderThunk = createAsyncThunk("customer/createOrder", async (payload) => {
  const { data } = await axios.post(`${API_BASE_URL}/api/orders`, payload);
  return data;
});

const initialState = {
  authStep: "mobile",
  phone: "",
  otp: "",
  email: "",
  exists: false,
  authed: false,
  cart: [],
  isCheckoutOpen: false,
  address: ""
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setCustomerField: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
    setAuthState: (state, action) => {
      Object.assign(state, action.payload);
    },
    addToCart: (state, action) => {
      const incoming = action.payload || {};
      const quantityToAdd = Number(incoming.quantity || 1);
      const existing = state.cart.find((item) => item.id === incoming.id || item._id === incoming._id);

      if (existing) {
        existing.quantity = Number(existing.quantity || 1) + quantityToAdd;
      } else {
        state.cart.push({ ...incoming, quantity: quantityToAdd });
      }
    },
    removeFromCart: (state, action) => {
      const idToRemove = action.payload;
      state.cart = state.cart.filter((item) => item.id !== idToRemove && item._id !== idToRemove);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cart.find((cartItem) => cartItem.id === id || cartItem._id === id);
      if (item && quantity >= 1) {
        item.quantity = quantity;
      }
    },
    clearCart: (state) => {
      state.cart = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkCustomerThunk.fulfilled, (state, action) => {
        state.exists = !!action.payload.exists;
        state.authStep = "otp";
      })
      .addCase(verifyCustomerThunk.fulfilled, (state, action) => {
        if (action.payload?.user?.email) {
          state.email = action.payload.user.email;
        }
      })
      .addCase(createOrderThunk.fulfilled, (state) => {
        state.cart = [];
        state.address = "";
        state.isCheckoutOpen = false;
      });
  }
});

export const { setCustomerField, setAuthState, addToCart, removeFromCart, updateQuantity, clearCart } = customerSlice.actions;
export default customerSlice.reducer;
