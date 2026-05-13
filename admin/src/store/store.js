import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "./customerSlice";
import adminReducer from "./adminSlice";
import productsReducer from "./productsSlice";

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    admin: adminReducer,
    products: productsReducer
  }
});
