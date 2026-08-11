import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, deleteUser } from "firebase/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  deleteDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase/firebase";
import {
  deleteCart,
  deleteUserProfile,
  getOrdersByUserId,
  getUserProfile,
  updateUserProfile,
} from "../lib/firebase/firestore";
import { Link } from "react-router-dom";
import { describeAuthError } from "../lib/firebase/authErrors";
const Profile: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ["orders", user?.uid],
    queryFn: () => getOrdersByUserId(user!.uid),
    enabled: Boolean(user),
    // A missing index or a denied read will never succeed on retry, and
    // retrying just delays the error reaching the screen.
    retry: false,
  });
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: () => getUserProfile(user!.uid),
    enabled: Boolean(user),
    retry: false,
  });

  // Seed the form from the saved profile once per user. Doing this in an
  // effect would re-run on every refetch and overwrite edits the user had
  // already typed but not yet saved.
  const [hydratedFor, setHydratedFor] = useState<string | null>(null);
  if (userProfile && hydratedFor !== userProfile.userId) {
    setHydratedFor(userProfile.userId);
    setDisplayName(userProfile.displayName);
    setEmail(userProfile.email);
    setAddress(userProfile.address);
  }

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
        displayName,
      });
      await updateUserProfile(
        user.uid,
        user.email ?? email,
        displayName,
        address,
      );
      await queryClient.invalidateQueries({
        queryKey: ["userProfile", user.uid],
      });
      setSuccess("Profile updated succesfully");
    } catch (error: unknown) {
      setError(describeAuthError(error));
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
        deleteUserProfile(user.uid),
        ...ordersSnapshot.docs.map((order) => deleteDoc(order.ref)),
      ]);
      await deleteUser(user);
      setSuccess("Account deleted successfully");
    } catch (error: unknown) {
      setError(describeAuthError(error));
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {user?.isAnonymous
              ? "Guest account"
              : userProfile?.displayName
                ? `Hi, ${userProfile.displayName}`
                : "Your profile"}
          </h1>
          <p className="page-subtitle">
            {user?.isAnonymous
              ? "Not signed in with an email"
              : userProfile?.email}
          </p>
        </div>
      </div>

      {user?.isAnonymous ? (
        <div className="guest-banner">
          You're browsing as a guest. Your cart and orders are saved to this
          temporary account, and signing out or clearing your browser will lose
          access to them for good. <Link to="/register">Create an account</Link>{" "}
          to keep them.
        </div>
      ) : null}

      <div className="profile-layout">
        <section className="card-panel">
          <h2 className="section-title">Account details</h2>

          {success && (
            <p className="form-message form-message--success" role="status">
              {success}
            </p>
          )}
          {error && (
            <p className="form-message form-message--error" role="alert">
              {error}
            </p>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div className="auth-fields">
              <div>
                <label className="field-label" htmlFor="profile-name">
                  Display name
                </label>
                <input
                  id="profile-name"
                  className="form-control"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="profile-address">
                  Address
                </label>
                <input
                  id="profile-address"
                  className="form-control"
                  type="text"
                  autoComplete="street-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your address"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="profile-email">
                  Email
                </label>
                <input
                  id="profile-email"
                  className="form-control"
                  disabled={true}
                  type="email"
                  value={email}
                  readOnly
                />
              </div>
            </div>

            <button className="btn btn-primary" type="submit">
              Save changes
            </button>
          </form>

          <div className="danger-zone">
            <p className="danger-zone-note">
              Deleting your account also removes your saved cart and every order
              you've placed. This can't be undone.
            </p>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className="btn btn-sm btn-outline-danger"
            >
              Delete account
            </button>
          </div>
        </section>

        <section className="card-panel">
          <h2 className="section-title">Past orders</h2>
          {ordersLoading ? (
            <p className="page-subtitle mb-0">Loading orders...</p>
          ) : ordersError ? (
            <p className="form-message form-message--error mb-0" role="alert">
              Could not load your orders: {ordersError.message}
            </p>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <p className="mb-0">No past orders yet.</p>
            </div>
          ) : (
            <ul className="order-list">
              {orders.map((order) => (
                <li key={order.id} className="order-item">
                  <Link to={`/orders/${order.id}`} className="order-link">
                    <div>
                      <div className="order-date">Order {order.id}</div>
                      <div className="order-meta">
                        {order.createdAt?.toDate().toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="order-meta">
                        {order.totalItems} item
                        {order.totalItems === 1 ? "" : "s"}
                      </div>
                    </div>
                    <div className="order-total">
                      ${order.totalPrice.toFixed(2)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Profile;
