import { createSlice } from "@reduxjs/toolkit";
import { logoutCustomer } from "./authSlice";

const FAVORITES_STORAGE_KEY = "customerFavorites";

const loadFavoritesFromStorage = () => {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
};

const persistFavorites = (favorites) => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    // Ignore localStorage write errors in private mode or quota limits.
  }
};

const clearStoredFavorites = () => {
  try {
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
  } catch (error) {
    // Ignore localStorage cleanup failures.
  }
};

const getFavoriteId = (item) => item?.id || item?._id || item?.slug || item?.productId || "";

const favoriteSlice = createSlice({
  name: "favorites",
  initialState: {
    items: loadFavoritesFromStorage(),
  },
  reducers: {
    addFavorite: (state, action) => {
      const favoriteId = getFavoriteId(action.payload);
      if (!favoriteId) {
        return;
      }

      const exists = state.items.some((item) => getFavoriteId(item) === favoriteId);
      if (!exists) {
        state.items.push(action.payload);
        persistFavorites(state.items);
      }
    },
    removeFavorite: (state, action) => {
      const favoriteId = action.payload;
      state.items = state.items.filter((item) => getFavoriteId(item) !== favoriteId);
      persistFavorites(state.items);
    },
    toggleFavorite: (state, action) => {
      const favoriteId = getFavoriteId(action.payload);
      if (!favoriteId) {
        return;
      }

      const exists = state.items.some((item) => getFavoriteId(item) === favoriteId);
      if (exists) {
        state.items = state.items.filter((item) => getFavoriteId(item) !== favoriteId);
      } else {
        state.items.push(action.payload);
      }
      persistFavorites(state.items);
    },
    clearFavorites: (state) => {
      state.items = [];
      clearStoredFavorites();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logoutCustomer, (state) => {
      state.items = [];
      clearStoredFavorites();
    });
  },
});

export const { addFavorite, removeFavorite, toggleFavorite, clearFavorites } = favoriteSlice.actions;

export default favoriteSlice.reducer;
