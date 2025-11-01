/*
 * Interatividade do site Estúdio Decorelas (estrutura com assets)
 *
 * Este script unifica todas as funcionalidades interativas do site:
 *  - Menu responsivo para dispositivos móveis
 *  - Filtragem da galeria por categoria
 *  - Lightbox com navegação por setas e teclado
 *  - Carrossel de banners no herói ou rotação de plano de fundo
 *
 * A implementação da filtragem e dos modais baseia‑se em recomendações
 * modernas de usabilidade para sites de fotografia.
 */

document.addEventListener('DOMContentLoaded', () => {
  /* -----------------------------------------------------------------------
   * Menu responsivo
   */
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('#nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
      navToggle.setAttribute('aria-expanded', (!expanded).toString());
      navMenu.classList.toggle('open');
    });
  }

  /* -----------------------------------------------------------------------
   * Filtragem da galeria
   */
  const filterButtons = document.querySelectorAll('.filter-button');
  const galleryItems = document.querySelectorAll('.gallery-item');
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      galleryItems.forEach((item) => {
        const category = item.dataset.category;
        if (filter === 'all' || category === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  /* -----------------------------------------------------------------------
   * Lightbox com navegação
   */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.querySelector('.lightbox-image');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  // Converte NodeList em array para navegar
  const galleryArray = Array.from(galleryItems);
  let currentIndex = 0;

  // Exibe a imagem indicada por 'index'
  function updateLightbox(index) {
    const total = galleryArray.length;
    currentIndex = (index + total) % total;
    const imgEl = galleryArray[currentIndex].querySelector('img');
    lightboxImg.src = imgEl.src;
    lightboxImg.alt = imgEl.alt;
    lightbox.classList.add('open');
  }

  // Ao clicar na miniatura, abre lightbox com o índice correspondente
  galleryArray.forEach((item, idx) => {
    item.addEventListener('click', () => {
      updateLightbox(idx);
    });
  });

  // Fechar a lightbox
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightboxImg.src = '';
    lightboxImg.alt = '';
  }
  if (lightboxClose) {
    lightboxClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeLightbox();
    });
  }
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Navegar para anterior
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      updateLightbox(currentIndex - 1);
    });
  }
  // Navegar para próxima
  if (lightboxNext) {
    lightboxNext.addEventListener('click', (e) => {
      e.stopPropagation();
      updateLightbox(currentIndex + 1);
    });
  }

  // Navegação via teclado (←, →, Esc)
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') {
      updateLightbox(currentIndex - 1);
    } else if (e.key === 'ArrowRight') {
      updateLightbox(currentIndex + 1);
    } else if (e.key === 'Escape') {
      closeLightbox();
    }
  });

  /* -----------------------------------------------------------------------
   * Carrossel do herói ou rotação simples
   */
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

    function nextSlide() {
      showSlide(currentSlide + 1);
    }
    function prevSlide() {
      showSlide(currentSlide - 1);
    }

    let slideInterval = setInterval(nextSlide, 12000);
    function resetInterval() {
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 12000);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        resetInterval();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        resetInterval();
      });
    }
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        resetInterval();
      });
    });
    showSlide(0);
  } else {
    // Fallback: alterna a imagem de fundo de .hero-overlay apenas quando necessário.
    const heroOverlay = document.querySelector('.hero-overlay');
    if (heroOverlay) {
      const inlineBg = heroOverlay.style && heroOverlay.style.backgroundImage;
      // só roda o fallback se não existir uma imagem de fundo definida inline
      if (!inlineBg || inlineBg === '' || inlineBg === 'none') {
        const bannerImages = [
          '../img/hero.jpg',
          '../img/gallery1.jpg',
          '../img/gallery2.jpg'
        ];
        let currentBanner = 0;
        setInterval(() => {
          currentBanner = (currentBanner + 1) % bannerImages.length;
          heroOverlay.style.backgroundImage = `url('${bannerImages[currentBanner]}')`;
        }, 6000);
      }
    }
  }
});
