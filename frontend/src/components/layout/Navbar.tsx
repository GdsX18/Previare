'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MenuDrawer from './MenuDrawer';
import SpecialistButton from '@/components/ui/SpecialistButton';
import { scrollToSection } from '@/lib/smoothScroll';
import { useSpecialistModal } from '@/components/contact/SpecialistModalProvider';

const NAV_LINKS = [
  { label: 'Sobre a Marca', href: '#sobre' },
  { label: 'Soluções Técnicas', href: '#servicos' },
  { label: 'Simulador Atuarial', href: '#simulador' },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Próximo Passo', href: '#proximo-passo' },
];

export function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const lastScrollY = useRef(0);
  const isNavigating = useRef(false);
  const { openSpecialistModal } = useSpecialistModal();

  useEffect(() => {
    const handleScroll = () => {
      // Se estiver no meio de um scroll programático iniciado por clique, mantém a barra visível
      if (isNavigating.current) return;

      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 40);

      if (currentScrollY <= 80) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current + 12 && currentScrollY > 120) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 6) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    isNavigating.current = true;
    setIsVisible(true);

    scrollToSection(href, {
      offset: 85,
      onComplete: () => {
        setTimeout(() => {
          isNavigating.current = false;
          lastScrollY.current = window.scrollY;
        }, 200);
      },
    });
  };

  return (
    <>
      {/* Forçar tipografia limpa, moderna e neutra (sem caracteres cortados ou decorativos) */}
      <style jsx global>{`
        .navbar-clean-root,
        .navbar-clean-root * {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
            Roboto, Helvetica, Arial, sans-serif !important;
        }
      `}</style>

      {/* Gatilho invisível no topo para hover do mouse (24px) */}
      <div
        className="fixed top-0 left-0 w-full h-6 z-40 pointer-events-auto"
        onMouseEnter={() => setIsVisible(true)}
      />

      <motion.header
        initial={{ y: 0, opacity: 1 }}
        animate={{
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1.0] }}
        className={`navbar-clean-root fixed top-0 left-0 w-full z-50 tracking-normal transition-colors duration-300 pointer-events-auto ${
          isScrolled
            ? 'bg-[#03120E]/80 backdrop-blur-md border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.3)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16 h-20 sm:h-24 flex items-center justify-between">
          {/* Lado Esquerdo: Logomarca Completa Oficial Ampliada e Alinhada */}
          <a
            className="flex items-center group shrink-0 cursor-pointer"
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            aria-label="Previare - Início"
          >
            <Image
              alt="Previare - Previdência, Planejamento e Proximidade"
              className="h-10 sm:h-11 md:h-12 lg:h-[3.25rem] w-auto object-contain transition-opacity duration-200 group-hover:opacity-90"
              height={52}
              priority
              src="/images/logos/previare - LOGOaa.png"
              width={220}
            />
          </a>

          {/* Centro: Links Centrais Desktop com Hitbox Ampla e Ação Imediata */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-6">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="whitespace-nowrap text-sm font-medium text-white/75 hover:text-white transition-colors py-2.5 px-2.5 rounded-md hover:bg-white/[0.05] cursor-pointer select-none"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Lado Direito Desktop: Botão de Ação */}
          <div className="hidden lg:flex items-center">
            <SpecialistButton
              href="#contato"
              onClick={(e) => {
                e.preventDefault();
                openSpecialistModal({ origin: 'Navbar · Falar com Especialista' });
              }}
            />
          </div>

          {/* Lado Direito Mobile / Tablet: Gatilho MENU Limpo e Transparente */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white tracking-widest uppercase py-2.5 px-3 rounded-md cursor-pointer focus:outline-none"
              aria-label="Abrir Menu"
            >
              <span>MENU</span>
              <span className="text-[#7CE577] text-base leading-none font-bold">::</span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Menu Drawer Lateral para Mobile e Tablet */}
      <MenuDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}

export default Navbar;
