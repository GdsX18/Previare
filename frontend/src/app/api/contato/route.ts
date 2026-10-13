import { NextResponse, type NextRequest } from "next/server";
import {
  CONTACT_LIMITS,
  EMAIL_PATTERN,
  isContactPayloadSubject,
  onlyDigits,
  type ContactDetail,
  type SpecialistContactPayload,
} from "@/lib/specialistContact";
import {
  clientIp,
  escapeHtml,
  isRateLimited,
  sendSiteEmail,
  singleLine,
} from "@/lib/server/siteMail";

export const runtime = "nodejs";

type ValidationResult =
  | { ok: true; data: Required<Omit<SpecialistContactPayload, "website">> }
  | { ok: false; error: string };

function validate(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Requisição inválida." };
  }
  const input = body as Record<string, unknown>;
  const str = (key: string) => (typeof input[key] === "string" ? (input[key] as string).trim() : "");

  if (!isContactPayloadSubject(input.subject)) {
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

  const details: ContactDetail[] = (Array.isArray(input.details) ? input.details : [])
    .slice(0, CONTACT_LIMITS.details)
    .flatMap((item: unknown) => {
      if (typeof item !== "object" || item === null) return [];
      const { label, value } = item as Record<string, unknown>;
      if (typeof label !== "string" || typeof value !== "string") return [];
      const l = singleLine(label).slice(0, CONTACT_LIMITS.detailLabel);
      const v = value.trim().slice(0, CONTACT_LIMITS.detailValue);
      return l && v ? [{ label: l, value: v }] : [];
    });

  return {
    ok: true,
    data: { subject: input.subject, name, email, phone: str("phone"), message, origin, details },
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
    ...data.details.map((d) => `${d.label}: ${d.value}`),
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
          ${data.details.map((d) => row(escapeHtml(d.label), escapeHtml(d.value))).join("")}
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
  if (isRateLimited(clientIp(request.headers))) {
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

  const email = buildEmail(result.data);
  const sent = await sendSiteEmail(
    {
      ...email,
      replyTo: `"${result.data.name.replace(/"/g, "")}" <${result.data.email}>`,
    },
    "api/contato"
  );

  if (!sent.ok) {
    return NextResponse.json({ ok: false, error: sent.error }, { status: sent.status });
  }
  return NextResponse.json({ ok: true, delivered: sent.delivered });
}
