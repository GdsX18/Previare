'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface SpecialistButtonProps {
  href?: string;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const SPRING = { type: 'spring', stiffness: 400, damping: 25 } as const;

export default function SpecialistButton({
  href = '#contato',
  className = '',
  onClick,
}: SpecialistButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className={`group relative inline-flex items-center gap-3 px-5 py-2.5 rounded-full overflow-hidden select-none cursor-pointer border border-[#7CE577]/30 hover:border-[#7CE577]/60 bg-gradient-to-r from-[#0E3D28]/80 via-[#134E34]/80 to-[#0E3D28]/80 backdrop-blur-md shadow-[0_4px_20px_rgba(14,124,90,0.18)] hover:shadow-[0_6px_30px_rgba(124,229,119,0.25)] transition-[border-color,box-shadow] duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7CE577]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#03120E] ${className}`}
    >
      {/* Feixe de luz acetinado (shimmer sweep): varre no hover, volta instantaneamente ao sair */}
      <motion.span
        aria-hidden
        initial={{ x: '-100%' }}
        animate={{ x: isHovered ? '100%' : '-100%' }}
        transition={isHovered ? { duration: 0.8, ease: 'easeInOut' } : { duration: 0 }}
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
      />

      {/* Indicador de status "Especialista disponível" */}
      <span aria-hidden className="relative flex h-2 w-2 shrink-0 items-center justify-center">
        <span className="absolute inline-flex h-1.5 w-1.5 rounded-full bg-[#7CE577]/40 animate-ping motion-reduce:animate-none" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#7CE577]" />
      </span>

      {/* Texto: recuo elegante de 2px no hover */}
      <motion.span
        initial={false}
        animate={{ x: isHovered ? -2 : 0 }}
        transition={SPRING}
        className="relative z-10 text-xs font-sans font-medium tracking-[0.15em] uppercase whitespace-nowrap text-white/95 group-hover:text-white transition-colors"
      >
        Falar com Especialista
      </motion.span>

      {/* Seta: recolhida em escala zero no repouso, revela-se em diagonal no hover */}
      <motion.span
        aria-hidden
        initial={false}
        animate={{
          width: isHovered ? 20 : 0,
          marginLeft: isHovered ? 0 : -12,
          scale: isHovered ? 1 : 0,
          opacity: isHovered ? 1 : 0,
        }}
        transition={SPRING}
        className="relative z-10 h-5 -mr-1 shrink-0 rounded-full bg-[#7CE577] flex items-center justify-center"
      >
        <motion.span
          initial={false}
          animate={{ x: isHovered ? 0 : -4, y: isHovered ? 0 : 4 }}
          transition={SPRING}
          className="flex"
        >
          <ArrowUpRight className="w-3 h-3 text-[#020B06]" strokeWidth={2.5} />
        </motion.span>
      </motion.span>
    </Link>
  );
}
