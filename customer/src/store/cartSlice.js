import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "cart";

const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem(STORAGE_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    return [];
  }
};

const persistCart = (cart) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    // Ignore localStorage write errors.
  }
};

const clearStoredCart = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    // Ignore localStorage cleanup failures.
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: loadCartFromStorage()
  },
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const effectivePrice = product.isDiscountActive ? product.finalPrice : product.price;

      const newItem = {
        ...product,
        price: effectivePrice,
        originalPrice: product.isDiscountActive ? (product.originalPrice ?? product.price) : product.price,
        cartItemId: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
      };

      state.items.push(newItem);
      persistCart(state.items);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.cartItemId !== action.payload);
      persistCart(state.items);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((row) => row.cartItemId === id);
      if (item) {
        item.quantity = quantity;
      }
      persistCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      clearStoredCart();
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
