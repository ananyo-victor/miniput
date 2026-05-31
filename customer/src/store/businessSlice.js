import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchBusinessesThunk = createAsyncThunk(
  "business/fetchBusinesses",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/businesses/user/${userId}`
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch businesses"
      );
    }
  }
);

export const fetchBusinessThunk = createAsyncThunk(
  "business/fetchBusiness",
  async (userId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/api/businesses/${userId}`
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch business"
      );
    }
  }
);

export const createBusinessThunk = createAsyncThunk(
  "business/createBusiness",
  async ({ userId, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/businesses/${userId}`,
        payload
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to create business"
      );
    }
  }
);

export const updateBusinessThunk = createAsyncThunk(
  "business/updateBusiness",
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/api/businesses/${id}`,
        payload
      );

      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update business"
      );
    }
  }
);

export const deleteBusinessThunk = createAsyncThunk(
  "business/deleteBusiness",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/businesses/${id}`
      );

      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to delete business"
      );
    }
  }
);

const businessSlice = createSlice({
  name: "business",

  initialState: {
    items: [],
    selectedBusiness: null,
    loading: false,
    saving: false,
    error: null,
  },

  reducers: {
    clearBusinessState: (state) => {
      state.items = [];
      state.selectedBusiness = null;
      state.loading = false;
      state.saving = false;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // FETCH ALL
      .addCase(fetchBusinessesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessesThunk.fulfilled, (state, action) => {
        state.loading = false;
        console.log("Fetched businesses data:", action.payload); // Debug log for fetched data
        state.items = Array.isArray(action.payload)
          ? action.payload
          : action.payload?.businesses || [];
      })
      .addCase(fetchBusinessesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // FETCH ONE
      .addCase(fetchBusinessThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBusinessThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBusiness = action.payload;
      })
      .addCase(fetchBusinessThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // CREATE
      .addCase(createBusinessThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createBusinessThunk.fulfilled, (state, action) => {
        state.saving = false;

        state.items.unshift(action.payload);

        state.selectedBusiness = action.payload;
      })
      .addCase(createBusinessThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // UPDATE
      .addCase(updateBusinessThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateBusinessThunk.fulfilled, (state, action) => {
        state.saving = false;

        const updated = action.payload;

        state.items = state.items.map((item) =>
          item.id === updated.id ? updated : item
        );

        state.selectedBusiness = updated;
      })
      .addCase(updateBusinessThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })

      // DELETE
      .addCase(deleteBusinessThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteBusinessThunk.fulfilled, (state, action) => {
        state.saving = false;

        state.items = state.items.filter(
          (item) => item.id !== action.payload
        );

        if (
          state.selectedBusiness?.id ===
          action.payload
        ) {
          state.selectedBusiness = null;
        }
      })
      .addCase(deleteBusinessThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { clearBusinessState } =
  businessSlice.actions;

export default businessSlice.reducer;