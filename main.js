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

  const STAR_COUNT  = 220;
  const NEBULA_ORB_COUNT = 6;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createStar() {
    return {
      x:     randomBetween(0, W),
      y:     randomBetween(0, H),
      r:     randomBetween(0.4, 1.8),
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
      x:      randomBetween(W * 0.1, W * 0.9),
      y:      randomBetween(H * 0.05, H * 0.75),
      r:      randomBetween(120, 260),
      alpha:  randomBetween(0.03, 0.09),
      color:  colors[Math.floor(Math.random() * colors.length)],
      drift:  { x: randomBetween(-0.05, 0.05), y: randomBetween(-0.03, 0.03) },
    };
  }

  function init() {
    resize();
    stars      = Array.from({ length: STAR_COUNT }, createStar);
    nebulaOrbs = Array.from({ length: NEBULA_ORB_COUNT }, createNebulaOrb);
  }

  let nebulaOrbs = [];
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw nebula orbs
    for (const orb of nebulaOrbs) {
      const grd = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
      grd.addColorStop(0,   orb.color + orb.alpha + ')');
      grd.addColorStop(0.5, orb.color + (orb.alpha * 0.4) + ')');
      grd.addColorStop(1,   orb.color + '0)');
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
  const btn   = $('#hamburger');
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
      spans[1].style.opacity   = '0';
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
    const cx = window.innerWidth  / 2;
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
  const btn  = $('#form-submit-btn');
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
