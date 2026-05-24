import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const toSlug = (name) =>
  String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetch",
  async () => {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/workspace`
    );

    return (Array.isArray(data) ? data : []).map((workspace) => ({
      ...workspace,
      slug: toSlug(workspace.slug || workspace.name),
    }));
  }
);

const initialState = {
  items: [],
  loading: false,
  error: "",
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,

  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Failed loading workspaces";
      });
  },
});

export default workspaceSlice.reducer;