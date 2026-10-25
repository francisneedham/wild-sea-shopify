/** Runs `fn` once the DOM is parsed. Modules can evaluate after DOMContentLoaded (e.g. Vite dev dep optimisation). */
export function onReady(fn: () => void): void {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
  else fn();
}
