/* ============================================================
   ASTRAL TECH ADVISORS — main.js
   Particle Canvas · Scroll-Reveal · Navbar · Mobile Menu
   ============================================================ */

'use strict';

/* ── Utilities ── */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ============================================================
   1. PARTICLE STAR CANVAS
   ============================================================ */
(function initStars() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, stars = [], animId;

  const STAR_COUNT = 220;
  const NEBULA_ORB_COUNT = 6;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createStar() {
    return {
      x: randomBetween(0, W),
      y: randomBetween(0, H),
      r: randomBetween(0.4, 1.8),
      alpha: randomBetween(0.3, 1),
      speed: randomBetween(0.0003, 0.001),   // twinkle speed
      phase: randomBetween(0, Math.PI * 2),
      drift: randomBetween(-0.04, 0.04),     // horizontal drift
      color: Math.random() > 0.8 ? '#06B6D4' : '#FFFFFF',
    };
  }

  function createNebulaOrb() {
    const colors = [
      'rgba(124,58,237,',
      'rgba(6,182,212,',
      'rgba(159,96,245,',
      'rgba(34,211,238,',
    ];
    return {
      x: randomBetween(W * 0.1, W * 0.9),
      y: randomBetween(H * 0.05, H * 0.75),
      r: randomBetween(120, 260),
      alpha: randomBetween(0.03, 0.09),
      color: colors[Math.floor(Math.random() * colors.length)],
      drift: { x: randomBetween(-0.05, 0.05), y: randomBetween(-0.03, 0.03) },
    };
  }

  function init() {
    resize();
    stars = Array.from({ length: STAR_COUNT }, createStar);
    nebulaOrbs = Array.from({ length: NEBULA_ORB_COUNT }, createNebulaOrb);
  }

  let nebulaOrbs = [];
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw nebula orbs
    for (const orb of nebulaOrbs) {
      const grd = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
      grd.addColorStop(0, orb.color + orb.alpha + ')');
      grd.addColorStop(0.5, orb.color + (orb.alpha * 0.4) + ')');
      grd.addColorStop(1, orb.color + '0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
      ctx.fill();

      // Slow drift
      orb.x += orb.drift.x;
      orb.y += orb.drift.y;
      if (orb.x < -orb.r || orb.x > W + orb.r) orb.drift.x *= -1;
      if (orb.y < -orb.r || orb.y > H + orb.r) orb.drift.y *= -1;
    }

    // Draw stars
    for (const s of stars) {
      const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle = s.color;
      ctx.beginPath();

      // Occasional 4-pointed sparkle for bright stars
      if (s.r > 1.4) {
        const len = s.r * 2.5;
        ctx.moveTo(s.x, s.y - len);
        ctx.lineTo(s.x + 0.5, s.y - 0.5);
        ctx.lineTo(s.x + len, s.y);
        ctx.lineTo(s.x + 0.5, s.y + 0.5);
        ctx.lineTo(s.x, s.y + len);
        ctx.lineTo(s.x - 0.5, s.y + 0.5);
        ctx.lineTo(s.x - len, s.y);
        ctx.lineTo(s.x - 0.5, s.y - 0.5);
        ctx.closePath();
      } else {
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();

      // Drift
      s.x += s.drift;
      if (s.x < -5) s.x = W + 5;
      if (s.x > W + 5) s.x = -5;
    }

    t++;
    animId = requestAnimationFrame(draw);
  }

  function handleResizeDebounced() {
    clearTimeout(handleResizeDebounced._t);
    handleResizeDebounced._t = setTimeout(() => { resize(); stars = Array.from({ length: STAR_COUNT }, createStar); }, 200);
  }

  init();
  draw();
  window.addEventListener('resize', handleResizeDebounced);
})();


/* ============================================================
   2. NAVBAR — scroll behaviour & highlight
   ============================================================ */
(function initNavbar() {
  const nav = $('#navbar');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Highlight active nav link based on section in view
  const sections = $$('section[id]');
  const navLinks = $$('.nav-links a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.removeAttribute('aria-current'));
        const active = navLinks.find(a => a.getAttribute('href') === '#' + entry.target.id);
        if (active) active.setAttribute('aria-current', 'page');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();


/* ============================================================
   3. MOBILE HAMBURGER MENU
   ============================================================ */
(function initMobileMenu() {
  const btn = $('#hamburger');
  const links = $('#nav-links');
  if (!btn || !links) return;

  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
    links.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));

    // Animate hamburger to X
    const spans = $$('span', btn);
    if (isOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  }

  btn.addEventListener('click', toggle);

  // Close when a nav link is clicked
  $$('a', links).forEach(a => a.addEventListener('click', () => {
    if (isOpen) toggle();
  }));

  // Close on Escape
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) toggle(); });
})();


/* ============================================================
   4. SCROLL-REVEAL using IntersectionObserver
   ============================================================ */
(function initScrollReveal() {
  const revealEls = $$('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
})();


/* ============================================================
   5. HERO PARALLAX — subtle mouse-track
   ============================================================ */
(function initHeroParallax() {
  const hero = $('.hero');
  const orbs = $$('.hero .orb');
  if (!hero || !orbs.length) return;

  const FACTOR = 18;

  document.addEventListener('mousemove', e => {
    if (window.scrollY > window.innerHeight) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    orbs.forEach((orb, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      orb.style.transform = `translate(${dx * FACTOR * dir}px, ${dy * FACTOR * dir}px)`;
    });
  });
})();


/* ============================================================
   6. CONTACT FORM — client-side submit feedback
   ============================================================ */
(function initContactForm() {
  const form = $('#contact-form');
  const btn = $('#form-submit-btn');
  if (!form || !btn) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Sending… ⟳';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    // Simulate network delay (would be replaced with fetch to backend)
    setTimeout(() => {
      btn.innerHTML = '✓ Message Sent!';
      btn.style.opacity = '1';
      form.reset();
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 3000);
    }, 1200);
  });
})();


