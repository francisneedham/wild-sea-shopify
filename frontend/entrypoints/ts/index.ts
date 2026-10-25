import { onReady } from './utils/ready';

// Home hero: background video fades in once YouTube reports playback; film opens in a modal dialog.
const YOUTUBE_ORIGINS = ['https://www.youtube.com', 'https://www.youtube-nocookie.com'];

function initHeroVideo(): void {
  const frame = document.querySelector<HTMLIFrameElement>('[data-js="hero-video"]');
  if (!frame) return;
  const subscribe = (): void => {
    frame.contentWindow?.postMessage(JSON.stringify({ event: 'listening', id: 'hero-video' }), 'https://www.youtube.com');
  };
  const timer = window.setInterval(subscribe, 2500);
  frame.addEventListener('load', subscribe);
  window.addEventListener('message', (event) => {
    if (!YOUTUBE_ORIGINS.includes(event.origin) || event.source !== frame.contentWindow) return;
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      const playing =
        (data.event === 'onStateChange' && data.info === 1) ||
        (['infoDelivery', 'initialDelivery'].includes(data.event) && data.info?.playerState === 1);
      if (playing) {
        frame.classList.add('is-playing');
        window.clearInterval(timer);
      }
    } catch {
      // Non-JSON message from the player; ignore.
    }
  });
}

function initHeroFilm(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-js="hero-film"]');
  const frameRoot = dialog?.querySelector<HTMLElement>('[data-js="hero-film-frame"]');
  if (!dialog || !frameRoot) return;
  document.querySelector('[data-js="hero-film-open"]')?.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${dialog.dataset.videoId}?autoplay=1&rel=0`;
    iframe.title = dialog.getAttribute('aria-label') ?? '';
    iframe.allow = 'autoplay; encrypted-media; fullscreen';
    iframe.allowFullscreen = true;
    frameRoot.replaceChildren(iframe);
    dialog.showModal();
  });
  dialog.querySelector('[data-js="hero-film-close"]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  // Stop playback on close.
  dialog.addEventListener('close', () => frameRoot.replaceChildren());
}

const init = (): void => {
  initHeroVideo();
  initHeroFilm();
};

onReady(init);

document.addEventListener('shopify:section:load', init);
