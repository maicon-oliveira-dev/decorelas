/*
 * Interatividade do site Estúdio Decorelas (estrutura com assets)
 *
 * Implementa menu responsivo, filtragem na galeria e lightbox para
 * visualização ampliada de imagens. A implementação da filtragem e
 * modais se inspira em exemplos modernos de galerias que recomendam
 * organizar fotos com filtros e oferecer visualização detalhada para
 * melhorar a experiência do usuário【240859599916466†L60-L69】.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile navigation toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('#nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
      navToggle.setAttribute('aria-expanded', !expanded);
      navMenu.classList.toggle('open');
    });
  }

  // Gallery filtering
  const filterButtons = document.querySelectorAll('.filter-button');
  const galleryItems = document.querySelectorAll('.gallery-item');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      galleryItems.forEach(item => {
        const category = item.dataset.category;
        if (filter === 'all' || category === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Lightbox functionality
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.querySelector('.lightbox-image');
  const lightboxClose = document.querySelector('.lightbox-close');
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightboxImg.src = '';
    lightboxImg.alt = '';
  };

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }
});


// Hero slider or fallback rotation
// -------------------------------------------------------------------------
// Detecta se a página possui elementos `.hero-slide`. Se existir,
// inicializa um carrossel automático com controles e indicadores. Caso
// contrário, aplica a rotação simples do fundo para páginas que ainda
// usam `.hero-overlay` como fundo estático.
const heroSlides = document.querySelectorAll('.hero-slide');
if (heroSlides.length > 0) {
  const dots = document.querySelectorAll('.hero-dot');
  const prevBtn = document.querySelector('.hero-prev');
  const nextBtn = document.querySelector('.hero-next');
  let currentSlide = 0;
  function showSlide(index) {
    const total = heroSlides.length;
    currentSlide = (index + total) % total;
    heroSlides.forEach((slide) => slide.classList.remove('active'));
    dots.forEach((dot) => dot.classList.remove('active'));
    heroSlides[currentSlide].classList.add('active');
    if (dots[currentSlide]) {
      dots[currentSlide].classList.add('active');
    }
  }
  function nextSlide() { showSlide(currentSlide + 1); }
  function prevSlide() { showSlide(currentSlide - 1); }
  let slideInterval = setInterval(nextSlide, 12000);
  function resetInterval() {
    clearInterval(slideInterval);
    slideInterval = setInterval(nextSlide, 12000);
  }
  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetInterval(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetInterval(); });
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => { showSlide(index); resetInterval(); });
  });
  showSlide(0);
} else {
  // Fallback: alternar a imagem de fundo de .hero-overlay
  const heroOverlay = document.querySelector('.hero-overlay');
  if (heroOverlay) {
    const bannerImages = [
      'images/hero.jpg',
      'images/gallery1.jpg',
      'images/gallery2.jpg'
    ];
    let currentBanner = 0;
    setInterval(() => {
      currentBanner = (currentBanner + 1) % bannerImages.length;
      heroOverlay.style.backgroundImage = `url('${bannerImages[currentBanner]}')`;
    }, 6000);
  }
}
