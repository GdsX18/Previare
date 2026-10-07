'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, LockKeyhole, ShieldCheck, X } from 'lucide-react';
import {
  CONTACT_LIMITS,
  CONTACT_SUBJECTS,
  EMAIL_PATTERN,
  formatBrazilianPhone,
  onlyDigits,
  type ContactSubject,
} from '@/lib/specialistContact';

interface SpecialistModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSubject?: ContactSubject;
  initialMessage?: string;
  origin?: string;
}

type Status = 'idle' | 'submitting' | 'success';
type FieldErrors = Partial<Record<'subject' | 'name' | 'email' | 'phone', string>>;

const EASE_APPLE = [0.32, 0.72, 0, 1] as const;

/**
 * Rótulos em linguagem cotidiana para cada assunto. O valor enviado à API
 * continua sendo o próprio ContactSubject; aqui só muda o que a pessoa lê.
 */
const SUBJECT_COPY: Record<ContactSubject, { title: string; hint: string }> = {
  'Planejamento Previdenciário': {
    title: 'Aposentadoria',
    hint: 'Quero saber quando e como posso me aposentar',
  },
  'Auditoria de CNIS e Vínculos': {
    title: 'Análise de Histórico (CNIS)',
    hint: 'Conferir se todas as empresas e contribuições foram registradas',
  },
  'Tempo Especial & Insalubridade (PPP)': {
    title: 'Trabalho com Risco ou Saúde (PPP)',
    hint: 'Trabalhei exposto a barulho, produtos químicos, saúde ou perigo',
  },
  'Revisão de Aposentadoria Concedida': {
    title: 'Revisão de Valor',
    hint: 'Já recebo benefício e quero conferir se o cálculo está certo',
  },
  'Benefício por Incapacidade ou BPC / LOAS': {
    title: 'Amparo sem Contribuição (BPC/LOAS)',
    hint: 'Idoso de baixa renda ou pessoa com deficiência',
  },
  'Outro Assunto Previdenciário': {
    title: 'Outra Dúvida',
    hint: 'Preciso de orientação com outro tema previdenciário',
  },
};

function StepHeading({ step, title, hint, id }: { step: number; title: string; hint: string; id?: string }) {
  return (
    <div className="flex items-start gap-4">
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1F5A27] text-[18px] font-bold text-white"
      >
        {step}
      </span>
      <div>
        <p id={id} className="text-[20px] sm:text-[22px] font-bold leading-snug text-[#10200F]">
          <span className="sr-only">Passo {step}: </span>
          {title}
        </p>
        <p className="mt-1 text-[16px] leading-relaxed text-[#2B3D2E]">{hint}</p>
      </div>
    </div>
  );
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function validateFields(v: { subject: ContactSubject | null; name: string; email: string; phone: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!v.subject) errors.subject = 'Escolha uma das opções acima. Se não tiver certeza, escolha "Outra Dúvida".';
  if (v.name.trim().length < 3) errors.name = 'Por favor, escreva o seu nome completo.';
  if (!EMAIL_PATTERN.test(v.email.trim())) {
    errors.email = 'Confira o e-mail. Ele precisa ter o símbolo @, por exemplo: maria@gmail.com';
  }
  const digits = onlyDigits(v.phone).length;
  if (digits < CONTACT_LIMITS.phoneDigitsMin || digits > CONTACT_LIMITS.phoneDigitsMax) {
    errors.phone = 'Confira o número. Ele precisa ter o DDD (2 números) e o celular, por exemplo: (11) 91234-5678';
  }
  return errors;
}

