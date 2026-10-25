// Destination pages (metaobject templates): anchor bar active state, gallery filters and lightbox.
import { onReady } from './utils/ready';

function initAnchorNav(root: ParentNode = document): void {
  const nav = root.querySelector<HTMLElement>('[data-js="destination-nav"]');
  if (!nav) return;
  const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
    .map(link => ({ link, section: document.getElementById(decodeURIComponent(link.hash.slice(1))) }))
    .filter((item): item is { link: HTMLAnchorElement; section: HTMLElement } => item.section !== null);
  if (!links.length) return;

  let activeId = '';
  let frame = 0;
  const update = (): void => {
    frame = 0;
    const threshold = nav.getBoundingClientRect().bottom + 28;
    let active = links[0];
    for (const item of links) {
      if (item.section.getBoundingClientRect().top <= threshold) active = item;
      else break;
    }
    if (active.section.id === activeId) return;
    activeId = active.section.id;
    links.forEach(({ link }) => {
      const current = link === active.link;
      link.classList.toggle('is-active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    // Keep the active link visible in the horizontally scrolling bar.
    const scroller = active.link.parentElement;
    if (scroller) scroller.scrollTo({ left: active.link.offsetLeft - 20, behavior: 'smooth' });
  };
  const schedule = (): void => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
}

function initGallery(root: HTMLElement): void {
  const photos = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-js="gallery-photo"]'));
  const filters = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-js="gallery-filter"]'));
  const count = root.querySelector<HTMLElement>('[data-js="gallery-count"]');
  const dialog = root.querySelector<HTMLDialogElement>('[data-js="gallery-lightbox"]');
  const image = dialog?.querySelector<HTMLImageElement>('[data-js="gallery-lightbox-image"]');
  const caption = dialog?.querySelector<HTMLElement>('[data-js="gallery-lightbox-caption"]');
  const index = dialog?.querySelector<HTMLElement>('[data-js="gallery-lightbox-index"]');
  let current = 0;

  const visible = (): HTMLButtonElement[] => photos.filter(photo => !photo.hidden);

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      const group = filter.dataset.group ?? '';
      filters.forEach(btn => btn.setAttribute('aria-pressed', String(btn === filter)));
      photos.forEach((photo) => { photo.hidden = Boolean(group) && photo.dataset.group !== group; });
      if (count) count.textContent = `${visible().length} photographs`;
    });
  });

  const show = (position: number): void => {
    const list = visible();
    if (!list.length || !image) return;
    current = (position + list.length) % list.length;
    const photo = list[current];
    const source = photo.querySelector('img');
    // Reuse the tile srcset with a lightbox-sized `sizes`, so the browser fetches the large file.
    if (source) {
      image.srcset = source.srcset;
      image.sizes = '(min-width: 1200px) 1150px, 100vw';
      image.src = source.src;
      image.alt = source.alt;
    }
    if (caption) caption.textContent = photo.dataset.caption ?? '';
    if (index) index.textContent = `${current + 1} / ${list.length}`;
  };

  photos.forEach((photo) => {
    photo.addEventListener('click', () => {
      show(visible().indexOf(photo));
      dialog?.showModal();
    });
  });
  dialog?.querySelector('[data-js="gallery-prev"]')?.addEventListener('click', () => show(current - 1));
  dialog?.querySelector('[data-js="gallery-next"]')?.addEventListener('click', () => show(current + 1));
  dialog?.querySelector('[data-js="gallery-close"]')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });
}

const init = (root: ParentNode = document): void => {
  initAnchorNav(root);
  root.querySelectorAll<HTMLElement>('[data-js="destination-gallery"]').forEach(initGallery);
};

onReady(() => init());

document.addEventListener('shopify:section:load', (event) => {
  if (event.target instanceof Element) init(event.target);
});
