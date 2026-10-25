import EmblaCarousel, { type EmblaCarouselType, type EmblaOptionsType } from 'embla-carousel';

/**
 * Embla carousel on `[data-carousel]` markup:
 *   [data-carousel]                 root (optional JSON options in the attribute value)
 *     [data-carousel-viewport]      overflow: hidden
 *       > container > slides        flex track (see motion.css / section CSS)
 *     [data-carousel-prev|next]     optional buttons, disabled at the ends
 * Returns the Embla instance so callers can sync extra UI (thumbnails, counters).
 */
export function createCarousel(root: HTMLElement, options: EmblaOptionsType = {}): EmblaCarouselType | null {
  const viewport = root.querySelector<HTMLElement>('[data-carousel-viewport]');
  if (!viewport) return null;

  let attrOptions: EmblaOptionsType = {};
  try {
    attrOptions = root.dataset.carousel ? (JSON.parse(root.dataset.carousel) as EmblaOptionsType) : {};
  } catch {
    // Plain `data-carousel` without JSON.
  }

  const embla = EmblaCarousel(viewport, { align: 'start', containScroll: 'trimSnaps', ...attrOptions, ...options });
  const prev = root.querySelector<HTMLButtonElement>('[data-carousel-prev]');
  const next = root.querySelector<HTMLButtonElement>('[data-carousel-next]');
  prev?.addEventListener('click', () => embla.scrollPrev());
  next?.addEventListener('click', () => embla.scrollNext());

  const syncButtons = (): void => {
    if (prev) prev.disabled = !embla.canScrollPrev();
    if (next) next.disabled = !embla.canScrollNext();
    root.toggleAttribute('data-carousel-static', !embla.canScrollPrev() && !embla.canScrollNext());
  };
  embla.on('init', syncButtons).on('select', syncButtons).on('reInit', syncButtons);
  syncButtons();
  return embla;
}

/** Initialises every generic `[data-carousel]` under `root` that is not owned by a page module. */
export function initCarousels(root: ParentNode = document): EmblaCarouselType[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-carousel]:not([data-carousel-owned])'))
    .map(el => createCarousel(el))
    .filter((api): api is EmblaCarouselType => api !== null);
}
