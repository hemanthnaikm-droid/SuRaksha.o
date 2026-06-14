import { useState, useEffect, useRef } from "react";

const COLORS = {
  navy: "#0a1628",
  navyMid: "#112040",
  navyLight: "#1a2d50",
  blue: "#1e4fcb",
  blueLight: "#2563eb",
  cyan: "#06b6d4",
  rose: "#f43f5e",
  roseLight: "#fb7185",
  gold: "#f59e0b",
  white: "#ffffff",
  offWhite: "#f8fafc",
  glass: "rgba(255,255,255,0.07)",
  glassBorder: "rgba(255,255,255,0.12)",
  textMuted: "rgba(255,255,255,0.55)",
  textSub: "rgba(255,255,255,0.75)",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: #0a1628; color: #fff; min-height: 100vh; }
  
  .suraksha-app { min-height: 100vh; }

  /* ──── NAV ──── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    background: rgba(10,22,40,0.92);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding: 0 2rem; height: 68px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-logo { display: flex; align-items: center; gap: 10px; }
  .nav-logo-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, #2563eb, #06b6d4);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px;
  }
  .nav-logo-text { font-family: 'DM Sans', sans-serif; font-size: 1.25rem; font-weight: 700; letter-spacing: -0.02em; }
  .nav-logo-text span { color: #06b6d4; }
  .nav-actions { display: flex; gap: 10px; align-items: center; }
  .btn-ghost {
    background: transparent; border: 1px solid rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.8); padding: 8px 18px;
    border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 500;
    transition: all 0.2s;
  }
  .btn-ghost:hover { border-color: #2563eb; color: #fff; background: rgba(37,99,235,0.15); }
  .btn-primary {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border: none; color: #fff; padding: 8px 20px;
    border-radius: 8px; cursor: pointer; font-size: 0.875rem; font-weight: 600;
    transition: all 0.2s; box-shadow: 0 4px 15px rgba(37,99,235,0.35);
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.5); }
  .btn-primary:active { transform: translateY(0); }
  .btn-danger {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    border: none; color: #fff; padding: 10px 24px;
    border-radius: 10px; cursor: pointer; font-size: 0.9rem; font-weight: 600;
    transition: all 0.2s; box-shadow: 0 4px 15px rgba(220,38,38,0.4);
  }
  .btn-danger:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(220,38,38,0.55); }

  /* ──── HERO ──── */
  .hero {
    min-height: 100vh;
    background: radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.18) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 20%, rgba(6,182,212,0.12) 0%, transparent 50%),
                radial-gradient(ellipse at 60% 80%, rgba(244,63,94,0.08) 0%, transparent 40%),
                #0a1628;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    text-align: center; padding: 100px 2rem 4rem;
    position: relative; overflow: hidden;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(37,99,235,0.15); border: 1px solid rgba(37,99,235,0.35);
    padding: 6px 16px; border-radius: 100px;
    font-size: 0.78rem; font-weight: 500; color: #93c5fd;
    margin-bottom: 2rem; letter-spacing: 0.04em; text-transform: uppercase;
  }
  .hero-badge-dot { width: 7px; height: 7px; background: #06b6d4; border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.85); } }
  .hero h1 {
    font-family: 'DM Sans', sans-serif;
    font-size: clamp(2.4rem, 6vw, 4.2rem);
    font-weight: 800; line-height: 1.08;
    letter-spacing: -0.03em; margin-bottom: 1.5rem; max-width: 800px;
  }
  .hero h1 em { font-style: normal; color: #06b6d4; }
  .hero-sub {
    font-size: 1.1rem; color: rgba(255,255,255,0.6);
    max-width: 500px; line-height: 1.7; margin-bottom: 2.5rem;
  }
  .hero-cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 4rem; }
  .btn-large {
    padding: 14px 32px; font-size: 1rem; font-weight: 600; border-radius: 12px;
    cursor: pointer; transition: all 0.2s;
  }
  .btn-large.primary {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    border: none; color: #fff;
    box-shadow: 0 8px 25px rgba(37,99,235,0.4);
  }
  .btn-large.primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(37,99,235,0.55); }
  .btn-large.outline {
    background: transparent; border: 1.5px solid rgba(255,255,255,0.2);
    color: rgba(255,255,255,0.85);
  }
  .btn-large.outline:hover { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.05); }

  .hero-features {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 16px; max-width: 900px; width: 100%;
  }
  @media (max-width: 700px) { .hero-features { grid-template-columns: repeat(2, 1fr); } }
  .hero-feature-card {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 1.25rem 1rem;
    text-align: center; transition: all 0.3s;
  }
  .hero-feature-card:hover {
    background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.15);
    transform: translateY(-4px);
  }
  .hero-feature-icon { font-size: 1.75rem; margin-bottom: 0.6rem; }
  .hero-feature-title { font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.9); margin-bottom: 4px; }
  .hero-feature-desc { font-size: 0.73rem; color: rgba(255,255,255,0.45); }

  /* ──── AUTH MODAL ──── */
  .modal-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center; padding: 1rem;
  }
  .modal {
    background: #112040; border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px; padding: 2.5rem 2rem;
    width: 100%; max-width: 420px;
    box-shadow: 0 40px 80px rgba(0,0,0,0.5);
  }
  .modal-logo { display: flex; align-items: center; gap: 10px; justify-content: center; margin-bottom: 0.5rem; }
  .modal h2 { text-align: center; font-size: 1.4rem; font-weight: 700; margin-bottom: 0.4rem; }
  .modal-sub { text-align: center; color: rgba(255,255,255,0.5); font-size: 0.875rem; margin-bottom: 1.8rem; }
  .form-group { margin-bottom: 1rem; }
  .form-group label { display: block; font-size: 0.825rem; font-weight: 500; color: rgba(255,255,255,0.7); margin-bottom: 6px; }
  .form-group input {
    width: 100%; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 0.9rem;
    outline: none; transition: border-color 0.2s;
  }
  .form-group input:focus { border-color: #2563eb; background: rgba(37,99,235,0.08); }
  .form-group input::placeholder { color: rgba(255,255,255,0.3); }
  .form-submit {
    width: 100%; padding: 13px; border: none; border-radius: 10px;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff; font-size: 0.95rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; margin-top: 0.5rem;
    box-shadow: 0 6px 20px rgba(37,99,235,0.4);
  }
  .form-submit:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(37,99,235,0.55); }
  .form-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .form-switch { text-align: center; margin-top: 1rem; font-size: 0.825rem; color: rgba(255,255,255,0.5); }
  .form-switch button { background: none; border: none; color: #60a5fa; cursor: pointer; font-size: 0.825rem; font-weight: 500; }
  .form-switch button:hover { color: #93c5fd; text-decoration: underline; }
  .error-msg { background: rgba(244,63,94,0.15); border: 1px solid rgba(244,63,94,0.3); border-radius: 8px; padding: 10px 14px; font-size: 0.825rem; color: #fca5a5; margin-bottom: 1rem; }
  .modal-close {
    position: absolute; top: 1rem; right: 1rem;
    background: rgba(255,255,255,0.08); border: none; color: #fff;
    width: 32px; height: 32px; border-radius: 8px; cursor: pointer;
    font-size: 1rem; display: flex; align-items: center; justify-content: center;
  }
  .modal-close:hover { background: rgba(255,255,255,0.15); }

  /* ──── DASHBOARD ──── */
  .dashboard {
    min-height: 100vh;
    background: radial-gradient(ellipse at 10% 10%, rgba(37,99,235,0.12) 0%, transparent 50%), #0a1628;
  }
  .dash-header {
    background: rgba(17,32,64,0.95); backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255,255,255,0.07);
    padding: 0 2rem; height: 68px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
  }
  .dash-content { padding: 2rem; max-width: 1100px; margin: 0 auto; }
  .dash-greeting { margin-bottom: 2rem; }
  .dash-greeting h2 { font-size: 1.6rem; font-weight: 700; margin-bottom: 4px; }
  .dash-greeting p { color: rgba(255,255,255,0.5); font-size: 0.875rem; }
  .dash-time { font-size: 0.75rem; color: #06b6d4; font-weight: 500; background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2); padding: 3px 10px; border-radius: 100px; display: inline-block; margin-bottom: 6px; }
  
  /* ──── CARDS GRID ──── */
  .cards-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px; margin-bottom: 2rem;
  }
  .feature-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; padding: 1.5rem;
    cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden;
  }
  .feature-card::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, var(--card-accent, rgba(37,99,235,0.1)), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .feature-card:hover { transform: translateY(-4px); border-color: rgba(255,255,255,0.14); }
  .feature-card:hover::before { opacity: 1; }
  .feature-card.sos { --card-accent: rgba(244,63,94,0.15); border-color: rgba(244,63,94,0.15); }
  .feature-card.sos:hover { border-color: rgba(244,63,94,0.35); box-shadow: 0 20px 40px rgba(244,63,94,0.12); }
  .feature-card.location { --card-accent: rgba(6,182,212,0.15); border-color: rgba(6,182,212,0.15); }
  .feature-card.location:hover { border-color: rgba(6,182,212,0.35); box-shadow: 0 20px 40px rgba(6,182,212,0.12); }
  .feature-card.contacts { --card-accent: rgba(245,158,11,0.15); border-color: rgba(245,158,11,0.12); }
  .feature-card.contacts:hover { border-color: rgba(245,158,11,0.3); box-shadow: 0 20px 40px rgba(245,158,11,0.1); }
  .feature-card.ai { --card-accent: rgba(139,92,246,0.15); border-color: rgba(139,92,246,0.12); }
  .feature-card.ai:hover { border-color: rgba(139,92,246,0.3); box-shadow: 0 20px 40px rgba(139,92,246,0.1); }
  
  .card-icon-wrap {
    width: 52px; height: 52px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; margin-bottom: 1rem; position: relative; z-index: 1;
  }
  .card-icon-wrap.sos { background: rgba(244,63,94,0.2); }
  .card-icon-wrap.location { background: rgba(6,182,212,0.2); }
  .card-icon-wrap.contacts { background: rgba(245,158,11,0.2); }
  .card-icon-wrap.ai { background: rgba(139,92,246,0.2); }
  
  .card-title { font-size: 1rem; font-weight: 700; margin-bottom: 6px; position: relative; z-index: 1; }
  .card-desc { font-size: 0.8rem; color: rgba(255,255,255,0.5); line-height: 1.5; position: relative; z-index: 1; margin-bottom: 1rem; }
  .card-arrow {
    position: relative; z-index: 1; font-size: 0.78rem; font-weight: 600;
    color: rgba(255,255,255,0.4); display: flex; align-items: center; gap: 4px;
    transition: color 0.2s; letter-spacing: 0.03em;
  }
  .feature-card:hover .card-arrow { color: rgba(255,255,255,0.8); }

  /* ──── STATUS STRIP ──── */
  .status-strip {
    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 1.25rem 1.5rem;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 12px; margin-bottom: 2rem;
  }
  .status-item { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; }
  .status-dot.green { background: #22c55e; box-shadow: 0 0 8px rgba(34,197,94,0.5); }
  .status-dot.yellow { background: #f59e0b; }
  .status-dot.blue { background: #3b82f6; box-shadow: 0 0 8px rgba(59,130,246,0.5); }
  .status-label { color: rgba(255,255,255,0.6); }

  /* ──── MODULE PANEL ──── */
  .module-panel {
    background: rgba(17,32,64,0.8); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px; padding: 2rem;
    position: fixed; inset: 0; z-index: 150;
    overflow-y: auto; margin: 1rem;
    animation: slideUp 0.25s ease-out;
    max-width: 680px; margin: auto; top: 80px; bottom: 20px;
    backdrop-filter: blur(20px);
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  .module-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; }
  .module-title-wrap { display: flex; align-items: center; gap: 12px; }
  .module-title { font-size: 1.25rem; font-weight: 700; }
  .module-close {
    background: rgba(255,255,255,0.08); border: none; color: #fff;
    width: 36px; height: 36px; border-radius: 10px; cursor: pointer;
    font-size: 1.1rem; display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
  }
  .module-close:hover { background: rgba(255,255,255,0.15); }

  /* ──── SOS ──── */
  .sos-ring-container { display: flex; justify-content: center; margin: 2rem 0; }
  .sos-outer {
    width: 200px; height: 200px; border-radius: 50%;
    border: 2px solid rgba(244,63,94,0.2);
    display: flex; align-items: center; justify-content: center;
    animation: sosRing 2.5s ease-in-out infinite;
    position: relative;
  }
  @keyframes sosRing { 0%,100% { box-shadow: 0 0 0 0 rgba(244,63,94,0); } 50% { box-shadow: 0 0 0 20px rgba(244,63,94,0.08); } }
  .sos-inner {
    width: 150px; height: 150px; border-radius: 50%;
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    border: none; color: #fff; cursor: pointer;
    font-size: 1rem; font-weight: 700; letter-spacing: 0.08em;
    transition: all 0.15s; box-shadow: 0 10px 40px rgba(220,38,38,0.5);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px;
  }
  .sos-inner:hover { transform: scale(1.05); box-shadow: 0 15px 50px rgba(220,38,38,0.7); }
  .sos-inner:active { transform: scale(0.97); }
  .sos-icon { font-size: 2rem; }
  .sos-inner.activated { background: linear-gradient(135deg, #16a34a, #15803d); box-shadow: 0 10px 40px rgba(22,163,74,0.5); animation: sosActivated 0.5s ease; }
  @keyframes sosActivated { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
  .sos-countdown {
    text-align: center; background: rgba(244,63,94,0.12); border: 1px solid rgba(244,63,94,0.25);
    border-radius: 12px; padding: 1rem; margin: 1rem 0;
  }
  .sos-countdown-num { font-size: 2.5rem; font-weight: 800; color: #f87171; }
  .sos-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 1.5rem; }
  .sos-action-btn {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 12px; color: #fff; cursor: pointer;
    font-size: 0.82rem; font-weight: 500; transition: all 0.2s;
    display: flex; align-items: center; gap: 8px; justify-content: center;
  }
  .sos-action-btn:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.2); }
  .sos-action-btn span { font-size: 1rem; }

  /* ──── LOCATION ──── */
  .location-map-mock {
    background: rgba(6,182,212,0.06); border: 1px solid rgba(6,182,212,0.2);
    border-radius: 16px; padding: 2rem; text-align: center; margin: 1.5rem 0;
    position: relative; overflow: hidden;
  }
  .location-map-grid {
    position: absolute; inset: 0; opacity: 0.07;
    background-image: linear-gradient(rgba(6,182,212,0.8) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(6,182,212,0.8) 1px, transparent 1px);
    background-size: 30px 30px;
  }
  .location-pin { font-size: 3rem; position: relative; z-index: 1; margin-bottom: 0.5rem; animation: pinBounce 2s ease-in-out infinite; }
  @keyframes pinBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  .location-coords {
    font-family: 'DM Sans', monospace; font-size: 0.875rem;
    color: #06b6d4; position: relative; z-index: 1;
    background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.2);
    border-radius: 8px; padding: 8px 16px; display: inline-block; margin-top: 0.5rem;
  }
  .location-fetch-btn {
    width: 100%; padding: 13px; border: none; border-radius: 12px;
    background: linear-gradient(135deg, #0891b2, #06b6d4);
    color: #fff; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s; margin: 1rem 0;
    box-shadow: 0 6px 20px rgba(6,182,212,0.3);
  }
  .location-fetch-btn:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(6,182,212,0.45); }
  .location-fetch-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
  .location-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 1rem; }
  .location-info-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px; padding: 12px;
  }
  .location-info-label { font-size: 0.72rem; color: rgba(255,255,255,0.45); margin-bottom: 4px; }
  .location-info-value { font-size: 0.9rem; font-weight: 600; color: rgba(255,255,255,0.9); }
  .share-btn {
    width: 100%; padding: 11px; border: 1px solid rgba(255,255,255,0.15);
    border-radius: 10px; background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.8); font-size: 0.875rem; font-weight: 500;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .share-btn:hover { background: rgba(255,255,255,0.09); border-color: rgba(255,255,255,0.25); }

  /* ──── CONTACTS ──── */
  .contact-form {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 1.5rem; margin-bottom: 1.5rem;
  }
  .contact-form h3 { font-size: 0.95rem; font-weight: 600; margin-bottom: 1rem; }
  .contact-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  @media (max-width: 480px) { .contact-form-row { grid-template-columns: 1fr; } }
  .contact-list { display: flex; flex-direction: column; gap: 10px; }
  .contact-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px; padding: 14px 16px;
    display: flex; align-items: center; justify-content: space-between;
    transition: all 0.2s;
  }
  .contact-card:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.14); }
  .contact-info { display: flex; align-items: center; gap: 12px; }
  .contact-avatar {
    width: 44px; height: 44px; border-radius: 12px;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem; font-weight: 700; color: #fff;
    flex-shrink: 0;
  }
  .contact-name { font-size: 0.9rem; font-weight: 600; margin-bottom: 2px; }
  .contact-phone { font-size: 0.78rem; color: rgba(255,255,255,0.5); }
  .contact-badge {
    font-size: 0.68rem; font-weight: 600; padding: 3px 8px; border-radius: 6px;
    background: rgba(37,99,235,0.2); color: #93c5fd; border: 1px solid rgba(37,99,235,0.3);
  }
  .contact-delete {
    background: rgba(244,63,94,0.1); border: 1px solid rgba(244,63,94,0.2);
    color: #fb7185; width: 32px; height: 32px; border-radius: 8px;
    cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; justify-content: center;
    transition: all 0.2s; flex-shrink: 0;
  }
  .contact-delete:hover { background: rgba(244,63,94,0.2); border-color: rgba(244,63,94,0.4); }
  .empty-state { text-align: center; padding: 2rem; color: rgba(255,255,255,0.35); font-size: 0.875rem; }
  .empty-state-icon { font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.5; }

  /* ──── AI ASSISTANT ──── */
  .ai-chat { display: flex; flex-direction: column; height: 400px; }
  .ai-messages {
    flex: 1; overflow-y: auto; padding: 1rem;
    background: rgba(0,0,0,0.2); border-radius: 14px; margin-bottom: 1rem;
    display: flex; flex-direction: column; gap: 10px;
    scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent;
  }
  .ai-msg { display: flex; align-items: flex-start; gap: 8px; }
  .ai-msg.user { flex-direction: row-reverse; }
  .ai-msg-avatar {
    width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 0.8rem;
  }
  .ai-msg-avatar.bot { background: linear-gradient(135deg, #7c3aed, #2563eb); }
  .ai-msg-avatar.user { background: linear-gradient(135deg, #2563eb, #06b6d4); }
  .ai-msg-bubble {
    max-width: 80%; font-size: 0.83rem; line-height: 1.55; padding: 10px 13px;
    border-radius: 12px;
  }
  .ai-msg.bot .ai-msg-bubble {
    background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1);
    color: rgba(255,255,255,0.9); border-radius: 4px 12px 12px 12px;
  }
  .ai-msg.user .ai-msg-bubble {
    background: rgba(37,99,235,0.25); border: 1px solid rgba(37,99,235,0.3);
    color: rgba(255,255,255,0.95); border-radius: 12px 4px 12px 12px;
  }
  .ai-input-row { display: flex; gap: 10px; }
  .ai-input {
    flex: 1; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px; padding: 11px 14px; color: #fff; font-size: 0.875rem;
    outline: none; transition: border-color 0.2s; resize: none; font-family: inherit;
  }
  .ai-input:focus { border-color: #7c3aed; background: rgba(124,58,237,0.08); }
  .ai-input::placeholder { color: rgba(255,255,255,0.3); }
  .ai-send {
    background: linear-gradient(135deg, #7c3aed, #2563eb); border: none;
    color: #fff; width: 44px; border-radius: 12px; cursor: pointer;
    font-size: 1rem; flex-shrink: 0; transition: all 0.2s;
    box-shadow: 0 4px 15px rgba(124,58,237,0.35);
  }
  .ai-send:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.5); }
  .ai-send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .ai-typing { display: flex; gap: 4px; align-items: center; padding: 8px 4px; }
  .ai-typing span { width: 6px; height: 6px; background: rgba(255,255,255,0.4); border-radius: 50%; animation: typing 1.2s ease-in-out infinite; }
  .ai-typing span:nth-child(2) { animation-delay: 0.2s; }
  .ai-typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typing { 0%,80%,100% { transform: scale(0.8); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }
  .ai-quick-btns { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 0.75rem; }
  .ai-quick-btn {
    background: rgba(124,58,237,0.12); border: 1px solid rgba(124,58,237,0.25);
    color: rgba(255,255,255,0.75); font-size: 0.73rem; padding: 5px 11px;
    border-radius: 20px; cursor: pointer; transition: all 0.2s;
  }
  .ai-quick-btn:hover { background: rgba(124,58,237,0.22); color: #fff; border-color: rgba(124,58,237,0.45); }

  /* ──── PROFILE ──── */
  .profile-card {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 2rem; text-align: center;
  }
  .profile-avatar {
    width: 80px; height: 80px; border-radius: 20px;
    background: linear-gradient(135deg, #2563eb, #7c3aed);
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; margin: 0 auto 1rem; border: 2px solid rgba(255,255,255,0.1);
  }
  .profile-name { font-size: 1.1rem; font-weight: 700; margin-bottom: 4px; }
  .profile-email { font-size: 0.825rem; color: rgba(255,255,255,0.5); margin-bottom: 1.5rem; }
  .profile-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 1.5rem; }
  .profile-stat { background: rgba(255,255,255,0.04); border-radius: 12px; padding: 12px 8px; }
  .profile-stat-num { font-size: 1.4rem; font-weight: 700; color: #60a5fa; }
  .profile-stat-label { font-size: 0.7rem; color: rgba(255,255,255,0.45); margin-top: 2px; }
  .logout-btn {
    width: 100%; padding: 12px; border: 1px solid rgba(244,63,94,0.25);
    border-radius: 10px; background: rgba(244,63,94,0.08);
    color: #fb7185; font-size: 0.875rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
  }
  .logout-btn:hover { background: rgba(244,63,94,0.15); border-color: rgba(244,63,94,0.4); }

  /* ──── NAV TABS ──── */
  .bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0;
    background: rgba(10,22,40,0.97); backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255,255,255,0.07);
    display: flex; padding: 8px 0 12px; z-index: 50;
  }
  .bottom-nav-item {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
    background: none; border: none; color: rgba(255,255,255,0.4);
    cursor: pointer; padding: 6px 4px; transition: color 0.2s; font-size: 0.65rem;
  }
  .bottom-nav-item.active { color: #60a5fa; }
  .bottom-nav-icon { font-size: 1.3rem; }

  /* ──── TOAST ──── */
  .toast {
    position: fixed; top: 80px; right: 1.5rem; z-index: 300;
    background: rgba(17,32,64,0.97); border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px; padding: 12px 16px;
    min-width: 260px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    animation: toastIn 0.3s ease-out;
    backdrop-filter: blur(20px);
  }
  @keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  .toast-title { font-size: 0.875rem; font-weight: 600; margin-bottom: 2px; }
  .toast-msg { font-size: 0.78rem; color: rgba(255,255,255,0.55); }
  .toast.success { border-color: rgba(34,197,94,0.3); }
  .toast.error { border-color: rgba(244,63,94,0.3); }

  /* ──── MISC ──── */
  .section-label { font-size: 0.72rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 12px; }
  .divider { height: 1px; background: rgba(255,255,255,0.07); margin: 1.5rem 0; }
  .spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
`;

// ──────────── FIREBASE SIMULATION ────────────
// Simulates Firebase Auth + Firestore for self-contained demo
class FirebaseSimulator {
  constructor() {
    this._users = JSON.parse(localStorage.getItem("sk_users") || "{}");
    this._currentUser = JSON.parse(localStorage.getItem("sk_currentUser") || "null");
    this._contacts = JSON.parse(localStorage.getItem("sk_contacts") || "{}");
    this._listeners = [];
  }
  get currentUser() { return this._currentUser; }
  onAuthStateChanged(cb) {
    cb(this._currentUser);
    this._listeners.push(cb);
    return () => { this._listeners = this._listeners.filter(l => l !== cb); };
  }
  _notify() { this._listeners.forEach(l => l(this._currentUser)); }
  async signUp(email, password, displayName) {
    await this._delay(900);
    if (this._users[email]) throw new Error("Email already in use.");
    const uid = "uid_" + Math.random().toString(36).slice(2);
    const user = { uid, email, displayName, createdAt: new Date().toISOString() };
    this._users[email] = { ...user, password };
    this._currentUser = user;
    localStorage.setItem("sk_users", JSON.stringify(this._users));
    localStorage.setItem("sk_currentUser", JSON.stringify(user));
    this._notify();
    return user;
  }
  async signIn(email, password) {
    await this._delay(800);
    const user = this._users[email];
    if (!user || user.password !== password) throw new Error("Invalid email or password.");
    const { password: _, ...safeUser } = user;
    this._currentUser = safeUser;
    localStorage.setItem("sk_currentUser", JSON.stringify(safeUser));
    this._notify();
    return safeUser;
  }
  async signOut() {
    await this._delay(300);
    this._currentUser = null;
    localStorage.setItem("sk_currentUser", "null");
    this._notify();
  }
  // Firestore simulation
  async getContacts(uid) {
    await this._delay(400);
    return this._contacts[uid] || [];
  }
  async addContact(uid, contact) {
    await this._delay(500);
    if (!this._contacts[uid]) this._contacts[uid] = [];
    const newContact = { id: "c_" + Date.now(), ...contact };
    this._contacts[uid].push(newContact);
    localStorage.setItem("sk_contacts", JSON.stringify(this._contacts));
    return newContact;
  }
  async deleteContact(uid, contactId) {
    await this._delay(300);
    this._contacts[uid] = (this._contacts[uid] || []).filter(c => c.id !== contactId);
    localStorage.setItem("sk_contacts", JSON.stringify(this._contacts));
  }
  _delay(ms) { return new Promise(r => setTimeout(r, ms)); }
}

const firebase = new FirebaseSimulator();

// ──────────── AI SAFETY ASSISTANT ────────────
function getAIResponse(message) {
  const msg = message.toLowerCase();
  if (msg.includes("follow") || msg.includes("stalker") || msg.includes("followed")) {
    return "⚠️ If you're being followed, do NOT go home directly. Walk into the nearest open store, restaurant, or public place with people around.\n\n🔹 Call someone you trust and stay on the line.\n🔹 Note the person's description — height, clothing, vehicle.\n🔹 If you can't reach anyone, call police (112 in India).\n🔹 Use your location sharing feature here to send your live location to emergency contacts now.";
  }
  if (msg.includes("harass") || msg.includes("assault") || msg.includes("attack")) {
    return "🚨 Your safety is the priority. If you're in immediate danger, shout loudly and draw attention — don't be afraid to cause a scene.\n\n🔹 Move toward crowded, well-lit areas.\n🔹 Activate the SOS button in Suraksha immediately.\n🔹 Call 112 (Emergency) or 1091 (Women's Helpline) in India.\n🔹 Trust your instincts — if something feels wrong, act fast.";
  }
  if (msg.includes("unsafe") || msg.includes("scared") || msg.includes("danger")) {
    return "I hear you. Your feelings are valid and your safety matters. Here's what you can do right now:\n\n🔹 Move to a populated, lit area.\n🔹 Call a trusted contact using our Emergency Contacts feature.\n🔹 Activate SOS if the situation escalates.\n🔹 Stay aware — put your phone in hand, earphones out.\n\nRemember: You're not alone. Take it one step at a time. 💙";
  }
  if (msg.includes("safe route") || msg.includes("home") || msg.includes("walk")) {
    return "For a safer walk home:\n\n🔹 Share your live location with a trusted contact before you start.\n🔹 Stick to well-lit, busy streets — avoid shortcuts at night.\n🔹 Keep your phone charged and accessible.\n🔹 Let someone know your expected arrival time.\n🔹 Stay on a video call with a trusted person if feeling unsafe.\n\nThe Suraksha app can share your location in real time from the Live Location tab.";
  }
  if (msg.includes("drunk") || msg.includes("party") || msg.includes("night out")) {
    return "Heading out? Here are your safety essentials:\n\n🔹 Share your location with a trusted contact before leaving.\n🔹 Have an exit plan and a trusted person to call.\n🔹 Never leave your drink unattended.\n🔹 Travel with a group or use trusted cab services.\n🔹 Keep the SOS feature ready — a single press alerts your emergency contacts.";
  }
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.length < 5) {
    return "Hi! I'm your Suraksha Safety Assistant 💙\n\nI'm here to help you navigate unsafe situations and provide guidance. You can ask me about:\n• Being followed or stalked\n• Harassment or assault\n• Feeling unsafe or scared\n• Safe routes and travel\n• Night safety tips\n\nWhat can I help you with today?";
  }
  if (msg.includes("helpline") || msg.includes("number") || msg.includes("call") || msg.includes("police")) {
    return "🆘 Emergency Numbers (India):\n\n🚔 Police: 100\n🚑 Ambulance: 108\n📞 Emergency: 112\n👩 Women's Helpline: 1091\n🏠 Domestic Violence: 181\n🏥 NIMHANS Mental Health: 080-46110007\n\nSave these in your phone. The Suraksha SOS feature can also alert your personal emergency contacts instantly.";
  }
  return "Thank you for reaching out. Your safety is the top priority.\n\n🔹 Trust your instincts — if something feels wrong, it probably is.\n🔹 Use the SOS button to alert emergency contacts instantly.\n🔹 Share your live location with someone you trust.\n🔹 Stay in well-lit, public spaces.\n\nCan you tell me more about your situation? I'm here to help guide you step by step. 💙";
}

// ──────────── COMPONENTS ────────────

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.type}`}>
      <div className="toast-title">{toast.title}</div>
      <div className="toast-msg">{toast.message}</div>
    </div>
  );
}

function LogoMark() {
  return (
    <div className="nav-logo-icon">🛡️</div>
  );
}

function SOSModule({ user, onClose, onToast }) {
  const [state, setState] = useState("idle"); // idle | countdown | activated
  const [count, setCount] = useState(5);
  const timerRef = useRef(null);

  const handleSOSPress = () => {
    if (state === "activated") return;
    setState("countdown");
    setCount(5);
    timerRef.current = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          setState("activated");
          onToast({ type: "success", title: "🚨 SOS Activated", message: "Emergency contacts have been notified with your location." });
          setTimeout(() => setState("idle"), 5000);
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

  const actions = [
    { icon: "📱", label: "Call Emergency Services" },
    { icon: "💬", label: "WhatsApp Alert" },
    { icon: "📧", label: "Email Contacts" },
    { icon: "📍", label: "Share Location Now" },
  ];

  return (
    <div className="module-panel">
      <div className="module-header">
        <div className="module-title-wrap">
          <div className="card-icon-wrap sos">🚨</div>
          <div>
            <div className="module-title">SOS Emergency</div>
            <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>Hold the button to alert contacts</div>
          </div>
        </div>
        <button className="module-close" onClick={onClose}>✕</button>
      </div>

      {state === "countdown" && (
        <div className="sos-countdown">
          <div style={{ fontSize: "0.825rem", color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>Sending SOS in</div>
          <div className="sos-countdown-num">{count}</div>
          <button onClick={cancelSOS} className="btn-ghost" style={{ marginTop: "10px", fontSize: "0.825rem" }}>Cancel</button>
        </div>
      )}

      <div className="sos-ring-container">
        <div className="sos-outer">
          <button className={`sos-inner ${state === "activated" ? "activated" : ""}`} onClick={handleSOSPress}>
            <span className="sos-icon">{state === "activated" ? "✅" : "🆘"}</span>
            <span style={{ fontSize: "0.9rem", letterSpacing: "0.1em" }}>
              {state === "activated" ? "SENT" : "SOS"}
            </span>
          </button>
        </div>
      </div>

      {state === "activated" && (
        <div style={{ textAlign: "center", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 12, padding: "1rem", marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.875rem", color: "#86efac", fontWeight: 600 }}>✅ SOS Alert Sent Successfully</div>
          <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.5)", marginTop: 4 }}>Your emergency contacts have been notified with your location.</div>
        </div>
      )}

      <p className="section-label">Quick Actions</p>
      <div className="sos-actions">
        {actions.map((a, i) => (
          <button key={i} className="sos-action-btn" onClick={() => onToast({ type: "success", title: a.icon + " " + a.label, message: "Feature coming soon in next release." })}>
            <span>{a.icon}</span> {a.label}
          </button>
        ))}
      </div>
      <div className="divider" />
      <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", textAlign: "center", lineHeight: 1.6 }}>
        Pressing SOS will alert all your emergency contacts with your real-time GPS location. Enable contacts in the Emergency Contacts tab.
      </p>
    </div>
  );
}

function LocationModule({ onClose, onToast }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sharing, setSharing] = useState(false);

  const fetchLocation = () => {
    setLoading(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          accuracy: Math.round(pos.coords.accuracy),
          time: new Date().toLocaleTimeString(),
        });
        setLoading(false);
        onToast({ type: "success", title: "📍 Location Fetched", message: "Your current location has been retrieved." });
      },
      err => {
        setError("Location permission denied. Please allow location access.");
        setLoading(false);
      }
    );
  };

  const shareLocation = () => {
    if (!location) return;
    setSharing(true);
    setTimeout(() => {
      setSharing(false);
      onToast({ type: "success", title: "📤 Location Shared", message: "Your live location has been sent to emergency contacts." });
    }, 1500);
  };

  return (
    <div className="module-panel">
      <div className="module-header">
        <div className="module-title-wrap">
          <div className="card-icon-wrap location">📍</div>
          <div>
            <div className="module-title">Live Location</div>
            <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>Share real-time GPS with contacts</div>
          </div>
        </div>
        <button className="module-close" onClick={onClose}>✕</button>
      </div>

      <div className="location-map-mock">
        <div className="location-map-grid" />
        {location ? (
          <>
            <div className="location-pin">📍</div>
            <div className="location-coords">{location.lat}°N, {location.lng}°E</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem", opacity: 0.4 }}>🗺️</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", position: "relative", zIndex: 1 }}>Tap below to fetch your location</div>
          </>
        )}
      </div>

      {error && <div className="error-msg">⚠️ {error}</div>}

      <button className="location-fetch-btn" onClick={fetchLocation} disabled={loading}>
        {loading ? <><span className="spinner" /> Fetching location...</> : "📡 Get My Current Location"}
      </button>

      {location && (
        <>
          <div className="location-info-grid">
            <div className="location-info-card">
              <div className="location-info-label">Latitude</div>
              <div className="location-info-value">{location.lat}°</div>
            </div>
            <div className="location-info-card">
              <div className="location-info-label">Longitude</div>
              <div className="location-info-value">{location.lng}°</div>
            </div>
            <div className="location-info-card">
              <div className="location-info-label">Accuracy</div>
              <div className="location-info-value">±{location.accuracy}m</div>
            </div>
            <div className="location-info-card">
              <div className="location-info-label">Last Updated</div>
              <div className="location-info-value">{location.time}</div>
            </div>
          </div>
          <div className="divider" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button className="share-btn" onClick={shareLocation} disabled={sharing}>
              {sharing ? <><span className="spinner" /> Sharing...</> : "📤 Share with Emergency Contacts"}
            </button>
            <button className="share-btn" onClick={() => {
              navigator.clipboard?.writeText(`https://maps.google.com/maps?q=${location.lat},${location.lng}`);
              onToast({ type: "success", title: "🔗 Link Copied", message: "Location link copied to clipboard." });
            }}>
              🔗 Copy Location Link
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ContactsModule({ user, onClose, onToast }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", relation: "" });

  useEffect(() => {
    firebase.getContacts(user.uid).then(c => { setContacts(c); setLoading(false); });
  }, []);

  const addContact = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      onToast({ type: "error", title: "Missing fields", message: "Please enter both name and phone number." });
      return;
    }
    setAdding(true);
    const newC = await firebase.addContact(user.uid, { name: form.name.trim(), phone: form.phone.trim(), relation: form.relation.trim() || "Contact" });
    setContacts(c => [...c, newC]);
    setForm({ name: "", phone: "", relation: "" });
    setAdding(false);
    onToast({ type: "success", title: "✅ Contact Added", message: `${form.name} has been added as an emergency contact.` });
  };

  const deleteContact = async (id) => {
    await firebase.deleteContact(user.uid, id);
    setContacts(c => c.filter(x => x.id !== id));
    onToast({ type: "success", title: "Removed", message: "Contact has been removed." });
  };

  return (
    <div className="module-panel">
      <div className="module-header">
        <div className="module-title-wrap">
          <div className="card-icon-wrap contacts">👥</div>
          <div>
            <div className="module-title">Emergency Contacts</div>
            <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>{contacts.length} contacts saved</div>
          </div>
        </div>
        <button className="module-close" onClick={onClose}>✕</button>
      </div>

      <div className="contact-form">
        <h3>+ Add New Contact</h3>
        <div className="contact-form-row">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Full Name</label>
            <input placeholder="e.g. Priya Sharma" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Phone Number</label>
            <input placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          </div>
        </div>
        <div className="form-group" style={{ margin: "10px 0" }}>
          <label>Relation (optional)</label>
          <input placeholder="e.g. Mother, Friend, Sister" value={form.relation} onChange={e => setForm(f => ({ ...f, relation: e.target.value }))} />
        </div>
        <button className="form-submit" onClick={addContact} disabled={adding}>
          {adding ? <><span className="spinner" /> Adding...</> : "Add Emergency Contact"}
        </button>
      </div>

      <p className="section-label">Saved Contacts</p>
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.4)" }}>
          <span className="spinner" /> Loading...
        </div>
      ) : contacts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div>No emergency contacts yet.</div>
          <div style={{ marginTop: 4, color: "rgba(255,255,255,0.25)" }}>Add contacts who will be notified during an SOS alert.</div>
        </div>
      ) : (
        <div className="contact-list">
          {contacts.map((c, i) => (
            <div key={c.id} className="contact-card">
              <div className="contact-info">
                <div className="contact-avatar">{c.name[0].toUpperCase()}</div>
                <div>
                  <div className="contact-name">{c.name}</div>
                  <div className="contact-phone">{c.phone}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="contact-badge">{c.relation || "Contact"}</span>
                <button className="contact-delete" onClick={() => deleteContact(c.id)} title="Remove contact">🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const INITIAL_MESSAGES = [
  { role: "bot", text: "Hi! I'm your Suraksha Safety Assistant 💙\n\nI'm here to guide you through any unsafe situation. You can ask me about being followed, harassment, safe routes, or emergency resources.\n\nWhat can I help you with today?" }
];

function AIModule({ onClose }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages(m => [...m, { role: "user", text: msg }]);
    setThinking(true);
    await new Promise(r => setTimeout(r, 900 + Math.random() * 600));
    const response = getAIResponse(msg);
    setThinking(false);
    setMessages(m => [...m, { role: "bot", text: response }]);
  };

  const quickPrompts = ["I'm being followed", "I feel unsafe", "Safe route tips", "Emergency numbers", "I was harassed"];

  return (
    <div className="module-panel">
      <div className="module-header">
        <div className="module-title-wrap">
          <div className="card-icon-wrap ai">🤖</div>
          <div>
            <div className="module-title">AI Safety Assistant</div>
            <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)" }}>Powered by Suraksha AI</div>
          </div>
        </div>
        <button className="module-close" onClick={onClose}>✕</button>
      </div>
      <div className="ai-quick-btns">
        {quickPrompts.map((p, i) => (
          <button key={i} className="ai-quick-btn" onClick={() => sendMessage(p)}>{p}</button>
        ))}
      </div>
      <div className="ai-chat">
        <div className="ai-messages">
          {messages.map((m, i) => (
            <div key={i} className={`ai-msg ${m.role}`}>
              <div className={`ai-msg-avatar ${m.role}`}>{m.role === "bot" ? "🛡️" : "👤"}</div>
              <div className="ai-msg-bubble" style={{ whiteSpace: "pre-line" }}>{m.text}</div>
            </div>
          ))}
          {thinking && (
            <div className="ai-msg bot">
              <div className="ai-msg-avatar bot">🛡️</div>
              <div className="ai-msg-bubble">
                <div className="ai-typing"><span/><span/><span/></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="ai-input-row">
          <textarea
            className="ai-input"
            rows={1}
            placeholder="Describe your situation…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <button className="ai-send" onClick={() => sendMessage()} disabled={thinking || !input.trim()}>➤</button>
        </div>
      </div>
    </div>
  );
}

function ProfileModule({ user, onLogout, onClose }) {
  const initials = user.displayName ? user.displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : user.email[0].toUpperCase();
  const [loggingOut, setLoggingOut] = useState(false);
  const joinDate = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  const handleLogout = async () => {
    setLoggingOut(true);
    await firebase.signOut();
    onLogout();
  };

  return (
    <div className="module-panel">
      <div className="module-header">
        <div className="module-title-wrap">
          <div className="module-title">Your Profile</div>
        </div>
        <button className="module-close" onClick={onClose}>✕</button>
      </div>
      <div className="profile-card">
        <div className="profile-avatar">{initials}</div>
        <div className="profile-name">{user.displayName || "Suraksha User"}</div>
        <div className="profile-email">{user.email}</div>
        <div className="profile-stats">
          <div className="profile-stat"><div className="profile-stat-num">🛡️</div><div className="profile-stat-label">Protected</div></div>
          <div className="profile-stat"><div className="profile-stat-num">✅</div><div className="profile-stat-label">Verified</div></div>
          <div className="profile-stat"><div className="profile-stat-num">🔒</div><div className="profile-stat-label">Secure</div></div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "1rem", marginBottom: "1rem", textAlign: "left" }}>
          <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Account Details</div>
          {[
            ["Email", user.email],
            ["Member since", joinDate],
            ["Account type", "Standard"],
            ["Security", "Email verified"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: "0.825rem" }}>
              <span style={{ color: "rgba(255,255,255,0.45)" }}>{k}</span>
              <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
        <button className="logout-btn" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? <><span className="spinner" /> Logging out…</> : "↩ Sign Out"}
        </button>
      </div>
    </div>
  );
}

// ──────────── DASHBOARD ────────────
function Dashboard({ user, onLogout }) {
  const [activeModule, setActiveModule] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [toast, setToast] = useState(null);

  const showToast = (t) => {
    setToast(t);
    setTimeout(() => setToast(null), 3500);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user.displayName ? user.displayName.split(" ")[0] : "there";
  const timeStr = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  const cards = [
    { id: "sos", icon: "🚨", label: "sos", title: "SOS Emergency", desc: "Instantly alert your emergency contacts and share your GPS location with one tap." },
    { id: "location", icon: "📍", label: "location", title: "Live Location", desc: "Fetch and share your real-time coordinates with trusted contacts." },
    { id: "contacts", icon: "👥", label: "contacts", title: "Emergency Contacts", desc: "Manage the people who get notified when you trigger an SOS alert." },
    { id: "ai", icon: "🤖", label: "ai", title: "AI Safety Assistant", desc: "Get real-time safety guidance and situation-specific advice from Suraksha AI." },
  ];

  const closeModule = () => setActiveModule(null);

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div className="nav-logo">
          <LogoMark />
          <span className="nav-logo-text">Sura<span>ksha</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)" }}>
            {user.displayName || user.email.split("@")[0]}
          </div>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: "0.875rem", fontWeight: 700,
          }} onClick={() => setActiveModule("profile")}>
            {(user.displayName ? user.displayName[0] : user.email[0]).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="dash-content" style={{ paddingBottom: 100 }}>
        <div className="dash-greeting">
          <div className="dash-time">📅 {timeStr}</div>
          <h2>{greeting}, {firstName} 👋</h2>
          <p>Stay safe. Your protection is our priority.</p>
        </div>

        <div className="status-strip">
          <div className="status-item"><div className="status-dot green" /><span className="status-label">Suraksha Active</span></div>
          <div className="status-item"><div className="status-dot blue" /><span className="status-label">AI Assistant Online</span></div>
          <div className="status-item"><div className="status-dot yellow" /><span className="status-label">Location: Standby</span></div>
        </div>

        <p className="section-label">Safety Features</p>
        <div className="cards-grid">
          {cards.map(card => (
            <div key={card.id} className={`feature-card ${card.label}`} onClick={() => setActiveModule(card.id)}>
              <div className={`card-icon-wrap ${card.label}`}>{card.icon}</div>
              <div className="card-title">{card.title}</div>
              <div className="card-desc">{card.desc}</div>
              <div className="card-arrow">Open → </div>
            </div>
          ))}
        </div>

        <p className="section-label" style={{ marginTop: "1.5rem" }}>Emergency Helplines</p>
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
          {[
            { icon: "🚔", label: "Police", num: "100" },
            { icon: "🚑", label: "Ambulance", num: "108" },
            { icon: "📞", label: "Emergency", num: "112" },
            { icon: "👩", label: "Women's Helpline", num: "1091" },
          ].map((h, i, arr) => (
            <div key={h.num} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.1rem" }}>{h.icon}</span>
                <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.75)" }}>{h.label}</span>
              </div>
              <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#60a5fa", fontFamily: "monospace" }}>{h.num}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="bottom-nav">
        {[
          { id: "home", icon: "🏠", label: "Home" },
          { id: "sos", icon: "🚨", label: "SOS" },
          { id: "location", icon: "📍", label: "Location" },
          { id: "profile", icon: "👤", label: "Profile" },
        ].map(tab => (
          <button
            key={tab.id}
            className={`bottom-nav-item ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id !== "home") setActiveModule(tab.id);
              else setActiveModule(null);
            }}
          >
            <span className="bottom-nav-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Module Overlays */}
      {activeModule === "sos" && <SOSModule user={user} onClose={closeModule} onToast={showToast} />}
      {activeModule === "location" && <LocationModule onClose={closeModule} onToast={showToast} />}
      {activeModule === "contacts" && <ContactsModule user={user} onClose={closeModule} onToast={showToast} />}
      {activeModule === "ai" && <AIModule onClose={closeModule} />}
      {activeModule === "profile" && <ProfileModule user={user} onLogout={onLogout} onClose={closeModule} />}

      <Toast toast={toast} />
    </div>
  );
}

// ──────────── AUTH MODAL ────────────
function AuthModal({ mode, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState(mode);

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      if (view === "signup") {
        if (!form.name.trim()) { setError("Please enter your name."); setLoading(false); return; }
        if (form.password.length < 6) { setError("Password must be at least 6 characters."); setLoading(false); return; }
        const user = await firebase.signUp(form.email, form.password, form.name.trim());
        onSuccess(user);
      } else {
        const user = await firebase.signIn(form.email, form.password);
        onSuccess(user);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ position: "relative" }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-logo">
          <div className="nav-logo-icon">🛡️</div>
          <span className="nav-logo-text" style={{ fontSize: "1.1rem" }}>Sura<span>ksha</span></span>
        </div>
        <h2 style={{ marginTop: "0.75rem" }}>{view === "login" ? "Welcome back" : "Create your account"}</h2>
        <p className="modal-sub">{view === "login" ? "Sign in to access your safety dashboard" : "Join Suraksha and stay protected"}</p>
        {error && <div className="error-msg">⚠️ {error}</div>}
        {view === "signup" && (
          <div className="form-group">
            <label>Full Name</label>
            <input placeholder="e.g. Aanya Patel" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
        )}
        <div className="form-group">
          <label>Email Address</label>
          <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder={view === "signup" ? "Minimum 6 characters" : "Your password"} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        <button className="form-submit" onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="spinner" /> {view === "login" ? "Signing in…" : "Creating account…"}</> : view === "login" ? "Sign In" : "Create Account"}
        </button>
        <div className="form-switch">
          {view === "login" ? (
            <>Don't have an account? <button onClick={() => { setView("signup"); setError(""); }}>Sign up free</button></>
          ) : (
            <>Already have an account? <button onClick={() => { setView("login"); setError(""); }}>Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────── LANDING PAGE ────────────
function LandingPage({ onOpenAuth }) {
  const features = [
    { icon: "🚨", title: "Emergency SOS", desc: "One tap alert to contacts" },
    { icon: "📍", title: "Live Location", desc: "Real-time GPS sharing" },
    { icon: "🤖", title: "AI Assistance", desc: "Situation-aware guidance" },
    { icon: "👥", title: "Safety Network", desc: "Trusted contacts hub" },
  ];

  const whyItems = [
    ["🔒", "End-to-end Privacy", "Your data never leaves your control. All location data is shared only with your chosen contacts."],
    ["⚡", "Instant Response", "Suraksha SOS works offline and alerts contacts within seconds — no app navigation needed."],
    ["🧠", "AI-Powered Advice", "Get real-time, context-aware safety advice for any situation you face."],
    ["📱", "Works Everywhere", "Fully responsive on mobile, tablet, and desktop. Always accessible when you need it."],
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a1628" }}>
      <nav className="nav">
        <div className="nav-logo">
          <LogoMark />
          <span className="nav-logo-text">Sura<span>ksha</span></span>
        </div>
        <div className="nav-actions">
          <button className="btn-ghost" onClick={() => onOpenAuth("login")}>Sign In</button>
          <button className="btn-primary" onClick={() => onOpenAuth("signup")}>Get Started</button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-badge"><div className="hero-badge-dot" />Women Safety Reimagined</div>
        <h1>Your safety,<br /><em>always one tap away</em></h1>
        <p className="hero-sub">Suraksha gives you instant SOS alerts, live location sharing, AI safety guidance, and a trusted emergency network — whenever you need it.</p>
        <div className="hero-cta">
          <button className="btn-large primary" onClick={() => onOpenAuth("signup")}>Get Protected Free →</button>
          <button className="btn-large outline" onClick={() => onOpenAuth("login")}>Sign In</button>
        </div>
        <div className="hero-features">
          {features.map((f, i) => (
            <div key={i} className="hero-feature-card">
              <div className="hero-feature-icon">{f.icon}</div>
              <div className="hero-feature-title">{f.title}</div>
              <div className="hero-feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "5rem 2rem", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="hero-badge" style={{ margin: "0 auto 1rem" }}>Why Suraksha</div>
          <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            Built for the moments<br />that matter most
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {whyItems.map(([icon, title, desc], i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "1.5rem" }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{icon}</div>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "0.95rem" }}>{title}</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "3rem 2rem 6rem", textAlign: "center" }}>
        <div style={{
          maxWidth: 600, margin: "0 auto",
          background: "linear-gradient(135deg, rgba(37,99,235,0.15), rgba(6,182,212,0.1))",
          border: "1px solid rgba(37,99,235,0.25)", borderRadius: 24, padding: "3rem 2rem"
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🛡️</div>
          <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "0.75rem", fontFamily: "'DM Sans', sans-serif" }}>Start your protection today</h3>
          <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "1.5rem", lineHeight: 1.6 }}>Free. Secure. Always with you.</p>
          <button className="btn-large primary" onClick={() => onOpenAuth("signup")} style={{ fontSize: "0.95rem" }}>Create Free Account →</button>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "1.5rem 2rem", textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>
        © 2025 Suraksha · Women Safety Platform · Built with 💙
      </footer>
    </div>
  );
}

// ──────────── ROOT APP ────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authModal, setAuthModal] = useState(null);

  useEffect(() => {
    const unsub = firebase.onAuthStateChanged(u => {
      setUser(u);
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  if (!authChecked) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a1628", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: "3rem" }}>🛡️</div>
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "1.5rem", fontWeight: 700 }}>Suraksha</div>
        <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="suraksha-app">
        {user ? (
          <Dashboard user={user} onLogout={() => setUser(null)} />
        ) : (
          <LandingPage onOpenAuth={(mode) => setAuthModal(mode)} />
        )}
        {authModal && !user && (
          <AuthModal
            mode={authModal}
            onClose={() => setAuthModal(null)}
            onSuccess={(u) => { setUser(u); setAuthModal(null); }}
          />
        )}
      </div>
    </>
  );
}
