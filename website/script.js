// ============================================================
// Minit Charger — interaction layer (vanilla JS, no dependencies)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');
  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMobile.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });
    navMobile.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMobile.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Hero environment tabs (Outdoor / Indoor) ---------- */
  const envTabs = document.querySelectorAll('.env-tab');
  envTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      envTabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
    });
  });

  /* ---------- Charge ring animation ---------- */
  const ring = document.getElementById('ringProgress');
  const ringPct = document.getElementById('ringPct');
  if (ring) {
    const circumference = 2 * Math.PI * 68; // r=68
    ring.style.strokeDasharray = String(circumference);
    ring.style.strokeDashoffset = String(circumference);

    const targetPct = 62;
    const setRing = (pct) => {
      const offset = circumference - (pct / 100) * circumference;
      ring.style.strokeDashoffset = String(offset);
    };

    const rectObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setRing(targetPct);
          rectObserver.disconnect();
        }
      });
    }, { threshold: 0.4 });
    rectObserver.observe(ring);

    // gentle ambient drift so the panel feels "live"
    let drift = targetPct;
    setInterval(() => {
      drift = targetPct + (Math.random() * 4 - 2);
      drift = Math.max(40, Math.min(96, drift));
      setRing(drift);
      if (ringPct) ringPct.textContent = Math.round(drift) + '%';
    }, 3200);
  }

  /* ---------- Count-up stats ---------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animateCount = (el) => {
      const target = parseFloat(el.getAttribute('data-count'));
      const duration = 1400;
      const start = performance.now();
      const step = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased).toString();
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toString();
      };
      requestAnimationFrame(step);
    };

    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => countObserver.observe(c));
  }

  /* ---------- Environment scenes (Warehouse / Airport) ---------- */
  const sceneTabs = document.querySelectorAll('.scene-tab');
  const scenes = document.querySelectorAll('.scene');
  sceneTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-scene');
      sceneTabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
      scenes.forEach(s => s.classList.toggle('is-active', s.getAttribute('data-scene') === target));
    });
  });

  /* ---------- Flagship spotlight (Magnus) view switching ---------- */
  const spotlight = document.getElementById('magnus-spotlight');
  if (spotlight) {
    const sThumbs = spotlight.querySelectorAll('.spotlight__thumb');
    const sImgs = spotlight.querySelectorAll('.spotlight__img');
    sThumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const view = thumb.getAttribute('data-view');
        sThumbs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
        thumb.classList.add('is-active');
        thumb.setAttribute('aria-selected', 'true');
        sImgs.forEach(img => img.classList.toggle('is-active', img.getAttribute('data-view') === view));
      });
    });
  }

  /* ---------- Product showcase: thumbnail view switching ---------- */
  document.querySelectorAll('.showcase').forEach(showcase => {
    const thumbs = showcase.querySelectorAll('.showcase__thumb');
    const imgs = showcase.querySelectorAll('.showcase__img');

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const view = thumb.getAttribute('data-view');

        thumbs.forEach(t => {
          t.classList.remove('is-active');
          t.setAttribute('aria-selected', 'false');
        });
        thumb.classList.add('is-active');
        thumb.setAttribute('aria-selected', 'true');

        imgs.forEach(img => {
          img.classList.toggle('is-active', img.getAttribute('data-view') === view);
        });
      });
    });
  });

  /* ---------- Product showcase: subtle 3D tilt on mouse move ---------- */
  const tiltEls = document.querySelectorAll('[data-tilt] .showcase__stage');
  const supportsHover = window.matchMedia('(hover: hover)').matches;
  if (supportsHover) {
    tiltEls.forEach(stage => {
      const maxTilt = 6;
      stage.addEventListener('mousemove', (e) => {
        const rect = stage.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        stage.style.transform = `rotateY(${x * maxTilt * 2}deg) rotateX(${-y * maxTilt * 2}deg)`;
      });
      stage.addEventListener('mouseleave', () => {
        stage.style.transform = 'rotateY(0deg) rotateX(0deg)';
      });
    });
  }

  /* ---------- Reveal-on-scroll ---------- */
  const revealTargets = document.querySelectorAll(
    '.feature-card, .product-card, .process-step, .industry-card, .testimonial-card, .resource-card, .faq-item, .legacy-stat, .showcase, .compare'
  );
  revealTargets.forEach(el => el.setAttribute('data-reveal', ''));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('is-visible'), (i % 4) * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => revealObserver.observe(el));

  /* ---------- Sticky nav shadow on scroll ---------- */
  const nav = document.getElementById('nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.style.boxShadow = window.scrollY > 8 ? '0 8px 24px -16px rgba(14,23,18,0.25)' : 'none';
    }, { passive: true });
  }

  /* ---------- Contact form (front-end only demo handling) ---------- */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!name || !emailPattern.test(email)) {
        status.textContent = 'Please enter your name and a valid work email.';
        status.style.color = '#C24E4E';
        return;
      }

      status.style.color = 'var(--volt-dim)';
      status.textContent = `Thanks, ${name.split(' ')[0]} — your request has been noted. Our team will follow up shortly.`;
      form.reset();
    });
  }

});
