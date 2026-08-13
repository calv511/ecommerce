import { FirebaseError } from "firebase/app";
import { describeAuthError } from "../authErrors";

// Uses the real FirebaseError class — `describeAuthError` branches on
// `instanceof`, so a fake would not exercise the code that matters.

describe("errors the user chose to cause", () => {
  test.each([
    "auth/popup-closed-by-user",
    "auth/cancelled-popup-request",
    "auth/user-cancelled",
  ])("stays silent for %s", (code) => {
    expect(describeAuthError(new FirebaseError(code, "raw message"))).toBe("");
  });
});

describe("errors worth explaining", () => {
  test("rewrites a wrong password without leaking which field was wrong", () => {
    expect(describeAuthError(new FirebaseError("auth/wrong-password", "raw"))).toBe(
      "Incorrect email or password.",
    );
  });

  test("gives the same message for a missing user, so accounts cannot be probed", () => {
    expect(describeAuthError(new FirebaseError("auth/user-not-found", "raw"))).toBe(
      "Incorrect email or password.",
    );
  });

  test("explains a blocked popup with the fix", () => {
    expect(describeAuthError(new FirebaseError("auth/popup-blocked", "raw"))).toContain(
      "Allow pop-ups",
    );
  });

  test("explains a duplicate signup", () => {
    expect(
      describeAuthError(new FirebaseError("auth/email-already-in-use", "raw")),
    ).toBe("An account with that email already exists.");
  });

  test("states the password length rule", () => {
    expect(describeAuthError(new FirebaseError("auth/weak-password", "raw"))).toContain(
      "6 characters",
    );
  });
});

describe("anything else", () => {
  test("falls back to the Firebase message for an unmapped code", () => {
    expect(
      describeAuthError(new FirebaseError("auth/some-future-code", "the raw text")),
    ).toContain("the raw text");
  });

  test("uses the message of a plain Error", () => {
    expect(describeAuthError(new Error("network exploded"))).toBe("network exploded");
  });

  test("returns something sayable when handed a non-Error", () => {
    expect(describeAuthError("just a string")).toBe(
      "Something went wrong. Please try again.",
    );
  });

  test("does not throw on null", () => {
    expect(() => describeAuthError(null)).not.toThrow();
  });
});
