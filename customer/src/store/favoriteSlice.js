import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { logoutCustomer } from "./authSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchFavorites = createAsyncThunk(
  "favorites/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/favorites`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch favorites"
      );
    }
  }
);

export const toggleFavorite = createAsyncThunk(
  "favorites/toggleFavorite",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/favorites/toggle`, {
        productId,
      });
      dispatch(fetchFavorites());
      return { productId, favorited: data.favorited };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update favorite"
      );
    }
  }
);

const favoriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleFavorite.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { productId, favorited } = action.payload;
        
        if (favorited) {
          const exists = state.items.some((item) => item.id === productId);
          if (!exists) {
            state.items.unshift({ id: productId }); 
          }
        } else {
          state.items = state.items.filter((item) => item.id !== productId);
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(logoutCustomer, (state) => {
        state.items = [];
        state.loading = false;
        state.error = null;
      });
  },
});

export const { clearFavorites } = favoriteSlice.actions;

export default favoriteSlice.reducer;