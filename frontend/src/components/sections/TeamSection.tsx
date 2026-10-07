import React from 'react';
import Image from 'next/image';
import { SITE_CONFIG, TEAM } from '@/lib/siteConfig';

/**
 * "Quem conduz o seu caso": dá rosto e registro profissional ao diferencial
 * "O Especialista Próximo". Só é exibida quando TEAM (lib/siteConfig.ts) tiver
 * profissionais reais cadastrados — nunca com dados fictícios.
 */
export default function TeamSection() {
  if (TEAM.length === 0) return null;

  const legalLine = [SITE_CONFIG.legalName, SITE_CONFIG.oabRegistration, SITE_CONFIG.cnpj && `CNPJ ${SITE_CONFIG.cnpj}`]
    .filter(Boolean)
    .join(' · ');

  return (
    <section
      id="banca"
      aria-labelledby="banca-title"
      className="relative w-full bg-ink-deep text-white pt-28 sm:pt-36 pb-32 sm:pb-44"
    >
      <div className="w-full max-w-[1500px] mx-auto px-4 sm:px-12 lg:px-20">
        <header className="max-w-4xl mb-16 sm:mb-24">
          <span className="block text-xs font-sans tracking-[0.3em] uppercase text-[#7CE577] font-semibold mb-5">
            Banca técnica
          </span>
          <h2
            id="banca-title"
            className="font-serif text-[2.6rem] sm:text-6xl lg:text-[4.75rem] font-light leading-[0.98] tracking-tight"
          >
            Quem conduz o seu caso.
          </h2>
          <p className="mt-8 max-w-2xl font-sans text-lg sm:text-xl text-white/75 font-light leading-relaxed">
            Do primeiro contato ao relatório final, o seu histórico é analisado por advogados com registro ativo na
            OAB e dedicação exclusiva ao Direito Previdenciário.
          </p>
        </header>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14 border-t border-white/[0.12] pt-14">
          {TEAM.map((member) => (
            <li key={member.oab} className="flex flex-col">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-sm bg-white/[0.04]">
                <Image
                  src={member.photo}
                  alt={`Retrato de ${member.name}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover grayscale contrast-[1.05]"
                />
              </div>
              <h3 className="mt-6 font-serif text-2xl sm:text-[1.75rem] font-light leading-tight">{member.name}</h3>
              <p className="mt-1 font-sans text-sm tracking-[0.2em] uppercase text-[#7CE577]">{member.oab}</p>
              <p className="mt-4 font-sans text-base text-white/85">{member.role}</p>
              <p className="mt-1 font-sans text-base text-white/65 leading-relaxed">{member.education}</p>
              <p className="mt-4 border-l border-[#7CE577]/40 pl-4 font-sans text-base text-white/80 leading-relaxed">
                {member.focus}
              </p>
            </li>
          ))}
        </ul>

        {legalLine && (
          <p className="mt-16 pt-8 border-t border-white/[0.12] font-sans text-sm text-white/55">{legalLine}</p>
        )}
      </div>
    </section>
  );
}

export { TeamSection };
