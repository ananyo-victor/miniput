import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import {
  setAdminTokens,
  clearAdminToken
} from "../utils/adminToken";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const adminLoginThunk = createAsyncThunk(
  "admin/login",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/auth/admin/login`,
        { username, password }
      );

      if (data.success && data.accessToken) {
        setAdminTokens(
          data.accessToken,
          data.refreshToken
        );
      }

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
        "Login failed"
      );
    }
  }
);

const initialState = {
  authStep: 1,
  userId: "",
  userFullName: "",
  userRole: "",
  authed: false,
  authLoading: false,
  authError: ""
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAdminField: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
    setTokens: () => { },
    logout: (state) => {
      clearAdminToken();
      state.authed = false;
      state.userId = "";
      state.password = "";
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(adminLoginThunk.pending, (state) => {
        state.authLoading = true;
        state.authError = "";
      })

      .addCase(adminLoginThunk.fulfilled, (state, action) => {
        state.authLoading = false;
        state.authError = "";
        state.authed = true;
        state.userId = action.payload?.user?.id || "";
        state.userFullName = action.payload?.user?.fullName || "";
        state.userRole = action.payload?.user?.role || "";
      })

      .addCase(adminLoginThunk.rejected, (state, action) => {
        state.authLoading = false;
        state.authError = action.payload || "Login failed";
      });
  }
});

export const {
  setAdminField,
  logout,
  setTokens
} = authSlice.actions;

export default authSlice.reducer;