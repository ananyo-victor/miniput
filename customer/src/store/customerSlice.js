import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (e) {
    return [];
  }
};

// ==========================================
// MOCKED THUNKS FOR LOCAL DEVELOPMENT
// ==========================================

export const checkCustomerThunk = createAsyncThunk("customer/check", async (phone) => {
  // --- REAL CODE (Commented out for now) ---
  // const { data } = await axios.post(`${API_BASE_URL}/api/auth/customer/check`, { phone });
  // return data;

  // --- MOCK CODE ---
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[Mock Backend] OTP '1111' sent to ${phone}`);
      // Returning exists: true simulates a returning user. 
      // Change to false to simulate a brand new user.
      resolve({ exists: true, success: true });
    }, 800); // 800ms delay to simulate network
  });
});

export const verifyCustomerThunk = createAsyncThunk("customer/verify", async (payload, { rejectWithValue }) => {
  // --- REAL CODE (Commented out for now) ---
  // try {
  //   const { data } = await axios.post(`${API_BASE_URL}/api/auth/customer/verify`, payload);
  //   return data;
  // } catch (error) {
  //   return rejectWithValue(error.response?.data?.message || "Verification failed");
  // }

  // --- MOCK CODE ---
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (payload.otp === "1111") {
        console.log(`[Mock Backend] OTP Verified for ${payload.phone}`);
        resolve({
          success: true,
          user: {
            phone: payload.phone,
            name: "Local Tester", // Mock name
            email: "tester@local.com",
            profilePic: ""
          }
        });
      } else {
        reject(new Error("Invalid OTP. Please use 1111 for testing."));
      }
    }, 1000);
  }).catch((error) => rejectWithValue(error.message));
});

const sanitizeOrderPayload = (payload = {}) => {
  const rest = { ...payload };
  delete rest.workspaceId;
  delete rest.brand;
  delete rest.variantId;
  const items = Array.isArray(payload?.items) ? payload.items : [];
  const sanitizedItems = Array.isArray(items)
    ? items.map((item) => {
      if (!item || typeof item !== "object") {
        return item;
      }
      const nextItem = { ...item };
      delete nextItem.brand;
      delete nextItem.variantId;
      return nextItem;
    })
    : [];

  return {
    ...rest,
    items: sanitizedItems,
  };
};

export const createOrderThunk = createAsyncThunk("customer/createOrder", async (payload) => {
  const sanitizedPayload = sanitizeOrderPayload(payload);
  const { data } = await axios.post(`${API_BASE_URL}/api/orders`, sanitizedPayload);
  return data;
});

const initialState = {
  authStep: "mobile",
  phone: "",
  otp: "",
  email: "",
  name: "",
  profilePic: "",
  exists: false,
  authed: false,
  isAuthModalOpen: false,
  isProfileModalOpen: false,
  cart: loadCartFromStorage(),
  isCheckoutOpen: false,
  address: "",
  authError: "",
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    setCustomerField: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
      if (key === 'otp' || key === 'phone') state.authError = "";
    },
    setAuthState: (state, action) => {
      Object.assign(state, action.payload);
    },
    openAuthModal: (state) => {
      state.isAuthModalOpen = true;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
      state.authStep = "mobile";
      state.otp = "";
    },
    openProfileModal: (state) => {
      state.isProfileModalOpen = true;
    },
    closeProfileModal: (state) => {
      state.isProfileModalOpen = false;
    },
    updateProfile: (state, action) => {
      if (action.payload.name !== undefined) state.name = action.payload.name;
      if (action.payload.profilePic !== undefined) state.profilePic = action.payload.profilePic;
    },
    logoutCustomer: (state) => {
      state.authed = false;
      state.phone = "";
      state.name = "";
      state.profilePic = "";
      state.email = "";
      state.isProfileModalOpen = false;
    },
    addToCart: (state, action) => {
      const product = action.payload;
      const effectivePrice = product.isDiscountActive ? product.finalPrice : product.price;

      const newItem = {
        ...product,
        price: effectivePrice,
        originalPrice: product.isDiscountActive ? (product.originalPrice ?? product.price) : product.price,
        cartItemId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      state.cart.push(newItem);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((item) => item.cartItemId !== action.payload);
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cart.find((item) => item.cartItemId === id);
      if (item) {
        item.quantity = quantity;
      }
      localStorage.setItem("cart", JSON.stringify(state.cart));
    },
    clearCart: (state) => {
      state.cart = [];
      localStorage.removeItem("cart");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkCustomerThunk.fulfilled, (state, action) => {
        state.exists = !!action.payload.exists;
        state.authStep = "otp";
      })
      .addCase(verifyCustomerThunk.fulfilled, (state, action) => {
        if (action.payload?.user?.email) state.email = action.payload.user.email;
        if (action.payload?.user?.name) state.name = action.payload.user.name;
        if (action.payload?.user?.profilePic) state.profilePic = action.payload.user.profilePic;

        state.authed = true;
        state.isAuthModalOpen = false;
        state.authStep = "mobile";
        state.otp = "";
        state.authError = "";
      })
      .addCase(verifyCustomerThunk.rejected, (state, action) => {
        // Capture the error so we can show it in the UI
        state.authError = action.payload || "Verification failed";
      })
      .addCase(createOrderThunk.fulfilled, (state) => {
        state.cart = [];
        state.address = "";
        state.isCheckoutOpen = false;
      });
  }
});

export const {
  setCustomerField, setAuthState, addToCart, removeFromCart, updateQuantity, clearCart,
  openAuthModal, closeAuthModal, openProfileModal, closeProfileModal, updateProfile, logoutCustomer
} = customerSlice.actions;
export default customerSlice.reducer;