'use client';

import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useSpecialistModal } from '@/components/contact/SpecialistModalProvider';
import { cn } from '@/lib/utils';

/**
 * Atalho discreto e persistente para o atendimento: aparece depois do Hero e
 * se recolhe quando o formulário do rodapé (#contato) entra na tela.
 */
export default function FloatingContactPill() {
  const { openSpecialistModal } = useSpecialistModal();
  const [pastHero, setPastHero] = useState(false);
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    const handleScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.85);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    const footer = document.getElementById('contato');
    const observer = footer
      ? new IntersectionObserver(([entry]) => setFooterInView(entry.isIntersecting), { threshold: 0.05 })
      : null;
    if (footer && observer) observer.observe(footer);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer?.disconnect();
    };
  }, []);

  const isVisible = pastHero && !footerInView;

  return (
    <a
      href="#contato"
      onClick={(e) => {
        e.preventDefault();
        openSpecialistModal({ origin: 'Atalho flutuante · Falar com especialista' });
      }}
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={cn(
        'fixed bottom-5 right-4 sm:bottom-8 sm:right-8 z-40 inline-flex min-h-[56px] items-center gap-3 rounded-full',
        'border border-[#7CE577]/35 bg-ink-forest/85 backdrop-blur-md pl-5 pr-6 text-white',
        'shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition-[opacity,transform,border-color] duration-500 ease-out',
        'hover:border-[#7CE577]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7CE577]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-deep',
        'motion-reduce:transition-none',
        isVisible ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-4'
      )}
    >
      <MessageCircle className="h-5 w-5 text-[#7CE577]" strokeWidth={2} aria-hidden="true" />
      <span className="font-sans text-base font-medium">Falar com especialista</span>
    </a>
  );
}

export { FloatingContactPill };
