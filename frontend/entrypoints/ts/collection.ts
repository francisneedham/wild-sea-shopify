/**
 * PLP (collection) progressive interactions: sort, filters (drawer + inline),
 * numbered pagination (root replace + scroll to grid), and quick-buy.
 * Hydrates `[data-js="collection-root"]` via single-section fetch
 * (`?section_id=`), swapping the whole root (sort/filters/products/pagination
 * all change together) rather than named sub-targets. Pushes history state on
 * every filter/sort/pagination change; quick-buy reuses the shared
 * `cart:updated`/`cart:open` events so the cart drawer stays in sync.
 */
import { addToCart } from './utils/cart';
import { getDialogFocusables, handleDialogKeyDown } from './utils/dialog';
import { fetchSingleSectionHtml, parseSectionRoot } from './utils/section-rendering';
import { findVariantByOptions, getAvailableValues } from './utils/variant-picker';
import { hydrateIcons } from './utils/icons';
import type { ProductData } from './utils/variant-picker';
import { onReady } from './utils/ready';

interface CardVariantContext {
  variants: ProductData['variants'];
  prices: Record<string, string>;
}

const cardContexts = new WeakMap<HTMLElement, CardVariantContext>();
const cardSelectedOptions = new WeakMap<HTMLElement, string[]>();

function getCardContext(card: HTMLElement): CardVariantContext | null {
  const cached = cardContexts.get(card);
  if (cached) return cached;

  const dataEl = card.querySelector<HTMLScriptElement>('[data-js="card-product-data"]');
  const pricesEl = card.querySelector<HTMLScriptElement>('[data-js="card-variant-prices"]');
  if (!dataEl?.textContent) return null;

  try {
    const productData = JSON.parse(dataEl.textContent) as ProductData;
    const prices = pricesEl?.textContent ? (JSON.parse(pricesEl.textContent) as Record<string, string>) : {};
    const context: CardVariantContext = { variants: productData.variants, prices };
    cardContexts.set(card, context);
    return context;
  } catch {
    return null;
  }
}

function syncCardOptionButtons(card: HTMLElement, variants: ProductData['variants'], selectedOptions: string[]): void {
  card.querySelectorAll<HTMLButtonElement>('[data-js="card-option-value"]').forEach((btn) => {
    const position = Number(btn.dataset.optionPosition) - 1;
    const value = btn.dataset.optionValue ?? '';
    const available = getAvailableValues(variants, selectedOptions, position);

    btn.setAttribute('aria-pressed', String(selectedOptions[position] === value));
    const isAvailable = available.has(value);
    btn.disabled = !isAvailable;
    btn.setAttribute('aria-disabled', String(!isAvailable));
  });
}

function syncCardPrice(
  card: HTMLElement,
  context: CardVariantContext,
  variant: ProductData['variants'][number] | undefined,
): void {
  const priceEl = card.querySelector<HTMLElement>('[data-js="card-price"]');
  if (!priceEl || !variant) return;
  const formatted = context.prices[String(variant.id)];
  if (formatted) priceEl.textContent = formatted;
}

function syncCardQuickBuyButton(card: HTMLElement, variant: ProductData['variants'][number] | undefined): void {
  const button = card.querySelector<HTMLButtonElement>('[data-js="collection-quick-buy"]');
  if (!button) return;

  if (variant?.available) {
    button.dataset.variantId = String(variant.id);
    button.disabled = false;
    button.setAttribute('aria-disabled', 'false');
  } else {
    button.dataset.variantId = '';
    button.disabled = true;
    button.setAttribute('aria-disabled', 'true');
  }
}

/** Resolves the selected variant for a card's inline picker and syncs its price + quick-buy button. */
function onCardOptionClick(button: HTMLButtonElement): void {
  const card = button.closest<HTMLElement>('[data-js="collection-product-card"]');
  if (!card) return;

  const context = getCardContext(card);
  if (!context) return;

  const position = Number(button.dataset.optionPosition) - 1;
  const value = button.dataset.optionValue ?? '';
  if (position < 0 || !value) return;

  const selectedOptions = cardSelectedOptions.get(card) ?? [];
  selectedOptions[position] = value;
  cardSelectedOptions.set(card, selectedOptions);

  const variant = findVariantByOptions(context.variants, selectedOptions);
  syncCardOptionButtons(card, context.variants, selectedOptions);
  syncCardPrice(card, context, variant);
  syncCardQuickBuyButton(card, variant);
}

const ROOT_SELECTOR = '[data-js="collection-root"]';

