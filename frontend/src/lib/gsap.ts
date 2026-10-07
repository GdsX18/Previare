import { runWhenIdle } from './idle';

/**
 * GSAP + plugins carregados sob demanda (import dinâmico): o código fica fora
 * do bundle inicial e só é baixado/avaliado após a hidratação, quando a main
 * thread está ociosa — nada de GSAP no caminho crítico do FCP/LCP.
 */
export type GsapModules = {
  gsap: typeof import('gsap').gsap;
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
};

export type Gsap = GsapModules['gsap'];

let modulesPromise: Promise<GsapModules> | null = null;

export function loadGsap(): Promise<GsapModules> {
  modulesPromise ??= Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('gsap/ScrollToPlugin'),
  ]).then(([{ gsap }, { ScrollTrigger }, { ScrollToPlugin }]) => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    return { gsap, ScrollTrigger };
  });
  return modulesPromise;
}

type ScrollSetupFn = (modules: GsapModules) => void | (() => void);
type ScrollSetup = { fn: ScrollSetupFn; cancelled: boolean; cleanup?: () => void };

// Fila única de setups de ScrollTrigger: todos rodam no mesmo callback, na
// ordem de montagem (ordem do documento), preservando o cálculo correto de
// pin-spacers entre seções (About → Services → Diferenciais → ...).
let setupQueue: ScrollSetup[] = [];
let flushScheduled = false;

function flushScrollSetups() {
  void loadGsap().then((modules) => {
    flushScheduled = false;
    const queue = setupQueue;
    setupQueue = [];
    queue.forEach((setup) => {
      if (setup.cancelled) return;
      setup.cleanup = setup.fn(modules) || undefined;
    });
  });
}

/**
 * Agenda a criação de ScrollTriggers para depois da hidratação, para que o
 * navegador pinte o conteúdo textual (FCP/LCP) antes de registrar
 * observadores de rolagem e pin-spacers. Retorna a função de limpeza
 * (cancela o setup pendente ou reverte o que já foi criado).
 */
export function deferScrollSetup(fn: ScrollSetupFn): () => void {
  const setup: ScrollSetup = { fn, cancelled: false };
  setupQueue.push(setup);
  if (!flushScheduled) {
    flushScheduled = true;
    runWhenIdle(flushScrollSetups);
  }
  return () => {
    setup.cancelled = true;
    setup.cleanup?.();
  };
}

/**
 * Callback `onToggle` para ScrollTrigger: aplica `will-change` apenas enquanto
 * o gatilho está ativo e o remove ao sair, liberando as camadas da GPU.
 */
export function willChangeWhileActive(targets: HTMLElement[], value = 'transform, opacity') {
  return (self: { isActive: boolean }) => {
    targets.forEach((el) => {
      el.style.willChange = self.isActive ? value : 'auto';
    });
  };
}
