"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { deferScrollSetup, willChangeWhileActive, type Gsap } from "@/lib/gsap";

const NARRATIVE_BLOCKS = [
  {
    tag: "IDENTIDADE & ORIGEM",
    title: "Compreender o presente para preparar melhor o futuro.",
    text: "A Previare existe no intervalo vital entre a vida de trabalho que se organiza e o futuro que se quer desfrutar. O nome nasce da fusão essencial: prever, preparar e olhar adiante. Não atuamos apenas no momento burocrático do protocolo; construímos a ponte técnica para que cada decisão tomada hoje se converta em tranquilidade duradoura amanhã.",
  },
  {
    tag: "O TERRITÓRIO",
    title: "Previdência com Auditoria Técnica.",
    text: "Muito mais do que conduzir processos rotineiros, realizamos a higienização e auditoria minuciosa do extrato CNIS. Localizamos e sanamos inconsistências crônicas (como períodos sem data fim, recolhimentos extemporâneos e conversão de tempo especial) que bloqueiam a concessão e rebaixam drasticamente o valor do benefício no INSS.",
  },
  {
    tag: "METODOLOGIA",
    title: "Três P. Uma Previare.",
    text: "Nossa prática se apoia em três dimensões complementares: Previdência como nosso território de domínio técnico e normativo; Planejamento como nosso método matemático de simular cenários de transição para o melhor retorno sobre investimento (ROI); e Proximidade como compromisso de escuta humana atenta a cada trajetória de vida.",
  },
  {
    tag: "PROPOSTA DE VALOR",
    title: "Tornar simples aquilo que parece complicado.",
    text: "A Reforma da Previdência fragmentou os caminhos com regras complexas de pedágio, idade e pontos. Traduzimos cálculos atuariais e termos jurídicos herméticos em relatórios executivos cristalinos, permitindo que você decida exatamente quando e como requerer seu direito com máxima rentabilidade.",
  },
  {
    tag: "ARQUÉTIPO & POSTURA",
    title: "Autoridade sem arrogância, empatia sem falsas promessas.",
    text: "Combinamos a precisão analítica do especialista com a proteção e o acolhimento de quem se importa. Sentamos ao lado de cada cliente para explicar minuciosamente cada cenário, garantindo que o esforço de uma vida inteira seja reconhecido pelo teto legal cabível.",
  },
];

