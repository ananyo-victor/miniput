import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (e) {
    return [];
  }
};

const initialState = {
  authStep: "mobile",
  phone: "",
  otp: "",
  email: "",
  exists: false,
  authed: false,
  cart: [],
  isCheckoutOpen: false,
  address: "",
  cart: loadCartFromStorage(),
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const newItem = {
        ...action.payload,
        cartItemId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      
      state.cart.push(newItem);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
  },
});

export const { addToCart } = customerSlice.actions;
export default customerSlice.reducer;
