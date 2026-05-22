import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const toSlug = (name) =>
  String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

export const fetchWorkspaces = createAsyncThunk("workspace/fetch", async () => {
  const { data } = await axios.get(`${API_BASE_URL}/api/workspace`);

  return (Array.isArray(data) ? data : []).map((workspace) => ({
    ...workspace,
    slug: toSlug(workspace.slug || workspace.name),
  }));
});

const initialState = {
  items: [],
  activeWorkspace: null,
  activeWorkspaceId: "",
  loading: false,
  error: "",
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    setActiveWorkspace(state, action) {
      const workspace = action.payload || null;
      state.activeWorkspace = workspace;
      state.activeWorkspaceId = workspace?.id || "";
    },

    setActiveWorkspaceById(state, action) {
      const workspace = state.items.find((item) => item.id === action.payload) || null;
      state.activeWorkspace = workspace;
      state.activeWorkspaceId = workspace?.id || "";
    },

    setActiveWorkspaceBySlug(state, action) {
      const targetSlug = toSlug(action.payload);
      const workspace = state.items.find((item) => toSlug(item.slug || item.name) === targetSlug) || null;
      state.activeWorkspace = workspace;
      state.activeWorkspaceId = workspace?.id || "";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;

        if (state.activeWorkspaceId) {
          const stillExists = action.payload.find((item) => item.id === state.activeWorkspaceId);
          if (stillExists) {
            state.activeWorkspace = stillExists;
            return;
          }
        }

        state.activeWorkspace = action.payload[0] || null;
        state.activeWorkspaceId = action.payload[0]?.id || "";
      })
      .addCase(fetchWorkspaces.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed loading workspaces";
      });
  },
});

export const { setActiveWorkspace, setActiveWorkspaceById, setActiveWorkspaceBySlug } = workspaceSlice.actions;

export default workspaceSlice.reducer;
