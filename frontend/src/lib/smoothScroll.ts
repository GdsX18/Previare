import { loadGsap, type GsapModules } from './gsap';

type ScrollOptions = { offset?: number; duration?: number; onComplete?: () => void };

export function scrollToSection(target: string, options: ScrollOptions = {}) {
  if (typeof window === 'undefined') return;
  // GSAP é carregado sob demanda (normalmente já está em cache após o idle)
  void loadGsap().then((modules) => animateScroll(modules, target, options));
}

function animateScroll({ gsap, ScrollTrigger }: GsapModules, target: string, options: ScrollOptions) {
  const { offset = 85, duration = 1.1, onComplete } = options;
  const cleanId = target.replace(/^[/#]+/, '');

  if (!cleanId || cleanId === 'home') {
    if (gsap && gsap.to) {
      gsap.to(window, {
        scrollTo: { y: 0, autoKill: false },
        duration,
        ease: 'power3.inOut',
        overwrite: 'auto',
        onComplete: () => {
          window.history.pushState(null, '', '/');
          onComplete?.();
        },
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
      onComplete?.();
    }
    return;
  }

  const element = document.getElementById(cleanId);
  if (!element) return;

  // Atualiza medições do ScrollTrigger caso pin-spacers tenham sido alterados
  if (ScrollTrigger) {
    ScrollTrigger.refresh();
  }

  const targetY = element.getBoundingClientRect().top + window.scrollY - offset;

  if (gsap && gsap.to) {
    gsap.to(window, {
      scrollTo: {
        y: Math.max(0, targetY),
        autoKill: false, // Impede que o ScrollTrigger Snap ou interrupções acidentais cancelem a rolagem
      },
      duration,
      ease: 'power3.inOut',
      overwrite: 'auto',
      onComplete: () => {
        window.history.pushState(null, '', `#${cleanId}`);
        onComplete?.();
      },
    });
  } else {
    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: 'smooth',
    });
    window.history.pushState(null, '', `#${cleanId}`);
    onComplete?.();
  }
}
