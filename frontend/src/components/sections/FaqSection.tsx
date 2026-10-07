'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { useSpecialistModal } from '@/components/contact/SpecialistModalProvider';

interface FaqItem {
  question: string;
  answer: string;
}

// Perguntas na ordem em que costumam surgir na primeira conversa.
// As respostas são texto puro: alimentam também o JSON-LD FAQPage.
const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Vou precisar ir a uma agência do INSS?',
    answer:
      'Na grande maioria dos casos, não. Requerimentos, recursos e acompanhamento são feitos pelos canais digitais do INSS. A presença física só é necessária em situações específicas, como perícia médica ou avaliação social, e nesses casos orientamos você antes, passo a passo.',
  },
  {
    question: 'Preciso passar a minha senha do gov.br?',
    answer:
      'Não é necessário compartilhar a sua senha. Orientamos você a baixar o extrato do CNIS em poucos minutos ou atuamos por procuração formal. Todo documento recebido fica sob sigilo profissional da advocacia e é tratado conforme a LGPD: usado apenas no seu caso e nunca compartilhado com terceiros.',
  },
  {
    question: 'Quanto tempo leva a auditoria do meu CNIS?',
    answer:
      'Depende do número de vínculos e da documentação disponível. Na primeira conversa avaliamos o seu histórico e informamos o prazo por escrito, antes de qualquer contratação.',
  },
  {
    question: 'Qual a diferença entre a Previare e um advogado generalista?',
    answer:
      'Atuamos exclusivamente em Direito Previdenciário. Antes de qualquer pedido, auditamos cada linha do seu CNIS e calculamos todas as regras de aposentadoria aplicáveis ao seu caso, lado a lado. Você recebe um relatório comparativo e decide com números, não com suposições.',
  },
  {
    question: 'Já sou aposentado. Ainda vale a pena uma análise?',
    answer:
      'Pode valer. Benefícios concedidos podem ser revistos, em regra, em até 10 anos contados do primeiro pagamento. Erros comuns são períodos ignorados, tempo especial não reconhecido e salários fora do cálculo. A análise diz com clareza se há ou não algo a corrigir.',
  },
  {
    question: 'Sou médico, empresário ou servidor e tenho vínculos ao mesmo tempo. Isso complica?',
    answer:
      'Exige mais atenção, e é justamente o tipo de caso em que o planejamento faz mais diferença. Contribuições simultâneas, pró-labore, tempo de serviço público e privado (contagem recíproca) e a escolha do regime mais vantajoso precisam ser calculados em conjunto.',
  },
  {
    question: 'Meus filhos podem participar das reuniões?',
    answer:
      'Sim, e recomendamos. Explicamos cada cenário em linguagem simples para que toda a família entenda a decisão. O atendimento pode ser presencial ou por videochamada.',
  },
  {
    question: 'O resultado do simulador já é o valor que vou receber?',
    answer:
      'Não. O simulador dá uma estimativa a partir dos dados que você informa. O valor real depende da análise do seu histórico completo, e é isso que a auditoria faz.',
  },
  {
    question: 'Como funcionam os honorários?',
    answer:
      'Tudo é combinado antes, em contrato escrito, com escopo e valores claros. Você sabe exatamente o que está contratando antes de começar.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: { '@type': 'Answer', text: item.answer },
  })),
};

export default function FaqSection() {
  const { openSpecialistModal } = useSpecialistModal();

  return (
    <section
      id="duvidas"
      aria-labelledby="duvidas-title"
      data-theme="light"
      className="relative w-full bg-paper text-[#0B1A0F] scroll-mt-20"
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Transição de entrada: dissolve o fundo escuro dos Diferenciais no papel claro */}
      <div
        className="absolute inset-x-0 top-0 h-40 sm:h-56 bg-gradient-to-b from-ink-deep via-ink-deep/40 to-transparent pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-[1500px] mx-auto px-4 sm:px-12 lg:px-20 pt-44 sm:pt-60 pb-28 sm:pb-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20">
          {/* Coluna editorial fixa durante a leitura (sticky, sem scroll-jacking) */}
          <header className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <span className="block text-xs font-sans tracking-[0.3em] text-[#2F7335] uppercase font-semibold mb-5">
                Antes de decidir
              </span>
              <h2
                id="duvidas-title"
                className="font-serif text-[2.6rem] sm:text-6xl lg:text-[4.25rem] font-light leading-[1] tracking-tight text-balance"
              >
                As perguntas que todo mundo faz, respondidas sem rodeios.
              </h2>
              <p className="mt-8 max-w-md border-l-2 border-[#2F7335]/35 pl-5 font-sans text-lg sm:text-xl text-[#1F3325]/90 font-light leading-snug">
                Se a sua dúvida não estiver aqui, ela é exatamente o tipo de conversa que temos na primeira reunião.
              </p>
            </div>
          </header>

          {/* Acordeões nativos: acessíveis por teclado, funcionam sem JavaScript e são indexáveis */}
          <div className="lg:col-span-7">
            <ul className="border-t border-[#2F7335]/25">
              {FAQ_ITEMS.map((item) => (
                <li key={item.question} className="border-b border-[#2F7335]/25">
                  <details className="faq-item group">
                    <summary className="flex min-h-[56px] cursor-pointer list-none items-start justify-between gap-6 py-6 sm:py-7 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7335]/50 focus-visible:ring-offset-4 focus-visible:ring-offset-paper [&::-webkit-details-marker]:hidden">
                      <h3 className="font-serif text-[1.375rem] sm:text-[1.625rem] font-light leading-snug text-[#0B1A0F]">
                        {item.question}
                      </h3>
                      <span
                        aria-hidden="true"
                        className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#2F7335]/40 text-[#2F7335] transition-[transform,background-color,color] duration-300 ease-out group-open:rotate-45 group-open:bg-[#2F7335] group-open:text-white motion-reduce:transition-none"
                      >
                        <Plus className="h-4 w-4" strokeWidth={2} />
                      </span>
                    </summary>
                    <p className="faq-answer pb-7 pr-2 sm:pr-16 font-sans text-lg leading-relaxed text-[#1F3325]">
                      {item.answer}
                    </p>
                  </details>
                </li>
              ))}
            </ul>

            {/* Fechamento: dúvida específica vira conversa */}
            <div className="mt-14 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-8">
              <p className="font-serif text-2xl sm:text-3xl font-light leading-snug">
                Ficou alguma dúvida específica do seu caso?
              </p>
              <a
                href="#contato"
                onClick={(e) => {
                  e.preventDefault();
                  openSpecialistModal({ origin: 'FAQ · Dúvida específica' });
                }}
                className="inline-flex min-h-[56px] w-fit shrink-0 items-center gap-3 rounded-full bg-[#0E7C5A] px-7 font-sans text-base font-semibold text-white shadow-md transition-colors hover:bg-[#0B6549] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0E7C5A] focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
              >
                Falar com um especialista
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export { FaqSection };
