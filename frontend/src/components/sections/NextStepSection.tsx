'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { deferScrollSetup } from '@/lib/gsap';
import { scrollToSection } from '@/lib/smoothScroll';
import { cn } from '@/lib/utils';
import { useSpecialistModal } from '@/components/contact/SpecialistModalProvider';
import type { ContactSubject } from '@/lib/specialistContact';

interface NextStep {
  title: string;
  description: string;
  cta: string;
  href: string;
  /** Assunto pré-selecionado quando o CTA abre o modal de atendimento */
  subject?: ContactSubject;
  /** Área ocupada pelo card no mosaico (grid de 12 colunas no desktop) */
  area: string;
}

const NEXT_STEPS: NextStep[] = [
  {
    title: 'Planejar minha aposentadoria',
    description: 'Entenda seu histórico e organize as possibilidades para o futuro.',
    cta: 'Quero me planejar',
    href: '#contato',
    subject: 'Planejamento Previdenciário',
    // Horizontal largo: quadrante superior esquerdo
    area: 'md:col-span-2 lg:col-span-8 lg:row-start-1 lg:min-h-[440px]',
  },
  {
    title: 'Entender meus direitos',
    description: 'Orientação sobre benefícios, contribuições e documentação.',
    cta: 'Quero orientação',
    href: '#contato',
    // Coluna alta e esguia: lateral superior direita
    area: 'lg:col-span-4 lg:col-start-9 lg:row-start-1',
  },
  {
    title: 'Conferir minha aposentadoria',
    description: 'Já recebe benefício? Verificamos se o cálculo do INSS considerou todo o seu histórico.',
    cta: 'Quero conferir',
    href: '#contato',
    subject: 'Revisão de Aposentadoria Concedida',
    // Bloco compacto: quadrante inferior esquerdo
    area: 'lg:col-span-4 lg:row-start-2 lg:min-h-[320px]',
  },
  {
    title: 'Olhar de perto meu histórico',
    description: 'Análise do CNIS e orientação sobre possíveis ajustes e revisões.',
    cta: 'Quero analisar',
    href: '#contato',
    subject: 'Auditoria de CNIS e Vínculos',
    // Horizontal amplo: fecha a base à direita
    area: 'md:col-span-2 lg:col-span-8 lg:col-start-5 lg:row-start-2',
  },
];

