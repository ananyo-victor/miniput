import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { logoutCustomer, verifyCustomerThunk } from "./authSlice";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const PROFILE_STORAGE_KEY = "customerProfile";

const emptyProfile = {
  id: "",
  name: "",
  email: "",
  phone: "",
  profilePic: "",
};

const loadProfileFromStorage = () => {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      return { ...emptyProfile };
    }
    return { ...emptyProfile, ...JSON.parse(raw) };
  } catch (error) {
    return { ...emptyProfile };
  }
};

const persistProfile = (profile) => {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    // Ignore localStorage write errors in private mode or quota limits.
  }
};

const clearStoredProfile = () => {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  } catch (error) {
    // Ignore localStorage cleanup failures.
  }
};

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

const userSlice = createSlice({
  name: "user",
  initialState: {
    profile: loadProfileFromStorage(),
    saving: false,
    saveError: "",
  },
  reducers: {
    setAccountField: (state, action) => {
      const { key, value } = action.payload;
      state.profile[key] = value;
      persistProfile(state.profile);
    },
    createCustomerAccountLocal: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
      state.saveError = "";
      persistProfile(state.profile);
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
      state.saveError = "";
      persistProfile(state.profile);
    },
    clearCustomerAccount: (state) => {
      state.profile = { ...emptyProfile };
      state.saveError = "";
      clearStoredProfile();
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
        persistProfile(state.profile);
      })
      .addCase(createCustomerAccountThunk.pending, (state) => {
        state.saving = true;
        state.saveError = "";
      })
      .addCase(createCustomerAccountThunk.fulfilled, (state, action) => {
        state.saving = false;
        state.profile = { ...state.profile, ...(action.payload?.user || action.payload || {}) };
        persistProfile(state.profile);
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
        state.profile = { ...state.profile, ...(action.payload?.user || action.payload || {}) };
        persistProfile(state.profile);
      })
      .addCase(updateCustomerAccountThunk.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.payload || "Failed to update customer account";
      })
      .addCase(logoutCustomer, (state) => {
        state.profile = { ...emptyProfile };
        state.saving = false;
        state.saveError = "";
        clearStoredProfile();
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
