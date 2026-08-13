import { configureStore } from "@reduxjs/toolkit";
import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import cartReducer, { type CartState } from "./features/cart/cartSlice";
import type { CartItem, Product } from "./types/types";

/**
 * A store built fresh for a single test.
 *
 * The app's real store in `app/store.ts` is a module-level singleton that also
 * writes to sessionStorage. Sharing it across tests would let one test's cart
 * leak into the next and make results depend on file order, so tests build
 * their own store instead.
 */
export function makeTestStore(cart: CartState = { items: [] }) {
  return configureStore({
    reducer: { cart: cartReducer },
    preloadedState: { cart },
  });
}

export type TestStore = ReturnType<typeof makeTestStore>;

interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
  store?: TestStore;
  route?: string;
  /**
   * Passed straight to `userEvent.setup()`. A test running on fake timers must
   * supply `{ advanceTimers: jest.advanceTimersByTime }`, otherwise user-event's
   * internal delays wait on a clock that never moves.
   */
  userEventOptions?: Parameters<typeof userEvent.setup>[0];
}

/**
 * Renders `ui` inside the providers the app supplies in production: the Redux
 * store and a router. Returns the store so a test can assert against state,
 * and a `user` handle for simulating interactions.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    store = makeTestStore(),
    route = "/",
    userEventOptions,
    ...renderOptions
  }: RenderWithProvidersOptions = {},
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  );

  return {
    store,
    user: userEvent.setup(userEventOptions),
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/** A complete Product, with any field overridable per test. */
export function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "product-1",
    title: "Nebula Mug",
    price: 12.5,
    description: "A ceramic mug.",
    category: "kitchen",
    image: "https://example.test/mug.png",
    rating: { rate: 4.5, count: 20 },
    ...overrides,
  };
}

/** A complete CartItem, with any field overridable per test. */
export function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return { ...makeProduct(), quantity: 1, ...overrides };
}
