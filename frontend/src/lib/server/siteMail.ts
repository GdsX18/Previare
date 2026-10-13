import "server-only";
import nodemailer from "nodemailer";

/**
 * Envio dos e-mails do site (contato, diagnóstico do rodapé, informativo) para a caixa do escritório.
 * Configuração via ambiente: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL.
 */

// ── Rate limit simples em memória (por instância) ──────────────────────────
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_MAX_REQUESTS;
}

export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Remove quebras de linha para uso seguro em cabeçalhos de e-mail (assunto). */
export function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export interface SiteEmail {
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export type SendResult =
  | { ok: true; delivered: boolean }
  | { ok: false; status: number; error: string };

export async function sendSiteEmail(email: SiteEmail, tag: string): Promise<SendResult> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } =
    process.env;

  if (!SMTP_HOST || !CONTACT_TO_EMAIL) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[${tag}] SMTP não configurado — e-mail não enviado (modo dev):\n` + email.text);
      return { ok: true, delivered: false };
    }
    console.error(`[${tag}] SMTP_HOST/CONTACT_TO_EMAIL ausentes.`);
    return { ok: false, status: 503, error: "Canal temporariamente indisponível." };
  }

  const port = Number(SMTP_PORT) || 587;
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  try {
    await transporter.sendMail({
      from: `"Previare · Site" <${CONTACT_FROM_EMAIL || SMTP_USER || CONTACT_TO_EMAIL}>`,
      to: CONTACT_TO_EMAIL,
      replyTo: email.replyTo,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
  } catch (error) {
    console.error(`[${tag}] Falha no envio SMTP:`, error);
    return { ok: false, status: 502, error: "Não foi possível encaminhar sua solicitação agora." };
  }

  return { ok: true, delivered: true };
}
