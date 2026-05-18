document.addEventListener('DOMContentLoaded', () => {
  syncMotionPreference();
  setupNavigation();
  initHeroSlider();
  initLightbox();
  initFilters();
  initContactBriefingForm();
  primeRevealTargets();
  initRevealAnimations();
});

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function syncMotionPreference() {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const applyPreference = () => {
    document.documentElement.classList.toggle('reduced-motion', motionQuery.matches);
  };

  applyPreference();

  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', applyPreference);
    return;
  }

  if (motionQuery.addListener) {
    motionQuery.addListener(applyPreference);
  }
}

function setupNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.primary-nav');
  const header = document.querySelector('.site-header');
  const navLinks = Array.from(nav?.querySelectorAll('a') ?? []);
  const dropdowns = Array.from(document.querySelectorAll('.nav-item-dropdown'));
  const syncNavState = (isOpen) => {
    nav?.classList.toggle('open', isOpen);
    nav?.setAttribute('aria-hidden', (!isOpen).toString());
    header?.classList.toggle('nav-open', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
  };
  const updateToggleState = (isOpen) => {
    toggle?.setAttribute('aria-expanded', isOpen.toString());
    toggle?.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    if (toggle) {
      toggle.textContent = isOpen ? 'Fechar' : 'Menu';
    }
  };

  const closeNav = () => {
    syncNavState(false);
    updateToggleState(false);
    dropdowns.forEach((d) => {
      d.classList.remove('open');
      d.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    });
  };

  syncNavState(false);
  updateToggleState(false);

  toggle?.addEventListener('click', () => {
    const isOpen = !nav?.classList.contains('open');
    syncNavState(!!isOpen);
    updateToggleState(!!isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (nav?.classList.contains('open')) {
        closeNav();
      }
    });
  });

  dropdowns.forEach((dropdown) => {
    const trigger = dropdown.querySelector('.dropdown-toggle');
    if (!trigger) return;
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.toggle('open');
      trigger.setAttribute('aria-expanded', isOpen.toString());
      dropdowns.forEach((other) => {
        if (other !== dropdown) {
          other.classList.remove('open');
          other.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
        }
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!(e.target instanceof Element)) return;
    if (nav?.classList.contains('open')) {
      const insideNav = e.target.closest('.primary-nav');
      const insideToggle = e.target.closest('.nav-toggle');
      if (!insideNav && !insideToggle) {
        closeNav();
        toggle?.focus();
        return;
      }
    }

    if (!dropdowns.length) return;
    const inside = e.target.closest('.nav-item-dropdown');
    if (!inside) {
      dropdowns.forEach((d) => {
        d.classList.remove('open');
        d.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav?.classList.contains('open')) {
      closeNav();
      toggle?.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      closeNav();
    }
  });

  if (header) {
    const onScroll = () => {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll);
  }
}

function initHeroSlider() {
  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  if (!slides.length) return;

  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  const next = document.querySelector('.hero-next');
  const prev = document.querySelector('.hero-prev');
  const hero = document.querySelector('.hero');
  const reducedMotion = prefersReducedMotion();
  let current = 0;
  let timer = null;
  let resumeTimer = null;
  const AUTOPLAY_MS = 9000;
  const PAUSE_MS = 7000;

  const setSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => {
      const isActive = idx === current;
      slide.classList.toggle('active', isActive);
      slide.classList.toggle('is-active', isActive);
    });
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === current));
  };

  const nextSlide = () => setSlide(current + 1);
  const prevSlide = () => setSlide(current - 1);

  const startTimer = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(nextSlide, AUTOPLAY_MS);
  };

  const pauseTimer = () => {
    if (timer) clearInterval(timer);
    if (resumeTimer) clearTimeout(resumeTimer);
    if (reducedMotion || slides.length <= 1) return;
    resumeTimer = setTimeout(startTimer, PAUSE_MS);
  };

  next?.addEventListener('click', () => {
    nextSlide();
    pauseTimer();
  });

  prev?.addEventListener('click', () => {
    prevSlide();
    pauseTimer();
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      setSlide(idx);
      pauseTimer();
    });
  });

  setSlide(0);

  if (!reducedMotion && slides.length > 1) {
    startTimer();
  }

  // Touch swipe support for the hero slider.
  if (hero && slides.length > 1) {
    let startX = 0;
    let startY = 0;
    let isTouching = false;
    const SWIPE_THRESHOLD = 50;
    const DIRECTION_RATIO = 1.2;

    hero.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1) return;
        isTouching = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      },
      { passive: true }
    );

    hero.addEventListener(
      'touchend',
      (e) => {
        if (!isTouching) return;
        isTouching = false;
        if (!e.changedTouches.length) return;
        const deltaX = e.changedTouches[0].clientX - startX;
        const deltaY = e.changedTouches[0].clientY - startY;
        if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
        if (Math.abs(deltaX) < Math.abs(deltaY) * DIRECTION_RATIO) return;
        if (deltaX < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        pauseTimer();
      },
      { passive: true }
    );

    hero.addEventListener(
      'touchcancel',
      () => {
        isTouching = false;
      },
      { passive: true }
    );
  }
}

