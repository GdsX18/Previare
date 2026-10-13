/**
 * Renderizador dos shaders de fundo, independente de thread: roda dentro do
 * Web Worker (OffscreenCanvas) ou, como fallback, na main thread. Não toca
 * em DOM/window — recebe todo o estado necessário por mensagens.
 */
import { compileFullscreenProgram } from './glUtils';
import { SILK_FRAGMENT_SHADER } from './silkShader';
import { LIQUID_METAL_FRAGMENT_SHADER } from './liquidMetalShader';

export type ShaderKind = 'silk' | 'liquidMetal';

/** Estado vindo da main thread (geometria, scroll, cursor). */
export interface ShaderState {
  /** Tamanho CSS do canvas */
  canvasWidth: number;
  canvasHeight: number;
  /** Liquid Metal: geometria da seção (px CSS, coordenadas do documento) */
  sectionTop: number;
  sectionWidth: number;
  sectionHeight: number;
  scrollY: number;
  /** Liquid Metal: alvo do cursor (interpolado a cada frame no renderer) */
  targetPresence: number;
  targetMouseX: number;
  targetMouseY: number;
}

export type ShaderMessage =
  | { type: 'state'; state: Partial<ShaderState> }
  | { type: 'running'; running: boolean };

export interface ShaderRenderer {
  handle: (message: ShaderMessage) => void;
  dispose: () => void;
}

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;
type FrameFn = (now: number) => void;

// O tempo do Silk só aparece como `t * 0.8` e `t * 0.6` dentro de cos():
// ambos fecham ciclos inteiros em 10π (8π e 6π). Envolver o tempo nesse
// período é visualmente contínuo e mantém o valor pequeno, sem perda de
// precisão em sessões longas.
const SILK_TIME_PERIOD = 10 * Math.PI;

const PROGRAMS: Record<
  ShaderKind,
  {
    fragment: string;
    setup: (
      gl: WebGLRenderingContext,
      program: WebGLProgram,
      canvas: AnyCanvas,
      state: ShaderState,
      dpr: number
    ) => FrameFn;
  }
