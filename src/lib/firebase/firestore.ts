import type { CartItem, Order } from "../../types/types";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// create order
export async function createOrder(
  userId: string,
  items: CartItem[],
  totalItems: number,
  totalPrice: number,
): Promise<void> {
  const ordersCollection = collection(db, "orders");
  await addDoc(ordersCollection, {
    userId,
    items,
    totalItems,
    totalPrice,
    createdAt: serverTimestamp(),
  });
}

// get every order belonging to a user, newest first
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const ordersCollection = collection(db, "orders");
  const q = query(
    ordersCollection,
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Order,
  );
}

// Each user has a single cart document keyed by their uid.
const cartDoc = (userId: string) => doc(db, "carts", userId);

// read the saved cart, or an empty one if the user has never had a cart
export async function getCart(userId: string): Promise<CartItem[]> {
  const snapshot = await getDoc(cartDoc(userId));

  if (!snapshot.exists()) {
    return [];
  }

  const items = snapshot.data().items;
  return Array.isArray(items) ? (items as CartItem[]) : [];
}

// overwrite the saved cart
export async function saveCart(
  userId: string,
  items: CartItem[],
): Promise<void> {
  await setDoc(cartDoc(userId), {
    items,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCart(userId: string): Promise<void> {
  await deleteDoc(cartDoc(userId));
}
