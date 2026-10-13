/**
 * Web Worker dos shaders de fundo: contexto WebGL, compilação e loop de
 * renderização rodam inteiramente fora da main thread (OffscreenCanvas),
 * sem competir com hidratação, GSAP/ScrollTrigger ou input do usuário.
 */
import {
  createShaderRenderer,
  type ShaderKind,
  type ShaderMessage,
  type ShaderRenderer,
  type ShaderState,
} from './shaderRenderer';

export type WorkerInitMessage = {
  type: 'init';
  canvas: OffscreenCanvas;
  kind: ShaderKind;
  dpr: number;
  state: ShaderState;
};

// Escopo do worker tipado localmente (o projeto compila com a lib "dom")
const ctx = self as unknown as {
  onmessage: ((event: MessageEvent<WorkerInitMessage | ShaderMessage>) => void) | null;
  postMessage: (message: { type: 'ready' | 'unsupported' }) => void;
};

let renderer: ShaderRenderer | null = null;

ctx.onmessage = (event) => {
  const message = event.data;
  if (message.type === 'init') {
    renderer = createShaderRenderer(message.canvas, message.kind, message.dpr, message.state, {
      onReady: () => ctx.postMessage({ type: 'ready' }),
      // Ex.: Safari 16.x tem OffscreenCanvas, mas sem WebGL dentro do worker
      onUnsupported: () => ctx.postMessage({ type: 'unsupported' }),
    });
  } else {
    renderer?.handle(message);
  }
};
