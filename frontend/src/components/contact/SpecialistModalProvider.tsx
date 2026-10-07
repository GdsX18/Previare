'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ContactSubject } from '@/lib/specialistContact';

// O modal (formulário, validações, animações) fica fora do bundle inicial:
// o chunk é baixado na intenção de uso (hover/foco/toque num CTA) ou no clique.
const loadSpecialistModal = () => import('./SpecialistModal');
const SpecialistModal = dynamic(loadSpecialistModal, { ssr: false });

const CTA_SELECTOR = 'a[href="#contato"], [data-specialist-cta]';

export interface OpenSpecialistModalOptions {
  /** Assunto pré-selecionado (ex.: CTA de um serviço específico). */
  subject?: ContactSubject;
  /** Texto inicial para a síntese do caso (ex.: resumo do simulador). */
  message?: string;
  /** Identifica o CTA de origem no e-mail enviado aos advogados. */
  origin?: string;
}

interface SpecialistModalContextValue {
  openSpecialistModal: (options?: OpenSpecialistModalOptions) => void;
  closeSpecialistModal: () => void;
}

const SpecialistModalContext = createContext<SpecialistModalContextValue | null>(null);

export function SpecialistModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<OpenSpecialistModalOptions>({});
  // Nova chave a cada abertura: o formulário sempre inicia limpo com as opções recebidas.
  const [session, setSession] = useState(0);
  // O modal só é montado (e seu chunk carregado) após a primeira abertura
  const [hasOpened, setHasOpened] = useState(false);

  // Pré-carrega o chunk do modal quando o usuário demonstra intenção num CTA
  useEffect(() => {
    const handleIntent = (e: Event) => {
      if (!(e.target instanceof Element) || !e.target.closest(CTA_SELECTOR)) return;
      void loadSpecialistModal();
      removeListeners();
    };
    const events = ['pointerover', 'focusin', 'touchstart'] as const;
    const removeListeners = () =>
      events.forEach((type) => document.removeEventListener(type, handleIntent));
    events.forEach((type) => document.addEventListener(type, handleIntent, { passive: true }));
    return removeListeners;
  }, []);

  const openSpecialistModal = useCallback((opts: OpenSpecialistModalOptions = {}) => {
    setOptions(opts);
    setSession((s) => s + 1);
    setHasOpened(true);
    setIsOpen(true);
  }, []);

  const closeSpecialistModal = useCallback(() => setIsOpen(false), []);

  const value = useMemo(
    () => ({ openSpecialistModal, closeSpecialistModal }),
    [openSpecialistModal, closeSpecialistModal]
  );

  return (
    <SpecialistModalContext.Provider value={value}>
      {children}
      {hasOpened && (
        <SpecialistModal
          key={session}
          isOpen={isOpen}
          onClose={closeSpecialistModal}
          initialSubject={options.subject}
          initialMessage={options.message}
          origin={options.origin}
        />
      )}
    </SpecialistModalContext.Provider>
  );
}

export function useSpecialistModal(): SpecialistModalContextValue {
  const ctx = useContext(SpecialistModalContext);
  if (!ctx) {
    throw new Error('useSpecialistModal deve ser usado dentro de <SpecialistModalProvider>.');
  }
  return ctx;
}
