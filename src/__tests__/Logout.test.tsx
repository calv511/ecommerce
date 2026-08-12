import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { signOut } from "firebase/auth";
import Logout from "../pages/Logout";

// Logout renders a <Link>, so it needs a Router around it.
// Firebase is stubbed so the test never initializes a real app or hits the network.
jest.mock("../lib/firebase/firebase", () => ({ auth: {} }));
jest.mock("firebase/auth", () => ({ signOut: jest.fn(() => Promise.resolve()) }));

test("matches snapshot", () => {
  const { asFragment } = render(
    <MemoryRouter>
      <Logout />
    </MemoryRouter>,
  );

  expect(asFragment()).toMatchSnapshot();
});

test("signs the user out on mount", () => {
  render(
    <MemoryRouter>
      <Logout />
    </MemoryRouter>,
  );

  expect(jest.mocked(signOut)).toHaveBeenCalled();
});
