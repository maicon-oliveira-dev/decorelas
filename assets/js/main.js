document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  initHeroSlider();
  initLightbox();
  initFilters();
});

function setupNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.primary-nav');
  const header = document.querySelector('.site-header');
  const navLinks = Array.from(nav?.querySelectorAll('a') ?? []);
  const dropdowns = Array.from(document.querySelectorAll('.nav-item-dropdown'));

  const closeNav = () => {
    nav?.classList.remove('open');
    document.body.classList.remove('nav-open');
    toggle?.setAttribute('aria-expanded', 'false');
    dropdowns.forEach((d) => {
      d.classList.remove('open');
      d.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    });
  };

  toggle?.addEventListener('click', () => {
    const isOpen = nav?.classList.toggle('open');
    document.body.classList.toggle('nav-open', !!isOpen);
    toggle?.setAttribute('aria-expanded', (!!isOpen).toString());
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
    if (!dropdowns.length) return;
    if (!(e.target instanceof Element)) return;
    const inside = e.target.closest('.nav-item-dropdown');
    if (!inside) {
      dropdowns.forEach((d) => {
        d.classList.remove('open');
        d.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
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
  startTimer();

  // Touch swipe support for the hero slider.
  if (hero) {
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

  containers.forEach((container) => {
    const groupKey = container.dataset.gallery || 'default';
    const items = Array.from(container.querySelectorAll('[data-lightbox]'));
    if (items.length) {
      groups.set(groupKey, items);
    }
    items.forEach((item, index) => {
      item.addEventListener('click', () => {
        openLightbox(groupKey, index);
      });
    });
  });

  function openLightbox(groupKey, index) {
    const items = groups.get(groupKey);
    if (!items || !items.length || !lightbox || !lightboxImg) return;

    currentGroup = groupKey;
    currentIndex = (index + items.length) % items.length;
    const el = items[currentIndex];
    const imgEl = el.querySelector('img');
    const src = el.dataset.src || imgEl?.src || '';
    const altText = el.dataset.caption || imgEl?.alt || '';

    lightboxImg.src = src;
    lightboxImg.alt = altText;
    caption && (caption.textContent = altText);
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
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
      btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter || 'all';
        cards.forEach((card) => {
          const categories = (card.dataset.category || '').split(' ');
          const isVisible = filter === 'all' || categories.includes(filter);
          card.style.display = isVisible ? '' : 'none';
        });
      });
    });
  });
}
