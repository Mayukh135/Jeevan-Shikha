/* ============================================================
   ADDITIONS — Lightbox, Back-to-top, EmailJS, Toast, Validation
   Load this AFTER main.js
   ============================================================ */

/* ——— BACK TO TOP ——— */
(function () {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<i class="fa fa-chevron-up"></i>';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ——— TOAST ——— */
function showToast(msg, type = 'success', duration = 4000) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${type === 'success' ? '✓' : '✗'}</span> ${msg}`;
  document.body.appendChild(t);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => t.classList.add('show'));
  });
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 400);
  }, duration);
}

/* ——— LIGHTBOX ——— */
(function () {
  // Collect all gallery items on the page
  let items = [];
  let currentIdx = 0;

  function buildLightbox() {
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.id = 'lightbox';
    overlay.innerHTML = `
      <button class="lightbox-nav prev" aria-label="Previous"><i class="fa fa-chevron-left"></i></button>
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Close">✕</button>
        <div class="lightbox-media"></div>
        <div class="lightbox-caption"></div>
      </div>
      <button class="lightbox-nav next" aria-label="Next"><i class="fa fa-chevron-right"></i></button>
      <div class="lightbox-counter"></div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeLightbox(); });
    overlay.querySelector('.lightbox-nav.prev').addEventListener('click', (e) => { e.stopPropagation(); navigate(-1); });
    overlay.querySelector('.lightbox-nav.next').addEventListener('click', (e) => { e.stopPropagation(); navigate(1); });

    document.addEventListener('keydown', (e) => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft')  navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  }

  function openLightbox(idx) {
    currentIdx = idx;
    renderItem();
    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    currentIdx = (currentIdx + dir + items.length) % items.length;
    renderItem();
  }

  function renderItem() {
    const lb   = document.getElementById('lightbox');
    const med  = lb.querySelector('.lightbox-media');
    const cap  = lb.querySelector('.lightbox-caption');
    const ctr  = lb.querySelector('.lightbox-counter');
    const item = items[currentIdx];

    med.innerHTML = '';
    if (item.src) {
      const img = document.createElement('img');
      img.className = 'lightbox-img';
      img.src = item.src;
      img.alt = item.caption || '';
      med.appendChild(img);
    } else {
      const em = document.createElement('div');
      em.className = 'lightbox-emoji';
      em.textContent = item.emoji || '🖼️';
      med.appendChild(em);
    }
    cap.textContent   = item.caption || '';
    ctr.textContent   = `${currentIdx + 1} / ${items.length}`;

    // Show/hide nav buttons
    lb.querySelector('.lightbox-nav.prev').style.display = items.length < 2 ? 'none' : '';
    lb.querySelector('.lightbox-nav.next').style.display = items.length < 2 ? 'none' : '';
  }

  function initGallery() {
    items = [];
    // Gallery full grid (gallery page)
    const fullItems = document.querySelectorAll('.gallery-full-item');
    fullItems.forEach((el, i) => {
      const img     = el.querySelector('img');
      const emoji   = el.querySelector('span')?.textContent || '';
      const caption = el.querySelector('.goverlay p')?.textContent || '';
      items.push({ src: img?.src || null, emoji, caption });
      el.addEventListener('click', () => openLightbox(i));
    });

    // Gallery preview grid (home page)
    const previewItems = document.querySelectorAll('.gallery-item');
    if (fullItems.length === 0) {
      previewItems.forEach((el, i) => {
        const img    = el.querySelector('img');
        const emoji  = el.querySelector('.gallery-placeholder')?.textContent?.trim() || '';
        items.push({ src: img?.src || null, emoji, caption: '' });
        el.addEventListener('click', () => openLightbox(i));
      });
    }
  }

  buildLightbox();
  initGallery();
})();

/* ——— EMAILJS CONTACT FORM ——— */
(function () {
  // EmailJS public key and service/template IDs
  // Replace these with your actual EmailJS credentials from https://www.emailjs.com
  const EMAILJS_PUBLIC_KEY  = 'YOUR_EMAILJS_PUBLIC_KEY';   // ← replace
  const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';            // ← replace
  const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';           // ← replace

  // Load EmailJS SDK lazily
  function loadEmailJS(callback) {
    if (window.emailjs) { callback(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = () => {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      callback();
    };
    document.head.appendChild(s);
  }

  function validateField(el) {
    if (!el.value.trim()) {
      el.classList.add('invalid'); el.classList.remove('valid');
      return false;
    }
    if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value)) {
      el.classList.add('invalid'); el.classList.remove('valid');
      return false;
    }
    el.classList.remove('invalid'); el.classList.add('valid');
    return true;
  }

  document.querySelectorAll('.contact-form form').forEach(form => {
    // Live validation
    form.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('blur', () => validateField(el));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validate required fields
      const required = form.querySelectorAll('input[type=text], input[type=email], textarea');
      let valid = true;
      required.forEach(el => { if (!validateField(el)) valid = false; });
      if (!valid) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      const btn = form.querySelector('[type=submit]');
      btn.classList.add('loading');

      // Gather data
      const data = {
        from_name:    form.querySelector('input[type=text]')?.value || 'Anonymous',
        from_email:   form.querySelector('input[type=email]')?.value || '',
        from_phone:   form.querySelector('input[type=tel]')?.value || 'Not provided',
        subject:      form.querySelector('select')?.value || 'General Enquiry',
        message:      form.querySelector('textarea')?.value || '',
        to_name:      'Jeevan Shiksha Team',
      };

      // If EmailJS keys are real, send — otherwise simulate
      if (EMAILJS_PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
        // Demo mode: simulate success after 1.5s
        await new Promise(r => setTimeout(r, 1500));
        btn.classList.remove('loading');
        showToast('✓ Message sent! We\'ll get back to you within 2–3 days.', 'success', 5000);
        form.reset();
        form.querySelectorAll('input, textarea').forEach(el => {
          el.classList.remove('valid', 'invalid');
        });
      } else {
        loadEmailJS(async () => {
          try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, data);
            btn.classList.remove('loading');
            showToast('✓ Message sent! We\'ll get back to you within 2–3 days.', 'success', 5000);
            form.reset();
            form.querySelectorAll('input, textarea').forEach(el => {
              el.classList.remove('valid', 'invalid');
            });
          } catch (err) {
            btn.classList.remove('loading');
            showToast('Something went wrong. Please email us directly.', 'error', 6000);
            console.error('EmailJS error:', err);
          }
        });
      }
    });
  });
})();

