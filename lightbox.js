// Lightbox for case study media: click any image or clip to view it large,
// zoom images with the buttons, a click, the +/- keys or ctrl/pinch-scroll, and drag to pan.
(function () {
  const items = [...document.querySelectorAll('.case-hero video, .case-figure img, .case-figure video, .exp-media img, .exp-media video')];
  if (!items.length) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Media viewer');
  dialog.innerHTML = `
    <div class="lightbox__bar">
      <span class="lightbox__count" aria-live="polite"></span>
      <div class="lightbox__tools">
        <button type="button" class="lightbox__btn" data-act="out" aria-label="Zoom out">−</button>
        <button type="button" class="lightbox__btn lightbox__zoom" data-act="reset" aria-label="Reset zoom">100%</button>
        <button type="button" class="lightbox__btn" data-act="in" aria-label="Zoom in">+</button>
        <button type="button" class="lightbox__btn" data-act="close" aria-label="Close">✕</button>
      </div>
    </div>
    <div class="lightbox__stage"></div>
    <button type="button" class="lightbox__nav lightbox__nav--prev" data-act="prev" aria-label="Previous">‹</button>
    <button type="button" class="lightbox__nav lightbox__nav--next" data-act="next" aria-label="Next">›</button>
    <p class="lightbox__caption"></p>`;
  document.body.appendChild(dialog);

  const stage = dialog.querySelector('.lightbox__stage');
  const caption = dialog.querySelector('.lightbox__caption');
  const count = dialog.querySelector('.lightbox__count');
  const zoomLabel = dialog.querySelector('.lightbox__zoom');
  const zoomBtns = dialog.querySelectorAll('[data-act="in"], [data-act="out"], [data-act="reset"]');
  const STEPS = [1, 1.5, 2, 3, 4];
  let index = 0;
  let zoom = 1;
  let media = null;

  const captionFor = (el) => {
    const fig = el.closest('figure');
    const cap = fig && fig.querySelector('figcaption');
    return (cap && cap.textContent.trim()) || el.getAttribute('alt') || el.getAttribute('aria-label') || '';
  };

  const applyZoom = (originX, originY) => {
    if (!media || media.tagName !== 'IMG') return;
    const prevW = media.offsetWidth;
    stage.classList.toggle('is-zoomed', zoom > 1);
    media.style.width = zoom > 1 ? `${Math.round(stage.clientWidth * zoom)}px` : '';
    zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
    // Keep the point under the cursor (or the center) in place while zooming
    const ratio = media.offsetWidth / (prevW || 1);
    const ox = originX ?? stage.clientWidth / 2;
    const oy = originY ?? stage.clientHeight / 2;
    stage.scrollLeft = (stage.scrollLeft + ox) * ratio - ox;
    stage.scrollTop = (stage.scrollTop + oy) * ratio - oy;
  };

  const step = (dir, x, y) => {
    const i = STEPS.indexOf(zoom);
    const next = STEPS[Math.min(STEPS.length - 1, Math.max(0, (i === -1 ? 0 : i) + dir))];
    if (next !== zoom) { zoom = next; applyZoom(x, y); }
  };

  const show = (i) => {
    index = (i + items.length) % items.length;
    const src = items[index];
    stage.innerHTML = '';
    zoom = 1;
    stage.classList.remove('is-zoomed');
    if (src.tagName === 'IMG') {
      media = document.createElement('img');
      media.src = src.currentSrc || src.src;
      media.alt = src.alt || '';
      media.draggable = false;
    } else {
      media = document.createElement('video');
      media.src = src.currentSrc || src.src;
      media.controls = true;
      media.loop = true;
      media.muted = true;
      media.playsInline = true;
      media.autoplay = true;
    }
    stage.appendChild(media);
    const isImg = media.tagName === 'IMG';
    zoomBtns.forEach((b) => { b.hidden = !isImg; });
    zoomLabel.textContent = '100%';
    caption.textContent = captionFor(src);
    count.textContent = `${index + 1} / ${items.length}`;
  };

  const open = (i) => {
    show(i);
    document.documentElement.classList.add('lightbox-open');
    dialog.showModal();
  };
  const close = () => dialog.close();
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('lightbox-open');
    stage.innerHTML = '';
    media = null;
    const src = items[index];
    if (src) src.focus({ preventScroll: true });
  });

  // Make every asset an obvious, keyboard-reachable trigger
  items.forEach((el, i) => {
    el.classList.add('is-zoomable');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', `View larger: ${captionFor(el)}`);
    el.addEventListener('click', () => open(i));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });

  dialog.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]');
    if (act) {
      const a = act.dataset.act;
      if (a === 'close') close();
      else if (a === 'prev') show(index - 1);
      else if (a === 'next') show(index + 1);
      else if (a === 'in') step(1);
      else if (a === 'out') step(-1);
      else if (a === 'reset') { zoom = 1; applyZoom(); }
      return;
    }
    // Clicking the backdrop or empty stage closes; clicking the image toggles zoom
    if (e.target === media && media.tagName === 'IMG') {
      if (moved) return;
      const r = stage.getBoundingClientRect();
      if (zoom > 1) { zoom = 1; applyZoom(); } else { zoom = 2; applyZoom(e.clientX - r.left, e.clientY - r.top); }
      return;
    }
    if (e.target === dialog || e.target === stage) close();
  });

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    else if (e.key === '+' || e.key === '=') step(1);
    else if (e.key === '-') step(-1);
    else if (e.key === '0') { zoom = 1; applyZoom(); }
  });

  // Ctrl/⌘ + scroll or trackpad pinch zooms around the pointer
  stage.addEventListener('wheel', (e) => {
    if (!media || media.tagName !== 'IMG' || !(e.ctrlKey || e.metaKey)) return;
    e.preventDefault();
    const r = stage.getBoundingClientRect();
    step(e.deltaY < 0 ? 1 : -1, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });

  // Drag to pan when zoomed in
  let dragging = false;
  let moved = false;
  let sx = 0, sy = 0, sl = 0, st = 0;
  stage.addEventListener('pointerdown', (e) => {
    moved = false;
    if (zoom <= 1 || e.button !== 0) return;
    dragging = true;
    sx = e.clientX; sy = e.clientY; sl = stage.scrollLeft; st = stage.scrollTop;
    stage.classList.add('is-dragging');
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
    stage.scrollLeft = sl - dx;
    stage.scrollTop = st - dy;
  });
  window.addEventListener('pointerup', () => {
    dragging = false;
    stage.classList.remove('is-dragging');
  });
})();
