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
  const navLinks = document.querySelectorAll('.nav-list a');
  const dropdowns = Array.from(document.querySelectorAll('.nav-item-dropdown'));

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen.toString());
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle?.setAttribute('aria-expanded', 'false');
      }
      dropdowns.forEach((d) => {
        d.classList.remove('open');
        d.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
      });
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
  let current = 0;
  let timer = null;

  const setSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => slide.classList.toggle('active', idx === current));
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === current));
  };

  const nextSlide = () => setSlide(current + 1);
  const prevSlide = () => setSlide(current - 1);

  const resetTimer = () => {
    if (timer) clearInterval(timer);
    timer = setInterval(nextSlide, 9000);
  };

  next?.addEventListener('click', () => {
    nextSlide();
    resetTimer();
  });

  prev?.addEventListener('click', () => {
    prevSlide();
    resetTimer();
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      setSlide(idx);
      resetTimer();
    });
  });

  resetTimer();
  setSlide(0);
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
