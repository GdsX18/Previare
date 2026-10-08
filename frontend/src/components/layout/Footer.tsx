'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Check, CheckCircle2 } from 'lucide-react';
import { scrollToSection } from '@/lib/smoothScroll';
import { useSpecialistModal } from '@/components/contact/SpecialistModalProvider';
import { SITE_CONFIG } from '@/lib/siteConfig';
import {
  CONTACT_LIMITS,
  EMAIL_PATTERN,
  formatBrazilianPhone,
  onlyDigits,
  type ContactSubject,
  type SpecialistContactPayload,
} from '@/lib/specialistContact';

const FOOTER_SERVICES = [
  'Planejamento Previdenciário',
  'Auditoria de CNIS & Vínculos',
  'Aposentadoria Especial & PPP',
  'Revisão de Benefício Concedido',
  'Simulações Matemáticas',
  'Diagnóstico Geral Completo',
] as const;

// Assunto enviado à rota /api/contato conforme o primeiro serviço marcado
const SUBJECT_BY_SERVICE: Record<string, ContactSubject> = {
  'Planejamento Previdenciário': 'Planejamento Previdenciário',
  'Auditoria de CNIS & Vínculos': 'Auditoria de CNIS e Vínculos',
  'Aposentadoria Especial & PPP': 'Tempo Especial & Insalubridade (PPP)',
  'Revisão de Benefício Concedido': 'Revisão de Aposentadoria Concedida',
  'Simulações Matemáticas': 'Planejamento Previdenciário',
  'Diagnóstico Geral Completo': 'Auditoria de CNIS e Vínculos',
};

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  careerStage: 'Próximo à Aposentadoria (50+ anos)',
  source: 'Cliente Atual / Indicação',
  message: '',
  services: [] as string[],
  scheduleSession: false,
  privacyAgreed: false,
  website: '',
};

