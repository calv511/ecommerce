import reducer, {
  addToCart,
  clearCart,
  removeFromCart,
  setCart,
  setQuantity,
} from "../cartSlice";
import { makeCartItem, makeProduct } from "../../../test-utils";

// Reducers are pure functions: given a state and an action, they return the
// next state. Nothing to render, nothing to mock.

describe("addToCart", () => {
  test("adds a new product with quantity 1", () => {
    const product = makeProduct({ id: "a" });

    const state = reducer({ items: [] }, addToCart(product));

    expect(state.items).toEqual([{ ...product, quantity: 1 }]);
  });

  test("increments quantity when the product is already in the cart", () => {
    const product = makeProduct({ id: "a" });

    const state = reducer({ items: [{ ...product, quantity: 2 }] }, addToCart(product));

    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
  });

  test("keeps different products on separate lines", () => {
    const first = makeProduct({ id: "a" });
    const second = makeProduct({ id: "b" });

    let state = reducer({ items: [] }, addToCart(first));
    state = reducer(state, addToCart(second));

    expect(state.items.map((item) => item.id)).toEqual(["a", "b"]);
  });

  test("does not mutate the state it was given", () => {
    const initial = { items: [] };

    reducer(initial, addToCart(makeProduct()));

    expect(initial.items).toHaveLength(0);
  });
});

describe("removeFromCart", () => {
  test("drops only the matching item", () => {
    const state = reducer(
      { items: [makeCartItem({ id: "a" }), makeCartItem({ id: "b" })] },
      removeFromCart("a"),
    );

    expect(state.items.map((item) => item.id)).toEqual(["b"]);
  });

  test("leaves the cart alone when the id is not present", () => {
    const state = reducer({ items: [makeCartItem({ id: "a" })] }, removeFromCart("zzz"));

    expect(state.items).toHaveLength(1);
  });
});

describe("setQuantity", () => {
  test("sets the quantity on the matching item", () => {
    const state = reducer(
      { items: [makeCartItem({ id: "a", quantity: 1 })] },
      setQuantity({ id: "a", quantity: 5 }),
    );

    expect(state.items[0].quantity).toBe(5);
  });

  test("removes the item when the quantity reaches zero", () => {
    const state = reducer(
      { items: [makeCartItem({ id: "a", quantity: 3 })] },
      setQuantity({ id: "a", quantity: 0 }),
    );

    expect(state.items).toHaveLength(0);
  });

  test("removes the item on a negative quantity", () => {
    const state = reducer(
      { items: [makeCartItem({ id: "a", quantity: 3 })] },
      setQuantity({ id: "a", quantity: -2 }),
    );

    expect(state.items).toHaveLength(0);
  });

  test("does not disturb the other items", () => {
    const state = reducer(
      {
        items: [
          makeCartItem({ id: "a", quantity: 1 }),
          makeCartItem({ id: "b", quantity: 4 }),
        ],
      },
      setQuantity({ id: "a", quantity: 9 }),
    );

    expect(state.items.find((item) => item.id === "b")?.quantity).toBe(4);
  });
});

describe("clearCart", () => {
  test("empties a full cart", () => {
    const state = reducer(
      { items: [makeCartItem({ id: "a" }), makeCartItem({ id: "b" })] },
      clearCart(),
    );

    expect(state.items).toEqual([]);
  });
});

describe("setCart", () => {
  test("replaces the cart wholesale when hydrating from Firestore", () => {
    const incoming = [makeCartItem({ id: "b", quantity: 7 })];

    const state = reducer({ items: [makeCartItem({ id: "a" })] }, setCart(incoming));

    expect(state.items).toEqual(incoming);
  });
});
