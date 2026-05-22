import { createSlice } from "@reduxjs/toolkit";

const homeSlice = createSlice({
  name: "home",

  initialState: {
    activeCategory: "all",
  },

  reducers: {
    setActiveCategory(state, action) {
      state.activeCategory =
        action.payload;
    },
  },
});

export const {
  setActiveCategory,
} = homeSlice.actions;

export default homeSlice.reducer;