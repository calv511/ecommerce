import { FirebaseError } from "firebase/app";

/**
 * Turns a Firebase auth error into something worth showing a user.
 *
 * Returns an empty string for errors that are not failures — closing the
 * Google popup is a decision, not a problem, and showing an alert for it is
 * just noise.
 */
export function describeAuthError(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";
  }

  switch (error.code) {
    // The user backed out of the popup on purpose.
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
    case "auth/user-cancelled":
      return "";

    case "auth/popup-blocked":
      return "Your browser blocked the sign-in window. Allow pop-ups for this site and try again.";

    // Both of these mean the sign-in provider is switched off in the Firebase
    // console, which is the most likely first-run failure.
    case "auth/operation-not-allowed":
    case "auth/admin-restricted-operation":
      return "That sign-in method isn't enabled for this project yet.";

    case "auth/unauthorized-domain":
      return "This domain isn't authorized for sign-in in the Firebase console.";

    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Incorrect email or password.";

    case "auth/invalid-email":
      return "Enter a valid email address.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/email-already-in-use":
      return "An account with that email already exists.";

    case "auth/weak-password":
      return "Passwords need to be at least 6 characters.";

    case "auth/missing-password":
      return "Enter your password.";

    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";

    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";

    case "auth/requires-recent-login":
      return "For your security, sign in again before deleting your account.";

    case "auth/account-exists-with-different-credential":
      return "You already have an account with that email. Sign in with your password instead.";

    default:
      return error.message;
  }
}
