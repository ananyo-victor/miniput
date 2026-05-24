import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const normalizeHomeContent = (data) => ({
  heroImageUrls: Array.isArray(data?.heroImageUrls) ? data.heroImageUrls.slice(0, 4) : [],
  promoTags: Array.isArray(data?.promoTags) ? data.promoTags : []
});

export const fetchWorkspaceHomeContentThunk = createAsyncThunk(
  "home/fetchWorkspaceHomeContent",
  async (workspaceId) => {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/content/home/workspace/${workspaceId}`
    );

    return normalizeHomeContent(data);
  }
);

const homeSlice = createSlice({
  name: "home",

  initialState: {
    activeCategory: "all",
    searchQuery: "",
    homeContent: {
      heroImageUrls: [],
      promoTags: []
    },
    loading: false,
    error: null
  },

  reducers: {
    setActiveCategory(state, action) {
      state.activeCategory =
        action.payload;
    },
    setSearchQuery(state, action) {
      state.searchQuery = String(action.payload || "");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaceHomeContentThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWorkspaceHomeContentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.homeContent = action.payload;
      })
      .addCase(fetchWorkspaceHomeContentThunk.rejected, (state, action) => {
        state.loading = false;
        state.homeContent = {
          heroImageUrls: [],
          promoTags: []
        };
        state.error = action.error.message || "Failed to fetch home content";
      });
  }
});

export const {
  setActiveCategory,
  setSearchQuery,
} = homeSlice.actions;

export default homeSlice.reducer;
