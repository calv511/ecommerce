import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase/firebase";
interface AuthContextType {
  user: null | User;
  setUser: (user: User) => void;
  // False until Firebase has reported the initial auth state. Before that,
  // `user === null` means "not known yet", not "signed out".
  authReady: boolean;
}
const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  authReady: false,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        void (async () => {
          try {
            const userDoc = doc(db, "users", user.uid);
            const snapshot = await getDoc(userDoc);

            if (!snapshot.exists()) {
              await setDoc(userDoc, {
                userId: user.uid,
                email: user.email ?? "",
                displayName: user.displayName ?? "",
                address: "",
                createdAt: serverTimestamp(),
              });
            }
          } catch (error) {
            console.error("Unable to create user profile:", error);
          }
        })();
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, authReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
