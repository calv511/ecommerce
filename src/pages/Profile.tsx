import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, deleteUser } from "firebase/auth";
import { useQuery } from "@tanstack/react-query";
import { collection, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase/firebase";
import { deleteCart, getOrdersByUserId } from "../lib/firebase/firestore";
import styles from "../styles/auth-styles";

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["orders", user?.uid],
    queryFn: () => getOrdersByUserId(user!.uid),
    enabled: Boolean(user),
  });

  // Handle profile update submission
  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!user) {
      setError("User not found");
      return;
    }
    try {
      await updateProfile(user, {
        displayName: displayName,
      });
      setSuccess("Profile updated succesfully");
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (!user) {
        setError("User not found");
        return;
      }
      const ordersQuery = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      await Promise.all([
        deleteCart(user.uid),
        ...ordersSnapshot.docs.map((order) => deleteDoc(order.ref)),
      ]);
      await deleteUser(user);
      setSuccess("Account deleted successfully");
    } catch (error: any) {
      setError(error.message);
    }
  };

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
          type="button"
          onClick={handleDeleteAccount}
          style={styles.deleteAccountButton}
        >
          Delete Account
        </button>
      </form>
      <section>
        <h2>Past Orders</h2>
        {ordersLoading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No past orders.</p>
        ) : (
          <ul>
            {orders.map((order) => (
              <li key={order.id}>
                {order.createdAt?.toDate().toLocaleDateString()} —{" "}
                {order.totalItems} item{order.totalItems === 1 ? "" : "s"} — $
                {order.totalPrice.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Profile;
