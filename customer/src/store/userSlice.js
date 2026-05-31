import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { logoutCustomer, verifyCustomerThunk } from "./authSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const emptyProfile = {
  id: localStorage.getItem("userId") || "",
  name: "",
  email: "",
  phone: "",
  profilePic: "",
};

export const fetchUserDetailsThunk = createAsyncThunk(
  "customerAccount/fetchDetails",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/users/${userId}`);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user details");
    }
  }
);

export const createCustomerAccountThunk = createAsyncThunk(
  "customerAccount/create",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/users`, payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create customer account");
    }
  }
);

export const updateCustomerAccountThunk = createAsyncThunk(
  "customerAccount/update",
  async ({ id, ...payload }, { rejectWithValue }) => {
    try {
      const { data } = await axios.put(`${API_BASE_URL}/api/users/${id}`, payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update customer account");
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

const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: { ...emptyProfile },
    saving: false,
    saveError: "",
  },
  reducers: {
    setAccountField: (state, action) => {
      const { key, value } = action.payload;
      state.profile[key] = value;
    },
    createCustomerAccountLocal: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
      state.saveError = "";
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
      state.saveError = "";
    },
    clearCustomerAccount: (state) => {
      state.profile = { ...emptyProfile };
      state.saveError = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyCustomerThunk.fulfilled, (state, action) => {
        const user = action.payload?.user || {};
        state.profile = {
          ...state.profile,
          id: user.id || state.profile.id,
          name: user.name || state.profile.name,
          email: user.email || state.profile.email,
          phone: user.phone || state.profile.phone,
          profilePic: user.profilePic || state.profile.profilePic,
        };
      })
      .addCase(createCustomerAccountThunk.pending, (state) => {
        state.saving = true;
        state.saveError = "";
      })
      .addCase(createCustomerAccountThunk.fulfilled, (state, action) => {
        state.saving = false;
        state.profile = { ...state.profile, ...(action.payload?.user || action.payload || {}) };
      })
      .addCase(createCustomerAccountThunk.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || "Failed to create customer account";
      })
      .addCase(updateCustomerAccountThunk.pending, (state) => {
        state.saving = true;
        state.saveError = "";
      })
      .addCase(updateCustomerAccountThunk.fulfilled, (state, action) => {
        state.saving = false;
        const responseData = action.payload?.user || action.payload || {};
        state.profile = {
          ...state.profile,
          ...responseData,
          name: responseData.full_name || responseData.name || state.profile.name,
          profilePic: responseData.profile_picture_url || responseData.profilePictureUrl || responseData.profilePic || state.profile.profilePic
        };
      })
      .addCase(updateCustomerAccountThunk.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || "Failed to update customer account";
      })
      .addCase(logoutCustomer, (state) => {
        state.profile = {
          id: "",
          name: "",
          email: "",
          phone: "",
          profilePic: ""
        };
        state.saving = false;
        state.saveError = "";
      })
      .addCase(fetchUserDetailsThunk.pending, (state) => {
        state.saveError = "";
      })
      .addCase(fetchUserDetailsThunk.fulfilled, (state, action) => {
        const responseData = action.payload?.user || action.payload || {};
        state.profile = {
          ...state.profile,
          ...responseData,
          id: responseData.id || state.profile.id,
          name: responseData.full_name || responseData.name || state.profile.name,
          profilePic: responseData.profile_picture_url,
          email: responseData.email || state.profile.email,
        };
      })
      .addCase(fetchUserDetailsThunk.rejected, (state, action) => {
        state.saveError = action.payload || "Failed to fetch user details";
      });
  },
});

export const {
  setAccountField,
  createCustomerAccountLocal,
  updateProfile,
  clearCustomerAccount,
} = userSlice.actions;

export default userSlice.reducer;