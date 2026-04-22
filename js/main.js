/* ============================================================
   JEEVAN SHIKSHA WEBSITE — Main JavaScript
   ============================================================ */

// === NAVBAR SCROLL ===
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) navbar?.classList.add('scrolled');
  else navbar?.classList.remove('scrolled');
});

// === HAMBURGER / MOBILE NAV ===
const hamburger  = document.querySelector('.hamburger');
const mobileNav  = document.querySelector('.mobile-nav');
const hamSpans   = document.querySelectorAll('.hamburger span');
hamburger?.addEventListener('click', () => {
  mobileNav?.classList.toggle('open');
  const isOpen = mobileNav?.classList.contains('open');
  if (isOpen) {
    hamSpans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
    hamSpans[1].style.opacity   = '0';
    hamSpans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
  } else {
    hamSpans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});
// close on link click
mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  hamSpans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}));

// === HERO SLIDER ===
const slides    = document.querySelectorAll('.slide');
const dots      = document.querySelectorAll('.slider-dot');
const prevArrow = document.querySelector('.slider-arrow.prev');
const nextArrow = document.querySelector('.slider-arrow.next');
let currentSlide = 0;
let autoSlide;

function goToSlide(n) {
  slides[currentSlide]?.classList.remove('active');
  dots[currentSlide]?.classList.remove('active');
  currentSlide = (n + slides.length) % slides.length;
  slides[currentSlide]?.classList.add('active');
  dots[currentSlide]?.classList.add('active');
}
function startAuto() { autoSlide = setInterval(() => goToSlide(currentSlide + 1), 5000); }
function resetAuto()  { clearInterval(autoSlide); startAuto(); }

prevArrow?.addEventListener('click', () => { goToSlide(currentSlide - 1); resetAuto(); });
nextArrow?.addEventListener('click', () => { goToSlide(currentSlide + 1); resetAuto(); });
dots.forEach((d, i) => d.addEventListener('click', () => { goToSlide(i); resetAuto(); }));
if (slides.length) { goToSlide(0); startAuto(); }

// === CAUSE CAROUSEL ===
const causesTrack = document.querySelector('.causes-track');
const causeDots   = document.querySelectorAll('.cause-dot');
const causeNext   = document.querySelector('.cause-nav-btn.next');
const causePrev   = document.querySelector('.cause-nav-btn.prev');
let causeIndex = 0;

function getVisibleCauses() {
  if (window.innerWidth < 768) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
}

function updateCauseSlider() {
  if (!causesTrack) return;
  const cardWidth = causesTrack.children[0]?.offsetWidth || 0;
  const gap = 24;
  causesTrack.style.transform = `translateX(-${causeIndex * (cardWidth + gap)}px)`;
  causeDots.forEach((d, i) => d.classList.toggle('active', i === causeIndex));
}

causeNext?.addEventListener('click', () => {
  const maxIndex = Math.max(0, (causesTrack?.children.length || 0) - getVisibleCauses());
  causeIndex = Math.min(causeIndex + 1, maxIndex);
  updateCauseSlider();
});
causePrev?.addEventListener('click', () => {
  causeIndex = Math.max(causeIndex - 1, 0);
  updateCauseSlider();
});
causeDots.forEach((d, i) => d.addEventListener('click', () => { causeIndex = i; updateCauseSlider(); }));

// === TEAM TABS ===
const teamTabs   = document.querySelectorAll('.team-tab');
const teamPanels = document.querySelectorAll('.team-panel');
teamTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    teamTabs.forEach(t => t.classList.remove('active'));
    teamPanels.forEach(p => p.style.display = 'none');
    tab.classList.add('active');
    const panel = document.querySelector(`.team-panel[data-panel="${target}"]`);
    if (panel) panel.style.display = 'grid';
  });
});
// init: show first panel
if (teamPanels.length) {
  teamPanels.forEach((p, i) => p.style.display = i === 0 ? 'grid' : 'none');
}

// === LANGUAGE TOGGLE ===
function applyLang(lang) {
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = lang === 'hi' ? el.dataset.hi || el.dataset.en : el.dataset.en;
  });
  document.querySelectorAll('[data-placeholder-en]').forEach(el => {
    el.placeholder = lang === 'hi'
      ? el.dataset.placeholderHi || el.dataset.placeholderEn
      : el.dataset.placeholderEn;
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  localStorage.setItem('js_lang', lang);
}

document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => applyLang(btn.dataset.lang));
});

// Apply saved language on load
const savedLang = localStorage.getItem('js_lang') || 'en';
applyLang(savedLang);

// === SCROLL REVEAL ===
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObs.observe(el));

// === CONTACT FORM ===
const contactForm = document.querySelector('.contact-form form');
contactForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector('[type=submit]');
  const orig = btn.textContent;
  btn.textContent = '✓ Message Sent!';
  btn.style.background = '#2CA090';
  setTimeout(() => { btn.textContent = orig; btn.style.background = ''; contactForm.reset(); }, 3000);
});

// === ACTIVE NAV LINK ===
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.navbar-links a, .mobile-nav a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});