// Blocos fora de foco seguem legíveis para o público sênior (contraste mínimo sobre #EAF2EB)
const INACTIVE_OPACITY = 0.55;

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);

  function setupScroll(gsap: Gsap) {
    if (!sectionRef.current || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const parent = container.parentElement;
    if (!parent) return;

    // ── FASE DE LEITURA: todas as medições geométricas em lote, antes de
    // qualquer escrita no DOM (pin-spacer, gsap.set), evitando reflow forçado.
    const viewportHeight = parent.clientHeight;
    const totalScroll = container.scrollHeight - viewportHeight + 48;
    if (totalScroll <= 0) return;

    const items = Array.from(container.querySelectorAll<HTMLElement>(".narrative-item"));
    const itemCenters = items.map((item) => item.offsetTop + item.clientHeight / 2);

    // ── FASE DE ESCRITA
    // Linha do tempo contínua e sem degraus para scroll fluido
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        pin: true,
        scrub: 0.6, // Resposta ágil e natural ao gesto do usuário
        start: "top top",
        end: () => `+=${Math.round(totalScroll * 1.6)}`,
        invalidateOnRefresh: true,
        // Camadas de GPU só enquanto a seção está pinada
        // (a marca d'água já tem camada própria e permanente)
        onToggle: willChangeWhileActive([container, ...items]),
      },
    });

    // Movimento perfeitamente uniforme por toda a extensão da timeline (duration: 1)
    tl.to(
      container,
      {
        y: -totalScroll,
        ease: "none",
        duration: 1,
      },
      0
    );

    // Parallax sutil na marca d'água monumental
    if (watermarkRef.current) {
      tl.to(
        watermarkRef.current,
        {
          y: -40,
          rotation: 1,
          ease: "none",
          duration: 1,
        },
        0
      );
    }

    // Iluminação progressiva e suave de cada bloco baseada na sua posição real na janela
    if (items.length > 0) {
      // Inicializa opacidades
      items.forEach((item, idx) => {
        gsap.set(item, { opacity: idx === 0 ? 1 : INACTIVE_OPACITY });
      });

      items.forEach((item, idx) => {
        const itemCenter = itemCenters[idx];
        const targetCenter = viewportHeight / 2;
        const scrollAtCenter = itemCenter - targetCenter;
        const progressCenter = Math.max(0, Math.min(1, scrollAtCenter / totalScroll));
        const windowSpan = 0.14;

        if (idx === 0) {
          // Bloco inicial começa em destaque e esmaece suavemente ao subir
          tl.to(
            item,
            { opacity: INACTIVE_OPACITY, ease: "power1.inOut", duration: 0.1 },
            0.16
          );
        } else {
          const startIn = Math.max(0, progressCenter - windowSpan);
          const peak = progressCenter;
          const endOut = Math.min(1, progressCenter + windowSpan);

          // Entrada para foco integral
          tl.to(
            item,
            { opacity: 1, ease: "power1.inOut", duration: Math.max(0.04, peak - startIn) },
            startIn
          );

          // Saída para foco secundário (exceto último bloco)
          if (idx < items.length - 1) {
            tl.to(
              item,
              { opacity: INACTIVE_OPACITY, ease: "power1.inOut", duration: Math.max(0.04, endOut - peak) },
              peak
            );
          }
        }
      });
    }
  }

  // Setup diferido para após a hidratação (prioriza FCP/LCP), com GSAP
  // carregado sob demanda; o contexto reverte tudo ao desmontar.
  useEffect(
    () =>
      deferScrollSetup(({ gsap }) => {
        const ctx = gsap.context(() => setupScroll(gsap), sectionRef.current ?? undefined);
        return () => ctx.revert();
      }),
    []
  );

  return (
    <section
      ref={sectionRef}
      id="sobre"
      aria-label="Sobre a Previare"
      data-theme="light"
      className="relative w-full h-screen overflow-hidden bg-[#EAF2EB] flex flex-col justify-end pb-10 sm:pb-14 md:pb-16 items-end px-6 sm:px-12 md:px-20 lg:px-32 z-20 select-none pt-24 md:pt-32"
    >
      {/* Marca d'água monumental (#2F7335): camada de GPU própria e permanente, sem
          filtros — o parallax só move a textura já rasterizada, sem repintar o SVG */}
      <div
        ref={watermarkRef}
        className="absolute -left-12 sm:-left-20 lg:-left-32 top-1/2 -translate-y-1/2 w-[540px] md:w-[780px] lg:w-[940px] h-[540px] md:h-[780px] lg:h-[940px] pointer-events-none select-none opacity-[0.08] flex items-center justify-center will-change-transform transform-gpu"
        aria-hidden="true"
      >
        <Image
          src="/images/logos/previare-mark.svg"
          alt="Previare Marca d'água"
          width={940}
          height={940}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Identificador editorial de topo da seção */}
      <div className="absolute top-24 sm:top-28 md:top-32 right-6 sm:right-12 md:right-20 lg:right-32">
        <span className="text-sm sm:text-base md:text-lg font-sans tracking-[0.2em] text-[#2F7335] uppercase font-semibold">
          A MARCA &amp; O PROPÓSITO
        </span>
      </div>

      {/* Janela de Leitura com ScrollTrigger Pin */}
      <div className="w-full max-w-xl lg:max-w-2xl h-[68vh] sm:h-[70vh] md:h-[72vh] overflow-hidden relative flex flex-col justify-start">
        <div ref={scrollContainerRef} className="flex flex-col gap-20 sm:gap-24 py-10 md:py-12">
          {NARRATIVE_BLOCKS.map((item, index) => (
            <div
              key={index}
              className="narrative-item space-y-4 border-l-2 border-[#2F7335]/35 pl-7 sm:pl-8"
            >
              <span className="block text-[11px] font-sans tracking-[0.25em] text-[#2F7335] uppercase font-semibold">
                {item.tag}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[2.5rem] text-[#0B1A0F] font-light leading-[1.18] tracking-tight">
                {item.title}
              </h2>
              <p className="font-sans text-base sm:text-[17px] text-[#1F3325]/85 font-light leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { AboutSection };
