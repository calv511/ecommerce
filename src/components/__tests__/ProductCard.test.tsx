import { screen } from "@testing-library/react";
import ProductCard from "../ProductCard";
import { makeProduct, renderWithProviders } from "../../test-utils";

// ProductCard reads the signed-in user to decide whether to show the Edit
// link. Stubbing the context keeps this a unit test: no Firebase SDK is
// loaded, so nothing here touches the network or depends on auth state.
const mockUseAuth = jest.fn(() => ({ user: null as { uid: string } | null }));
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

beforeEach(() => {
  mockUseAuth.mockReturnValue({ user: null });
});

describe("rendering", () => {
  test("shows the product's details", () => {
    renderWithProviders(
      <ProductCard
        product={makeProduct({
          title: "Nebula Mug",
          category: "kitchen",
          description: "A ceramic mug.",
        })}
      />,
    );

    expect(screen.getByRole("heading", { name: "Nebula Mug" })).toBeInTheDocument();
    expect(screen.getByText("kitchen")).toBeInTheDocument();
    expect(screen.getByText("A ceramic mug.")).toBeInTheDocument();
  });

  test("formats the price to two decimal places", () => {
    renderWithProviders(<ProductCard product={makeProduct({ price: 8 })} />);

    expect(screen.getByText("$8.00")).toBeInTheDocument();
  });

  test("hides the Edit link when signed out", () => {
    renderWithProviders(<ProductCard product={makeProduct()} />);

    expect(screen.queryByRole("link", { name: "Edit" })).not.toBeInTheDocument();
  });

  test("shows the Edit link when signed in", () => {
    mockUseAuth.mockReturnValue({ user: { uid: "user-1" } });

    renderWithProviders(<ProductCard product={makeProduct({ id: "abc" })} />);

    expect(screen.getByRole("link", { name: "Edit" })).toHaveAttribute(
      "href",
      "/products/abc/edit",
    );
  });
});

describe("adding to the cart", () => {
  test("puts the product in the store when the button is clicked", async () => {
    const product = makeProduct({ id: "abc", title: "Nebula Mug" });
    const { store, user } = renderWithProviders(<ProductCard product={product} />);

    expect(store.getState().cart.items).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Add to Cart" }));

    expect(store.getState().cart.items).toEqual([{ ...product, quantity: 1 }]);
  });

  test("increments quantity instead of adding a second row", async () => {
    const { store, user } = renderWithProviders(
      <ProductCard product={makeProduct()} />,
    );

    await user.click(screen.getByRole("button", { name: "Add to Cart" }));
    await user.click(screen.getByRole("button", { name: "Added ✓" }));

    expect(store.getState().cart.items).toHaveLength(1);
    expect(store.getState().cart.items[0].quantity).toBe(2);
  });

  test("confirms the click by swapping the button label", async () => {
    const { user } = renderWithProviders(<ProductCard product={makeProduct()} />);

    await user.click(screen.getByRole("button", { name: "Add to Cart" }));

    expect(screen.getByRole("button", { name: "Added ✓" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Add to Cart" }),
    ).not.toBeInTheDocument();
  });
});

describe("the confirmation label resetting", () => {
  // The reset is a 1.5s setTimeout. Fake timers keep this deterministic —
  // a real wait would make the test slow and occasionally flaky.
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("returns to 'Add to Cart' after the timeout elapses", async () => {
    const { user } = renderWithProviders(<ProductCard product={makeProduct()} />, {
      userEventOptions: { advanceTimers: jest.advanceTimersByTime },
    });

    await user.click(screen.getByRole("button", { name: "Add to Cart" }));
    expect(screen.getByRole("button", { name: "Added ✓" })).toBeInTheDocument();

    jest.advanceTimersByTime(1500);

    expect(
      await screen.findByRole("button", { name: "Add to Cart" }),
    ).toBeInTheDocument();
  });
});
