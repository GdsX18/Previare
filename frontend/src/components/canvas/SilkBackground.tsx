'use client';

import React, { useEffect, useRef, useState } from 'react';
import { runWhenIdle } from '@/lib/idle';
import { getRenderDpr, observeVisibility } from './glUtils';
import {
  acquireShaderHost,
  createShaderState,
  supportsWorkerRendering,
  type ShaderMode,
} from './shaderHost';
import { SILK_FALLBACK_BACKGROUND, SILK_WRAPPER_CLASS } from './fallbacks';

/**
 * Fundo WebGL "Silk" do Hero. O shader roda num Web Worker (OffscreenCanvas):
 * contexto, compilação e loop de renderização ficam fora da main thread.
 */
export default function SilkBackground() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  // Componente só existe no cliente (next/dynamic com ssr: false)
  const [mode, setMode] = useState<ShaderMode>(() =>
    supportsWorkerRendering() ? 'worker' : 'main'
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    let teardown: (() => void) | null = null;

    // Inicialização só com a main thread ociosa, depois do conteúdo textual
    // (FCP/LCP) já pintado.
    const cancelIdle = runWhenIdle(() => {
      const { host, release } = acquireShaderHost(canvas, {
        kind: 'silk',
        // DPR travado: 1.0 no mobile e 1.5 no desktop
        dpr: getRenderDpr(),
        mode,
        // Medição inicial única; depois o ResizeObserver entrega as dimensões
        state: createShaderState({
          canvasWidth: canvas.clientWidth,
          canvasHeight: canvas.clientHeight,
        }),
        onReady: () => setIsReady(true),
        onWorkerUnsupported: () => setMode('main'),
      });

      // O canvas usa 100lvh: a barra de URL do mobile não dispara realocações
      const resizeObserver = new ResizeObserver((entries) => {
        const box = entries[entries.length - 1]?.contentRect;
        if (box) {
          host.post({ type: 'state', state: { canvasWidth: box.width, canvasHeight: box.height } });
        }
      });
      resizeObserver.observe(canvas);

      // Loop só existe com a seção Hero na viewport: fora dela o rAF é cancelado
      const stopVisibility = observeVisibility(wrapper.parentElement ?? wrapper, (visible) =>
        host.post({ type: 'running', running: visible })
      );

      teardown = () => {
        stopVisibility();
        resizeObserver.disconnect();
        release();
      };
    });

    return () => {
      cancelIdle();
      teardown?.();
    };
  }, [mode]);

  return (
    <div
      ref={wrapperRef}
      className={SILK_WRAPPER_CLASS}
      style={{ background: SILK_FALLBACK_BACKGROUND }}
      aria-hidden="true"
    >
      <canvas
        // Um canvas transferido ao worker não pode voltar à main thread:
        // trocar de modo remonta um elemento novo
        key={mode}
        ref={canvasRef}
        className="block w-full h-full transition-opacity duration-700 ease-out"
        style={{ opacity: isReady ? 1 : 0 }}
      />
    </div>
  );
}

export { SilkBackground };
