import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore } from "redux-persist";
import authReducer from "./authSlice";
import userReducer from "./userSlice";
import favoritesReducer from "./favoriteSlice";
import cartReducer from "./cartSlice";
import ordersReducer from "./orderSlice";
import productsReducer from "./productsSlice";
import homeReducer from "./homeSlice";
import aboutReducer from "./aboutSlice";
import workspaceReducer from "./workspaceSlice";
import businessReducer from "./businessSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "user"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  favorites: favoritesReducer,
  cart: cartReducer,
  orders: ordersReducer,
  products: productsReducer,
  home: homeReducer,
  about: aboutReducer,
  workspace: workspaceReducer,
  business: businessReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
