import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import { addToCart, clearCart, removeFromCart, setQuantity } from "../features/cart/cartSlice";
import type { Product } from "../types/types";
import type { CartContextType } from "./cartStore";

export const useCartContext = (): CartContextType => {
    const dispatch = useDispatch<AppDispatch>();
    const items = useSelector((state: RootState) => state.cart.items);

    return {
        items,
        addToCart: (product: Product) => dispatch(addToCart(product)),
        removeFromCart: (id: number) => dispatch(removeFromCart(id)),
        setQuantity: (id: number, quantity: number) => dispatch(setQuantity({ id, quantity })),
        clearCart: () => dispatch(clearCart()),
    };
};