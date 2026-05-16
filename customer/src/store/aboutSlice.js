import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const initialAbout = {
  address: "",
  miniputDetails: "",
  kwinkDetails: "",
  whatsappNumber: "",
  phoneNumber: ""
};

export const fetchAboutThunk = createAsyncThunk(
  "about/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/content/about`);
      return {
        address: data?.address || "",
        miniputDetails: data?.miniputDetails || "",
        kwinkDetails: data?.kwinkDetails || "",
        whatsappNumber: data?.whatsappNumber || "",
        phoneNumber: data?.phoneNumber || ""
      };
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.error || error?.message || "Failed to load about content."
      );
    }
  }
);

const aboutSlice = createSlice({
  name: "about",
  initialState: {
    about: initialAbout,
    loading: false,
    error: ""
  },
  reducers: {
    clearAboutError: (state) => {
      state.error = "";
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAboutThunk.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchAboutThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.about = action.payload;
      })
      .addCase(fetchAboutThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load about content.";
      });
  }
});

export const { clearAboutError } = aboutSlice.actions;
export default aboutSlice.reducer;
