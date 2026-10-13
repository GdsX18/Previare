/**
 * Ponte main thread → renderizador de shader.
 *
 * Preferência: Web Worker + OffscreenCanvas (contexto WebGL, compilação e
 * loop de renderização fora da main thread). Fallback: o mesmo renderizador
 * carregado sob demanda na main thread, quando o navegador não suporta WebGL
 * em OffscreenCanvas.
 */
import type { ShaderKind, ShaderMessage, ShaderRenderer, ShaderState } from './shaderRenderer';

export type ShaderMode = 'worker' | 'main';

export interface ShaderHostOptions {
  kind: ShaderKind;
  dpr: number;
  state: ShaderState;
  mode: ShaderMode;
  onReady: () => void;
  /** O worker não conseguiu criar o contexto: o componente deve remontar o canvas em modo 'main'. */
  onWorkerUnsupported: () => void;
}

export interface ShaderHost {
  post: (message: ShaderMessage) => void;
  dispose: () => void;
}

export function supportsWorkerRendering(): boolean {
  return (
    typeof Worker !== 'undefined' &&
    typeof OffscreenCanvas !== 'undefined' &&
    'transferControlToOffscreen' in HTMLCanvasElement.prototype
  );
}

function createWorkerHost(canvas: HTMLCanvasElement, options: ShaderHostOptions): ShaderHost {
  const worker = new Worker(new URL('./shader.worker', import.meta.url));
  const offscreen = canvas.transferControlToOffscreen();

  worker.onmessage = (event: MessageEvent<{ type: 'ready' | 'unsupported' }>) => {
    if (event.data.type === 'ready') options.onReady();
    else options.onWorkerUnsupported();
  };
  worker.postMessage(
    { type: 'init', canvas: offscreen, kind: options.kind, dpr: options.dpr, state: options.state },
    [offscreen]
  );

  return {
    post: (message) => worker.postMessage(message),
    dispose: () => worker.terminate(),
  };
}

function createMainThreadHost(canvas: HTMLCanvasElement, options: ShaderHostOptions): ShaderHost {
  let renderer: ShaderRenderer | null = null;
  let disposed = false;
  // Mensagens recebidas enquanto o chunk do renderizador carrega
  const pending: ShaderMessage[] = [];

  void import('./shaderRenderer').then(({ createShaderRenderer }) => {
    if (disposed) return;
    renderer = createShaderRenderer(canvas, options.kind, options.dpr, options.state, {
      onReady: options.onReady,
      onUnsupported: () => console.error('WebGL1 não suportado'),
    });
    pending.splice(0).forEach((message) => renderer?.handle(message));
  });

  return {
    post: (message) => {
      if (renderer) renderer.handle(message);
      else pending.push(message);
    },
    dispose: () => {
      disposed = true;
      renderer?.dispose();
    },
  };
}

// Um canvas só pode ser transferido para OffscreenCanvas uma vez. No
// StrictMode (dev) o efeito monta → desmonta → monta de novo no mesmo
// elemento; por isso o descarte é adiado um tick e reaproveitado se o mesmo
// canvas for requisitado de novo nesse intervalo.
const hosts = new WeakMap<HTMLCanvasElement, { host: ShaderHost; disposeTimer: number | null }>();

/** Obtém o host do canvas e retorna a função de liberação. */
export function acquireShaderHost(
  canvas: HTMLCanvasElement,
  options: ShaderHostOptions
): { host: ShaderHost; release: () => void } {
  let entry = hosts.get(canvas);
  if (entry) {
    if (entry.disposeTimer !== null) window.clearTimeout(entry.disposeTimer);
    entry.disposeTimer = null;
  } else {
    const host =
      options.mode === 'worker'
        ? createWorkerHost(canvas, options)
        : createMainThreadHost(canvas, options);
    entry = { host, disposeTimer: null };
    hosts.set(canvas, entry);
  }

  const current = entry;
  return {
    host: current.host,
    release: () => {
      current.disposeTimer = window.setTimeout(() => {
        current.host.dispose();
        hosts.delete(canvas);
      }, 0);
    },
  };
}

export function createShaderState(partial: Partial<ShaderState> = {}): ShaderState {
  return {
    canvasWidth: 1,
    canvasHeight: 1,
    sectionTop: 0,
    sectionWidth: 1,
    sectionHeight: 1,
    scrollY: 0,
    targetPresence: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    ...partial,
  };
}
