import { configureStore } from "@reduxjs/toolkit";
import cartReducer, { type CartState } from "../features/cart/cartSlice";

export const CART_STORAGE_KEY = "shopping-cart";

const loadCartFromSessionStorage = (): CartState => {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  const storedCart = window.sessionStorage.getItem(CART_STORAGE_KEY);

  if (!storedCart) {
    return { items: [] };
  }

  try {
    const parsedCart = JSON.parse(storedCart) as CartState["items"];

    if (!Array.isArray(parsedCart)) {
      return { items: [] };
    }

    return { items: parsedCart };
  } catch {
    return { items: [] };
  }
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
  preloadedState: {
    cart: loadCartFromSessionStorage(),
  },
});

store.subscribe(() => {
  const { items } = store.getState().cart;

  if (typeof window === "undefined") {
    return;
  }

  if (items.length === 0) {
    window.sessionStorage.removeItem(CART_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
