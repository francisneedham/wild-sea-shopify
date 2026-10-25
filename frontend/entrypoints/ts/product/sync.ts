import { getAvailableValues } from '../utils/variant-picker';
import { state } from './state';

function matchesVariantOwner(ownerVariantIds: string | undefined, variantId: string): boolean {
  if (!ownerVariantIds) return false;
  return ownerVariantIds.split(',').some(id => id.trim() === variantId);
}

function resolvePrimaryVariantMediaId(items: HTMLElement[], variantId: string): string | null {
  const primary = items.find(item => matchesVariantOwner(item.dataset.variantMedia, variantId));
  return primary?.dataset.mediaId ?? null;
}

/** Calls all sync helpers in sequence after any state change. */
export function syncDOM(): void {
  syncPrice();
  syncAvailability();
  syncSpecifications();
  syncMedia();
  syncVariantInput();
  syncButton();
  syncCartStatus();
  syncOptionButtons();
}

/** Shows metafield rows for the selected variant; product-level rows stay visible. */
function syncSpecifications(): void {
  const root = document.querySelector<HTMLElement>('[data-js="product-specifications"]');
  if (!root) return;
  let hasVisibleRows = Boolean(root.querySelector('tbody:not([data-js]) tr'));
  root.querySelectorAll<HTMLElement>('[data-js="product-spec-variant"]').forEach((group) => {
    const selected = group.dataset.variantId === String(state.currentVariant.id);
    group.hidden = !selected;
    if (selected) hasVisibleRows = true;
  });
  root.hidden = !hasVisibleRows;
}

/** Updates the price element from the pre-formatted `variantPrices` map. */
function syncPrice(): void {
  const priceEl = document.querySelector('[data-js="product-price"]');
  if (!priceEl) return;
  const formatted = state.variantPrices[String(state.currentVariant.id)];
  if (formatted) priceEl.textContent = formatted;
  const compareEl = document.querySelector<HTMLElement>('[data-js="product-compare-price"]');
  if (compareEl) {
    const compare = state.variantComparePrices[String(state.currentVariant.id)];
    compareEl.textContent = compare ?? '';
    compareEl.hidden = !compare;
  }
}

/** Shows or hides the "Sold out" availability message. */
function syncAvailability(): void {
  const el = document.querySelector('[data-js="product-availability"]');
  if (!el) return;
  el.textContent = state.currentVariant.available ? 'Available' : 'Sold out';
  if (el instanceof HTMLElement) el.dataset.available = String(state.currentVariant.available);
}

/** Scrolls the gallery to `currentMediaId` (or the variant's featured media) and marks the matching thumbnail. */
function syncMedia(): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-js="media-item"]'));
  if (items.length === 0) return;

  const variantId = String(state.currentVariant.id);
  const targetId = state.currentMediaId !== null ? String(state.currentMediaId) : null;
  const activeMediaId = items.find(item => item.dataset.mediaId === targetId)?.dataset.mediaId
    ?? resolvePrimaryVariantMediaId(items, variantId)
    ?? items[0]?.dataset.mediaId;

  const index = items.findIndex(item => item.dataset.mediaId === activeMediaId);
  // Jump (no slide animation): animating across several slides flashes through intermediate, still-lazy images.
  if (state.gallery && index >= 0 && state.gallery.selectedScrollSnap() !== index) state.gallery.scrollTo(index, true);

  document.querySelectorAll<HTMLButtonElement>('[data-js="thumbnail"]').forEach((btn) => {
    const active = btn.dataset.thumbnail === activeMediaId;
    btn.setAttribute('aria-pressed', String(active));
    // Horizontal only: scrollIntoView would also move the page.
    const strip = btn.parentElement;
    if (active && strip) strip.scrollTo({ left: btn.offsetLeft - (strip.clientWidth - btn.clientWidth) / 2, behavior: 'smooth' });
  });
}

/** Updates the add-to-cart button label and disabled state based on availability and cart state. */
function syncButton(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-js="add-to-cart"]');
  if (!btn) return;

  const labels = {
    idle: state.currentVariant.available ? 'Add to cart' : 'Sold out',
    loading: 'Adding...',
    success: 'Added!',
    error: 'Try again',
  };

  btn.disabled = !state.currentVariant.available || state.cartState === 'loading';
  btn.setAttribute('aria-busy', String(state.cartState === 'loading'));
  // Keep the icon: only the label span changes when present.
  const label = btn.querySelector<HTMLElement>('[data-js="add-to-cart-label"]') ?? btn;
  label.textContent = labels[state.cartState];
}

function syncVariantInput(): void {
  const input = document.querySelector<HTMLInputElement>('[data-js="variant-id"]');
  if (!input) return;
  input.value = String(state.currentVariant.id);
}

function syncCartStatus(): void {
  const status = document.querySelector<HTMLElement>('[data-js="cart-status"]');
  if (!status) return;

  const messages = {
    idle: state.currentVariant.available ? '' : 'This variant is sold out.',
    loading: '',
    success: 'Added to cart.',
    error: 'Could not add to cart. Please try again.',
  };

  status.textContent = messages[state.cartState];
}

/** Updates `aria-pressed` and `aria-disabled` on all option buttons, and refreshes the selected-value label text. */
function syncOptionButtons(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-js="option-value"]').forEach((btn) => {
    const position = Number(btn.dataset.optionPosition) - 1;
    const value = btn.dataset.optionValue ?? '';
    const isSelected = state.selectedOptions[position] === value;

    btn.setAttribute('aria-pressed', String(isSelected));
    const available = getAvailableValues(state.productData.variants, state.selectedOptions, position);
    const isAvailable = available.has(value);

    btn.setAttribute('aria-disabled', String(!isAvailable));
    btn.disabled = !isAvailable;
  });

  document.querySelectorAll<HTMLElement>('[data-js="option-label"]').forEach((label) => {
    const position = Number(label.dataset.optionLabel) - 1;
    label.textContent = state.selectedOptions[position] ?? '';
  });
}
