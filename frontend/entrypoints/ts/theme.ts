import 'vite/modulepreload-polyfill';
import { hydrateIcons } from './utils/icons';
import { initMotion, initParallax, initReveal } from './utils/motion';
import { onReady } from './utils/ready';

const init = (): void => {
  hydrateIcons();
  initMotion();
  if (document.querySelector('[data-slideshow]')) {
    void import('./utils/slideshow').then(({ initSlideshows }) => initSlideshows());
  }
  // Generic carousels (section-owned galleries set data-carousel-owned and init themselves).
  if (document.querySelector('[data-carousel]:not([data-carousel-owned])')) {
    void import('./utils/carousel').then(({ initCarousels }) => initCarousels());
  }
  const syncHeader = (): void => {
    const header = document.querySelector<HTMLElement>('[data-js="site-header"]');
    if (header) header.dataset.scrolled = String(window.scrollY > 40);
  };
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });
  const closeMobileMenu = (): void => {
    document.querySelector<HTMLDetailsElement>('[data-js="mobile-menu"]')?.removeAttribute('open');
  };
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('[data-js="mobile-menu-close"]')) closeMobileMenu();
    // Generic modal: [data-dialog-open="id"] opens <dialog data-dialog id>; [data-dialog-close] or a backdrop click closes it.
    // Scoped to dialog[data-dialog] so cart/search drawers keep their own open/close logic.
    const opener = event.target.closest<HTMLElement>('[data-dialog-open]');
    const target = opener ? document.getElementById(opener.dataset.dialogOpen ?? '') : null;
    if (target instanceof HTMLDialogElement && target.hasAttribute('data-dialog')) target.showModal();
    const dialog = event.target.closest('dialog[data-dialog]');
    if (dialog instanceof HTMLDialogElement && (event.target === dialog || event.target.closest('[data-dialog-close]'))) dialog.close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileMenu();
  });
  const hasCartDrawer = document.querySelector('[data-js="cart-drawer"]');
  const hasCartTrigger = document.querySelector('[data-js="cart-open"]');
  const hasSearchDrawer = document.querySelector('[data-js="search-drawer"]');
  const hasSearchTrigger = document.querySelector('[data-js="search-open"]');

  if (hasCartDrawer || hasCartTrigger) {
    void import('./cart/drawer').then(({ initCartDrawer }) => {
      initCartDrawer();
    });
  }

  if (hasSearchDrawer || hasSearchTrigger) {
    void import('./search/drawer').then(({ initSearchDrawer }) => {
      initSearchDrawer();
    });
  }
};

onReady(init);

document.addEventListener('shopify:section:load', (event) => {
  if (event.target instanceof Element) {
    hydrateIcons(event.target);
    initReveal(event.target);
    initParallax(event.target);
    const target = event.target;
    if (target.querySelector('[data-carousel]:not([data-carousel-owned])')) {
      void import('./utils/carousel').then(({ initCarousels }) => initCarousels(target));
    }
  }
  const header = document.querySelector<HTMLElement>('[data-js="site-header"]');
  if (header) header.dataset.scrolled = String(window.scrollY > 40);
});
