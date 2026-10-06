/**
 * Contrato compartilhado entre o modal "Falar com Especialista" (cliente)
 * e a rota interna /api/contato (servidor).
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

export interface SpecialistContactPayload {
  subject: ContactSubject;
  name: string;
  email: string;
  phone: string;
  message?: string;
  origin?: string;
  /** Honeypot anti-spam: deve chegar sempre vazio. */
  website?: string;
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function isContactSubject(value: unknown): value is ContactSubject {
  return typeof value === 'string' && (CONTACT_SUBJECTS as readonly string[]).includes(value);
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
