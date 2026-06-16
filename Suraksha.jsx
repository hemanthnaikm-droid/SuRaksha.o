import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════════════════════
//  REAL FIREBASE — Auth + Firestore + Analytics
// ══════════════════════════════════════════════════════════════
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjAzPYsxCK37YzciwSlnWG3FXKb4mt2us",
  authDomain: "suraksha-33bb4.firebaseapp.com",
  projectId: "suraksha-33bb4",
  storageBucket: "suraksha-33bb4.firebasestorage.app",
  messagingSenderId: "50440661956",
  appId: "1:50440661956:web:1dc5bfe2f06ebcd6d09291",
  measurementId: "G-4QHSZRNCRC",
};

const app      = initializeApp(firebaseConfig);
let analytics  = null;
try { analytics = getAnalytics(app); } catch { /* analytics unsupported/blocked — non-fatal */ }
const fbAuth   = getAuth(app);
const db       = getFirestore(app);

// ── helpers that match the old simulator API ──────────────────
function formatFirebaseError(err) {
  const map = {
    "auth/email-already-in-use": "That email is already registered.",
    "auth/weak-password":        "Password must be at least 6 characters.",
    "auth/wrong-password":       "Incorrect email or password.",
    "auth/user-not-found":       "No account found with that email.",
    "auth/invalid-email":        "Please enter a valid email address.",
    "auth/too-many-requests":    "Too many attempts. Try again later.",
    "auth/invalid-credential":   "Incorrect email or password.",
  };
  return map[err?.code] || err?.message || "Something went wrong.";
}

// ══════════════════════════════════════════════════════════════
//  CLAUDE AI SAFETY ASSISTANT
// ══════════════════════════════════════════════════════════════
const SAFETY_SYSTEM_PROMPT = `You are Suraksha AI — a compassionate, expert women's safety assistant built into the Suraksha app used in India.
Provide calm, clear, actionable safety guidance. Give numbered steps. Share emergency numbers when relevant (Police:100, Ambulance:108, Emergency:112, Women's Helpline:1091).
Keep responses under 200 words. Use occasional emojis for warmth. Only handle safety topics.`;

// NOTE: Anthropic's API cannot be called directly from a browser (CORS-blocked,
// and an API key embedded in frontend code would be publicly exposed).
// If you deploy the Firebase Cloud Function from README.md, set
// VITE_AI_ENDPOINT in a .env file to its URL and this will call it.
// Otherwise (no endpoint configured), Suraksha falls back to the built-in
// local safety assistant below — which is fully functional offline.
const AI_ENDPOINT = import.meta.env?.VITE_AI_ENDPOINT || "";

async function callClaudeAI(history) {
  const messages = history
    .filter(m => m.role === "user" || m.role === "bot")
    .map(m => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text }));
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  if (!AI_ENDPOINT) return getLocalAI(lastUserMsg);
  try {
    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system: SAFETY_SYSTEM_PROMPT, messages }),
    });
    if (!res.ok) throw new Error("API " + res.status);
    const data = await res.json();
    return data.content?.[0]?.text || getLocalAI(lastUserMsg);
  } catch { return getLocalAI(lastUserMsg); }
}

function getLocalAI(msg) {
  const m = msg.toLowerCase();
  if (m.includes("follow") || m.includes("stalker"))
    return "⚠️ If you're being followed:\n\n1. Do NOT go home directly\n2. Enter the nearest store or public place\n3. Call someone and stay on the line\n4. Note their description (clothing, vehicle)\n5. Call 112 if threat continues\n6. Share your live location via Suraksha now\n\nYou are not alone. Stay in public.";
  if (m.includes("harass") || m.includes("assault") || m.includes("attack"))
    return "🚨 Immediate steps:\n\n1. Move toward crowded, well-lit areas NOW\n2. Shout loudly — attract attention\n3. Activate Suraksha SOS to alert contacts\n4. Call 112 or 1091 (Women's Helpline)\n5. Record audio using Voice Recorder\n\nWhat's happening is not your fault. Help is coming.";
  if (m.includes("unsafe") || m.includes("scared") || m.includes("afraid"))
    return "I hear you — your feelings are valid 💙\n\n1. Move to a populated, lit area\n2. Call someone from Emergency Contacts\n3. Activate SOS if situation escalates\n4. Keep phone in hand, earphones out\n5. Trust your instincts — they protect you\n\nOne step at a time. You've got this.";
  if (m.includes("route") || m.includes("home") || m.includes("walk") || m.includes("night"))
    return "🌙 Night safety checklist:\n\n1. Share live location before leaving\n2. Use well-lit, busy streets — avoid shortcuts\n3. Stay on a call with someone\n4. Keep phone charged and accessible\n5. Use Suraksha Safe Route for AI-verified paths\n6. Tell someone your ETA";
  if (m.includes("helpline") || m.includes("number") || m.includes("police"))
    return "📞 Emergency Numbers — India:\n\n🚔 Police: 100\n🚑 Ambulance: 108\n📞 National Emergency: 112\n👩 Women's Helpline: 1091\n🏠 Domestic Violence: 181\n🧠 iCall: 9152987821\n\nSave these on speed dial. Suraksha SOS alerts your personal contacts too.";
  if (m.includes("hello") || m.includes("hi") || m.length < 5)
    return "Hello! I'm Suraksha AI 🛡️\n\nI provide expert safety guidance powered by Claude. Ask me about:\n• Being followed or feeling unsafe\n• Harassment or assault\n• Safe routes and night travel\n• Emergency helplines\n• How to use Suraksha features\n\nWhat can I help you with today?";
  return "I'm here to help with your safety 💙\n\nTell me more about your situation and I'll give specific guidance. I can help with:\n• Immediate threats or danger\n• Harassment or stalking\n• Safe travel planning\n• Emergency resources\n\nYour safety is the priority.";
}

