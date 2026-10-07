'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { deferScrollSetup, type Gsap } from '@/lib/gsap';
import { LiquidMetalFallback } from '@/components/canvas/fallbacks';

// Shader WebGL carregado sob demanda (fora do bundle inicial e do SSR)
const LiquidMetalBackground = dynamic(() => import('@/components/canvas/LiquidMetalBackground'), {
  ssr: false,
  loading: () => <LiquidMetalFallback />,
});

interface Differential {
  title: string;
  subtitle: string;
  phrases: string[];
}

const DIFFERENTIALS: Differential[] = [
  {
    title: 'Auditoria Atuarial Multivariada',
    subtitle: 'Inteligência preditiva além do protocolo comum.',
    phrases: [
      'Enquanto processos rotineiros se limitam a anexar guias no sistema Meu INSS,',
      'nossa equipe realiza uma auditoria minuciosa e independente de cada linha do extrato CNIS.',
      'Simulam-se matematicamente todas as regras de transição para assegurar o teto legal do seu benefício.',
    ],
  },
  {
    title: 'Tempo Especial & Periculosidade',
    subtitle: 'Resgate rigoroso de atividades exercidas com agentes nocivos.',
    phrases: [
      'Conversão técnica de períodos expostos a insalubridade e periculosidade trabalhados até a Reforma.',
      'Qualificamos laudos LTCAT e formulários PPP para viabilizar multiplicadores probatórios (1.4 e 1.2),',
      'antecipando sua aposentadoria em anos e elevando o valor mensal do benefício.',
    ],
  },
  {
    title: 'O Especialista Próximo',
    subtitle: 'Autoridade técnica com diálogo transparente e acolhedor.',
    phrases: [
      'Traduzimos regras atuariais complexas em relatórios cristalinos e diretos ao ponto.',
      'Cada cliente é atendido diretamente por quem compreende as variáveis da matéria,',
      'sem respostas padronizadas de robôs ou termos jurídicos que geram insegurança.',
    ],
  },
  {
    title: 'Rigor Jurídico & Segurança',
    subtitle: 'Atuação em estrita consonância com os parâmetros da OAB.',
    phrases: [
      'Transparência técnica irrepreensível, sigilo de dados e conformidade com a LGPD.',
      'Não criamos falsas expectativas: trabalhamos somente com direitos comprováveis,',
      'sustentação em teses consolidadas e cálculo atuarial rigorosamente fundamentado.',
    ],
  },
];

