/**
 * Utilitários compartilhados pelos shaders WebGL de fundo (Silk / Liquid Metal).
 */

/**
 * Cabeçalho de precisão dos fragment shaders.
 *
 * A precisão padrão é `mediump` (cálculo de cor: paleta, contraste, saturação,
 * vinheta), o que reduz a carga de ALU nas GPUs móveis. Apenas as grandezas
 * que *exigem* 32 bits recebem `HP` (highp quando disponível): coordenadas de
 * pixel, tempo e as funções de hash/ruído. Em mediump (fp16) essas grandezas
 * perdem resolução — o tempo "anda em degraus" após alguns segundos e o hash
 * gera blocos —, o que alteraria visivelmente o shader.
 *
 * Em GPUs desktop a qualificação de precisão é ignorada (tudo roda em fp32),
 * portanto o visual permanece idêntico.
 */
export const FRAGMENT_PRECISION_HEADER = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
#define HP highp
#else
#define HP mediump
#endif
precision mediump float;
`;

export const FULLSCREEN_VERTEX_SHADER = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    /Mobi|Android/i.test(navigator.userAgent) ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

/**
 * Densidade de pixels do drawing buffer: telas 3x/4x multiplicariam o custo
 * do fragment shader por até 16 vezes sem ganho perceptível num fundo suave.
 */
export function getRenderDpr(): number {
  return Math.min(window.devicePixelRatio || 1, isMobileDevice() ? 1.0 : 1.5);
}

export interface GLProgram {
  program: WebGLProgram;
  dispose: () => void;
}

/**
 * Compila os shaders, linka o programa e configura o triângulo de tela cheia.
 *
 * Consultar COMPILE_STATUS/LINK_STATUS logo após compilar obriga a main
 * thread a esperar o driver terminar (dezenas de ms numa GPU móvel, mais de
 * 1 s em renderização por software). Com KHR_parallel_shader_compile a
 * compilação segue em segundo plano e o status só é lido quando pronto,
 * verificado a cada frame, sem bloquear a thread.
 */
export function compileFullscreenProgram(
  gl: WebGLRenderingContext,
  fragmentSource: string
): Promise<GLProgram | null> {
  const vertShader = gl.createShader(gl.VERTEX_SHADER);
  const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!vertShader || !fragShader || !program) return Promise.resolve(null);

  gl.shaderSource(vertShader, FULLSCREEN_VERTEX_SHADER);
  gl.shaderSource(fragShader, fragmentSource);
  gl.compileShader(vertShader);
  gl.compileShader(fragShader);
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);

  const deleteAll = () => {
    gl.deleteProgram(program);
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
  };

  const finalize = (): GLProgram | null => {
    if (gl.isContextLost()) return null;
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(
        gl.getShaderInfoLog(vertShader),
        gl.getShaderInfoLog(fragShader),
        gl.getProgramInfoLog(program)
      );
      deleteAll();
      return null;
    }
    return setupFullscreenTriangle(gl, program, deleteAll);
  };

  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  if (!parallel) return Promise.resolve(finalize());

  return new Promise((resolve) => {
    const poll = () => {
      if (gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) {
        resolve(finalize());
      } else {
        requestAnimationFrame(poll);
      }
    };
    requestAnimationFrame(poll);
  });
}

function setupFullscreenTriangle(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  deleteProgramAndShaders: () => void
): GLProgram {
  gl.useProgram(program);

  // Triângulo único em tela cheia
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  const posLocation = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(posLocation);
  gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

  return {
    program,
    dispose: () => {
      if (positionBuffer) gl.deleteBuffer(positionBuffer);
      deleteProgramAndShaders();
    },
  };
}

/**
 * Observa se `target` está na viewport (com margem) e se a aba está visível.
 * O renderizador usa isso para cancelar de fato o requestAnimationFrame fora
 * da tela — zero callbacks por frame, zero uso de GPU.
 */
export function observeVisibility(
  target: Element,
  onChange: (visible: boolean) => void,
  rootMargin = '200px'
) {
  let inView = false;
  let last: boolean | null = null;

  const sync = () => {
    const visible = inView && !document.hidden;
    if (visible !== last) {
      last = visible;
      onChange(visible);
    }
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1];
      if (entry) inView = entry.isIntersecting;
      sync();
    },
    { threshold: 0, rootMargin }
  );
  observer.observe(target);
  document.addEventListener('visibilitychange', sync);

  return () => {
    observer.disconnect();
    document.removeEventListener('visibilitychange', sync);
  };
}
