import {
  createContext,
  useState,
  useEffect,
  useContext,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../lib/firebase/firebase";

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
