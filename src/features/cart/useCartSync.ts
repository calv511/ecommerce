import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../app/store";
import { store } from "../../app/store";
import { useAuth } from "../../context/AuthContext";
import { getCart, saveCart } from "../../lib/firebase/firestore";
import type { CartItem } from "../../types/types";
import { setCart } from "./cartSlice";

const SAVE_DEBOUNCE_MS = 800;

/**
 * Combines a guest cart with the cart saved in Firestore. Items are matched on
 * product id and the larger of the two quantities wins, so signing in never
 * silently drops something the user added.
 */
export function mergeCarts(local: CartItem[], remote: CartItem[]): CartItem[] {
  const merged = new Map<string, CartItem>();

  for (const item of [...remote, ...local]) {
    const existing = merged.get(item.id);
    merged.set(
      item.id,
      existing
        ? { ...item, quantity: Math.max(existing.quantity, item.quantity) }
        : item,
    );
  }

  return [...merged.values()];
}

/**
 * Keeps the Redux cart and the signed-in user's Firestore cart in step.
 * Mount once, below both the Redux `Provider` and the `AuthProvider`.
 */
export function useCartSync() {
  const { user, authReady } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => state.cart.items);

  // Depend on the uid rather than the User object, whose identity can change
  // without the signed-in user changing.
  const uid = user?.uid ?? null;

  // The uid whose cart is currently loaded into Redux. Guards the save effect
  // so an empty local cart can't overwrite the saved one before it arrives.
  const hydratedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    if (!uid) {
      // Only wipe the local cart on an actual sign-out. On a fresh page load
      // there is nothing to hydrate and a guest's cart should survive.
      if (hydratedFor.current !== null) {
        hydratedFor.current = null;
        dispatch(setCart([]));
      }
      return;
    }

    let cancelled = false;

    getCart(uid)
      .then((remoteItems) => {
        if (cancelled) {
          return;
        }
        // Read the local cart at resolve time rather than depending on `items`,
        // which would re-run this effect on every cart change and resurrect
        // items the user had just removed.
        const localItems = store.getState().cart.items;
        dispatch(setCart(mergeCarts(localItems, remoteItems)));
        hydratedFor.current = uid;
      })
      .catch((error) => {
        console.error("Failed to load saved cart:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [authReady, uid, dispatch]);

  useEffect(() => {
    if (!uid || hydratedFor.current !== uid) {
      return;
    }

    // The quantity input dispatches on every keystroke, so coalesce writes.
    const timeout = setTimeout(() => {
      saveCart(uid, items).catch((error) => {
        console.error("Failed to save cart:", error);
      });
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [items, uid]);
}
