import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      payload
    );

    return data;
  }
);

export const updateWorkspaceHomeContentThunk = createAsyncThunk(
  "about/updateWorkspaceHomeContent",
  async ({ workspaceId, payload }) => {
    const { data } = await axios.put(
      `${API_BASE_URL}/api/content/home/workspace/${workspaceId}`,
      payload
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
      .addCase(updateAboutContentThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAboutContentThunk.fulfilled, (state, action) => {
        state.aboutContent = action.payload;
      })
      .addCase(updateAboutContentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(updateWorkspaceHomeContentThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateWorkspaceHomeContentThunk.fulfilled, (state, action) => {
        state.homeContent = action.payload;
      })
      .addCase(updateWorkspaceHomeContentThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export default aboutSlice.reducer;
