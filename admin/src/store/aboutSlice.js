import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { getAdminAccessToken } from "../utils/adminToken";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const getAdminAuthHeaders = () => {
  if (typeof window === "undefined") {
    return {};
  }

  const token = getAdminAccessToken();

  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchAboutContentThunk = createAsyncThunk(
  "about/fetchAboutContent",
  async () => {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/content/about`
    );

    return data;
  }
);

export const fetchWorkspaceHomeContentThunk = createAsyncThunk(
  "about/fetchWorkspaceHomeContent",
  async (workspaceId) => {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/content/home/workspace/${workspaceId}`
    );

    return data;
  }
);

export const updateAboutContentThunk = createAsyncThunk(
  "about/updateAboutContent",
  async (payload) => {
    const { data } = await axios.put(
      `${API_BASE_URL}/api/content/about`,
      payload,
      {
        headers: getAdminAuthHeaders()
      }
    );

    return data;
  }
);

export const updateWorkspaceHomeContentThunk = createAsyncThunk(
  "about/updateWorkspaceHomeContent",
  async ({ workspaceId, payload }) => {
    const { data } = await axios.put(
      `${API_BASE_URL}/api/content/home/workspace/${workspaceId}`,
      payload,
      {
        headers: getAdminAuthHeaders()
      }
    );

    return data;
  }
);

const initialState = {
  aboutContent: null,
  homeContent: null,
  loading: false,
  error: null
};

const aboutSlice = createSlice({
  name: "about",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAboutContentThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAboutContentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.aboutContent = action.payload;
      })
      .addCase(fetchAboutContentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchWorkspaceHomeContentThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWorkspaceHomeContentThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.homeContent = action.payload;
      })
      .addCase(fetchWorkspaceHomeContentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateAboutContentThunk.fulfilled, (state, action) => {
        state.aboutContent = action.payload;
      })
      .addCase(updateWorkspaceHomeContentThunk.fulfilled, (state, action) => {
        state.homeContent = action.payload;
      });
  }
});

export default aboutSlice.reducer;
