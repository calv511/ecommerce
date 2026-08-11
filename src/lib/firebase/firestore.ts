import type { CartItem, Order, Product } from "../../types/types";
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

export async function getOrderById(orderId: string): Promise<Order | null> {
  const snapshot = await getDoc(doc(db, "orders", orderId));

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as Order;
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

// create user profile
export async function createUserProfile(
  userId: string,
  email: string,
  displayName: string,
  address: string,
): Promise<void> {
  const userDoc = doc(db, "users", userId);
  await setDoc(userDoc, {
    userId,
    email,
    displayName,
    address,
    createdAt: serverTimestamp(),
  });
}

// get user profile
export async function getUserProfile(userId: string): Promise<{
  userId: string;
  email: string;
  displayName: string;
  address: string;
} | null> {
  const userDoc = doc(db, "users", userId);
  const snapshot = await getDoc(userDoc);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as {
    userId: string;
    email: string;
    displayName: string;
    address: string;
  };
}

// update user profile
export async function updateUserProfile(
  userId: string,
  email: string,
  displayName: string,
  address: string,
): Promise<void> {
  const userDoc = doc(db, "users", userId);
  await setDoc(
    userDoc,
    {
      userId,
      email,
      displayName,
      address,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

//delete user profile
export async function deleteUserProfile(userId: string): Promise<void> {
  const userDoc = doc(db, "users", userId);
  await deleteDoc(userDoc);
}

const productsCollection = collection(db, "products");

export async function getProducts(): Promise<Product[]> {
  const querySnapshot = await getDocs(productsCollection);
  return querySnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Product,
  );
}

export async function getProductById(productId: string): Promise<Product | null> {
  const snapshot = await getDoc(doc(db, "products", productId));

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() } as Product;
}

export async function createProduct(
  product: Omit<Product, "id">,
): Promise<string> {
  const productDoc = await addDoc(productsCollection, product);
  return productDoc.id;
}

export async function updateProduct(
  productId: string,
  product: Partial<Omit<Product, "id">>,
): Promise<void> {
  await setDoc(doc(db, "products", productId), product, { merge: true });
}

export async function deleteProduct(productId: string): Promise<void> {
  await deleteDoc(doc(db, "products", productId));
}
