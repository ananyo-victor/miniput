import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const buildRequestKey = (workspaceId = "") => String(workspaceId || "");

export const fetchHomeContent = createAsyncThunk(
  "home/fetchHomeContent",
  async ({ workspaceId } = {}, { rejectWithValue }) => {
    try {
      if (!workspaceId) {
        return {
          workspaceId: "",
          heroImageUrls: [],
          promoTags: []
        };
      }

      const { data } = await axios.get(`${API_BASE_URL}/api/content/home/workspace/${workspaceId}`);

      return {
        workspaceId,
        heroImageUrls: Array.isArray(data?.heroImageUrls) ? data.heroImageUrls.slice(0, 4) : [],
        promoTags: Array.isArray(data?.promoTags) ? data.promoTags : []
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || error?.message || "Failed to load home content."
      );
    }
  }
);

const initialState = {
  activeBrand: "Miniput",
  activeCategory: "all",
  searchQuery: "",
  heroImageUrls: [],
  promoTags: [],
  activeWorkspaceId: "",
  loadingHomeContent: false,
  homeContentError: "",
  currentRequestKey: ""
};

const homeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    setActiveBrand: (state, action) => {
      state.activeBrand = action.payload;
    },
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = String(action.payload || "");
    },
    setWorkspaceForBrand: (state, action) => {
      const workspaceId = typeof action.payload?.workspaceId === "string" ? action.payload.workspaceId : "";
      const brand = action.payload?.brand ? String(action.payload.brand) : state.activeBrand;

      state.activeBrand = brand;
      state.activeWorkspaceId = workspaceId;
      state.heroImageUrls = [];
      state.promoTags = [];
      state.loadingHomeContent = true;
      state.homeContentError = "";
      state.currentRequestKey = buildRequestKey(workspaceId);
    },
    resetHomeContentState: (state, action) => {
      const workspaceId = typeof action.payload?.workspaceId === "string" ? action.payload.workspaceId : "";

      state.heroImageUrls = [];
      state.promoTags = [];
      state.loadingHomeContent = true;
      state.homeContentError = "";
      state.currentRequestKey = buildRequestKey(workspaceId);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeContent.pending, (state, action) => {
        const workspaceId = action.meta.arg?.workspaceId || "";

        state.loadingHomeContent = true;
        state.homeContentError = "";
        state.currentRequestKey = buildRequestKey(workspaceId);
      })
      .addCase(fetchHomeContent.fulfilled, (state, action) => {
        const requestKey = buildRequestKey(action.payload?.workspaceId);
        if (state.currentRequestKey && state.currentRequestKey !== requestKey) {
          return;
        }

        state.loadingHomeContent = false;
        state.activeWorkspaceId = action.payload?.workspaceId || "";
        state.heroImageUrls = Array.isArray(action.payload?.heroImageUrls)
          ? action.payload.heroImageUrls
          : [];
        state.promoTags = Array.isArray(action.payload?.promoTags)
          ? action.payload.promoTags
          : [];
        state.currentRequestKey = requestKey;
      })
      .addCase(fetchHomeContent.rejected, (state, action) => {
        const requestKey = buildRequestKey(action.meta.arg?.workspaceId);
        if (state.currentRequestKey && state.currentRequestKey !== requestKey) {
          return;
        }

        state.loadingHomeContent = false;
        state.homeContentError = action.payload || "Failed to load home content.";
        state.heroImageUrls = [];
        state.promoTags = [];
      });
  }
});

export const {
  setActiveBrand,
  setActiveCategory,
  setSearchQuery,
  setWorkspaceForBrand,
  resetHomeContentState
} = homeSlice.actions;
export default homeSlice.reducer;
