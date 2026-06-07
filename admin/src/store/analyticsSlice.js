import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const fetchDashboardData = createAsyncThunk(
  'analytics/fetchDashboardData',
  // Removed `getState` since we no longer need to manually fetch the token
  async ({ workspaceId, startDate, endDate } = {}, { rejectWithValue }) => {
    try {
      // We rely entirely on your setupAxiosInterceptors to handle the Authorization header
      const response = await axios.get(`${API_BASE_URL}/api/analytics/dashboard`, {
        params: { workspaceId, startDate, endDate }
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || error.response?.data?.message || 'Failed to fetch analytics'
      );
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    data: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    clearAnalytics: (state) => {
      state.data = null;
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { clearAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;