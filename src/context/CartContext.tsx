import { useEffect, useReducer } from "react";
import type { ReactNode } from "react";
import {
    CART_STORAGE_KEY,
    CartContext,
    type CartAction,
    type CartContextType,
    type CartState,
} from "./cartStore";
import type { CartItem } from "../types/types";

const initialState: CartState = {
    items: [],
};

const loadCartFromSessionStorage = (): CartState => {
    if (typeof window === "undefined") {
        return initialState;
    }

    const storedCart = window.sessionStorage.getItem(CART_STORAGE_KEY);

    if (!storedCart) {
        return initialState;
    }

    try {
        const parsedCart = JSON.parse(storedCart) as CartItem[];

        if (!Array.isArray(parsedCart)) {
            return initialState;
        }

        return {
            items: parsedCart,
        };
    } catch {
        return initialState;
    }
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case "ADD_TO_CART": {
            const existingItem = state.items.find(
                (item) => item.id === action.payload.id,
            );

            if (existingItem) {
                return {
                    ...state,
                    items: state.items.map((item) =>
                        item.id === action.payload.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item,
                    ),
                };
            }

            return {
                ...state,
                items: [...state.items, { ...action.payload, quantity: 1 }],
            };
        }
        case "REMOVE_FROM_CART":
            return {
                ...state,
                items: state.items.filter((item) => item.id !== action.payload),
            };
        case "CLEAR_CART":
            return {
                ...state,
                items: [],
            };
        default:
            return state;
    }
};

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, undefined, loadCartFromSessionStorage);

    useEffect(() => {
        if (state.items.length === 0) {
            window.sessionStorage.removeItem(CART_STORAGE_KEY);
            return;
        }

        window.sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    }, [state.items]);

    const value: CartContextType = {
        items: state.items,
        addToCart: (product) => dispatch({ type: "ADD_TO_CART", payload: product }),
        removeFromCart: (id) => dispatch({ type: "REMOVE_FROM_CART", payload: id }),
        clearCart: () => dispatch({ type: "CLEAR_CART" }),
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};