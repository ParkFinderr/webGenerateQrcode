import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";

// Read from process.env since node doesn't have import.meta.env directly
console.log("Process ENV VITE_FIREBASE_PROJECT_ID:", process.env.VITE_FIREBASE_PROJECT_ID);

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

console.log("Config object:", firebaseConfig);

try {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  console.log("Firebase initialized successfully!");
  
  const q = query(collection(db, "tickets"), limit(5));
  const snap = await getDocs(q);
  console.log(`Fetched ${snap.size} tickets:`);
  snap.forEach(doc => {
    console.log(doc.id, "=>", doc.data());
  });
} catch (err) {
  console.error("Error connecting to Firebase:", err);
}
