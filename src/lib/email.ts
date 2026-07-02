// Envoi d'emails via Resend (API HTTP, pas de dépendance npm).
// Config via env : RESEND_API_KEY, EMAIL_FROM, APP_URL.

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "Siyaqi <noreply@siyaqi.com>";
export const APP_URL = process.env.APP_URL || "https://siyaqi.com";

type SendArgs = { to: string; subject: string; html: string; text: string };

export async function sendEmail({ to, subject, html, text }: SendArgs) {
  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY manquant — email non envoyé");
    return { ok: false };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: EMAIL_FROM, to: [to], subject, html, text }),
    });
    if (!res.ok) {
      console.error("Resend error:", res.status, await res.text());
      return { ok: false };
    }
    return { ok: true };
  } catch (e) {
    console.error("Resend fetch failed:", e);
    return { ok: false };
  }
}

// Email de confirmation de compte (avec bonus de parrainage éventuel)
export async function sendVerificationEmail(to: string, fullName: string, token: string) {
  const link = `${APP_URL}/verify?token=${token}`;
  const subject = "Confirmez votre compte Siyaqi";
  const text =
    `Bonjour ${fullName},\n\n` +
    `Bienvenue sur Siyaqi ! Confirmez votre compte en ouvrant ce lien :\n${link}\n\n` +
    `Ce lien est valable 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.\n\n— L'équipe Siyaqi`;
  const html = `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#111">
    <h2 style="color:#2563eb;margin:0 0 16px">Bienvenue sur Siyaqi 🚗</h2>
    <p>Bonjour <b>${fullName}</b>,</p>
    <p>Il ne reste qu'une étape : <b>confirmer votre adresse email</b> pour activer votre compte.</p>
    <p style="text-align:center;margin:28px 0">
      <a href="${link}" style="background:#2563eb;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;display:inline-block;font-weight:bold">Confirmer mon compte</a>
    </p>
    <p style="font-size:13px;color:#666">Ou copiez ce lien : <br>${link}</p>
    <p style="font-size:13px;color:#666">Ce lien est valable 24 heures. Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.</p>
    <p style="font-size:13px;color:#999;margin-top:24px">— L'équipe Siyaqi</p>
  </div>`;
  return sendEmail({ to, subject, html, text });
}