/* ============================================================
   7. NEWSLETTER FORM — feedback
   ============================================================ */
(function initNewsletter() {
  const form = $('#newsletter-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = $('button', form);
    btn.textContent = '✓ Done!';
    form.reset();
    setTimeout(() => { btn.textContent = 'Sign Up'; }, 3000);
  });
})();


/* ============================================================
   8. SERVICE CARD THUMBNAIL CANVAS RENDERER
   Each .thumb-canvas gets a procedural space art scene based
   on its data-theme attribute.
   ============================================================ */
(function initThumbnailCanvases() {
  const canvases = $$('.thumb-canvas');
  if (!canvases.length) return;

  const THEMES = {
    bookkeeping: { bg: ['#0D0820', '#160B30'], orb: 'rgba(124,58,237,', orb2: 'rgba(6,182,212,', icon: '📒' },
    consulting: { bg: ['#05102A', '#0A1540'], orb: 'rgba(6,182,212,', orb2: 'rgba(124,58,237,', icon: '📊' },
    automation: { bg: ['#080B1A', '#0B1530'], orb: 'rgba(22,211,238,', orb2: 'rgba(124,58,237,', icon: '⚡' },
    robot: { bg: ['#06101E', '#0C1828'], orb: 'rgba(124,58,237,', orb2: 'rgba(34,211,238,', icon: '🤖' },
    fractional: { bg: ['#0A0818', '#140C28'], orb: 'rgba(159,96,245,', orb2: 'rgba(6,182,212,', icon: '🏦' },
    essentials: { bg: ['#060D1C', '#0A1530'], orb: 'rgba(6,182,212,', orb2: 'rgba(124,58,237,', icon: '✅' },
    growth: { bg: ['#060E18', '#0B1A28'], orb: 'rgba(34,211,238,', orb2: 'rgba(124,58,237,', icon: '📈' },
    custom: { bg: ['#0B0820', '#16103A'], orb: 'rgba(124,58,237,', orb2: 'rgba(159,96,245,', icon: '🛠️' },
    ondemand: { bg: ['#060B1A', '#0A1230'], orb: 'rgba(6,182,212,', orb2: 'rgba(124,58,237,', icon: '💬' },
  };

  const STAR_COUNT = 60;

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function initCanvas(canvas) {
    const theme = THEMES[canvas.dataset.theme] || THEMES.bookkeeping;
    const ctx = canvas.getContext('2d');

    // Match canvas resolution to element size
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (!w || !h) return;     // Not mounted yet
    canvas.width = w * (window.devicePixelRatio || 1);
    canvas.height = h * (window.devicePixelRatio || 1);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

    const W = w, H = h;
    let t = 0;

    // Stars
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: randomBetween(0, W), y: randomBetween(0, H),
      r: randomBetween(0.3, 1.4),
      alpha: randomBetween(0.3, 1),
      speed: randomBetween(0.001, 0.004),
      phase: randomBetween(0, Math.PI * 2),
    }));

    function draw() {
      // Gradient BG
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, theme.bg[0]);
      grad.addColorStop(1, theme.bg[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Main nebula orb
      const g1 = ctx.createRadialGradient(W * 0.6, H * 0.4, 0, W * 0.6, H * 0.4, W * 0.55);
      g1.addColorStop(0, theme.orb + '0.35)');
      g1.addColorStop(0.5, theme.orb + '0.12)');
      g1.addColorStop(1, theme.orb + '0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);

      // Secondary orb
      const g2 = ctx.createRadialGradient(W * 0.2, H * 0.7, 0, W * 0.2, H * 0.7, W * 0.4);
      g2.addColorStop(0, theme.orb2 + '0.25)');
      g2.addColorStop(1, theme.orb2 + '0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      // Stars
      for (const s of stars) {
        const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Subtle horizontal scan line
      const scanY = (t * 0.4) % H;
      const sg = ctx.createLinearGradient(0, scanY - 10, 0, scanY + 10);
      sg.addColorStop(0, 'transparent');
      sg.addColorStop(0.5, theme.orb + '0.15)');
      sg.addColorStop(1, 'transparent');
      ctx.fillStyle = sg;
      ctx.fillRect(0, scanY - 10, W, 20);

      t++;
      requestAnimationFrame(draw);
    }

    draw();
  }

  canvases.forEach(c => {
    // Use ResizeObserver to wait until element has layout
    const ro = new ResizeObserver(() => {
      if (c.offsetWidth > 0) { ro.disconnect(); initCanvas(c); }
    });
    ro.observe(c);
  });
})();


/* ============================================================
   9. LANDING PAGE HERO CANVAS  (for service pages)
   ============================================================ */
(function initLandingCanvas() {
  const canvas = $('#landing-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, stars = [], t = 0;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function mkStar() {
    return {
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random(),
      s: Math.random() * 0.001 + 0.0003,
      p: Math.random() * Math.PI * 2,
    };
  }

  function init() {
    resize();
    stars = Array.from({ length: 180 }, mkStar);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const a = s.a * (0.4 + 0.6 * Math.sin(t * s.s + s.p));
      ctx.save();
      ctx.globalAlpha = a * 0.8;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    t++;
    requestAnimationFrame(draw);
  }

  init();
  draw();
  window.addEventListener('resize', () => { resize(); stars = Array.from({ length: 180 }, mkStar); });
})();

