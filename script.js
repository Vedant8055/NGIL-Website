const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

// Current year and scroll progress
$('#year').textContent = new Date().getFullYear();
const progress = $('#scrollProgress');
const header = $('.site-header');
const menuToggle = $('#menuToggle');
const mobileMenu = $('#mobileMenu');
let lastScrollY = 0;

// Mobile navigation — pin menu under sticky header + lock body scroll
const syncMobileMenuTop = () => {
  const announcement = document.querySelector('.announcement');
  const top =
    (announcement ? announcement.getBoundingClientRect().bottom : 0) +
    (header.classList.contains('is-hidden') ? 0 : header.offsetHeight);
  mobileMenu.style.top = `${Math.max(0, Math.round(top))}px`;
};
const setMobileMenuOpen = (open) => {
  mobileMenu.classList.toggle('open', open);
  menuToggle.classList.toggle('active', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  document.body.classList.toggle('nav-open', open);
  if (open) {
    header.classList.remove('is-hidden');
    syncMobileMenuTop();
  }
};
menuToggle.addEventListener('click', () => {
  setMobileMenuOpen(!mobileMenu.classList.contains('open'));
});
$$('#mobileMenu a').forEach(a => a.addEventListener('click', () => {
  setMobileMenuOpen(false);
}));
window.addEventListener('resize', syncMobileMenuTop, { passive: true });

const updateScroll = () => {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
  header.classList.toggle('scrolled', y > 12);

  const menuOpen = mobileMenu.classList.contains('open');
  if (menuOpen || y < 60) {
    header.classList.remove('is-hidden');
  } else if (y > lastScrollY + 4) {
    header.classList.add('is-hidden');
  } else if (y < lastScrollY - 4) {
    header.classList.remove('is-hidden');
  }
  lastScrollY = y;
  if (menuOpen) syncMobileMenuTop();
};
window.addEventListener('scroll', updateScroll, { passive: true });
syncMobileMenuTop();
updateScroll();

// Desktop nav oval active state
const desktopNavLinks = $$('.desktop-nav a');
const setActiveNav = (link) => {
  desktopNavLinks.forEach(a => a.classList.toggle('is-active', a === link));
};
desktopNavLinks.forEach(link => {
  link.addEventListener('click', () => setActiveNav(link));
});
const syncNavFromHash = () => {
  const hash = location.hash;
  if (!hash || hash === '#top') {
    desktopNavLinks.forEach(a => a.classList.remove('is-active'));
    return;
  }
  const match = desktopNavLinks.find(a => a.getAttribute('href') === hash);
  if (match) setActiveNav(match);
};
window.addEventListener('hashchange', syncNavFromHash);
syncNavFromHash();

// Logo / home links → scroll to homepage (top intro)
const goHome = (event) => {
  if (event) event.preventDefault();
  setMobileMenuOpen(false);
  header.classList.remove('is-hidden');
  desktopNavLinks.forEach(a => a.classList.remove('is-active'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  if (history.replaceState) history.replaceState(null, '', '#top');
  else location.hash = 'top';
  const home = document.getElementById('top');
  if (home) home.focus({ preventScroll: true });
};
$$('a.brand, a[href="#top"]').forEach(a => a.addEventListener('click', goHome));

// Scroll reveals
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => revealObserver.observe(el));

// Information modal for focus areas and idea cards
const pillarDetails = {
  education: {
    kicker: 'PILLAR 01 · LEARN', title: 'Education & digital empowerment',
    body: 'Learning opens doors. This focus area explores ways to support digital literacy, STEM curiosity, practical skills and more inclusive learning opportunities. Specific programmes will be shaped with educators and community partners.',
    tags: ['Digital literacy', 'STEM awareness', 'Mentorship', 'Future-ready skills', 'Responsible technology']
  },
  environment: {
    kicker: 'PILLAR 02 · PROTECT', title: 'Environment & climate action',
    body: 'A healthier future depends on how we care for the resources around us. This focus area explores environmental awareness, water conservation, waste reduction, tree care and sustainable everyday choices.',
    tags: ['Water conservation', 'Waste awareness', 'Tree care', 'Climate education', 'Sustainable living']
  },
  health: {
    kicker: 'PILLAR 03 · WELLBEING', title: 'Health & community wellbeing',
    body: 'Wellbeing grows when people can access useful information and supportive communities. This focus area may include age-appropriate awareness around preventive health, hygiene, inclusion and community wellbeing.',
    tags: ['Health awareness', 'Hygiene', 'Inclusion', 'Preventive education', 'Community wellbeing']
  },
  innovation: {
    kicker: 'PILLAR 04 · IMAGINE', title: 'Youth innovation & social entrepreneurship',
    body: 'Young people can help frame problems and explore fresh approaches. This focus area creates room for ideation, mentorship, prototypes, community problem-solving and responsible social entrepreneurship.',
    tags: ['Innovation challenges', 'Social entrepreneurship', 'Prototyping', 'Mentorship', 'Community solutions']
  },
  learning: {
    kicker: 'IDEA EXPLORER · LEARNING', title: 'Digital confidence for a changing world',
    body: 'An area to explore how young people can build confidence with digital tools, learn to evaluate information and discover future-facing skills. This is a possible programme theme, not a completed NextGen project.',
    tags: ['Digital literacy', 'Online safety', 'STEM activities', 'Creative problem-solving']
  },
  planet: {
    kicker: 'IDEA EXPLORER · PLANET', title: 'Small actions for a healthier planet',
    body: 'A possible focus on practical environmental learning: understanding water, reducing waste, caring for green spaces and encouraging sustainable habits with communities.',
    tags: ['Water awareness', 'Waste reduction', 'Tree care', 'Sustainable habits']
  },
  wellbeing: {
    kicker: 'IDEA EXPLORER · WELLBEING', title: 'Knowledge that supports wellbeing',
    body: 'A possible focus on clear, age-appropriate information about health, hygiene, inclusion and everyday wellbeing, delivered with qualified and responsible partners where required.',
    tags: ['Health information', 'Hygiene awareness', 'Inclusion', 'Community support']
  },
  community: {
    kicker: 'IDEA EXPLORER · COMMUNITY', title: 'Learning together with local communities',
    body: 'A possible focus on connecting young people with local mentors, neighbourhood partners and community voices so ideas are shaped through listening, collaboration and shared responsibility.',
    tags: ['Community listening', 'Local partnerships', 'Shared learning', 'Youth voice']
  },
  mentorship: {
    kicker: 'IDEA EXPLORER · MENTORSHIP', title: 'Guided paths for young changemakers',
    body: 'A possible focus on pairing curiosity with responsible adult guidance, peer learning and mentorship so young people can explore challenges thoughtfully and safely.',
    tags: ['Mentorship', 'Guided exploration', 'Peer learning', 'Safeguarding']
  }
};
const modal = $('#infoModal');
function openModal(key) {
  const data = pillarDetails[key];
  if (!data) return;
  $('#modalKicker').textContent = data.kicker;
  $('#modalTitle').textContent = data.title;
  $('#modalBody').textContent = data.body;
  $('#modalList').innerHTML = data.tags.map(tag => `<span>${escapeHtml(tag)}</span>`).join('');
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('#modalClose').focus();
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
$$('[data-open-pillar]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.openPillar)));
$$('[data-story]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.story)));
$('#modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && modal.classList.contains('open')) closeModal(); });
$('#modalAction').addEventListener('click', () => { closeModal(); location.hash = '#contact'; });

// Theme filters
$$('.filter-btn').forEach(button => button.addEventListener('click', () => {
  $$('.filter-btn').forEach(btn => btn.classList.toggle('active', btn === button));
  const filter = button.dataset.filter;
  $$('.story-card').forEach(card => card.classList.toggle('hidden', filter !== 'all' && card.dataset.category !== filter));
}));

// Involvement actions pre-select the enquiry topic
$$('[data-open-form]').forEach(button => button.addEventListener('click', () => {
  const wanted = button.dataset.openForm;
  const select = $('select[name="interest"]');
  const map = { 'Volunteer':'Volunteering', 'Mentor':'Mentorship', 'Partner':'Institutional partnership', 'Share an idea':'Sharing an idea' };
  select.value = map[wanted] || '';
  $('#contactForm').scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => $('input[name="name"]').focus({ preventScroll: true }), 500);
  showToast(`${wanted}: tell us a little more in the enquiry form.`);
}));

// Prototype-only contact form: deliberately does not transmit personal data
$('#contactForm').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  $('#formSuccess').classList.add('visible');
  form.reset();
  showToast('Demo interaction complete — no email was sent.');
});

let toastTimer;
function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3300);
}

// Graceful image fallback: keep each card visually rich if a remote image is unavailable.
$$('.pillar-image, .story-image, .hero-photo, .region-visual-bg').forEach(el => {
  const image = getComputedStyle(el).backgroundImage;
  const match = image.match(/url\(["']?(.*?)["']?\)/);
  if (!match) return;
  const probe = new Image();
  probe.onerror = () => el.classList.add('image-fallback');
  probe.src = match[1];
});

// Hero Bounce Pop — play, hold 7s after finish, then repeat
(() => {
  const heroTitle = $('#heroTitle');
  if (!heroTitle || !heroTitle.classList.contains('hero-dance')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const DANCE_MS = 3000; // lines + em + hopscotch lede settle
  const PAUSE_MS = 11000; // wait after finish before replay

  const playDance = () => {
    heroTitle.classList.remove('is-dancing');
    void heroTitle.offsetWidth;
    heroTitle.classList.add('is-dancing');
    window.setTimeout(playDance, DANCE_MS + PAUSE_MS);
  };

  playDance();
})();

// The pond keeps its ripples. The submarine is one untouched photo, slid as a whole toy:
// back across the water, a U-turn, and back again.
(() => {
  const live = document.querySelector('.scene-live');
  if (!live) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const img = live.querySelector('img');
  const start = () => {
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    if (!w || !h) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'scene-motion';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.width = w;
    canvas.height = h;
    live.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    const still = document.createElement('canvas');
    still.width = w;
    still.height = h;
    const sctx = still.getContext('2d', { willReadFrequently: true });
    sctx.drawImage(img, 0, 0);
    const shot = sctx.getImageData(0, 0, w, h);
    const pix = shot.data;
    const orig = new Uint8ClampedArray(pix);

    const shape = [
      [248, 568], [264, 544], [274, 522], [282, 494], [304, 506], [324, 528],
      [348, 518], [354, 476], [390, 472], [400, 442], [400, 414], [450, 408],
      [478, 430], [462, 456], [466, 480], [482, 488], [490, 516], [510, 532],
      [536, 548], [550, 570], [544, 608], [502, 622], [408, 630], [324, 622],
      [280, 606], [248, 582]
    ];
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = w;
    maskCanvas.height = h;
    const mctx = maskCanvas.getContext('2d', { willReadFrequently: true });
    mctx.beginPath();
    mctx.moveTo(shape[0][0], shape[0][1]);
    for (let i = 1; i < shape.length; i++) mctx.lineTo(shape[i][0], shape[i][1]);
    mctx.closePath();
    mctx.fillStyle = '#fff';
    mctx.fill();
    const maskPx = mctx.getImageData(0, 0, w, h).data;
    const mask = new Uint8Array(w * h);
    let minX = w;
    let minY = h;
    let maxX = 0;
    let maxY = 0;
    let count = 0;
    const subSprite = document.createElement('canvas');
    subSprite.width = w;
    subSprite.height = h;
    const subCtx = subSprite.getContext('2d');
    const subShot = subCtx.createImageData(w, h);
    const isWater = (r, g, b) => b > r + 12 && b > 70;
    for (let y = 410; y < 640; y++) {
      let right = -1;
      for (let x = 560; x >= 250; x--) {
        if (maskPx[(y * w + x) * 4] > 128) { right = x; break; }
      }
      for (let x = 250; x < 560; x++) {
        if (maskPx[(y * w + x) * 4] <= 128) continue;
        const p = y * w + x;
        mask[p] = 1;
        count++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        const i = p * 4;
        subShot.data[i] = orig[i];
        subShot.data[i + 1] = orig[i + 1];
        subShot.data[i + 2] = orig[i + 2];
        subShot.data[i + 3] = 255;
        let sx = 734 + ((x * 5) % 58);
        let sy = 592 + ((y * 3) % 58);
        if (y < 540 && right > 0) {
          sx = Math.min(w - 1, right + 4 + ((x + y) % 10));
          sy = y;
        }
        const si = (sy * w + sx) * 4;
        const sampled = [orig[si], orig[si + 1], orig[si + 2]];
        const fill = y < 540 || isWater(sampled[0], sampled[1], sampled[2])
          ? sampled
          : [58, 118, 134];
        pix[i] = fill[0];
        pix[i + 1] = fill[1];
        pix[i + 2] = fill[2];
      }
    }
    if (count < 800) {
      canvas.remove();
      return;
    }
    subCtx.putImageData(subShot, 0, 0);
    sctx.putImageData(shot, 0, 0);

    const pivotX = (minX + maxX) / 2;
    const pivotY = (minY + maxY) / 2;
    const pond = { cx: 470, cy: 648, rx: 290, ry: 86 };
    const trip = 8.4;
    const reach = 70;
    const ease = (p) => p * p * (3 - 2 * p);
    let running = true;
    const draw = (now) => {
      if (!running) return;
      const t = now / 1000;
      const u = (t % trip) / trip;
      let travel = 0;
      let face = 1;
      if (u < 0.46) {
        travel = ease(u / 0.46) * reach;
        face = 1;
      } else if (u < 0.5) {
        travel = reach;
        face = -1;
      } else if (u < 0.96) {
        travel = (1 - ease((u - 0.5) / 0.46)) * reach;
        face = -1;
      } else {
        travel = 0;
        face = 1;
      }
      const bob = Math.sin(t * 1.5) * 2.5;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(still, 0, 0);

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(pond.cx, pond.cy, pond.rx, pond.ry, -0.08, 0, Math.PI * 2);
      ctx.clip();
      for (let y = pond.cy - pond.ry; y < pond.cy + pond.ry; y++) {
        const yy = Math.floor(y);
        const dx = Math.sin(yy * 0.055 + t * 1.7) * 11 + Math.sin(yy * 0.11 - t * 1.2) * 6.2;
        ctx.drawImage(still, 0, yy, w, 1, dx, yy, w, 1);
      }
      ctx.globalCompositeOperation = 'soft-light';
      const shine = pond.cx - 80 + Math.sin(t * 0.7) * 80;
      const grad = ctx.createLinearGradient(shine, pond.cy - 36, shine + 140, pond.cy + 40);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.5, 'rgba(255,255,255,0.38)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(pond.cx - pond.rx, pond.cy - pond.ry, pond.rx * 2, pond.ry * 2);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.ellipse(pond.cx, pond.cy, pond.rx, pond.ry, -0.08, 0, Math.PI * 2);
      ctx.clip();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 1.8;
      for (let ring = 0; ring < 3; ring++) {
        const p = (t * 0.38 + ring / 3) % 1;
        ctx.globalAlpha = (1 - p) * 0.6;
        ctx.beginPath();
        ctx.ellipse(600, 668, 16 + p * 110, 6 + p * 22, -0.12, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      ctx.save();
      ctx.translate(pivotX + travel, pivotY + bob);
      ctx.scale(face, 1);
      ctx.drawImage(subSprite, -pivotX, -pivotY);
      ctx.restore();

      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) running = false;
      else if (!running) {
        running = true;
        requestAnimationFrame(draw);
      }
    });
  };
  if (img.complete && img.naturalWidth) start();
  else img.addEventListener('load', start, { once: true });
})();
