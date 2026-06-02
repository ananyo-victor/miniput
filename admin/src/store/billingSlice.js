import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchDefaultBillingProfileThunk = createAsyncThunk(
  "billing/fetchDefault",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/billing-profiles/user/${userId}/default`
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch billing profile"
      );
    }
  }
);

export const createBillingProfileThunk = createAsyncThunk(
  "billing/create",
  async ({ userId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/billing-profiles/${userId}`,
        payload
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create billing profile"
      );
    }
  }
);

export const updateBillingProfileThunk = createAsyncThunk(
  "billing/update",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/api/billing-profiles/${id}`,
        payload
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update billing profile"
      );
    }
  }
);

const billingSlice = createSlice({
  name: "billing",

  initialState: {
    profile: null,
    loading: false,
    saving: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchDefaultBillingProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        fetchDefaultBillingProfileThunk.fulfilled,
        (state, action) => {
          state.loading = false;
          state.profile = action.payload;
        }
      )

      .addCase(
        fetchDefaultBillingProfileThunk.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      .addCase(createBillingProfileThunk.pending, (state) => {
        state.saving = true;
      })

      .addCase(
        createBillingProfileThunk.fulfilled,
        (state, action) => {
          state.saving = false;
          state.profile = action.payload;
        }
      )

      .addCase(
        createBillingProfileThunk.rejected,
        (state, action) => {
          state.saving = false;
          state.error = action.payload;
        }
      )

      .addCase(updateBillingProfileThunk.pending, (state) => {
        state.saving = true;
      })

      .addCase(
        updateBillingProfileThunk.fulfilled,
        (state, action) => {
          state.saving = false;
          state.profile = action.payload;
        }
      )

      .addCase(
        updateBillingProfileThunk.rejected,
        (state, action) => {
          state.saving = false;
          state.error = action.payload;
        }
      );
  },
});

export default billingSlice.reducer;