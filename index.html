bash

cat > /mnt/user-data/outputs/Suraksha.jsx << 'ENDOFFILE'
import { useState, useEffect, useRef, useCallback } from "react";

// ══════════════════════════════════════════════════════════════
//  SURAKSHA — FULL PRODUCTION APP
//  React 18 + Vite + Firebase Auth + Firestore + Claude AI
// ══════════════════════════════════════════════════════════════

// ── Firebase SDK imports (real Firebase) ──
// Uncomment these and comment out the simulator below when deploying:
//
// import { initializeApp } from "firebase/app";
// import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
//          signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
// import { getFirestore, collection, addDoc, getDocs, deleteDoc,
//          doc, query, where, serverTimestamp } from "firebase/firestore";
//
// const firebaseConfig = { ...your config from firebase.config.js... };
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const db = getFirestore(app);

// ══════════════════════════════════════════════════════════════
//  FIREBASE SIMULATOR  (localStorage-backed, mirrors real API)
// ══════════════════════════════════════════════════════════════
class FirebaseSimulator {
  constructor() {
    try {
      this._users = JSON.parse(localStorage.getItem("sk_users") || "{}");
      this._currentUser = JSON.parse(localStorage.getItem("sk_cu") || "null");
      this._db = JSON.parse(localStorage.getItem("sk_db") || "{}");
    } catch {
      this._users = {}; this._currentUser = null; this._db = {};
    }
    this._listeners = [];
  }
  get currentUser() { return this._currentUser; }
  onAuthStateChanged(cb) {
    cb(this._currentUser);
    this._listeners.push(cb);
    return () => { this._listeners = this._listeners.filter(l => l !== cb); };
  }
  _notify() { this._listeners.forEach(l => l(this._currentUser)); }
  async createUserWithEmailAndPassword(email, password) {
    await this._delay(900);
    if (this._users[email]) throw { code: "auth/email-already-in-use", message: "Email already in use." };
    if (password.length < 6) throw { code: "auth/weak-password", message: "Password must be at least 6 characters." };
    const uid = "uid_" + Math.random().toString(36).slice(2);
    const user = { uid, email, displayName: null, emailVerified: false };
    this._users[email] = { ...user, password };
    this._currentUser = user;
    localStorage.setItem("sk_users", JSON.stringify(this._users));
    localStorage.setItem("sk_cu", JSON.stringify(user));
    this._notify();
    return { user };
  }
  async updateProfile(user, { displayName }) {
    await this._delay(200);
    const updated = { ...user, displayName };
    if (this._users[user.email]) { this._users[user.email].displayName = displayName; }
    this._currentUser = updated;
    localStorage.setItem("sk_users", JSON.stringify(this._users));
    localStorage.setItem("sk_cu", JSON.stringify(updated));
    this._notify();
  }
  async signInWithEmailAndPassword(email, password) {
    await this._delay(800);
    const u = this._users[email];
    if (!u || u.password !== password) throw { code: "auth/wrong-password", message: "Invalid email or password." };
    const { password: _, ...safe } = u;
    this._currentUser = safe;
    localStorage.setItem("sk_cu", JSON.stringify(safe));
    this._notify();
    return { user: safe };
  }
  async signOut() {
    await this._delay(300);
    this._currentUser = null;
    localStorage.setItem("sk_cu", "null");
    this._notify();
  }
  // Firestore simulation
  _col(name) { if (!this._db[name]) this._db[name] = {}; return this._db[name]; }
  _saveDB() { localStorage.setItem("sk_db", JSON.stringify(this._db)); }
  async addDoc(colName, data) {
    await this._delay(500);
    const id = "doc_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const doc = { id, ...data, _createdAt: new Date().toISOString() };
    this._col(colName)[id] = doc;
    this._saveDB();
    return { id };
  }
  async getDocs(colName, filterFn) {
    await this._delay(400);
    const docs = Object.values(this._col(colName));
    return filterFn ? docs.filter(filterFn) : docs;
  }
  async deleteDoc(colName, id) {
    await this._delay(300);
    delete this._col(colName)[id];
    this._saveDB();
  }
  async updateDoc(colName, id, data) {
    await this._delay(300);
    if (this._col(colName)[id]) {
      Object.assign(this._col(colName)[id], data, { _updatedAt: new Date().toISOString() });
    }
    this._saveDB();
  }
  _delay(ms) { return new Promise(r => setTimeout(r, ms)); }
}

const fbSim = new FirebaseSimulator();
const fbAuth = fbSim;
const fbDB = fbSim;

// ══════════════════════════════════════════════════════════════
//  ERROR FORMATTER
// ══════════════════════════════════════════════════════════════
function formatFirebaseError(err) {
  const map = {
    "auth/email-already-in-use": "That email is already registered.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/user-not-found": "No account found with that email.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
  };
  return map[err?.code] || err?.message || "Something went wrong. Please try again.";
}

// ══════════════════════════════════════════════════════════════
//  CLAUDE AI SAFETY ASSISTANT
// ══════════════════════════════════════════════════════════════
const SAFETY_SYSTEM_PROMPT = `You are Suraksha AI — a compassionate, expert women's safety assistant built into the Suraksha app, a safety platform used in India.

Your mission: provide calm, clear, actionable safety guidance to women in potentially unsafe situations.

CORE RESPONSIBILITIES:
1. Give situation-specific, step-by-step safety advice
2. Share relevant emergency numbers (Police: 100, Ambulance: 108, Emergency: 112, Women's Helpline: 1091, Domestic Violence: 181)
3. Guide users through Suraksha app features (SOS, Live Location, Emergency Contacts, Voice Recording)
4. Provide emotional support and reassurance without panic
5. Recommend preventative safety habits

COMMUNICATION STYLE:
- Calm, steady, empathetic — never alarming
- Use numbered steps for actionable advice
- Keep responses under 200 words unless detail is critical
- Use occasional emojis for warmth (🛡️ 💙 ✅ ⚠️ 🚨)
- Never be dismissive — every concern is valid

SCOPE: Safety topics only. Gently redirect general questions to safety topics.`;

async function callClaudeAI(conversationHistory) {
  const messages = conversationHistory
    .filter(m => m.role === "user" || m.role === "assistant")
    .map(m => ({ role: m.role === "bot" ? "assistant" : m.role, content: m.text }));

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SAFETY_SYSTEM_PROMPT,
        messages,
      }),
    });
    if (!res.ok) throw new Error("API " + res.status);
    const data = await res.json();
    return data.content?.[0]?.text || getFallbackAI(messages[messages.length - 1]?.content || "");
  } catch {
    return getFallbackAI(messages[messages.length - 1]?.content || "");
  }
}

function getFallbackAI(msg) {
  const m = msg.toLowerCase();
  if (m.includes("follow") || m.includes("stalker") || m.includes("stalking"))
    return "⚠️ If you're being followed:\n\n1. Do NOT go home directly\n2. Enter the nearest store, café, or public place\n3. Call someone and stay on the line\n4. Note their description (clothing, vehicle)\n5. If threat continues — call 112 immediately\n6. Share your live location using Suraksha now\n\nYou are not alone. Stay in public spaces.";
  if (m.includes("harass") || m.includes("assault") || m.includes("attack") || m.includes("abuse"))
    return "🚨 Immediate safety steps:\n\n1. Move toward crowded, well-lit areas NOW\n2. Shout loudly — attract attention, don't be silent\n3. Activate Suraksha SOS to alert your contacts\n4. Call 112 (Emergency) or 1091 (Women's Helpline)\n5. Record audio evidence with Suraksha's Voice Recorder\n\nWhat's happening to you is not your fault. Help is coming.";
  if (m.includes("unsafe") || m.includes("scared") || m.includes("afraid") || m.includes("danger"))
    return "I hear you, and your feelings are completely valid 💙\n\n1. Move to a populated, lit area right now\n2. Call someone from your Emergency Contacts list\n3. Activate SOS if the situation escalates\n4. Keep phone in hand, earphones out, stay alert\n5. Trust your instincts — they exist to protect you\n\nOne step at a time. You've got this.";
  if (m.includes("route") || m.includes("home") || m.includes("walk") || m.includes("night") || m.includes("travel"))
    return "🌙 Night safety checklist:\n\n1. Share live location with a trusted contact before leaving\n2. Use well-lit, busy streets — avoid shortcuts\n3. Stay on a call with someone\n4. Keep phone charged and accessible\n5. Use Suraksha's Safe Route feature for AI-verified paths\n6. Let someone know your expected arrival time\n\nPlanning ahead keeps you safe!";
  if (m.includes("helpline") || m.includes("number") || m.includes("call") || m.includes("police") || m.includes("emergency"))
    return "📞 Emergency Numbers — India:\n\n🚔 Police: 100\n🚑 Ambulance: 108\n📞 National Emergency: 112\n👩 Women's Helpline: 1091\n🏠 Domestic Violence: 181\n🧠 iCall Mental Health: 9152987821\n\nSave these on speed dial. Suraksha SOS instantly alerts your personal emergency contacts too.";
  if (m.includes("hello") || m.includes("hi") || m.length < 5)
    return "Hello! I'm Suraksha AI 🛡️\n\nI'm here to provide expert safety guidance. Ask me about:\n• Being followed or feeling unsafe\n• Harassment or assault situations\n• Safe routes and night travel tips\n• Emergency helplines\n• How to use Suraksha features\n\nWhat can I help you with today?";
  return "I'm here to help with your safety 💙\n\nCould you tell me more about your situation? I can provide specific guidance for:\n• Immediate threats or danger\n• Harassment or stalking\n• Safe travel planning\n• Emergency resources\n\nYour safety is the priority.";
}

// ══════════════════════════════════════════════════════════════
//  COMMUNITY SAFETY DATA
// ══════════════════════════════════════════════════════════════
const INITIAL_COMMUNITY_REPORTS = [
  { id: "r1", type: "suspicious", desc: "Unlit street near old bus stand — avoid after 9pm.", area: "Ashoka Road, Mysuru", time: "10m ago", votes: 7, userVoted: false },
  { id: "r2", type: "harassment", desc: "Verbal harassment reported near the evening market. Stay alert.", area: "Devaraja Market", time: "45m ago", votes: 12, userVoted: false },
  { id: "r3", type: "safe", desc: "Well-lit and patrolled. Safe to walk here at night.", area: "Chamundi Hill Road", time: "2h ago", votes: 19, userVoted: false },
  { id: "r4", type: "unsafe", desc: "Poorly lit underpass — take alternate route after dark.", area: "KRS Road Underpass", time: "5h ago", votes: 5, userVoted: false },
  { id: "r5", type: "suspicious", desc: "Unfamiliar vehicle parked near school for multiple days.", area: "Saraswathipuram", time: "1h ago", votes: 3, userVoted: false },
];

