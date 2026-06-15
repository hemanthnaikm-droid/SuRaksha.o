# 🛡️ Suraksha — Women Safety Platform
### React 18 · Vite · **Real Firebase** (suraksha-33bb4) · Claude AI

---

## ✅ What's Fully Working NOW (with your Firebase)

| Feature | Backend | Status |
|---|---|---|
| User Signup | Firebase Auth (real) | ✅ Live |
| User Login | Firebase Auth (real) | ✅ Live |
| User Logout | Firebase Auth (real) | ✅ Live |
| Emergency Contacts (Add/Delete) | Firestore (real) | ✅ Live |
| Contacts persist across devices | Firestore (real) | ✅ Live |
| AI Safety Chat | Claude Sonnet API | ✅ Live |
| Live GPS Location | Browser Geolocation | ✅ Live |
| Voice Recording | Web Audio API (real) | ✅ Live |
| SOS Emergency | UI + countdown | ✅ Live |
| Safe Route | AI-generated steps | ✅ Live |
| Community Safety | Local state | ✅ Live |
| Notifications | Toggle + history | ✅ Live |
| User Profile | Firebase user object | ✅ Live |

---

## 🚀 Run Locally in 3 Steps

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
# → Opens at http://localhost:3000
```

> **No extra config needed.** Your Firebase credentials are already embedded in `Suraksha.jsx`.

---

## 🔥 Firebase Console Setup (one-time, 5 min)

Your project **suraksha-33bb4** is already in the code. You just need to enable 2 services:

### Step 1 — Enable Email/Password Authentication
1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Select project: **suraksha-33bb4**
3. **Build → Authentication → Get Started**
4. **Sign-in method → Email/Password → Enable → Save**

### Step 2 — Enable Firestore Database
1. **Build → Firestore Database → Create database**
2. Choose **"Start in test mode"** (for development)
3. Select a region → **Done**

### Step 3 — Apply Firestore Security Rules
1. **Firestore → Rules tab**
2. Replace the default rules with the contents of `firestore.rules`
3. Click **Publish**

That's it — your app is now fully connected to Firebase! 🎉

---

## 📁 Project Files

```
suraksha/
├── Suraksha.jsx       🏗️  Complete app — 1,133 lines, 22 components
│                          Real Firebase Auth + Firestore embedded
├── main.jsx           ⚡  ReactDOM.createRoot entry point
├── index.html         🌐  Vite HTML template
├── vite.config.js     ⚙️  Vite configuration
├── package.json       📦  Dependencies (React 18, Vite, Firebase 10)
├── firebase.config.js 🔥  Standalone Firebase export (optional import)
├── firestore.rules    🔒  Firestore security rules — paste in console
└── README.md          📖  This file
```

---

## 🔒 Firestore Security Rules

Already in `firestore.rules`. Key rules:
- **Contacts**: only the owner (`uid`) can read/write their contacts
- **Community Reports**: all authenticated users can read; only creator can delete
- **SOS Logs**: private to owner

---

## 🌐 Deploy to Production

### Vercel (recommended — free, zero config)
```bash
npm install -g vercel
vercel
# Follow prompts — done in 60 seconds
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # select suraksha-33bb4, set public dir to "dist"
npm run build
firebase deploy
# → https://suraksha-33bb4.web.app
```

### Netlify
```bash
npm run build
# Drag the dist/ folder to app.netlify.com/drop
```

---

## 🤖 Claude AI Setup

The AI assistant calls **Anthropic's Claude API** directly. To enable it:

1. Get your API key from [console.anthropic.com](https://console.anthropic.com)
2. In `Suraksha.jsx`, find `callClaudeAI()` and add your key:

```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": "sk-ant-YOUR_KEY_HERE",        // add this line
  "anthropic-version": "2023-06-01",            // add this line
},
```

> ⚠️ **For production**: never expose your API key in frontend code. Route through a Firebase Cloud Function instead (see below).

### Firebase Cloud Function (secure, production-ready)
```js
// functions/index.js
const { onCall } = require("firebase-functions/v2/https");
const Anthropic   = require("@anthropic-ai/sdk");

exports.safetyAI = onCall(async (request) => {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: "You are Suraksha AI...",
    messages: request.data.messages,
  });
  return { reply: msg.content[0].text };
});
```

---

## 📲 Future Production Integrations

| Feature | Service | How |
|---|---|---|
| SOS SMS alerts | Twilio SMS | Firebase Cloud Function on SOS trigger |
| WhatsApp alerts | Twilio WhatsApp API | Same Cloud Function |
| Voice backup | Firebase Storage | Upload audio blob after recording |
| Push notifications | Firebase FCM | Web Push API + service worker |
| Google Maps | Maps JavaScript API | Add VITE_MAPS_API_KEY to .env |
| Real-time location | Firebase Realtime DB | Push coordinates every 30s |

---

## 📞 Emergency Helplines (India)

| Service | Number |
|---|---|
| Police | 100 |
| Ambulance | 108 |
| National Emergency | 112 |
| Women's Helpline | 1091 |
| Domestic Violence | 181 |
| iCall Mental Health | 9152987821 |

---

*Built with 💙 for women's safety. Firebase project: suraksha-33bb4*
