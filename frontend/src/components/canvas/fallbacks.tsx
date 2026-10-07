import React from 'react';

/**
 * Bases estáticas em CSS pintadas já no HTML do servidor (sem JavaScript),
 * enquanto o chunk WebGL é carregado sob demanda. O canvas assume em seguida
 * com um fade suave por cima da mesma base.
 */

export const SILK_FALLBACK_BACKGROUND =
  'radial-gradient(ellipse 85% 65% at 72% 38%, rgba(15,110,40,0.32) 0%, transparent 70%),' +
  'radial-gradient(ellipse 75% 60% at 18% 82%, rgba(9,82,56,0.38) 0%, transparent 72%),' +
  '#03120E';

export const SILK_WRAPPER_CLASS =
  'fixed top-0 left-0 -z-10 w-full h-[100lvh] pointer-events-none';

export const LIQUID_METAL_FALLBACK_BACKGROUND = '#231A10';

export const LIQUID_METAL_WRAPPER_CLASS = 'absolute inset-0 pointer-events-none -z-0';

/** Viewport "grande" e estável: não muda quando a barra de URL do mobile recolhe. */
export const STICKY_VIEWPORT_CLASS = 'sticky top-0 w-full h-[100lvh]';

export function SilkFallback() {
  return (
    <div
      className={SILK_WRAPPER_CLASS}
      style={{ background: SILK_FALLBACK_BACKGROUND }}
      aria-hidden="true"
    />
  );
}

export function LiquidMetalFallback() {
  return (
    <div
      className={LIQUID_METAL_WRAPPER_CLASS}
      style={{ background: LIQUID_METAL_FALLBACK_BACKGROUND }}
      aria-hidden="true"
    />
  );
}
