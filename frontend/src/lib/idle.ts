/**
 * Executa `cb` quando a main thread estiver ociosa (pós-hidratação), com
 * fallback para setTimeout em navegadores sem requestIdleCallback (Safari).
 * Retorna uma função de cancelamento.
 */
export function runWhenIdle(cb: () => void, timeout = 600): () => void {
  if (typeof window === 'undefined') return () => {};
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(cb, { timeout });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(cb, 120);
  return () => clearTimeout(id);
}
