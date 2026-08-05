import { useState, type CSSProperties } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../lib/firebase/firebase";
import { useNavigate } from "react-router-dom";
import styles from "../styles/auth-styles";

const Register = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      // Create user with email and password using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      // Update the user's display name with the username
      await updateProfile(userCredential.user, { displayName: username });
      navigate("/profile");
    } catch (error: any) {
      setError(error.message);
    }
  };
  return (
    <div style={styles.form as CSSProperties}>
      <h1>Register</h1>
      <form onSubmit={handleSubmit}>
        {error && <p style={styles.error}>{error}</p>}
        <fieldset style={styles.fieldset}>
          <legend style={styles.legend}>Create an Account</legend>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>
            Register
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default Register;
