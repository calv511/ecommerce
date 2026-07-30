import { createContext, useContext, useReducer } from "react";
import type { ReactNode } from "react";
import type { CartItem, Product } from "../types/types";

type CartAction =
    | { type: "ADD_TO_CART"; payload: Product }
    | { type: "REMOVE_FROM_CART"; payload: number };

interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: [],
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
        default:
            return state;
    }
};

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (id: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    const value: CartContextType = {
        items: state.items,
        addToCart: (product) => dispatch({ type: "ADD_TO_CART", payload: product }),
        removeFromCart: (id) => dispatch({ type: "REMOVE_FROM_CART", payload: id }),
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = (): CartContextType => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCartContext must be used within a CartProvider");
    }

    return context;
};