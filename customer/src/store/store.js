import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "./customerSlice";
import adminReducer from "./adminSlice";
import productsReducer from "./productsSlice";
import homeReducer from "./homeSlice";

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    admin: adminReducer,
    products: productsReducer,
    home: homeReducer
  }
});
