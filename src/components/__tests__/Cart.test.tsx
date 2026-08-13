import { screen, within } from "@testing-library/react";
import Cart from "../Cart";
import { makeCartItem, makeTestStore, renderWithProviders } from "../../test-utils";

/** The order-summary panel. A price can appear both on a line and in the summary. */
const summary = () => screen.getByRole("complementary");

/** The row for one product, so line totals can be asserted without ambiguity. */
function lineFor(title: string): HTMLElement {
  const heading = screen.getByRole("heading", { name: title });
  const line = heading.closest(".cart-item");
  if (!line) {
    throw new Error(`No cart line found for "${title}"`);
  }
  return line as HTMLElement;
}

const mockUseAuth = jest.fn(() => ({ user: null as { uid: string } | null }));
jest.mock("../../context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

// Checkout writes an order to Firestore. Stubbing the module keeps the test
// offline and lets us assert on what Cart *asked* for.
const mockCreateOrder = jest.fn();
jest.mock("../../lib/firebase/firestore", () => ({
  createOrder: (...args: unknown[]) => mockCreateOrder(...args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockUseAuth.mockReturnValue({ user: null });
  mockCreateOrder.mockResolvedValue(undefined);
});

describe("an empty cart", () => {
  test("says so instead of listing items", () => {
    renderWithProviders(<Cart />);

    expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
    expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
  });

  test("offers no checkout button", () => {
    renderWithProviders(<Cart />);

    expect(screen.queryByRole("button", { name: "Checkout" })).not.toBeInTheDocument();
  });
});

describe("totals", () => {
  test("multiplies price by quantity for a line total", () => {
    const store = makeTestStore({
      items: [makeCartItem({ title: "Mug", price: 12.5, quantity: 3 })],
    });

    renderWithProviders(<Cart />, { store });

    const line = lineFor("Mug");
    expect(within(line).getByText("$12.50 each")).toBeInTheDocument();
    expect(within(line).getByText("$37.50")).toBeInTheDocument();
  });

  test("sums every line into the order total", () => {
    const store = makeTestStore({
      items: [
        makeCartItem({ id: "a", title: "Mug", price: 10, quantity: 2 }),
        makeCartItem({ id: "b", title: "Plate", price: 5.25, quantity: 4 }),
      ],
    });

    renderWithProviders(<Cart />, { store });

    // 10*2 + 5.25*4 = 41.00
    expect(within(summary()).getByText("$41.00")).toBeInTheDocument();
  });

  test("counts a single item in the singular", () => {
    const store = makeTestStore({ items: [makeCartItem({ quantity: 1 })] });

    renderWithProviders(<Cart />, { store });

    expect(screen.getByText("1 item")).toBeInTheDocument();
  });

  test("counts multiple items in the plural", () => {
    const store = makeTestStore({ items: [makeCartItem({ quantity: 2 })] });

    renderWithProviders(<Cart />, { store });

    expect(screen.getByText("2 items")).toBeInTheDocument();
  });
});

describe("changing a line", () => {
  test("removing an item takes it out of the store and the page", async () => {
    const store = makeTestStore({
      items: [
        makeCartItem({ id: "a", title: "Mug" }),
        makeCartItem({ id: "b", title: "Plate" }),
      ],
    });

    const { user } = renderWithProviders(<Cart />, { store });

    await user.click(screen.getAllByRole("button", { name: "Remove" })[0]);

    expect(store.getState().cart.items.map((item) => item.id)).toEqual(["b"]);
    expect(screen.queryByText("Mug")).not.toBeInTheDocument();
    expect(screen.getByText("Plate")).toBeInTheDocument();
  });

  test("clearing the quantity box removes the line entirely", async () => {
    // Documents current behaviour: an empty box reads as 0, and the reducer
    // treats a quantity of 0 as a removal. See the note in the summary.
    const store = makeTestStore({
      items: [makeCartItem({ id: "a", title: "Mug", quantity: 2 })],
    });

    const { user } = renderWithProviders(<Cart />, { store });

    await user.clear(screen.getByLabelText("Quantity"));

    expect(store.getState().cart.items).toHaveLength(0);
  });
});

describe("checkout", () => {
  test("blocks a signed-out user and explains why", async () => {
    const store = makeTestStore({ items: [makeCartItem()] });
    const { user } = renderWithProviders(<Cart />, { store });

    expect(screen.getByText("You'll need to sign in first.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Checkout" }));

    expect(mockCreateOrder).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please sign in before checking out.",
    );
  });

  test("places the order and empties the cart for a signed-in user", async () => {
    mockUseAuth.mockReturnValue({ user: { uid: "user-1" } });
    const items = [makeCartItem({ price: 10, quantity: 2 })];
    const store = makeTestStore({ items });

    const { user } = renderWithProviders(<Cart />, { store });

    await user.click(screen.getByRole("button", { name: "Checkout" }));

    expect(mockCreateOrder).toHaveBeenCalledWith("user-1", items, 2, 20);
    expect(store.getState().cart.items).toHaveLength(0);
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Checkout successful.",
    );
  });

  test("keeps the cart and surfaces the error when the order fails", async () => {
    mockUseAuth.mockReturnValue({ user: { uid: "user-1" } });
    mockCreateOrder.mockRejectedValue(new Error("Firestore unavailable"));
    const store = makeTestStore({ items: [makeCartItem()] });

    const { user } = renderWithProviders(<Cart />, { store });

    await user.click(screen.getByRole("button", { name: "Checkout" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Firestore unavailable",
    );
    expect(store.getState().cart.items).toHaveLength(1);
  });
});
