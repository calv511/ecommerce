import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "../../types/types";

interface CartItem extends Product {
    quantity: number;
}

interface CartState {
    items:CartItem[];
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
                state.items.push({...action.payload, quantity: 1});
            }
        },
        removeFromCart: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },
    },
});

export const { addToCart, removeFromCart} = cartSlice.actions;
export default cartSlice.reducer;