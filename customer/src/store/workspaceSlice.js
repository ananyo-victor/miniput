import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchWorkspaces = createAsyncThunk(
  "workspace/fetch",
  async () => {
    const { data } = await axios.get(
      `${API_BASE_URL}/api/workspace`,
    );

    return data.map((workspace) => ({
      ...workspace,
      slug: String(workspace.name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-"),
    }));
  },
);

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
      state.activeWorkspace = action.payload || null;
      state.activeWorkspaceId =
        action.payload?.id || "";
    },

    setActiveWorkspaceById(state, action) {
      const workspace =
        state.items.find(
          (item) => item.id === action.payload,
        ) || null;

      state.activeWorkspace = workspace;
      state.activeWorkspaceId =
        workspace?.id || "";
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => {
        state.loading = true;
      })

      .addCase(
        fetchWorkspaces.fulfilled,
        (state, action) => {
          state.loading = false;
          state.items = action.payload;

          if (
            !state.activeWorkspace &&
            action.payload.length
          ) {
            state.activeWorkspace =
              action.payload[0];

            state.activeWorkspaceId =
              action.payload[0].id;
          }
        },
      )

      .addCase(
        fetchWorkspaces.rejected,
        (state, action) => {
          state.loading = false;
          state.error =
            action.error.message ||
            "Failed loading workspaces";
        },
      );
  },
});

export const {
  setActiveWorkspace,
  setActiveWorkspaceById,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;