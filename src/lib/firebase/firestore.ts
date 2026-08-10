import type { CartItem } from "./types";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
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
    createdAt: new Date(),
  });
}

// get orders by userId where usserId is equal to the userId passed in and orderBy createdAt in descending order
export async function getOrdersByUserId(userId: string) {
  const ordersCollection = collection(db, "orders");
  const q = query(ordersCollection, where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  const orders: any[] = [];
  querySnapshot.forEach((doc) => {
    orders.push({ id: doc.id, ...doc.data() });
  });
  return orders;
}