/**
 * Range filters: Shopify exposes numeric metafield filters as a list of values. Two range inputs move over
 * those values (sorted numerically) and tick the checkboxes inside the range; the full range clears the filter.
 */
interface RangeParts {
  min: HTMLInputElement;
  max: HTMLInputElement;
  output: HTMLElement | null;
  steps: { value: number; boxes: HTMLInputElement[] }[];
}

function rangeParts(range: HTMLElement): RangeParts | null {
  const min = range.querySelector<HTMLInputElement>('[data-js="collection-range-min"]');
  const max = range.querySelector<HTMLInputElement>('[data-js="collection-range-max"]');
  const options = range.nextElementSibling;
  if (!min || !max || !options) return null;
  const byValue = new Map<number, HTMLInputElement[]>();
  options.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach((box) => {
    const value = Number.parseFloat(box.value);
    if (Number.isNaN(value) || (box.disabled && !box.checked)) return;
    byValue.set(value, [...(byValue.get(value) ?? []), box]);
  });
  const steps = [...byValue.entries()].sort((a, b) => a[0] - b[0]).map(([value, boxes]) => ({ value, boxes }));
  return steps.length > 1 ? { min, max, output: range.querySelector('[data-js="collection-range-output"]'), steps } : null;
}

function paintRange(range: HTMLElement, parts: RangeParts): void {
  const last = parts.steps.length - 1;
  const from = Math.min(Number(parts.min.value), Number(parts.max.value));
  const to = Math.max(Number(parts.min.value), Number(parts.max.value));
  const unit = range.dataset.unit ? ` ${range.dataset.unit}` : '';
  if (parts.output) parts.output.textContent = `${parts.steps[from].value} – ${parts.steps[to].value}${unit}`;
  range.style.setProperty('--range-from', `${(from / last) * 100}%`);
  range.style.setProperty('--range-to', `${(to / last) * 100}%`);
}

/** Price mode: a continuous slider (whole currency units) writing Shopify's native min/max price inputs. */
function priceParts(range: HTMLElement): { min: HTMLInputElement; max: HTMLInputElement; output: HTMLElement | null; gte: HTMLInputElement; lte: HTMLInputElement; top: number } | null {
  const min = range.querySelector<HTMLInputElement>('[data-js="collection-range-min"]');
  const max = range.querySelector<HTMLInputElement>('[data-js="collection-range-max"]');
  const fields = range.nextElementSibling?.querySelectorAll<HTMLInputElement>('input[type="number"]');
  const top = Number(range.dataset.max);
  if (!min || !max || !fields || fields.length < 2 || !top) return null;
  return { min, max, output: range.querySelector('[data-js="collection-range-output"]'), gte: fields[0], lte: fields[1], top };
}

function paintPrice(range: HTMLElement, parts: NonNullable<ReturnType<typeof priceParts>>): void {
  const format = new Intl.NumberFormat(range.dataset.locale || undefined, { style: 'currency', currency: range.dataset.currency || 'EUR', maximumFractionDigits: 0 });
  const from = Number(parts.min.value);
  const to = Number(parts.max.value);
  if (parts.output) parts.output.textContent = `${format.format(from)} – ${format.format(to)}`;
  range.style.setProperty('--range-from', `${(from / parts.top) * 100}%`);
  range.style.setProperty('--range-to', `${(to / parts.top) * 100}%`);
}

function hydrateRanges(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>('[data-js="collection-range"][data-mode="price"]').forEach((range) => {
    const parts = priceParts(range);
    if (!parts) return;
    [parts.min, parts.max].forEach((input) => { input.min = '0'; input.max = String(parts.top); input.step = '1'; });
    parts.min.value = String(Math.floor(Number(parts.gte.value) || 0));
    parts.max.value = String(Math.ceil(Number(parts.lte.value) || parts.top));
    paintPrice(range, parts);
    range.classList.add('is-ready');
  });

  root.querySelectorAll<HTMLElement>('[data-js="collection-range"]:not([data-mode="price"])').forEach((range) => {
    const parts = rangeParts(range);
    if (!parts) return;
    const last = parts.steps.length - 1;
    const checked = parts.steps.map((step, i) => (step.boxes.some(box => box.checked) ? i : -1)).filter(i => i >= 0);
    [parts.min, parts.max].forEach((input) => { input.min = '0'; input.max = String(last); input.step = '1'; });
    parts.min.value = String(checked.length ? checked[0] : 0);
    parts.max.value = String(checked.length ? checked[checked.length - 1] : last);
    paintRange(range, parts);
    range.classList.add('is-ready');
  });
}

