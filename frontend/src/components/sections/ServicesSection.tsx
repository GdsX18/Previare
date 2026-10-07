'use client';

import React, { useRef, useEffect } from 'react';
import { deferScrollSetup, willChangeWhileActive } from '@/lib/gsap';
import { useSpecialistModal } from '@/components/contact/SpecialistModalProvider';
import type { ContactSubject } from '@/lib/specialistContact';

interface Service {
  title: string;
  description: string;
}

interface Journey {
  /** Momento de vida em que a pessoa se reconhece */
  title: string;
  lead: string;
  cta: string;
  /** Assunto pré-selecionado no modal de atendimento */
  subject: ContactSubject;
  services: Service[];
}

// Os 14 serviços agrupados em 4 jornadas, alinhadas às abas do simulador e aos
// assuntos do modal: o visitante procura pelo seu momento, não pelo nome técnico.
const JOURNEYS: Journey[] = [
  {
    title: 'Antes de me aposentar',
    lead: 'Para quem quer decidir quando e como pedir, com todos os números na mesa.',
    cta: 'Planejar minha aposentadoria',
    subject: 'Planejamento Previdenciário',
    services: [
      {
        title: 'Planejamento previdenciário',
        description: 'Estudo atuarial do seu histórico para escolher a regra e o momento mais vantajosos.',
      },
      {
        title: 'Aposentadorias e regras de transição',
        description: 'Idade, tempo de contribuição e transições pós-Reforma, conduzidas do início ao fim.',
      },
      {
        title: 'Análise do CNIS',
        description: 'Auditoria linha a linha para achar vínculos faltantes e remunerações inconsistentes.',
      },
      {
        title: 'Acertos previdenciários',
        description: 'Tratamento de PREM-EXT, vínculos sem data de término e contribuições abaixo do piso.',
      },
      {
        title: 'Tempo especial e documentação',
        description: 'Qualificação de PPP, LTCAT, carteiras e provas de atividade rural ou autônoma.',
      },
      {
        title: 'Simulações comparativas',
        description: 'Todos os cenários legais calculados lado a lado, antes de qualquer protocolo.',
      },
    ],
  },
  {
    title: 'Já sou aposentado',
    lead: 'Para quem já recebe e quer ter certeza de que o INSS considerou tudo.',
    cta: 'Conferir meu benefício',
    subject: 'Revisão de Aposentadoria Concedida',
    services: [
      {
        title: 'Revisão de benefícios',
        description: 'Auditoria do cálculo inicial: períodos ignorados, salários fora da média e teses aplicáveis.',
      },
      {
        title: 'Serviços administrativos no INSS',
        description: 'Cumprimento de exigências, CTC, recursos à Junta e cópias integrais de processos.',
      },
      {
        title: 'Consultoria individual',
        description: 'Orientação didática sobre o seu benefício e o impacto de qualquer mudança.',
      },
    ],
  },
  {
    title: 'Saúde e família',
    lead: 'Para os momentos em que a proteção previdenciária precisa chegar rápido.',
    cta: 'Falar sobre o meu caso',
    subject: 'Benefício por Incapacidade ou BPC / LOAS',
    services: [
      {
        title: 'Benefícios por incapacidade',
        description: 'Acompanhamento documental e pericial do auxílio temporário e da aposentadoria por incapacidade.',
      },
      {
        title: 'Auxílio-acidente',
        description: 'Indenização a quem ficou com sequela permanente após acidente, cumulável com o salário.',
      },
      {
        title: 'Pensão por morte',
        description: 'Orientação aos dependentes sobre enquadramento, duração e cota familiar.',
      },
      {
        title: 'BPC / LOAS',
        description: 'Benefício assistencial para idosos e pessoas com deficiência em situação de vulnerabilidade.',
      },
    ],
  },
  {
    title: 'Para escritórios e empresas',
    lead: 'Suporte técnico a colegas advogados e departamentos de pessoas.',
    cta: 'Propor uma parceria',
    subject: 'Outro Assunto Previdenciário',
    services: [
      {
        title: 'Parcerias especializadas',
        description: 'Cálculos atuariais, pareceres fundamentados e apoio em casos de alta complexidade.',
      },
    ],
  },
];

