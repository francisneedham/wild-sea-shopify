import { state } from './product/state';
import { syncDOM } from './product/sync';
import { onOptionClick, onAddToCart, onThumbnailClick } from './product/handlers';
import { loadRecommendations } from './product/recommendations';
import type { ProductData } from './utils/variant-picker';
import { onReady } from './utils/ready';
import { createCarousel } from './utils/carousel';

let listeners: AbortController | null = null;

function resolveVariantFromURL(productData: ProductData): ProductData['variants'][number] {
  const params = new URLSearchParams(window.location.search);
  const variantIdParam = Number(params.get('variant'));

  return (
    productData.variants.find(v => v.id === variantIdParam)
    ?? productData.variants.find(v => v.available)
    ?? productData.variants[0]
  );
}

function applyVariantSelection(variant: ProductData['variants'][number]): void {
  state.currentVariant = variant;
  state.selectedOptions = [...variant.options];

  if (variant.featured_media) {
    state.currentMediaId = variant.featured_media.id;
    state.mediaContextVariantId = variant.id;
    return;
  }

  if (state.currentMediaId === null) {
    const firstMedia = document.querySelector<HTMLElement>('[data-js="media-item"]');
    const firstMediaId = Number(firstMedia?.dataset.mediaId ?? '');
    const firstMediaOwnerVariantId = Number((firstMedia?.dataset.variantMedia ?? '').split(',')[0]);
    state.currentMediaId = firstMediaId || null;
    state.mediaContextVariantId = firstMediaOwnerVariantId || state.mediaContextVariantId;
  }
}

/** Embla gallery: swiping updates the current media, thumbnails and counter; videos pause off-slide. */
function initGallery(): void {
  state.gallery?.destroy();
  state.gallery = null;
  const root = document.querySelector<HTMLElement>('[data-js="product-gallery"]');
  if (!root) return;
  const slides = Array.from(root.querySelectorAll<HTMLElement>('[data-js="media-item"]'));
  const startIndex = Math.max(0, slides.findIndex(slide => Number(slide.dataset.mediaId) === state.currentMediaId));
  const gallery = createCarousel(root, { align: 'center', containScroll: false, startIndex });
  if (!gallery) return;
  state.gallery = gallery;
  // Warm the remaining slides once the page is idle, so variant/thumbnail jumps never show an empty frame.
  const warm = (): void => slides.forEach((slide) => { const img = slide.querySelector('img'); if (img) img.loading = 'eager'; });
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(warm, { timeout: 2000 });
  else setTimeout(warm, 1500);
  const counter = root.querySelector<HTMLElement>('[data-js="gallery-index"]');
  gallery.on('select', () => {
    const index = gallery.selectedScrollSnap();
    const slides = gallery.slideNodes();
    if (counter) counter.textContent = String(index + 1);
    slides.forEach((slide, i) => { if (i !== index) slide.querySelector('video')?.pause(); });
    const mediaId = Number(slides[index]?.dataset.mediaId);
    if (mediaId && mediaId !== state.currentMediaId) {
      state.currentMediaId = mediaId;
      syncDOM();
    }
  });
}

/** Quantity stepper buttons around the native number input. */
function onQuantityClick(event: Event): void {
  const btn = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-js="product-qty-dec"], [data-js="product-qty-inc"]');
  const input = btn?.parentElement?.querySelector<HTMLInputElement>('input[name="quantity"]');
  if (!btn || !input) return;
  const step = btn.dataset.js === 'product-qty-inc' ? 1 : -1;
  input.value = String(Math.max(1, (Number(input.value) || 1) + step));
}

function isProductInteractionTarget(target: EventTarget | null): target is HTMLElement {
  return target instanceof HTMLElement;
}

/**
 * Bootstraps the product page: parses JSON islands, resolves the initial variant
 * from URL or availability, and attaches event listeners.
 */
function init(): void {
  const dataEl = document.querySelector<HTMLScriptElement>('[data-js="product-data"]');
  if (!dataEl?.textContent) return;
  listeners?.abort();
  listeners = new AbortController();
  const { signal } = listeners;

  state.productData = JSON.parse(dataEl.textContent) as ProductData;

  const pricesEl = document.querySelector<HTMLScriptElement>('[data-js="variant-prices"]');
  state.variantPrices = pricesEl?.textContent
    ? (JSON.parse(pricesEl.textContent) as Record<string, string>)
    : {};
  const comparePricesEl = document.querySelector<HTMLScriptElement>('[data-js="variant-compare-prices"]');
  state.variantComparePrices = comparePricesEl?.textContent
    ? (JSON.parse(comparePricesEl.textContent) as Record<string, string | null>)
    : {};

  applyVariantSelection(resolveVariantFromURL(state.productData));
  initGallery();

  let hasLoadedRecommendations = false;
  const loadRecommendationsOnce = (): void => {
    if (hasLoadedRecommendations) return;
    hasLoadedRecommendations = true;
    loadRecommendations();
  };

  const onFirstPointerDown = (event: PointerEvent): void => {
    if (!isProductInteractionTarget(event.target)) return;

    const isProductInteraction = Boolean(
      event.target.closest('[data-js="product-form"], [data-product-media], [data-product-thumbnails]'),
    );
    if (!isProductInteraction) return;

    loadRecommendationsOnce();
    document.removeEventListener('pointerdown', onFirstPointerDown, true);
    document.removeEventListener('keydown', onFirstKeyDown, true);
  };

  const onFirstKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (!isProductInteractionTarget(event.target)) return;

    const isProductInteraction = Boolean(
      event.target.closest('[data-js="product-form"], [data-product-media], [data-product-thumbnails]'),
    );
    if (!isProductInteraction) return;

    loadRecommendationsOnce();
    document.removeEventListener('pointerdown', onFirstPointerDown, true);
    document.removeEventListener('keydown', onFirstKeyDown, true);
  };

  document.addEventListener('pointerdown', onFirstPointerDown, { capture: true, signal });
  document.addEventListener('keydown', onFirstKeyDown, { capture: true, signal });

  const form = document.querySelector<HTMLFormElement>('[data-js="product-form"]');
  form?.addEventListener('click', (event) => {
    onOptionClick(event);
    onQuantityClick(event);
  }, { signal });
  form?.addEventListener('submit', (e) => {
    loadRecommendationsOnce();
    void onAddToCart(e);
  }, { signal });

  document.addEventListener('click', (event) => {
    onThumbnailClick(event);
  }, { signal });
  window.addEventListener('popstate', () => {
    applyVariantSelection(resolveVariantFromURL(state.productData));
    state.cartState = 'idle';
    syncDOM();
  }, { signal });

  syncDOM();
}

onReady(init);
document.addEventListener('shopify:section:load', (event) => {
  if (event.target instanceof Element && event.target.querySelector('[data-js="product-data"]')) init();
});