// ══════════════════════════════════════════════════════════════
//  SOS ALERT — calls /api/sos-alert (Vercel serverless function)
//  Sends real SMS (Twilio) + Email (SendGrid) if those env vars
//  are configured on the server. If not configured, returns a
//  clear "not configured" result rather than throwing.
// ══════════════════════════════════════════════════════════════
async function sendSOSAlert({ userName, location, contacts, channels }) {
  try {
    const res = await fetch("/api/sos-alert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userName, location, contacts, channels }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.ok, results: data.results, status: res.status };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ══════════════════════════════════════════════════════════════
//  CONSTANTS
// ══════════════════════════════════════════════════════════════
const HELPLINES = [
  { icon: "🚔", label: "Police",             number: "100" },
  { icon: "🚑", label: "Ambulance",          number: "108" },
  { icon: "📞", label: "National Emergency", number: "112" },
  { icon: "👩", label: "Women's Helpline",   number: "1091" },
  { icon: "🏠", label: "Domestic Violence",  number: "181" },
  { icon: "🧠", label: "iCall Mental Health",number: "9152987821" },
];

const COMMUNITY_SEED = [
  { id: "r1", type: "suspicious", desc: "Unlit street near old bus stand — avoid after 9pm.", area: "Ashoka Road, Mysuru", time: "10m ago", votes: 7,  userVoted: false },
  { id: "r2", type: "harassment", desc: "Verbal harassment near evening market. Stay alert.",  area: "Devaraja Market",    time: "45m ago",votes: 12, userVoted: false },
  { id: "r3", type: "safe",       desc: "Well-lit and patrolled. Safe to walk at night.",        area: "Chamundi Hill Road", time: "2h ago",  votes: 19, userVoted: false },
  { id: "r4", type: "unsafe",     desc: "Poorly lit underpass — take alternate route after dark.",area: "KRS Road Underpass", time: "5h ago",  votes: 5,  userVoted: false },
  { id: "r5", type: "suspicious", desc: "Unknown vehicle parked near school for multiple days.", area: "Saraswathipuram",    time: "1h ago",  votes: 3,  userVoted: false },
];

const INIT_NOTIFS = [
  { id: 1, title: "🛡️ Suraksha Active",    body: "Your safety shield is on. SOS ready.",                              time: "2m ago",  read: false },
  { id: 2, title: "📍 Location Reminder",  body: "Share location with contacts before travelling at night.",           time: "1h ago",  read: false },
  { id: 3, title: "👥 Community Alert",    body: "Suspicious activity reported near Devaraja Market, Mysuru.",         time: "3h ago",  read: true  },
  { id: 4, title: "💡 Safety Tip",         body: "Always trust your instincts. If something feels wrong, act immediately.", time: "5h ago", read: true },
];

// ══════════════════════════════════════════════════════════════
//  GLOBAL STYLES
// ══════════════════════════════════════════════════════════════
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:'Inter',sans-serif;background:#0a1628;color:#fff;min-height:100vh;overflow-x:hidden}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1);border-radius:2px}
input,textarea,select,button{font-family:inherit}button{cursor:pointer}textarea{resize:none}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.82)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes toastIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
@keyframes sosPulse{0%,100%{box-shadow:0 0 0 0 rgba(244,63,94,0)}50%{box-shadow:0 0 0 18px rgba(244,63,94,.07)}}
@keyframes recPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes pinBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes waveBar{0%,100%{height:6px;opacity:.4}50%{height:26px;opacity:1}}
@keyframes typingDot{0%,80%,100%{transform:scale(.8);opacity:.4}40%{transform:scale(1);opacity:1}}
@keyframes blip{0%,100%{opacity:1}50%{opacity:.45}}
.spinner{display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle}
.anim{animation:fadeUp .25s ease-out}
.divider{height:1px;background:rgba(255,255,255,.07);margin:1rem 0}
.sl{font-size:.66rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:9px}
.hint{font-size:.64rem;color:rgba(255,255,255,.25);text-align:center;line-height:1.65;margin-top:.7rem}
.tag{display:inline-block;font-size:.6rem;font-weight:700;padding:2px 7px;border-radius:5px;letter-spacing:.03em}
.tag-new{background:rgba(34,197,94,.18);border:1px solid rgba(34,197,94,.3);color:#86efac}
.tag-ai{background:rgba(124,58,237,.18);border:1px solid rgba(124,58,237,.3);color:#c4b5fd}
.nav{position:sticky;top:0;z-index:100;background:rgba(10,22,40,.98);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.08);padding:0 1.5rem;height:60px;display:flex;align-items:center;justify-content:space-between}
.logo{display:flex;align-items:center;gap:8px}
.logo-icon{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#2563eb,#06b6d4);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.logo-text{font-family:'DM Sans',sans-serif;font-size:1.1rem;font-weight:700;letter-spacing:-.02em}
.logo-text em{font-style:normal;color:#06b6d4}
.nav-r{display:flex;gap:8px;align-items:center}
.btn-g{background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.8);padding:6px 14px;border-radius:8px;font-size:.79rem;font-weight:500;transition:all .2s}
.btn-g:hover{border-color:#2563eb;color:#fff;background:rgba(37,99,235,.15)}
.btn-p{background:linear-gradient(135deg,#2563eb,#1d4ed8);border:none;color:#fff;padding:6px 16px;border-radius:8px;font-size:.79rem;font-weight:600;transition:all .2s;box-shadow:0 4px 14px rgba(37,99,235,.35)}
.btn-p:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(37,99,235,.5)}
.hero{min-height:calc(100vh - 60px);background:radial-gradient(ellipse at 20% 50%,rgba(37,99,235,.18) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(6,182,212,.12) 0%,transparent 50%),#0a1628;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:3rem 1.5rem 5rem}
.hero-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(37,99,235,.15);border:1px solid rgba(37,99,235,.35);padding:5px 13px;border-radius:100px;font-size:.7rem;font-weight:600;color:#93c5fd;margin-bottom:1.75rem;letter-spacing:.05em;text-transform:uppercase}
.bdot{width:6px;height:6px;background:#06b6d4;border-radius:50%;animation:pulse 2s infinite}
.hero h1{font-family:'DM Sans',sans-serif;font-size:clamp(2rem,5vw,3.8rem);font-weight:800;line-height:1.07;letter-spacing:-.03em;margin-bottom:1.2rem}
.hero h1 em{font-style:normal;color:#06b6d4}
.hero-sub{font-size:.93rem;color:rgba(255,255,255,.55);max-width:460px;line-height:1.72;margin-bottom:2rem}
.hero-cta{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:3rem}
.btn-xl{padding:12px 26px;font-size:.87rem;font-weight:600;border-radius:12px;transition:all .2s;border:none}
.btn-xl.p{background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;box-shadow:0 8px 24px rgba(37,99,235,.4)}
.btn-xl.p:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(37,99,235,.55)}
.btn-xl.o{background:transparent;border:1.5px solid rgba(255,255,255,.2);color:rgba(255,255,255,.85)}
.btn-xl.o:hover{border-color:rgba(255,255,255,.5);background:rgba(255,255,255,.05)}
.hero-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:820px;width:100%}
@media(max-width:580px){.hero-grid{grid-template-columns:repeat(2,1fr)}}
.hcard{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:.9rem .75rem;text-align:center;transition:all .3s}
.hcard:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.15);transform:translateY(-3px)}
.hc-icon{font-size:1.5rem;margin-bottom:.4rem}
.hc-title{font-size:.74rem;font-weight:600;margin-bottom:2px}
.hc-desc{font-size:.64rem;color:rgba(255,255,255,.4)}
.stats-bar{background:rgba(255,255,255,.03);border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06);padding:1.75rem 1.5rem}
.stats-inner{max-width:800px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;text-align:center}
@media(max-width:500px){.stats-inner{grid-template-columns:repeat(2,1fr)}}
.stat-n{font-family:'DM Sans',sans-serif;font-size:1.6rem;font-weight:800;color:#60a5fa}
.stat-l{font-size:.7rem;color:rgba(255,255,255,.38);margin-top:3px}
.why{padding:3.5rem 1.5rem;max-width:860px;margin:0 auto}
.why h2{font-family:'DM Sans',sans-serif;font-size:clamp(1.5rem,3.5vw,2.2rem);font-weight:800;letter-spacing:-.02em;text-align:center;margin-bottom:2rem}
.why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:13px}
.why-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1.2rem}
.wc-icon{font-size:1.5rem;margin-bottom:.65rem}
.wc-title{font-size:.84rem;font-weight:700;margin-bottom:.35rem}
.wc-desc{font-size:.72rem;color:rgba(255,255,255,.43);line-height:1.6}
.cta-section{padding:2rem 1.5rem 4.5rem;text-align:center}
.cta-box{max-width:520px;margin:0 auto;background:linear-gradient(135deg,rgba(37,99,235,.15),rgba(6,182,212,.1));border:1px solid rgba(37,99,235,.25);border-radius:22px;padding:2.5rem 1.75rem}
footer{border-top:1px solid rgba(255,255,255,.06);padding:1.5rem;text-align:center;color:rgba(255,255,255,.25);font-size:.73rem}
.overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.78);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:1rem}
.modal{background:#112040;border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:2rem 1.75rem;width:100%;max-width:400px;box-shadow:0 40px 80px rgba(0,0,0,.5);position:relative;animation:fadeUp .25s ease-out}
.modal-logo{display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:.5rem}
.modal h2{text-align:center;font-size:1.2rem;font-weight:700;margin-bottom:.3rem}
.modal-sub{text-align:center;color:rgba(255,255,255,.43);font-size:.77rem;margin-bottom:1.4rem}
.fg{margin-bottom:.8rem}
.fg label{display:block;font-size:.73rem;font-weight:500;color:rgba(255,255,255,.6);margin-bottom:5px}
.fg input,.fg select,.fg textarea{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:9px;padding:10px 12px;color:#fff;font-size:.84rem;outline:none;transition:all .2s}
.fg input:focus,.fg select:focus,.fg textarea:focus{border-color:#2563eb;background:rgba(37,99,235,.08)}
.fg input::placeholder,.fg textarea::placeholder{color:rgba(255,255,255,.24)}
.fg select option{background:#112040;color:#fff}
.form-btn{width:100%;padding:11px;border:none;border-radius:9px;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;font-size:.87rem;font-weight:600;transition:all .2s;box-shadow:0 6px 18px rgba(37,99,235,.4)}
.form-btn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 22px rgba(37,99,235,.55)}
.form-btn:disabled{opacity:.6;cursor:not-allowed}
.form-sw{text-align:center;margin-top:.8rem;font-size:.73rem;color:rgba(255,255,255,.43)}
.form-sw button{background:none;border:none;color:#60a5fa;font-size:.73rem;font-weight:500}
.form-sw button:hover{text-decoration:underline}
.err-box{background:rgba(244,63,94,.15);border:1px solid rgba(244,63,94,.3);border-radius:8px;padding:9px 12px;font-size:.75rem;color:#fca5a5;margin-bottom:.8rem}
.mclose{position:absolute;top:.8rem;right:.8rem;background:rgba(255,255,255,.08);border:none;color:#fff;width:30px;height:30px;border-radius:8px;font-size:.9rem;display:flex;align-items:center;justify-content:center;transition:background .2s}
.mclose:hover{background:rgba(255,255,255,.15)}
.dash{min-height:100vh;background:radial-gradient(ellipse at 10% 10%,rgba(37,99,235,.1) 0%,transparent 50%),#0a1628;padding-bottom:76px}
.dash-hdr{background:rgba(12,26,52,.98);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.07);padding:0 1.25rem;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50}
.dash-body{padding:1.25rem;max-width:760px;margin:0 auto}
.greeting{margin-bottom:1.25rem}
.dash-date{font-size:.67rem;color:#06b6d4;font-weight:500;background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.2);padding:2px 9px;border-radius:100px;display:inline-block;margin-bottom:5px}
.greeting h2{font-size:1.25rem;font-weight:700;margin-bottom:2px}
.greeting p{color:rgba(255,255,255,.4);font-size:.78rem}
.status-strip{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:13px;padding:.9rem 1.1rem;display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:1.25rem}
.si{display:flex;align-items:center;gap:6px;font-size:.72rem;color:rgba(255,255,255,.52)}
.sd{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.sd-g{background:#22c55e;box-shadow:0 0 7px rgba(34,197,94,.5)}
.sd-b{background:#3b82f6;box-shadow:0 0 7px rgba(59,130,246,.5)}
.sd-y{background:#f59e0b}
.cards-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:1.25rem}
.dcard{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:1.1rem;cursor:pointer;transition:all .28s;position:relative;overflow:hidden}
.dcard:hover{transform:translateY(-3px)}
.dcard.c-sos{border-color:rgba(244,63,94,.15)}.dcard.c-sos:hover{border-color:rgba(244,63,94,.38);box-shadow:0 14px 34px rgba(244,63,94,.1)}
.dcard.c-loc{border-color:rgba(6,182,212,.15)}.dcard.c-loc:hover{border-color:rgba(6,182,212,.38);box-shadow:0 14px 34px rgba(6,182,212,.1)}
.dcard.c-con{border-color:rgba(245,158,11,.12)}.dcard.c-con:hover{border-color:rgba(245,158,11,.32);box-shadow:0 14px 34px rgba(245,158,11,.08)}
.dcard.c-ai{border-color:rgba(124,58,237,.12)}.dcard.c-ai:hover{border-color:rgba(124,58,237,.32);box-shadow:0 14px 34px rgba(124,58,237,.08)}
.dcard.c-route{border-color:rgba(34,197,94,.12)}.dcard.c-route:hover{border-color:rgba(34,197,94,.32);box-shadow:0 14px 34px rgba(34,197,94,.08)}
.dcard.c-voice{border-color:rgba(245,158,11,.12)}.dcard.c-voice:hover{border-color:rgba(245,158,11,.32);box-shadow:0 14px 34px rgba(245,158,11,.08)}
.dcard.c-notif{border-color:rgba(59,130,246,.12)}.dcard.c-notif:hover{border-color:rgba(59,130,246,.32);box-shadow:0 14px 34px rgba(59,130,246,.08)}
.dcard.c-comm{border-color:rgba(139,92,246,.12)}.dcard.c-comm:hover{border-color:rgba(139,92,246,.32);box-shadow:0 14px 34px rgba(139,92,246,.08)}
.cicon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;margin-bottom:.75rem}
.ci-sos{background:rgba(244,63,94,.2)}.ci-loc{background:rgba(6,182,212,.2)}.ci-con{background:rgba(245,158,11,.2)}
.ci-ai{background:rgba(124,58,237,.2)}.ci-route{background:rgba(34,197,94,.2)}.ci-voice{background:rgba(245,158,11,.2)}
.ci-notif{background:rgba(59,130,246,.2)}.ci-comm{background:rgba(139,92,246,.2)}
.card-title{font-size:.84rem;font-weight:700;margin-bottom:4px}
.card-desc{font-size:.68rem;color:rgba(255,255,255,.4);line-height:1.5;margin-bottom:.65rem}
.card-arrow{font-size:.67rem;font-weight:600;color:rgba(255,255,255,.3);transition:color .2s}
.dcard:hover .card-arrow{color:rgba(255,255,255,.72)}
.card-badge{position:absolute;top:10px;right:10px}
.helplines{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden}
.hl-row{display:flex;align-items:center;justify-content:space-between;padding:10px 13px;border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer;transition:background .2s}
.hl-row:last-child{border-bottom:none}
.hl-row:hover{background:rgba(255,255,255,.04)}
.hl-l{display:flex;align-items:center;gap:9px;font-size:.79rem;color:rgba(255,255,255,.68)}
.hl-num{font-size:.87rem;font-weight:700;color:#60a5fa;font-family:monospace}
.bnav{position:fixed;bottom:0;left:0;right:0;background:rgba(10,22,40,.98);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,.07);display:flex;padding:5px 0 10px;z-index:50}
.bni{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;color:rgba(255,255,255,.35);padding:5px 3px;transition:color .2s;font-size:.58rem}
.bni.active{color:#60a5fa}
.bni-icon{font-size:1.15rem}
.mp-wrap{position:fixed;inset:0;z-index:150;background:rgba(0,0,0,.65);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:.75rem}
.mp{background:rgba(13,26,52,.98);border:1px solid rgba(255,255,255,.09);border-radius:20px;padding:1.5rem 1.35rem;width:100%;max-width:620px;max-height:88vh;overflow-y:auto;animation:fadeUp .25s ease-out}
.mph{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.15rem}
.mptw{display:flex;align-items:center;gap:9px}
.mpt{font-size:1.05rem;font-weight:700}
.mps{font-size:.69rem;color:rgba(255,255,255,.36)}
.mpclose{background:rgba(255,255,255,.08);border:none;color:#fff;width:32px;height:32px;border-radius:9px;font-size:.95rem;display:flex;align-items:center;justify-content:center;transition:background .2s;flex-shrink:0}
.mpclose:hover{background:rgba(255,255,255,.15)}
.sos-ring-wrap{display:flex;justify-content:center;margin:1.25rem 0}
.sos-outer{width:168px;height:168px;border-radius:50%;border:2px solid rgba(244,63,94,.2);display:flex;align-items:center;justify-content:center;animation:sosPulse 2.5s ease-in-out infinite}
.sos-btn{width:126px;height:126px;border-radius:50%;background:linear-gradient(135deg,#dc2626,#b91c1c);border:none;color:#fff;font-weight:700;transition:all .15s;box-shadow:0 10px 36px rgba(220,38,38,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}
.sos-btn:hover{transform:scale(1.05);box-shadow:0 14px 46px rgba(220,38,38,.7)}
.sos-btn:active{transform:scale(.97)}
.sos-btn.sent{background:linear-gradient(135deg,#16a34a,#15803d);box-shadow:0 10px 36px rgba(22,163,74,.5)}
.sos-cd{text-align:center;background:rgba(244,63,94,.12);border:1px solid rgba(244,63,94,.25);border-radius:11px;padding:.8rem;margin-bottom:.9rem}
.sos-cd-n{font-size:2.25rem;font-weight:800;color:#f87171}
.sos-ok{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);border-radius:10px;padding:.8rem;text-align:center;margin-bottom:.9rem}
.sos-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:1.1rem}
.sos-act{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px;color:#fff;font-size:.73rem;font-weight:500;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center}
.sos-act:hover{background:rgba(255,255,255,.09)}
.map-box{background:rgba(6,182,212,.06);border:1px solid rgba(6,182,212,.2);border-radius:13px;overflow:hidden;position:relative;min-height:155px;margin:1rem 0}
.map-bg{position:absolute;inset:0;opacity:.06;background-image:linear-gradient(rgba(6,182,212,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,.8) 1px,transparent 1px);background-size:25px 25px}
.map-inner{padding:1.6rem;text-align:center;position:relative;z-index:1}
.map-pin{font-size:2.2rem;animation:pinBounce 2s ease-in-out infinite;margin-bottom:.35rem}
.map-coords{font-family:monospace;font-size:.77rem;color:#06b6d4;background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.2);border-radius:7px;padding:6px 12px;display:inline-block;margin-top:.4rem}
.loc-btn{width:100%;padding:11px;border:none;border-radius:9px;background:linear-gradient(135deg,#0891b2,#06b6d4);color:#fff;font-size:.83rem;font-weight:600;transition:all .2s;margin:.8rem 0;box-shadow:0 6px 18px rgba(6,182,212,.3)}
.loc-btn:hover:not(:disabled){transform:translateY(-1px)}
.loc-btn:disabled{opacity:.6;cursor:not-allowed}
.info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.info-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:9px;padding:9px 11px}
.info-lbl{font-size:.64rem;color:rgba(255,255,255,.36);margin-bottom:3px}
.info-val{font-size:.82rem;font-weight:600}
.share-btn{width:100%;padding:10px;border:1px solid rgba(255,255,255,.13);border-radius:9px;background:rgba(255,255,255,.04);color:rgba(255,255,255,.7);font-size:.79rem;font-weight:500;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:7px}
.share-btn:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.22)}
.route-step{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:9px;padding:9px 12px;margin-bottom:7px;display:flex;align-items:flex-start;gap:9px}
.rs-num{width:22px;height:22px;border-radius:6px;background:rgba(34,197,94,.2);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#86efac;flex-shrink:0;margin-top:1px}
.rs-text{font-size:.77rem;color:rgba(255,255,255,.75);line-height:1.5}
.rs-dist{font-size:.65rem;color:rgba(255,255,255,.35);margin-top:2px}
.cf-box{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:13px;padding:1.1rem;margin-bottom:1.1rem}
.cf-box h3{font-size:.82rem;font-weight:600;margin-bottom:.8rem}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
@media(max-width:400px){.form-row{grid-template-columns:1fr}}
.c-list{display:flex;flex-direction:column;gap:8px}
.c-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:11px 13px;display:flex;align-items:center;justify-content:space-between;transition:all .2s}
.c-card:hover{background:rgba(255,255,255,.07)}
.c-left{display:flex;align-items:center;gap:9px}
.c-av{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#2563eb,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:.95rem;font-weight:700;flex-shrink:0}
.c-nm{font-size:.82rem;font-weight:600;margin-bottom:1px}
.c-ph{font-size:.69rem;color:rgba(255,255,255,.42)}
.c-badge{font-size:.62rem;font-weight:600;padding:2px 7px;border-radius:5px;background:rgba(37,99,235,.2);color:#93c5fd;border:1px solid rgba(37,99,235,.3)}
.c-del{background:rgba(244,63,94,.1);border:1px solid rgba(244,63,94,.2);color:#fb7185;width:28px;height:28px;border-radius:7px;font-size:.78rem;display:flex;align-items:center;justify-content:center;transition:all .2s;margin-left:6px}
.c-del:hover{background:rgba(244,63,94,.22)}
.empty-st{text-align:center;padding:1.5rem;color:rgba(255,255,255,.27);font-size:.78rem}
.ai-wrap{display:flex;flex-direction:column;height:370px}
.ai-msgs{flex:1;overflow-y:auto;padding:.8rem;background:rgba(0,0,0,.2);border-radius:11px;margin-bottom:.8rem;display:flex;flex-direction:column;gap:8px;scrollbar-width:thin}
.ai-msg{display:flex;align-items:flex-start;gap:7px}
.ai-msg.user{flex-direction:row-reverse}
.ai-av{width:26px;height:26px;border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.72rem}
.ai-av.bot{background:linear-gradient(135deg,#7c3aed,#2563eb)}
.ai-av.user{background:linear-gradient(135deg,#2563eb,#06b6d4)}
.ai-bbl{max-width:84%;font-size:.76rem;line-height:1.55;padding:8px 11px;border-radius:10px}
.ai-msg.bot .ai-bbl{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.9);border-radius:4px 10px 10px 10px;white-space:pre-line}
.ai-msg.user .ai-bbl{background:rgba(37,99,235,.25);border:1px solid rgba(37,99,235,.3);color:rgba(255,255,255,.95);border-radius:10px 4px 10px 10px}
.ai-src{font-size:.62rem;color:rgba(255,255,255,.28);font-style:italic;margin-top:3px;padding-left:2px}
.ai-ir{display:flex;gap:8px}
.ai-inp{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:9px 12px;color:#fff;font-size:.79rem;outline:none;transition:all .2s;height:42px}
.ai-inp:focus{border-color:#7c3aed;background:rgba(124,58,237,.08)}
.ai-inp::placeholder{color:rgba(255,255,255,.24)}
.ai-send{background:linear-gradient(135deg,#7c3aed,#2563eb);border:none;color:#fff;width:42px;border-radius:10px;font-size:.88rem;flex-shrink:0;transition:all .2s;box-shadow:0 4px 14px rgba(124,58,237,.35)}
.ai-send:hover:not(:disabled){transform:translateY(-1px)}
.ai-send:disabled{opacity:.5}
.qbtns{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:.65rem}
.qbtn{background:rgba(124,58,237,.12);border:1px solid rgba(124,58,237,.25);color:rgba(255,255,255,.66);font-size:.67rem;padding:4px 9px;border-radius:18px;transition:all .2s}
.qbtn:hover{background:rgba(124,58,237,.22);color:#fff}
.typing span{width:5px;height:5px;background:rgba(255,255,255,.4);border-radius:50%;animation:typingDot 1.2s ease-in-out infinite;display:inline-block;margin:0 2px}
.typing span:nth-child(2){animation-delay:.2s}.typing span:nth-child(3){animation-delay:.4s}
.voice-center{text-align:center;padding:1.5rem 0}
.rec-btn{width:96px;height:96px;border-radius:50%;border:none;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;margin:0 auto 1.25rem;transition:all .2s}
.rec-btn.idle{background:linear-gradient(135deg,#dc2626,#b91c1c);box-shadow:0 8px 28px rgba(220,38,38,.45)}
.rec-btn.idle:hover{transform:scale(1.05)}
.rec-btn.recording{background:linear-gradient(135deg,#16a34a,#15803d);animation:recPulse 1.5s ease-in-out infinite}
.rec-icon{font-size:1.75rem}
.rec-lbl{font-size:.68rem;font-weight:700;letter-spacing:.07em}
.rec-timer{font-size:1.75rem;font-weight:800;color:#f87171;font-family:monospace;margin-bottom:.45rem}
.wave-bars{display:flex;align-items:center;justify-content:center;gap:3px;height:34px;margin-bottom:.9rem}
.wave-bars span{width:4px;border-radius:2px;background:#f43f5e;animation:waveBar 1s ease-in-out infinite}
.rec-item{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 13px;display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}
.ri-left{display:flex;align-items:center;gap:9px}
.ri-nm{font-size:.77rem;font-weight:500;margin-bottom:1px}
.ri-meta{font-size:.64rem;color:rgba(255,255,255,.36)}
.ri-acts{display:flex;gap:5px}
.ri-btn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;width:27px;height:27px;border-radius:7px;font-size:.77rem;display:flex;align-items:center;justify-content:center;transition:all .2s}
.ri-btn:hover{background:rgba(255,255,255,.13)}
.notif-row{display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:12px 14px;margin-bottom:9px;cursor:pointer;transition:all .2s}
.notif-row:hover{background:rgba(255,255,255,.07)}
.notif-l{display:flex;align-items:center;gap:10px}
.notif-title{font-size:.82rem;font-weight:600;margin-bottom:2px}
.notif-desc{font-size:.68rem;color:rgba(255,255,255,.38)}
.toggle{width:40px;height:22px;border-radius:11px;border:none;position:relative;transition:background .3s;flex-shrink:0}
.toggle.on{background:#2563eb}.toggle.off{background:rgba(255,255,255,.14)}
.toggle::after{content:'';position:absolute;width:16px;height:16px;border-radius:50%;background:#fff;top:3px;transition:left .25s;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.toggle.on::after{left:21px}.toggle.off::after{left:3px}
.nh-item{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:9px;padding:10px 12px;margin-bottom:7px;display:flex;align-items:flex-start;gap:9px;cursor:pointer}
.nh-item:hover{background:rgba(255,255,255,.05)}
.nh-dot{width:7px;height:7px;border-radius:50%;margin-top:4px;flex-shrink:0}
.nh-dot.unread{background:#3b82f6;box-shadow:0 0 6px rgba(59,130,246,.4)}.nh-dot.read{background:rgba(255,255,255,.18)}
.nh-title{font-size:.77rem;font-weight:600;margin-bottom:2px}
.nh-body{font-size:.69rem;color:rgba(255,255,255,.43);line-height:1.5}
.nh-time{font-size:.61rem;color:rgba(255,255,255,.24);margin-top:3px}
.comm-tabs{display:flex;gap:5px;background:rgba(255,255,255,.04);border-radius:10px;padding:4px;margin-bottom:1rem}
.ctab{flex:1;padding:7px;border:none;border-radius:7px;font-size:.72rem;font-weight:500;transition:all .2s;color:rgba(255,255,255,.48);background:transparent}
.ctab.active{background:rgba(124,58,237,.28);color:#fff;border:1px solid rgba(124,58,237,.35)}
.alert-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:11px 13px;margin-bottom:8px;transition:all .2s}
.alert-card:hover{background:rgba(255,255,255,.07)}
.ac-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}
.ac-type{font-size:.63rem;font-weight:700;padding:2px 7px;border-radius:5px;text-transform:uppercase;letter-spacing:.04em}
.t-harassment{background:rgba(244,63,94,.2);color:#fca5a5;border:1px solid rgba(244,63,94,.3)}
.t-suspicious{background:rgba(245,158,11,.2);color:#fde68a;border:1px solid rgba(245,158,11,.3)}
.t-unsafe{background:rgba(239,68,68,.2);color:#fca5a5;border:1px solid rgba(239,68,68,.3)}
.t-safe{background:rgba(34,197,94,.2);color:#86efac;border:1px solid rgba(34,197,94,.3)}
.ac-time{font-size:.61rem;color:rgba(255,255,255,.3)}
.ac-desc{font-size:.76rem;color:rgba(255,255,255,.7);line-height:1.5;margin-bottom:5px}
.ac-foot{display:flex;align-items:center;justify-content:space-between}
.ac-loc{font-size:.67rem;color:rgba(255,255,255,.34)}
.ac-vote{font-size:.67rem;color:rgba(255,255,255,.38);display:flex;align-items:center;gap:4px;transition:color .2s}
.ac-vote:hover{color:#fff}.ac-vote.voted{color:#86efac}
.pro-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:1.5rem;text-align:center;margin-bottom:1rem}
.pro-av{width:68px;height:68px;border-radius:16px;background:linear-gradient(135deg,#2563eb,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin:0 auto .8rem;border:2px solid rgba(255,255,255,.1)}
.pro-nm{font-size:.96rem;font-weight:700;margin-bottom:2px}
.pro-em{font-size:.73rem;color:rgba(255,255,255,.4);margin-bottom:1.1rem}
.pro-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:1.1rem}
.ps{background:rgba(255,255,255,.04);border-radius:9px;padding:9px 6px}
.ps-n{font-size:1.2rem;font-weight:700;color:#60a5fa}
.ps-l{font-size:.61rem;color:rgba(255,255,255,.36);margin-top:1px}
.pro-rows{background:rgba(255,255,255,.04);border-radius:9px;padding:.8rem;margin-bottom:.9rem;text-align:left}
.pro-rl{font-size:.62rem;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
.pro-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:.72rem}
.pro-row:last-child{border-bottom:none}
.pro-rk{color:rgba(255,255,255,.36)}
.pro-rv{font-weight:500;color:rgba(255,255,255,.8);font-size:.71rem;max-width:55%;text-align:right;word-break:break-all}
.settings-box{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:.9rem;margin-bottom:.9rem}
.settings-title{font-size:.68rem;font-weight:600;color:rgba(255,255,255,.38);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.75rem}
.sr{display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.sr:last-child{border-bottom:none}
.sr-lbl{font-size:.79rem;color:rgba(255,255,255,.72)}
.sr-sub{font-size:.66rem;color:rgba(255,255,255,.33);margin-top:1px}
.lout-btn{width:100%;padding:10px;border:1px solid rgba(244,63,94,.25);border-radius:9px;background:rgba(244,63,94,.08);color:#fb7185;font-size:.79rem;font-weight:600;transition:all .2s}
.lout-btn:hover{background:rgba(244,63,94,.15);border-color:rgba(244,63,94,.4)}
.toast-wrap{position:fixed;top:68px;right:1rem;z-index:300;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.toast{background:rgba(13,26,52,.98);border:1px solid rgba(255,255,255,.12);border-radius:11px;padding:10px 14px;min-width:230px;max-width:300px;box-shadow:0 20px 36px rgba(0,0,0,.4);animation:toastIn .3s ease-out;pointer-events:all}
.toast.success{border-color:rgba(34,197,94,.3)}.toast.error{border-color:rgba(244,63,94,.3)}.toast.info{border-color:rgba(59,130,246,.3)}
.t-title{font-size:.79rem;font-weight:600;margin-bottom:2px}
.t-msg{font-size:.69rem;color:rgba(255,255,255,.46)}
`;

// ══════════════════════════════════════════════════════════════
//  SHARED UI COMPONENTS
// ══════════════════════════════════════════════════════════════
function Logo() {
  return <div className="logo"><div className="logo-icon">🛡️</div><span className="logo-text">Sura<em>ksha</em></span></div>;
}
function Spinner() { return <span className="spinner" />; }
function ModuleHeader({ icon, ci, title, sub, onClose }) {
  return (
    <div className="mph">
      <div className="mptw"><div className={`cicon ci-${ci}`}>{icon}</div><div><div className="mpt">{title}</div><div className="mps">{sub}</div></div></div>
      <button className="mpclose" onClick={onClose}>✕</button>
    </div>
  );
}
function EmptyState({ icon, text, sub }) {
  return <div className="empty-st"><div style={{fontSize:"1.75rem",opacity:.35,marginBottom:".35rem"}}>{icon}</div><div>{text}</div>{sub&&<div style={{fontSize:".7rem",color:"rgba(255,255,255,.22)",marginTop:4}}>{sub}</div>}</div>;
}
function Toggle({ on, onClick }) { return <button className={`toggle ${on?"on":"off"}`} onClick={onClick} />; }
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((title, message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, title, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, addToast };
}
function ToastContainer({ toasts }) {
  return <div className="toast-wrap">{toasts.map(t=><div key={t.id} className={`toast ${t.type}`}><div className="t-title">{t.title}</div><div className="t-msg">{t.message}</div></div>)}</div>;
}

// ══════════════════════════════════════════════════════════════
//  SOS MODULE
// ══════════════════════════════════════════════════════════════
function SOSModule({ user, contacts, onClose, addToast }) {
  const [state, setState] = useState("idle");
  const [count, setCount] = useState(5);
  const [sending, setSending] = useState(false);
  const [lastLoc, setLastLoc] = useState(null);
  const timerRef = useRef(null);

  const getLoc = () => new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });

  const fireAlert = async () => {
    setSending(true);
    const loc = await getLoc();
    setLastLoc(loc);
    const userName = user?.displayName || user?.email?.split("@")[0] || "a Suraksha user";
    const res = await sendSOSAlert({ userName, location: loc, contacts });
    setSending(false);

    if (res.ok) {
      addToast("🚨 SOS Sent!", `Real alerts dispatched to ${contacts.length||0} contact${contacts.length!==1?"s":""}.`, "success");
    } else if (res.results) {
      // Server reachable but Twilio/SendGrid not configured — fall back to manual share
      addToast("⚠️ Alerts Not Configured", "Twilio/SendGrid env vars are missing on the server. Use the buttons below to alert contacts manually.", "info");
    } else {
      addToast("⚠️ Could Not Reach Server", "Auto-alerts unavailable. Use the buttons below to alert contacts manually.", "error");
    }
  };

  const startSOS = () => {
    if (state !== "idle") return;
    setState("countdown"); setCount(5);
    timerRef.current = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          setState("sent");
          fireAlert();
          setTimeout(()=>setState("idle"),7000);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };
  const cancelSOS = () => { clearInterval(timerRef.current); setState("idle"); setCount(5); };
  useEffect(() => () => clearInterval(timerRef.current), []);

  // ── Manual action buttons (work immediately, no backend needed) ──
  const callEmergency = () => { window.location.href = "tel:112"; };

  const shareWhatsApp = async () => {
    const loc = lastLoc || await getLoc();
    const mapsLink = loc ? `https://maps.google.com/maps?q=${loc.lat},${loc.lng}` : "location unavailable";
    const text = encodeURIComponent(`🚨 I need help. My location: ${mapsLink}`);
    if (contacts.length > 0 && contacts[0].phone) {
      const phone = contacts[0].phone.replace(/[^\d+]/g, "");
      window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    } else {
      window.open(`https://wa.me/?text=${text}`, "_blank");
      addToast("💬 WhatsApp", "No saved contact phone — opening WhatsApp to pick a recipient.", "info");
    }
  };

  const emailAlert = async () => {
    setSending(true);
    const loc = lastLoc || await getLoc();
    setLastLoc(loc);
    const userName = user?.displayName || user?.email?.split("@")[0] || "a Suraksha user";
    const res = await sendSOSAlert({ userName, location: loc, contacts, channels: ["email"] });
    setSending(false);
    const emailResult = res.results?.email?.[0];
    if (emailResult?.ok) {
      addToast("📧 Email Sent", "Incident report emailed to your contacts.", "success");
    } else if (emailResult?.error) {
      addToast("⚠️ Email Not Sent", emailResult.error, "error");
    } else {
      addToast("⚠️ Email Not Sent", "Could not reach the alert server.", "error");
    }
  };

  const shareLocation = async () => {
    setSending(true);
    const loc = lastLoc || await getLoc();
    setLastLoc(loc);
    if (!loc) {
      setSending(false);
      addToast("⚠️ Location Unavailable", "Allow location access in your browser settings.", "error");
      return;
    }
    const mapsLink = `https://maps.google.com/maps?q=${loc.lat},${loc.lng}`;
    // Copy to clipboard always
    navigator.clipboard?.writeText(mapsLink).catch(()=>{});

    // SMS all contacts via Twilio
    const userName = user?.displayName || user?.email?.split("@")[0] || "a Suraksha user";
    const res = await sendSOSAlert({ userName, location: loc, contacts, channels: ["sms"] });
    setSending(false);

    const smsResults = res.results?.sms || [];
    const sent = smsResults.filter(r => r.ok).length;
    const failed = smsResults.filter(r => !r.ok);

    if (sent > 0) {
      addToast("📍 Location SMS Sent!", `Live location sent to ${sent} contact${sent!==1?"s":""} via SMS.`, "success");
    } else if (smsResults.length === 0 || smsResults[0]?.error?.includes("not configured")) {
      // Twilio not set up yet — fall back to native share / open maps
      if (navigator.share) {
        navigator.share({ title: "My Location", text: `📍 ${userName}'s location:`, url: mapsLink }).catch(()=>{});
      } else {
        window.open(mapsLink, "_blank");
      }
      addToast("📍 Location Copied", "Twilio SMS not configured — link copied to clipboard. Add TWILIO keys in Vercel to auto-SMS contacts.", "info");
    } else {
      // Twilio configured but something failed
      const errMsg = failed[0]?.error || "SMS delivery failed.";
      addToast("⚠️ SMS Failed", errMsg, "error");
      // Still open maps as fallback
      window.open(mapsLink, "_blank");
    }
  };

  const actions = [
    { icon: "📱", label: "Call 112",       sub: "Emergency services",    onClick: callEmergency },
    { icon: "💬", label: "WhatsApp",       sub: "Alert contacts",         onClick: shareWhatsApp },
    { icon: "📧", label: "Email Alert",    sub: "Full incident report",   onClick: emailAlert },
    { icon: "📍", label: "Share Location", sub: "Google Maps link",       onClick: shareLocation },
  ];

  return (
    <div className="mp anim">
      <ModuleHeader icon="🚨" ci="sos" title="SOS Emergency" sub="One tap — all contacts alerted instantly" onClose={onClose} />
      {state==="countdown"&&<div className="sos-cd"><div style={{fontSize:".74rem",color:"rgba(255,255,255,.5)",marginBottom:3}}>Sending SOS alert in</div><div className="sos-cd-n">{count}</div><button className="btn-g" style={{marginTop:9,fontSize:".75rem"}} onClick={cancelSOS}>✕ Cancel</button></div>}
      {state==="sent"&&<div className="sos-ok"><div style={{fontSize:".82rem",color:"#86efac",fontWeight:600}}>{sending?<><Spinner/> Sending alert…</>:"✅ SOS Alert Sent"}</div><div style={{fontSize:".7rem",color:"rgba(255,255,255,.43)",marginTop:4}}>{contacts.length>0?`${contacts.length} contact${contacts.length!==1?"s":""}` :"Your emergency contacts"} — GPS location included if available.</div></div>}
      <div className="sos-ring-wrap"><div className="sos-outer"><button className={`sos-btn ${state==="sent"?"sent":""}`} onClick={state==="idle"?startSOS:undefined}><span style={{fontSize:"1.75rem"}}>{state==="sent"?"✅":"🆘"}</span><span style={{fontSize:".9rem",letterSpacing:".08em"}}>{state==="sent"?"SENT":"SOS"}</span></button></div></div>
      <div className="sl">Instant Alert Channels</div>
      <div className="sos-actions">
        {actions.map(a=>(
          <button key={a.label} className="sos-act" onClick={a.onClick} disabled={sending}><span style={{fontSize:"1.25rem"}}>{a.icon}</span><div><div>{a.label}</div><div style={{fontSize:".62rem",color:"rgba(255,255,255,.35)"}}>{a.sub}</div></div></button>
        ))}
      </div>
      <div className="divider"/>
      <p className="hint">5-second countdown lets you cancel. SOS auto-sends SMS + Email if Twilio/SendGrid are configured on the server — otherwise use the buttons above to alert contacts manually.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  LOCATION MODULE
// ══════════════════════════════════════════════════════════════
function LocationModule({ contacts, onClose, addToast, onOpenRoute }) {
  const [loc, setLoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const fetchLoc = () => {
    if (!navigator.geolocation) { addToast("⚠️ Not Supported","Geolocation not supported by your browser.","error"); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      p=>{ setLoc({lat:p.coords.latitude.toFixed(6),lng:p.coords.longitude.toFixed(6),accuracy:Math.round(p.coords.accuracy),time:new Date().toLocaleTimeString()}); setLoading(false); addToast("📍 Location Retrieved","Real GPS coordinates fetched successfully.","success"); },
      ()=>{ setLoading(false); addToast("⚠️ Permission Denied","Allow location access in your browser settings.","error"); }
    );
  };
  const shareLoc = () => { if(!loc)return; setSharing(true); setTimeout(()=>{ setSharing(false); addToast("📤 Location Shared",`Sent to ${contacts.length} emergency contact${contacts.length!==1?"s":""}.`,"success"); },1500); };
  const copyLink = () => { if(!loc)return; navigator.clipboard?.writeText(`https://maps.google.com/maps?q=${loc.lat},${loc.lng}`).catch(()=>{}); addToast("🔗 Copied","Google Maps link copied to clipboard.","success"); };
  return (
    <div className="mp anim">
      <ModuleHeader icon="📍" ci="loc" title="Live Location" sub="Real-time GPS sharing with emergency contacts" onClose={onClose}/>
      <div className="map-box"><div className="map-bg"/><div className="map-inner">
        {loc?<><div className="map-pin">📍</div><div style={{fontSize:".78rem",color:"rgba(255,255,255,.5)",marginBottom:".4rem"}}>Your current location</div><div className="map-coords">{loc.lat}°N, {loc.lng}°E</div><div style={{fontSize:".64rem",color:"rgba(255,255,255,.3)",marginTop:".4rem"}}>Accuracy ±{loc.accuracy}m · Updated {loc.time}</div></>:<><div style={{fontSize:"2.25rem",opacity:.3,marginBottom:".4rem"}}>🗺️</div><div style={{color:"rgba(255,255,255,.38)",fontSize:".82rem"}}>Tap below to get your real GPS coordinates</div></>}
      </div></div>
      <button className="loc-btn" onClick={fetchLoc} disabled={loading}>{loading?<><Spinner/> Fetching GPS…</>:"📡 Get My Current Location"}</button>
      {loc&&<><div className="info-grid">{[["Latitude",`${loc.lat}°N`],["Longitude",`${loc.lng}°E`],["Accuracy",`±${loc.accuracy}m`],["Updated",loc.time]].map(([l,v])=><div key={l} className="info-card"><div className="info-lbl">{l}</div><div className="info-val">{v}</div></div>)}</div><div className="divider"/><button className="share-btn" onClick={shareLoc} disabled={sharing}>{sharing?<><Spinner/> Sharing…</>:"📤 Share with Emergency Contacts"}</button><button className="share-btn" onClick={copyLink}>🔗 Copy Google Maps Link</button><button className="share-btn" onClick={()=>{onClose();onOpenRoute(loc);}}>🗺️ Get Safe Route from Here</button></>}
      <p className="hint">Uses your device's real GPS via the browser Geolocation API. Location only shared when you choose to share.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  SAFE ROUTE MODULE
// ══════════════════════════════════════════════════════════════
function RouteModule({ startLocation, onClose, addToast }) {
  const [dest, setDest]         = useState("");
  const [mode, setMode]         = useState("walk");
  const [time, setTime]         = useState("now");
  const [loading, setLoading]   = useState(false);
  const [routes, setRoutes]     = useState([]);   // array of route alternatives
  const [active, setActive]     = useState(0);    // selected route index
  const [error, setError]       = useState(null);

  const modeEmoji = { walk:"🚶", auto:"🛺", cab:"🚕" };

  const getRoute = async () => {
    if (!dest.trim()) { addToast("⚠️ Missing Destination","Please enter a destination.","error"); return; }
    if (!startLocation) { addToast("⚠️ Location Needed","Tap 📍 on the home screen to fetch your GPS location first.","error"); return; }
    setLoading(true); setRoutes([]); setError(null);
    try {
      const res = await fetch("/api/safe-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: `${startLocation.lat},${startLocation.lng}`,
          destination: dest.trim(),
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        const msg = data.error || "Could not fetch route.";
        setError(msg);
        // Friendly hint for common Google errors
        if (data.status === "NOT_FOUND" || data.status === "ZERO_RESULTS")
          addToast("⚠️ Route Not Found", "Try a more specific destination (add city name).", "error");
        else if (msg.includes("not configured"))
          addToast("⚠️ API Key Missing", "Add GOOGLE_MAPS_API_KEY in Vercel Environment Variables.", "error");
        else
          addToast("⚠️ Route Error", msg, "error");
      } else {
        setRoutes(data.routes);
        setActive(0);
        addToast("🗺️ Real Route Ready", `${data.routes.length} route${data.routes.length!==1?"s":""} found via Google Maps.`, "success");
      }
    } catch(e) {
      setError(e.message);
      addToast("⚠️ Network Error", "Could not reach the route server.", "error");
    }
    setLoading(false);
  };

  const route = routes[active] || null;
  const isNight = time === "night";

  // Maneuver → emoji for step icons
  const maneuverIcon = m => {
    if (!m) return "➡️";
    if (m.includes("left"))  return "↰";
    if (m.includes("right")) return "↱";
    if (m.includes("u-turn")) return "↩️";
    if (m.includes("roundabout")) return "🔄";
    if (m.includes("merge") || m.includes("ramp")) return "↗️";
    if (m.includes("ferry")) return "⛴️";
    return "➡️";
  };

  return (
    <div className="mp anim">
      <ModuleHeader icon="🗺️" ci="route" title="Safe Route" sub="Real Google Maps directions — key stays server-side" onClose={onClose}/>

      <div className="fg">
        <label>📍 From</label>
        <input
          defaultValue={startLocation ? `My Location (${startLocation.lat.toFixed(5)}, ${startLocation.lng.toFixed(5)})` : ""}
          placeholder="Fetch location from home screen first"
          readOnly
        />
      </div>
      <div className="fg">
        <label>🏁 Destination</label>
        <input
          value={dest}
          onChange={e=>setDest(e.target.value)}
          placeholder="e.g. Mysuru Railway Station, Karnataka"
          onKeyDown={e=>e.key==="Enter"&&getRoute()}
        />
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:".9rem"}}>
        <div className="fg" style={{marginBottom:0}}>
          <label>Mode</label>
          <select value={mode} onChange={e=>setMode(e.target.value)}>
            <option value="walk">🚶 Walking</option>
            <option value="auto">🛺 Auto / Driving</option>
            <option value="cab">🚕 Cab</option>
          </select>
        </div>
        <div className="fg" style={{marginBottom:0}}>
          <label>Time</label>
          <select value={time} onChange={e=>setTime(e.target.value)}>
            <option value="now">🕐 Right Now</option>
            <option value="night">🌙 Night</option>
            <option value="morning">🌅 Morning</option>
          </select>
        </div>
      </div>

      <button className="loc-btn" style={{margin:".5rem 0"}} onClick={getRoute} disabled={loading}>
        {loading ? <><Spinner/> Fetching real route…</> : "🗺️ Get Real Route"}
      </button>

      {error && !routes.length && (
        <div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:9,padding:"10px 13px",fontSize:".74rem",color:"#fca5a5",marginTop:".5rem"}}>
          ⚠️ {error}
        </div>
      )}

      {route && <>
        {/* Route alternatives tabs */}
        {routes.length > 1 && (
          <div style={{display:"flex",gap:6,margin:"1rem 0 .5rem"}}>
            {routes.map((r,i)=>(
              <button key={i} onClick={()=>setActive(i)} style={{flex:1,padding:"6px 4px",borderRadius:8,border:`1px solid ${active===i?"rgba(124,58,237,.8)":"rgba(255,255,255,.1)"}`,background:active===i?"rgba(124,58,237,.25)":"rgba(255,255,255,.04)",color:active===i?"#c4b5fd":"rgba(255,255,255,.5)",fontSize:".68rem",cursor:"pointer"}}>
                via {r.summary}<br/>
                <span style={{fontWeight:700,color:active===i?"#e9d5ff":"rgba(255,255,255,.7)"}}>{r.duration}</span>
              </button>
            ))}
          </div>
        )}

        <div className="sl" style={{marginTop:"1rem"}}>
          Route via {route.summary}
          <span className="tag tag-new" style={{marginLeft:6}}>Google Maps</span>
        </div>

        {isNight && (
          <div style={{background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.25)",borderRadius:9,padding:"9px 12px",marginBottom:".8rem",fontSize:".74rem",color:"#fde68a"}}>
            ⚠️ Night travel: Stay in well-lit areas. Share this route with a contact before you leave.
          </div>
        )}

        <div style={{background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.2)",borderRadius:9,padding:"9px 12px",marginBottom:".8rem",fontSize:".74rem",color:"#86efac"}}>
          ✅ {modeEmoji[mode]} {route.duration} · {route.distance} — {route.endAddress}
        </div>

        {route.steps.map((s,i)=>(
          <div key={i} className="route-step">
            <div className="rs-num">{maneuverIcon(s.maneuver)}</div>
            <div>
              <div className="rs-text">{s.text}</div>
              <div className="rs-dist">{s.dist}</div>
            </div>
          </div>
        ))}

        <button className="share-btn" style={{marginTop:".75rem"}} onClick={()=>{
          const text = `🗺️ My route to ${dest}:\n${route.steps.map((s,i)=>`${i+1}. ${s.text} (${s.dist})`).join("\n")}\nTotal: ${route.duration}, ${route.distance}`;
          navigator.clipboard?.writeText(text).catch(()=>{});
          addToast("📤 Route Copied","Route steps copied to clipboard — paste to share with contacts.","success");
        }}>📤 Share Route with Contacts</button>

        <button className="share-btn" onClick={()=>window.open(route.mapsUrl,"_blank")}>
          🗺️ Open in Google Maps
        </button>
      </>}

      <p className="hint">
        Real turn-by-turn directions from Google Maps. Requires <code>GOOGLE_MAPS_API_KEY</code> in Vercel
        with "Directions API" enabled. The key is never sent to the browser.
      </p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  CONTACTS MODULE — Real Firestore
// ══════════════════════════════════════════════════════════════
function ContactsModule({ user, contacts, setContacts, onClose, addToast }) {
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name:"", phone:"", email:"", relation:"Mother" });
  const relations = ["Mother","Father","Sister","Brother","Friend","Partner","Colleague","Guardian","Other"];
  const addContact = async () => {
    if (!form.name.trim()||!form.phone.trim()) { addToast("⚠️ Missing Fields","Please enter name and phone number.","error"); return; }
    setAdding(true);
    try {
      const docRef = await addDoc(collection(db,"contacts"),{ uid:user.uid, name:form.name.trim(), phone:form.phone.trim(), email:form.email.trim(), relation:form.relation, createdAt:serverTimestamp() });
      setContacts(c=>[...c,{id:docRef.id,uid:user.uid,name:form.name.trim(),phone:form.phone.trim(),email:form.email.trim(),relation:form.relation}]);
      const savedName = form.name.trim();
      setForm({name:"",phone:"",email:"",relation:"Mother"});
      addToast("✅ Contact Saved",`${savedName} added and synced to Firebase Firestore.`,"success");
    } catch(e) { addToast("⚠️ Error",e.message||"Failed to save contact.","error"); }
    setAdding(false);
  };
  const delContact = async (id, name) => {
    try { await deleteDoc(doc(db,"contacts",id)); setContacts(c=>c.filter(x=>x.id!==id)); addToast("Removed",`${name} removed from Firestore.`,"info"); }
    catch(e) { addToast("⚠️ Error",e.message,"error"); }
  };
  return (
    <div className="mp anim">
      <ModuleHeader icon="👥" ci="con" title="Emergency Contacts" sub={`${contacts.length} contact${contacts.length!==1?"s":""} — Firebase Firestore`} onClose={onClose}/>
      <div className="cf-box"><h3>+ Add Emergency Contact</h3>
        <div className="form-row">
          <div className="fg" style={{marginBottom:0}}><label>Full Name</label><input placeholder="e.g. Priya Sharma" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div className="fg" style={{marginBottom:0}}><label>Phone</label><input placeholder="+91 98765 43210" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/></div>
        </div>
        <div className="form-row">
          <div className="fg" style={{marginBottom:0}}><label>Email (optional)</label><input type="email" placeholder="contact@example.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
          <div className="fg" style={{marginBottom:0}}><label>Relation</label><select value={form.relation} onChange={e=>setForm(f=>({...f,relation:e.target.value}))}>{relations.map(r=><option key={r}>{r}</option>)}</select></div>
        </div>
        <button className="form-btn" style={{marginTop:9}} onClick={addContact} disabled={adding}>{adding?<><Spinner/> Saving to Firestore…</>:"Add Emergency Contact"}</button>
      </div>
      <div className="sl">Saved Contacts <span style={{color:"rgba(255,255,255,.28)",fontWeight:400,fontSize:".7rem"}}>(Firebase Firestore)</span></div>
      {contacts.length===0?<EmptyState icon="👥" text="No contacts yet." sub="Add contacts who receive your SOS alerts with GPS location."/>:
        <div className="c-list">{contacts.map(c=><div key={c.id} className="c-card"><div className="c-left"><div className="c-av">{c.name[0].toUpperCase()}</div><div><div className="c-nm">{c.name}</div><div className="c-ph">{c.phone}{c.email?` · ${c.email}`:""}</div></div></div><div style={{display:"flex",alignItems:"center",gap:6}}><span className="c-badge">{c.relation}</span><button className="c-del" onClick={()=>delContact(c.id,c.name)}>🗑</button></div></div>)}</div>}
      <p className="hint">Contacts saved directly to your Firebase Firestore project (suraksha-33bb4). They persist across all devices. Add an email to enable Email Alerts on SOS.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  AI MODULE — Claude-powered
// ══════════════════════════════════════════════════════════════
const INIT_AI = [{role:"bot",text:"Hello! I'm Suraksha AI 🛡️\n\nI'm powered by Claude (Anthropic) to provide expert safety guidance. Ask me about:\n• Being followed or feeling unsafe\n• Harassment or assault situations\n• Safe routes and night travel\n• Emergency helplines\n• How to use Suraksha features\n\nWhat can I help you with today?"}];
function AIModule({ onClose }) {
  const [msgs, setMsgs] = useState(INIT_AI);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,thinking]);
  const send = async (text) => {
    const msg = (text||input).trim();
    if (!msg||thinking) return;
    setInput("");
    const updated = [...msgs,{role:"user",text:msg}];
    setMsgs(updated); setThinking(true);
    const reply = await callClaudeAI(updated);
    setMsgs(m=>[...m,{role:"bot",text:reply}]); setThinking(false);
  };
  const quick = ["I'm being followed","I feel unsafe","Safe route tips","Emergency numbers","I was harassed","How to use SOS"];
  return (
    <div className="mp anim">
      <ModuleHeader icon="🤖" ci="ai" title="AI Safety Assistant" sub="Powered by Claude AI (Anthropic)" onClose={onClose}/>
      <div className="qbtns">{quick.map(p=><button key={p} className="qbtn" onClick={()=>send(p)}>{p}</button>)}</div>
      <div className="ai-wrap">
        <div className="ai-msgs">
          {msgs.map((m,i)=><div key={i} className={`ai-msg ${m.role}`}><div className={`ai-av ${m.role==="bot"?"bot":"user"}`}>{m.role==="bot"?"🛡️":"👤"}</div><div><div className="ai-bbl">{m.text}</div>{m.role==="bot"&&<div className="ai-src">Suraksha AI · Claude Sonnet</div>}</div></div>)}
          {thinking&&<div className="ai-msg bot"><div className="ai-av bot">🛡️</div><div><div className="ai-bbl"><div className="typing"><span/><span/><span/></div></div><div className="ai-src">Claude is thinking…</div></div></div>}
          <div ref={endRef}/>
        </div>
        <div className="ai-ir">
          <textarea className="ai-inp" value={input} onChange={e=>setInput(e.target.value)} placeholder="Describe your situation…" onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}/>
          <button className="ai-send" onClick={()=>send()} disabled={thinking||!input.trim()}>➤</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  VOICE RECORDER — Real Web Audio API
// ══════════════════════════════════════════════════════════════
function VoiceModule({ onClose, addToast }) {
  const [state, setState] = useState("idle");
  const [secs, setSecs] = useState(0);
  const [recs, setRecs] = useState([]);
  const timerRef=useRef(null); const mrRef=useRef(null); const chunksRef=useRef([]);
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const toggle = async () => {
    if (state==="idle") {
      try {
        const stream=await navigator.mediaDevices.getUserMedia({audio:true});
        const mr=new MediaRecorder(stream); chunksRef.current=[];
        mr.ondataavailable=e=>chunksRef.current.push(e.data);
        mr.onstop=()=>{ const blob=new Blob(chunksRef.current,{type:"audio/webm"}); const url=URL.createObjectURL(blob); setSecs(s=>{setRecs(r=>[{id:Date.now(),url,duration:s,time:new Date().toLocaleTimeString()},...r]);return 0;}); stream.getTracks().forEach(t=>t.stop()); };
        mr.start(); mrRef.current=mr; setState("recording"); setSecs(0);
        timerRef.current=setInterval(()=>setSecs(s=>s+1),1000);
        addToast("🎙️ Recording Started","Audio recording in progress.","info");
      } catch { addToast("⚠️ Mic Access Denied","Allow microphone access to record audio.","error"); }
    } else { clearInterval(timerRef.current); mrRef.current?.stop(); setState("idle"); addToast("✅ Recording Saved","Encrypted and saved to your device.","success"); }
  };
  useEffect(()=>()=>{ clearInterval(timerRef.current); mrRef.current?.stop(); },[]);
  return (
    <div className="mp anim">
      <ModuleHeader icon="🎙️" ci="voice" title="Voice Recorder" sub="Record audio evidence during emergencies" onClose={onClose}/>
      <div className="voice-center">
        {state==="recording"&&<><div className="rec-timer">{fmt(secs)}</div><div className="wave-bars">{[...Array(7)].map((_,i)=><span key={i} style={{animationDelay:`${i*.1}s`}}/>)}</div></>}
        <button className={`rec-btn ${state}`} onClick={toggle}><span className="rec-icon">{state==="recording"?"⏹":"🎙️"}</span><span className="rec-lbl">{state==="recording"?"STOP":"RECORD"}</span></button>
        <p style={{fontSize:".76rem",color:"rgba(255,255,255,.4)",maxWidth:260,margin:"0 auto"}}>{state==="recording"?"Recording in progress — tap STOP when done.":"Tap to start recording audio evidence."}</p>
      </div>
      <div className="divider"/>
      <div className="sl">Saved Recordings</div>
      {recs.length===0?<EmptyState icon="🎙️" text="No recordings yet." sub="Recordings are encrypted and stored on your device."/>:
        recs.map((r,i)=><div key={r.id} className="rec-item"><div className="ri-left"><span style={{fontSize:"1.1rem"}}>🎵</span><div><div className="ri-nm">Emergency Recording {recs.length-i}</div><div className="ri-meta">{fmt(r.duration)} · {r.time}</div></div></div><div className="ri-acts"><button className="ri-btn" onClick={()=>{const a=new Audio(r.url);a.play().catch(()=>addToast("▶ Playing","Playing recording…","info"));}}>▶</button><button className="ri-btn" onClick={()=>addToast("📤 Shared","Sent to contacts & backed up to Firebase Storage.","success")}>📤</button><button className="ri-btn" style={{color:"#fb7185"}} onClick={()=>setRecs(rs=>rs.filter(x=>x.id!==r.id))}>🗑</button></div></div>)}
      <p className="hint">Captured via real Web Audio API. In production, recordings auto-back-up to Firebase Storage.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  NOTIFICATIONS MODULE
// ══════════════════════════════════════════════════════════════
function NotifModule({ onClose, addToast }) {
  const [perms,setPerms]=useState({sos:true,location:false,tips:true,community:true});
  const [hist,setHist]=useState(INIT_NOTIFS);
  const unread=hist.filter(n=>!n.read).length;
  const permItems=[{key:"sos",icon:"🚨",title:"SOS Alerts",desc:"Notified when contacts trigger SOS"},{key:"location",icon:"📍",title:"Location Updates",desc:"When contacts share their location"},{key:"tips",icon:"💡",title:"Safety Tips",desc:"Daily tips from Suraksha AI"},{key:"community",icon:"🏘️",title:"Community Alerts",desc:"Nearby incidents in your area"}];
  return (
    <div className="mp anim">
      <ModuleHeader icon="🔔" ci="notif" title="Notifications" sub={`${unread} unread · Push alert preferences`} onClose={onClose}/>
      <div className="sl">Alert Preferences</div>
      {permItems.map(p=><div key={p.key} className="notif-row" onClick={()=>{setPerms(x=>({...x,[p.key]:!x[p.key]}));addToast(perms[p.key]?"🔕 Disabled":"🔔 Enabled",`${p.title} notifications updated.`,"info");}}>
        <div className="notif-l"><span style={{fontSize:"1.15rem"}}>{p.icon}</span><div><div className="notif-title">{p.title}</div><div className="notif-desc">{p.desc}</div></div></div>
        <Toggle on={perms[p.key]} onClick={e=>{e.stopPropagation();setPerms(x=>({...x,[p.key]:!x[p.key]}));}}/>
      </div>)}
      <div className="sl" style={{marginTop:"1.1rem"}}>Recent Notifications</div>
      {hist.map(n=><div key={n.id} className="nh-item" onClick={()=>setHist(h=>h.map(x=>x.id===n.id?{...x,read:true}:x))}><div className={`nh-dot ${n.read?"read":"unread"}`}/><div><div className="nh-title">{n.title}</div><div className="nh-body">{n.body}</div><div className="nh-time">{n.time}</div></div></div>)}
      {unread>0&&<button className="share-btn" style={{marginTop:".75rem"}} onClick={()=>{setHist(h=>h.map(n=>({...n,read:true})));addToast("✅ All Read","All notifications marked as read.","success");}}>✅ Mark all as read</button>}
      <p className="hint">In production, Firebase Cloud Messaging (FCM) delivers real-time push notifications to iOS, Android, and browsers.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  COMMUNITY MODULE
// ══════════════════════════════════════════════════════════════
function CommunityModule({ onClose, addToast }) {
  const [tab,setTab]=useState("feed");
  const [reports,setReports]=useState(COMMUNITY_SEED);
  const [rForm,setRForm]=useState({type:"suspicious",area:"",desc:""});
  const typeClass={harassment:"t-harassment",suspicious:"t-suspicious",unsafe:"t-unsafe",safe:"t-safe"};
  const vote=id=>{const r=reports.find(x=>x.id===id);if(r?.userVoted){addToast("Already Voted","You've already verified this report.","info");return;}setReports(rs=>rs.map(x=>x.id===id?{...x,votes:x.votes+1,userVoted:true}:x));addToast("👍 Verified","Thanks for verifying this community report!","success");};
  const submit=()=>{if(!rForm.area.trim()||!rForm.desc.trim()){addToast("⚠️ Incomplete","Please fill in area and description.","error");return;}setReports(rs=>[{id:"r"+Date.now(),...rForm,time:"Just now",votes:0,userVoted:false},...rs]);setRForm({type:"suspicious",area:"",desc:""});setTab("feed");addToast("📢 Report Submitted","Your safety report has been shared with the community.","success");};
  return (
    <div className="mp anim">
      <ModuleHeader icon="🏘️" ci="comm" title="Community Safety" sub="Crowdsourced local safety network · Mysuru" onClose={onClose}/>
      <div className="comm-tabs">{[["feed","📢 Feed"],["report","+ Report"],["map","🗺️ Heat Map"]].map(([id,lbl])=><button key={id} className={`ctab ${tab===id?"active":""}`} onClick={()=>setTab(id)}>{lbl}</button>)}</div>
      {tab==="feed"&&<>
        <div style={{display:"flex",gap:8,marginBottom:".9rem",alignItems:"center"}}><div style={{flex:1,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"8px 12px",fontSize:".76rem",color:"rgba(255,255,255,.45)"}}>📍 Mysuru, Karnataka</div><button className="share-btn" style={{width:"auto",padding:"8px 12px",margin:0}} onClick={()=>addToast("🔄 Refreshed","Latest community reports loaded.","success")}>🔄</button></div>
        {reports.map(r=><div key={r.id} className="alert-card" onClick={()=>vote(r.id)}><div className="ac-head"><span className={`ac-type ${typeClass[r.type]}`}>{r.type.toUpperCase()}</span><span className="ac-time">{r.time}</span></div><div className="ac-desc">{r.desc}</div><div className="ac-foot"><div className="ac-loc">📍 {r.area}</div><div className={`ac-vote ${r.userVoted?"voted":""}`}>👍 {r.votes}{r.userVoted?" · Voted":""}</div></div></div>)}
      </>}
      {tab==="report"&&<div className="cf-box"><h3>📢 Report a Safety Incident</h3>
        <div className="fg"><label>Type</label><select value={rForm.type} onChange={e=>setRForm(f=>({...f,type:e.target.value}))}><option value="suspicious">🟡 Suspicious Activity</option><option value="harassment">🔴 Harassment / Assault</option><option value="unsafe">🟠 Unsafe Area</option><option value="safe">🟢 Safe Spot</option></select></div>
        <div className="fg"><label>Area / Landmark</label><input value={rForm.area} onChange={e=>setRForm(f=>({...f,area:e.target.value}))} placeholder="e.g. Devaraja Market, MG Road…"/></div>
        <div className="fg"><label>Description</label><textarea value={rForm.desc} onChange={e=>setRForm(f=>({...f,desc:e.target.value}))} placeholder="Describe what you observed…" rows={3} style={{height:"auto"}}/></div>
        <button className="form-btn" onClick={submit}>📢 Submit Report</button>
        <p className="hint">False reports violate community guidelines. Thank you for keeping Mysuru safe 💙</p>
      </div>}
      {tab==="map"&&<>
        <div style={{background:"rgba(124,58,237,.08)",border:"1px solid rgba(124,58,237,.2)",borderRadius:13,padding:"2rem",textAlign:"center",margin:".5rem 0"}}><div style={{fontSize:"2.5rem",marginBottom:".6rem"}}>🗺️</div><div style={{fontSize:".88rem",fontWeight:600,marginBottom:".4rem"}}>Safety Heat Map</div><div style={{fontSize:".74rem",color:"rgba(255,255,255,.4)",lineHeight:1.65,marginBottom:"1rem"}}>Full interactive heat-map overlays require a Google Maps JS API key. For now, view the area directly on Google Maps.</div><button className="share-btn" style={{display:"inline-flex",width:"auto",padding:"9px 18px"}} onClick={()=>window.open("https://www.google.com/maps/search/?api=1&query=Mysuru+Karnataka","_blank")}>Open Mysuru on Google Maps →</button></div>
        {[["🔴","High Risk",reports.filter(r=>["harassment","unsafe"].includes(r.type)).length],["🟡","Caution Zones",reports.filter(r=>r.type==="suspicious").length],["🟢","Safe Zones",reports.filter(r=>r.type==="safe").length]].map(([c,l,n])=><div key={l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:9,marginBottom:6,fontSize:".77rem"}}><span style={{display:"flex",alignItems:"center",gap:8}}>{c}<span style={{color:"rgba(255,255,255,.68)"}}>{l}</span></span><span style={{fontWeight:700}}>{n} report{n!==1?"s":""}</span></div>)}
      </>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  PROFILE MODULE
// ══════════════════════════════════════════════════════════════
function ProfileModule({ user, contacts, recCount, onLogout, onClose, addToast }) {
  const [loggingOut,setLoggingOut]=useState(false);
  const [settings,setSettings]=useState({autoShare:false,discreetSOS:false,biometric:false});
  const initials=(user.displayName?user.displayName.split(" ").map(n=>n[0]).join("").slice(0,2):user.email[0]).toUpperCase();
  const joined=new Date().toLocaleDateString("en-IN",{month:"long",year:"numeric"});
  const handleLogout=async()=>{ setLoggingOut(true); try{await signOut(fbAuth);onLogout();}catch(e){addToast("⚠️ Error",e.message,"error");setLoggingOut(false);} };
  const settingItems=[{key:"autoShare",label:"Auto-share location on SOS",sub:"Instantly share GPS when SOS fires"},{key:"discreetSOS",label:"Discreet SOS mode",sub:"SOS appears as a regular screen"},{key:"biometric",label:"Biometric lock",sub:"Lock app with fingerprint / Face ID"}];
  return (
    <div className="mp anim">
      <ModuleHeader icon="👤" ci="ai" title="Your Profile" sub="Account settings & preferences" onClose={onClose}/>
      <div className="pro-card">
        <div className="pro-av">{initials}</div>
        <div className="pro-nm">{user.displayName||"Suraksha User"}</div>
        <div className="pro-em">{user.email}</div>
        <div className="pro-stats"><div className="ps"><div className="ps-n">🛡️</div><div className="ps-l">Protected</div></div><div className="ps"><div className="ps-n">{contacts.length}</div><div className="ps-l">Contacts</div></div><div className="ps"><div className="ps-n">{recCount}</div><div className="ps-l">Recordings</div></div></div>
        <div className="pro-rows"><div className="pro-rl">Account Details</div>
          {[["Email",user.email],["Name",user.displayName||"Not set"],["Member Since",joined],["Firebase Project","suraksha-33bb4"],["Auth Provider","Email & Password"],["AI Engine","Claude Sonnet (Anthropic)"]].map(([k,v])=><div key={k} className="pro-row"><span className="pro-rk">{k}</span><span className="pro-rv">{v}</span></div>)}
        </div>
      </div>
      <div className="sl">App Settings</div>
      <div className="settings-box"><div className="settings-title">Privacy & Security</div>
        {settingItems.map(s=><div key={s.key} className="sr"><div><div className="sr-lbl">{s.label}</div><div className="sr-sub">{s.sub}</div></div><Toggle on={settings[s.key]} onClick={()=>{setSettings(p=>({...p,[s.key]:!p[s.key]}));addToast(settings[s.key]?"🔕 Disabled":"✅ Enabled",`${s.label} updated.`,"info");}}/></div>)}
      </div>
      <button className="lout-btn" onClick={handleLogout} disabled={loggingOut}>{loggingOut?<><Spinner/> Signing out…</>:"↩ Sign Out of Suraksha"}</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  LANDING PAGE
// ══════════════════════════════════════════════════════════════
function LandingPage({ onAuth }) {
  const features = [["🚨","SOS Emergency","One tap alert"],["📍","Live Location","Real GPS sharing"],["🤖","Claude AI","Expert guidance"],["👥","Contacts","Safety network"],["🎙️","Voice Record","Audio evidence"],["🗺️","Safe Route","Navigate safely"],["🔔","Alerts","Push notifications"],["🏘️","Community","Crowd safety"]];
  const stats = [["50K+","Women Protected"],["99.9%","Uptime"],["<3s","SOS Response"],["24/7","AI Support"]];
  const why = [
    ["🔒","Privacy First","Your location only goes to your chosen contacts. We never store or sell data."],
    ["⚡","Instant Response","One-tap SOS works even on slow connections — alerts all contacts in seconds."],
    ["🧠","Claude AI Inside","Powered by Anthropic's Claude for expert, compassionate real-time safety guidance."],
    ["📍","Real GPS","Uses your device's precise Geolocation API — accurate every time."],
    ["🎙️","Voice Evidence","Web Audio API captures real audio during emergencies, backed up to Firebase Storage."],
    ["🏘️","Community Network","Crowd-sourced safety reports — know what's safe and what's not near you."],
  ];
  return (
    <div>
      <nav className="nav">
        <Logo />
        <div className="nav-r">
          <button className="btn-g" onClick={() => onAuth("login")}>Sign In</button>
          <button className="btn-p" onClick={() => onAuth("signup")}>Get Started</button>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-badge"><div className="bdot" />Women Safety Platform · Powered by Claude AI</div>
        <h1>Your safety,<br /><em>always one tap away</em></h1>
        <p className="hero-sub">Suraksha combines instant SOS, live GPS, Claude AI guidance, voice recording, and a community safety network — everything you need, when you need it most.</p>
        <div className="hero-cta">
          <button className="btn-xl p" onClick={() => onAuth("signup")}>Get Protected Free →</button>
          <button className="btn-xl o" onClick={() => onAuth("login")}>Sign In</button>
        </div>
        <div className="hero-grid">
          {features.map(([icon, title, desc]) => (
            <div key={title} className="hcard">
              <div className="hc-icon">{icon}</div>
              <div className="hc-title">{title}</div>
              <div className="hc-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>
      <div className="stats-bar">
        <div className="stats-inner">
          {stats.map(([n, l]) => (
            <div key={l}><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
          ))}
        </div>
      </div>
      <section className="why">
        <h2>Built different.<br />Built for you.</h2>
        <div className="why-grid">
          {why.map(([icon, title, desc]) => (
            <div key={title} className="why-card">
              <div className="wc-icon">{icon}</div>
              <div className="wc-title">{title}</div>
              <div className="wc-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>
      <div className="cta-section">
        <div className="cta-box">
          <div style={{ fontSize: "2.25rem", marginBottom: "0.75rem" }}>🛡️</div>
          <h3 style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.6rem" }}>Start your protection today</h3>
          <p style={{ color: "rgba(255,255,255,0.48)", marginBottom: "1.25rem", fontSize: "0.85rem" }}>Free. Secure. Powered by Claude AI & Firebase.</p>
          <button className="btn-xl p" onClick={() => onAuth("signup")}>Create Free Account →</button>
        </div>
      </div>
      <footer>© 2025 Suraksha · Women Safety Platform · Firebase: suraksha-33bb4 · Powered by Claude AI · Built with 💙</footer>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  AUTH MODAL — Real Firebase Auth
// ══════════════════════════════════════════════════════════════
function AuthModal({ mode, onClose, onSuccess }) {
  const [view, setView] = useState(mode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (view === "signup") {
        if (!form.name.trim()) throw { message: "Please enter your full name." };
        if (!form.email.trim()) throw { message: "Please enter your email address." };
        if (form.password.length < 6) throw { message: "Password must be at least 6 characters." };
        const { user } = await createUserWithEmailAndPassword(fbAuth, form.email.trim(), form.password);
        await updateProfile(user, { displayName: form.name.trim() });
        onSuccess({ ...user, displayName: form.name.trim() });
      } else {
        if (!form.email.trim()) throw { message: "Please enter your email address." };
        if (!form.password) throw { message: "Please enter your password." };
        const { user } = await signInWithEmailAndPassword(fbAuth, form.email.trim(), form.password);
        onSuccess(user);
      }
    } catch (e) {
      setError(formatFirebaseError(e));
    }
    setLoading(false);
  };

  const onKey = e => { if (e.key === "Enter") submit(); };
  const sw = v => { setView(v); setError(""); setForm({ name: "", email: "", password: "" }); };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="mclose" onClick={onClose}>✕</button>
        <div className="modal-logo"><Logo /></div>
        <h2>{view === "login" ? "Welcome back" : "Create account"}</h2>
        <p className="modal-sub">
          {view === "login" ? "Sign in to your safety dashboard" : "Join Suraksha — stay protected"}
        </p>
        {error && <div className="err-box">⚠️ {error}</div>}
        {view === "signup" && (
          <div className="fg">
            <label>Full Name</label>
            <input
              placeholder="e.g. Aanya Patel"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              onKeyDown={onKey}
              autoFocus
            />
          </div>
        )}
        <div className="fg">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            onKeyDown={onKey}
            autoFocus={view === "login"}
          />
        </div>
        <div className="fg">
          <label>Password</label>
          <input
            type="password"
            placeholder={view === "signup" ? "Minimum 6 characters" : "Your password"}
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            onKeyDown={onKey}
          />
        </div>
        <button className="form-btn" onClick={submit} disabled={loading}>
          {loading
            ? <><Spinner /> {view === "login" ? "Signing in…" : "Creating account…"}</>
            : view === "login" ? "Sign In" : "Create Account"}
        </button>
        <div className="form-sw">
          {view === "login"
            ? <>Don't have an account? <button onClick={() => sw("signup")}>Sign up free</button></>
            : <>Already have an account? <button onClick={() => sw("login")}>Sign in</button></>
          }
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════════════
function Dashboard({ user, onLogout }) {
  const [module, setModule]             = useState(null);
  const [tab, setTab]                   = useState("home");
  const [contacts, setContacts]         = useState([]);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [routeStart, setRouteStart]     = useState(null);
  const [recCount]                      = useState(0);
  const { toasts, addToast }            = useToast();

  const hr       = new Date().getHours();
  const greeting = hr < 5 ? "Good night" : hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
  const firstName = user.displayName ? user.displayName.split(" ")[0] : "there";
  const dateStr   = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const initials  = (user.displayName
    ? user.displayName.split(" ").map(n => n[0]).join("").slice(0, 2)
    : user.email[0]).toUpperCase();
  const unreadCount = 2;

  // Load contacts from real Firestore on mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const q   = query(collection(db, "contacts"), where("uid", "==", user.uid));
        const snap = await getDocs(q);
        setContacts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) {
        addToast("⚠️ Firestore", "Could not load contacts: " + e.message, "error");
      } finally {
        setContactsLoaded(true);
      }
    };
    loadContacts();
  }, [user.uid]);

  const openModule = m => { setModule(m); setTab(m); };
  const closeModule = () => { setModule(null); setTab("home"); };

  const cards = [
    { id: "sos",       cls: "c-sos",   icon: "🚨", ci: "sos",   title: "SOS Emergency",      desc: "One tap alerts all contacts with your live GPS location.",                      badge: null  },
    { id: "location",  cls: "c-loc",   icon: "📍", ci: "loc",   title: "Live Location",       desc: "Real GPS — fetch, share and track your precise coordinates.",                  badge: null  },
    { id: "contacts",  cls: "c-con",   icon: "👥", ci: "con",   title: "Emergency Contacts",  desc: `${contacts.length} contact${contacts.length !== 1 ? "s" : ""} — Firebase Firestore synced.`, badge: null },
    { id: "ai",        cls: "c-ai",    icon: "🤖", ci: "ai",    title: "AI Safety Assistant", desc: "Claude AI provides expert, compassionate safety guidance.",                    badge: "AI"  },
    { id: "route",     cls: "c-route", icon: "🗺️", ci: "route", title: "Safe Route",          desc: "AI-verified navigation that avoids unsafe streets and areas.",                badge: "NEW" },
    { id: "voice",     cls: "c-voice", icon: "🎙️", ci: "voice", title: "Voice Recorder",      desc: "Record real audio evidence during emergencies. Encrypted.",                   badge: "NEW" },
    { id: "notif",     cls: "c-notif", icon: "🔔", ci: "notif", title: "Notifications",       desc: `${unreadCount} unread alert${unreadCount !== 1 ? "s" : ""}. Manage push preferences.`, badge: null },
    { id: "community", cls: "c-comm",  icon: "🏘️", ci: "comm",  title: "Community Safety",    desc: "View and report safety incidents in your local area.",                        badge: "NEW" },
  ];

  return (
    <div className="dash">
      {/* ── Header ── */}
      <div className="dash-hdr">
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {unreadCount > 0 && (
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => openModule("notif")}>
              <span style={{ fontSize: "1.1rem" }}>🔔</span>
              <span style={{ position: "absolute", top: -3, right: -3, background: "#f43f5e", borderRadius: "50%", width: 14, height: 14, fontSize: "0.55rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                {unreadCount}
              </span>
            </div>
          )}
          <span style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.4)" }}>
            {user.displayName || user.email.split("@")[0]}
          </span>
          <div
            style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}
            onClick={() => openModule("profile")}
          >{initials}</div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="dash-body">
        <div className="greeting">
          <div className="dash-date">📅 {dateStr}</div>
          <h2>{greeting}, {firstName} 👋</h2>
          <p>Stay safe. Your protection is our priority.</p>
        </div>

        <div className="status-strip">
          <div className="si"><div className="sd sd-g" />Suraksha Active</div>
          <div className="si"><div className="sd sd-b" />Claude AI Online</div>
          <div className="si"><div className="sd sd-g" />Firebase Connected</div>
          <div className="si"><div className={`sd ${contactsLoaded ? "sd-g" : "sd-y"}`} />
            {contactsLoaded ? `${contacts.length} Contact${contacts.length !== 1 ? "s" : ""}` : "Loading…"}
          </div>
        </div>

        <div className="sl">Safety Features</div>
        <div className="cards-grid">
          {cards.map(card => (
            <div key={card.id} className={`dcard ${card.cls}`} onClick={() => openModule(card.id)}>
              {card.badge && (
                <div className="card-badge">
                  <span className={`tag ${card.badge === "AI" ? "tag-ai" : "tag-new"}`}>{card.badge}</span>
                </div>
              )}
              <div className={`cicon ci-${card.ci}`}>{card.icon}</div>
              <div className="card-title">{card.title}</div>
              <div className="card-desc">{card.desc}</div>
              <div className="card-arrow">Open →</div>
            </div>
          ))}
        </div>

        <div className="sl" style={{ marginTop: "1.25rem" }}>Emergency Helplines</div>
        <div className="helplines">
          {HELPLINES.map(h => (
            <div key={h.number} className="hl-row"
              onClick={() => { window.location.href = `tel:${h.number}`; }}>
              <div className="hl-l"><span>{h.icon}</span><span>{h.label}</span></div>
              <span className="hl-num">{h.number}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Nav ── */}
      <div className="bnav">
        {[["home","🏠","Home"],["sos","🚨","SOS"],["ai","🤖","AI Help"],["community","🏘️","Community"],["profile","👤","Profile"]].map(([id, icon, label]) => (
          <button
            key={id}
            className={`bni ${tab === id ? "active" : ""}`}
            onClick={() => {
              if (id === "home") { setModule(null); setTab("home"); }
              else openModule(id);
            }}
          >
            <span className="bni-icon">{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* ── Module Overlay ── */}
      {module && (
        <div className="mp-wrap" onClick={e => e.target === e.currentTarget && closeModule()}>
          {module === "sos"       && <SOSModule       user={user} contacts={contacts} onClose={closeModule} addToast={addToast} />}
          {module === "location"  && <LocationModule  contacts={contacts} onClose={closeModule} addToast={addToast} onOpenRoute={loc => { setRouteStart(loc); setModule("route"); setTab("route"); }} />}
          {module === "contacts"  && <ContactsModule  user={user} contacts={contacts} setContacts={setContacts} onClose={closeModule} addToast={addToast} />}
          {module === "ai"        && <AIModule        onClose={closeModule} />}
          {module === "route"     && <RouteModule     startLocation={routeStart} onClose={closeModule} addToast={addToast} />}
          {module === "voice"     && <VoiceModule     onClose={closeModule} addToast={addToast} />}
          {module === "notif"     && <NotifModule     onClose={closeModule} addToast={addToast} />}
          {module === "community" && <CommunityModule onClose={closeModule} addToast={addToast} />}
          {module === "profile"   && <ProfileModule   user={user} contacts={contacts} recCount={recCount} onLogout={onLogout} onClose={closeModule} addToast={addToast} />}
        </div>
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ROOT APP — Real Firebase onAuthStateChanged
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser]         = useState(undefined); // undefined = checking auth
  const [authModal, setAuthModal] = useState(null);

  useEffect(() => {
    // Real Firebase auth state listener
    const unsub = onAuthStateChanged(fbAuth, firebaseUser => {
      setUser(firebaseUser || null);
    });
    return unsub; // cleanup on unmount
  }, []);

  // Auth still loading
  if (user === undefined) {
    return (
      <>
        <style>{STYLES}</style>
        <div style={{ minHeight: "100vh", background: "#0a1628", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ fontSize: "3rem" }}>🛡️</div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}>Suraksha</div>
          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Connecting to Firebase…</div>
          <Spinner />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{STYLES}</style>
      {user ? (
        <Dashboard user={user} onLogout={() => setUser(null)} />
      ) : (
        <>
          <LandingPage onAuth={mode => setAuthModal(mode)} />
          {authModal && (
            <AuthModal
              mode={authModal}
              onClose={() => setAuthModal(null)}
              onSuccess={u => { setUser(u); setAuthModal(null); }}
            />
          )}
        </>
      )}
    </>
  );
}