/** Live label/track while dragging; keeps the two thumbs from crossing. */
function onRangeInput(input: HTMLInputElement): void {
  const range = input.closest<HTMLElement>('[data-js="collection-range"]');
  if (range?.dataset.mode === 'price') {
    const price = priceParts(range);
    if (!price) return;
    if (Number(price.min.value) > Number(price.max.value)) {
      if (input === price.min) price.min.value = price.max.value;
      else price.max.value = price.min.value;
    }
    paintPrice(range, price);
    return;
  }
  const parts = range ? rangeParts(range) : null;
  if (!range || !parts) return;
  if (Number(parts.min.value) > Number(parts.max.value)) {
    if (input === parts.min) parts.min.value = parts.max.value;
    else parts.max.value = parts.min.value;
  }
  paintRange(range, parts);
}

/** On release: tick the checkboxes inside the range (none when the whole range is selected). */
function applyRange(input: HTMLInputElement): void {
  const range = input.closest<HTMLElement>('[data-js="collection-range"]');
  if (range?.dataset.mode === 'price') {
    const price = priceParts(range);
    if (!price) return;
    // Empty fields = no bound, so the full range clears the price filter.
    price.gte.value = Number(price.min.value) > 0 ? price.min.value : '';
    price.lte.value = Number(price.max.value) < price.top ? price.max.value : '';
    return;
  }
  const parts = range ? rangeParts(range) : null;
  if (!parts) return;
  const from = Number(parts.min.value);
  const to = Number(parts.max.value);
  const full = from === 0 && to === parts.steps.length - 1;
  parts.steps.forEach((step, i) => step.boxes.forEach((box) => { box.checked = !full && i >= from && i <= to; }));
}

interface CollectionView {
  root: HTMLElement;
  sectionId: string;
  controls: HTMLFormElement | null;
  products: HTMLElement | null;
  status: HTMLElement | null;
  error: HTMLElement | null;
  filtersOpenButton: HTMLButtonElement | null;
  filtersDrawer: HTMLElement | null;
  filtersPanel: HTMLElement | null;
}

function queryView(root: HTMLElement): CollectionView {
  return {
    root,
    sectionId: root.dataset.sectionId ?? '',
    controls: root.querySelector<HTMLFormElement>('[data-js="collection-controls"]'),
    products: root.querySelector<HTMLElement>('[data-js="collection-products"]'),
    status: root.querySelector<HTMLElement>('[data-js="collection-status"]'),
    error: root.querySelector<HTMLElement>('[data-js="collection-error"]'),
    filtersOpenButton: root.querySelector<HTMLButtonElement>('[data-js="collection-filters-open"]'),
    filtersDrawer: root.querySelector<HTMLElement>('[data-js="collection-filters-drawer"]'),
    filtersPanel: root.querySelector<HTMLElement>('[data-js="collection-filters-panel"]'),
  };
}

function setStatus(view: CollectionView, message: string): void {
  if (view.status) {
    view.status.textContent = message;
  }
}

function setError(view: CollectionView, message: string): void {
  if (view.error) {
    view.error.textContent = message;
  }
}

function setBusy(view: CollectionView, busy: boolean): void {
  view.root.setAttribute('aria-busy', String(busy));
}

async function runQuickBuy(button: HTMLButtonElement, fallbackUrl: string): Promise<void> {
  const variantId = Number(button.dataset.variantId ?? '');
  if (!variantId) {
    if (fallbackUrl) {
      window.location.assign(fallbackUrl);
    }
    return;
  }

  const idleLabel = button.dataset.labelIdle ?? 'Quick buy';
  const loadingLabel = button.dataset.labelLoading ?? 'Adding...';
  const successLabel = button.dataset.labelSuccess ?? 'Added';
  const errorLabel = button.dataset.labelError ?? 'Try again';

  button.disabled = true;
  button.setAttribute('aria-busy', 'true');
  button.textContent = loadingLabel;

  try {
    if (window.Shopify?.actions) {
      await window.Shopify.actions.updateCart({ lines: [{ merchandiseId: String(variantId), quantity: 1 }] });
      await window.Shopify.actions.openCart();
    } else {
      await addToCart(variantId, 1);
    }

    button.textContent = successLabel;
    window.setTimeout(() => {
      button.textContent = idleLabel;
      button.disabled = false;
      button.setAttribute('aria-busy', 'false');
    }, 1200);
  } catch {
    button.textContent = errorLabel;

    window.setTimeout(() => {
      button.textContent = idleLabel;
      button.disabled = false;
      button.setAttribute('aria-busy', 'false');
    }, 1500);
  }
}

