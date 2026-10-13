"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ArrowDown } from "lucide-react";
import { SilkFallback } from "@/components/canvas/fallbacks";

// Shader WebGL fora do bundle inicial e fora do SSR: o HTML do servidor já
// pinta a base estática em CSS, e o canvas assume após a hidratação.
const SilkBackground = dynamic(() => import("@/components/canvas/SilkBackground"), {
  ssr: false,
  loading: () => <SilkFallback />,
});

// A intro (linhas do título, subtítulo e scroll) é animada via CSS em globals.css
// (keyframes `hero-intro`), com a mesma coreografia da timeline GSAP original.
export default function HeroSection() {
  return (
    <section
      aria-label="Apresentação Previare"
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-transparent select-none pt-24 md:pt-32 pb-8 px-6 sm:px-10 md:px-16"
    >
      {/* Canvas WebGL renderizado diretamente como background */}
      <SilkBackground />

      {/* Conteúdo Principal Deslocado à Direita (Composição Editorial IWC) */}
      <div className="w-full flex-1 flex flex-col items-end justify-center my-auto z-10">
        <div className="flex flex-col items-start justify-center pr-2 sm:pr-6 md:pr-10 lg:pr-16 xl:pr-24 max-w-full">
          {/* Título Monumental Desalinhado (2 Linhas) */}
          <h1 className="flex flex-col font-serif font-light text-5xl sm:text-6xl md:text-7xl lg:text-[7.2rem] xl:text-[8.5rem] 2xl:text-[9.5rem] leading-[0.94] sm:leading-[0.96] -tracking-[0.03em] text-[#f0f9f3]/90 drop-shadow-[0_15px_35px_rgba(0,0,0,0.4)]">
            {/* Primeira Linha: deslocada sutilmente para a direita */}
            <span className="hero-line-1 block pl-8 sm:pl-16 md:pl-24 lg:pl-32 xl:pl-40 font-serif font-light uppercase whitespace-nowrap mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              PLANEJAMENTO
            </span>

            {/* Segunda Linha: puxada mais para a esquerda/base monumental */}
            <span className="hero-line-2 block font-serif font-light uppercase whitespace-nowrap">
              PREVIDENCIÁRIO
            </span>
          </h1>

          {/* Subtítulo Posicionado Logo Abaixo */}
          <p className="hero-subtitle mt-6 sm:mt-8 md:mt-10 max-w-sm sm:max-w-md md:max-w-xl text-xs sm:text-sm md:text-base text-white/80 font-sans font-light leading-relaxed tracking-wide text-left pl-2 drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
            Consultoria estratégica de vínculos, cálculo atuarial multivariado e segurança jurídica para o seu futuro patrimonial.
          </p>
        </div>
      </div>

      {/* Rodapé da Tela: SCROLL DOWN Centralizado */}
      <div className="hero-scroll relative z-10 flex flex-col items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-[10px] tracking-[0.3em] uppercase pointer-events-none mx-auto pb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
        <span>SCROLL DOWN</span>
        <ArrowDown className="w-3.5 h-3.5 animate-bounce text-white/40" />
      </div>
    </section>
  );
}

export { HeroSection };
