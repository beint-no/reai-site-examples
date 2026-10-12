export function installFashionZoom(nb) {
  const t = (a, b) => nb ? a : b;
  const opener = document.querySelector('[data-fashion-zoom]');
  if (!opener) return;
  const el = (tag, text) => { const node = document.createElement(tag); if (text) node.textContent = text; return node; };
  const dialog = el('dialog'); dialog.className = 'fashion-image-viewer'; dialog.setAttribute('aria-labelledby', 'fashion-image-title');
  const header = el('header'), title = el('h2', t('Produktbilder', 'Product images')); title.id = 'fashion-image-title';
  const close = el('button', t('Lukk', 'Close')); close.type = 'button'; close.addEventListener('click', () => dialog.close());
  header.append(title, close);
  const panel = el('div'); panel.className = 'fashion-image-panel'; panel.tabIndex = 0; panel.setAttribute('role', 'region'); panel.setAttribute('aria-label', t('Bilde. Rull for å se detaljer ved zoom.', 'Image. Scroll to see details when zoomed.'));
  const image = el('img'); panel.append(image);
  const toggle = el('button'); toggle.type = 'button';
  const caption = el('p'); caption.setAttribute('role', 'status');
  const thumbs = el('nav'); thumbs.setAttribute('aria-label', t('Velg bilde', 'Choose image'));
  const items = [...document.querySelectorAll('[data-fashion-image]')].map((button) => ({ src: button.querySelector('img').src, alt: button.querySelector('img').alt }));
  let zoomed = false, selected = 0;
  function zoom(value) {
    zoomed = value; panel.classList.toggle('is-zoomed', value); toggle.setAttribute('aria-pressed', String(value)); toggle.textContent = value ? t('Vis hele bildet', 'Fit whole image') : t('Zoom inn', 'Zoom in');
    panel.scrollTop = 0; panel.scrollLeft = 0;
  }
  function select(index) {
    selected = index; image.src = items[index].src; image.alt = items[index].alt; zoom(false);
    [...thumbs.children].forEach((b, i) => b.setAttribute('aria-pressed', String(i === selected)));
    caption.textContent = `${t('Bilde', 'Image')} ${index + 1} / ${items.length} · ${items[index].alt}`;
  }
  items.forEach((item, index) => {
    const button = el('button'), preview = el('img'); button.type = 'button'; button.setAttribute('aria-label', t('Se bilde ', 'View image ') + (index + 1)); preview.src = item.src; preview.alt = ''; preview.loading = 'lazy'; button.append(preview); button.addEventListener('click', () => select(index)); thumbs.append(button);
  });
  toggle.addEventListener('click', () => zoom(!zoomed));
  dialog.append(header, panel, toggle, caption, thumbs); document.body.append(dialog);
  opener.addEventListener('click', () => { const main = document.querySelector('[data-fashion-main-image] img'); select(Math.max(0, items.findIndex((item) => item.src === main.src))); dialog.showModal(); });
  dialog.addEventListener('close', () => opener.focus());
}
