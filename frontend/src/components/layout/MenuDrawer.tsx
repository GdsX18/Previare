"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import { scrollToSection } from "@/lib/smoothScroll";

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_LINKS = [
  { label: "HOME", href: "/" },
  { label: "SOBRE", href: "#sobre" },
  { label: "SOLUÇÕES", href: "#servicos" },
  { label: "SIMULADOR", href: "#simulador" },
  { label: "DIFERENCIAIS", href: "#diferenciais" },
  { label: "PRÓXIMO PASSO", href: "#proximo-passo" },
  { label: "CONTATO", href: "#contato" },
];

export function MenuDrawer({ isOpen, onClose }: MenuDrawerProps) {
  // Lock body scroll and handle Escape key
  // Só toca no body enquanto aberto, para não desfazer o bloqueio de outro overlay (ex.: modal de atendimento)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop semi-transparente para fechar com clique fora */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md"
          />

          {/* Gaveta do Menu Deslizante com Blur Estilo IWC */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu Principal"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-[70] h-full w-full sm:w-[480px] md:w-[540px] bg-[#03120E]/95 backdrop-blur-2xl border-l border-white/10 p-10 sm:p-12 md:p-16 flex flex-col justify-between shadow-2xl overflow-y-auto"
          >
            {/* Topo da Gaveta: Botão de Fechar */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.25em] uppercase text-white/50 font-sans font-light">
                NAVEGAÇÃO PREVIARE
              </span>
              <button
                type="button"
                onClick={onClose}
                className="group flex items-center gap-2 text-white/90 hover:text-white uppercase text-xs tracking-[0.2em] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 py-1 px-2 rounded-sm"
                aria-label="Fechar Menu"
              >
                <span>MENU</span>
                <X className="w-4 h-4 text-white/80 group-hover:text-white transition-transform group-hover:rotate-90 duration-300" />
              </button>
            </div>

            {/* Links Principais: Tipografia Serif Monumental */}
            <nav className="my-auto py-12 flex flex-col space-y-6 md:space-y-8" aria-label="Links do Menu">
              {MENU_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    setTimeout(() => {
                      scrollToSection(link.href, { offset: 85 });
                    }, 120);
                  }}
                  className="group flex items-center justify-between text-4xl sm:text-5xl md:text-6xl font-serif font-light text-white/90 hover:text-white hover:translate-x-2 transition-all cursor-pointer tracking-tight"
                >
                  <span>{link.label}</span>
                  <ArrowUpRight className="w-6 h-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#7CE577]" />
                </a>
              ))}
            </nav>

            {/* Rodapé da Gaveta: Links Institucionais Minimalistas */}
            <div className="pt-8 border-t border-white/10 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-sans tracking-wider text-white/60">
                <a
                  href="#contato"
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    setTimeout(() => {
                      scrollToSection('#contato', { offset: 85 });
                    }, 120);
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  ÁREA DO CLIENTE
                </a>
                <a
                  href="#contato"
                  onClick={(e) => {
                    e.preventDefault();
                    onClose();
                    setTimeout(() => {
                      scrollToSection('#contato', { offset: 85 });
                    }, 120);
                  }}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  PORTAL DE ATENDIMENTO
                </a>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] tracking-widest text-white/40 uppercase">
                <span>© {new Date().getFullYear()} PREVIARE</span>
                <span>DIRETRIZES TÉCNICAS OAB</span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default MenuDrawer;