/* ——— GALLERY FILTER (gallery page) ——— */
(function () {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (!filterBtns.length) return;

  const resolveCategory = (item) => {
    if (item.dataset.category) return item.dataset.category;
    const imgSrc = item.querySelector('img')?.getAttribute('src') || '';
    if (imgSrc.includes('/mita/') || imgSrc.includes('/physical-health/')) return 'health';
    if (imgSrc.includes('/learning-centres/') || imgSrc.includes('/library/')) return 'education';
    if (imgSrc.includes('/environment/')) return 'environment';
    if (imgSrc.includes('/frisbee/')) return 'sports';
    if (imgSrc.includes('/creativity-adda/') || imgSrc.includes('/book-launch/')) return 'culture';
    return 'all';
  };

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = (btn.dataset.filter || 'all').toLowerCase();
      document.querySelectorAll('.gallery-full-item').forEach(item => {
        const itemCat = resolveCategory(item).toLowerCase();
        if (cat === 'all' || itemCat === cat) {
          item.style.display = '';
          item.style.opacity = '1';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
})();


/* ── Events "View More" button ── */
const evBtn   = document.getElementById('eventsViewMoreBtn');
const evExtra = document.getElementById('eventsExtra');
if (evBtn && evExtra) {
  let expanded = false;
  evBtn.addEventListener('click', () => {
    expanded = !expanded;
    if (expanded) {
      evExtra.classList.remove('hidden');
      evExtra.style.marginTop = '28px';
      evBtn.textContent = evBtn.getAttribute('data-en') === 'View More Events'
        ? 'View Less Events' : 'View Less Events';
      evBtn.setAttribute('data-en', 'View Less Events');
      evBtn.setAttribute('data-hi', 'कम इवेंट देखें');
    } else {
      evExtra.classList.add('hidden');
      evBtn.setAttribute('data-en', 'View More Events');
      evBtn.setAttribute('data-hi', 'और इवेंट देखें');
      evBtn.textContent = 'View More Events';
    }
  });
}

/* ── Reports year filter ── */
const filterBtns  = document.querySelectorAll('.rfilter-btn');
const reportRows  = document.querySelectorAll('#reportsTable tbody tr');
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const year = btn.dataset.year;
    reportRows.forEach(row => {
      if (year === 'all' || row.dataset.year === year) {
        row.classList.remove('hidden');
      } else {
        row.classList.add('hidden');
      }
    });
  });
});


/* ── VMV Blob Carousel ── */
(function(){
  const track = document.getElementById('vmvTrack');
  if (!track) return;
  const cards = track.querySelectorAll('.vmv-blob-card');
  const dots  = document.querySelectorAll('.vmv-dot');
  const prev  = document.getElementById('vmvPrev');
  const next  = document.getElementById('vmvNext');
  if (!cards.length) return;

  // Start with middle card active (index 1)
  let active = 1;

  function setActive(idx) {
    active = (idx + cards.length) % cards.length;
    cards.forEach((c,i) => c.classList.toggle('active', i === active));
    dots.forEach((d,i)  => d.classList.toggle('active', i === active));
  }

  if (prev) prev.addEventListener('click', () => setActive(active - 1));
  if (next) next.addEventListener('click', () => setActive(active + 1));
  dots.forEach((d,i) => d.addEventListener('click', () => setActive(i)));

  // Touch/swipe support
  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, {passive:true});
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) setActive(active + (dx < 0 ? 1 : -1));
  });
})();


/* ── Projects page category filter ── */
(function(){
  const filterBtns = document.querySelectorAll('.pf-btn');
  const cards = document.querySelectorAll('.proj-card');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      cards.forEach(card => {
        const pill = card.querySelector('.proj-cat-pill');
        const cardCat = pill ? pill.textContent.trim() : '';
        card.classList.toggle('hidden', cat !== 'all' && cardCat !== cat);
      });
    });
  });
})();
