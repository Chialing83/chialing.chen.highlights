// Clips load and play only once they are near the viewport, so opening a page
// does not download every clip on it up front
(function () {
  const clips = [].slice.call(document.querySelectorAll('video'));
  if (!clips.length) return;

  // Respect reduced motion: leave the clips paused and let the reader start them
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    clips.forEach((v) => { v.controls = true; });
    return;
  }

  // A screen of lead time, so a clip is ready by the time it scrolls into view
  const MARGIN = 600;

  const start = (v) => {
    if (v.preload !== 'auto') v.preload = 'auto';
    if (!v.paused) return;
    const playing = v.play();
    if (playing && playing.catch) playing.catch(() => {});
  };

  const sync = () => {
    const h = window.innerHeight || document.documentElement.clientHeight;
    clips.forEach((v) => {
      const box = v.getBoundingClientRect();
      const near = box.bottom > -MARGIN && box.top < h + MARGIN;
      if (near) {
        start(v);
      } else if (!v.paused) {
        v.pause();
      }
    });
  };

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; sync(); });
  };

  sync();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', sync);

  // Second trigger, in case the scroll handler never runs. It only ever starts
  // a clip; pausing stays with sync() so the two cannot fight each other.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) start(entry.target); });
    }, { rootMargin: MARGIN + 'px 0px' });
    clips.forEach((v) => io.observe(v));
  }
})();

// Subtle scroll reveal: sections, cards and timeline rows fade up as they enter the viewport
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  const groups = [
    ['main > section > h2, .page-head', 0],
    ['.card--hero', 0],
    ['.cards > .card', 80],
    ['.timeline > li', 60],
    ['.more', 0],
    ['.case-hero, .case-head, .case-meta', 80],
    ['.case-section > h2, .case-text, .case-stats, .case-list', 0],
    ['.case-figure', 0],
    ['.cta > *', 60],
    ['footer > *', 60],
  ];
  const items = [];
  groups.forEach(([selector, step]) => {
    // Stagger siblings within the same parent
    const byParent = new Map();
    document.querySelectorAll(selector).forEach((el) => {
      const list = byParent.get(el.parentElement) || [];
      list.push(el);
      byParent.set(el.parentElement, list);
    });
    byParent.forEach((list) => list.forEach((el, i) => {
      el.classList.add('reveal');
      el.style.setProperty('--reveal-delay', Math.min(i * step, 360) + 'ms');
      items.push(el);
    }));
  });

  document.documentElement.classList.add('reveal-ready');

  // Reveal anything already in or near the viewport. Measuring rectangles works
  // everywhere, so content is never left invisible when the observer below does
  // not report. A missed animation is recoverable, a blank page is not.
  const MARGIN = 80;
  const sync = () => {
    const h = window.innerHeight || document.documentElement.clientHeight;
    for (let i = items.length - 1; i >= 0; i--) {
      const box = items[i].getBoundingClientRect();
      if (box.top < h + MARGIN && box.bottom > -MARGIN) {
        items[i].classList.add('is-visible');
        items.splice(i, 1);
      }
    }
  };

  let queued = false;
  const onScroll = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; sync(); });
  };

  sync();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', sync);

  // The observer is the cheaper path once the page is running. It only ever
  // reveals, so it cannot fight sync() above.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { rootMargin: MARGIN + 'px 0px', threshold: 0 });
    items.slice().forEach((el) => io.observe(el));
  }
})();
