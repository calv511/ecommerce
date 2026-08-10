import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth } from "../lib/firebase/firebase";

const Logout = () => {
  useEffect(() => {
    signOut(auth);
  }, []);

  return (
    <div className="page">
      <div className="empty-state">
        <p>You've been signed out.</p>
        <Link className="btn btn-primary" to="/">
          Back to shop
        </Link>
      </div>
    </div>
  );
};

export default Logout;
