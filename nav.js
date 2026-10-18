// Sliding highlight for the floating nav: rests on the current page, follows hover and focus
(function () {
  const header = document.querySelector('.site-header');
  const nav = header && header.querySelector('nav.anchors');
  if (!nav) return;
  const indicator = nav.querySelector('.nav-indicator');
  const links = [...nav.querySelectorAll(':scope > a, .nav-trigger')];
  const current = nav.querySelector('a[aria-current="page"]');

  const moveTo = (link) => {
    if (!link) { indicator.style.opacity = '0'; return; }
    // Measure against the nav itself (the connect button sits inside its own wrapper)
    const navBox = nav.getBoundingClientRect();
    const box = link.getBoundingClientRect();
    indicator.style.left = (box.left - navBox.left - nav.clientLeft) + 'px';
    indicator.style.width = box.width + 'px';
    indicator.style.opacity = '1';
  };

  // Place it on the current page without animating in from the left
  indicator.style.transition = 'none';
  moveTo(current);
  indicator.offsetWidth;
  indicator.style.transition = '';

  links.forEach((link) => {
    link.addEventListener('mouseenter', () => moveTo(link));
    link.addEventListener('focus', () => moveTo(link));
  });
  nav.addEventListener('mouseleave', () => { if (!nav.querySelector('.nav-menu.is-open')) moveTo(current); });
  nav.addEventListener('focusout', (e) => { if (!nav.contains(e.relatedTarget)) moveTo(current); });
  window.addEventListener('resize', () => moveTo(current));
  if (document.fonts) document.fonts.ready.then(() => moveTo(current));

  // Connect dropdown: opens on click/tap or hover, closes on outside click and Escape
  const menu = nav.querySelector('.nav-menu');
  if (menu) {
    const trigger = menu.querySelector('.nav-trigger');
    const items = [...menu.querySelectorAll('.nav-dropdown a')];
    let closeTimer;
    const setOpen = (open) => {
      clearTimeout(closeTimer);
      menu.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
      moveTo(open ? trigger : current);
    };
    trigger.addEventListener('click', () => setOpen(!menu.classList.contains('is-open')));
    if (window.matchMedia('(hover: hover)').matches) {
      menu.addEventListener('mouseenter', () => setOpen(true));
      menu.addEventListener('mouseleave', () => { closeTimer = setTimeout(() => setOpen(false), 180); });
    }
    document.addEventListener('click', (e) => { if (!menu.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setOpen(false); trigger.focus(); }
    });
    menu.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      if (!menu.classList.contains('is-open')) setOpen(true);
      const i = items.indexOf(document.activeElement);
      const next = e.key === 'ArrowDown' ? (i + 1) % items.length : (i <= 0 ? items.length - 1 : i - 1);
      items[next].focus();
    });
    menu.addEventListener('focusout', (e) => { if (!menu.contains(e.relatedTarget)) setOpen(false); });
  }

  // Slightly lift the pill once the page scrolls
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
