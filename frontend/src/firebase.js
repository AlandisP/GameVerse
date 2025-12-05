// Import Firebase core
import { initializeApp } from "firebase/app";

// Import Firestore ( this is required for messaging)
import { getFirestore } from "firebase/firestore";

// Optional: Analytics (you can keep it or remove it)
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyVs9_mHJq1CHpzZ86bX6o2ioB3N2TRZg",
  authDomain: "gameverse-e5fd8.firebaseapp.com",
  projectId: "gameverse-e5fd8",
  storageBucket: "gameverse-e5fd8.firebasestorage.app",
  messagingSenderId: "358995248974",
  appId: "1:358995248974:web:e0f819aa9ef3cee75c401f",
  measurementId: "G-SWESBLCL3Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Optional analytics
const analytics = getAnalytics(app);

// Initialize Firestore and EXPORT IT
export const db = getFirestore(app);
