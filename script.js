// Conceito KA — interações
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  document.documentElement.classList.remove('no-js');

  // Ano no rodapé
  $('#year').textContent = new Date().getFullYear();

  // Header ao rolar
  const header = $('#header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menu mobile
  const burger = $('#burger');
  const nav = $('#nav');
  const toggleMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('menu-open', open);
  };
  // fecha o menu se a tela crescer para o layout desktop
  window.matchMedia('(min-width: 900px)').addEventListener('change', e => e.matches && toggleMenu(false));
  burger.addEventListener('click', () => toggleMenu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', e => e.key === 'Escape' && toggleMenu(false));

  // Reveal on scroll (com leve escalonamento entre irmãos)
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const siblings = $$(':scope > .reveal', el.parentElement);
      el.style.transitionDelay = `${Math.max(0, siblings.indexOf(el)) * 90}ms`;
      el.classList.add('is-visible');
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  // Link ativo no menu
  const sections = $$('main section[id]');
  const navLinks = $$('.nav a[href^="#"]');
  const activeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => activeObserver.observe(s));

  // Filtro de serviços
  const tabs = $$('.tab');
  const cards = $$('.service-card');
  tabs.forEach(tab => tab.addEventListener('click', () => {
    const filter = tab.dataset.filter;
    tabs.forEach(t => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active);
    });
    cards.forEach((card, i) => {
      const show = filter === 'all' || card.dataset.cat === filter;
      card.classList.toggle('is-hidden', !show);
      card.classList.remove('is-entering');
      if (show) {
        void card.offsetWidth; // reinicia a animação
        card.style.animationDelay = `${i * 60}ms`;
        card.classList.add('is-entering');
      }
    });
  }));

  // Slider de depoimentos
  const track = $('#sliderTrack');
  const slides = $$('.testimonial', track);
  const dotsWrap = $('#sliderDots');
  let index = 0;
  let timer;

  // mesmos breakpoints do CSS (mobile-first)
  const mqMd = window.matchMedia('(min-width: 600px)');
  const mqLg = window.matchMedia('(min-width: 1100px)');
  const perView = () => (mqLg.matches ? 3 : mqMd.matches ? 2 : 1);
  const maxIndex = () => Math.max(0, slides.length - perView());

  const buildDots = () => {
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIndex(); i++) {
      const b = document.createElement('button');
      b.setAttribute('aria-label', `Ir para o depoimento ${i + 1}`);
      b.addEventListener('click', () => { goTo(i); restart(); });
      dotsWrap.appendChild(b);
    }
  };

  const goTo = (i) => {
    index = (i + maxIndex() + 1) % (maxIndex() + 1);
    const slide = slides[0];
    const step = slide.offsetWidth + parseFloat(getComputedStyle(slide).marginRight);
    track.style.transform = `translateX(${-index * step}px)`;
    $$('button', dotsWrap).forEach((d, n) => d.classList.toggle('is-active', n === index));
  };

  const restart = () => {
    clearInterval(timer);
    timer = setInterval(() => goTo(index + 1), 6000);
  };

  $('#prevBtn').addEventListener('click', () => { goTo(index - 1); restart(); });
  $('#nextBtn').addEventListener('click', () => { goTo(index + 1); restart(); });

  // Swipe no mobile
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) { goTo(index + (dx < 0 ? 1 : -1)); restart(); }
  });

  const slider = $('#slider');
  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', restart);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildDots(); goTo(Math.min(index, maxIndex())); }, 150);
  });

  buildDots();
  goTo(0);
  restart();
})();
