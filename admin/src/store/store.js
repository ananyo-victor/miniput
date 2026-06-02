import { configureStore, combineReducers } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import { persistReducer, persistStore} from "redux-persist";
import authReducer from "./authSlice";
import workspaceReducer from "./workspaceSlice";
import userReducer from "./userSlice";
import productsReducer from "./productsSlice";
import homeReducer from "./homeSlice";
import aboutReducer from "./aboutSlice";
import customerReducer from "./customerSlice";
import ordersReducer from "./ordersSlice";
import billingReducer from "./billingSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "user"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  customer: customerReducer,
  products: productsReducer,
  home: homeReducer,
  workspace: workspaceReducer,
  about: aboutReducer,
  orders: ordersReducer,
  billing: billingReducer,
});

const persistedReducer = persistReducer(
  persistConfig,
  rootReducer
);

export const store = configureStore({
  reducer: persistedReducer,

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
