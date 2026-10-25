// Motion: Lenis on the GSAP ticker + ScrollTrigger reveals/parallax (same setup as anonima-fe motion/).
// Markup: data-reveal="<preset>" (optional data-reveal-delay / -start / -duration / -stagger), data-parallax.
// Content stays visible without JS: hidden states are applied here, never in CSS.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);

const reducedMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Smooth scroll. Off for reduced motion and inside the Theme Editor (its preview iframe scrolls to selected sections).
export function initSmoothScroll(): Lenis | null {
  if (reducedMotion() || window.Shopify?.designMode) return null;
  const lenis = new Lenis({
    duration: 1,
    easing: (t) => 1 - Math.pow(1 - t, 5),
    smoothWheel: true,
    anchors: true,
    // Let drawers/dialogs scroll natively.
    prevent: (node) => node.closest('dialog, [role="dialog"], [data-lenis-prevent]') !== null,
  });
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);
  return lenis;
}

type Preset = {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
  duration: number;
  ease: string;
  start: string;
  stagger?: number;
  lines?: boolean;
  zoom?: number;
};

const base = { ease: 'power4.out', duration: 1.1 };
const PRESETS: Record<string, Preset> = {
  default: { from: { y: 48, opacity: 0 }, to: { y: 0, opacity: 1 }, ...base, start: 'top 88%' },
  // Mask reveal: SplitText wraps each line in its own clipping mask, so no extra wrapper is needed in the markup.
  title: { from: { yPercent: 105 }, to: { yPercent: 0 }, duration: 1.25, ease: 'expo.out', start: 'top 92%', stagger: 0.08, lines: true },
  // Images only zoom out inside their frame (overflow hidden): no opacity change.
  image: { from: {}, to: {}, ...base, duration: 1.2, start: 'top 90%', zoom: 1.12 },
  fade: { from: { opacity: 0 }, to: { opacity: 1 }, ...base, start: 'top 90%' },
};

const num = (value: string | undefined, fallback: number): number => (value === undefined || value === '' ? fallback : Number(value));

/**
 * Line masks for the title reveal. Forced breaks become block spans first: a <br> left between SplitText's
 * block line wrappers renders as an extra empty line (the title jumps when the split is reverted).
 * Masks get a clip margin so tight display line-heights don't cut the glyphs.
 */
function splitLines(element: HTMLElement): SplitText {
  if (element.querySelector('br')) {
    element.innerHTML = element.innerHTML
      .split(/<br\s*\/?>\s*/i)
      .map(part => `<span class="reveal-break" style="display:block">${part}</span>`)
      .join('');
  }
  const split = SplitText.create(element, { type: 'lines', mask: 'lines' });
  // Masks are overflow: clip; let glyphs bleed a little past the line box without changing layout.
  split.masks.forEach((mask) => { (mask as HTMLElement).style.setProperty('overflow-clip-margin', '0.15em'); });
  return split;
}

/** Creates reveals for every [data-reveal] under `root`. Returns destroy(). */
export function initReveal(root: ParentNode = document): () => void {
  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((element) => {
      const preset = PRESETS[element.dataset.reveal ?? ''] ?? PRESETS.default;
      const split = preset.lines ? splitLines(element) : null;
      const duration = num(element.dataset.revealDuration, preset.duration);
      const timeline = gsap.timeline({
        delay: num(element.dataset.revealDelay, 0),
        onComplete: () => split?.revert(),
        scrollTrigger: { trigger: element, start: element.dataset.revealStart ?? preset.start, once: true },
      });
      if (!preset.zoom) {
        timeline.fromTo(split ? split.lines : element, preset.from, {
          ...preset.to,
          duration,
          ease: preset.ease,
          stagger: preset.stagger ? num(element.dataset.revealStagger, preset.stagger) : 0,
        });
      }
      const image = preset.zoom ? element.querySelector('img') : null;
      if (image) timeline.fromTo(image, { scale: preset.zoom }, { scale: 1, duration: duration * 1.5, ease: 'power3.out' }, 0);
    });
  });

  // revert() kills tweens + triggers created inside and restores inline styles.
  return () => mm.revert();
}

/** Light parallax: the image inside each [data-parallax] drifts against the scroll. Tweens the img transform (compositor only); its CSS `scale` keeps the edges covered. */
export function initParallax(root: ParentNode = document): () => void {
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((frame) => {
      // A slideshow moves as one layer ([data-parallax-target]); otherwise the single image moves.
      const image = frame.querySelector('[data-parallax-target]') ?? frame.querySelector('img');
      if (!image) return;
      gsap.fromTo(
        image,
        { yPercent: -6 },
        { yPercent: 6, ease: 'none', force3D: true, scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
    });
  });
  return () => mm.revert();
}

/** Boots motion once fonts are ready (SplitText measures lines) and refreshes triggers after late layout shifts. */
export function initMotion(): void {
  initSmoothScroll();
  void document.fonts.ready.then(() => {
    initReveal();
    initParallax();
    ScrollTrigger.refresh();
  });
  window.addEventListener('load', () => ScrollTrigger.refresh());
  // Lazy images and late sections change the page height after triggers are measured; re-measure when it settles.
  let lastHeight = document.body.scrollHeight;
  const refresh = gsap.delayedCall(0.2, () => ScrollTrigger.refresh()).pause();
  new ResizeObserver(() => {
    if (document.body.scrollHeight === lastHeight) return;
    lastHeight = document.body.scrollHeight;
    refresh.restart(true);
  }).observe(document.body);
}
