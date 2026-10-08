import type { PreviareContact } from '@prisma/client';

const SOURCE_LABELS: Record<string, string> = {
  footer: 'Formulário do Rodapé',
  specialist_modal: 'Modal de Especialista',
  simulator: 'Simulador Atuarial',
};

export function sourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Link wa.me com DDI do Brasil a partir de um telefone com DDD (10–11 dígitos). */
export function whatsappUrl(phone: string, firstName: string): string {
  const digits = phone.replace(/\D/g, '');
  const e164 = digits.length <= 11 ? `55${digits}` : digits;
  const text = `Olá, ${firstName}! Aqui é da equipe jurídica da Previare, recebemos sua solicitação pelo site.`;
  return `https://wa.me/${e164}?text=${encodeURIComponent(text)}`;
}

export interface LeadEmail {
  subject: string;
  text: string;
  html: string;
}

export function buildLeadNotificationEmail(lead: PreviareContact): LeadEmail {
  const origin = sourceLabel(lead.origem);
  const firstName = lead.nome.split(' ')[0];
  const waUrl = whatsappUrl(lead.telefone, firstName);
  const receivedAt = lead.createdAt.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'full',
    timeStyle: 'short',
  });
  const services = lead.servicosInteresse.length ? lead.servicosInteresse.join(', ') : 'Não informado';
  const message = lead.mensagem || '(O cliente não enviou mensagem.)';
  const consent = lead.consentimentoLgpd
    ? 'Sim — aceitou a Política de Privacidade e autorizou o contato'
    : 'Não coletado neste formulário (contato solicitado pelo próprio titular)';
  const schedule = lead.desejaAgendamento ? 'Sim' : 'Não';

  const subject = `[${origin}] Novo lead — ${lead.nome}${lead.assunto ? ` · ${lead.assunto}` : ''}`;

  const text = [
    `Novo lead recebido pelo site da Previare`,
    `Origem do lead: ${origin}${lead.origemDetalhe ? ` (${lead.origemDetalhe})` : ''}`,
    '',
    'DADOS PESSOAIS',
    `Nome: ${lead.nome}`,
    `E-mail: ${lead.email}`,
    `Telefone / WhatsApp: ${lead.telefone}`,
    `WhatsApp direto: ${waUrl}`,
    '',
    'CONTEXTO PREVIDENCIÁRIO',
    `Assunto: ${lead.assunto ?? 'Não informado'}`,
    `Momento profissional: ${lead.momentoProfissional ?? 'Não informado'}`,
    `Serviços de interesse: ${services}`,
    `Como conheceu a Previare: ${lead.comoConheceu ?? 'Não informado'}`,
    `Deseja agendar sessão de alinhamento: ${schedule}`,
    '',
    'MENSAGEM / TRAJETÓRIA',
    message,
    '',
    `Recebido em: ${receivedAt}`,
    `Consentimento LGPD: ${consent}`,
    `Protocolo: ${lead.id}`,
  ].join('\n');

  const sectionTitle = (title: string) => `
    <tr><td colspan="2" style="padding:22px 0 6px;color:#2F7335;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-bottom:1px solid #E6EFE7;">${title}</td></tr>`;

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:10px 12px 10px 0;color:#5B6E60;font-size:13px;width:180px;vertical-align:top;">${label}</td>
      <td style="padding:10px 0;color:#1F3325;font-size:15px;font-weight:600;vertical-align:top;">${value}</td>
    </tr>`;

  const optional = (value: string | null) => escapeHtml(value ?? 'Não informado');

  const html = `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;background:#EAF2EB;">
  <div style="background:#EAF2EB;padding:32px 16px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #D5E4D7;">
      <div style="background:#2F7335;padding:24px 28px;">
        <div style="color:#CDEBCB;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Novo lead · Site Previare</div>
        <div style="color:#ffffff;font-size:21px;font-weight:700;margin-top:6px;">${escapeHtml(lead.nome)}</div>
        <div style="display:inline-block;margin-top:12px;background:rgba(255,255,255,0.16);color:#ffffff;font-size:12px;padding:5px 12px;border-radius:999px;">
          Origem: <strong>${escapeHtml(origin)}</strong>${lead.origemDetalhe ? ` · ${escapeHtml(lead.origemDetalhe)}` : ''}
        </div>
      </div>
      <div style="padding:8px 28px 24px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;">
          ${sectionTitle('Dados pessoais')}
          ${row('Nome completo', escapeHtml(lead.nome))}
          ${row('E-mail', `<a href="mailto:${escapeHtml(lead.email)}" style="color:#2F7335;">${escapeHtml(lead.email)}</a>`)}
          ${row(
            'Telefone / WhatsApp',
            `${escapeHtml(lead.telefone)}<br><a href="${escapeHtml(waUrl)}" style="display:inline-block;margin-top:6px;background:#25D366;color:#ffffff;text-decoration:none;font-size:12px;font-weight:600;padding:5px 12px;border-radius:999px;">Abrir conversa no WhatsApp</a>`,
          )}
          ${sectionTitle('Contexto previdenciário')}
          ${row('Assunto', optional(lead.assunto))}
          ${row('Momento profissional', optional(lead.momentoProfissional))}
          ${row('Serviços de interesse', escapeHtml(services))}
          ${row('Como conheceu', optional(lead.comoConheceu))}
          ${row('Agendar sessão', schedule)}
        </table>

        <div style="margin-top:22px;padding:18px 20px;background:#F4F8F4;border-left:4px solid #2F7335;border-radius:12px;">
          <div style="color:#5B6E60;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Mensagem / trajetória do cliente</div>
          <div style="color:#1F3325;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(message)}</div>
        </div>

        <table role="presentation" style="width:100%;border-collapse:collapse;margin-top:8px;">
          ${sectionTitle('Registro')}
          ${row('Recebido em', escapeHtml(receivedAt))}
          ${row('Consentimento LGPD', escapeHtml(consent))}
          ${row('Protocolo', `<span style="font-family:Consolas,Menlo,monospace;font-weight:400;">${escapeHtml(lead.id)}</span>`)}
        </table>
      </div>
      <div style="padding:16px 28px;border-top:1px solid #E6EFE7;color:#7A8C7E;font-size:11px;line-height:1.5;">
        Dados protegidos por sigilo profissional (Estatuto da OAB) e pela LGPD. Responda este e-mail para falar diretamente com o cliente.
      </div>
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
}
