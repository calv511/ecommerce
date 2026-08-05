import { useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase/firebase";

const Logout = () => {
  useEffect(() => {
    signOut(auth);
  }, []);

  return <div>Logged out</div>;
};

export default Logout;
