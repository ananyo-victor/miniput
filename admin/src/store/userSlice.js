import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const changePasswordThunk = createAsyncThunk(
  "user/changePassword",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/api/users/change-password`,
        payload
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Failed to change password"
      );
    }
  }
);

export const updateActiveWorkspaceThunk = createAsyncThunk(
  "user/updateActiveWorkspace",
  async ({ id, workspaceId }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/api/users/${id}/workspace/${workspaceId}`,
        {}
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Failed to update workspace"
      );
    }
  }
);

export const fetchActiveWorkspaceThunk = createAsyncThunk(
  "user/fetchActiveWorkspace",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/users/${id}/workspace`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Failed to fetch active workspace"
      );
    }
  }
);

export const fetchUserProfileThunk = createAsyncThunk(
  "user/fetchProfile",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/users/${id}`
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Failed to fetch profile"
      );
    }
  }
);

export const updateUserProfileThunk = createAsyncThunk(
  "user/updateProfile",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/api/users/${id}`,
        payload
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Failed to update profile"
      );
    }
  }
);

export const uploadProfilePictureThunk = createAsyncThunk(
  "user/uploadProfilePicture",
  async (imageData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/uploads/product-image`, {
        imageData,
      });

      if (data.success) {
        return data.imageUrl;
      }
      return rejectWithValue("Upload was not successful");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to upload image to S3");
    }
  }
);

const initialState = {
  profile: null,
  loading: false,
  error: "",
  successMessage: "",
  preferences: {
    theme: "light",
    sidebarCollapsed: false
  },
  permissions: [],
  selectedWorkspaceId: "",
  activeWorkspace: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.preferences.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.preferences.sidebarCollapsed = !state.preferences.sidebarCollapsed;
    },
    setSelectedWorkspace: (state, action) => {
      state.selectedWorkspaceId = action.payload;
    },
    setActiveWorkspaceLocal: (state, action) => {
      state.activeWorkspace = action.payload || null;
      state.selectedWorkspaceId = action.payload?.id || "";
    },
    clearUserError: (state) => {
      state.error = "";
    },
    clearUserSuccessMessage: (state) => {
      state.successMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changePasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = "";
        state.successMessage = "";
      })
      .addCase(changePasswordThunk.fulfilled, (state) => {
        state.loading = false;
        state.successMessage = "Password changed successfully";
      })
      .addCase(changePasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to change password";
      })
      .addCase(updateActiveWorkspaceThunk.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(updateActiveWorkspaceThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.selectedWorkspaceId = action.payload?.activeWorkspaceId || "";
        state.successMessage = "Workspace updated successfully";
      })
      .addCase(updateActiveWorkspaceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update workspace";
      })
      .addCase(fetchActiveWorkspaceThunk.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchActiveWorkspaceThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.activeWorkspace = action.payload || null;
        state.selectedWorkspaceId = action.payload?.id || "";
      })
      .addCase(fetchActiveWorkspaceThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch active workspace";
      })
      .addCase(fetchUserProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserProfileThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.successMessage =
          "Profile updated successfully";
      })
      .addCase(updateUserProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setTheme,
  toggleSidebar,
  setSelectedWorkspace,
  setActiveWorkspaceLocal,
  clearUserError,
  clearUserSuccessMessage
} = userSlice.actions;

export default userSlice.reducer;
