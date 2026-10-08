/**
 * Contrato compartilhado entre os formulários de captação (rodapé, modal
 * "Falar com Especialista" e simulador) e o endpoint /api/leads, que a rota
 * do Next encaminha para o backend (backend/src/leads/dto/create-lead.dto.ts).
 */

export const CONTACT_SUBJECTS = [
  'Planejamento Previdenciário',
  'Auditoria de CNIS e Vínculos',
  'Tempo Especial & Insalubridade (PPP)',
  'Revisão de Aposentadoria Concedida',
  'Benefício por Incapacidade ou BPC / LOAS',
  'Outro Assunto Previdenciário',
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

export const CONTACT_LIMITS = {
  name: 120,
  email: 254,
  phoneDigitsMin: 10,
  phoneDigitsMax: 11,
  message: 1500,
  origin: 80,
} as const;

/** Canal de captação, exibido no e-mail como "Origem do Lead". */
export type LeadSource = 'footer' | 'specialist_modal' | 'simulator';

export interface LeadPayload {
  source: LeadSource;
  name: string;
  email: string;
  phone: string;
  subject?: ContactSubject;
  careerStage?: string;
  services?: string[];
  referralSource?: string;
  message?: string;
  /** Ponto exato do site, ex.: "Navbar · Falar com Especialista". */
  origin?: string;
  scheduleSession?: boolean;
  /** Aceite explícito da Política de Privacidade. */
  privacyConsent?: boolean;
  /** Honeypot anti-spam: deve chegar sempre vazio. */
  website?: string;
}

export const LEAD_SUCCESS_MESSAGE =
  'Solicitação enviada com sucesso! Nossos advogados especialistas entrarão em contato em breve.';

/** Envia o lead para /api/leads. Lança Error com mensagem pronta para o usuário. */
export async function submitLead(payload: LeadPayload): Promise<void> {
  let res: Response;
  try {
    res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Sem conexão no momento. Verifique sua internet e tente novamente.');
  }
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || 'Não foi possível enviar agora. Tente novamente em instantes.');
  }
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/** Formata progressivamente um telefone brasileiro: (11) 91234-5678 / (11) 1234-5678. */
export function formatBrazilianPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, CONTACT_LIMITS.phoneDigitsMax);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  const splitAt = digits.length === 11 ? 5 : 4;
  return `(${ddd}) ${rest.slice(0, splitAt)}-${rest.slice(splitAt)}`;
}
