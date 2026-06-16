// ══════════════════════════════════════════════════════════════
//  /api/sos-alert  —  Vercel Serverless Function
//
//  Sends a real SOS alert (SMS + Email) to a user's emergency
//  contacts using Twilio (SMS) and SendGrid (Email).
//
//  ── REQUIRED ENVIRONMENT VARIABLES (set in Vercel dashboard) ──
//  Project Settings → Environment Variables → add for Production
//  AND Preview/Development if you test locally with `vercel dev`.
//
//  TWILIO_ACCOUNT_SID      = ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//  TWILIO_AUTH_TOKEN       = your Twilio Auth Token
//  TWILIO_FROM_NUMBER      = +1xxxxxxxxxx   (a Twilio phone number)
//
//  SENDGRID_API_KEY        = SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//  SENDGRID_FROM_EMAIL     = alerts@yourdomain.com  (verified sender in SendGrid)
//
//  NEVER put these values in your code or commit them to git.
//  This file only reads them from process.env at request time.
// ══════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  // CORS — allow calls from your deployed frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  const { userName, location, contacts, channels } = req.body || {};

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({ error: "No emergency contacts provided." });
  }

  const mapsLink = location?.lat && location?.lng
    ? `https://maps.google.com/maps?q=${location.lat},${location.lng}`
    : null;

  const isLocationOnly = Array.isArray(channels) && channels.length === 1 && channels[0] === "sms";

  const messageText = isLocationOnly
    ? `📍 Live location from ${userName || "a Suraksha user"}:\n` +
      (mapsLink ? `${mapsLink}\n` : `Location unavailable.\n`) +
      `Sent via Suraksha Safety App.`
    : `🚨 SOS ALERT from ${userName || "a Suraksha user"}\n` +
      `They may need urgent help.\n` +
      (mapsLink ? `Live location: ${mapsLink}\n` : `Location not available.\n`) +
      `This is an automated message from the Suraksha Safety App.`;

  const results = { sms: [], email: [] };
  const wantSMS   = !channels || channels.includes("sms");
  const wantEmail = !channels || channels.includes("email");

  // ── SMS via Twilio ──────────────────────────────────────────
  if (wantSMS) {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
      results.sms.push({ ok: false, error: "Twilio is not configured on the server (missing env vars)." });
    } else {
      const phoneContacts = contacts.filter(c => c.phone);
      for (const c of phoneContacts) {
        try {
          const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
          const params = new URLSearchParams({
            To: c.phone,
            From: TWILIO_FROM_NUMBER,
            Body: messageText,
          });
          const r = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            {
              method: "POST",
              headers: {
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: params,
            }
          );
          const data = await r.json();
          if (!r.ok) throw new Error(data?.message || `Twilio error ${r.status}`);
          results.sms.push({ ok: true, to: c.phone, sid: data.sid });
        } catch (e) {
          results.sms.push({ ok: false, to: c.phone, error: e.message });
        }
      }
    }
  }

  // ── Email via SendGrid ──────────────────────────────────────
  if (wantEmail) {
    const { SENDGRID_API_KEY, SENDGRID_FROM_EMAIL } = process.env;
    if (!SENDGRID_API_KEY || !SENDGRID_FROM_EMAIL) {
      results.email.push({ ok: false, error: "SendGrid is not configured on the server (missing env vars)." });
    } else {
      const emailContacts = contacts.filter(c => c.email);
      if (emailContacts.length === 0) {
        results.email.push({ ok: false, error: "No contacts have an email address saved." });
      } else {
        try {
          const r = await fetch("https://api.sendgrid.com/v3/mail/send", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${SENDGRID_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              personalizations: emailContacts.map(c => ({
                to: [{ email: c.email, name: c.name || "" }],
              })),
              from: { email: SENDGRID_FROM_EMAIL, name: "Suraksha Alerts" },
              subject: `🚨 SOS Alert from ${userName || "a Suraksha user"}`,
              content: [{ type: "text/plain", value: messageText }],
            }),
          });
          if (!r.ok) {
            const data = await r.json().catch(() => ({}));
            throw new Error(data?.errors?.[0]?.message || `SendGrid error ${r.status}`);
          }
          results.email.push({ ok: true, to: emailContacts.map(c => c.email) });
        } catch (e) {
          results.email.push({ ok: false, error: e.message });
        }
      }
    }
  }

  const anySuccess =
    results.sms.some(r => r.ok) || results.email.some(r => r.ok);

  return res.status(anySuccess ? 200 : 502).json({
    ok: anySuccess,
    results,
  });
}
