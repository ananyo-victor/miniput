import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const emptyBrandContent = {
  heroImageUrls: [],
  promoTags: []
};

const normalizeWorkspaceSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

const findWorkspaceIdBySlug = (workspaces, slug) => {
  const match = Array.isArray(workspaces)
    ? workspaces.find((workspace) => normalizeWorkspaceSlug(workspace?.name) === slug)
    : null;
  return match?.id || "";
};

export const fetchHomeContent = createAsyncThunk(
  "home/fetchHomeContent",
  async (_, { rejectWithValue }) => {
    try {
      const { data: workspaces } = await axios.get(`${API_BASE_URL}/api/workspace`);

      const miniputWorkspaceId = findWorkspaceIdBySlug(workspaces, "miniput");
      const kwinkWorkspaceId = findWorkspaceIdBySlug(workspaces, "kwink");

      const [miniputRes, kwinkRes] = await Promise.all([
        miniputWorkspaceId
          ? axios.get(`${API_BASE_URL}/api/content/home/workspace/${miniputWorkspaceId}`)
          : Promise.resolve({ data: emptyBrandContent }),
        kwinkWorkspaceId
          ? axios.get(`${API_BASE_URL}/api/content/home/workspace/${kwinkWorkspaceId}`)
          : Promise.resolve({ data: emptyBrandContent })
      ]);

      return {
        Miniput: {
          heroImageUrls: Array.isArray(miniputRes?.data?.heroImageUrls)
            ? miniputRes.data.heroImageUrls.slice(0, 4)
            : [],
          promoTags: Array.isArray(miniputRes?.data?.promoTags) ? miniputRes.data.promoTags : []
        },
        Kwink: {
          heroImageUrls: Array.isArray(kwinkRes?.data?.heroImageUrls)
            ? kwinkRes.data.heroImageUrls.slice(0, 4)
            : [],
          promoTags: Array.isArray(kwinkRes?.data?.promoTags) ? kwinkRes.data.promoTags : []
        }
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || error?.message || "Failed to load home content."
      );
    }
  }
);

const homeSlice = createSlice({
  name: "home",
  initialState: {
    activeBrand: "Miniput",
    activeCategory: "all",
    searchQuery: "",
    homeContentByBrand: {
      Miniput: { ...emptyBrandContent },
      Kwink: { ...emptyBrandContent }
    },
    loadingHomeContent: false,
    homeContentError: ""
  },
  reducers: {
    setActiveBrand: (state, action) => {
      state.activeBrand = action.payload;
    },
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = String(action.payload || "");
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeContent.pending, (state) => {
        state.loadingHomeContent = true;
        state.homeContentError = "";
      })
      .addCase(fetchHomeContent.fulfilled, (state, action) => {
        state.loadingHomeContent = false;
        state.homeContentByBrand = action.payload;
      })
      .addCase(fetchHomeContent.rejected, (state, action) => {
        state.loadingHomeContent = false;
        state.homeContentError = action.payload || "Failed to load home content.";
        state.homeContentByBrand = {
          Miniput: { ...emptyBrandContent },
          Kwink: { ...emptyBrandContent }
        };
      });
  }
});

export const { setActiveBrand, setActiveCategory, setSearchQuery } = homeSlice.actions;
export default homeSlice.reducer;
