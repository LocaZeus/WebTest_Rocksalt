/* ---- motion-queue ---- */
(() => {
  'use strict';
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  const parsed = document.readyState === 'loading' ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true })) : Promise.resolve();
  const ready = () => Promise.all([fonts, parsed]).then(() => firsts);
  const nextTask = () => window.scheduler?.yield?.() ?? new Promise(resolve => setTimeout(resolve));
  const refresh = () => {
    if (typeof window.refreshScroll === 'function') return window.refreshScroll();
    window.ScrollTrigger?.sort(); window.ScrollTrigger?.refresh();
  };
  const run = (setup, name) => {
    for (const trigger of window.ScrollTrigger?.getAll() || []) if (!trigger.end && window.ScrollTrigger.getAll().includes(trigger)) trigger.refresh(0, 1);
    const context = window.gsap.context(() => {});
    const log = new MutationObserver(() => {});
    log.observe(document.documentElement, { attributes: true, attributeOldValue: true, subtree: true });
    let failure = null, records;
    try { context.add(() => { try { setup(); } catch (error) { failure = error; } }); }
    finally { records = log.takeRecords(); log.disconnect(); }
    if (!failure) return true;
    try { context.revert(); } catch (error) { console.error(name, 'revert failed', error); }
    for (const { target, attributeName, oldValue } of records.reverse()) {
      const now = target.getAttribute(attributeName);
      if (oldValue == null) { if (now != null) target.removeAttribute(attributeName); }
      else if (now !== oldValue) target.setAttribute(attributeName, oldValue);
    }
    console.error(name, failure);
    return false;
  };
  let firsts = Promise.resolve(), tail = null, pending = 0, lazy = null, building = 0, firstCount = 0;
  window.motionReady = ready();
  parsed.then(() => { if (firstCount && !tail) firsts.then(refresh); });
  window.queueMotion = (setup, { first = false, near, id } = {}) => {
    if (!window.gsap || typeof setup !== 'function') return;
    const name = id || document.currentScript?.getAttribute('data-8b-part') || 'motion';
    if (near instanceof Element && window.IntersectionObserver) {
      const watch = new IntersectionObserver(entries => {
        if (!entries.some(entry => entry.isIntersecting)) return;
        watch.disconnect();
        building++;
        lazy = (lazy || ready()).then(nextTask).then(() => run(setup, name)).finally(() => { if (!--building) refresh(); });
      }, { rootMargin: '100% 0px' });
      watch.observe(near);
      return;
    }
    if (first) { firstCount++; firsts = firsts.then(() => fonts).then(() => { if (!run(setup, name)) refresh(); }); }
    else {
      pending++;
      tail = (tail || ready()).then(nextTask).then(() => run(setup, name))
        .finally(() => { if (!--pending) refresh(); });
    }
    window.motionReady = Promise.all([firsts, tail]);
  };
})();

/* ---- page-init ---- */
gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin);
function navHeight() { const nav = document.getElementById('nav'); return nav ? nav.offsetHeight : 0; }
function refreshScroll() { ScrollTrigger.sort(); ScrollTrigger.refresh(); }
gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
  const lenis = window.lenis = new Lenis({ lerp: .085, anchors: { offset: -navHeight() } });
  const tick = time => lenis.raf(time * 1000);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0);
  return () => { gsap.ticker.remove(tick); gsap.ticker.lagSmoothing(500, 33); lenis.destroy(); window.lenis = null; };
});

