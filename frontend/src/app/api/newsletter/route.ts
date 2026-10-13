import { NextResponse, type NextRequest } from "next/server";
import { CONTACT_LIMITS, EMAIL_PATTERN } from "@/lib/specialistContact";
import { clientIp, escapeHtml, isRateLimited, sendSiteEmail } from "@/lib/server/siteMail";

export const runtime = "nodejs";

/** Inscrição no Informativo Técnico: notifica a caixa do escritório por e-mail. */
export async function POST(request: NextRequest) {
  if (isRateLimited(clientIp(request.headers))) {
    return NextResponse.json(
      { ok: false, error: "Muitas solicitações em sequência. Tente novamente em alguns minutos." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed = await request.json();
    if (typeof parsed !== "object" || parsed === null) throw new Error();
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  // Honeypot preenchido: responde sucesso sem enviar (não sinaliza ao robô).
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_PATTERN.test(email) || email.length > CONTACT_LIMITS.email) {
    return NextResponse.json({ ok: false, error: "Informe um e-mail válido." }, { status: 422 });
  }
  if (body.consent !== true) {
    return NextResponse.json(
      { ok: false, error: "É necessário autorizar o envio para concluir a inscrição." },
      { status: 422 }
    );
  }

  const receivedAt = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const safeEmail = escapeHtml(email);

  const sent = await sendSiteEmail(
    {
      subject: `[Informativo Técnico] Nova inscrição — ${email}`,
      text: [
        "Nova inscrição no Informativo Técnico Previare",
        "",
        `E-mail: ${email}`,
        "Origem no site: Blog",
        "Consentimento LGPD: sim",
        `Recebido em: ${receivedAt}`,
      ].join("\n"),
      html: `
  <div style="background:#EAF2EB;padding:32px 16px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #D5E4D7;">
      <div style="background:#2F7335;padding:24px 28px;">
        <div style="color:#CDEBCB;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Informativo Técnico · Previare</div>
        <div style="color:#ffffff;font-size:20px;font-weight:700;margin-top:6px;">Nova inscrição</div>
      </div>
      <div style="padding:24px 28px;color:#1F3325;font-size:15px;line-height:1.8;">
        <div><span style="color:#5B6E60;font-size:13px;">E-mail:</span> <a href="mailto:${safeEmail}" style="color:#2F7335;font-weight:600;">${safeEmail}</a></div>
        <div><span style="color:#5B6E60;font-size:13px;">Origem no site:</span> Blog</div>
        <div><span style="color:#5B6E60;font-size:13px;">Consentimento LGPD:</span> sim</div>
        <div><span style="color:#5B6E60;font-size:13px;">Recebido em:</span> ${escapeHtml(receivedAt)}</div>
      </div>
    </div>
  </div>`,
      replyTo: email,
    },
    "api/newsletter"
  );

  if (!sent.ok) {
    return NextResponse.json({ ok: false, error: sent.error }, { status: sent.status });
  }
  return NextResponse.json({ ok: true, delivered: sent.delivered });
}