function toUrl(pathOrUrl: string): URL {
  return new URL(pathOrUrl, window.location.origin);
}

function serializeControls(form: HTMLFormElement): URL {
  const actionUrl = toUrl(form.action || window.location.href);
  const params = new URLSearchParams();
  const data = new FormData(form);

  data.forEach((value, key) => {
    const stringValue = String(value).trim();
    if (stringValue.length > 0) {
      params.append(key, stringValue);
    }
  });

  actionUrl.search = params.toString();
  return actionUrl;
}

onReady(() => {
  const initialRoot = document.querySelector<HTMLElement>(ROOT_SELECTOR);
  if (!initialRoot) return;

  let activeRoot: HTMLElement = initialRoot;

  let activeView = queryView(activeRoot);
  if (!activeView.sectionId) return;
  hydrateRanges(activeRoot);

  let activeRequestId = 0;
  let activeController: AbortController | null = null;
  let filtersOpen = false;
  let filtersLastFocused: HTMLElement | null = null;

  const syncActiveView = (nextRoot: HTMLElement): void => {
    activeRoot = nextRoot;
    activeView = queryView(nextRoot);
    hydrateIcons(nextRoot);
    hydrateRanges(nextRoot);

    if (filtersOpen && activeView.filtersDrawer) {
      activeView.filtersDrawer.dataset.open = 'true';
      activeView.filtersOpenButton?.setAttribute('aria-expanded', 'true');
    } else if (filtersOpen) {
      filtersOpen = false;
      document.body.style.overflow = '';
    }
  };

  const openFiltersDrawer = (trigger?: HTMLElement): void => {
    if (!activeView.filtersDrawer) return;

    filtersOpen = true;
    filtersLastFocused = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);

    activeView.filtersDrawer.dataset.open = 'true';
    activeView.filtersOpenButton?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    const focusables = activeView.filtersPanel ? getDialogFocusables(activeView.filtersPanel) : [];
    focusables[0]?.focus();
  };

  const closeFiltersDrawer = (): void => {
    if (!activeView.filtersDrawer || !filtersOpen) return;

    filtersOpen = false;

    activeView.filtersDrawer.dataset.open = 'false';
    activeView.filtersOpenButton?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';

    filtersLastFocused?.focus();
  };

  const fetchNextRoot = async (targetUrl: URL, requestId: number): Promise<HTMLElement> => {
    activeController?.abort();
    activeController = new AbortController();

    const html = await fetchSingleSectionHtml(
      activeView.sectionId,
      `${targetUrl.pathname}${targetUrl.search}`,
      activeController.signal,
    );

    if (requestId !== activeRequestId) {
      throw new DOMException('Stale collection request', 'AbortError');
    }

    const nextRoot = parseSectionRoot(html, ROOT_SELECTOR);
    if (!nextRoot) {
      throw new Error('Collection section parse failed');
    }

    return nextRoot;
  };

  const replaceView = async (targetUrl: URL, pushHistory: boolean): Promise<void> => {
    const requestId = ++activeRequestId;

    setBusy(activeView, true);
    setError(activeView, '');
    setStatus(activeView, 'Loading products...');

    try {
      const nextRoot = await fetchNextRoot(targetUrl, requestId);
      const focusedField = activeRoot.contains(document.activeElement)
        ? (document.activeElement as HTMLInputElement | HTMLSelectElement)
        : null;
      const fieldName = focusedField?.name;
      const fieldValue = focusedField?.value;
      activeRoot.replaceWith(nextRoot);
      syncActiveView(nextRoot);
      if (fieldName) {
        const matchingField = Array.from(nextRoot.querySelectorAll<HTMLInputElement | HTMLSelectElement>('input[name], select[name]'))
          .find(field => field.name === fieldName && field.value === fieldValue);
        matchingField?.focus();
      }

      if (pushHistory) {
        window.history.pushState({ source: 'collection-replace' }, '', `${targetUrl.pathname}${targetUrl.search}`);
      }

      setStatus(activeView, 'Products updated.');
    } catch (errorValue) {
      if (errorValue instanceof DOMException && errorValue.name === 'AbortError') {
        return;
      }

      setError(activeView, 'Could not update collection right now. Please try again.');
      setStatus(activeView, 'Collection update failed.');
    } finally {
      if (requestId === activeRequestId) {
        setBusy(activeView, false);
      }
    }
  };

  const onRootClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;

    const filtersOpenButton = target.closest<HTMLButtonElement>('[data-js="collection-filters-open"]');
    if (filtersOpenButton) {
      event.preventDefault();
      openFiltersDrawer(filtersOpenButton);
      return;
    }

    const filtersCloseButton = target.closest<HTMLButtonElement>('[data-js="collection-filters-close"]');
    if (filtersCloseButton) {
      event.preventDefault();
      closeFiltersDrawer();
      return;
    }

    const filtersOverlay = target.closest<HTMLElement>('[data-js="collection-filters-overlay"]');
    if (filtersOverlay) {
      event.preventDefault();
      closeFiltersDrawer();
      return;
    }

    const cardOptionButton = target.closest<HTMLButtonElement>('[data-js="card-option-value"]');
    if (cardOptionButton) {
      event.preventDefault();
      if (cardOptionButton.disabled) return;
      onCardOptionClick(cardOptionButton);
      return;
    }

    const quickBuyButton = target.closest<HTMLButtonElement>('[data-js="collection-quick-buy"]');
    if (quickBuyButton) {
      event.preventDefault();
      if (quickBuyButton.disabled) return;

      const fallbackUrl = quickBuyButton.dataset.productUrl ?? '';
      void runQuickBuy(quickBuyButton, fallbackUrl);
      return;
    }

    const clearLink = target.closest<HTMLAnchorElement>('[data-js="collection-clear"]');
    if (clearLink) {
      event.preventDefault();
      closeFiltersDrawer();
      void replaceView(toUrl(clearLink.href), true);
      return;
    }

    const filterRemoveLink = target.closest<HTMLAnchorElement>('[data-js="collection-filter-remove"]');
    if (filterRemoveLink) {
      event.preventDefault();
      void replaceView(toUrl(filterRemoveLink.href), true);
      return;
    }

    const paginationLink = target.closest<HTMLAnchorElement>('[data-js="collection-default-pagination"] a');
    if (paginationLink) {
      event.preventDefault();
      void replaceView(toUrl(paginationLink.href), true).then(() => {
        activeView.products?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  const onRootChange = (event: Event): void => {
    const target = event.target as HTMLElement;
    const field = target.closest<HTMLInputElement | HTMLSelectElement>('input, select');
    if (!field || !activeView.controls) return;
    if (field instanceof HTMLInputElement && field.type === 'range') applyRange(field);

    activeView.controls.requestSubmit();
  };

  const onRootSubmit = (event: Event): void => {
    const form = event.target as HTMLFormElement;
    if (!form.matches('[data-js="collection-controls"]')) return;

    event.preventDefault();
    // "Show N products" applies and closes the drawer; filter changes auto-submit and keep it open.
    const submitter = (event as SubmitEvent).submitter;
    if (submitter?.matches('[data-js="collection-filters-apply"]')) closeFiltersDrawer();
    void replaceView(serializeControls(form), true);
  };

  const onDocumentKeyDown = (event: KeyboardEvent): void => {
    if (!filtersOpen || !activeView.filtersPanel) return;
    handleDialogKeyDown(event, activeView.filtersPanel, closeFiltersDrawer);
  };

  document.addEventListener('keydown', onDocumentKeyDown);

  document.addEventListener('click', (event) => {
    if (!activeRoot.contains(event.target as Node)) return;
    onRootClick(event);
  });

  document.addEventListener('change', (event) => {
    if (!activeRoot.contains(event.target as Node)) return;
    onRootChange(event);
  });

  document.addEventListener('input', (event) => {
    if (event.target instanceof HTMLInputElement && event.target.type === 'range' && activeRoot.contains(event.target)) onRangeInput(event.target);
  });

  document.addEventListener('submit', (event) => {
    if (!activeRoot.contains(event.target as Node)) return;
    onRootSubmit(event);
  });

  window.addEventListener('popstate', () => {
    void replaceView(toUrl(window.location.href), false);
  });

  document.addEventListener('shopify:section:load', (event) => {
    if (!(event.target instanceof Element)) return;
    const nextRoot = event.target.querySelector<HTMLElement>(ROOT_SELECTOR);
    if (!nextRoot) return;
    activeController?.abort();
    activeRequestId++;
    filtersOpen = false;
    document.body.style.overflow = '';
    syncActiveView(nextRoot);
  });
});
