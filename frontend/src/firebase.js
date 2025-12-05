// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);