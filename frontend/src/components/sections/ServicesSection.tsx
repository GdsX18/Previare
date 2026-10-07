'use client';

import React, { useRef, useEffect } from 'react';
import { deferScrollSetup, willChangeWhileActive } from '@/lib/gsap';
import { useSpecialistModal } from '@/components/contact/SpecialistModalProvider';
import type { ContactSubject } from '@/lib/specialistContact';

const SERVICES_ALL = [
  {
    category: 'CONCESSÃO E REGRAS',
    title: 'APOSENTADORIAS : ESTRATÉGIA PARA O BENEFÍCIO MÁXIMO',
    description:
      'Planejamento e condução integral de aposentadorias por idade, tempo de contribuição e regras de transição pós-Reforma, assegurando a regra mais vantajosa.',
  },
  {
    category: 'ESTRATÉGIA ATUARIAL',
    title: 'PLANEJAMENTO PREVIDENCIÁRIO : DECISÃO BASEADA EM DADOS',
    description:
      'Estudo atuarial personalizado que analisa histórico, projeções financeiras e retorno sobre investimento contributivo para evitar perdas prematuras.',
  },
  {
    category: 'AUDITORIA DE DADOS',
    title: 'ANÁLISE DE CNIS : AUDITORIA MINUCIOSA DE REGISTROS',
    description:
      'Inspeção aprofundada do extrato previdenciário para identificar vínculos faltantes, remunerações inconsistentes e períodos extemporâneos antes do protocolo.',
  },
  {
    category: 'PROJEÇÕES MATEMÁTICAS',
    title: 'SIMULAÇÕES PREVIDENCIÁRIAS : CENÁRIOS COMPARATIVOS',
    description:
      'Cálculo analítico de todos os cenários legais possíveis para determinar com exatidão matemática o momento ideal de requerer seu direito.',
  },
  {
    category: 'REGULARIZAÇÃO',
    title: 'ACERTOS PREVIDENCIÁRIOS : ELIMINAÇÃO DE PENDÊNCIAS',
    description:
      'Tratamento técnico de indicadores restritivos como PREM-EXT, vínculos sem data de término e contribuições abaixo do piso constitucional.',
  },
  {
    category: 'REVISÃO DE RENDA',
    title: 'REVISÕES DE BENEFÍCIOS : RESGATE DO VALOR LEGÍTIMO',
    description:
      'Auditoria de benefícios ativos para identificar equívocos no cálculo inicial, períodos ignorados pelo INSS e teses jurídicas de majoração.',
  },
  {
    category: 'AMPARO SOCIAL',
    title: 'BPC / LOAS : GARANTIA DO AMPARO CONSTITUCIONAL',
    description:
      'Estruturação probatória completa para concessão do benefício assistencial a idosos e pessoas com deficiência em situação de vulnerabilidade.',
  },
  {
    category: 'PROTEÇÃO À SAÚDE',
    title: 'BENEFÍCIOS POR INCAPACIDADE : APOIO EM MOMENTOS CRÍTICOS',
    description:
      'Acompanhamento documental e pericial para auxílio por incapacidade temporária e aposentadoria por incapacidade permanente.',
  },
  {
    category: 'INDENIZAÇÃO LABORAL',
    title: 'AUXÍLIO-ACIDENTE : COMPENSAÇÃO POR SEQUELA PERMANENTE',
    description:
      'Requerimento do benefício de natureza indenizatória pago ao trabalhador que sofreu redução de capacidade laboral após acidente, cumulável com salário.',
  },
  {
    category: 'SEGURANÇA FAMILIAR',
    title: 'PENSÃO POR MORTE : PROTEÇÃO PARA QUEM VOCÊ AMA',
    description:
      'Orientação ágil e precisa para dependentes previdenciários, assegurando o correto enquadramento de duração e cota familiar justa.',
  },
  {
    category: 'CONSULTORIA PESSOAL',
    title: 'CONSULTORIA PREVIDENCIÁRIA : ORIENTAÇÃO INDIVIDUALIZADA',
    description:
      'Atendimento consultivo e didático para quem busca clareza sobre trajetória contributiva, mudanças de carreira e impactos no futuro.',
  },
  {
    category: 'GESTÃO ADMINISTRATIVA',
    title: 'SERVIÇOS ADMINISTRATIVOS : DESBUROCRATIZAÇÃO NO INSS',
    description:
      'Cumprimento de exigências, emissão de Certidão de Tempo de Contribuição (CTC), recursos à Junta e cópias de processos integrais.',
  },
  {
    category: 'DOSSIÊ PROBATÓRIO',
    title: 'ORIENTAÇÃO DOCUMENTAL : QUALIFICAÇÃO DE PROVAS',
    description:
      'Análise rigorosa de carteiras profissionais, laudos PPP/LTCAT para tempo especial e documentação de atividade rural ou autônoma.',
  },
  {
    category: 'COOPERAÇÃO TÉCNICA',
    title: 'PARCERIAS ESPECIALIZADAS : SUPORTE ATUARIAL ESTRATÉGICO',
    description:
      'Apoio técnico de alta complexidade para escritórios de advocacia e empresas, com cálculos atuariais e pareceres fundamentados.',
  },
];

