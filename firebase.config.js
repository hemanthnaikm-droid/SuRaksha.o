// ──────────────────────────────────────────────────────────────
//  firebase.config.js  —  Suraksha Firebase Configuration
//  Replace the placeholder values with your Firebase project credentials.
//  Get them from: https://console.firebase.google.com
// ──────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

// ──────────────────────────────────────────────────────────────
//  HOW TO CONNECT REAL FIREBASE:
//
//  1. Go to https://console.firebase.google.com
//  2. Create a new project called "suraksha"
//  3. Add a Web App and copy the config above
//  4. Enable Authentication → Email/Password
//  5. Enable Firestore Database (start in test mode)
//
//  Then in Suraksha.jsx, replace the FirebaseSimulator with
//  real Firebase calls using the auth and db exports above.
//
//  Auth calls:
//    import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
//    import { auth } from "./firebase.config.js";
//
//  Firestore calls:
//    import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
//    import { db } from "./firebase.config.js";
// ──────────────────────────────────────────────────────────────
