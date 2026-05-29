import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "./customerSlice";
import adminReducer from "./adminSlice";
import productsReducer from "./productsSlice";
import homeReducer from "./homeSlice";
import aboutReducer from "./aboutSlice";
import workspaceReducer from "./workspaceSlice";

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    admin: adminReducer,
    products: productsReducer,
    home: homeReducer,
    about: aboutReducer,
    workspace: workspaceReducer
  }
});