export default function SpecialistModal({
  isOpen,
  onClose,
  initialSubject,
  initialMessage,
  origin,
}: SpecialistModalProps) {
  const uid = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLButtonElement>(null);
  const successButtonRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const [subject, setSubject] = useState<ContactSubject | null>(initialSubject ?? null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState((initialMessage ?? '').slice(0, CONTACT_LIMITS.message));
  const [website, setWebsite] = useState(''); // honeypot
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');

  // ── Congela o scroll do body, trata ESC, prende o foco e o restaura ao fechar ──
  useEffect(() => {
    if (!isOpen) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const { body, documentElement } = document;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    const focusTimer = window.setTimeout(() => firstFieldRef.current?.focus({ preventScroll: true }), 60);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      restoreFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (status === 'success') {
      panelRef.current?.scrollTo({ top: 0 });
      successButtonRef.current?.focus({ preventScroll: true });
    }
  }, [status]);

  const clearError = (field: keyof FieldErrors) =>
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    const found = validateFields({ subject, name, email, phone });
    setErrors(found);
    setSubmitError(null);
    const firstInvalid = (['subject', 'name', 'email', 'phone'] as const).find((k) => found[k]);
    if (firstInvalid) {
      panelRef.current?.querySelector<HTMLElement>(`[data-field="${firstInvalid}"]`)?.focus();
      return;
    }

    setStatus('submitting');
    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          name: name.trim(),
          email: email.trim(),
          phone,
          message: message.trim(),
          origin,
          website,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Não foi possível encaminhar sua solicitação agora.');
      }
      setStatus('success');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Não foi possível encaminhar sua solicitação agora.');
      setStatus('idle');
    }
  };

  // Campos altos, fundo branco, borda bem definida e foco verde inconfundível.
  const inputBase =
    'w-full min-h-[56px] rounded-2xl border-2 bg-white px-4 py-3.5 text-[18px] text-[#10200F] placeholder:text-[#4A5A4D] outline-none transition-[border-color,box-shadow] duration-200 focus:border-[#1F7A2B] focus:ring-4 focus:ring-[#1F7A2B]/25';
  const inputState = (field: keyof FieldErrors) =>
    errors[field] ? 'border-[#B3261E]' : 'border-[#7A8A7D] hover:border-[#4A5A4D]';
  const labelClass = 'block text-[18px] font-bold text-[#10200F]';
  const helpClass = 'mt-1 mb-2.5 block text-[15.5px] leading-snug text-[#33463A]';
  const errorClass = 'mt-2 flex items-start gap-2 text-[16px] font-semibold leading-snug text-[#B3261E]';
  const describedBy = (field: string, hasError: boolean) =>
    [`${uid}-${field}-help`, hasError ? `${uid}-${field}-err` : null].filter(Boolean).join(' ');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="specialist-modal"
          className="specialist-modal-root fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE_APPLE }}
        >
          <style jsx global>{`
            .specialist-modal-root,
            .specialist-modal-root * {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
                Arial, sans-serif;
            }
            .specialist-modal-root .font-serif,
            .specialist-modal-root .font-serif * {
              font-family: var(--font-serif), Georgia, serif;
            }
          `}</style>

          {/* Backdrop: vidro fosco profundo + escurecimento sutil. Clique fora fecha. */}
          <div
            aria-hidden="true"
            onClick={onClose}
            className="absolute inset-0 bg-[#03120E]/55 backdrop-blur-2xl backdrop-saturate-150"
          />

          {/* Painel — formato amplo (paisagem) para caber tudo sem aperto */}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${uid}-title`}
            aria-describedby={`${uid}-desc`}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 4 }}
            transition={{ duration: 0.42, ease: EASE_APPLE }}
            className="relative w-full max-w-4xl max-h-[calc(100dvh-16px)] sm:max-h-[calc(100dvh-48px)] overflow-y-auto overscroll-contain rounded-[24px] sm:rounded-[32px] border border-white/80 bg-[#F7FAF5] text-[#10200F] shadow-[0_40px_120px_-20px_rgba(2,12,8,0.55),0_12px_32px_-8px_rgba(2,12,8,0.25),inset_0_1px_0_rgba(255,255,255,0.9)] [scrollbar-width:auto] [scrollbar-color:rgba(31,51,37,0.45)_transparent]"
          >
            {/* Botão fechar — grande, com texto, fixo no topo mesmo ao rolar */}
            <div className="sticky top-0 z-20 flex justify-end px-3 pt-3 sm:px-5 sm:pt-5 h-0 overflow-visible">
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar janela de atendimento"
                className="flex h-14 min-w-14 items-center justify-center gap-2 rounded-full border-2 border-[#10200F]/15 bg-white px-4 text-[16px] font-semibold text-[#10200F] shadow-[0_4px_14px_-4px_rgba(2,12,8,0.25)] transition-colors duration-200 hover:bg-[#EEF3EC] hover:border-[#10200F]/35 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1F7A2B]/40"
              >
                <X className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                <span className="hidden sm:inline">Fechar</span>
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {status !== 'success' ? (
                <motion.form
                  key="form"
                  noValidate
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: EASE_APPLE }}
                  className="relative px-5 pb-8 pt-6 sm:px-10 sm:pb-10 sm:pt-9 lg:px-14"
                >
                  {/* ── Cabeçalho de acolhimento ── */}
                  <header className="pr-16 sm:pr-32">
                    <span className="inline-flex items-center gap-2 rounded-full border border-[#1F5A27]/25 bg-white px-3.5 py-1.5 text-[13px] font-bold uppercase tracking-[0.1em] text-[#1F5A27]">
                      <LockKeyhole className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
                      Atendimento sob sigilo profissional
                    </span>
                    <h2
                      id={`${uid}-title`}
                      className="font-serif mt-4 text-[30px] sm:text-[40px] leading-[1.1] tracking-tight text-[#10200F]"
                    >
                      Vamos analisar a sua situação{' '}
                      <em className="italic text-[#1F5A27]">com calma.</em>
                    </h2>
                    <p id={`${uid}-desc`} className="mt-3 max-w-2xl text-[18px] leading-relaxed text-[#2B3D2E]">
                      São só 3 passos simples. Quem lê as suas respostas são os próprios advogados da Previare,
                      que vão entrar em contato com você. Não há custo para esta primeira conversa.
                    </p>
                  </header>

                  {/* ── Passo 1: assunto ── */}
                  <fieldset className="mt-9 border-t-2 border-[#10200F]/10 pt-7">
                    <legend className="sr-only">Passo 1: Qual é o seu objetivo?</legend>
                    <StepHeading
                      step={1}
                      title="Qual é o seu objetivo?"
                      hint="Toque na opção que mais se parece com o seu caso. Você só precisa escolher uma."
                    />
                    <div
                      role="radiogroup"
                      aria-label="Qual é o seu objetivo?"
                      aria-invalid={!!errors.subject}
                      aria-describedby={errors.subject ? `${uid}-subject-err` : undefined}
                      className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      {CONTACT_SUBJECTS.map((option, i) => {
                        const selected = subject === option;
                        const copy = SUBJECT_COPY[option];
                        return (
                          <button
                            key={option}
                            ref={i === 0 ? firstFieldRef : undefined}
                            data-field={i === 0 ? 'subject' : undefined}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => {
                              setSubject(option);
                              clearError('subject');
                            }}
                            className={`relative flex min-h-[96px] w-full items-start gap-3 rounded-2xl border-2 p-4 text-left transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1F7A2B]/40 ${
                              selected
                                ? 'border-[#1F7A2B] bg-[#E3F1E1] shadow-[0_0_0_2px_#1F7A2B]'
                                : `bg-white hover:border-[#1F7A2B]/60 hover:bg-[#F3F8F1] ${
                                    errors.subject ? 'border-[#B3261E]/60' : 'border-[#7A8A7D]/60'
                                  }`
                            }`}
                          >
                            {/* Marcador de seleção: círculo vazio → círculo verde com check */}
                            <span
                              aria-hidden="true"
                              className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                                selected ? 'border-[#1F7A2B] bg-[#1F7A2B] text-white' : 'border-[#7A8A7D] bg-white'
                              }`}
                            >
                              {selected && <Check className="h-4 w-4" strokeWidth={3.5} />}
                            </span>
                            <span>
                              <span className="block text-[17.5px] font-bold leading-snug text-[#10200F]">
                                {copy.title}
                              </span>
                              <span className="mt-1 block text-[15.5px] leading-snug text-[#33463A]">
                                {copy.hint}
                              </span>
                              {selected && (
                                <span className="mt-2 inline-block text-[14px] font-bold text-[#1F5A27]">
                                  ✓ Opção escolhida
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {errors.subject && (
                      <p id={`${uid}-subject-err`} role="alert" className={errorClass}>
                        {errors.subject}
                      </p>
                    )}
                  </fieldset>

                  {/* ── Passo 2: contato ── */}
                  <fieldset className="mt-9 border-t-2 border-[#10200F]/10 pt-7">
                    <legend className="sr-only">Passo 2: Como nossos advogados podem te responder?</legend>
                    <StepHeading
                      step={2}
                      title="Como nossos advogados podem te responder?"
                      hint="Precisamos destes dados só para retornar o seu contato."
                    />

                    <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
                      <div className="md:col-span-2">
                        <label htmlFor={`${uid}-name`} className={labelClass}>
                          Nome completo
                        </label>
                        <span id={`${uid}-name-help`} className={helpClass}>
                          Digite seu nome como está no seu RG ou na Carteira de Trabalho.
                        </span>
                        <input
                          id={`${uid}-name`}
                          data-field="name"
                          type="text"
                          autoComplete="name"
                          autoCapitalize="words"
                          maxLength={CONTACT_LIMITS.name}
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            clearError('name');
                          }}
                          aria-invalid={!!errors.name}
                          aria-describedby={describedBy('name', !!errors.name)}
                          className={`${inputBase} ${inputState('name')}`}
                        />
                        {errors.name && (
                          <p id={`${uid}-name-err`} className={errorClass}>
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor={`${uid}-phone`} className={labelClass}>
                          Celular com WhatsApp
                        </label>
                        <span id={`${uid}-phone-help`} className={helpClass}>
                          Coloque o DDD e o número. Exemplo: (11) 91234-5678
                        </span>
                        <input
                          id={`${uid}-phone`}
                          data-field="phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel-national"
                          value={phone}
                          onChange={(e) => {
                            setPhone(formatBrazilianPhone(e.target.value));
                            clearError('phone');
                          }}
                          aria-invalid={!!errors.phone}
                          aria-describedby={describedBy('phone', !!errors.phone)}
                          placeholder="(__) _____-____"
                          className={`${inputBase} ${inputState('phone')} tabular-nums tracking-wide`}
                        />
                        {errors.phone && (
                          <p id={`${uid}-phone-err`} className={errorClass}>
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor={`${uid}-email`} className={labelClass}>
                          E-mail
                        </label>
                        <span id={`${uid}-email-help`} className={helpClass}>
                          Para onde enviaremos a orientação por escrito.
                        </span>
                        <input
                          id={`${uid}-email`}
                          data-field="email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          autoCapitalize="none"
                          spellCheck={false}
                          maxLength={CONTACT_LIMITS.email}
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            clearError('email');
                          }}
                          aria-invalid={!!errors.email}
                          aria-describedby={describedBy('email', !!errors.email)}
                          className={`${inputBase} ${inputState('email')}`}
                        />
                        {errors.email && (
                          <p id={`${uid}-email-err`} className={errorClass}>
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </fieldset>

                  {/* ── Passo 3: detalhes (opcional) ── */}
                  <div className="mt-9 border-t-2 border-[#10200F]/10 pt-7">
                    <StepHeading
                      step={3}
                      title="Quer nos contar algum detalhe a mais? (Opcional)"
                      hint="Este passo não é obrigatório."
                    />
                    <div className="mt-5">
                      <div className="flex items-baseline justify-between gap-4">
                        <label htmlFor={`${uid}-message`} className={labelClass}>
                          Sua mensagem
                        </label>
                        <span className="text-[14px] tabular-nums text-[#4A5A4D]">
                          {message.length}/{CONTACT_LIMITS.message}
                        </span>
                      </div>
                      <span id={`${uid}-message-help`} className={helpClass}>
                        Se quiser, escreva em poucas palavras quanto tempo você trabalhou ou qual é a sua principal
                        preocupação hoje. Se não souber, pode deixar em branco.
                      </span>
                      <textarea
                        id={`${uid}-message`}
                        rows={4}
                        maxLength={CONTACT_LIMITS.message}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        aria-describedby={`${uid}-message-help`}
                        className={`${inputBase} border-[#7A8A7D] hover:border-[#4A5A4D] resize-y leading-relaxed`}
                      />
                    </div>
                  </div>

                  {/* Honeypot anti-spam (invisível para pessoas) */}
                  <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                    <label>
                      Website
                      <input
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </label>
                  </div>

                  {submitError && (
                    <div
                      role="alert"
                      className="mt-7 rounded-2xl border-2 border-[#B3261E]/40 bg-[#FBEFEC] px-5 py-4 text-[16px] leading-relaxed text-[#7A1E16]"
                    >
                      {submitError} Se preferir, escreva para{' '}
                      <a href="mailto:contato@previare.com.br" className="font-bold underline underline-offset-2">
                        contato@previare.com.br
                      </a>
                      .
                    </div>
                  )}

                  {/* ── Envio ── */}
                  <div className="mt-9 border-t-2 border-[#10200F]/10 pt-7">
                    <button
                      type="submit"
                      disabled={status === 'submitting'}
                      aria-busy={status === 'submitting'}
                      className="flex min-h-[64px] w-full items-center justify-center gap-3 rounded-2xl bg-[#1F5A27] px-6 py-4 text-[18px] sm:text-[19px] font-bold text-white shadow-[0_10px_30px_-10px_rgba(31,90,39,0.7)] transition-colors duration-200 hover:bg-[#174A1F] active:bg-[#123C18] disabled:cursor-wait disabled:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1F7A2B]/45 focus-visible:ring-offset-2"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" strokeWidth={2.5} aria-hidden="true" />
                          Enviando seus dados, aguarde um instante...
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-6 w-6 shrink-0" strokeWidth={2.25} aria-hidden="true" />
                          Enviar meus dados para análise dos advogados
                        </>
                      )}
                    </button>

                    {/* ── Selo de tranquilidade ── */}
                    <p className="mt-5 flex items-start justify-center gap-3 rounded-2xl bg-[#E9F2E6] px-5 py-4 text-[16px] leading-relaxed text-[#1F3325]">
                      <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-[#1F5A27]" strokeWidth={2.25} aria-hidden="true" />
                      <span>
                        Seus dados são confidenciais e protegidos pelo{' '}
                        <strong className="font-bold">sigilo profissional da advocacia (OAB)</strong> e pela{' '}
                        <strong className="font-bold">Lei Geral de Proteção de Dados</strong>. Não compartilhamos
                        seus dados com terceiros e nunca pedimos a sua senha do gov.br.
                      </span>
                    </p>
                  </div>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: EASE_APPLE }}
                  className="relative flex flex-col items-center px-6 pb-9 pt-12 text-center sm:px-12 sm:pb-12 sm:pt-16"
                  aria-live="polite"
                >
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-[#2F7335] shadow-[0_16px_40px_-12px_rgba(47,115,53,0.7),inset_0_1px_0_rgba(255,255,255,0.25)] ring-8 ring-[#2F7335]/10"
                  >
                    <Check className="h-9 w-9 text-white" strokeWidth={2.75} />
                  </motion.div>

                  <h2
                    id={`${uid}-title`}
                    className="font-serif mt-7 text-[30px] sm:text-[38px] leading-[1.15] tracking-tight text-[#10200F]"
                  >
                    Recebemos o seu relato{name.trim() ? `, ${name.trim().split(' ')[0]}` : ''}.
                  </h2>
                  <p id={`${uid}-desc`} className="mt-4 max-w-xl text-[18px] leading-relaxed text-[#2B3D2E]">
                    Seus dados já estão com os advogados da Previare. Vamos estudar a sua situação sobre{' '}
                    <strong className="font-bold text-[#10200F]">{subject ? SUBJECT_COPY[subject].title : ''}</strong> com toda a atenção.
                  </p>

                  <div className="mt-8 w-full max-w-md rounded-2xl border-2 border-[#1F5A27]/20 bg-white px-6 py-5 text-left">
                    <p className="text-[14px] font-bold uppercase tracking-[0.1em] text-[#1F5A27]">
                      Previsão de retorno
                    </p>
                    <p className="mt-1 text-[18px] font-semibold text-[#10200F]">
                      Em até 1 dia útil, por WhatsApp ou e-mail. Fique de olho no seu celular.
                    </p>
                  </div>

                  <button
                    ref={successButtonRef}
                    type="button"
                    onClick={onClose}
                    className="mt-8 min-h-[64px] w-full max-w-md rounded-2xl bg-[#1F5A27] px-6 py-4 text-[18px] font-bold text-white transition-colors duration-200 hover:bg-[#174A1F] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1F7A2B]/45 focus-visible:ring-offset-2"
                  >
                    Concluir e fechar
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
