import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { CartItem, Product } from "../../types/types";

export interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: [],
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<Product>) => {
            const existingItem = state.items.find(
                (item) => item.id === action.payload.id
            );

            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.items.push({ ...action.payload, quantity: 1 });
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },
        setQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            if (action.payload.quantity <= 0) {
                state.items = state.items.filter((item) => item.id !== action.payload.id);
                return;
            }

            state.items = state.items.map((item) =>
                item.id === action.payload.id
                    ? { ...item, quantity: action.payload.quantity }
                    : item,
            );
        },
        clearCart: (state) => {
            state.items = [];
        },
        // Replaces the whole cart. Used when hydrating from Firestore.
        setCart: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
        },
    },
});

export const { addToCart, removeFromCart, setQuantity, clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;
