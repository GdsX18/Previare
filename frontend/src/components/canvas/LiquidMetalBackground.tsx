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
import {
  LIQUID_METAL_FALLBACK_BACKGROUND,
  LIQUID_METAL_WRAPPER_CLASS,
  STICKY_VIEWPORT_CLASS,
} from './fallbacks';

/**
 * Fundo WebGL "Liquid Metal" da seção Diferenciais.
 *
 * Arquitetura de "janela deslizante": a seção tem milhares de pixels de
 * altura, e um canvas do seu tamanho executaria o fragment shader (com fbm)
 * em toda essa área a cada frame — inclusive fora da tela. Aqui o canvas tem
 * apenas o tamanho da viewport e fica `sticky` dentro da seção; o shader
 * recebe `u_fragOffset` para continuar calculando cada pixel nas coordenadas
 * da seção inteira. O resultado na tela é idêntico, com custo de GPU limitado
 * a uma viewport. O shader roda num Web Worker (OffscreenCanvas).
 */
export default function LiquidMetalBackground() {
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
    let cancelIdle: (() => void) | null = null;

    const init = () => {
      // ── Geometria cacheada: atualizada apenas por observers/eventos, nunca
      // lida de forma síncrona dentro do loop de renderização
      let sectionDocLeft = 0;
      let sectionDocTop = 0;
      let sectionWidth = 1;
      let sectionHeight = 1;
      let scrollX = window.scrollX;
      let scrollY = window.scrollY;

      const readSection = () => {
        const rect = wrapper.getBoundingClientRect();
        scrollX = window.scrollX;
        scrollY = window.scrollY;
        sectionDocLeft = rect.left + scrollX;
        sectionDocTop = rect.top + scrollY;
        sectionWidth = Math.max(1, rect.width);
        sectionHeight = Math.max(1, rect.height);
      };

      // Medição inicial única (fora de qualquer loop)
      readSection();

      const { host, release } = acquireShaderHost(canvas, {
        kind: 'liquidMetal',
        // DPR travado: 1.0 no mobile e 1.5 no desktop
        dpr: getRenderDpr(),
        mode,
        state: createShaderState({
          canvasWidth: canvas.clientWidth,
          canvasHeight: canvas.clientHeight,
          sectionTop: sectionDocTop,
          sectionWidth,
          sectionHeight,
          scrollY,
        }),
        onReady: () => setIsReady(true),
        onWorkerUnsupported: () => setMode('main'),
      });

      // Tamanho do canvas sticky (100lvh): entregue pelo ResizeObserver
      const canvasObserver = new ResizeObserver((entries) => {
        const box = entries[entries.length - 1]?.contentRect;
        if (box) {
          host.post({ type: 'state', state: { canvasWidth: box.width, canvasHeight: box.height } });
        }
      });
      canvasObserver.observe(canvas);

      // Posição/tamanho da seção mudam quando ela própria redimensiona ou quando
      // algo acima dela altera a altura do documento (pin-spacers, acordeões).
      // Callbacks do ResizeObserver rodam logo após o layout: leitura sem reflow forçado.
      const sectionObserver = new ResizeObserver(() => {
        readSection();
        host.post({
          type: 'state',
          state: { sectionTop: sectionDocTop, sectionWidth, sectionHeight, scrollY },
        });
      });
      sectionObserver.observe(wrapper);
      sectionObserver.observe(document.body);

      const handleScroll = () => {
        scrollX = window.scrollX;
        scrollY = window.scrollY;
        host.post({ type: 'state', state: { scrollY } });
      };

      // Rastreamento de interação do cursor (retângulo da seção derivado da
      // geometria cacheada + scroll atual, sem getBoundingClientRect por evento)
      const handleMouseMove = (e: MouseEvent) => {
        const left = sectionDocLeft - scrollX;
        const top = sectionDocTop - scrollY;
        const inside =
          e.clientX >= left &&
          e.clientX <= left + sectionWidth &&
          e.clientY >= top &&
          e.clientY <= top + sectionHeight;
        host.post({
          type: 'state',
          state: inside
            ? {
                targetPresence: 1.0,
                targetMouseX: ((e.clientX - left) / sectionWidth) * 2.0 - 1.0,
                targetMouseY: 1.0 - ((e.clientY - top) / sectionHeight) * 2.0,
              }
            : { targetPresence: 0.0 },
        });
      };

      const handleMouseLeave = () => {
        host.post({ type: 'state', state: { targetPresence: 0.0 } });
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseleave', handleMouseLeave);

      // Loop só existe com a seção na viewport: fora dela o rAF é cancelado
      const stopVisibility = observeVisibility(wrapper, (visible) =>
        host.post({ type: 'running', running: visible })
      );

      teardown = () => {
        stopVisibility();
        canvasObserver.disconnect();
        sectionObserver.disconnect();
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseleave', handleMouseLeave);
        release();
      };
    };

    // Inicialização após o `load`, num momento ocioso da main thread. Como a
    // compilação do shader (pesada: fbm) ocorre no worker em segundo plano,
    // ela já termina antes de o usuário chegar à seção; o loop de render só
    // roda quando a seção está visível.
    const scheduleInit = () => {
      cancelIdle = runWhenIdle(init, 2000);
    };
    if (document.readyState === 'complete') scheduleInit();
    else window.addEventListener('load', scheduleInit, { once: true });

    return () => {
      window.removeEventListener('load', scheduleInit);
      cancelIdle?.();
      teardown?.();
    };
  }, [mode]);

  return (
    <div
      ref={wrapperRef}
      className={LIQUID_METAL_WRAPPER_CLASS}
      style={{ background: LIQUID_METAL_FALLBACK_BACKGROUND }}
      aria-hidden="true"
    >
      <div className={STICKY_VIEWPORT_CLASS}>
        <canvas
          // Um canvas transferido ao worker não pode voltar à main thread:
          // trocar de modo remonta um elemento novo
          key={mode}
          ref={canvasRef}
          className="block w-full h-full transition-opacity duration-700 ease-out"
          style={{ opacity: isReady ? 1 : 0 }}
        />
      </div>
    </div>
  );
}

export { LiquidMetalBackground };
