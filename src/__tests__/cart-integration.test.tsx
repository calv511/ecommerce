import { screen, within } from "@testing-library/react";
import Cart from "../components/Cart";
import ProductCard from "../components/ProductCard";
import { makeProduct, renderWithProviders } from "../test-utils";

/**
 * Integration test: adding a product updates the cart.
 *
 * Unlike the unit tests, nothing between the two components is stubbed. A real
 * Redux store is wired to a real ProductCard and a real Cart, so a click on the
 * card has to travel through `addToCart`, the reducer, and `useSelector` before
 * the Cart can show anything. If any link in that chain breaks, this fails.
 *
 * Only the outside world is stubbed — auth and Firestore — because a cart
 * update should not depend on the network.
 */
jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({ user: null }),
}));

jest.mock("../lib/firebase/firestore", () => ({
  createOrder: jest.fn(),
}));

/**
 * The order-summary panel. Prices repeat across the card, the cart line and the
 * summary, so totals are asserted inside a known region rather than page-wide.
 */
const summary = () => screen.getByRole("complementary");

/**
 * A product's title in the *cart*. ProductCard renders it as an h3 and the cart
 * line as an h2, so the heading level tells the two apart.
 */
const cartLineTitle = (name: string) =>
  screen.queryByRole("heading", { level: 2, name });

/** The storefront and the cart on one page, sharing one store. */
function Storefront({ products = [makeProduct()] }: { products?: ReturnType<typeof makeProduct>[] }) {
  return (
    <>
      <section aria-label="Products">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
      <Cart />
    </>
  );
}

test("adding a product from the storefront puts it in the cart", async () => {
  const product = makeProduct({ id: "mug", title: "Nebula Mug", price: 12.5 });
  const { user } = renderWithProviders(<Storefront products={[product]} />);

  // The cart starts empty.
  expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Add to Cart" }));

  // The empty state is gone and the product is listed in the cart.
  expect(screen.queryByText("Your cart is empty.")).not.toBeInTheDocument();
  expect(cartLineTitle("Nebula Mug")).toBeInTheDocument();
  expect(screen.getByText("1 item")).toBeInTheDocument();
  expect(screen.getByLabelText("Quantity")).toHaveValue(1);
  expect(within(summary()).getByText("$12.50")).toBeInTheDocument();
});

test("adding the same product twice updates quantity and total", async () => {
  const product = makeProduct({ id: "mug", title: "Nebula Mug", price: 12.5 });
  const { user } = renderWithProviders(<Storefront products={[product]} />);

  await user.click(screen.getByRole("button", { name: "Add to Cart" }));
  await user.click(screen.getByRole("button", { name: "Added ✓" }));

  expect(screen.getByText("2 items")).toBeInTheDocument();
  expect(screen.getByLabelText("Quantity")).toHaveValue(2);
  // One line, not two.
  expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(1);
  expect(within(summary()).getByText("$25.00")).toBeInTheDocument();
});

test("adding two different products lists them separately", async () => {
  const mug = makeProduct({ id: "mug", title: "Nebula Mug", price: 10 });
  const plate = makeProduct({ id: "plate", title: "Orbit Plate", price: 5 });
  const { user } = renderWithProviders(<Storefront products={[mug, plate]} />);

  const [addMug, addPlate] = screen.getAllByRole("button", { name: "Add to Cart" });
  await user.click(addMug);
  await user.click(addPlate);

  expect(screen.getAllByRole("button", { name: "Remove" })).toHaveLength(2);
  expect(screen.getByText("2 items")).toBeInTheDocument();
  expect(cartLineTitle("Nebula Mug")).toBeInTheDocument();
  expect(cartLineTitle("Orbit Plate")).toBeInTheDocument();
  expect(within(summary()).getByText("$15.00")).toBeInTheDocument();
});

test("removing the added product returns the cart to empty", async () => {
  const { user } = renderWithProviders(<Storefront />);

  await user.click(screen.getByRole("button", { name: "Add to Cart" }));
  await user.click(screen.getByRole("button", { name: "Remove" }));

  expect(screen.getByText("Your cart is empty.")).toBeInTheDocument();
  expect(screen.getByText("Nothing here yet")).toBeInTheDocument();
});

test("the order summary reflects the added product", async () => {
  const product = makeProduct({ id: "mug", title: "Nebula Mug", price: 12.5 });
  const { user } = renderWithProviders(<Storefront products={[product]} />);

  await user.click(screen.getByRole("button", { name: "Add to Cart" }));

  const totalRow = within(summary()).getByText("Total").parentElement as HTMLElement;
  expect(totalRow).toHaveTextContent("$12.50");
  expect(within(summary()).getByText("Items").parentElement).toHaveTextContent("1");
});
