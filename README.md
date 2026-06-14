# 🛡️ Suraksha — Women Safety Platform

> **"Your safety, always one tap away."**

Suraksha is a modern, full-stack women safety web application built with **React.js + Vite** on the frontend and **Firebase Authentication + Firestore** on the backend. It provides instant SOS alerts, live GPS location sharing, an AI safety assistant, and a trusted emergency contacts hub.

---

## 📸 Features

| Feature | Description |
|---|---|
| 🔐 **Authentication** | Email/password signup & login via Firebase Auth |
| 🚨 **SOS Emergency** | One-tap SOS alert with GPS location sent to emergency contacts |
| 📍 **Live Location** | Browser Geolocation API — fetch, display & share coordinates |
| 👥 **Emergency Contacts** | Add/remove contacts stored in Firestore |
| 🤖 **AI Safety Assistant** | Context-aware safety guidance for real-world situations |
| 👤 **User Profile** | Account info, stats, and secure logout |

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+ installed
- A Firebase project (free tier works)

### 2. Clone / Set up the project

```bash
# Create project folder
mkdir suraksha && cd suraksha

# Copy all provided files into this folder, then:
npm install
```

### 3. Run the app (Demo mode — no Firebase needed)

The app includes a **built-in Firebase simulator** that works entirely in `localStorage`. You can sign up, log in, add contacts, and use all features without any Firebase setup.

```bash
npm run dev
# → Opens at http://localhost:3000
```

---

## 🔥 Connecting Real Firebase

### Step 1 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add Project** → name it `suraksha`
3. Disable Google Analytics (optional) → **Create Project**

### Step 2 — Enable Authentication

1. In your Firebase project, go to **Build → Authentication**
2. Click **Get Started**
3. Under **Sign-in method**, enable **Email/Password**
4. Save

### Step 3 — Enable Firestore

1. Go to **Build → Firestore Database**
2. Click **Create Database**
3. Choose **Start in test mode** (for development)
4. Select a region → **Done**

### Step 4 — Get Your Config

1. Go to **Project Settings** (gear icon)
2. Under **Your apps**, click **Add app → Web (</>)**
3. Register the app with name `suraksha-web`
4. Copy the `firebaseConfig` object

### Step 5 — Update `firebase.config.js`

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "suraksha-xxxxx.firebaseapp.com",
  projectId: "suraksha-xxxxx",
  storageBucket: "suraksha-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
};
```

### Step 6 — Replace Simulator with Real Firebase in `Suraksha.jsx`

In `Suraksha.jsx`, replace the `FirebaseSimulator` usage with real Firebase SDK calls:

#### Auth (replace `firebase.signUp`, `firebase.signIn`, `firebase.signOut`)

```js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase.config.js";

// Sign Up
const cred = await createUserWithEmailAndPassword(auth, email, password);
await updateProfile(cred.user, { displayName: name });

// Sign In
await signInWithEmailAndPassword(auth, email, password);

// Sign Out
await signOut(auth);

// Auth listener
onAuthStateChanged(auth, (user) => setUser(user));
```

#### Firestore Contacts (replace `firebase.getContacts`, `firebase.addContact`, `firebase.deleteContact`)

```js
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, where, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase.config.js";

// Get contacts
const q = query(collection(db, "contacts"), where("uid", "==", user.uid));
const snap = await getDocs(q);
const contacts = snap.docs.map(d => ({ id: d.id, ...d.data() }));

// Add contact
await addDoc(collection(db, "contacts"), { uid: user.uid, name, phone, relation, createdAt: serverTimestamp() });

// Delete contact
await deleteDoc(doc(db, "contacts", contactId));
```

---

## 📁 Project Structure

```
suraksha/
├── index.html              # HTML entry point
├── main.jsx                # React DOM render
├── Suraksha.jsx            # Main app (all components)
├── firebase.config.js      # Firebase setup (replace credentials)
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies
└── README.md               # This file
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, CSS-in-JS |
| Auth | Firebase Authentication (Email/Password) |
| Database | Cloud Firestore |
| Location | Browser Geolocation API |
| AI | Built-in rule engine (expandable to OpenAI / Gemini) |
| Fonts | Google Fonts — Inter, DM Sans |

---

## 🔮 Future Enhancements

- [ ] **Real-time SOS** — WebSockets + Twilio SMS/WhatsApp alerts
- [ ] **Google Maps** — Live map view with route assistance
- [ ] **Voice Recording** — Auto-record audio during SOS
- [ ] **Push Notifications** — Web Push API for background alerts
- [ ] **OpenAI / Gemini** — Replace rule-based AI with real LLM
- [ ] **Community Network** — Crowdsourced safety reports on a map
- [ ] **Offline Mode** — Service Worker for offline SOS
- [ ] **Safe Route** — Pathfinding avoiding unsafe zones

---

## 🌐 Deploying to Production

### Vercel (recommended — free)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag & drop the `dist/` folder to https://app.netlify.com/drop
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # point to dist/
npm run build
firebase deploy
```

---

## 🔒 Security Notes

- Never commit real Firebase credentials to public repos.
- Use `.env` file for credentials:
  ```
  VITE_FIREBASE_API_KEY=your_key
  VITE_FIREBASE_PROJECT_ID=your_project
  ```
- Add Firestore Security Rules to restrict reads/writes by `auth.uid`.

### Recommended Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contacts/{contactId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.uid;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.uid;
    }
  }
}
```

---

## 📞 Emergency Numbers (India)

| Service | Number |
|---|---|
| Police | 100 |
| Ambulance | 108 |
| National Emergency | 112 |
| Women's Helpline | 1091 |
| Domestic Violence | 181 |

---

## 📄 License

MIT License — Free to use, modify, and distribute.

---

*Built with 💙 for women's safety. Every second counts.*
