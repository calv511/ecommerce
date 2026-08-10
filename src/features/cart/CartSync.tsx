import { useCartSync } from "./useCartSync";

/**
 * Renders nothing — it exists so the cart sync runs inside both the Redux
 * `Provider` and the `AuthProvider`.
 */
const CartSync: React.FC = () => {
  useCartSync();
  return null;
};

export default CartSync;
