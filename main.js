/* ============================================================
   ASTRAL TECH ADVISORS — main.js
   Particle Canvas · Warp Launch · Shooting Stars · Constellation
   Scroll-Reveal · Navbar · Mobile Menu
   ============================================================ */

'use strict';

/* ── Utilities ── */
const $ = (s, ctx = document) => ctx.querySelector(s);
const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];

/* ============================================================
   1. FULL-PAGE BACKGROUND STAR CANVAS
      Gentle twinkling stars visible across every section
   ============================================================ */
(function initBgStars() {
  const canvas = $('#bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, stars = [];
  let t = 0;
  const STAR_COUNT = 160;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createStar() {
    return {
      x:     rnd(0, W),
      y:     rnd(0, H),
      r:     rnd(0.3, 1.7),
      alpha: rnd(0.25, 0.85),
      speed: rnd(0.0002, 0.0009),
      phase: rnd(0, Math.PI * 2),
      drift: rnd(-0.025, 0.025),
      color: Math.random() > 0.87 ? '#06B6D4'
           : Math.random() > 0.93 ? '#C084FC'
           : '#FFFFFF',
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    for (const s of stars) {
      const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle   = s.color;
      ctx.beginPath();

      if (s.r > 1.3) {
        /* 4-pointed sparkle for larger stars */
        const len = s.r * 2.5;
        ctx.moveTo(s.x,       s.y - len);
        ctx.lineTo(s.x + 0.5, s.y - 0.5);
        ctx.lineTo(s.x + len, s.y);
        ctx.lineTo(s.x + 0.5, s.y + 0.5);
        ctx.lineTo(s.x,       s.y + len);
        ctx.lineTo(s.x - 0.5, s.y + 0.5);
        ctx.lineTo(s.x - len, s.y);
        ctx.lineTo(s.x - 0.5, s.y - 0.5);
        ctx.closePath();
      } else {
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();

      s.x += s.drift;
      if (s.x < -5) s.x = W + 5;
      if (s.x > W + 5) s.x = -5;
    }

    t++;
    requestAnimationFrame(draw);
  }

  function handleResize() {
    clearTimeout(handleResize._t);
    handleResize._t = setTimeout(() => {
      resize();
      stars = Array.from({ length: STAR_COUNT }, createStar);
    }, 200);
  }

  resize();
  stars = Array.from({ length: STAR_COUNT }, createStar);
  draw();
  window.addEventListener('resize', handleResize);
})();


/* ============================================================
   2. HERO PARTICLE STAR CANVAS
      Phase 1: Warp/hyperspace launch (first ~110 frames)
      Phase 2: Normal starfield with shooting stars + constellation lines
   ============================================================ */
(function initStars() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, stars = [], nebulaOrbs = [], animId;

  const STAR_COUNT       = 220;
  const NEBULA_ORB_COUNT = 6;

  /* ── Warp phase ── */
  let warpPhase = true;
  let warpTimer = 0;
  const WARP_FRAMES = 110;
  let warpRays = [];

  /* ── Shooting stars ── */
  let shootingStars    = [];
  let shootingCooldown = 0;
  let nextShootAt      = 200;
  const SHOOT_MIN      = 150;
  const SHOOT_MAX      = 320;

  let t = 0;

  /* ── Helpers ── */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* ── Factory: normal star ── */
  function createStar() {
    return {
      x:     rnd(0, W),
      y:     rnd(0, H),
      r:     rnd(0.4, 1.8),
      alpha: rnd(0.3, 1),
      speed: rnd(0.0003, 0.001),
      phase: rnd(0, Math.PI * 2),
      drift: rnd(-0.04, 0.04),
      color: Math.random() > 0.85 ? '#06B6D4'
           : Math.random() > 0.92  ? '#C084FC'
           : '#FFFFFF',
    };
  }

  /* ── Factory: nebula orb ── */
  function createNebulaOrb() {
    const colors = [
      'rgba(124,58,237,',
      'rgba(6,182,212,',
      'rgba(159,96,245,',
      'rgba(34,211,238,',
      'rgba(192,38,211,',
    ];
    return {
      x:     rnd(W * 0.05, W * 0.95),
      y:     rnd(H * 0.05, H * 0.85),
      r:     rnd(130, 280),
      alpha: rnd(0.04, 0.11),
      color: colors[Math.floor(Math.random() * colors.length)],
      drift: { x: rnd(-0.05, 0.05), y: rnd(-0.03, 0.03) },
    };
  }

  /* ── Factory: warp rays ── */
  function createWarpRays() {
    warpRays = [];
    const count = 240;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rnd(-0.02, 0.02);
      warpRays.push({
        angle,
        dist:      rnd(0, 50),
        speed:     rnd(2, 20),
        lineWidth: rnd(0.3, 1.8),
        alpha:     rnd(0.4, 1),
        color:     Math.random() > 0.6 ? '#FFFFFF'
                 : Math.random() > 0.5 ? '#06B6D4'
                 : '#9F60F5',
      });
    }
  }

  /* ── Factory: shooting star ── */
  function createShootingStar() {
    const color = Math.random() > 0.5 ? '#ffffff'
                : Math.random() > 0.5 ? '#06B6D4' : '#C084FC';
    return {
      x:       rnd(W * 0.15, W * 1.1),
      y:       rnd(-20, H * 0.55),
      vx:      rnd(-12, -20),
      vy:      rnd(3, 9),
      tail:    [],
      tailMax: (rnd(14, 26)) | 0,
      alpha:   1,
      active:  true,
      color,
      size:    rnd(1.2, 2.5),
    };
  }

  /* ── Init ── */
  function init() {
    resize();
    stars      = Array.from({ length: STAR_COUNT },       createStar);
    nebulaOrbs = Array.from({ length: NEBULA_ORB_COUNT }, createNebulaOrb);
    createWarpRays();
  }

  /* ── Draw: warp hyperspace launch ── */
  function drawWarp() {
    const progress = warpTimer / WARP_FRAMES;
    const eased    = 1 - Math.pow(1 - progress, 2);   // ease-out quad

    /* Darkening afterglow trail */
    ctx.fillStyle = `rgba(8, 11, 26, ${0.88 - eased * 0.58})`;
    ctx.fillRect(0, 0, W, H);

    const cx = W * 0.5;
    const cy = H * 0.42;

    for (const ray of warpRays) {
      const d0  = ray.dist;
      ray.dist += ray.speed * (1 + eased * 10);

      const x1 = cx + Math.cos(ray.angle) * d0;
      const y1 = cy + Math.sin(ray.angle) * d0;
      const x2 = cx + Math.cos(ray.angle) * ray.dist;
      const y2 = cy + Math.sin(ray.angle) * ray.dist;

      if (x2 < -100 || x2 > W + 100 || y2 < -100 || y2 > H + 100) continue;

      ctx.globalAlpha = ray.alpha * Math.max(0, 1 - eased * 0.82);
      ctx.strokeStyle = ray.color;
      ctx.lineWidth   = ray.lineWidth;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    warpTimer++;

    if (warpTimer >= WARP_FRAMES) {
      warpPhase = false;
      ctx.clearRect(0, 0, W, H);
    }
  }

  /* ── Draw: normal starfield ── */
  function drawNormal() {
    ctx.clearRect(0, 0, W, H);

    /* Nebula orbs */
    for (const orb of nebulaOrbs) {
      const grd = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
      grd.addColorStop(0,   orb.color + orb.alpha + ')');
      grd.addColorStop(0.5, orb.color + (orb.alpha * 0.4) + ')');
      grd.addColorStop(1,   orb.color + '0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
      ctx.fill();

      orb.x += orb.drift.x;
      orb.y += orb.drift.y;
      if (orb.x < -orb.r || orb.x > W + orb.r) orb.drift.x *= -1;
      if (orb.y < -orb.r || orb.y > H + orb.r) orb.drift.y *= -1;
    }

    /* Constellation lines (first 80 stars, O(n²) bounded) */
    const cStars = stars.slice(0, 80);
    ctx.lineWidth = 0.5;
    for (let i = 0; i < cStars.length; i++) {
      for (let j = i + 1; j < cStars.length; j++) {
        const dx   = cStars[i].x - cStars[j].x;
        const dy   = cStars[i].y - cStars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.globalAlpha = (1 - dist / 100) * 0.14;
          ctx.strokeStyle = '#7C3AED';
          ctx.beginPath();
          ctx.moveTo(cStars[i].x, cStars[i].y);
          ctx.lineTo(cStars[j].x, cStars[j].y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;

    /* Stars */
    for (const s of stars) {
      const a = s.alpha * (0.5 + 0.5 * Math.sin(t * s.speed + s.phase));
      ctx.save();
      ctx.globalAlpha = a;
      ctx.fillStyle   = s.color;
      ctx.beginPath();

      /* 4-pointed sparkle for bright stars */
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

      s.x += s.drift;
      if (s.x < -5) s.x = W + 5;
      if (s.x > W + 5) s.x = -5;
    }

    /* Shooting stars */
    shootingCooldown++;
    if (shootingCooldown >= nextShootAt) {
      shootingStars.push(createShootingStar());
      shootingCooldown = 0;
      nextShootAt      = (rnd(SHOOT_MIN, SHOOT_MAX)) | 0;
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      if (!ss.active) { shootingStars.splice(i, 1); continue; }

      ss.tail.push({ x: ss.x, y: ss.y });
      if (ss.tail.length > ss.tailMax) ss.tail.shift();

      ss.x += ss.vx;
      ss.y += ss.vy;

      /* Glowing tail */
      for (let k = 0; k < ss.tail.length; k++) {
        const tp = k / ss.tail.length;
        ctx.save();
        ctx.globalAlpha = tp * ss.alpha * 0.7;
        ctx.fillStyle   = ss.color;
        ctx.beginPath();
        ctx.arc(ss.tail[k].x, ss.tail[k].y, ss.size * tp * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      /* Head glow radial gradient */
      ctx.save();
      ctx.globalAlpha = ss.alpha;
      const grd = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, ss.size * 5);
      grd.addColorStop(0, ss.color);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, ss.size * 5, 0, Math.PI * 2);
      ctx.fill();
      /* Bright white core */
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, ss.size * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      if (ss.x < -120 || ss.y > H + 80) ss.active = false;
    }
  }

  /* ── Main loop ── */
  function draw() {
    if (warpPhase) drawWarp();
    else           drawNormal();
    t++;
    animId = requestAnimationFrame(draw);
  }

  function handleResizeDebounced() {
    clearTimeout(handleResizeDebounced._t);
    handleResizeDebounced._t = setTimeout(() => {
      resize();
      stars = Array.from({ length: STAR_COUNT }, createStar);
      if (warpPhase) createWarpRays();
    }, 200);
  }

  init();
  draw();
  window.addEventListener('resize', handleResizeDebounced);
})();


/* ============================================================
   3. NAVBAR — scroll behaviour & highlight
   ============================================================ */
(function initNavbar() {
  const nav = $('#navbar');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* Highlight active nav link based on section in view */
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
   4. MOBILE HAMBURGER MENU
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

    /* Animate hamburger to X */
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

  /* Close when a nav link is clicked */
  $$('a', links).forEach(a => a.addEventListener('click', () => {
    if (isOpen) toggle();
  }));

  /* Close on Escape */
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) toggle(); });
})();


/* ============================================================
   5. SCROLL-REVEAL using IntersectionObserver
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
   6. HERO PARALLAX — subtle mouse-track
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
   7. CONTACT FORM — client-side submit feedback
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

    /* Simulate network delay (would be replaced with fetch to backend) */
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
   8. NEWSLETTER FORM — feedback
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
