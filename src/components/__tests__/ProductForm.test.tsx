import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductForm from "../ProductForm";
import { makeProduct } from "../../test-utils";

// ProductForm holds its own state and takes a callback. It needs no store and
// no router, so it renders bare — the smallest setup that exercises it.

describe("rendering", () => {
  test("starts empty when there is no product to edit", () => {
    render(<ProductForm submitLabel="Create" onSubmit={jest.fn()} />);

    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Description")).toHaveValue("");
    expect(screen.getByLabelText("Price")).toHaveValue(0);
  });

  test("pre-fills the fields when editing an existing product", () => {
    render(
      <ProductForm
        product={makeProduct({ title: "Nebula Mug", price: 12.5, category: "kitchen" })}
        submitLabel="Save"
        onSubmit={jest.fn()}
      />,
    );

    expect(screen.getByLabelText("Title")).toHaveValue("Nebula Mug");
    expect(screen.getByLabelText("Price")).toHaveValue(12.5);
    expect(screen.getByLabelText("Category")).toHaveValue("kitchen");
  });

  test("uses the caller's submit label", () => {
    render(<ProductForm submitLabel="Create product" onSubmit={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Create product" })).toBeEnabled();
  });

  test("disables the button and says so while submitting", () => {
    render(<ProductForm submitLabel="Save" submitting onSubmit={jest.fn()} />);

    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
  });
});

describe("typing", () => {
  test("updates a field as the user types", async () => {
    const user = userEvent.setup();
    render(<ProductForm submitLabel="Create" onSubmit={jest.fn()} />);

    const title = screen.getByLabelText("Title");
    await user.type(title, "Nebula Mug");

    expect(title).toHaveValue("Nebula Mug");
  });

  test("edits an existing value without disturbing the other fields", async () => {
    const user = userEvent.setup();
    render(
      <ProductForm
        product={makeProduct({ title: "Old", category: "kitchen" })}
        submitLabel="Save"
        onSubmit={jest.fn()}
      />,
    );

    const title = screen.getByLabelText("Title");
    await user.clear(title);
    await user.type(title, "New");

    expect(title).toHaveValue("New");
    expect(screen.getByLabelText("Category")).toHaveValue("kitchen");
  });
});

describe("submitting", () => {
  /** Fills every required field so the browser's own validation lets submit through. */
  async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText("Title"), "Nebula Mug");
    await user.clear(screen.getByLabelText("Price"));
    await user.type(screen.getByLabelText("Price"), "12.5");
    await user.type(screen.getByLabelText("Description"), "A ceramic mug.");
    await user.type(screen.getByLabelText("Category"), "kitchen");
    await user.type(screen.getByLabelText("Image URL"), "https://example.test/mug.png");
  }

  test("hands the typed values to onSubmit", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<ProductForm submitLabel="Create" onSubmit={onSubmit} />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      title: "Nebula Mug",
      price: 12.5,
      description: "A ceramic mug.",
      category: "kitchen",
      image: "https://example.test/mug.png",
    });
  });

  test("submits price as a number, not the raw input string", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<ProductForm submitLabel="Create" onSubmit={onSubmit} />);

    await fillRequiredFields(user);
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(typeof onSubmit.mock.calls[0][0].price).toBe("number");
  });

  test("does not submit while a required field is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<ProductForm submitLabel="Create" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText("Title"), "Only a title");
    await user.click(screen.getByRole("button", { name: "Create" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
