import { createSlice } from "@reduxjs/toolkit";

const homeSlice = createSlice({
  name: "home",
  initialState: {
    activeBrand: "",
    activeCategory: "all"
  },
  reducers: {
    setActiveBrand: (state, action) => {
      state.activeBrand = action.payload;
    },
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    }
  }
});

export const { setActiveBrand, setActiveCategory } = homeSlice.actions;
export default homeSlice.reducer;