/* ---- motion ---- */
const WAVE = { amp: 18, cycles: 1.25, phase: .6 };
function wavePath(sag = 0, base = 50, amp = WAVE.amp) {
  let d = 'M0,100';
  for (let x = 0; x <= 1000; x += 25) {
    const y = base + amp * Math.sin(x / 1000 * Math.PI * 2 * WAVE.cycles + WAVE.phase) + sag * Math.exp(-(((x - 500) / 230) ** 2));
    d += ` L${x},${Math.min(100, y).toFixed(1)}`;
  }
  return d + ' L1000,100 Z';
}
function waveDriver(svg) {
  const path = svg.querySelector('path');
  const base = Number(svg.dataset.waveBase || 50), amp = Number(svg.dataset.waveAmp || WAVE.amp);
  const state = { sag: 0 };
  const draw = () => path.setAttribute('d', wavePath(state.sag, base, amp));
  return { state, draw };
}
const effects = {
  twang(svg, vars = {}) {
    const { state, draw } = svg._wave || (svg._wave = waveDriver(svg));
    const strength = vars.strength ?? 34;
    return gsap.timeline({ onUpdate: draw, onComplete: draw })
      .fromTo(state, { sag: 0 }, { sag: strength, duration: .12, ease: 'power2.out' })
      .to(state, { sag: 0, duration: 1.3, ease: 'elastic.out(1.1, .28)' });
  },
  sticker(element, vars = {}) {
    const tilt = Number(gsap.getProperty(element, 'rotation')) || 0;
    return gsap.timeline(vars)
      .fromTo(element, { scale: element.offsetWidth > 220 ? 1.18 : 1.6, rotation: tilt + (vars.turn ?? -14), opacity: 0 }, { scale: 1, rotation: tilt, opacity: 1, duration: .5, ease: 'back.out(2.6)' });
  },
  hop(element, vars = {}) {
    return gsap.timeline(vars)
      .fromTo(element, { y: 70, opacity: 0, scaleY: 1.06, transformOrigin: '50% 100%' }, { y: -12, opacity: 1, scaleY: 1, duration: .38, ease: 'power2.out' })
      .to(element, { y: 0, duration: .2, ease: 'power2.in' })
      .to(element, { scaleY: .9, scaleX: 1.04, duration: .08, ease: 'power1.out' })
      .to(element, { scaleY: 1, scaleX: 1, duration: .35, ease: 'back.out(3)' });
  }
};
document.querySelectorAll('[data-8b-section]').forEach(section => {
  const twangs = section.querySelectorAll('[data-8b-motion~="twang"]');
  if (twangs.length) {
    const id = `effect:twang:${section.id}`;
    queueMotion(() => gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      twangs.forEach(svg => {
        let running;
        const play = self => {
          const v = Math.abs(self.getVelocity());
          running?.kill();
          running = effects.twang(svg, { strength: gsap.utils.clamp(18, 46, 14 + v / 90) * (self.direction > 0 ? 1 : -1) });
        };
        ScrollTrigger.create({ id, trigger: svg, start: 'top bottom', end: 'bottom top', onEnter: play, onEnterBack: play });
      });
      return () => twangs.forEach(svg => svg._wave && (svg._wave.state.sag = 0, svg._wave.draw()));
    }), { first: section.getBoundingClientRect().top < innerHeight, id });
  }
  ['sticker', 'hop'].forEach(name => {
    const elements = section.querySelectorAll(`[data-8b-motion~="${name}"]`);
    if (!elements.length) return;
    const id = `effect:${name}:${section.id}`;
    queueMotion(() => gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
      elements.forEach((element, index) => ScrollTrigger.create({
        id, trigger: element, start: 'top 88%', once: true,
        animation: effects[name](element, { paused: true, delay: name === 'sticker' ? (index % 3) * .08 : 0, turn: index % 2 ? 12 : -14 })
      }));
    }), { first: section.getBoundingClientRect().top < innerHeight, id });
  });
});
if ('IntersectionObserver' in window) {
  const loopWatch = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('is-paused', !entry.isIntersecting)));
  document.querySelectorAll('[data-loop]').forEach(element => loopWatch.observe(element));
}

/* ---- section-script:nav ---- */
(() => {
  const nav = document.getElementById('nav');
  const toggle = nav.querySelector('.nav__menu');
  const menu = document.getElementById('menu');
  const close = menu.querySelector('.menu__close');
  let last = window.scrollY;
  const onScroll = () => {
    const y = window.scrollY, delta = y - last;
    last = y;
    if (y < 90) { nav.classList.remove('is-hidden'); return; }
    if (delta > 0) nav.classList.add('is-hidden');
    else if (delta < -2) nav.classList.remove('is-hidden');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  nav.addEventListener('focusin', () => nav.classList.remove('is-hidden'));
  const open = () => {
    menu.hidden = false; toggle.setAttribute('aria-expanded', 'true');
    window.lenis?.stop(); document.documentElement.style.overflow = 'hidden';
    menu.querySelector('a').focus();
  };
  const shut = (returnFocus = true) => {
    menu.hidden = true; toggle.setAttribute('aria-expanded', 'false');
    window.lenis?.start(); document.documentElement.style.overflow = '';
    if (returnFocus) toggle.focus();
  };
  toggle.addEventListener('click', () => (menu.hidden ? open() : shut()));
  close.addEventListener('click', () => shut());
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') shut();
    if (event.key === 'Tab') {
      const items = [...menu.querySelectorAll('a, button')];
      const first = items[0], end = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); end.focus(); }
      else if (!event.shiftKey && document.activeElement === end) { event.preventDefault(); first.focus(); }
    }
  });
  menu.querySelectorAll('.menu__list a').forEach(link => link.addEventListener('click', () => shut(false)));
})();

/* ---- section-script:forms ---- */
(() => {
  document.querySelectorAll('.ct__form').forEach(form => {
    const status = form.querySelector('.ct__status');
    const unsure = form.querySelector('[data-notsure]');
    const date = form.querySelector('[data-date]');
    if (unsure && date) {
      unsure.addEventListener('change', () => { date.required = !unsure.checked; date.disabled = unsure.checked; if (unsure.checked) date.value = ''; });
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = status.dataset.error;
        form.querySelector(':invalid')?.focus();
        return;
      }
      status.textContent = status.dataset.sent;
      form.reset();
      if (date) { date.required = true; date.disabled = false; }
    });
  });
})();
