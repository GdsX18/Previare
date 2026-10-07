import React from 'react';
import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/siteConfig';

interface LegalPageProps {
  eyebrow: string;
  title: string;
  updatedAt: string;
  children: React.ReactNode;
}

/**
 * Casca editorial das páginas legais (Política de Privacidade e Termos de Uso):
 * fundo papel, leitura confortável para o público sênior e retorno claro ao site.
 */
export default function LegalPage({ eyebrow, title, updatedAt, children }: LegalPageProps) {
  const legalLine = [SITE_CONFIG.legalName, SITE_CONFIG.oabRegistration, SITE_CONFIG.cnpj && `CNPJ ${SITE_CONFIG.cnpj}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="min-h-screen bg-paper text-[#0B1A0F]">
      <header className="border-b border-[#2F7335]/15">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-serif text-2xl font-light tracking-tight text-[#0B1A0F] hover:text-[#2F7335] transition-colors"
          >
            Previare
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center gap-2 font-sans text-base font-medium text-[#1F3325] hover:text-[#2F7335] transition-colors"
          >
            <span aria-hidden="true">←</span> Voltar ao site
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-24">
        <span className="block text-xs font-sans tracking-[0.3em] text-[#2F7335] uppercase font-semibold mb-5">
          {eyebrow}
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-light leading-[1.02] tracking-tight">{title}</h1>
        <p className="mt-6 font-sans text-base text-[#1F3325]/80">Última atualização: {updatedAt}</p>

        <div className="legal-prose mt-14 font-sans text-lg leading-relaxed text-[#1F3325]">{children}</div>

        <footer className="mt-20 pt-8 border-t border-[#2F7335]/20 font-sans text-base text-[#1F3325]/80 space-y-1">
          {legalLine && <p>{legalLine}</p>}
          <p>
            Dúvidas sobre este documento:{' '}
            <a className="underline hover:text-[#2F7335]" href={`mailto:${SITE_CONFIG.email}`}>
              {SITE_CONFIG.email}
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
