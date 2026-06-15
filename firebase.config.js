// ══════════════════════════════════════════════════════════════
//  firebase.config.js — Suraksha (suraksha-33bb4)
//  Your real Firebase project credentials
// ══════════════════════════════════════════════════════════════

import { initializeApp }  from "firebase/app";
import { getAnalytics }   from "firebase/analytics";
import { getAuth }        from "firebase/auth";
import { getFirestore }   from "firebase/firestore";

const firebaseConfig = {
  apiKey:            "AIzaSyDjAzPYsxCK37YzciwSlnWG3FXKb4mt2us",
  authDomain:        "suraksha-33bb4.firebaseapp.com",
  projectId:         "suraksha-33bb4",
  storageBucket:     "suraksha-33bb4.firebasestorage.app",
  messagingSenderId: "50440661956",
  appId:             "1:50440661956:web:1dc5bfe2f06ebcd6d09291",
  measurementId:     "G-4QHSZRNCRC",
};

const app       = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth      = getAuth(app);
const db        = getFirestore(app);

export { app, analytics, auth, db };
export default firebaseConfig;

// ══════════════════════════════════════════════════════════════
//  NEXT STEPS IN FIREBASE CONSOLE
//  1. console.firebase.google.com → suraksha-33bb4
//  2. Build → Authentication → Sign-in method → Enable Email/Password
//  3. Build → Firestore Database → Create database → Start in test mode
//  4. Firestore → Rules → paste the Firestore rules from README.md
// ══════════════════════════════════════════════════════════════
