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

export const checkCustomerThunk = createAsyncThunk("customer/check", async (phone) => {
  const { data } = await axios.post(`${API_BASE_URL}/api/auth/customer/check`, { phone });
  return data;
});

export const verifyCustomerThunk = createAsyncThunk("customer/verify", async (payload) => {
  const { data } = await axios.post(`${API_BASE_URL}/api/auth/customer/verify`, payload);
  return data;
});

const sanitizeOrderPayload = (payload = {}) => {
  const rest = { ...payload };
  delete rest.workspaceId;
  delete rest.brand;
  delete rest.variantId;
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const sanitizedItems = Array.isArray(items)
    ? items.map((item) => {
      if (!item || typeof item !== "object") {
        return item;
      }
      const nextItem = { ...item };
      delete nextItem.brand;
      delete nextItem.variantId;
      return nextItem;
    })
    : [];

  return {
    ...rest,
    items: sanitizedItems,
  };
};

export const createOrderThunk = createAsyncThunk("customer/createOrder", async (payload) => {
  const sanitizedPayload = sanitizeOrderPayload(payload);
  const { data } = await axios.post(`${API_BASE_URL}/api/orders`, sanitizedPayload);
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
  address: "",
  cart: loadCartFromStorage(),
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
      const product = action.payload;

      const effectivePrice = product.isDiscountActive ? product.finalPrice : product.price;

      const newItem = {
        ...product,
        price: effectivePrice,
        originalPrice: product.isDiscountActive ? (product.originalPrice ?? product.price) : product.price,
        cartItemId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      state.cart.push(newItem);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item.cartItemId !== action.payload);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cart.find((item) => item.cartItemId === id);
      if (item) {
        item.quantity = quantity;
      }
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    clearCart: (state) => {
      state.cart = [];
      localStorage.removeItem("cart");
    },
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
