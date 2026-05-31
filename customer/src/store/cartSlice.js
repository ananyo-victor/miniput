import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { logoutCustomer } from "./authSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/cart`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    {
      productId,
      size,
      quantity,
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await axios.post(`${API_BASE_URL}/api/cart`, {
        productId,
        size,
        quantity,
      });

      dispatch(fetchCart());

      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add item"
      );
    }
  }
);

export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async (
    {
      cartItemId,
      quantity,
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/cart/${cartItemId}`, {
        quantity,
      });

      dispatch(fetchCart());

      return {
        cartItemId,
        quantity,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update quantity"
      );
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (cartItemId, { dispatch, rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/cart/${cartItemId}`);

      dispatch(fetchCart());

      return cartItemId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove item"
      );
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/cart/clear`);
      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to clear cart"
      );
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(clearCart.fulfilled, (state) => {
        state.items = [];
      })

      .addCase(addToCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(logoutCustomer, (state) => {
        state.items = [];
        state.loading = false;
        state.error = null;
      });
  },
});

export default cartSlice.reducer;
