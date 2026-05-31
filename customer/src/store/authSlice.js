import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { clearCustomerToken, getCustomerAccessToken, setCustomerTokens } from "../utils/customerToken";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const checkCustomerThunk = createAsyncThunk(
  "customer/check",
  async (phone, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/customer/check`, { phone });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to send OTP");
    }
  }
);

export const verifyCustomerThunk = createAsyncThunk(
  "customer/verify",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/auth/customer/verify`, payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Verification failed");
    }
  }
);

const initialState = {
  authStep: "mobile",
  phone: "",
  otp: "",
  exists: false,
  authed: Boolean(getCustomerAccessToken()),
  isAuthModalOpen: false,
  isProfileModalOpen: false,
  authError: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthField: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
      if (key === "otp" || key === "phone") state.authError = "";
    },
    openAuthModal: (state) => {
      state.isAuthModalOpen = true;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
      state.authStep = "mobile";
      state.otp = "";
    },
    openProfileModal: (state) => {
      state.isProfileModalOpen = true;
    },
    closeProfileModal: (state) => {
      state.isProfileModalOpen = false;
    },
    logoutCustomer: (state) => {
      clearCustomerToken();
      state.authed = false;
      state.phone = "";
      state.otp = "";
      state.exists = false;
      state.isProfileModalOpen = false;
      state.authStep = "mobile";
      state.authError = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkCustomerThunk.fulfilled, (state, action) => {
        state.exists = !!action.payload.exists;
        state.authStep = "otp";
      })
      .addCase(verifyCustomerThunk.fulfilled, (state, action) => {
        if (action.payload?.accessToken) {
          setCustomerTokens(action.payload.accessToken, action.payload.refreshToken);
        }
        state.authed = true;
        state.phone = action.payload?.user?.phone || state.phone;
        state.isAuthModalOpen = false;
        state.authStep = "mobile";
        state.otp = "";
        state.authError = "";
      })
      .addCase(verifyCustomerThunk.rejected, (state, action) => {
        state.authError = action.payload || "Verification failed";
      });
  },
});

export const {
  setAuthField,
  openAuthModal,
  closeAuthModal,
  openProfileModal,
  closeProfileModal,
  logoutCustomer,
} = authSlice.actions;

export default authSlice.reducer;
