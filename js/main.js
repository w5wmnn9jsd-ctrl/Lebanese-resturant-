(() => {
  'use strict';

  /* ---------- Hero glyph parallax ---------- */
  const heroSection = document.getElementById('hero');
  const heroGlyph = document.getElementById('hero-glyph');
  const canParallax = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (heroSection && heroGlyph && canParallax) {
    let ticking = false;
    let lastEvent = null;
    heroSection.addEventListener('pointermove', (e) => {
      lastEvent = e;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = heroSection.getBoundingClientRect();
        const relX = (lastEvent.clientX - rect.left) / rect.width - 0.5;
        const relY = (lastEvent.clientY - rect.top) / rect.height - 0.5;
        heroGlyph.style.transform = `rotate(${-6 + relX * 3}deg) translate(${relX * -14}px, ${relY * -10}px)`;
        ticking = false;
      });
    });
    heroSection.addEventListener('pointerleave', () => {
      heroGlyph.style.transform = 'rotate(-6deg)';
    });
  }

  /* ---------- Sticky header ---------- */
  const header = document.getElementById('site-header');
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 40);
    backToTop.classList.toggle('is-visible', window.scrollY > 600);
  };

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const primaryNav = document.getElementById('primary-nav');

  const closeNav = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    primaryNav.classList.remove('is-open');
    document.body.style.overflow = '';
  };
  const openNav = () => {
    navToggle.setAttribute('aria-expanded', 'true');
    primaryNav.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };
  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeNav() : openNav();
  });
  primaryNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNav);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
      io.observe(el);
    });
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Menu tabs (ARIA tablist pattern, animated filter) ---------- */
  const tabs = Array.from(document.querySelectorAll('.menu-tab'));
  const panels = Array.from(document.querySelectorAll('.menu-panel'));
  const tabIndicator = document.querySelector('.tab-indicator');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LEAVE_MS = prefersReducedMotion ? 0 : 180;

  function moveIndicator(tab) {
    if (!tabIndicator) return;
    tabIndicator.style.top = `${tab.offsetTop}px`;
    tabIndicator.style.left = `${tab.offsetLeft}px`;
    tabIndicator.style.width = `${tab.offsetWidth}px`;
    tabIndicator.style.height = `${tab.offsetHeight}px`;
  }

  function activateTab(tab) {
    if (tab.classList.contains('is-active')) return;

    tabs.forEach((t) => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
    });
    moveIndicator(tab);

    const targetPanel = panels.find((p) => p.id === tab.getAttribute('aria-controls'));
    const outgoingPanel = panels.find((p) => p.classList.contains('is-active') && p !== targetPanel);

    const reveal = () => {
      panels.forEach((p) => p.classList.remove('is-leaving'));
      if (outgoingPanel) {
        outgoingPanel.classList.remove('is-active');
        outgoingPanel.setAttribute('hidden', '');
      }
      targetPanel.removeAttribute('hidden');
      targetPanel.classList.add('is-active');
    };

    if (outgoingPanel && !prefersReducedMotion) {
      outgoingPanel.classList.add('is-leaving');
      window.setTimeout(reveal, LEAVE_MS);
    } else {
      reveal();
    }
  }

  // Set the indicator's initial position (no transition on first paint)
  const initialTab = document.querySelector('.menu-tab.is-active');
  if (initialTab && tabIndicator) {
    tabIndicator.style.transition = 'none';
    moveIndicator(initialTab);
    requestAnimationFrame(() => {
      tabIndicator.style.transition = '';
    });
  }
  window.addEventListener('resize', () => {
    const active = document.querySelector('.menu-tab.is-active');
    if (active) moveIndicator(active);
  });

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(tab));
    tab.addEventListener('keydown', (e) => {
      let target = null;
      if (e.key === 'ArrowRight') target = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft') target = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') target = tabs[0];
      if (e.key === 'End') target = tabs[tabs.length - 1];
      if (target) {
        e.preventDefault();
        target.focus();
        activateTab(target);
      }
    });
  });

  /* ---------- Reservation form ---------- */
  const form = document.getElementById('reservation-form');
  const status = document.getElementById('form-status');

  const validators = {
    name: (v) => v.trim().length > 1 || 'Please enter your name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Please enter a valid email.',
    phone: (v) => v.trim().length >= 6 || 'Please enter a valid phone number.',
    date: (v) => v.trim().length > 0 || 'Please choose a date.',
    time: (v) => v.trim().length > 0 || 'Please choose a time.',
    guests: (v) => v.trim().length > 0 || 'Please select party size.',
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.textContent = '';
    status.classList.remove('is-error');

    let firstInvalid = null;
    let valid = true;

    Object.keys(validators).forEach((field) => {
      const input = form.elements[field];
      const errorEl = document.getElementById(`err-${field}`);
      const result = validators[field](input.value);
      if (result !== true) {
        valid = false;
        if (errorEl) errorEl.textContent = result;
        input.setAttribute('aria-invalid', 'true');
        if (!firstInvalid) firstInvalid = input;
      } else if (errorEl) {
        errorEl.textContent = '';
        input.removeAttribute('aria-invalid');
      }
    });

    if (!valid) {
      status.textContent = 'Please fix the highlighted fields.';
      status.classList.add('is-error');
      firstInvalid && firstInvalid.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    status.textContent = `Thank you, ${data.name.split(' ')[0]} — your table for ${data.guests} on ${data.date} at ${data.time} is requested. We'll confirm by email shortly.`;
    status.setAttribute('tabindex', '-1');
    status.focus();
    form.reset();
  });

  /* ---------- Hours: open badge + highlight today ---------- */
  const openBadge = document.getElementById('open-badge');
  const rows = document.querySelectorAll('.hours-table tr[data-days]');

  const schedule = {
    0: [13 * 60, 22 * 60],
    1: [12 * 60, 23 * 60],
    2: [12 * 60, 23 * 60],
    3: [12 * 60, 23 * 60],
    4: [12 * 60, 23 * 60],
    5: [12 * 60, 24 * 60 + 30],
    6: [12 * 60, 24 * 60 + 30],
  };

  function updateHours() {
    const now = new Date();
    const day = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const [open, close] = schedule[day];
    const isOpen = minutes >= open && minutes < close;

    if (openBadge) {
      openBadge.textContent = isOpen ? 'Open now' : 'Closed now';
      openBadge.classList.toggle('is-closed', !isOpen);
    }
    rows.forEach((row) => {
      const days = row.dataset.days.split(',').map(Number);
      row.classList.toggle('is-today', days.includes(day));
    });
  }
  updateHours();

  /* ---------- Back to top ---------- */
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
