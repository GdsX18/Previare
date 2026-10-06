import { NextResponse, type NextRequest } from "next/server";
import nodemailer from "nodemailer";
import {
  CONTACT_LIMITS,
  EMAIL_PATTERN,
  isContactSubject,
  onlyDigits,
  type SpecialistContactPayload,
} from "@/lib/specialistContact";

export const runtime = "nodejs";

// ── Rate limit simples em memória (por instância) ──────────────────────────
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_MAX_REQUESTS;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Remove quebras de linha para uso seguro em cabeçalhos de e-mail (assunto). */
function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

type ValidationResult =
  | { ok: true; data: Required<Omit<SpecialistContactPayload, "website">> }
  | { ok: false; error: string };

function validate(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Requisição inválida." };
  }
  const input = body as Record<string, unknown>;
  const str = (key: string) => (typeof input[key] === "string" ? (input[key] as string).trim() : "");

  if (!isContactSubject(input.subject)) {
    return { ok: false, error: "Selecione o assunto do atendimento." };
  }

  const name = singleLine(str("name"));
  if (name.length < 3 || name.length > CONTACT_LIMITS.name) {
    return { ok: false, error: "Informe seu nome completo." };
  }

  const email = str("email").toLowerCase();
  if (!EMAIL_PATTERN.test(email) || email.length > CONTACT_LIMITS.email) {
    return { ok: false, error: "Informe um e-mail válido." };
  }

  const phoneDigits = onlyDigits(str("phone"));
  if (
    phoneDigits.length < CONTACT_LIMITS.phoneDigitsMin ||
    phoneDigits.length > CONTACT_LIMITS.phoneDigitsMax
  ) {
    return { ok: false, error: "Informe um telefone válido com DDD." };
  }

  const message = str("message").slice(0, CONTACT_LIMITS.message);
  const origin = singleLine(str("origin")).slice(0, CONTACT_LIMITS.origin) || "Site";

  return {
    ok: true,
    data: { subject: input.subject, name, email, phone: str("phone"), message, origin },
  };
}

function buildEmail(data: Required<Omit<SpecialistContactPayload, "website">>) {
  const phoneDigits = onlyDigits(data.phone);
  const whatsappUrl = `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(
    `Olá, ${data.name.split(" ")[0]}! Aqui é da equipe jurídica da Previare, recebemos sua solicitação sobre "${data.subject}".`
  )}`;
  const receivedAt = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const message = data.message || "(O requerente não enviou relato do caso.)";

  const subject = `[${data.subject}] Novo atendimento — ${data.name}`;

  const text = [
    `Nova solicitação de atendimento — ${data.subject}`,
    "",
    `Nome: ${data.name}`,
    `Telefone / WhatsApp: ${data.phone}`,
    `WhatsApp direto: ${whatsappUrl}`,
    `E-mail: ${data.email}`,
    `Origem no site: ${data.origin}`,
    `Recebido em: ${receivedAt}`,
    "",
    "Relato do caso:",
    message,
  ].join("\n");

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 0;color:#5B6E60;font-size:13px;width:170px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;color:#1F3325;font-size:15px;font-weight:600;">${value}</td>
    </tr>`;

  const html = `
  <div style="background:#EAF2EB;padding:32px 16px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #D5E4D7;">
      <div style="background:#2F7335;padding:24px 28px;">
        <div style="color:#CDEBCB;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Canal Direto · Previare</div>
        <div style="color:#ffffff;font-size:20px;font-weight:700;margin-top:6px;">${escapeHtml(data.subject)}</div>
      </div>
      <div style="padding:24px 28px;">
        <table style="width:100%;border-collapse:collapse;">
          ${row("Nome completo", escapeHtml(data.name))}
          ${row("Telefone / WhatsApp", `${escapeHtml(data.phone)} &nbsp;<a href="${escapeHtml(whatsappUrl)}" style="display:inline-block;background:#25D366;color:#ffffff;text-decoration:none;font-size:12px;padding:4px 10px;border-radius:999px;">Abrir WhatsApp</a>`)}
          ${row("E-mail", `<a href="mailto:${escapeHtml(data.email)}" style="color:#2F7335;">${escapeHtml(data.email)}</a>`)}
          ${row("Origem no site", escapeHtml(data.origin))}
          ${row("Recebido em", escapeHtml(receivedAt))}
        </table>
        <div style="margin-top:20px;padding:18px 20px;background:#F4F8F4;border-radius:14px;border:1px solid #E0ECE1;">
          <div style="color:#5B6E60;font-size:12px;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">Relato do caso</div>
          <div style="color:#1F3325;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</div>
        </div>
      </div>
      <div style="padding:16px 28px;border-top:1px solid #E6EFE7;color:#7A8C7E;font-size:11px;line-height:1.5;">
        Dados protegidos por sigilo profissional (Estatuto da OAB) e pela LGPD. Responda este e-mail para falar diretamente com o requerente.
      </div>
    </div>
  </div>`;

  return { subject, text, html };
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Muitas solicitações em sequência. Tente novamente em alguns minutos." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  // Honeypot preenchido: responde sucesso sem enviar (não sinaliza ao robô).
  if (typeof body === "object" && body !== null && (body as Record<string, unknown>).website) {
    return NextResponse.json({ ok: true });
  }

  const result = validate(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } =
    process.env;
  const email = buildEmail(result.data);

  if (!SMTP_HOST || !CONTACT_TO_EMAIL) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[api/contato] SMTP não configurado — e-mail não enviado (modo dev):\n" + email.text);
      return NextResponse.json({ ok: true, delivered: false });
    }
    console.error("[api/contato] SMTP_HOST/CONTACT_TO_EMAIL ausentes.");
    return NextResponse.json(
      { ok: false, error: "Canal temporariamente indisponível." },
      { status: 503 }
    );
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
      replyTo: `"${result.data.name.replace(/"/g, "")}" <${result.data.email}>`,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });
  } catch (error) {
    console.error("[api/contato] Falha no envio SMTP:", error);
    return NextResponse.json(
      { ok: false, error: "Não foi possível encaminhar sua solicitação agora." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, delivered: true });
}
