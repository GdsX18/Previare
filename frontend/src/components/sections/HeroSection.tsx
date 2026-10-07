"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArrowDown } from "lucide-react";
import { SilkFallback } from "@/components/canvas/fallbacks";
import { useSpecialistModal } from "@/components/contact/SpecialistModalProvider";
import { scrollToSection } from "@/lib/smoothScroll";

// Shader WebGL fora do bundle inicial e fora do SSR: o HTML do servidor já
// pinta a base estática em CSS, e o canvas assume após a hidratação.
const SilkBackground = dynamic(() => import("@/components/canvas/SilkBackground"), {
  ssr: false,
  loading: () => <SilkFallback />,
});

// A intro (linhas do título, subtítulo e scroll) é animada via CSS em globals.css
// (keyframes `hero-intro`), com a mesma coreografia da timeline GSAP original.
export default function HeroSection() {
  const { openSpecialistModal } = useSpecialistModal();

  return (
    <section
      aria-label="Apresentação Previare"
      className="relative w-full min-h-[100dvh] flex flex-col justify-between overflow-hidden bg-transparent select-none pt-24 md:pt-32 pb-[max(2rem,env(safe-area-inset-bottom))] px-5 sm:px-8 md:px-16"
    >
      {/* Canvas WebGL renderizado diretamente como background */}
      <SilkBackground />

      {/* Conteúdo Principal Deslocado à Direita (Composição Editorial IWC); abaixo de
          640px o bloco é centrado e simétrico */}
      <div className="w-full flex-1 flex flex-col items-center sm:items-end justify-center my-auto z-10">
        <div className="flex flex-col items-center sm:items-start justify-center w-full max-w-xl mx-auto sm:w-auto sm:max-w-full sm:mx-0 sm:pr-6 md:pr-10 lg:pr-16 xl:pr-24">
          {/* Título Monumental Desalinhado (2 Linhas). No mobile o clamp() limita a
              largura de "PREVIDENCIÁRIO" à da tela, sem tocar as margens */}
          <h1 className="flex flex-col items-center sm:items-stretch font-serif font-light text-[clamp(1.85rem,8.5vw,3rem)] leading-[1.1] sm:text-5xl md:text-6xl lg:text-[7.2rem] xl:text-[8.5rem] 2xl:text-[9.5rem] sm:leading-[0.96] -tracking-[0.03em] text-[#f0f9f3]/90 drop-shadow-[0_15px_35px_rgba(0,0,0,0.4)]">
            {/* Primeira Linha: deslocada sutilmente para a direita */}
            <span className="hero-line-1 block sm:pl-16 md:pl-24 lg:pl-32 xl:pl-40 font-serif font-light uppercase whitespace-nowrap mb-1 sm:mb-4 md:mb-5 lg:mb-6">
              PLANEJAMENTO
            </span>

            {/* Segunda Linha: puxada mais para a esquerda/base monumental */}
            <span className="hero-line-2 block font-serif font-light uppercase whitespace-nowrap">
              PREVIDENCIÁRIO
            </span>
          </h1>

          {/* Subtítulo Posicionado Logo Abaixo */}
          <p className="hero-subtitle mt-6 sm:mt-8 md:mt-10 max-w-sm sm:max-w-md md:max-w-xl text-base md:text-lg text-white/85 font-sans font-light leading-relaxed tracking-wide text-center sm:text-left sm:pl-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
            Consultoria estratégica de vínculos, cálculo atuarial multivariado e segurança jurídica para o seu futuro patrimonial.
          </p>

          {/* CTAs: principal leva ao simulador, secundário abre o atendimento */}
          <div className="hero-ctas mt-8 sm:mt-10 sm:pl-2 flex flex-col items-center sm:flex-row gap-4 sm:gap-8 w-full sm:w-auto">
            <a
              href="#simulador"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("#simulador", { offset: 85 });
              }}
              className="inline-flex min-h-[56px] w-full max-w-xs sm:w-fit sm:max-w-none items-center justify-center gap-3 rounded-full bg-[#7CE577] px-7 font-sans text-base font-semibold text-ink-deep shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7CE577] focus-visible:ring-offset-4 focus-visible:ring-offset-ink-deep"
            >
              Fazer minha simulação
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#contato"
              onClick={(e) => {
                e.preventDefault();
                openSpecialistModal({ origin: "Hero · Falar com um especialista" });
              }}
              className="inline-flex min-h-[44px] w-fit items-center gap-2 border-b border-white/40 pb-0.5 font-sans text-base font-medium text-white/90 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] transition-colors hover:border-white hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent rounded-sm"
            >
              Falar com um especialista
            </a>
          </div>
        </div>
      </div>

      {/* Rodapé da Tela: convite à rolagem centralizado */}
      <div className="hero-scroll relative z-10 flex flex-col items-center gap-2 text-white/60 text-xs tracking-[0.3em] uppercase pointer-events-none mx-auto pb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
        <span>Role para conhecer</span>
        <ArrowDown className="w-3.5 h-3.5 animate-bounce motion-reduce:animate-none text-white/60" aria-hidden="true" />
      </div>
    </section>
  );
}

export { HeroSection };