export default function DifferentialsSection() {
  const containerRef = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  function setupScroll(gsap: Gsap) {
    // 1. Linha Contínua em SVG acompanhando o scroll
    const path = pathRef.current;
    if (path && containerRef.current) {
      const length = path.getTotalLength();
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 20%',
          end: 'bottom 90%',
          scrub: 1.2,
        },
      });
    }

    // 2. Efeito "Scroll to Reveal" (Frase por Frase com Scrub estilo Apple/Linear)
    const revealBlocks = gsap.utils.toArray<HTMLElement>('.reveal-text-block');
    revealBlocks.forEach((block) => {
      const spans = block.querySelectorAll<HTMLSpanElement>('.reveal-span');
      gsap.fromTo(
        spans,
        { opacity: 0.18, color: '#555555' },
        {
          opacity: 1,
          color: '#FFFFFF',
          stagger: 0.35,
          ease: 'none',
          scrollTrigger: {
            trigger: block,
            start: 'top 75%',
            end: 'bottom 40%',
            scrub: 0.8,
          },
        }
      );
    });
  }

  // Setup diferido para após a hidratação (prioriza FCP/LCP), com GSAP
  // carregado sob demanda; o contexto reverte tudo ao desmontar.
  useEffect(
    () =>
      deferScrollSetup(({ gsap }) => {
        const ctx = gsap.context(() => setupScroll(gsap), containerRef.current ?? undefined);
        return () => ctx.revert();
      }),
    []
  );

  return (
    <section
      ref={containerRef}
      id="diferenciais"
      className="relative w-full py-36 sm:py-56 overflow-clip bg-[#030F0A] text-white select-none"
    >
      {/* Shader WebGL Liquid Metal de Fundo */}
      <LiquidMetalBackground />

      {/* Película escura para contraste ideal */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] pointer-events-none -z-0"
        aria-hidden="true"
      />

      {/* Linha Contínua Verde Floresta em SVG */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none -z-0 opacity-40"
        viewBox="0 0 1440 3200"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          ref={pathRef}
          d="M 150 0 
             C 650 400, 1320 550, 1180 1000 
             C 1020 1500, 120 1700, 280 2250 
             C 420 2750, 1280 2700, 720 3200"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>

      {/* Cabeçalho Monumental 100% à Esquerda (Colado) */}
      <div className="w-full max-w-[1650px] mx-auto px-6 sm:px-12 lg:px-20 text-left mb-36 sm:mb-56 relative z-10">
        <span className="text-xs font-sans tracking-[0.3em] uppercase text-[#7CE577] font-semibold block mb-4">
          Diferenciais Estratégicos
        </span>
        <h2 className="font-serif text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.5rem] font-light text-white leading-[0.96] tracking-tight max-w-6xl drop-shadow-[0_15px_35px_rgba(0,0,0,0.5)]">
          Por que a Previare transforma o desfecho do seu benefício.
        </h2>
        <p className="mt-6 sm:mt-8 max-w-2xl text-base sm:text-lg text-white/70 font-sans font-light leading-relaxed drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
          Um método analítico que une inteligência de dados à segurança jurídica para resguardar o patrimônio de uma vida de trabalho.
        </p>
      </div>

      {/* Lista de Diferenciais: Tipografia Monumental Ampla com Ritmo Desalinhado */}
      <div className="w-full max-w-[1650px] mx-auto px-6 sm:px-12 lg:px-20 flex flex-col gap-44 sm:gap-64 relative z-10">
        {/* Item 01: Puxado para a Esquerda */}
        <div className="reveal-text-block w-full max-w-6xl pl-2 sm:pl-10 lg:pl-16 text-left">
          <h3 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] xl:text-[5.5rem] font-light text-white uppercase leading-[0.96] tracking-tight drop-shadow-[0_12px_35px_rgba(0,0,0,0.8)]">
            {DIFFERENTIALS[0].title}
          </h3>

          <p className="mt-6 text-base sm:text-xl lg:text-2xl text-[#7CE577] font-medium tracking-wide">
            {DIFFERENTIALS[0].subtitle}
          </p>

          <div className="mt-5 text-lg sm:text-xl md:text-2xl lg:text-[1.65rem] text-white/80 font-light leading-relaxed max-w-3xl sm:max-w-4xl lg:max-w-5xl">
            {DIFFERENTIALS[0].phrases.map((phrase, pIdx) => (
              <span
                key={pIdx}
                className="reveal-span inline mr-2"
              >
                {phrase}{' '}
              </span>
            ))}
          </div>
        </div>

        {/* Item 02: Deslocado para a Direita */}
        <div className="reveal-text-block w-full max-w-6xl ml-auto pr-2 sm:pr-10 lg:pr-20 text-left">
          <h3 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] xl:text-[5.5rem] font-light text-white uppercase leading-[0.96] tracking-tight drop-shadow-[0_12px_35px_rgba(0,0,0,0.8)]">
            {DIFFERENTIALS[1].title}
          </h3>

          <p className="mt-6 text-base sm:text-xl lg:text-2xl text-[#7CE577] font-medium tracking-wide">
            {DIFFERENTIALS[1].subtitle}
          </p>

          <div className="mt-5 text-lg sm:text-xl md:text-2xl lg:text-[1.65rem] text-white/80 font-light leading-relaxed max-w-3xl sm:max-w-4xl lg:max-w-5xl">
            {DIFFERENTIALS[1].phrases.map((phrase, pIdx) => (
              <span
                key={pIdx}
                className="reveal-span inline mr-2"
              >
                {phrase}{' '}
              </span>
            ))}
          </div>
        </div>

        {/* Item 03: Posição Intermediária Central-Esquerda */}
        <div className="reveal-text-block w-full max-w-6xl pl-4 sm:pl-16 lg:pl-32 text-left">
          <h3 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] xl:text-[5.5rem] font-light text-white uppercase leading-[0.96] tracking-tight drop-shadow-[0_12px_35px_rgba(0,0,0,0.8)]">
            {DIFFERENTIALS[2].title}
          </h3>

          <p className="mt-6 text-base sm:text-xl lg:text-2xl text-[#7CE577] font-medium tracking-wide">
            {DIFFERENTIALS[2].subtitle}
          </p>

          <div className="mt-5 text-lg sm:text-xl md:text-2xl lg:text-[1.65rem] text-white/80 font-light leading-relaxed max-w-3xl sm:max-w-4xl lg:max-w-5xl">
            {DIFFERENTIALS[2].phrases.map((phrase, pIdx) => (
              <span
                key={pIdx}
                className="reveal-span inline mr-2"
              >
                {phrase}{' '}
              </span>
            ))}
          </div>
        </div>

        {/* Item 04: Deslocado para a Direita com Recuo Diferenciado */}
        <div className="reveal-text-block w-full max-w-6xl ml-auto pr-4 sm:pr-14 lg:pr-28 text-left">
          <h3 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4.75rem] xl:text-[5.5rem] font-light text-white uppercase leading-[0.96] tracking-tight drop-shadow-[0_12px_35px_rgba(0,0,0,0.8)]">
            {DIFFERENTIALS[3].title}
          </h3>

          <p className="mt-6 text-base sm:text-xl lg:text-2xl text-[#7CE577] font-medium tracking-wide">
            {DIFFERENTIALS[3].subtitle}
          </p>

          <div className="mt-5 text-lg sm:text-xl md:text-2xl lg:text-[1.65rem] text-white/80 font-light leading-relaxed max-w-3xl sm:max-w-4xl lg:max-w-5xl">
            {DIFFERENTIALS[3].phrases.map((phrase, pIdx) => (
              <span
                key={pIdx}
                className="reveal-span inline mr-2"
              >
                {phrase}{' '}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export { DifferentialsSection };