export default function ServicesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { openSpecialistModal } = useSpecialistModal();

  const handleJourneyCta = (e: React.MouseEvent<HTMLAnchorElement>, journey: Journey) => {
    e.preventDefault();
    openSpecialistModal({
      subject: journey.subject,
      origin: `Serviços · ${journey.title}`,
    });
  };
  const glowRef = useRef<HTMLDivElement>(null);

  // Glow do cursor e trilho horizontal: setup diferido para após a hidratação
  // (prioriza FCP/LCP), com GSAP carregado sob demanda.
  useEffect(
    () =>
      deferScrollSetup(({ gsap }) => {
        const glow = glowRef.current;
        const container = containerRef.current;
        if (!glow || !container) return;

        // ── Glow do cursor — scoped ao container (não ao window).
        // Anima x/y (transform, composto na GPU) em vez de left/top (layout a cada frame).
        const setGlowX = gsap.quickTo(glow, 'x', { duration: 0.7, ease: 'power3.out' });
        const setGlowY = gsap.quickTo(glow, 'y', { duration: 0.7, ease: 'power3.out' });

        // A posição do container só muda com scroll/resize: cacheia o rect e o
        // invalida nesses eventos, em vez de ler getBoundingClientRect() a cada
        // pointermove (reflow forçado intercalado com as escritas do quickTo).
        let rect: DOMRect | null = null;
        const invalidateRect = () => {
          rect = null;
        };

        const handlePointerMove = (e: PointerEvent) => {
          if (!rect) rect = container.getBoundingClientRect();
          setGlowX(e.clientX - rect.left);
          setGlowY(e.clientY - rect.top);
        };

        container.addEventListener('pointermove', handlePointerMove, { passive: true });
        window.addEventListener('scroll', invalidateRect, { passive: true });
        window.addEventListener('resize', invalidateRect, { passive: true });

        // ── ScrollTrigger horizontal — apenas em desktop via matchMedia
        const slides = gsap.utils.toArray<HTMLElement>('.service-clean-slide', container);
        const mm = gsap.matchMedia(container);
        if (slides.length) {
          mm.add('(min-width: 1024px)', () => {
            const total = slides.length;

            // O revert do matchMedia mata este tween e o seu ScrollTrigger
            gsap.to(slides, {
              xPercent: -100 * (total - 1),
              ease: 'none',
              scrollTrigger: {
                trigger: container,
                pin: true,
                scrub: 1.2,
                snap: 1 / (total - 1),
                start: 'top top',
                end: () => `+=${window.innerWidth * (total * 0.7)}`,
                invalidateOnRefresh: true,
                // Camadas de GPU só enquanto o trilho horizontal está pinado
                onToggle: willChangeWhileActive(slides, 'transform'),
              },
            });
          });
        }

        return () => {
          container.removeEventListener('pointermove', handlePointerMove);
          window.removeEventListener('scroll', invalidateRect);
          window.removeEventListener('resize', invalidateRect);
          gsap.killTweensOf(glow);
          mm.revert();
        };
      }),
    []
  );

  return (
    <section
      ref={containerRef}
      id="servicos"
      aria-label="Serviços Previare"
      className="relative w-full overflow-hidden bg-ink-forest text-white select-none"
    >
      {/* Luz orgânica do cursor — apenas desktop */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute left-0 top-0 will-change-transform -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full bg-[radial-gradient(circle,rgba(14,124,90,0.22)_0%,rgba(110,243,119,0.05)_45%,transparent_75%)] blur-[90px] z-0 hidden lg:block"
      />

      {/* Identificador fixo no topo */}
      <div className="absolute top-24 sm:top-28 md:top-32 left-8 sm:left-14 md:left-20 lg:left-28 z-20 pointer-events-none">
        <span className="text-sm sm:text-base md:text-lg font-sans tracking-[0.25em] uppercase text-[#7CE577] font-semibold">
          SERVIÇOS
        </span>
      </div>

      {/* ─── DESKTOP: Trilho horizontal com GSAP ScrollTrigger (uma jornada por tela) ─── */}
      <div className="hidden lg:block h-screen">
        <div className="flex w-max h-full z-10 relative">
          {JOURNEYS.map((journey, index) => (
            <div
              key={journey.title}
              className="service-clean-slide w-screen h-full grid grid-cols-12 gap-16 px-28 pt-40 pb-16 relative shrink-0"
            >
              <div className="col-span-5 flex flex-col justify-center">
                <span className="text-sm font-sans tracking-[0.25em] text-white/50 uppercase">
                  {String(index + 1).padStart(2, '0')} / {String(JOURNEYS.length).padStart(2, '0')}
                </span>
                <h2
                  className="mt-6 font-serif font-light text-white/95 leading-[0.98] tracking-tight"
                  style={{ fontSize: 'clamp(2.75rem, 4.6vw, 5.25rem)' }}
                >
                  {journey.title}
                </h2>
                <p className="mt-6 max-w-md font-sans text-lg text-white/75 font-light leading-relaxed">
                  {journey.lead}
                </p>
                <a
                  href="#contato"
                  onClick={(e) => handleJourneyCta(e, journey)}
                  className="group mt-10 inline-flex w-fit items-center gap-3 text-base font-sans tracking-[0.15em] text-[#7CE577] uppercase font-medium hover:text-white transition-colors duration-300"
                >
                  <span>{journey.cta}</span>
                  <span className="w-6 h-[1px] bg-[#7CE577] group-hover:w-10 group-hover:bg-white transition-all duration-300" />
                </a>
              </div>

              <ul className="col-span-7 flex flex-col justify-center border-t border-white/[0.1] self-center w-full">
                {journey.services.map((service) => (
                  <li key={service.title} className="border-b border-white/[0.1] py-4 xl:py-5">
                    <h3 className="font-serif text-2xl xl:text-[1.75rem] font-light text-white/95 leading-tight">
                      {service.title}
                    </h3>
                    <p className="mt-1.5 font-sans text-base text-white/65 font-light leading-relaxed">
                      {service.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MOBILE + TABLET: Lista vertical nativa ─── */}
      <div className="lg:hidden flex flex-col pt-36 pb-16">
        {JOURNEYS.map((journey, index) => (
          <div
            key={journey.title}
            className="flex flex-col px-6 sm:px-14 py-12 sm:py-16 border-b border-white/[0.07] last:border-b-0"
          >
            <span className="text-sm font-sans tracking-[0.25em] text-white/50 uppercase mb-4 block">
              {String(index + 1).padStart(2, '0')} / {String(JOURNEYS.length).padStart(2, '0')}
            </span>
            <h2
              className="font-serif font-light text-white/95 leading-[1.02] tracking-tight"
              style={{ fontSize: 'clamp(2rem, 8vw, 3.25rem)' }}
            >
              {journey.title}
            </h2>
            <p className="mt-4 font-sans text-base sm:text-lg text-white/75 font-light leading-relaxed">
              {journey.lead}
            </p>
            <ul className="mt-8 border-t border-white/[0.1]">
              {journey.services.map((service) => (
                <li key={service.title} className="border-b border-white/[0.1] py-4">
                  <h3 className="font-serif text-xl sm:text-2xl font-light text-white/95 leading-snug">
                    {service.title}
                  </h3>
                  <p className="mt-1 font-sans text-base text-white/65 font-light leading-relaxed">
                    {service.description}
                  </p>
                </li>
              ))}
            </ul>
            <a
              href="#contato"
              onClick={(e) => handleJourneyCta(e, journey)}
              className="mt-8 inline-flex items-center gap-3 text-sm font-sans tracking-[0.15em] text-[#7CE577] uppercase font-medium self-start min-h-[44px]"
            >
              <span>{journey.cta}</span>
              <span className="w-5 h-[1px] bg-[#7CE577]" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export { ServicesSection };
