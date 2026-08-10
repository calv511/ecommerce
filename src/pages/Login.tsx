import { useState, useEffect } from "react";
import { loginUser } from "../lib/firebase/firebase";
import { describeAuthError } from "../lib/firebase/authErrors";
import SocialAuthButtons from "../components/SocialAuthButtons";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { user } = useAuth();

  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    try {
      // Sign in user with email and password using Firebase Authentication
      await loginUser(email, password);
      navigate("/profile");
    } catch (error) {
      setError(describeAuthError(error));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue.</p>

        {error && (
          <p className="form-message form-message--error" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-fields">
            <div>
              <label className="field-label" htmlFor="login-email">
                Email
              </label>
              <input
                id="login-email"
                className="form-control"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="field-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                className="form-control"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Sign in
          </button>
        </form>

        <SocialAuthButtons onError={setError} />

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