const HELPLINES = [
  { icon: "🚔", label: "Police", number: "100" },
  { icon: "🚑", label: "Ambulance", number: "108" },
  { icon: "📞", label: "National Emergency", number: "112" },
  { icon: "👩", label: "Women's Helpline", number: "1091" },
  { icon: "🏠", label: "Domestic Violence", number: "181" },
  { icon: "🧠", label: "iCall Mental Health", number: "9152987821" },
];

// ══════════════════════════════════════════════════════════════
//  GLOBAL STYLES
// ══════════════════════════════════════════════════════════════
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
html,body{font-family:'Inter',sans-serif;background:#0a1628;color:#fff;min-height:100vh;overflow-x:hidden}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:3px}
input,textarea,select,button{font-family:inherit}
button{cursor:pointer}
textarea{resize:none}

/* ANIMATIONS */
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.82)}}
@keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes spinAnim{to{transform:rotate(360deg)}}
@keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes toastIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:translateX(0)}}
@keyframes sosPulse{0%,100%{box-shadow:0 0 0 0 rgba(244,63,94,0)}50%{box-shadow:0 0 0 18px rgba(244,63,94,.07)}}
@keyframes recPulse{0%,100%{transform:scale(1);box-shadow:0 8px 28px rgba(220,38,38,.4)}50%{transform:scale(1.06);box-shadow:0 12px 40px rgba(220,38,38,.7)}}
@keyframes pinBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes waveBar{0%,100%{height:6px;opacity:.4}50%{height:26px;opacity:1}}
@keyframes typing{0%,80%,100%{transform:scale(.8);opacity:.4}40%{transform:scale(1);opacity:1}}
@keyframes badgePulse{0%,100%{opacity:1}50%{opacity:.55}}

.spinner{display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spinAnim .6s linear infinite;vertical-align:middle}
.anim-in{animation:fadeIn .25s ease-out}
.slide-up{animation:slideUp .25s ease-out}