export default function Footer() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { openSpecialistModal } = useSpecialistModal();

  const handleServiceToggle = (service: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const validate = (): string | null => {
    if (formData.name.trim().length < 3) return 'Por favor, escreva o seu nome completo.';
    if (!EMAIL_PATTERN.test(formData.email.trim()))
      return 'Confira o e-mail. Ele precisa ter o símbolo @, por exemplo: maria@gmail.com';
    const digits = onlyDigits(formData.phone).length;
    if (digits < CONTACT_LIMITS.phoneDigitsMin || digits > CONTACT_LIMITS.phoneDigitsMax)
      return 'Confira o telefone. Ele precisa ter o DDD, por exemplo: (21) 91234-5678';
    if (!formData.privacyAgreed) return 'Para prosseguir, aceite a Política de Privacidade.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Todo o contexto do formulário segue no relato, no mesmo contrato do modal
    const message = [
      `Momento profissional: ${formData.careerStage}`,
      `Serviços de interesse: ${formData.services.length ? formData.services.join(', ') : 'não informado'}`,
      `Como conheceu: ${formData.source}`,
      `Deseja agendar sessão de alinhamento: ${formData.scheduleSession ? 'Sim' : 'Não'}`,
      formData.message.trim() ? `\nRelato: ${formData.message.trim()}` : '',
    ]
      .filter(Boolean)
      .join('\n')
      .slice(0, CONTACT_LIMITS.message);

    const payload: SpecialistContactPayload = {
      subject: SUBJECT_BY_SERVICE[formData.services[0]] ?? 'Outro Assunto Previdenciário',
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      message,
      origin: 'Footer · Formulário de contato',
      website: formData.website,
    };

    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contato', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? 'Não foi possível enviar agora. Tente novamente em instantes.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('Sem conexão no momento. Verifique sua internet e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setError(null);
    setSubmitted(false);
  };

  const handleFooterNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      scrollToSection(href, { offset: 85 });
    }
  };

  const legalLine = [SITE_CONFIG.legalName, SITE_CONFIG.oabRegistration, SITE_CONFIG.cnpj && `CNPJ ${SITE_CONFIG.cnpj}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      {/* Tipografia limpa, neutra e moderna para campos, labels, links e corpo (estilo IWC) */}
      <style jsx global>{`
        .footer-clean-root,
        .footer-clean-root input,
        .footer-clean-root select,
        .footer-clean-root textarea,
        .footer-clean-root button,
        .footer-clean-root p,
        .footer-clean-root span,
        .footer-clean-root a,
        .footer-clean-root label,
        .footer-clean-root li {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, Helvetica, Arial, sans-serif !important;
        }
        .footer-clean-root .font-serif,
        .footer-clean-root h2.font-serif,
        .footer-clean-root h3.font-serif,
        .footer-clean-root .editorial-serif {
          font-family: var(--font-serif), Georgia, serif !important;
        }
      `}</style>

      <footer
        id="contato"
        className="footer-clean-root relative w-full overflow-hidden text-white select-none isolate bg-[#020B07] bg-[radial-gradient(ellipse_at_top_right,#0E4D34_0%,#062417_45%,#020C07_100%)]"
      >
        {/* Costura com a seção anterior: o topo parte do mesmo tom em que o Próximo Passo termina */}
        <div
          className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-ink-deep to-transparent pointer-events-none z-[1]"
          aria-hidden="true"
        />

        {/* Focos de luz difusa para profundidade aveludada e reflexo luminoso */}
        <div
          className="absolute top-24 right-10 w-[750px] h-[750px] bg-[radial-gradient(circle,rgba(14,124,90,0.38)_0%,transparent_70%)] md:blur-[140px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/4 left-1/3 w-[650px] h-[650px] bg-[radial-gradient(circle,rgba(124,229,119,0.14)_0%,transparent_70%)] md:blur-[150px] pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-10 left-10 w-[550px] h-[550px] bg-[radial-gradient(circle,rgba(14,77,52,0.28)_0%,transparent_70%)] md:blur-[130px] pointer-events-none"
          aria-hidden="true"
        />

        {/* Símbolo da Marca no Topo Central (Estilo IWC) ancorado sobre a linha divisória vertical */}
        <div className="w-full flex justify-center pt-12 pb-6 relative z-20">
          <div className="w-10 h-10 flex items-center justify-center">
            <Image
              alt="Previare Emblem"
              className="opacity-75 object-contain"
              height={32}
              src="/images/logos/previare - LOGOaaas.png"
              width={32}
            />
          </div>
        </div>

        {/* BLOCO PRINCIPAL: Grid com Linhas Estruturais Arquiteturais (Hairlines IWC) */}
        <div className="max-w-[1520px] mx-auto px-6 sm:px-12 lg:px-20 relative z-10">
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 pt-4 pb-24">
            
            {/* Linha Divisória Vertical Central Exata (Estilo Blueprint IWC) */}
            <div
              className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[1px] bg-white/[0.12] pointer-events-none"
              aria-hidden="true"
            />

            {/* COLUNA ESQUERDA: Título Monumental & Informações */}
            <div className="flex flex-col justify-between pr-0 lg:pr-12">
              <div>
                <h2 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-light text-white/95 leading-[0.92] tracking-tight uppercase">
                  Vamos <br />
                  conversar <br />
                  sobre o seu <br />
                  futuro
                </h2>

                <p className="mt-8 text-sm sm:text-base text-white/70 font-light leading-relaxed max-w-md">
                  Auditoria de vínculos, cálculo atuarial multivariado e segurança jurídica para o seu patrimônio previdenciário.
                </p>
              </div>

              {/* Contato Direto na Base da Coluna com Hairline Superior */}
              <div className="mt-20 pt-8 border-t border-white/[0.12] space-y-3.5">
                <span className="text-[11px] tracking-[0.25em] text-white/50 uppercase block font-medium">
                  Contato Direto
                </span>
                <p className="text-base text-white/90 font-light">
                  <a
                    href={`mailto:${SITE_CONFIG.email}`}
                    className="hover:text-[#7CE577] transition-colors"
                  >
                    {SITE_CONFIG.email}
                  </a>
                </p>
                {SITE_CONFIG.phoneDisplay && SITE_CONFIG.phoneE164 && (
                  <p className="text-base text-white/90 font-light">
                    <a
                      href={`tel:+${SITE_CONFIG.phoneE164}`}
                      className="hover:text-[#7CE577] transition-colors"
                    >
                      {SITE_CONFIG.phoneDisplay}
                    </a>
                  </p>
                )}
                <p className="text-sm text-white/60 pt-1">
                  {SITE_CONFIG.city}, {SITE_CONFIG.state} — {SITE_CONFIG.serviceArea}
                </p>

                {/* Ícones de redes sociais discretos estilo IWC (só perfis oficiais configurados) */}
                {(SITE_CONFIG.social.linkedin || SITE_CONFIG.social.instagram) && (
                <div className="flex items-center gap-3 pt-2">
                  {SITE_CONFIG.social.linkedin && (
                  <a
                    href={SITE_CONFIG.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded border border-white/20 hover:border-[#7CE577] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.04] transition-all text-xs font-semibold"
                    aria-label="LinkedIn Previare"
                  >
                    in
                  </a>
                  )}
                  {SITE_CONFIG.social.instagram && (
                  <a
                    href={SITE_CONFIG.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded border border-white/20 hover:border-[#7CE577] flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.04] transition-all"
                    aria-label="Instagram Previare"
                  >
                    <svg
                      className="w-3.5 h-3.5 fill-none stroke-current"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      viewBox="0 0 24 24"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  )}
                </div>
                )}
              </div>
            </div>

            {/* COLUNA DIREITA: Formulário Integrado Diretamente ao Fundo (ZERO CAIXA / ZERO CARD) */}
            <div className="lg:pl-8">
              {submitted ? (
                <div className="py-24 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-[#7CE577] mx-auto" />
                  <h3 className="font-serif text-3xl font-light text-white">
                    Mensagem recebida
                  </h3>
                  <p className="text-base text-white/75 max-w-md mx-auto leading-relaxed">
                    Recebemos seus dados sob sigilo profissional. Um especialista entrará em contato para apresentar os próximos passos.
                  </p>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#7CE577] hover:text-white border-b border-[#7CE577]/40 hover:border-white pb-1 transition-colors cursor-pointer"
                    >
                      Enviar nova mensagem
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="relative space-y-8">
                  {/* Honeypot anti-spam: invisível para pessoas, preenchido por robôs */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  />
                  {/* Linha 1: Nome Completo e E-mail */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs tracking-wider uppercase text-white/70 block font-medium">
                        Nome Completo*
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-base text-white placeholder-white/40 focus:border-[#7CE577] outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs tracking-wider uppercase text-white/70 block font-medium">
                        E-mail*
                      </label>
                      <input
                        required
                        type="email"
                        placeholder="seu.email@exemplo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-base text-white placeholder-white/40 focus:border-[#7CE577] outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Linha 2: Telefone e Momento Profissional */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs tracking-wider uppercase text-white/70 block font-medium">
                        Telefone / WhatsApp*
                      </label>
                      <input
                        required
                        type="tel"
                        placeholder="(21) 90000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: formatBrazilianPhone(e.target.value) })}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-base text-white placeholder-white/40 focus:border-[#7CE577] outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs tracking-wider uppercase text-white/70 block font-medium">
                        Momento Profissional*
                      </label>
                      <div className="relative">
                        <select
                          value={formData.careerStage}
                          onChange={(e) => setFormData({ ...formData, careerStage: e.target.value })}
                          className="w-full bg-transparent border-b border-white/20 pb-2 text-base text-white focus:border-[#7CE577] outline-none transition-colors cursor-pointer appearance-none pr-6"
                        >
                          <option className="bg-[#062417] text-white" value="Próximo à Aposentadoria (50+ anos)">
                            Próximo à Aposentadoria (50+ anos)
                          </option>
                          <option className="bg-[#062417] text-white" value="Mais de 30 anos de Contribuição">
                            Mais de 30 anos de Contribuição
                          </option>
                          <option className="bg-[#062417] text-white" value="Atividade com Insalubridade / PPP">
                            Atividade com Insalubridade / PPP
                          </option>
                          <option className="bg-[#062417] text-white" value="Empresário / Autônomo">
                            Empresário / Autônomo
                          </option>
                          <option className="bg-[#062417] text-white" value="Servidor Público (RPPS / Transição)">
                            Servidor Público (RPPS / Transição)
                          </option>
                          <option className="bg-[#062417] text-white" value="Aposentado buscando Revisão">
                            Aposentado buscando Revisão
                          </option>
                        </select>
                        <div className="pointer-events-none absolute right-1 bottom-3 text-white/40 text-xs">
                          ▾
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Linha 3: Serviços de Maior Interesse (Checkboxes Estilo IWC) */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs tracking-wider uppercase text-white/70 block font-medium">
                      Quais serviços são do seu maior interesse?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {FOOTER_SERVICES.map((service) => {
                        const isSelected = formData.services.includes(service);
                        return (
                          <label
                            key={service}
                            className="flex items-center gap-3 cursor-pointer group select-none text-sm text-white/80 hover:text-white transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleServiceToggle(service)}
                              className="sr-only"
                            />
                            <div
                              className={`w-4 h-4 rounded-sm border transition-colors flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-white border-white text-[#020B06]'
                                  : 'border-white/30 bg-transparent group-hover:border-white/60'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{service}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Linha 4: Como Ficou Sabendo */}
                  <div className="space-y-2">
                    <label className="text-xs tracking-wider uppercase text-white/70 block font-medium">
                      Como conheceu a Previare?
                    </label>
                    <div className="relative">
                      <select
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        className="w-full bg-transparent border-b border-white/20 pb-2 text-base text-white focus:border-[#7CE577] outline-none transition-colors cursor-pointer appearance-none pr-6"
                      >
                        <option className="bg-[#062417] text-white" value="Busca no Google / Internet">
                          Busca no Google / Internet
                        </option>
                        <option className="bg-[#062417] text-white" value="Cliente Atual / Indicação">
                          Cliente Atual / Indicação
                        </option>
                        <option className="bg-[#062417] text-white" value="Redes Sociais (LinkedIn/Instagram)">
                          Redes Sociais (LinkedIn/Instagram)
                        </option>
                        <option className="bg-[#062417] text-white" value="Outro Canal">
                          Outro Canal
                        </option>
                      </select>
                      <div className="pointer-events-none absolute right-1 bottom-3 text-white/40 text-xs">
                        ▾
                      </div>
                    </div>
                  </div>

                  {/* Linha 5: Mensagem Breve */}
                  <div className="space-y-2">
                    <label className="text-xs tracking-wider uppercase text-white/70 block font-medium">
                      Conte um pouco sobre sua trajetória (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Contribuo há 33 anos e gostaria de avaliar as regras de transição..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-transparent border-b border-white/20 pb-2 text-base text-white placeholder-white/40 focus:border-[#7CE577] outline-none transition-colors"
                    />
                  </div>

                  {/* Checkboxes de Agendamento e LGPD */}
                  <div className="space-y-3 pt-3">
                    <label className="flex items-center gap-3 cursor-pointer text-sm text-white/75 hover:text-white">
                      <input
                        type="checkbox"
                        checked={formData.scheduleSession}
                        onChange={(e) =>
                          setFormData({ ...formData, scheduleSession: e.target.checked })
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-sm border transition-colors flex items-center justify-center shrink-0 ${
                          formData.scheduleSession
                            ? 'bg-white border-white text-[#020B06]'
                            : 'border-white/30 bg-transparent'
                        }`}
                      >
                        {formData.scheduleSession && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>Desejo agendar uma sessão de alinhamento com um especialista técnico.</span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer text-sm text-white/70 hover:text-white">
                      <input
                        type="checkbox"
                        checked={formData.privacyAgreed}
                        onChange={(e) =>
                          setFormData({ ...formData, privacyAgreed: e.target.checked })
                        }
                        className="sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-sm border shrink-0 mt-0.5 transition-colors flex items-center justify-center ${
                          formData.privacyAgreed
                            ? 'bg-white border-white text-[#020B06]'
                            : 'border-white/30 bg-transparent'
                        }`}
                      >
                        {formData.privacyAgreed && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span>
                        Concordo com a{' '}
                        <Link
                          className="text-white underline hover:text-[#7CE577]"
                          href="/politica-de-privacidade"
                        >
                          Política de Privacidade
                        </Link>{' '}
                        e autorizo o contato de um especialista técnico em conformidade com a LGPD e normas da OAB.
                      </span>
                    </label>
                  </div>

                  {error && (
                    <p role="alert" className="text-base font-medium text-[#FFB4A8] leading-snug">
                      {error}
                    </p>
                  )}

                  {/* Botão de Envio (Estilo IWC Minimalista) */}
                  <div className="pt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-3 bg-white/90 hover:bg-white text-[#020B06] text-sm font-semibold tracking-[0.2em] uppercase py-4 px-8 rounded-sm transition-all duration-300 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      <span>{isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}</span>
                      <span className="text-sm font-mono leading-none">--</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>

        {/* BLOCO INFERIOR: Rodapé com Linha Horizontal Contínua (Sitemap IWC) */}
        <div className="border-t border-white/[0.12] pt-14 pb-12 relative z-10">
          <div className="max-w-[1520px] mx-auto px-6 sm:px-12 lg:px-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-14">
              
              {/* Logomarca Oficial Completa */}
              <div className="lg:col-span-5 space-y-4">
                <Link className="inline-block" href="/" aria-label="Página Inicial Previare">
                  <Image
                    alt="Previare"
                    className="h-10 w-auto object-contain opacity-95 brightness-105"
                    height={44}
                    src="/images/logos/previare - LOGOaa.png"
                    width={180}
                  />
                </Link>
                <p className="text-sm text-white/60 max-w-sm leading-relaxed">
                  Auditoria atuarial, inteligência jurídica e planejamento estratégico para proteger e maximizar o patrimônio da sua aposentadoria.
                </p>
                <p className="editorial-serif text-sm text-[#7CE577]/90 italic pt-1">
                  &ldquo;Previdência, Planejamento e Proximidade.&rdquo;
                </p>
              </div>

              {/* Coluna Soluções */}
              <div className="lg:col-span-3 space-y-3.5">
                <span className="text-xs tracking-[0.25em] text-white/50 uppercase block font-semibold">
                  Soluções
                </span>
                <ul className="space-y-2.5 text-sm text-white/75">
                  <li>
                    <a onClick={(e) => handleFooterNav(e, '#servicos')} className="hover:text-white transition-colors flex items-center gap-2 group cursor-pointer" href="#servicos">
                      <span className="text-white/30 group-hover:text-[#7CE577] transition-colors font-mono">└</span>
                      <span>Planejamento Previdenciário</span>
                    </a>
                  </li>
                  <li>
                    <a onClick={(e) => handleFooterNav(e, '#servicos')} className="hover:text-white transition-colors flex items-center gap-2 group cursor-pointer" href="#servicos">
                      <span className="text-white/30 group-hover:text-[#7CE577] transition-colors font-mono">└</span>
                      <span>Auditoria de CNIS & Vínculos</span>
                    </a>
                  </li>
                  <li>
                    <a onClick={(e) => handleFooterNav(e, '#servicos')} className="hover:text-white transition-colors flex items-center gap-2 group cursor-pointer" href="#servicos">
                      <span className="text-white/30 group-hover:text-[#7CE577] transition-colors font-mono">└</span>
                      <span>Aposentadorias & Transição</span>
                    </a>
                  </li>
                  <li>
                    <a onClick={(e) => handleFooterNav(e, '#servicos')} className="hover:text-white transition-colors flex items-center gap-2 group cursor-pointer" href="#servicos">
                      <span className="text-white/30 group-hover:text-[#7CE577] transition-colors font-mono">└</span>
                      <span>Tempo Especial & PPP</span>
                    </a>
                  </li>
                  <li>
                    <a onClick={(e) => handleFooterNav(e, '#servicos')} className="hover:text-white transition-colors flex items-center gap-2 group cursor-pointer" href="#servicos">
                      <span className="text-white/30 group-hover:text-[#7CE577] transition-colors font-mono">└</span>
                      <span>Revisões de Benefício</span>
                    </a>
                  </li>
                  <li>
                    <a onClick={(e) => handleFooterNav(e, '#servicos')} className="hover:text-white transition-colors flex items-center gap-2 group cursor-pointer" href="#servicos">
                      <span className="text-white/30 group-hover:text-[#7CE577] transition-colors font-mono">└</span>
                      <span>BPC / LOAS & Incapacidade</span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Coluna Institucional */}
              <div className="lg:col-span-2 space-y-3.5">
                <span className="text-xs tracking-[0.25em] text-white/50 uppercase block font-semibold">
                  Institucional
                </span>
                <ul className="space-y-2.5 text-sm text-white/75">
                  <li>
                    <a onClick={(e) => handleFooterNav(e, '#sobre')} className="hover:text-white transition-colors cursor-pointer" href="#sobre">
                      Sobre a Marca
                    </a>
                  </li>
                  <li>
                    <a onClick={(e) => handleFooterNav(e, '#diferenciais')} className="hover:text-white transition-colors cursor-pointer" href="#diferenciais">
                      Diferenciais
                    </a>
                  </li>
                  <li>
                    <a onClick={(e) => handleFooterNav(e, '#duvidas')} className="hover:text-white transition-colors cursor-pointer" href="#duvidas">
                      Dúvidas Frequentes
                    </a>
                  </li>
                  <li>
                    <Link className="hover:text-white transition-colors" href="/termos#etica-oab">
                      Diretrizes Éticas OAB
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Coluna Atendimento */}
              <div className="lg:col-span-2 space-y-3.5">
                <span className="text-xs tracking-[0.25em] text-white/50 uppercase block font-semibold">
                  Atendimento
                </span>
                <ul className="space-y-2.5 text-sm text-white/75">
                  <li>
                    <a onClick={(e) => handleFooterNav(e, '#simulador')} className="hover:text-white transition-colors cursor-pointer" href="#simulador">
                      Simulador Atuarial
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contato"
                      onClick={(e) => {
                        e.preventDefault();
                        openSpecialistModal({ origin: 'Footer · Falar com especialista' });
                      }}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      Falar com especialista
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${SITE_CONFIG.email}?subject=Ouvidoria`} className="hover:text-white transition-colors">
                      Ouvidoria
                    </a>
                  </li>
                </ul>
              </div>

            </div>

            {/* Faixa Final com Links Legais, identificação da sociedade e Copyright */}
            <div className="border-t border-white/[0.08] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/50 tracking-wider">
              <div className="text-center md:text-left space-y-1">
                <p>© {new Date().getFullYear()} PREVIARE. TODOS OS DIREITOS RESERVADOS.</p>
                {legalLine && <p className="text-white/40 normal-case tracking-normal">{legalLine}</p>}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6">
                <Link className="hover:text-white transition-colors" href="/termos">
                  TERMOS DE USO
                </Link>
                <span className="text-white/20">•</span>
                <Link className="hover:text-white transition-colors" href="/politica-de-privacidade">
                  POLÍTICA DE PRIVACIDADE (LGPD)
                </Link>
              </div>
              <div className="text-white/50 font-medium uppercase">
                {SITE_CONFIG.city} / Brasil
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export { Footer };

