/* ==========================================================================
   ZIGNAL NEXORA — Restrained Spatial Motion & Interactive Controller
   Skill: /antigravity-design-expert
   Principles: Purposeful GSAP reveals · Hero 3D Card Stack Scroll Cycling
   ========================================================================== */

(function () {
  'use strict';

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. THEME & LANGUAGE CONTROLLER
     ------------------------------------------------------------------------ */
  const savedTheme = localStorage.getItem('zn-theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    root.setAttribute('data-theme', savedTheme);
  } else {
    root.setAttribute('data-theme', 'dark');
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('zn-theme', next);
  }

  ['theme-toggle', 'theme-toggle-footer'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', toggleTheme);
  });

  function applyLanguage(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    localStorage.setItem('zn-lang', lang);

    const label = lang === 'es' ? 'EN' : 'ES';
    ['lang-toggle', 'lang-toggle-footer'].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.textContent = label;
    });

    document.querySelectorAll('[data-es-ph]').forEach((el) => {
      const ph = lang === 'en' ? el.getAttribute('data-en-ph') : el.getAttribute('data-es-ph');
      if (ph) el.setAttribute('placeholder', ph);
    });
  }

  const savedLang = localStorage.getItem('zn-lang');
  if (savedLang === 'en' || savedLang === 'es') {
    applyLanguage(savedLang);
  }

  ['lang-toggle', 'lang-toggle-footer'].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        const next = root.getAttribute('data-lang') === 'en' ? 'es' : 'en';
        applyLanguage(next);
      });
    }
  });

  /* ------------------------------------------------------------------------
     2. MOBILE MENU & SERVICE PRE-SELECTION
     ------------------------------------------------------------------------ */
  const menuBtn = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const productSelect = document.getElementById('product-select');
  document.querySelectorAll('[data-product-select]').forEach((link) => {
    link.addEventListener('click', () => {
      const idx = parseInt(link.getAttribute('data-product-select'), 10);
      if (productSelect && !Number.isNaN(idx) && productSelect.options[idx]) {
        productSelect.selectedIndex = idx;
      }
    });
  });

  /* ------------------------------------------------------------------------
     3. HERO 3D CARD STACK — SCROLL CYCLING (Top Card -> Bottom -> Next Section)
     ------------------------------------------------------------------------ */
  const heroSpatial = document.querySelector('.hero-spatial');
  const spatialScene = document.getElementById('spatial-scene');
  const isoStack = document.getElementById('iso-stack');
  const stackCounter = document.getElementById('stack-counter');
  const stackDots = Array.from(document.querySelectorAll('.stack-dot'));
  const nextSection = document.getElementById('enfoque');

  const SLOTS = [
    { x: 0, y: -36, z: 92, scale: 1, opacity: 1, zIndex: 3 },    // Slot 0: Top (Front)
    { x: 0, y: 0, z: 46, scale: 0.97, opacity: 0.92, zIndex: 2 }, // Slot 1: Middle
    { x: 0, y: 36, z: 0, scale: 0.94, opacity: 0.82, zIndex: 1 }, // Slot 2: Bottom (Base)
  ];

  // Collect cards ordered by their logical index: 0 (01), 1 (02), 2 (03)
  const cardsByIndex = [0, 1, 2].map((idx) =>
    isoStack ? isoStack.querySelector(`.iso-layer[data-card-index="${idx}"]`) : null
  );

  // deckOrder holds the card indices currently occupying [Slot 0 (Top), Slot 1 (Mid), Slot 2 (Bottom)]
  let deckOrder = [0, 1, 2];
  let cycleSteps = 0; // 0 -> 1 (Card 02 top) -> 2 (Card 03 top) -> 3 (Card 01 top again -> scroll to #enfoque)
  let isAnimatingCard = false;
  let wheelAccum = 0;
  let lastStepTimestamp = 0;

  function applySlotImmediate(cardEl, slotIdx) {
    if (!cardEl) return;
    const s = SLOTS[slotIdx];
    cardEl.setAttribute('data-slot', String(slotIdx));
    cardEl.style.zIndex = String(s.zIndex);
    if (window.gsap) {
      window.gsap.set(cardEl, {
        x: s.x,
        y: s.y,
        z: s.z,
        scale: s.scale,
        rotationZ: 0,
        opacity: s.opacity,
      });
    } else {
      cardEl.style.opacity = String(s.opacity);
      cardEl.style.transform = `translate3d(${s.x}px, ${s.y}px, ${s.z}px) scale(${s.scale})`;
    }
  }

  function updateStackUI() {
    const activeCardIdx = deckOrder[0];
    if (stackCounter) {
      stackCounter.textContent = `0${activeCardIdx + 1} / 03`;
    }
    stackDots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === activeCardIdx);
    });
  }

  function scrollToNextSection() {
    if (!nextSection) return;
    nextSection.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  /**
   * Moves the current Top card (Slot 0) to the Bottom of the stack (Slot 2),
   * while promoting Slot 1 -> Slot 0 and Slot 2 -> Slot 1.
   * When the first card (index 0) is reached again on top, scrolls to #enfoque.
   */
  function cycleTopCardToBottom(triggerScrollOnComplete) {
    if (isAnimatingCard || cardsByIndex.some((c) => !c)) return;
    isAnimatingCard = true;

    const outgoingTopIdx = deckOrder[0];
    const risingToTopIdx = deckOrder[1];
    const risingToMidIdx = deckOrder[2];

    const outgoingCard = cardsByIndex[outgoingTopIdx];
    const newTopCard = cardsByIndex[risingToTopIdx];
    const newMidCard = cardsByIndex[risingToMidIdx];

    // Rotate deck order: [0, 1, 2] -> [1, 2, 0]
    deckOrder = [risingToTopIdx, risingToMidIdx, outgoingTopIdx];
    updateStackUI();

    const reachedFirstCardAgain = triggerScrollOnComplete && deckOrder[0] === 0;

    if (prefersReducedMotion || !window.gsap) {
      deckOrder.forEach((cardIdx, slotIdx) => {
        applySlotImmediate(cardsByIndex[cardIdx], slotIdx);
      });
      setTimeout(() => {
        isAnimatingCard = false;
        if (reachedFirstCardAgain) {
          cycleSteps = 0;
          scrollToNextSection();
        }
      }, 180);
      return;
    }

    const gsap = window.gsap;
    [outgoingCard, newTopCard, newMidCard].forEach((el) => {
      el.style.willChange = 'transform, opacity';
    });

    const tl = gsap.timeline({
      onComplete: () => {
        deckOrder.forEach((cardIdx, slotIdx) => {
          const el = cardsByIndex[cardIdx];
          el.style.willChange = 'auto';
          applySlotImmediate(el, slotIdx);
        });

        if (reachedFirstCardAgain) {
          cycleSteps = 0;
          scrollToNextSection();
          // Brief cooldown while smooth page scroll begins
          setTimeout(() => {
            isAnimatingCard = false;
          }, 550);
        } else {
          setTimeout(() => {
            isAnimatingCard = false;
          }, 120);
        }
      },
    });

    // Phase 1: Outgoing top card arcs forward & down to clear the stack
    tl.to(
      outgoingCard,
      {
        x: 54,
        y: 62,
        z: 62,
        rotationZ: 4,
        scale: 0.96,
        opacity: 0.88,
        duration: 0.25,
        ease: 'power2.out',
      },
      0
    );

    // Rising cards float upward along Z and Y into Slot 0 and Slot 1
    tl.to(
      newTopCard,
      {
        x: SLOTS[0].x,
        y: SLOTS[0].y,
        z: SLOTS[0].z,
        rotationZ: 0,
        scale: SLOTS[0].scale,
        opacity: SLOTS[0].opacity,
        duration: 0.5,
        ease: 'power3.out',
      },
      0.04
    );

    tl.to(
      newMidCard,
      {
        x: SLOTS[1].x,
        y: SLOTS[1].y,
        z: SLOTS[1].z,
        rotationZ: 0,
        scale: SLOTS[1].scale,
        opacity: SLOTS[1].opacity,
        duration: 0.5,
        ease: 'power3.out',
      },
      0.04
    );

    // Swap z-index and data-slot at the apex of the arc
    tl.add(() => {
      newTopCard.setAttribute('data-slot', '0');
      newMidCard.setAttribute('data-slot', '1');
      outgoingCard.setAttribute('data-slot', '2');
      newTopCard.style.zIndex = String(SLOTS[0].zIndex);
      newMidCard.style.zIndex = String(SLOTS[1].zIndex);
      outgoingCard.style.zIndex = String(SLOTS[2].zIndex);
    }, 0.23);

    // Phase 2: Outgoing card tucks cleanly underneath into Slot 2 (Bottom)
    tl.to(
      outgoingCard,
      {
        x: SLOTS[2].x,
        y: SLOTS[2].y,
        z: SLOTS[2].z,
        rotationZ: 0,
        scale: SLOTS[2].scale,
        opacity: SLOTS[2].opacity,
        duration: 0.29,
        ease: 'power3.out',
      },
      0.25
    );
  }

  /**
   * Moves the Bottom card (Slot 2) back to the Top (Slot 0) when scrolling up
   */
  function cycleBottomCardToTop() {
    if (isAnimatingCard || cardsByIndex.some((c) => !c)) return;
    isAnimatingCard = true;

    const currentTopIdx = deckOrder[0];
    const currentMidIdx = deckOrder[1];
    const incomingBottomIdx = deckOrder[2];

    const currentTopCard = cardsByIndex[currentTopIdx];
    const currentMidCard = cardsByIndex[currentMidIdx];
    const incomingCard = cardsByIndex[incomingBottomIdx];

    deckOrder = [incomingBottomIdx, currentTopIdx, currentMidIdx];
    updateStackUI();

    if (prefersReducedMotion || !window.gsap) {
      deckOrder.forEach((cardIdx, slotIdx) => {
        applySlotImmediate(cardsByIndex[cardIdx], slotIdx);
      });
      setTimeout(() => {
        isAnimatingCard = false;
      }, 180);
      return;
    }

    const gsap = window.gsap;
    [currentTopCard, currentMidCard, incomingCard].forEach((el) => {
      el.style.willChange = 'transform, opacity';
    });

    const tl = gsap.timeline({
      onComplete: () => {
        deckOrder.forEach((cardIdx, slotIdx) => {
          const el = cardsByIndex[cardIdx];
          el.style.willChange = 'auto';
          applySlotImmediate(el, slotIdx);
        });
        setTimeout(() => {
          isAnimatingCard = false;
        }, 120);
      },
    });

    tl.to(
      incomingCard,
      {
        x: 54,
        y: 62,
        z: 62,
        rotationZ: 4,
        scale: 0.97,
        opacity: 0.95,
        duration: 0.23,
        ease: 'power2.out',
      },
      0
    );

    tl.to(
      currentTopCard,
      {
        x: SLOTS[1].x,
        y: SLOTS[1].y,
        z: SLOTS[1].z,
        rotationZ: 0,
        scale: SLOTS[1].scale,
        opacity: SLOTS[1].opacity,
        duration: 0.48,
        ease: 'power3.out',
      },
      0.04
    );

    tl.to(
      currentMidCard,
      {
        x: SLOTS[2].x,
        y: SLOTS[2].y,
        z: SLOTS[2].z,
        rotationZ: 0,
        scale: SLOTS[2].scale,
        opacity: SLOTS[2].opacity,
        duration: 0.48,
        ease: 'power3.out',
      },
      0.04
    );

    tl.add(() => {
      incomingCard.setAttribute('data-slot', '0');
      currentTopCard.setAttribute('data-slot', '1');
      currentMidCard.setAttribute('data-slot', '2');
      incomingCard.style.zIndex = String(SLOTS[0].zIndex);
      currentTopCard.style.zIndex = String(SLOTS[1].zIndex);
      currentMidCard.style.zIndex = String(SLOTS[2].zIndex);
    }, 0.22);

    tl.to(
      incomingCard,
      {
        x: SLOTS[0].x,
        y: SLOTS[0].y,
        z: SLOTS[0].z,
        rotationZ: 0,
        scale: SLOTS[0].scale,
        opacity: SLOTS[0].opacity,
        duration: 0.28,
        ease: 'power3.out',
      },
      0.23
    );
  }

  if (heroSpatial && isoStack) {
    // Initialize exact 3D slot transforms
    deckOrder.forEach((cardIdx, slotIdx) => {
      applySlotImmediate(cardsByIndex[cardIdx], slotIdx);
    });
    updateStackUI();

    // Wheel scroll over the hero cards
    heroSpatial.addEventListener(
      'wheel',
      (e) => {
        const now = performance.now();

        // Scrolling down over the cards: move top card to bottom
        if (e.deltaY > 0) {
          e.preventDefault();
          if (isAnimatingCard || now - lastStepTimestamp < 420) return;

          wheelAccum += e.deltaY;
          if (wheelAccum < 24) return;
          wheelAccum = 0;
          lastStepTimestamp = now;

          cycleSteps += 1;
          cycleTopCardToBottom(true);
        } else if (e.deltaY < 0) {
          // Scrolling up over the cards: if mid-cycle, reverse one card; otherwise allow page scroll up
          if (cycleSteps > 0) {
            e.preventDefault();
            if (isAnimatingCard || now - lastStepTimestamp < 420) return;

            wheelAccum += Math.abs(e.deltaY);
            if (wheelAccum < 24) return;
            wheelAccum = 0;
            lastStepTimestamp = now;

            cycleSteps -= 1;
            cycleBottomCardToTop();
          }
        }
      },
      { passive: false }
    );

    // Touch swipe support on mobile/tablet over the card stack
    let touchStartY = null;
    heroSpatial.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length === 1) {
          touchStartY = e.touches[0].clientY;
        }
      },
      { passive: true }
    );

    heroSpatial.addEventListener(
      'touchmove',
      (e) => {
        if (touchStartY === null || e.touches.length !== 1) return;
        const deltaY = touchStartY - e.touches[0].clientY;
        if (Math.abs(deltaY) > 12 && (deltaY > 0 || cycleSteps > 0)) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    heroSpatial.addEventListener(
      'touchend',
      (e) => {
        if (touchStartY === null || !e.changedTouches.length) return;
        const deltaY = touchStartY - e.changedTouches[0].clientY;
        touchStartY = null;
        if (isAnimatingCard) return;

        if (deltaY > 30) {
          cycleSteps += 1;
          cycleTopCardToBottom(true);
        } else if (deltaY < -30 && cycleSteps > 0) {
          cycleSteps -= 1;
          cycleBottomCardToTop();
        }
      },
      { passive: true }
    );

    // Dot click navigation
    stackDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        if (isAnimatingCard) return;
        const targetIdx = parseInt(dot.getAttribute('data-goto-card'), 10);
        if (Number.isNaN(targetIdx) || deckOrder[0] === targetIdx) return;
        cycleSteps = targetIdx;
        cycleTopCardToBottom(false);
      });
    });

    // Subtle pointer tilt on desktop
    if (spatialScene && !prefersReducedMotion) {
      spatialScene.addEventListener('pointermove', (e) => {
        if (window.innerWidth <= 980) return;
        const rect = spatialScene.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;

        const rotX = 48 - ny * 6;
        const rotZ = -28 + nx * 6;
        isoStack.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg)`;
      });

      spatialScene.addEventListener('pointerleave', () => {
        if (window.innerWidth <= 980) return;
        isoStack.style.transform = 'rotateX(48deg) rotateZ(-28deg)';
      });
    }
  }

  /* ------------------------------------------------------------------------
     4. RESTRAINED GSAP + SCROLLTRIGGER REVEALS
     ------------------------------------------------------------------------ */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function initRestrainedMotion() {
    if (prefersReducedMotion) return;

    try {
      await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js');
      await loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js');
    } catch (_) {
      return;
    }

    if (!window.gsap || !window.ScrollTrigger) return;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    // Sync initial GSAP transform values on the 3 isometric cards so GSAP knows their exact x/y/z
    deckOrder.forEach((cardIdx, slotIdx) => {
      const el = cardsByIndex[cardIdx];
      const s = SLOTS[slotIdx];
      if (el) {
        gsap.set(el, {
          x: s.x,
          y: s.y,
          z: s.z,
          scale: s.scale,
          rotationZ: 0,
          opacity: s.opacity,
        });
      }
    });

    const revealElements = gsap.utils.toArray('[data-reveal]');
    revealElements.forEach((el, index) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          delay: (index % 3) * 0.06,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
          onComplete: () => {
            el.style.willChange = 'auto';
          },
        }
      );
    });
  }

  initRestrainedMotion();

  /* ------------------------------------------------------------------------
     5. PHONE COUNTRY PICKER & FORMSPREE LEAD FORM
     ------------------------------------------------------------------------ */
  const COUNTRIES = [
    { flag: '🇪🇨', code: '+593', name: 'Ecuador' },
    { flag: '🇨🇴', code: '+57', name: 'Colombia' },
    { flag: '🇵🇪', code: '+51', name: 'Perú' },
    { flag: '🇲🇽', code: '+52', name: 'México' },
    { flag: '🇨🇱', code: '+56', name: 'Chile' },
    { flag: '🇦🇷', code: '+54', name: 'Argentina' },
    { flag: '🇵🇦', code: '+507', name: 'Panamá' },
    { flag: '🇨🇷', code: '+506', name: 'Costa Rica' },
    { flag: '🇪🇸', code: '+34', name: 'España' },
    { flag: '🇺🇸', code: '+1', name: 'USA / Canadá' },
  ];

  const countryBtn = document.getElementById('phone-country-btn');
  const countryList = document.getElementById('phone-country-list');
  const countryVal = document.getElementById('phone-country-value');
  const countryCur = document.getElementById('phone-country-current');

  if (countryBtn && countryList && countryVal && countryCur) {
    COUNTRIES.forEach((c) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', c.code === '+593' ? 'true' : 'false');
      li.innerHTML = `<span>${c.flag} ${c.name}</span><span class="mono">${c.code}</span>`;
      li.addEventListener('click', () => {
        countryVal.value = c.code;
        countryCur.textContent = `${c.flag} ${c.code}`;
        countryList.querySelectorAll('li').forEach((item) => item.setAttribute('aria-selected', 'false'));
        li.setAttribute('aria-selected', 'true');
        countryList.hidden = true;
        countryBtn.setAttribute('aria-expanded', 'false');
      });
      countryList.appendChild(li);
    });

    countryBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = countryList.hidden;
      countryList.hidden = !willOpen;
      countryBtn.setAttribute('aria-expanded', String(willOpen));
    });

    document.addEventListener('click', () => {
      if (!countryList.hidden) {
        countryList.hidden = true;
        countryBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Math Captcha & Form Submission */
  const form = document.getElementById('lead-form');
  const captchaQ = document.getElementById('captcha-question');
  const captchaIn = document.getElementById('captcha-input');
  const captchaErr = document.getElementById('captcha-error');
  const emailIn = document.getElementById('email-input');
  const emailErr = document.getElementById('email-error');
  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');

  let captchaAnswer = 0;
  function generateCaptcha() {
    const a = Math.floor(Math.random() * 7) + 2;
    const b = Math.floor(Math.random() * 7) + 2;
    captchaAnswer = a + b;
    if (captchaQ) captchaQ.textContent = `${a} + ${b} = ?`;
    if (captchaIn) captchaIn.value = '';
  }
  generateCaptcha();

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const isEn = root.getAttribute('data-lang') === 'en';
      if (emailErr) emailErr.textContent = '';
      if (captchaErr) captchaErr.textContent = '';
      if (statusEl) {
        statusEl.textContent = '';
        statusEl.className = 'form-status';
      }

      const emailVal = emailIn ? emailIn.value.trim() : '';
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        if (emailErr) emailErr.textContent = isEn ? 'Valid email required' : 'Ingresa un email válido';
        if (emailIn) emailIn.focus();
        return;
      }

      const userAns = captchaIn ? parseInt(captchaIn.value, 10) : NaN;
      if (userAns !== captchaAnswer) {
        if (captchaErr) captchaErr.textContent = isEn ? 'Incorrect result' : 'Resultado incorrecto';
        if (captchaIn) captchaIn.focus();
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (statusEl) statusEl.textContent = isEn ? 'Sending…' : 'Enviando…';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });

        if (res.ok) {
          form.reset();
          generateCaptcha();
          if (statusEl) {
            statusEl.textContent = isEn
              ? 'Thank you. An advisor will contact you shortly.'
              : 'Gracias. Un asesor te contactará muy pronto.';
            statusEl.className = 'form-status is-success';
          }
        } else {
          throw new Error('Submission failed');
        }
      } catch (_) {
        if (statusEl) {
          statusEl.textContent = isEn
            ? 'Could not send right now. Please write to contact@zignalnexora.com'
            : 'No se pudo enviar. Escríbenos a contact@zignalnexora.com';
          statusEl.className = 'form-status is-error';
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
})();