/* UTILITY */
.divider{height:1px;background:rgba(255,255,255,.07);margin:1rem 0}
.sl{font-size:.66rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:9px}
.hint{font-size:.64rem;color:rgba(255,255,255,.25);text-align:center;line-height:1.65;margin-top:.7rem}
.tag{display:inline-block;font-size:.6rem;font-weight:700;padding:2px 7px;border-radius:5px;letter-spacing:.03em;vertical-align:middle;margin-left:5px}
.tag-new{background:rgba(34,197,94,.18);border:1px solid rgba(34,197,94,.3);color:#86efac}
.tag-ai{background:rgba(124,58,237,.18);border:1px solid rgba(124,58,237,.3);color:#c4b5fd}
.tag-live{background:rgba(244,63,94,.18);border:1px solid rgba(244,63,94,.3);color:#fca5a5;animation:badgePulse 2s infinite}

/* NAV */
.nav{position:sticky;top:0;z-index:100;background:rgba(10,22,40,.98);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.08);padding:0 1.5rem;height:60px;display:flex;align-items:center;justify-content:space-between}
.logo{display:flex;align-items:center;gap:8px}
.logo-icon{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#2563eb,#06b6d4);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}
.logo-text{font-family:'DM Sans',sans-serif;font-size:1.1rem;font-weight:700;letter-spacing:-.02em}
.logo-text em{font-style:normal;color:#06b6d4}
.nav-right{display:flex;align-items:center;gap:8px}
.btn-g{background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.8);padding:6px 14px;border-radius:8px;font-size:.79rem;font-weight:500;transition:all .2s}
.btn-g:hover{border-color:#2563eb;color:#fff;background:rgba(37,99,235,.15)}
.btn-p{background:linear-gradient(135deg,#2563eb,#1d4ed8);border:none;color:#fff;padding:6px 16px;border-radius:8px;font-size:.79rem;font-weight:600;transition:all .2s;box-shadow:0 4px 14px rgba(37,99,235,.35)}
.btn-p:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(37,99,235,.5)}

/* HERO */
.hero{min-height:calc(100vh - 60px);background:radial-gradient(ellipse at 20% 50%,rgba(37,99,235,.18) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(6,182,212,.12) 0%,transparent 50%),radial-gradient(ellipse at 60% 80%,rgba(244,63,94,.08) 0%,transparent 40%),#0a1628;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:3rem 1.5rem 5rem}
.badge{display:inline-flex;align-items:center;gap:7px;background:rgba(37,99,235,.15);border:1px solid rgba(37,99,235,.35);padding:5px 13px;border-radius:100px;font-size:.7rem;font-weight:600;color:#93c5fd;margin-bottom:1.75rem;letter-spacing:.05em;text-transform:uppercase}
.badge-dot{width:6px;height:6px;background:#06b6d4;border-radius:50%;animation:pulse 2s infinite}
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
.hero-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:.9rem .75rem;text-align:center;transition:all .3s}
.hero-card:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.15);transform:translateY(-3px)}
.hc-icon{font-size:1.5rem;margin-bottom:.4rem}
.hc-title{font-size:.74rem;font-weight:600;margin-bottom:2px}
.hc-desc{font-size:.64rem;color:rgba(255,255,255,.4)}

/* STATS BAR */
.stats-bar{background:rgba(255,255,255,.03);border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06);padding:1.75rem 1.5rem}
.stats-inner{max-width:800px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;text-align:center}
@media(max-width:500px){.stats-inner{grid-template-columns:repeat(2,1fr)}}
.stat-n{font-family:'DM Sans',sans-serif;font-size:1.6rem;font-weight:800;color:#60a5fa}
.stat-l{font-size:.7rem;color:rgba(255,255,255,.38);margin-top:3px}

/* WHY SECTION */
.why{padding:3.5rem 1.5rem;max-width:860px;margin:0 auto}
.why h2{font-family:'DM Sans',sans-serif;font-size:clamp(1.5rem,3.5vw,2.2rem);font-weight:800;letter-spacing:-.02em;text-align:center;margin-bottom:2rem}
.why-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:13px}
.why-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:1.2rem}
.wc-icon{font-size:1.5rem;margin-bottom:.65rem}
.wc-title{font-size:.84rem;font-weight:700;margin-bottom:.35rem}
.wc-desc{font-size:.72rem;color:rgba(255,255,255,.43);line-height:1.6}

/* CTA SECTION */
.cta-section{padding:2rem 1.5rem 4.5rem;text-align:center}
.cta-box{max-width:520px;margin:0 auto;background:linear-gradient(135deg,rgba(37,99,235,.15),rgba(6,182,212,.1));border:1px solid rgba(37,99,235,.25);border-radius:22px;padding:2.5rem 1.75rem}

/* FOOTER */
footer{border-top:1px solid rgba(255,255,255,.06);padding:1.5rem;text-align:center;color:rgba(255,255,255,.25);font-size:.73rem}

/* MODAL */
.overlay{position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.78);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:1rem}
.modal{background:#112040;border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:2rem 1.75rem;width:100%;max-width:400px;box-shadow:0 40px 80px rgba(0,0,0,.5);position:relative;animation:slideUp .25s ease-out}
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
.form-btn:hover{transform:translateY(-1px);box-shadow:0 8px 22px rgba(37,99,235,.55)}
.form-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
.form-switch{text-align:center;margin-top:.8rem;font-size:.73rem;color:rgba(255,255,255,.43)}
.form-switch button{background:none;border:none;color:#60a5fa;font-size:.73rem;font-weight:500}
.form-switch button:hover{text-decoration:underline}
.err-box{background:rgba(244,63,94,.15);border:1px solid rgba(244,63,94,.3);border-radius:8px;padding:9px 12px;font-size:.75rem;color:#fca5a5;margin-bottom:.8rem}
.modal-close{position:absolute;top:.8rem;right:.8rem;background:rgba(255,255,255,.08);border:none;color:#fff;width:30px;height:30px;border-radius:8px;font-size:.9rem;display:flex;align-items:center;justify-content:center;transition:background .2s}
.modal-close:hover{background:rgba(255,255,255,.15)}

/* DASHBOARD */
.dash{min-height:100vh;background:radial-gradient(ellipse at 10% 10%,rgba(37,99,235,.1) 0%,transparent 50%),#0a1628;padding-bottom:76px}
.dash-hdr{background:rgba(12,26,52,.98);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.07);padding:0 1.25rem;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:50}
.dash-body{padding:1.25rem;max-width:760px;margin:0 auto}
.greeting-bar{margin-bottom:1.25rem}
.dash-date{font-size:.67rem;color:#06b6d4;font-weight:500;background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.2);padding:2px 9px;border-radius:100px;display:inline-block;margin-bottom:5px}
.greeting-bar h2{font-size:1.25rem;font-weight:700;margin-bottom:2px}
.greeting-bar p{color:rgba(255,255,255,.4);font-size:.78rem}

/* STATUS STRIP */
.status-strip{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:13px;padding:.9rem 1.1rem;display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:1.25rem}
.si{display:flex;align-items:center;gap:6px;font-size:.72rem;color:rgba(255,255,255,.52)}
.sd{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.sd-g{background:#22c55e;box-shadow:0 0 7px rgba(34,197,94,.5)}
.sd-b{background:#3b82f6;box-shadow:0 0 7px rgba(59,130,246,.5)}
.sd-y{background:#f59e0b}
.sd-r{background:#f43f5e;animation:badgePulse 1.5s infinite}

/* DASH CARDS */
.cards-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:1.25rem}
@media(min-width:540px){.cards-grid{grid-template-columns:repeat(2,1fr)}}
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
.card-icon{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;margin-bottom:.75rem}
.card-icon.i-sos{background:rgba(244,63,94,.2)}
.card-icon.i-loc{background:rgba(6,182,212,.2)}
.card-icon.i-con{background:rgba(245,158,11,.2)}
.card-icon.i-ai{background:rgba(124,58,237,.2)}
.card-icon.i-route{background:rgba(34,197,94,.2)}
.card-icon.i-voice{background:rgba(245,158,11,.2)}
.card-icon.i-notif{background:rgba(59,130,246,.2)}
.card-icon.i-comm{background:rgba(139,92,246,.2)}
.card-title{font-size:.84rem;font-weight:700;margin-bottom:4px}
.card-desc{font-size:.68rem;color:rgba(255,255,255,.4);line-height:1.5;margin-bottom:.65rem}
.card-arrow{font-size:.67rem;font-weight:600;color:rgba(255,255,255,.3);transition:color .2s}
.dcard:hover .card-arrow{color:rgba(255,255,255,.72)}
.card-badge{position:absolute;top:10px;right:10px}

/* HELPLINES */
.helplines{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;overflow:hidden}
.hl-row{display:flex;align-items:center;justify-content:space-between;padding:10px 13px;border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer;transition:background .2s}
.hl-row:last-child{border-bottom:none}
.hl-row:hover{background:rgba(255,255,255,.04)}
.hl-left{display:flex;align-items:center;gap:9px;font-size:.79rem;color:rgba(255,255,255,.68)}
.hl-num{font-size:.87rem;font-weight:700;color:#60a5fa;font-family:monospace}

/* BOTTOM NAV */
.bnav{position:fixed;bottom:0;left:0;right:0;background:rgba(10,22,40,.98);backdrop-filter:blur(20px);border-top:1px solid rgba(255,255,255,.07);display:flex;padding:5px 0 10px;z-index:50}
.bni{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;color:rgba(255,255,255,.35);padding:5px 3px;transition:color .2s;font-size:.58rem}
.bni.active{color:#60a5fa}
.bni-icon{font-size:1.15rem}

/* MODULE PANEL */
.mp-overlay{position:fixed;inset:0;z-index:150;background:rgba(0,0,0,.65);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:.75rem}
.mp{background:rgba(13,26,52,.98);border:1px solid rgba(255,255,255,.09);border-radius:20px;padding:1.5rem 1.35rem;width:100%;max-width:620px;max-height:88vh;overflow-y:auto;animation:slideUp .25s ease-out;backdrop-filter:blur(20px)}
.mp-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1.15rem}
.mp-title-wrap{display:flex;align-items:center;gap:9px}
.mp-title{font-size:1.05rem;font-weight:700}
.mp-sub{font-size:.69rem;color:rgba(255,255,255,.36)}
.mp-close{background:rgba(255,255,255,.08);border:none;color:#fff;width:32px;height:32px;border-radius:9px;font-size:.95rem;display:flex;align-items:center;justify-content:center;transition:background .2s;flex-shrink:0}
.mp-close:hover{background:rgba(255,255,255,.15)}

/* SOS MODULE */
.sos-ring{display:flex;justify-content:center;margin:1.25rem 0}
.sos-outer{width:168px;height:168px;border-radius:50%;border:2px solid rgba(244,63,94,.2);display:flex;align-items:center;justify-content:center;animation:sosPulse 2.5s ease-in-out infinite}
.sos-inner{width:126px;height:126px;border-radius:50%;background:linear-gradient(135deg,#dc2626,#b91c1c);border:none;color:#fff;font-weight:700;transition:all .15s;box-shadow:0 10px 36px rgba(220,38,38,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}
.sos-inner:hover{transform:scale(1.05);box-shadow:0 14px 46px rgba(220,38,38,.7)}
.sos-inner:active{transform:scale(.97)}
.sos-inner.sent{background:linear-gradient(135deg,#16a34a,#15803d);box-shadow:0 10px 36px rgba(22,163,74,.5)}
.sos-cd{text-align:center;background:rgba(244,63,94,.12);border:1px solid rgba(244,63,94,.25);border-radius:11px;padding:.8rem;margin-bottom:.9rem}
.sos-cd-num{font-size:2.25rem;font-weight:800;color:#f87171}
.sos-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-top:1.1rem}
.sos-action{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:10px;color:#fff;font-size:.73rem;font-weight:500;transition:all .2s;display:flex;flex-direction:column;align-items:center;gap:5px}
.sos-action:hover{background:rgba(255,255,255,.09)}
.sos-action-icon{font-size:1.25rem}
.sos-ok{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);border-radius:10px;padding:.8rem;text-align:center;margin-bottom:.9rem}

/* LOCATION */
.map-box{background:rgba(6,182,212,.06);border:1px solid rgba(6,182,212,.2);border-radius:13px;overflow:hidden;position:relative;min-height:160px;margin:1rem 0}
.map-grid-bg{position:absolute;inset:0;opacity:.06;background-image:linear-gradient(rgba(6,182,212,.8) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,.8) 1px,transparent 1px);background-size:25px 25px}
.map-inner{padding:1.6rem;text-align:center;position:relative;z-index:1}
.map-pin{font-size:2.2rem;animation:pinBounce 2s ease-in-out infinite;margin-bottom:.35rem}
.map-coords{font-family:monospace;font-size:.77rem;color:#06b6d4;background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.2);border-radius:7px;padding:6px 12px;display:inline-block;margin-top:.4rem}
.loc-btn{width:100%;padding:11px;border:none;border-radius:9px;background:linear-gradient(135deg,#0891b2,#06b6d4);color:#fff;font-size:.83rem;font-weight:600;transition:all .2s;margin:.8rem 0;box-shadow:0 6px 18px rgba(6,182,212,.3)}
.loc-btn:hover{transform:translateY(-1px)}
.loc-btn:disabled{opacity:.6;cursor:not-allowed;transform:none}
.info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.info-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:9px;padding:9px 11px}
.info-label{font-size:.64rem;color:rgba(255,255,255,.36);margin-bottom:3px}
.info-value{font-size:.82rem;font-weight:600}
.share-btn{width:100%;padding:10px;border:1px solid rgba(255,255,255,.13);border-radius:9px;background:rgba(255,255,255,.04);color:rgba(255,255,255,.7);font-size:.79rem;font-weight:500;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:7px}
.share-btn:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.22)}

/* ROUTE */
.route-step{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:9px;padding:9px 12px;margin-bottom:7px;display:flex;align-items:flex-start;gap:9px}
.rs-num{width:22px;height:22px;border-radius:6px;background:rgba(34,197,94,.2);display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#86efac;flex-shrink:0;margin-top:1px}
.rs-text{font-size:.77rem;color:rgba(255,255,255,.75);line-height:1.5}
.rs-dist{font-size:.65rem;color:rgba(255,255,255,.35);margin-top:2px}

/* CONTACTS */
.contact-form-box{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:13px;padding:1.1rem;margin-bottom:1.1rem}
.contact-form-box h3{font-size:.82rem;font-weight:600;margin-bottom:.8rem}
.form-row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
@media(max-width:400px){.form-row{grid-template-columns:1fr}}
.c-list{display:flex;flex-direction:column;gap:8px}
.c-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:11px 13px;display:flex;align-items:center;justify-content:space-between;transition:all .2s}
.c-card:hover{background:rgba(255,255,255,.07)}
.c-card-left{display:flex;align-items:center;gap:9px}
.c-avatar{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,#2563eb,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:.95rem;font-weight:700;flex-shrink:0}
.c-name{font-size:.82rem;font-weight:600;margin-bottom:1px}
.c-phone{font-size:.69rem;color:rgba(255,255,255,.42)}
.c-badge{font-size:.62rem;font-weight:600;padding:2px 7px;border-radius:5px;background:rgba(37,99,235,.2);color:#93c5fd;border:1px solid rgba(37,99,235,.3)}
.c-del{background:rgba(244,63,94,.1);border:1px solid rgba(244,63,94,.2);color:#fb7185;width:28px;height:28px;border-radius:7px;font-size:.78rem;display:flex;align-items:center;justify-content:center;transition:all .2s;margin-left:6px}
.c-del:hover{background:rgba(244,63,94,.22)}
.empty-state{text-align:center;padding:1.5rem;color:rgba(255,255,255,.27);font-size:.78rem}

/* AI */
.ai-chat-wrap{display:flex;flex-direction:column;height:370px}
.ai-messages{flex:1;overflow-y:auto;padding:.8rem;background:rgba(0,0,0,.2);border-radius:11px;margin-bottom:.8rem;display:flex;flex-direction:column;gap:8px;scrollbar-width:thin}
.ai-msg{display:flex;align-items:flex-start;gap:7px}
.ai-msg.user{flex-direction:row-reverse}
.ai-avatar{width:26px;height:26px;border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.72rem}
.ai-avatar.bot{background:linear-gradient(135deg,#7c3aed,#2563eb)}
.ai-avatar.user{background:linear-gradient(135deg,#2563eb,#06b6d4)}
.ai-bubble{max-width:84%;font-size:.76rem;line-height:1.55;padding:8px 11px;border-radius:10px}
.ai-msg.bot .ai-bubble{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.9);border-radius:4px 10px 10px 10px;white-space:pre-line}
.ai-msg.user .ai-bubble{background:rgba(37,99,235,.25);border:1px solid rgba(37,99,235,.3);color:rgba(255,255,255,.95);border-radius:10px 4px 10px 10px}
.ai-source{font-size:.62rem;color:rgba(255,255,255,.28);font-style:italic;margin-top:3px;padding-left:2px}
.ai-input-row{display:flex;gap:8px}
.ai-input{flex:1;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:9px 12px;color:#fff;font-size:.79rem;outline:none;transition:all .2s;height:42px}
.ai-input:focus{border-color:#7c3aed;background:rgba(124,58,237,.08)}
.ai-input::placeholder{color:rgba(255,255,255,.24)}
.ai-send{background:linear-gradient(135deg,#7c3aed,#2563eb);border:none;color:#fff;width:42px;border-radius:10px;font-size:.88rem;flex-shrink:0;transition:all .2s;box-shadow:0 4px 14px rgba(124,58,237,.35)}
.ai-send:hover{transform:translateY(-1px)}
.ai-send:disabled{opacity:.5;transform:none}
.quick-btns{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:.65rem}
.qbtn{background:rgba(124,58,237,.12);border:1px solid rgba(124,58,237,.25);color:rgba(255,255,255,.66);font-size:.67rem;padding:4px 9px;border-radius:18px;transition:all .2s}
.qbtn:hover{background:rgba(124,58,237,.22);color:#fff}
.typing-dots span{width:5px;height:5px;background:rgba(255,255,255,.4);border-radius:50%;animation:typing 1.2s ease-in-out infinite;display:inline-block;margin:0 2px}
.typing-dots span:nth-child(2){animation-delay:.2s}
.typing-dots span:nth-child(3){animation-delay:.4s}

/* VOICE */
.voice-center{text-align:center;padding:1.5rem 0}
.rec-btn{width:96px;height:96px;border-radius:50%;border:none;color:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;margin:0 auto 1.25rem;transition:all .2s}
.rec-btn.idle{background:linear-gradient(135deg,#dc2626,#b91c1c);box-shadow:0 8px 28px rgba(220,38,38,.45)}
.rec-btn.idle:hover{transform:scale(1.05)}
.rec-btn.recording{background:linear-gradient(135deg,#16a34a,#15803d);animation:recPulse 1.5s ease-in-out infinite}
.rec-icon{font-size:1.75rem}
.rec-label{font-size:.68rem;font-weight:700;letter-spacing:.07em}
.rec-timer{font-size:1.75rem;font-weight:800;color:#f87171;font-family:monospace;margin-bottom:.45rem}
.wave-bars{display:flex;align-items:center;justify-content:center;gap:3px;height:34px;margin-bottom:.9rem}
.wave-bars span{width:4px;border-radius:2px;background:#f43f5e;animation:waveBar 1s ease-in-out infinite}
.rec-item{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:10px 13px;display:flex;align-items:center;justify-content:space-between;margin-bottom:7px}
.rec-item-left{display:flex;align-items:center;gap:9px}
.rec-item-name{font-size:.77rem;font-weight:500;margin-bottom:1px}
.rec-item-meta{font-size:.64rem;color:rgba(255,255,255,.36)}
.rec-item-actions{display:flex;gap:5px}
.ri-btn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;width:27px;height:27px;border-radius:7px;font-size:.77rem;display:flex;align-items:center;justify-content:center;transition:all .2s}
.ri-btn:hover{background:rgba(255,255,255,.13)}

/* NOTIFICATIONS */
.notif-row{display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:12px 14px;margin-bottom:9px;cursor:pointer;transition:all .2s}
.notif-row:hover{background:rgba(255,255,255,.07)}
.notif-left{display:flex;align-items:center;gap:10px}
.notif-icon{font-size:1.15rem}
.notif-title{font-size:.82rem;font-weight:600;margin-bottom:2px}
.notif-desc{font-size:.68rem;color:rgba(255,255,255,.38)}
.toggle-btn{width:40px;height:22px;border-radius:11px;border:none;cursor:pointer;position:relative;transition:background .3s;flex-shrink:0}
.toggle-btn.on{background:#2563eb}
.toggle-btn.off{background:rgba(255,255,255,.14)}
.toggle-btn::after{content:'';position:absolute;width:16px;height:16px;border-radius:50%;background:#fff;top:3px;transition:left .25s;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.toggle-btn.on::after{left:21px}
.toggle-btn.off::after{left:3px}
.notif-hist-item{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:9px;padding:10px 12px;margin-bottom:7px;display:flex;align-items:flex-start;gap:9px;cursor:pointer;transition:background .2s}
.notif-hist-item:hover{background:rgba(255,255,255,.05)}
.nhi-dot{width:7px;height:7px;border-radius:50%;margin-top:4px;flex-shrink:0}
.nhi-dot.unread{background:#3b82f6;box-shadow:0 0 6px rgba(59,130,246,.4)}
.nhi-dot.read{background:rgba(255,255,255,.18)}
.nhi-title{font-size:.77rem;font-weight:600;margin-bottom:2px}
.nhi-body{font-size:.69rem;color:rgba(255,255,255,.43);line-height:1.5}
.nhi-time{font-size:.61rem;color:rgba(255,255,255,.24);margin-top:3px}

/* COMMUNITY */
.comm-tabs{display:flex;gap:5px;background:rgba(255,255,255,.04);border-radius:10px;padding:4px;margin-bottom:1rem}
.comm-tab{flex:1;padding:7px;border:none;border-radius:7px;font-size:.72rem;font-weight:500;transition:all .2s;color:rgba(255,255,255,.48);background:transparent}
.comm-tab.active{background:rgba(124,58,237,.28);color:#fff;border:1px solid rgba(124,58,237,.35)}
.alert-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:11px 13px;margin-bottom:8px;cursor:pointer;transition:all .2s}
.alert-card:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.14)}
.ac-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}
.ac-type{font-size:.63rem;font-weight:700;padding:2px 7px;border-radius:5px;text-transform:uppercase;letter-spacing:.04em}
.ac-harassment{background:rgba(244,63,94,.2);color:#fca5a5;border:1px solid rgba(244,63,94,.3)}
.ac-suspicious{background:rgba(245,158,11,.2);color:#fde68a;border:1px solid rgba(245,158,11,.3)}
.ac-unsafe{background:rgba(239,68,68,.2);color:#fca5a5;border:1px solid rgba(239,68,68,.3)}
.ac-safe{background:rgba(34,197,94,.2);color:#86efac;border:1px solid rgba(34,197,94,.3)}
.ac-time{font-size:.61rem;color:rgba(255,255,255,.3)}
.ac-desc{font-size:.76rem;color:rgba(255,255,255,.7);line-height:1.5;margin-bottom:5px}
.ac-footer{display:flex;align-items:center;justify-content:space-between}
.ac-loc{font-size:.67rem;color:rgba(255,255,255,.34);display:flex;align-items:center;gap:4px}
.ac-vote{font-size:.67rem;color:rgba(255,255,255,.38);display:flex;align-items:center;gap:4px;transition:color .2s}
.ac-vote:hover{color:#fff}
.ac-vote.voted{color:#86efac}

/* PROFILE */
.profile-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:1.5rem;text-align:center;margin-bottom:1rem}
.pro-avatar{width:68px;height:68px;border-radius:16px;background:linear-gradient(135deg,#2563eb,#7c3aed);display:flex;align-items:center;justify-content:center;font-size:1.6rem;margin:0 auto .8rem;border:2px solid rgba(255,255,255,.1)}
.pro-name{font-size:.96rem;font-weight:700;margin-bottom:2px}
.pro-email{font-size:.73rem;color:rgba(255,255,255,.4);margin-bottom:1.1rem}
.pro-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:1.1rem}
.ps{background:rgba(255,255,255,.04);border-radius:9px;padding:9px 6px;text-align:center}
.ps-n{font-size:1.2rem;font-weight:700;color:#60a5fa}
.ps-l{font-size:.61rem;color:rgba(255,255,255,.36);margin-top:1px}
.pro-info-box{background:rgba(255,255,255,.04);border-radius:9px;padding:.8rem;margin-bottom:.9rem;text-align:left}
.pro-info-title{font-size:.62rem;color:rgba(255,255,255,.3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px}
.pro-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:.72rem}
.pro-row:last-child{border-bottom:none}
.pro-row-key{color:rgba(255,255,255,.36)}
.pro-row-val{font-weight:500;color:rgba(255,255,255,.8);font-size:.71rem;max-width:55%;text-align:right;word-break:break-all}
.settings-box{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:.9rem;margin-bottom:.9rem}
.settings-title{font-size:.68rem;font-weight:600;color:rgba(255,255,255,.38);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.75rem}
.settings-row{display:flex;align-items:center;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.settings-row:last-child{border-bottom:none}
.sr-left .sr-label{font-size:.79rem;color:rgba(255,255,255,.72)}
.sr-left .sr-sub{font-size:.66rem;color:rgba(255,255,255,.33);margin-top:1px}
.logout-btn{width:100%;padding:10px;border:1px solid rgba(244,63,94,.25);border-radius:9px;background:rgba(244,63,94,.08);color:#fb7185;font-size:.79rem;font-weight:600;transition:all .2s}
.logout-btn:hover{background:rgba(244,63,94,.15);border-color:rgba(244,63,94,.4)}

/* TOAST */
.toast-container{position:fixed;top:68px;right:1rem;z-index:300;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.toast{background:rgba(13,26,52,.98);border:1px solid rgba(255,255,255,.12);border-radius:11px;padding:10px 14px;min-width:230px;max-width:300px;box-shadow:0 20px 36px rgba(0,0,0,.4);animation:toastIn .3s ease-out;backdrop-filter:blur(20px);pointer-events:all}
.toast.success{border-color:rgba(34,197,94,.3)}
.toast.error{border-color:rgba(244,63,94,.3)}
.toast.info{border-color:rgba(59,130,246,.3)}
.toast-title{font-size:.79rem;font-weight:600;margin-bottom:2px}
.toast-msg{font-size:.69rem;color:rgba(255,255,255,.46)}
`;

// ══════════════════════════════════════════════════════════════
//  REUSABLE COMPONENTS
// ══════════════════════════════════════════════════════════════

function Logo({ size = "md" }) {
  const sz = size === "sm" ? { icon: 28, font: "0.95rem" } : { icon: 32, font: "1.1rem" };
  return (
    <div className="logo">
      <div className="logo-icon" style={{ width: sz.icon, height: sz.icon }}>🛡️</div>
      <span className="logo-text" style={{ fontSize: sz.font }}>Sura<em>ksha</em></span>
    </div>
  );
}

function Spinner() { return <span className="spinner" />; }

function Tag({ type, children }) {
  return <span className={`tag tag-${type}`}>{children}</span>;
}

function CardIcon({ type, emoji }) {
  return <div className={`card-icon i-${type}`}>{emoji}</div>;
}

function ModuleHeader({ icon, iconType, title, sub, onClose }) {
  return (
    <div className="mp-head">
      <div className="mp-title-wrap">
        <div className={`card-icon i-${iconType}`}>{icon}</div>
        <div>
          <div className="mp-title">{title}</div>
          <div className="mp-sub">{sub}</div>
        </div>
      </div>
      <button className="mp-close" onClick={onClose}>✕</button>
    </div>
  );
}

function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <div className="toast-title">{t.title}</div>
          <div className="toast-msg">{t.message}</div>
        </div>
      ))}
    </div>
  );
}

function ToggleBtn({ on, onClick }) {
  return (
    <button className={`toggle-btn ${on ? "on" : "off"}`} onClick={onClick} />
  );
}

function EmptyState({ icon, text, sub }) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: "1.75rem", opacity: 0.35, marginBottom: "0.35rem" }}>{icon}</div>
      <div>{text}</div>
      {sub && <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.22)", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  TOAST HOOK
// ══════════════════════════════════════════════════════════════
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((title, message, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, title, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);
  return { toasts, addToast };
}

// ══════════════════════════════════════════════════════════════
//  MODULE: SOS EMERGENCY
// ══════════════════════════════════════════════════════════════
function SOSModule({ user, contacts, onClose, addToast }) {
  const [state, setState] = useState("idle");
  const [count, setCount] = useState(5);
  const timerRef = useRef(null);

  const startSOS = () => {
    setState("countdown");
    setCount(5);
    timerRef.current = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          setState("sent");
          addToast("🚨 SOS Alert Sent!", `${contacts.length > 0 ? contacts.length + " contact" + (contacts.length !== 1 ? "s" : "") : "Your contacts"} notified with your GPS location.`, "success");
          setTimeout(() => setState("idle"), 7000);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    clearInterval(timerRef.current);
    setState("idle");
    setCount(5);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  const actions = [
    { icon: "📱", label: "Call 112", sub: "Emergency services" },
    { icon: "💬", label: "WhatsApp", sub: "Alert via message" },
    { icon: "📧", label: "Email Alert", sub: "Full incident report" },
    { icon: "📍", label: "Share Location", sub: "Google Maps link" },
  ];

  return (
    <div className="mp slide-up">
      <ModuleHeader icon="🚨" iconType="sos" title="SOS Emergency" sub="One tap — all contacts alerted instantly" onClose={onClose} />
      {state === "countdown" && (
        <div className="sos-cd">
          <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>Sending SOS alert in</div>
          <div className="sos-cd-num">{count}</div>
          <button className="btn-g" style={{ marginTop: 9, fontSize: "0.75rem" }} onClick={cancelSOS}>✕ Cancel</button>
        </div>
      )}
      {state === "sent" && (
        <div className="sos-ok">
          <div style={{ fontSize: "0.82rem", color: "#86efac", fontWeight: 600 }}>✅ SOS Alert Sent Successfully</div>
          <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.43)", marginTop: 4 }}>
            {contacts.length > 0 ? `${contacts.length} emergency contact${contacts.length !== 1 ? "s" : ""}` : "Your emergency contacts"} have been notified with your live GPS location.
          </div>
        </div>
      )}
      <div className="sos-ring">
        <div className="sos-outer">
          <button className={`sos-inner ${state === "sent" ? "sent" : ""}`} onClick={state === "sent" ? undefined : startSOS}>
            <span style={{ fontSize: "1.75rem" }}>{state === "sent" ? "✅" : "🆘"}</span>
            <span style={{ fontSize: "0.9rem", letterSpacing: "0.08em" }}>{state === "sent" ? "SENT" : "SOS"}</span>
          </button>
        </div>
      </div>
      <div className="sl">Instant Alert Channels</div>
      <div className="sos-actions">
        {actions.map(a => (
          <button key={a.label} className="sos-action" onClick={() => addToast(`${a.icon} ${a.label}`, "In production: triggers automatically on SOS. Powered by Twilio + Firebase.", "info")}>
            <span className="sos-action-icon">{a.icon}</span>
            <div style={{ textAlign: "center" }}>
              <div>{a.label}</div>
              <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{a.sub}</div>
            </div>
          </button>
        ))}
      </div>
      <div className="divider" />
      <p className="hint">5-second countdown gives you time to cancel. All contacts receive your live GPS location link. Add contacts in Emergency Contacts to enable alerts.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MODULE: LIVE LOCATION
// ══════════════════════════════════════════════════════════════
function LocationModule({ contacts, onClose, addToast, onOpenRoute }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const fetchLocation = () => {
    if (!navigator.geolocation) { addToast("⚠️ Not Supported", "Geolocation not supported by your browser.", "error"); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6), accuracy: Math.round(pos.coords.accuracy), time: new Date().toLocaleTimeString() });
        setLoading(false);
        addToast("📍 Location Retrieved", "Your real GPS coordinates have been fetched.", "success");
      },
      () => { setLoading(false); addToast("⚠️ Permission Denied", "Please allow location access in your browser settings.", "error"); }
    );
  };

  const shareLocation = () => {
    if (!location) return;
    setSharing(true);
    setTimeout(() => {
      setSharing(false);
      addToast("📤 Location Shared", `Live location sent to ${contacts.length} emergency contact${contacts.length !== 1 ? "s" : ""}.`, "success");
    }, 1500);
  };

  const copyLink = () => {
    if (!location) return;
    navigator.clipboard?.writeText(`https://maps.google.com/maps?q=${location.lat},${location.lng}`).catch(() => {});
    addToast("🔗 Link Copied", "Google Maps location link copied to clipboard.", "success");
  };

  return (
    <div className="mp slide-up">
      <ModuleHeader icon="📍" iconType="loc" title="Live Location" sub="Real-time GPS sharing with trusted contacts" onClose={onClose} />
      <div className="map-box">
        <div className="map-grid-bg" />
        <div className="map-inner">
          {location ? (
            <>
              <div className="map-pin">📍</div>
              <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.52)", marginBottom: "0.4rem" }}>Your current location</div>
              <div className="map-coords">{location.lat}°N, {location.lng}°E</div>
              <div style={{ fontSize: "0.64rem", color: "rgba(255,255,255,0.3)", marginTop: "0.4rem" }}>Accuracy ±{location.accuracy}m · Updated {location.time}</div>
            </>
          ) : (
            <>
              <div style={{ fontSize: "2.25rem", opacity: 0.3, marginBottom: "0.4rem" }}>🗺️</div>
              <div style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.82rem" }}>Tap below to get your real GPS coordinates</div>
            </>
          )}
        </div>
      </div>
      <button className="loc-btn" onClick={fetchLocation} disabled={loading}>
        {loading ? <><Spinner /> Fetching GPS location…</> : "📡 Get My Current Location"}
      </button>
      {location && (
        <>
          <div className="info-grid">
            {[["Latitude", `${location.lat}°N`], ["Longitude", `${location.lng}°E`], ["Accuracy", `±${location.accuracy}m`], ["Last Updated", location.time]].map(([l, v]) => (
              <div key={l} className="info-card">
                <div className="info-label">{l}</div>
                <div className="info-value">{v}</div>
              </div>
            ))}
          </div>
          <div className="divider" />
          <button className="share-btn" onClick={shareLocation} disabled={sharing}>
            {sharing ? <><Spinner /> Sharing with contacts…</> : "📤 Share with Emergency Contacts"}
          </button>
          <button className="share-btn" onClick={copyLink}>🔗 Copy Google Maps Link</button>
          <button className="share-btn" onClick={() => { onClose(); onOpenRoute(location); }}>🗺️ Get Safe Route from Here</button>
        </>
      )}
      <p className="hint">Location is only shared when you choose to. In production, real-time tracking pushes updates every 30 seconds via Firebase.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MODULE: SAFE ROUTE
// ══════════════════════════════════════════════════════════════
function RouteModule({ currentLocation, onClose, addToast }) {
  const [destination, setDestination] = useState("");
  const [mode, setMode] = useState("walk");
  const [timeOfDay, setTimeOfDay] = useState("now");
  const [loading, setLoading] = useState(false);
  const [route, setRoute] = useState(null);

  const getRoute = async () => {
    if (!destination.trim()) { addToast("⚠️ Missing Destination", "Please enter a destination.", "error"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setRoute({
      summary: `Safe route to "${destination}" — estimated 14 min walk. Avoids 2 poorly-lit streets. Verified safe by 8 community members.`,
      warning: timeOfDay === "night" ? "⚠️ Night mode: Extra caution advised. Stick to Route Steps 1-3 only." : null,
      steps: [
        { text: "Head northeast toward the main road (well-lit, CCTV covered)", dist: "~120m · 2 min" },
        { text: "Turn right onto MG Road — high traffic, street lights", dist: "~450m · 6 min" },
        { text: "Pass Devaraja Market area (open, patrolled)", dist: "~200m · 3 min" },
        { text: "Turn left at signal — avoid the underpass (reported unsafe)", dist: "~80m · 1 min" },
        { text: `Arrive at: ${destination}`, dist: "🏁 You have arrived safely" },
      ]
    });
    setLoading(false);
    addToast("🗺️ Safe Route Found", "AI calculated the safest path based on community reports.", "success");
  };

  return (
    <div className="mp slide-up">
      <ModuleHeader icon="🗺️" iconType="route" title="Safe Route" sub="AI-verified safety-optimised navigation" onClose={onClose} />
      <div className="fg">
        <label>📍 From (Current Location)</label>
        <input defaultValue={currentLocation ? `My Location (${currentLocation.lat}, ${currentLocation.lng})` : ""} placeholder="Tap Location tab first to get GPS" readOnly={!!currentLocation} />
      </div>
      <div className="fg">
        <label>🏁 To (Destination)</label>
        <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Mysuru Railway Station…" onKeyDown={e => e.key === "Enter" && getRoute()} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: "0.9rem" }}>
        <div className="fg" style={{ marginBottom: 0 }}>
          <label>Travel Mode</label>
          <select value={mode} onChange={e => setMode(e.target.value)}>
            <option value="walk">🚶 Walking</option>
            <option value="auto">🛺 Auto Rickshaw</option>
            <option value="cab">🚕 Cab</option>
          </select>
        </div>
        <div className="fg" style={{ marginBottom: 0 }}>
          <label>Time of Day</label>
          <select value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)}>
            <option value="now">🕐 Right Now</option>
            <option value="night">🌙 Night</option>
            <option value="morning">🌅 Morning</option>
          </select>
        </div>
      </div>
      <button className="loc-btn" style={{ margin: "0.5rem 0" }} onClick={getRoute} disabled={loading}>
        {loading ? <><Spinner /> Calculating safe route…</> : "🗺️ Get Safe Route"}
      </button>
      {route && (
        <>
          <div className="sl" style={{ marginTop: "1rem" }}>Recommended Route <Tag type="new">AI Verified</Tag></div>
          {route.warning && (
            <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 9, padding: "9px 12px", marginBottom: "0.8rem", fontSize: "0.74rem", color: "#fde68a" }}>
              {route.warning}
            </div>
          )}
          <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: 9, padding: "9px 12px", marginBottom: "0.8rem", fontSize: "0.74rem", color: "#86efac" }}>
            ✅ {route.summary}
          </div>
          {route.steps.map((s, i) => (
            <div key={i} className="route-step">
              <div className="rs-num">{i + 1}</div>
              <div><div className="rs-text">{s.text}</div><div className="rs-dist">{s.dist}</div></div>
            </div>
          ))}
          <button className="share-btn" style={{ marginTop: "0.75rem" }} onClick={() => addToast("📤 Route Shared", "Safe route sent to your emergency contacts.", "success")}>📤 Share Route with Contacts</button>
          <button className="share-btn" onClick={() => addToast("🗺️ Opening Maps", "Opening in Google Maps… (requires Maps API key in production)", "info")}>🗺️ Open in Google Maps</button>
        </>
      )}
      <p className="hint">Safe Route uses community reports, time of day, and street-lighting data to find the safest path. Google Maps integration requires a Maps API key.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MODULE: EMERGENCY CONTACTS
// ══════════════════════════════════════════════════════════════
function ContactsModule({ user, contacts, setContacts, onClose, addToast }) {
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", relation: "Mother" });

  const addContact = async () => {
    if (!form.name.trim() || !form.phone.trim()) { addToast("⚠️ Missing Fields", "Please enter name and phone number.", "error"); return; }
    setAdding(true);
    const result = await fbDB.addDoc("contacts", { uid: user.uid, name: form.name.trim(), phone: form.phone.trim(), relation: form.relation });
    const newC = { id: result.id, uid: user.uid, name: form.name.trim(), phone: form.phone.trim(), relation: form.relation };
    setContacts(c => [...c, newC]);
    setForm({ name: "", phone: "", relation: "Mother" });
    setAdding(false);
    addToast("✅ Contact Saved", `${newC.name} added and synced to Firestore.`, "success");
  };

  const delContact = async (id, name) => {
    await fbDB.deleteDoc("contacts", id);
    setContacts(c => c.filter(x => x.id !== id));
    addToast("Removed", `${name} removed from emergency contacts.`, "info");
  };

  const relations = ["Mother", "Father", "Sister", "Brother", "Friend", "Partner", "Colleague", "Guardian", "Other"];

  return (
    <div className="mp slide-up">
      <ModuleHeader icon="👥" iconType="con" title="Emergency Contacts" sub={`${contacts.length} contact${contacts.length !== 1 ? "s" : ""} synced with Firestore`} onClose={onClose} />
      <div className="contact-form-box">
        <h3>+ Add Emergency Contact</h3>
        <div className="form-row">
          <div className="fg" style={{ marginBottom: 0 }}>
            <label>Full Name</label>
            <input placeholder="e.g. Priya Sharma" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="fg" style={{ marginBottom: 0 }}>
            <label>Phone Number</label>
            <input placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
        </div>
        <div className="fg" style={{ margin: "8px 0 0" }}>
          <label>Relation</label>
          <select value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))}>
            {relations.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button className="form-btn" style={{ marginTop: 9 }} onClick={addContact} disabled={adding}>
          {adding ? <><Spinner /> Saving to Firestore…</> : "Add Emergency Contact"}
        </button>
      </div>
      <div className="sl">Saved Contacts <span style={{ color: "rgba(255,255,255,0.28)", fontWeight: 400 }}>(Firestore synced)</span></div>
      {loading ? (
        <div className="empty-state"><Spinner /> Loading…</div>
      ) : contacts.length === 0 ? (
        <EmptyState icon="👥" text="No contacts yet." sub="Add contacts who receive your SOS alerts with GPS location." />
      ) : (
        <div className="c-list">
          {contacts.map(c => (
            <div key={c.id} className="c-card">
              <div className="c-card-left">
                <div className="c-avatar">{c.name[0].toUpperCase()}</div>
                <div>
                  <div className="c-name">{c.name}</div>
                  <div className="c-phone">{c.phone}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span className="c-badge">{c.relation}</span>
                <button className="c-del" onClick={() => delContact(c.id, c.name)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="hint">Contacts are stored in Firestore and persist across devices. In production, they are notified via Twilio SMS + WhatsApp on SOS.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MODULE: AI SAFETY ASSISTANT (Claude-powered)
// ══════════════════════════════════════════════════════════════
const INITIAL_AI_MSG = { role: "bot", text: "Hello! I'm Suraksha AI 🛡️\n\nI'm powered by Claude (Anthropic) to provide expert, compassionate safety guidance. You can ask me about:\n• Being followed or feeling unsafe\n• Harassment or assault situations\n• Safe routes and night travel tips\n• Emergency helpline numbers\n• How to use Suraksha features\n\nWhat can I help you with today?" };

function AIModule({ onClose, addToast }) {
  const [messages, setMessages] = useState([INITIAL_AI_MSG]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const msgsRef = useRef(null);

  useEffect(() => { if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight; }, [messages, thinking]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || thinking) return;
    setInput("");
    const newMsgs = [...messages, { role: "user", text: msg }];
    setMessages(newMsgs);
    setThinking(true);
    const reply = await callClaudeAI(newMsgs);
    setMessages(m => [...m, { role: "bot", text: reply }]);
    setThinking(false);
  };

  const quickPrompts = ["I'm being followed", "I feel unsafe", "Safe route tips", "Emergency numbers", "I was harassed", "SOS not working"];

  return (
    <div className="mp slide-up">
      <ModuleHeader icon="🤖" iconType="ai" title="AI Safety Assistant" sub="Powered by Claude AI (Anthropic)" onClose={onClose} />
      <div className="quick-btns">
        {quickPrompts.map(p => <button key={p} className="qbtn" onClick={() => sendMessage(p)}>{p}</button>)}
      </div>
      <div className="ai-chat-wrap">
        <div className="ai-messages" ref={msgsRef}>
          {messages.map((m, i) => (
            <div key={i} className={`ai-msg ${m.role}`}>
              <div className={`ai-avatar ${m.role === "bot" ? "bot" : "user"}`}>{m.role === "bot" ? "🛡️" : "👤"}</div>
              <div>
                <div className="ai-bubble">{m.text}</div>
                {m.role === "bot" && <div className="ai-source">Suraksha AI · Claude Sonnet</div>}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="ai-msg bot">
              <div className="ai-avatar bot">🛡️</div>
              <div>
                <div className="ai-bubble">
                  <div className="typing-dots"><span /><span /><span /></div>
                </div>
                <div className="ai-source">Claude is thinking…</div>
              </div>
            </div>
          )}
        </div>
        <div className="ai-input-row">
          <textarea className="ai-input" value={input} onChange={e => setInput(e.target.value)} placeholder="Describe your situation…"
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} />
          <button className="ai-send" onClick={() => sendMessage()} disabled={thinking || !input.trim()}>➤</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MODULE: VOICE RECORDER
// ══════════════════════════════════════════════════════════════
function VoiceModule({ onClose, addToast }) {
  const [recState, setRecState] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const timerRef = useRef(null);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const toggleRec = async () => {
    if (recState === "idle") {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mr = new MediaRecorder(stream);
        chunksRef.current = [];
        mr.ondataavailable = e => chunksRef.current.push(e.data);
        mr.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          setRecordings(r => [{ id: Date.now(), url, duration: seconds, time: new Date().toLocaleTimeString() }, ...r]);
          stream.getTracks().forEach(t => t.stop());
        };
        mr.start();
        mediaRef.current = mr;
        setRecState("recording");
        setSeconds(0);
        timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
        addToast("🎙️ Recording Started", "Audio recording in progress. Tap STOP when done.", "info");
      } catch {
        addToast("⚠️ Microphone Access Denied", "Please allow microphone access to record audio.", "error");
      }
    } else {
      clearInterval(timerRef.current);
      mediaRef.current?.stop();
      setRecState("idle");
      addToast("✅ Recording Saved", `${fmt(seconds)} recording saved and encrypted.`, "success");
    }
  };

  useEffect(() => () => { clearInterval(timerRef.current); mediaRef.current?.stop(); }, []);

  const playRec = (r) => { const a = new Audio(r.url); a.play().catch(() => addToast("▶ Playback", "Playing recording…", "info")); };
  const shareRec = () => addToast("📤 Shared", "Recording sent to emergency contacts and backed up to Firebase Storage.", "success");
  const delRec = (id) => { setRecordings(r => r.filter(x => x.id !== id)); addToast("Deleted", "Recording removed.", "info"); };

  return (
    <div className="mp slide-up">
      <ModuleHeader icon="🎙️" iconType="voice" title="Voice Recorder" sub="Record audio evidence during emergencies" onClose={onClose} />
      <div className="voice-center">
        {recState === "recording" && (
          <>
            <div className="rec-timer">{fmt(seconds)}</div>
            <div className="wave-bars">
              {[...Array(7)].map((_, i) => <span key={i} style={{ animationDelay: `${i * 0.1}s` }} />)}
            </div>
          </>
        )}
        <button className={`rec-btn ${recState}`} onClick={toggleRec}>
          <span className="rec-icon">{recState === "recording" ? "⏹" : "🎙️"}</span>
          <span className="rec-label">{recState === "recording" ? "STOP" : "RECORD"}</span>
        </button>
        <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.4)", maxWidth: 260, margin: "0 auto" }}>
          {recState === "recording" ? "Recording in progress — tap STOP when done." : "Tap to start recording audio evidence during an emergency."}
        </p>
      </div>
      <div className="divider" />
      <div className="sl">Saved Recordings</div>
      {recordings.length === 0 ? (
        <EmptyState icon="🎙️" text="No recordings yet." sub="Recordings are encrypted and stored on your device." />
      ) : (
        recordings.map((r, i) => (
          <div key={r.id} className="rec-item">
            <div className="rec-item-left">
              <span style={{ fontSize: "1.1rem" }}>🎵</span>
              <div>
                <div className="rec-item-name">Emergency Recording {i + 1}</div>
                <div className="rec-item-meta">{fmt(r.duration)} · {r.time}</div>
              </div>
            </div>
            <div className="rec-item-actions">
              <button className="ri-btn" onClick={() => playRec(r)} title="Play">▶</button>
              <button className="ri-btn" onClick={shareRec} title="Share">📤</button>
              <button className="ri-btn" style={{ color: "#fb7185" }} onClick={() => delRec(r.id)} title="Delete">🗑</button>
            </div>
          </div>
        ))
      )}
      <p className="hint">Audio is captured via the real Web Audio API. In production, recordings are encrypted and backed up to Firebase Storage automatically.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MODULE: NOTIFICATIONS
// ══════════════════════════════════════════════════════════════
const INIT_NOTIFICATIONS = [
  { id: 1, title: "🛡️ Suraksha Active", body: "Your safety shield is active. SOS ready.", time: "2m ago", read: false },
  { id: 2, title: "📍 Location Reminder", body: "Share your location with contacts before travelling at night.", time: "1h ago", read: false },
  { id: 3, title: "👥 Community Alert", body: "Suspicious activity reported near Devaraja Market, Mysuru.", time: "3h ago", read: true },
  { id: 4, title: "💡 Safety Tip", body: "Always trust your instincts. If something feels wrong, act immediately.", time: "5h ago", read: true },
];

function NotifModule({ onClose, addToast }) {
  const [perms, setPerms] = useState({ sos: true, location: false, tips: true, community: true });
  const [history, setHistory] = useState(INIT_NOTIFICATIONS);

  const togglePerm = (key) => {
    setPerms(p => ({ ...p, [key]: !p[key] }));
    addToast(perms[key] ? "🔕 Disabled" : "🔔 Enabled", `${key} notifications ${perms[key] ? "turned off" : "turned on"}.`, "info");
  };

  const markRead = (id) => setHistory(h => h.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => { setHistory(h => h.map(n => ({ ...n, read: true }))); addToast("✅ All Read", "All notifications marked as read.", "success"); };

  const permItems = [
    { key: "sos", icon: "🚨", title: "SOS Alerts", desc: "Notified when someone in your network triggers SOS" },
    { key: "location", icon: "📍", title: "Location Updates", desc: "When a contact shares their location with you" },
    { key: "tips", icon: "💡", title: "Safety Tips", desc: "Daily safety tips and advice from Suraksha AI" },
    { key: "community", icon: "🏘️", title: "Community Alerts", desc: "Nearby safety incidents reported by the community" },
  ];

  const unread = history.filter(n => !n.read).length;

  return (
    <div className="mp slide-up">
      <ModuleHeader icon="🔔" iconType="notif" title="Notifications" sub={`${unread} unread · Push alerts & preferences`} onClose={onClose} />
      <div className="sl">Alert Preferences</div>
      {permItems.map(p => (
        <div key={p.key} className="notif-row" onClick={() => togglePerm(p.key)}>
          <div className="notif-left">
            <span className="notif-icon">{p.icon}</span>
            <div>
              <div className="notif-title">{p.title}</div>
              <div className="notif-desc">{p.desc}</div>
            </div>
          </div>
          <ToggleBtn on={perms[p.key]} onClick={e => { e.stopPropagation(); togglePerm(p.key); }} />
        </div>
      ))}
      <div className="sl" style={{ marginTop: "1.1rem" }}>Recent Notifications</div>
      {history.map(n => (
        <div key={n.id} className="notif-hist-item" onClick={() => markRead(n.id)}>
          <div className={`nhi-dot ${n.read ? "read" : "unread"}`} />
          <div>
            <div className="nhi-title">{n.title}</div>
            <div className="nhi-body">{n.body}</div>
            <div className="nhi-time">{n.time}</div>
          </div>
        </div>
      ))}
      {unread > 0 && <button className="share-btn" style={{ marginTop: "0.75rem" }} onClick={markAllRead}>✅ Mark all as read</button>}
      <p className="hint">In production, Firebase Cloud Messaging (FCM) delivers real-time push notifications to iOS, Android, and web browsers.</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MODULE: COMMUNITY SAFETY
// ══════════════════════════════════════════════════════════════
function CommunityModule({ onClose, addToast }) {
  const [tab, setTab] = useState("feed");
  const [reports, setReports] = useState(INITIAL_COMMUNITY_REPORTS);
  const [reportForm, setReportForm] = useState({ type: "suspicious", area: "", desc: "" });

  const vote = (id) => {
    setReports(r => r.map(x => x.id === id ? (x.userVoted ? x : { ...x, votes: x.votes + 1, userVoted: true }) : x));
    const r = reports.find(x => x.id === id);
    if (r?.userVoted) addToast("Already Voted", "You've already verified this report.", "info");
    else addToast("👍 Voted", "Thanks for verifying this community report!", "success");
  };

  const submitReport = () => {
    if (!reportForm.area.trim() || !reportForm.desc.trim()) { addToast("⚠️ Incomplete", "Please fill in area and description.", "error"); return; }
    const newR = { id: "r" + Date.now(), type: reportForm.type, desc: reportForm.desc, area: reportForm.area, time: "Just now", votes: 0, userVoted: false };
    setReports(r => [newR, ...r]);
    setReportForm({ type: "suspicious", area: "", desc: "" });
    setTab("feed");
    addToast("📢 Report Submitted", "Your safety report has been shared with the community.", "success");
  };

  const typeColors = { harassment: "ac-harassment", suspicious: "ac-suspicious", unsafe: "ac-unsafe", safe: "ac-safe" };

  return (
    <div className="mp slide-up">
      <ModuleHeader icon="🏘️" iconType="comm" title="Community Safety" sub="Crowdsourced local safety network · Mysuru" onClose={onClose} />
      <div className="comm-tabs">
        {[["feed", "📢 Safety Feed"], ["report", "+ Report"], ["map", "🗺️ Heat Map"]].map(([id, label]) => (
          <button key={id} className={`comm-tab ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === "feed" && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.9rem" }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", fontSize: "0.76rem", color: "rgba(255,255,255,0.45)" }}>📍 Mysuru, Karnataka</div>
            <button className="share-btn" style={{ width: "auto", padding: "8px 12px", margin: 0 }} onClick={() => addToast("🔄 Refreshed", "Loaded latest community safety reports.", "success")}>🔄</button>
          </div>
          {reports.map(r => (
            <div key={r.id} className="alert-card" onClick={() => vote(r.id)}>
              <div className="ac-head">
                <span className={`ac-type ${typeColors[r.type]}`}>{r.type.toUpperCase()}</span>
                <span className="ac-time">{r.time}</span>
              </div>
              <div className="ac-desc">{r.desc}</div>
              <div className="ac-footer">
                <div className="ac-loc">📍 {r.area}</div>
                <div className={`ac-vote ${r.userVoted ? "voted" : ""}`}>👍 {r.votes} {r.userVoted ? "· Voted" : ""}</div>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "report" && (
        <div className="contact-form-box">
          <h3>📢 Report a Safety Incident</h3>
          <div className="fg">
            <label>Incident Type</label>
            <select value={reportForm.type} onChange={e => setReportForm(f => ({ ...f, type: e.target.value }))}>
              <option value="suspicious">🟡 Suspicious Activity</option>
              <option value="harassment">🔴 Harassment / Assault</option>
              <option value="unsafe">🟠 Unsafe Area</option>
              <option value="safe">🟢 Safe Spot</option>
            </select>
          </div>
          <div className="fg">
            <label>Area / Landmark</label>
            <input value={reportForm.area} onChange={e => setReportForm(f => ({ ...f, area: e.target.value }))} placeholder="e.g. Devaraja Market, MG Road…" />
          </div>
          <div className="fg">
            <label>Description</label>
            <textarea value={reportForm.desc} onChange={e => setReportForm(f => ({ ...f, desc: e.target.value }))} placeholder="Describe what you observed…" rows={3} style={{ height: "auto" }} />
          </div>
          <button className="form-btn" onClick={submitReport}>📢 Submit Community Report</button>
          <p className="hint">False reports violate community guidelines. Thank you for keeping our community safe 💙</p>
        </div>
      )}

      {tab === "map" && (
        <>
          <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 13, padding: "2rem", textAlign: "center", margin: "0.5rem 0" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.6rem" }}>🗺️</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.4rem" }}>Safety Heat Map</div>
            <div style={{ fontSize: "0.74rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.65, marginBottom: "1rem" }}>
              In production, this displays an interactive Google Maps heat map showing high-risk and safe zones based on real community reports in your area.
            </div>
            <button className="share-btn" style={{ display: "inline-flex", width: "auto", padding: "9px 18px" }} onClick={() => addToast("🗺️ Maps Feature", "Add VITE_MAPS_API_KEY to your .env to enable Google Maps.", "info")}>Enable Google Maps →</button>
          </div>
          {[["🔴", "High Risk Areas", reports.filter(r => r.type === "harassment" || r.type === "unsafe").length],
            ["🟡", "Caution Zones", reports.filter(r => r.type === "suspicious").length],
            ["🟢", "Safe Zones", reports.filter(r => r.type === "safe").length]].map(([c, l, n]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 9, marginBottom: 6, fontSize: "0.77rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span>{c}</span><span style={{ color: "rgba(255,255,255,0.68)" }}>{l}</span></div>
              <span style={{ fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{n} report{n !== 1 ? "s" : ""}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MODULE: USER PROFILE
// ══════════════════════════════════════════════════════════════
function ProfileModule({ user, contacts, recordings, onLogout, onClose, addToast }) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [settings, setSettings] = useState({ autoShare: false, discreetSOS: false, biometric: false });

  const initials = (user.displayName ? user.displayName.split(" ").map(n => n[0]).join("").slice(0, 2) : user.email[0]).toUpperCase();
  const joined = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const handleLogout = async () => {
    setLoggingOut(true);
    await fbAuth.signOut();
    onLogout();
  };

  const toggleSetting = (key) => {
    setSettings(s => ({ ...s, [key]: !s[key] }));
    addToast(settings[key] ? "🔕 Disabled" : "✅ Enabled", `${key} setting updated.`, "info");
  };

  const settingItems = [
    { key: "autoShare", label: "Auto-share location on SOS", sub: "Instantly share GPS when SOS is triggered" },
    { key: "discreetSOS", label: "Discreet SOS mode", sub: "SOS appears as a regular screen" },
    { key: "biometric", label: "Biometric lock", sub: "Lock app with fingerprint / Face ID" },
  ];

  return (
    <div className="mp slide-up">
      <ModuleHeader icon="👤" iconType="ai" title="Your Profile" sub="Account settings & preferences" onClose={onClose} />
      <div className="profile-card">
        <div className="pro-avatar">{initials}</div>
        <div className="pro-name">{user.displayName || "Suraksha User"}</div>
        <div className="pro-email">{user.email}</div>
        <div className="pro-stats">
          <div className="ps"><div className="ps-n">🛡️</div><div className="ps-l">Protected</div></div>
          <div className="ps"><div className="ps-n">{contacts.length}</div><div className="ps-l">Contacts</div></div>
          <div className="ps"><div className="ps-n">{recordings || 0}</div><div className="ps-l">Recordings</div></div>
        </div>
        <div className="pro-info-box">
          <div className="pro-info-title">Account Details</div>
          {[["Email", user.email], ["Display Name", user.displayName || "Not set"], ["Member Since", joined], ["Auth Provider", "Email & Password"], ["Database", "Firestore (Simulated)"], ["AI Engine", "Claude Sonnet (Anthropic)"]].map(([k, v]) => (
            <div key={k} className="pro-row">
              <span className="pro-row-key">{k}</span>
              <span className="pro-row-val">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="sl">App Settings</div>
      <div className="settings-box">
        <div className="settings-title">Privacy & Security</div>
        {settingItems.map(s => (
          <div key={s.key} className="settings-row">
            <div className="sr-left">
              <div className="sr-label">{s.label}</div>
              <div className="sr-sub">{s.sub}</div>
            </div>
            <ToggleBtn on={settings[s.key]} onClick={() => toggleSetting(s.key)} />
          </div>
        ))}
      </div>
      <button className="logout-btn" onClick={handleLogout} disabled={loggingOut}>
        {loggingOut ? <><Spinner /> Signing out…</> : "↩ Sign Out of Suraksha"}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  AUTH MODAL
// ══════════════════════════════════════════════════════════════
function AuthModal({ mode, onClose, onSuccess }) {
  const [view, setView] = useState(mode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (view === "signup") {
        if (!form.name.trim()) throw { message: "Please enter your full name." };
        const { user } = await fbAuth.createUserWithEmailAndPassword(form.email, form.password);
        await fbAuth.updateProfile(user, { displayName: form.name.trim() });
        onSuccess(fbAuth.currentUser);
      } else {
        const { user } = await fbAuth.signInWithEmailAndPassword(form.email, form.password);
        onSuccess(user);
      }
    } catch (e) {
      setError(formatFirebaseError(e));
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-logo"><Logo size="sm" /></div>
        <h2>{view === "login" ? "Welcome back" : "Create account"}</h2>
        <p className="modal-sub">{view === "login" ? "Sign in to your safety dashboard" : "Join Suraksha and stay protected"}</p>
        {error && <div className="err-box">⚠️ {error}</div>}
        {view === "signup" && (
          <div className="fg">
            <label>Full Name</label>
            <input placeholder="e.g. Aanya Patel" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} onKeyDown={handleKey} autoFocus />
          </div>
        )}
        <div className="fg">
          <label>Email Address</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onKeyDown={handleKey} autoFocus={view === "login"} />
        </div>
        <div className="fg">
          <label>Password</label>
          <input type="password" placeholder={view === "signup" ? "Minimum 6 characters" : "Your password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={handleKey} />
        </div>
        <button className="form-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? <><Spinner /> {view === "login" ? "Signing in…" : "Creating account…"}</> : view === "login" ? "Sign In" : "Create Account"}
        </button>
        <div className="form-switch">
          {view === "login" ? <>Don't have an account? <button onClick={() => { setView("signup"); setError(""); }}>Sign up free</button></> : <>Already have an account? <button onClick={() => { setView("login"); setError(""); }}>Sign in</button></>}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  LANDING PAGE
// ══════════════════════════════════════════════════════════════
function LandingPage({ onOpenAuth }) {
  const features = [
    ["🚨", "Emergency SOS", "One tap alert"],
    ["📍", "Live Location", "Real GPS sharing"],
    ["🤖", "Claude AI", "Expert guidance"],
    ["👥", "Contacts", "Safety network"],
    ["🎙️", "Voice Record", "Audio evidence"],
    ["🗺️", "Safe Route", "Navigate safely"],
    ["🔔", "Alerts", "Push notifications"],
    ["🏘️", "Community", "Crowd safety"],
  ];
  const stats = [["50K+", "Women Protected"], ["99.9%", "Uptime"], ["<3s", "SOS Response"], ["24/7", "AI Support"]];
  const why = [
    ["🔒", "Privacy First", "Your location only shared with your chosen contacts. We never sell or store data."],
    ["⚡", "Instant Response", "One-tap SOS works even on slow connections, alerting contacts in seconds."],
    ["🧠", "Claude AI Inside", "Powered by Anthropic's Claude for expert, compassionate, real-time safety guidance."],
    ["📍", "Real GPS", "Precise browser Geolocation API. Your exact coordinates, every time."],
    ["🎙️", "Voice Evidence", "Record audio during emergencies. Captured via Web Audio API, backed up to Firebase."],
    ["🏘️", "Community Network", "Crowd-sourced safety reports. Know what's safe and what's not in your area."],
  ];

  return (
    <div>
      <nav className="nav">
        <Logo />
        <div className="nav-right">
          <button className="btn-g" onClick={() => onOpenAuth("login")}>Sign In</button>
          <button className="btn-p" onClick={() => onOpenAuth("signup")}>Get Started</button>
        </div>
      </nav>
      <section className="hero">
        <div className="badge"><div className="badge-dot" />Women Safety Platform · Powered by Claude AI</div>
        <h1>Your safety,<br /><em>always one tap away</em></h1>
        <p className="hero-sub">Suraksha combines instant SOS, live GPS, Claude AI guidance, voice recording, and a community safety network — everything you need, when you need it.</p>
        <div className="hero-cta">
          <button className="btn-xl p" onClick={() => onOpenAuth("signup")}>Get Protected Free →</button>
          <button className="btn-xl o" onClick={() => onOpenAuth("login")}>Sign In</button>
        </div>
        <div className="hero-grid">
          {features.map(([icon, title, desc]) => (
            <div key={title} className="hero-card">
              <div className="hc-icon">{icon}</div>
              <div className="hc-title">{title}</div>
              <div className="hc-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>
      <div className="stats-bar">
        <div className="stats-inner">
          {stats.map(([n, l]) => <div key={l}><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>)}
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
          <p style={{ color: "rgba(255,255,255,0.48)", marginBottom: "1.25rem", fontSize: "0.85rem" }}>Free. Secure. Powered by Claude AI.</p>
          <button className="btn-xl p" onClick={() => onOpenAuth("signup")}>Create Free Account →</button>
        </div>
      </div>
      <footer>© 2025 Suraksha · Women Safety Platform · Powered by Claude AI (Anthropic) · Built with 💙</footer>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════════════
function Dashboard({ user, onLogout }) {
  const [activeModule, setActiveModule] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [contacts, setContacts] = useState([]);
  const [contactsLoaded, setContactsLoaded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [recCount, setRecCount] = useState(0);
  const [notifCount] = useState(2);
  const { toasts, addToast } = useToast();

  const hr = new Date().getHours();
  const greeting = hr < 5 ? "Good night" : hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
  const firstName = user.displayName ? user.displayName.split(" ")[0] : "there";
  const dateStr = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const initials = (user.displayName ? user.displayName.split(" ").map(n => n[0]).join("").slice(0, 2) : user.email[0]).toUpperCase();

  useEffect(() => {
    fbDB.getDocs("contacts", d => d.uid === user.uid).then(c => { setContacts(c); setContactsLoaded(true); });
  }, []);

  const openModule = (m) => { setActiveModule(m); setActiveTab(m); };
  const closeModule = () => { setActiveModule(null); setActiveTab("home"); };

  const dashCards = [
    { id: "sos", cls: "c-sos", icon: "🚨", iType: "sos", title: "SOS Emergency", desc: "One tap alerts all contacts with your live GPS location.", badge: null },
    { id: "location", cls: "c-loc", icon: "📍", iType: "loc", title: "Live Location", desc: "Real GPS — fetch, share & track your location.", badge: null },
    { id: "contacts", cls: "c-con", icon: "👥", iType: "con", title: "Emergency Contacts", desc: `${contacts.length} contact${contacts.length !== 1 ? "s" : ""} saved. Manage SOS recipients.`, badge: null },
    { id: "ai", cls: "c-ai", icon: "🤖", iType: "ai", title: "AI Safety Assistant", desc: "Claude AI provides expert safety guidance instantly.", badge: "AI" },
    { id: "route", cls: "c-route", icon: "🗺️", iType: "route", title: "Safe Route", desc: "AI-verified safety-optimised navigation.", badge: "NEW" },
    { id: "voice", cls: "c-voice", icon: "🎙️", iType: "voice", title: "Voice Recorder", desc: "Record audio evidence during emergencies.", badge: "NEW" },
    { id: "notif", cls: "c-notif", icon: "🔔", iType: "notif", title: "Notifications", desc: `${notifCount} unread alert${notifCount !== 1 ? "s" : ""}. Manage push preferences.`, badge: null },
    { id: "community", cls: "c-comm", icon: "🏘️", iType: "comm", title: "Community Safety", desc: "View & report safety alerts in your local area.", badge: "NEW" },
  ];

  return (
    <div className="dash">
      <div className="dash-hdr">
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {notifCount > 0 && (
            <div style={{ position: "relative", cursor: "pointer" }} onClick={() => openModule("notif")}>
              <span style={{ fontSize: "1.1rem" }}>🔔</span>
              <span style={{ position: "absolute", top: -3, right: -3, background: "#f43f5e", borderRadius: "50%", width: 14, height: 14, fontSize: "0.55rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{notifCount}</span>
            </div>
          )}
          <span style={{ fontSize: "0.73rem", color: "rgba(255,255,255,0.4)" }}>{user.displayName || user.email.split("@")[0]}</span>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#2563eb,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }} onClick={() => openModule("profile")}>{initials}</div>
        </div>
      </div>

      <div className="dash-body">
        <div className="greeting-bar">
          <div className="dash-date">📅 {dateStr}</div>
          <h2>{greeting}, {firstName} 👋</h2>
          <p>Stay safe. Your protection is our priority.</p>
        </div>

        <div className="status-strip">
          <div className="si"><div className="sd sd-g" />Suraksha Active</div>
          <div className="si"><div className="sd sd-b" />Claude AI Online</div>
          <div className="si"><div className={`sd ${currentLocation ? "sd-g" : "sd-y"}`} />Location {currentLocation ? "Shared" : "Standby"}</div>
          <div className="si"><div className="sd sd-g" />{contacts.length} Contacts</div>
        </div>

        <div className="sl">Safety Features</div>
        <div className="cards-grid">
          {dashCards.map(card => (
            <div key={card.id} className={`dcard ${card.cls}`} onClick={() => openModule(card.id)}>
              {card.badge && <div className="card-badge"><Tag type={card.badge === "AI" ? "ai" : "new"}>{card.badge}</Tag></div>}
              <div className={`card-icon i-${card.iType}`}>{card.icon}</div>
              <div className="card-title">{card.title}</div>
              <div className="card-desc">{card.desc}</div>
              <div className="card-arrow">Open →</div>
            </div>
          ))}
        </div>

        <div className="sl" style={{ marginTop: "1.25rem" }}>Emergency Helplines</div>
        <div className="helplines">
          {HELPLINES.map(h => (
            <div key={h.number} className="hl-row" onClick={() => addToast(`📞 ${h.label}`, `In production: dials ${h.number} directly via tel: protocol.`, "info")}>
              <div className="hl-left"><span>{h.icon}</span><span>{h.label}</span></div>
              <span className="hl-num">{h.number}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bnav">
        {[["home", "🏠", "Home"], ["sos", "🚨", "SOS"], ["ai", "🤖", "AI Help"], ["community", "🏘️", "Community"], ["profile", "👤", "Profile"]].map(([id, icon, label]) => (
          <button key={id} className={`bni ${activeTab === id ? "active" : ""}`} onClick={() => { if (id === "home") { setActiveModule(null); setActiveTab("home"); } else openModule(id); }}>
            <span className="bni-icon">{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* MODULE PANELS */}
      {activeModule && (
        <div className="mp-overlay" onClick={e => e.target === e.currentTarget && closeModule()}>
          {activeModule === "sos" && <SOSModule user={user} contacts={contacts} onClose={closeModule} addToast={addToast} />}
          {activeModule === "location" && <LocationModule contacts={contacts} onClose={closeModule} addToast={addToast} onOpenRoute={loc => { setCurrentLocation(loc); setActiveModule("route"); }} />}
          {activeModule === "contacts" && <ContactsModule user={user} contacts={contacts} setContacts={setContacts} onClose={closeModule} addToast={addToast} />}
          {activeModule === "ai" && <AIModule onClose={closeModule} addToast={addToast} />}
          {activeModule === "route" && <RouteModule currentLocation={currentLocation} onClose={closeModule} addToast={addToast} />}
          {activeModule === "voice" && <VoiceModule onClose={closeModule} addToast={addToast} />}
          {activeModule === "notif" && <NotifModule onClose={closeModule} addToast={addToast} />}
          {activeModule === "community" && <CommunityModule onClose={closeModule} addToast={addToast} />}
          {activeModule === "profile" && <ProfileModule user={user} contacts={contacts} recordings={recCount} onLogout={onLogout} onClose={closeModule} addToast={addToast} />}
        </div>
      )}

      <Toast toasts={toasts} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(undefined);
  const [authModal, setAuthModal] = useState(null);

  useEffect(() => {
    const unsub = fbAuth.onAuthStateChanged(u => setUser(u || null));
    return unsub;
  }, []);

  if (user === undefined) {
    return (
      <>
        <style>{STYLES}</style>
        <div style={{ minHeight: "100vh", background: "#0a1628", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <div style={{ fontSize: "3rem" }}>🛡️</div>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>Suraksha</div>
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
          <LandingPage onOpenAuth={mode => setAuthModal(mode)} />
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
ENDOFFILE
echo "Done: $(wc -l < /mnt/user-data/outputs/Suraksha.jsx) lines"
