import { deleteApp, initializeApp } from "firebase/app";
import { signInAnonymously, getAuth } from "firebase/auth";
import { addDoc, collection, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAyGrA5FpYzZ7tlzmulkYkCseNTcTlinSs",
  authDomain: "ecommerce-demo-63841.firebaseapp.com",
  projectId: "ecommerce-demo-63841",
  storageBucket: "ecommerce-demo-63841.firebasestorage.app",
  messagingSenderId: "293111462630",
  appId: "1:293111462630:web:b970cc94bc11d1e230d927",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedProducts() {
  const response = await fetch("https://fakestoreapi.com/products");
  if (!response.ok) {
    throw new Error(`Unable to fetch products: ${response.status}`);
  }

  const products = await response.json();
  await signInAnonymously(getAuth(app));

  await Promise.all(
    products.map(({ id: _fakeStoreId, ...product }) =>
      addDoc(collection(db, "products"), product),
    ),
  );

  console.log(`Seeded ${products.length} products.`);
}

// The Firestore client keeps a connection open, which holds the Node event
// loop and stops the script from exiting on its own. Tear the app down so the
// process ends instead of hanging after the writes land.
seedProducts()
  .catch((error) => {
    console.error("Unable to seed products:", error);
    process.exitCode = 1;
  })
  .finally(() => deleteApp(app));