export default function NextStepSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);

  // Setup diferido para após a hidratação (prioriza FCP/LCP), com GSAP
  // carregado sob demanda; o revert desfaz tudo ao desmontar.
  useEffect(
    () =>
      deferScrollSetup(({ gsap }) => {
        // matchMedia com escopo na seção: seletores e revert ficam contidos nela
        const mm = gsap.matchMedia(sectionRef.current ?? undefined);

        mm.add('(prefers-reduced-motion: no-preference)', () => {
          // Entrada suave de cada card conforme a rolagem
          gsap.utils.toArray<HTMLElement>('.next-step-card').forEach((card, idx) => {
            gsap.fromTo(
              card,
              { opacity: 0, y: 70 + idx * 10 },
              {
                opacity: 1,
                y: 0,
                duration: 1.1,
                ease: 'power3.out',
                scrollTrigger: {
                  trigger: card,
                  start: 'top 88%',
                  toggleActions: 'play none none reverse',
                },
              }
            );
          });

          // Parallax sutil na marca d'água
          if (watermarkRef.current && sectionRef.current) {
            gsap.to(watermarkRef.current, {
              y: -120,
              rotation: -2,
              ease: 'none',
              scrollTrigger: {
                trigger: sectionRef.current,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            });
          }
        });
        return () => mm.revert();
      }),
    []
  );

  const { openSpecialistModal } = useSpecialistModal();

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, step: NextStep) => {
    e.preventDefault();
    if (step.href === '#contato') {
      openSpecialistModal({ subject: step.subject, origin: `Próximo Passo · ${step.title}` });
      return;
    }
    scrollToSection(step.href, { offset: 85 });
  };

  return (
    <section
      ref={sectionRef}
      id="proximo-passo"
      aria-labelledby="proximo-passo-title"
      data-theme="light"
      className="relative w-full overflow-hidden bg-paper-soft text-[#0B1A0F] select-none"
    >
      {/* Junto com o FAQ forma o capítulo "decidir": separação por hairline, sem quebra de tom */}
      <div className="absolute inset-x-0 top-0 h-px bg-[#2F7335]/20 pointer-events-none" aria-hidden="true" />

      {/* Marca d'água translúcida da Previare */}
      <div
        ref={watermarkRef}
        className="absolute -right-24 sm:-right-40 lg:-right-56 top-[18%] w-[520px] md:w-[760px] lg:w-[920px] h-[520px] md:h-[760px] lg:h-[920px] pointer-events-none opacity-[0.06]"
        aria-hidden="true"
      >
        <Image
          src="/images/logos/previare-mark.svg"
          alt=""
          width={920}
          height={920}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="relative z-10 w-full max-w-[1500px] mx-auto px-4 sm:px-12 lg:px-20 pt-28 sm:pt-36 pb-40 sm:pb-52">
        {/* Cabeçalho */}
        <header className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-20 sm:mb-28">
          <div className="max-w-4xl">
            <span className="block text-[11px] sm:text-xs font-sans tracking-[0.3em] text-[#2F7335] uppercase font-semibold mb-5">
              Para cada momento, um próximo passo
            </span>
            <h2
              id="proximo-passo-title"
              className="font-serif text-[2.6rem] sm:text-6xl md:text-7xl lg:text-[5.5rem] font-light leading-[0.98] tracking-tight text-[#0B1A0F]"
            >
              O que faz sentido para você hoje?
            </h2>
          </div>
          <p className="lg:max-w-xs lg:pb-3 border-l-2 border-[#2F7335]/35 pl-5 font-sans text-lg sm:text-xl text-[#1F3325]/85 font-light leading-snug">
            Escolha o assunto. A gente começa por você.
          </p>
        </header>

        {/* Mosaico encaixado (bento grid): 1 coluna no celular, 2 no tablet, 12 no desktop.
            Lista não ordenada: são caminhos independentes, não etapas em sequência. */}
        <ul className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
          {NEXT_STEPS.map((step) => (
            <li key={step.title} className={cn('next-step-card relative flex', step.area)}>
              <article
                className={cn(
                  'group relative flex w-full flex-col justify-between gap-10 sm:gap-12 min-h-[240px] sm:min-h-[280px]',
                  // Sem a numeração, o título abre o card: topo um pouco mais enxuto que as laterais
                  'rounded-[28px] sm:rounded-[36px] px-7 pt-8 pb-7 sm:px-10 sm:pt-11 sm:pb-10 lg:px-12 lg:pt-12 lg:pb-12',
                  'bg-white border border-[#0B1A0F]/[0.06]',
                  'shadow-[0_1px_2px_rgba(16,52,26,0.04),0_18px_44px_-24px_rgba(16,52,26,0.22)]',
                  'transition-[transform,box-shadow] duration-500 ease-out',
                  'hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(16,52,26,0.05),0_28px_60px_-26px_rgba(16,52,26,0.32)]'
                )}
              >
                <div className="max-w-xl">
                  <h3 className="font-serif -mt-1 text-3xl sm:text-4xl lg:text-[2.6rem] font-light leading-[1.08] tracking-tight text-[#0B1A0F] text-balance">
                    {step.title}
                  </h3>
                  <p className="mt-4 sm:mt-5 max-w-md font-sans text-[17px] sm:text-lg text-[#1F3325]/90 font-normal leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <a
                  href={step.href}
                  onClick={(e) => handleNav(e, step)}
                  className="relative inline-flex w-fit shrink-0 items-center gap-2 pb-1 font-sans text-base sm:text-lg font-medium text-[#1F3325] transition-colors duration-300 hover:text-[#2F7335] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7335]/50 focus-visible:ring-offset-4 focus-visible:ring-offset-paper-soft rounded-sm"
                >
                  {step.cta}
                  <span
                    aria-hidden="true"
                    className="inline-block text-[#2F7335] transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:scale-110"
                  >
                    ↗
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute left-0 bottom-0 h-px w-full origin-left scale-x-[0.35] bg-[#2F7335]/60 transition-transform duration-500 ease-out group-hover:scale-x-100"
                  />
                </a>
              </article>
            </li>
          ))}
        </ul>
      </div>

      {/* Transição de saída: prepara a chegada do degradê escuro do formulário */}
      <div
        className="absolute inset-x-0 bottom-0 h-32 sm:h-44 bg-gradient-to-b from-transparent to-ink-deep pointer-events-none"
        aria-hidden="true"
      />
    </section>
  );
}

export { NextStepSection };
