import type { Timestamp } from "firebase/firestore/lite";

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string; // Firestore doc id
  userId: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  createdAt: Timestamp; // from "firebase/firestore"
}

export type Category = string;
