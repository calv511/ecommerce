import { mergeCarts } from "../useCartSync";
import { makeCartItem } from "../../../test-utils";

// mergeCarts lives in useCartSync.ts, which pulls in the auth context and the
// Firestore wrapper at import time. Stubbing them keeps this a pure-function
// test — merging carts has nothing to do with either.
jest.mock("../../../context/AuthContext", () => ({ useAuth: () => ({ user: null }) }));
jest.mock("../../../lib/firebase/firestore", () => ({
  getCart: jest.fn(),
  saveCart: jest.fn(),
}));

test("keeps items that exist on only one side", () => {
  const local = [makeCartItem({ id: "a" })];
  const remote = [makeCartItem({ id: "b" })];

  const merged = mergeCarts(local, remote);

  expect(merged.map((item) => item.id).sort()).toEqual(["a", "b"]);
});

test("keeps the larger quantity when the local cart has more", () => {
  const merged = mergeCarts(
    [makeCartItem({ id: "a", quantity: 5 })],
    [makeCartItem({ id: "a", quantity: 2 })],
  );

  expect(merged).toHaveLength(1);
  expect(merged[0].quantity).toBe(5);
});

test("keeps the larger quantity when the saved cart has more", () => {
  const merged = mergeCarts(
    [makeCartItem({ id: "a", quantity: 1 })],
    [makeCartItem({ id: "a", quantity: 9 })],
  );

  expect(merged).toHaveLength(1);
  expect(merged[0].quantity).toBe(9);
});

test("never duplicates a product that is in both carts", () => {
  const merged = mergeCarts(
    [makeCartItem({ id: "a" }), makeCartItem({ id: "b" })],
    [makeCartItem({ id: "a" }), makeCartItem({ id: "c" })],
  );

  expect(merged).toHaveLength(3);
});

test("returns the saved cart when there is nothing local", () => {
  const remote = [makeCartItem({ id: "a", quantity: 3 })];

  expect(mergeCarts([], remote)).toEqual(remote);
});

test("returns the local cart when nothing is saved", () => {
  const local = [makeCartItem({ id: "a", quantity: 3 })];

  expect(mergeCarts(local, [])).toEqual(local);
});

test("returns an empty cart when both sides are empty", () => {
  expect(mergeCarts([], [])).toEqual([]);
});

test("does not mutate either input", () => {
  const local = [makeCartItem({ id: "a", quantity: 1 })];
  const remote = [makeCartItem({ id: "a", quantity: 4 })];

  mergeCarts(local, remote);

  expect(local[0].quantity).toBe(1);
  expect(remote[0].quantity).toBe(4);
});
