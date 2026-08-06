import {useState} from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, deleteUser } from "firebase/auth";
import styles from "../styles/auth-styles";

const Profile: React.FC = () => {
  const {user} = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  return (
    <div style={styles.form}>
      <h1>Profile</h1>
      <form onSubmit={handleUpdateProfile}>
        <input
          style={styles.input}
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Name"
        />
        <input
          style={styles.input}
          disabled={true}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <button style={styles.button} type="submit">
          Update Profile
        </button>
        {success && <p style={styles.success}>{success}</p>}
        {error && <p style={styles.error}>{error}</p>}
        <button
          onClick={handleDeleteAccount}
          style={styles.deleteAccountButton}
        >
          Delete Account
        </button>
      </form>
    </div>
  );
};

export default Profile;