function initLightbox() {
  const containers = document.querySelectorAll('[data-gallery]');
  if (!containers.length) return;

  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox-image');
  const caption = document.querySelector('.lightbox-caption');
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-prev');
  const nextBtn = document.querySelector('.lightbox-next');

  const groups = new Map();
  let currentGroup = '';
  let currentIndex = 0;
  let lastTrigger = null;

  containers.forEach((container) => {
    const groupKey = container.dataset.gallery || 'default';
    const items = Array.from(container.querySelectorAll('[data-lightbox]'));
    if (items.length) {
      groups.set(groupKey, items);
    }
    items.forEach((item, index) => {
      const imgEl = item.querySelector('img');
      const label = item.dataset.caption || imgEl?.alt || 'Abrir imagem em destaque';

      item.setAttribute('role', 'button');
      item.setAttribute('tabindex', '0');
      item.setAttribute('aria-haspopup', 'dialog');
      item.setAttribute('aria-label', label);

      item.addEventListener('click', () => {
        openLightbox(groupKey, index, item);
      });

      item.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ' && e.key !== 'Spacebar') return;
        e.preventDefault();
        openLightbox(groupKey, index, item);
      });
    });
  });

  function openLightbox(groupKey, index, trigger = null) {
    const items = groups.get(groupKey);
    if (!items || !items.length || !lightbox || !lightboxImg) return;

    currentGroup = groupKey;
    currentIndex = (index + items.length) % items.length;
    lastTrigger = trigger;
    const el = items[currentIndex];
    const imgEl = el.querySelector('img');
    const src = el.dataset.src || imgEl?.src || '';
    const altText = el.dataset.caption || imgEl?.alt || '';

    lightboxImg.src = src;
    lightboxImg.alt = altText;
    caption && (caption.textContent = altText);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    if (lastTrigger instanceof HTMLElement) {
      lastTrigger.focus();
    }
  }

  function stepLightbox(delta) {
    const items = groups.get(currentGroup);
    if (!items || !items.length) return;
    currentIndex = (currentIndex + delta + items.length) % items.length;
    const el = items[currentIndex];
    const imgEl = el.querySelector('img');
    const src = el.dataset.src || imgEl?.src || '';
    const altText = el.dataset.caption || imgEl?.alt || '';

    if (lightboxImg) {
      lightboxImg.src = src;
      lightboxImg.alt = altText;
    }
    if (caption) caption.textContent = altText;
  }

  closeBtn?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  prevBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    stepLightbox(-1);
  });

  nextBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    stepLightbox(1);
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });

  if (lightbox) {
    let startX = 0;
    let startY = 0;
    let isTouching = false;
    const SWIPE_THRESHOLD = 50;
    const DIRECTION_RATIO = 1.2;

    lightbox.addEventListener(
      'touchstart',
      (e) => {
        if (!lightbox.classList.contains('open')) return;
        if (e.touches.length !== 1) return;
        isTouching = true;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      },
      { passive: true }
    );

    lightbox.addEventListener(
      'touchend',
      (e) => {
        if (!isTouching) return;
        isTouching = false;
        if (!lightbox.classList.contains('open')) return;
        if (!e.changedTouches.length) return;
        const deltaX = e.changedTouches[0].clientX - startX;
        const deltaY = e.changedTouches[0].clientY - startY;
        if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
        if (Math.abs(deltaX) < Math.abs(deltaY) * DIRECTION_RATIO) return;
        stepLightbox(deltaX < 0 ? 1 : -1);
      },
      { passive: true }
    );

    lightbox.addEventListener(
      'touchcancel',
      () => {
        isTouching = false;
      },
      { passive: true }
    );
  }
}