> = {
  silk: {
    fragment: SILK_FRAGMENT_SHADER,
    setup: (gl, program, canvas) => {
      // Uniforms constantes: enviados uma única vez, não a cada frame
      gl.uniform3fv(
        gl.getUniformLocation(program, 'u_colors'),
        // Mapeamento de Cores Silk Noturno Aveludado
        new Float32Array([
          0.008, 0.045, 0.035,
          0.035, 0.320, 0.220,
          0.280, 0.650, 0.310,
          0.680, 0.820, 0.520,
          0, 0, 0,
          0, 0, 0,
          0, 0, 0,
          0, 0, 0,
        ])
      );
      gl.uniform4f(gl.getUniformLocation(program, 'u_shape'), 1.40, 0.45, 0.50, 0.00);
      gl.uniform4f(gl.getUniformLocation(program, 'u_surface'), 2.40, 1.15, -0.22, 0.95);
      gl.uniform4f(gl.getUniformLocation(program, 'u_finish'), 0.00, 0.00, 0.000, 0.03);
      gl.uniform4f(gl.getUniformLocation(program, 'u_transform'), 1.0, 0.00, 0.00, 0.0);
      gl.uniform4f(gl.getUniformLocation(program, 'u_space'), 0.00, 0.00, 0.00, 0.00);
      gl.uniform4f(gl.getUniformLocation(program, 'u_cursor'), 0.0, 2.0, 0.21, 0.27);

      const uSceneLoc = gl.getUniformLocation(program, 'u_scene');
      const startTime = performance.now();

      return (now) => {
        const t = (((now - startTime) / 1000.0) * 0.86) % SILK_TIME_PERIOD;
        gl.uniform4f(uSceneLoc, canvas.width, canvas.height, t, 4.0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
    },
  },

  liquidMetal: {
    fragment: LIQUID_METAL_FRAGMENT_SHADER,
    setup: (gl, program, _canvas, state, dpr) => {
      gl.uniform3fv(
        gl.getUniformLocation(program, 'u_colors'),
        // Mapeamento das 4 cores Liquid Metal
        new Float32Array([
          0.137, 0.102, 0.063,
          0.643, 0.443, 0.282,
          0.890, 0.710, 0.529,
          0.976, 0.945, 0.906,
          0.0, 0.0, 0.0,
          0.0, 0.0, 0.0,
          0.0, 0.0, 0.0,
          0.0, 0.0, 0.0,
        ])
      );
      gl.uniform4f(gl.getUniformLocation(program, 'u_shape'), 1.26, 0.35, 0.28, 0.00);
      gl.uniform4f(gl.getUniformLocation(program, 'u_surface'), 1.82, 1.13, 0.03, 1.28);
      gl.uniform4f(gl.getUniformLocation(program, 'u_finish'), 4.75, 0.33, 0.001, 0.04);
      gl.uniform4f(gl.getUniformLocation(program, 'u_transform'), 8754.0, 0.00, 0.08, 0.0);

      const uSceneLoc = gl.getUniformLocation(program, 'u_scene');
      const uSpaceLoc = gl.getUniformLocation(program, 'u_space');
      const uCursorLoc = gl.getUniformLocation(program, 'u_cursor');
      const uFragOffsetLoc = gl.getUniformLocation(program, 'u_fragOffset');

      const startTime = performance.now();
      let currentPresence = 0.0;
      let currentMouseX = 0.0;
      let currentMouseY = 0.0;

      return (now) => {
        const elapsedSeconds = (now - startTime) / 1000.0;

        // Interpolação suave do cursor
        currentPresence += (state.targetPresence - currentPresence) * 0.1;
        currentMouseX += (state.targetMouseX - currentMouseX) * 0.15;
        currentMouseY += (state.targetMouseY - currentMouseY) * 0.15;

        // "Janela deslizante": o canvas tem o tamanho da viewport e fica
        // `sticky` na seção. viewTop reproduz a posição aplicada pelo sticky, e
        // u_fragOffset leva cada pixel às coordenadas da seção inteira, para
        // que o resultado seja idêntico ao de um canvas do tamanho da seção.
        const viewTop = Math.min(
          Math.max(state.scrollY - state.sectionTop, 0),
          Math.max(state.sectionHeight - state.canvasHeight, 0)
        );
        // gl_FragCoord tem origem embaixo: distância da base da janela à base da seção
        const offsetY = (state.sectionHeight - viewTop - state.canvasHeight) * dpr;

        gl.uniform2f(uFragOffsetLoc, 0.0, offsetY);
        gl.uniform4f(
          uSceneLoc,
          state.sectionWidth * dpr,
          state.sectionHeight * dpr,
          elapsedSeconds * 0.57,
          4.0
        );
        gl.uniform4f(uSpaceLoc, 0.00, -0.13, currentMouseX, currentMouseY);
        gl.uniform4f(uCursorLoc, currentPresence, 3.0, 0.71, 0.49);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
    },
  },
};

export function createShaderRenderer(
  canvas: AnyCanvas,
  kind: ShaderKind,
  dpr: number,
  initialState: ShaderState,
  callbacks: { onReady: () => void; onUnsupported: () => void }
): ShaderRenderer {
  const state: ShaderState = { ...initialState };
  let running = false;
  let disposed = false;
  let rafId: number | null = null;
  let frame: FrameFn | null = null;
  let dispose: (() => void) | null = null;

  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'high-performance',
  }) as WebGLRenderingContext | null;

  // Drawing buffer com DPR travado (1.0 mobile / 1.5 desktop)
  const applySize = () => {
    if (!gl) return;
    const width = Math.max(1, Math.floor(state.canvasWidth * dpr));
    const height = Math.max(1, Math.floor(state.canvasHeight * dpr));
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
  };

  const tick = (now: number) => {
    frame?.(now);
    rafId = requestAnimationFrame(tick);
  };

  // O loop só existe enquanto a seção está visível: fora dela o
  // requestAnimationFrame é cancelado de fato (zero trabalho por frame).
  const syncLoop = () => {
    const shouldRun = running && frame !== null && !disposed;
    if (shouldRun && rafId === null) {
      rafId = requestAnimationFrame(tick);
    } else if (!shouldRun && rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  if (!gl) {
    callbacks.onUnsupported();
  } else {
    const spec = PROGRAMS[kind];
    void compileFullscreenProgram(gl, spec.fragment).then((glProgram) => {
      if (!glProgram) return;
      if (disposed) {
        glProgram.dispose();
        return;
      }
      dispose = glProgram.dispose;
      applySize();
      frame = spec.setup(gl, glProgram.program, canvas, state, dpr);
      frame(performance.now());
      callbacks.onReady();
      syncLoop();
    });
  }

  return {
    handle: (message) => {
      if (message.type === 'state') {
        Object.assign(state, message.state);
        if (message.state.canvasWidth !== undefined || message.state.canvasHeight !== undefined) {
          applySize();
          // Redimensionar limpa o drawing buffer: redesenha já, sem frame vazio
          if (running) frame?.(performance.now());
        }
      } else {
        running = message.running;
        syncLoop();
      }
    },
    dispose: () => {
      disposed = true;
      syncLoop();
      dispose?.();
    },
  };
}
