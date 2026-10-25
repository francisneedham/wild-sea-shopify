/**
 * Crossfade slideshow on `[data-slideshow]` (children `[data-slide]`, class `is-active` = visible).
 * Optional dots: sibling/ancestor `[data-slideshow-dots]` with `[data-slide-to]` buttons.
 * The active slide also gets `is-zoom` (CSS drives a slow zoom). Autoplay stops for reduced motion and pauses while the tab is hidden.
 */
export function initSlideshows(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('[data-slideshow]').forEach((show) => {
    const slides = Array.from(show.querySelectorAll<HTMLElement>('[data-slide]'));
    if (slides.length < 2) return;
    const dots = Array.from(show.closest('section')?.querySelectorAll<HTMLButtonElement>('[data-slide-to]') ?? []);
    const interval = Number(show.dataset.interval) || 6000;
    let current = 0;
    let timer = 0;

    const go = (index: number): void => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle('is-active', i === current));
      // Zoom starts a frame later so the transition runs (the first slide is already active in the HTML).
      slides.forEach((slide, i) => { if (i !== current) slide.classList.remove('is-zoom'); });
      requestAnimationFrame(() => requestAnimationFrame(() => slides[current].classList.add('is-zoom')));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === current));
      // Make sure the next slide is loading before it fades in.
      const next = slides[(current + 1) % slides.length].querySelector('img');
      if (next) next.loading = 'eager';
    };
    const play = (): void => {
      window.clearInterval(timer);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      timer = window.setInterval(() => go(current + 1), interval);
    };

    dots.forEach((dot) => dot.addEventListener('click', () => { go(Number(dot.dataset.slideTo)); play(); }));
    document.addEventListener('visibilitychange', () => (document.hidden ? window.clearInterval(timer) : play()));
    go(0);
    play();
  });
}
