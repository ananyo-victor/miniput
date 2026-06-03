import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const STORAGE_KEY = "miniput_activeWorkspaceId";

// Utility functions for localStorage
const saveActiveWorkspaceId = (workspaceId) => {
  try {
    if (workspaceId) {
      localStorage.setItem(STORAGE_KEY, workspaceId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.error("Failed to save workspace ID to localStorage:", error);
  }
};

const loadActiveWorkspaceId = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch (error) {
    console.error("Failed to load workspace ID from localStorage:", error);
    return "";
  }
};

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
  activeWorkspaceId: loadActiveWorkspaceId(),
  activeWorkspaceSlug: "",
  loading: false,
  error: "",
};

const normalizeWorkspaceSlug = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

const workspaceSlice = createSlice({
  name: "workspace",

  initialState,

  reducers: {
    setActiveWorkspace(state, action) {
      state.activeWorkspace = action.payload || null;
      state.activeWorkspaceId =
        action.payload?.id || "";
      state.activeWorkspaceSlug = normalizeWorkspaceSlug(action.payload?.slug || action.payload?.name);
      saveActiveWorkspaceId(state.activeWorkspaceId);
    },

    setActiveWorkspaceById(state, action) {
      const workspace =
        state.items.find(
          (item) => item.id === action.payload,
        ) || null;

      state.activeWorkspace = workspace;
      state.activeWorkspaceId =
        workspace?.id || "";
      state.activeWorkspaceSlug = normalizeWorkspaceSlug(workspace?.slug || workspace?.name);
      saveActiveWorkspaceId(state.activeWorkspaceId);
    },

    setActiveWorkspaceBySlug(state, action) {
      const workspaceSlug = normalizeWorkspaceSlug(action.payload);
      state.activeWorkspaceSlug = workspaceSlug;
      const workspace =
        state.items.find(
          (item) =>
            normalizeWorkspaceSlug(item?.slug || item?.name) === workspaceSlug,
        ) || null;

      state.activeWorkspace = workspace;
      state.activeWorkspaceId = workspace?.id || "";
      saveActiveWorkspaceId(state.activeWorkspaceId);
    },

    clearActiveWorkspace(state) {
      state.activeWorkspace = null;
      state.activeWorkspaceId = "";
      state.activeWorkspaceSlug = "";
      saveActiveWorkspaceId("");
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

          if (state.activeWorkspaceId) {
            const stillExists = action.payload.find(
              (item) => item.id === state.activeWorkspaceId,
            );
            if (stillExists) {
              state.activeWorkspace = stillExists;
              state.activeWorkspaceSlug = normalizeWorkspaceSlug(stillExists.slug || stillExists.name);
              saveActiveWorkspaceId(state.activeWorkspaceId);
              return;
            }
          }

          if (state.activeWorkspaceSlug) {
            const matchingWorkspace = action.payload.find(
              (item) =>
                normalizeWorkspaceSlug(item?.slug || item?.name) === state.activeWorkspaceSlug,
            );
            if (matchingWorkspace) {
              state.activeWorkspace = matchingWorkspace;
              state.activeWorkspaceId = matchingWorkspace.id;
              saveActiveWorkspaceId(state.activeWorkspaceId);
              return;
            }
          }

          if (!state.activeWorkspace && action.payload.length) {
            state.activeWorkspace = action.payload[0];
            state.activeWorkspaceId = action.payload[0].id;
            state.activeWorkspaceSlug = normalizeWorkspaceSlug(action.payload[0].slug || action.payload[0].name);
            saveActiveWorkspaceId(state.activeWorkspaceId);
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
  setActiveWorkspaceBySlug,
  clearActiveWorkspace,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
