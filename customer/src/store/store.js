import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./customerSlice";
import customerAccountReducer from "./customerAccountSlice";
import cartReducer from "./cartSlice";
import ordersReducer from "./orderSlice";
import productsReducer from "./productsSlice";
import homeReducer from "./homeSlice";
import aboutReducer from "./aboutSlice";
import workspaceReducer from "./workspaceSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    customerAccount: customerAccountReducer,
    cart: cartReducer,
    orders: ordersReducer,
    products: productsReducer,
    home: homeReducer,
    about: aboutReducer,
    workspace: workspaceReducer
  }
});
