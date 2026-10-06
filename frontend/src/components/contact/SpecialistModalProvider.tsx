'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import SpecialistModal from './SpecialistModal';
import type { ContactSubject } from '@/lib/specialistContact';

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

  const openSpecialistModal = useCallback((opts: OpenSpecialistModalOptions = {}) => {
    setOptions(opts);
    setSession((s) => s + 1);
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
      <SpecialistModal
        key={session}
        isOpen={isOpen}
        onClose={closeSpecialistModal}
        initialSubject={options.subject}
        initialMessage={options.message}
        origin={options.origin}
      />
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
