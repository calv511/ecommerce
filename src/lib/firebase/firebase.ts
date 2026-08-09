import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAyGrA5FpYzZ7tlzmulkYkCseNTcTlinSs",
  authDomain: "ecommerce-demo-63841.firebaseapp.com",
  projectId: "ecommerce-demo-63841",
  storageBucket: "ecommerce-demo-63841.firebasestorage.app",
  messagingSenderId: "293111462630",
  appId: "1:293111462630:web:b970cc94bc11d1e230d927"
};

// Initialize Firebase and Authentication services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// 1. Listen for Authentication State Changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in with UID:", user.uid);
    // Update your UI or redirect the user to their dashboard
  } else {
    console.log("No user is signed in.");
    // Show login/registration forms
  }
});

// 2. Sign In with Email and Password
export async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Login failed:", error.message);
    throw error;
  }
}

// Anonymous login
export async function loginAnonymously() {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error: any) {
    console.error("Anonymous login failed:", error.message);
    throw error;
  }
}

// Google login
export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  } catch (error: any) {
    console.error("Google login failed:", error.message);
    throw error;
  }
}

// 3. Sign Out
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Logout failed:", error.message);
  }
}