function initFilters() {
  const groups = document.querySelectorAll('[data-filter-group]');
  groups.forEach((group) => {
    const targetSelector = group.dataset.filterTarget;
    const target = targetSelector ? document.querySelector(targetSelector) : null;
    if (!target) return;

    const cards = target.querySelectorAll('[data-category]');
    const buttons = group.querySelectorAll('.filter-button');

    buttons.forEach((btn) => {
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-pressed', btn.classList.contains('active') ? 'true' : 'false');
    });

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        const filter = btn.dataset.filter || 'all';
        cards.forEach((card) => {
          const categories = (card.dataset.category || '').split(' ');
          const isVisible = filter === 'all' || categories.includes(filter);
          card.hidden = !isVisible;
          card.setAttribute('aria-hidden', (!isVisible).toString());
        });
      });
    });
  });
}

function initContactBriefingForm() {
  const panels = Array.from(document.querySelectorAll('[data-form-panel]'));
  if (!panels.length) return;

  const updateHash = (value) => {
    if (history.replaceState) {
      const nextUrl = value ? `${window.location.pathname}${window.location.search}#${value}` : `${window.location.pathname}${window.location.search}`;
      history.replaceState(null, '', nextUrl);
      return;
    }

    window.location.hash = value;
  };

  panels.forEach((panel) => {
    if (!(panel instanceof HTMLElement) || !panel.id) return;
    const panelId = panel.id;
    const triggers = Array.from(document.querySelectorAll(`[data-form-reveal="${panelId}"]`));
    const heading = panel.querySelector('[data-form-heading]');
    const pendingForm = panel.querySelector('form[data-endpoint-pending]');
    const status = panel.querySelector('[data-form-status]');

    const syncState = (isOpen) => {
      panel.classList.toggle('is-open', isOpen);
      triggers.forEach((trigger) => trigger.setAttribute('aria-expanded', isOpen.toString()));
    };

    const scrollToPanel = () => {
      panel.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start',
      });
    };

    const openPanel = ({ focusHeading = false, scroll = true } = {}) => {
      syncState(true);
      if (scroll) scrollToPanel();
      if (focusHeading && heading instanceof HTMLElement) {
        window.setTimeout(() => heading.focus({ preventScroll: true }), prefersReducedMotion() ? 0 : 120);
      }
    };

    const closePanel = () => {
      syncState(false);
    };

    syncState(window.location.hash === `#${panelId}`);

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        const isOpen = panel.classList.contains('is-open') || window.location.hash === `#${panelId}`;

        if (isOpen) {
          event.preventDefault();
          closePanel();
          if (window.location.hash === `#${panelId}`) {
            updateHash('');
          }
          trigger.focus();
          return;
        }

        event.preventDefault();
        updateHash(panelId);
        openPanel({ focusHeading: true });
      });
    });

    window.addEventListener('hashchange', () => {
      const isHashTarget = window.location.hash === `#${panelId}`;
      syncState(isHashTarget);
    });

    if (pendingForm instanceof HTMLFormElement && status instanceof HTMLElement) {
      pendingForm.addEventListener('submit', (event) => {
        if (pendingForm.dataset.endpointPending !== 'true') return;
        event.preventDefault();

        if (!pendingForm.reportValidity()) {
          return;
        }
        status.textContent =
          'O envio por email sera ativado na hospedagem. Para atendimento imediato, use o WhatsApp.';
        status.classList.add('is-visible');
      });
    }
  });
}

function primeRevealTargets() {
  const fadeTargets = document.querySelectorAll('.page-hero .container, .section-heading, .cta-banner');
  fadeTargets.forEach((element) => element.classList.add('reveal-fade'));

  const staggerGroups = document.querySelectorAll(
    '.cards-grid, .services-grid, .gallery-grid, .why-grid, .process-grid, .sample-grid, .sample-showcase, .sample-thumbs, .service-layout, .contact-grid'
  );

  staggerGroups.forEach((group) => {
    group.classList.add('reveal-stagger');
    Array.from(group.children).forEach((child, index) => {
      if (!(child instanceof HTMLElement)) return;
      child.classList.add('reveal-up');
      child.style.setProperty('--reveal-delay', `${Math.min(index * 80, 360)}ms`);
    });
  });
}

function initRevealAnimations() {
  const revealTargets = Array.from(document.querySelectorAll('.reveal, .reveal-up, .reveal-fade'));
  if (!revealTargets.length) return;

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  revealTargets.forEach((target) => observer.observe(target));
}
