// Subtle scroll reveal: sections, cards and timeline rows fade up as they enter the viewport
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Respect reduced motion: stop looping clips and show their controls instead
    document.querySelectorAll('video[autoplay]').forEach((v) => { v.pause(); v.removeAttribute('autoplay'); v.controls = true; });
    return;
  }
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

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  document.documentElement.classList.add('reveal-ready');
  items.forEach((el) => io.observe(el));

  // Safety net: at the very bottom of the page, show anything still waiting
  const revealRest = () => {
    if (window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 4) return;
    items.forEach((el) => { el.classList.add('is-visible'); io.unobserve(el); });
    window.removeEventListener('scroll', revealRest);
  };
  window.addEventListener('scroll', revealRest, { passive: true });
})();
