import { createContext } from "react";
import type { CartItem, Product } from "../types/types";

export const CART_STORAGE_KEY = "shopping-cart";

export interface CartState {
    items: CartItem[];
}

export type CartAction =
    | { type: "ADD_TO_CART"; payload: Product }
    | { type: "REMOVE_FROM_CART"; payload: number }
    | { type: "SET_QUANTITY"; payload: { id: number; quantity: number } }
    | { type: "CLEAR_CART" };

export interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (id: number) => void;
    setQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);