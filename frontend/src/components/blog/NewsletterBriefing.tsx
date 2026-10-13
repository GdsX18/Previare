'use client';

import React, { useId, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, CheckCircle2 } from 'lucide-react';
import { EMAIL_PATTERN } from '@/lib/specialistContact';

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function NewsletterBriefing() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const emailId = useId();
  const consentId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();

    if (!EMAIL_PATTERN.test(value)) {
      setError('Informe um e-mail válido.');
      return;
    }
    if (!consent) {
      setError('É necessário autorizar o envio para concluir a inscrição.');
      return;
    }

    setError('');
    setStatus('submitting');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, consent: true }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Não foi possível concluir sua inscrição agora. Tente novamente em instantes.');
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível concluir sua inscrição agora. Tente novamente em instantes.'
      );
    }
  };

  return (
    <section
      aria-labelledby="newsletter-title"
      className="px-5 pb-16 sm:px-10 md:pb-24 lg:px-16"
    >
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] via-white/[0.015] to-transparent px-6 py-12 backdrop-blur-xl sm:px-12 md:py-16 lg:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(124,229,119,0.12)_0%,transparent_70%)] blur-2xl"
        />

        <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#7CE577]/85">
              Briefing Privado
            </span>
            <h2
              id="newsletter-title"
              className="mt-4 font-serif font-light leading-tight tracking-tight text-white/95 text-[clamp(1.75rem,3.5vw,2.5rem)]"
            >
              Receba o Informativo Técnico Previare
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60 sm:text-base">
              Envio exclusivo de notas sobre precedentes do STF, correções de benefícios e
              segurança patrimonial.
            </p>
          </div>

          {status === 'success' ? (
            <div role="status" className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <CheckCircle2 aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-[#7CE577]" />
              <div>
                <p className="font-serif text-xl font-light text-white">Inscrição confirmada</p>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                  Você receberá as próximas edições do informativo em <span className="text-white/85">{email.trim()}</span>.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <label htmlFor={emailId} className="sr-only">
                E-mail profissional
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:rounded-full sm:border sm:border-white/10 sm:bg-white/[0.03] sm:p-1.5 sm:transition-[border-color,box-shadow] sm:duration-300 sm:focus-within:border-white/30 sm:focus-within:shadow-[0_0_0_4px_rgba(124,229,119,0.08)]">
                <input
                  id={emailId}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  aria-invalid={Boolean(error) && !EMAIL_PATTERN.test(email.trim())}
                  className="w-full rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white placeholder-white/35 outline-none transition-colors focus:border-white/30 sm:flex-1 sm:border-0 sm:bg-transparent sm:py-2.5"
                />
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#03120E] transition-[background-color,transform] duration-300 hover:bg-[#F4FFC7] active:scale-[0.98] disabled:opacity-60 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CE577]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#03120E] sm:py-2.5"
                >
                  {status === 'submitting' ? 'Enviando…' : 'Inscrever-se'}
                  <ArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </button>
              </div>

              <label htmlFor={consentId} className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-white/55 hover:text-white/75">
                <input
                  id={consentId}
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-[#7CE577]/60 ${
                    consent ? 'border-white bg-white text-[#03120E]' : 'border-white/30'
                  }`}
                >
                  {consent && <Check className="h-3 w-3 stroke-[3]" />}
                </span>
                <span>
                  Autorizo o envio do informativo técnico para o e-mail informado, nos termos da{' '}
                  <Link href="/politica-de-privacidade" className="text-white/85 underline underline-offset-2 hover:text-[#7CE577]">
                    Política de Privacidade
                  </Link>{' '}
                  e da LGPD. O cancelamento pode ser feito a qualquer momento.
                </span>
              </label>

              {error && (
                <p role="alert" className="text-xs text-[#F4B4A4]">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export { NewsletterBriefing };