// Assunto pré-selecionado no modal de atendimento conforme a categoria do serviço
const SUBJECT_BY_CATEGORY: Record<string, ContactSubject> = {
  'CONCESSÃO E REGRAS': 'Planejamento Previdenciário',
  'ESTRATÉGIA ATUARIAL': 'Planejamento Previdenciário',
  'PROJEÇÕES MATEMÁTICAS': 'Planejamento Previdenciário',
  'CONSULTORIA PESSOAL': 'Planejamento Previdenciário',
  'AUDITORIA DE DADOS': 'Auditoria de CNIS e Vínculos',
  'REGULARIZAÇÃO': 'Auditoria de CNIS e Vínculos',
  'DOSSIÊ PROBATÓRIO': 'Tempo Especial & Insalubridade (PPP)',
  'REVISÃO DE RENDA': 'Revisão de Aposentadoria Concedida',
  'AMPARO SOCIAL': 'Benefício por Incapacidade ou BPC / LOAS',
  'PROTEÇÃO À SAÚDE': 'Benefício por Incapacidade ou BPC / LOAS',
};

export default function ServicesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { openSpecialistModal } = useSpecialistModal();

  const handleServiceCta = (e: React.MouseEvent<HTMLAnchorElement>, item: (typeof SERVICES_ALL)[number]) => {
    e.preventDefault();
    openSpecialistModal({
      subject: SUBJECT_BY_CATEGORY[item.category] ?? 'Outro Assunto Previdenciário',
      origin: `Serviços · ${item.title.split(':')[0].trim()}`,
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

      {/* ─── DESKTOP: Trilho horizontal com GSAP ScrollTrigger ─── */}
      <div className="hidden lg:block h-screen">
        <div className="flex w-max h-full z-10 relative">
          {SERVICES_ALL.map((item, index) => (
            <div
              key={index}
              className="service-clean-slide w-screen h-full flex flex-col justify-between px-28 pt-44 pb-20 relative shrink-0"
            >
              <div>
                <span className="text-xs font-sans tracking-[0.25em] text-white/40 uppercase">
                  {item.category}
                </span>
              </div>

              <div className="max-w-5xl my-auto">
                <h2
                  className="font-serif font-light text-white/95 uppercase leading-[0.98] tracking-tight"
                  style={{ fontSize: 'clamp(2.5rem, 5vw, 5.5rem)' }}
                >
                  {item.title}
                </h2>
              </div>

              <div className="flex justify-end pb-8">
                <div className="max-w-lg text-right flex flex-col items-end">
                  <p className="font-sans text-base text-white/75 font-light leading-relaxed">
                    {item.description}
                  </p>
                  <a
                    href="#contato"
                    onClick={(e) => handleServiceCta(e, item)}
                    className="group mt-6 inline-flex items-center gap-3 text-sm font-sans tracking-[0.25em] text-[#7CE577] uppercase font-medium hover:text-white transition-colors duration-300"
                  >
                    <span>Falar sobre este serviço</span>
                    <span className="w-6 h-[1px] bg-[#7CE577] group-hover:w-10 group-hover:bg-white transition-all duration-300" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MOBILE + TABLET: Lista vertical nativa ─── */}
      <div className="lg:hidden flex flex-col pt-36 pb-16">
        {SERVICES_ALL.map((item, index) => (
          <div
            key={index}
            className="flex flex-col px-6 sm:px-14 py-10 sm:py-14 border-b border-white/[0.07] last:border-b-0"
          >
            <span className="text-xs font-sans tracking-[0.25em] text-white/40 uppercase mb-4 block">
              {item.category}
            </span>
            <h2
              className="font-serif font-light text-white/95 uppercase leading-[1.05] tracking-tight mb-5"
              style={{ fontSize: 'clamp(1.6rem, 6.5vw, 3rem)' }}
            >
              {item.title}
            </h2>
            <p className="font-sans text-sm sm:text-base text-white/70 font-light leading-relaxed mb-6">
              {item.description}
            </p>
            <a
              href="#contato"
              onClick={(e) => handleServiceCta(e, item)}
              className="inline-flex items-center gap-3 text-xs font-sans tracking-[0.25em] text-[#7CE577] uppercase font-medium self-start min-h-[44px]"
            >
              <span>Falar sobre este serviço</span>
              <span className="w-5 h-[1px] bg-[#7CE577]" />
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}

export { ServicesSection };
