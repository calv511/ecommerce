import { useState } from "react";
import { loginAnonymously, loginWithGoogle } from "../lib/firebase/firebase";
import { describeAuthError } from "../lib/firebase/authErrors";

type SocialAuthButtonsProps = {
  /** Called with a user-facing message, or "" to clear the current one. */
  onError: (message: string) => void;
  /** Label for the guest button — the two pages word it differently. */
  guestLabel?: string;
};

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.7 6.9l7.6 5.9c4.4-4.1 6.8-10.1 6.8-17.3z"
    />
    <path
      fill="#FBBC05"
      d="M10.4 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.3.8-4.7l-7.8-6.1C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.8l7.8-6.1z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.4 0-11.7-3.7-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z"
    />
  </svg>
);

const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onError,
  guestLabel = "Continue as guest",
}) => {
  const [pending, setPending] = useState<null | "google" | "guest">(null);

  // Signing in updates AuthContext, and each auth page redirects off the back
  // of that, so there is no navigation to do here.
  const run = async (kind: "google" | "guest", signIn: () => Promise<unknown>) => {
    onError("");
    setPending(kind);
    try {
      await signIn();
    } catch (error) {
      const message = describeAuthError(error);
      if (message) {
        onError(message);
      }
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <div className="auth-divider">
        <span>or</span>
      </div>

      <div className="auth-alternatives">
        <button
          type="button"
          className="btn btn-social"
          disabled={pending !== null}
          onClick={() => run("google", loginWithGoogle)}
        >
          <GoogleIcon />
          {pending === "google" ? "Opening Google..." : "Continue with Google"}
        </button>

        <button
          type="button"
          className="btn btn-social"
          disabled={pending !== null}
          onClick={() => run("guest", loginAnonymously)}
        >
          {pending === "guest" ? "Signing in..." : guestLabel}
        </button>
      </div>

      <p className="auth-guest-note">
        Guest sessions are temporary — you'll lose the cart and orders tied to
        them if you sign out or clear your browser.
      </p>
    </>
  );
};

export default SocialAuthButtons;
