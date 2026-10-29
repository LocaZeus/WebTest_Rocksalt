queueMotion(() => {
  const section = document.getElementById('prices');
  const row = section.querySelector('.pr__row');
  const passes = [...row.children];
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 701px)', () => {
    const middle = (passes.length - 1) / 2;
    passes.forEach((pass, index) => {
      gsap.timeline({ scrollTrigger: { id: `prices:pass-${index + 1}`, trigger: row, start: 'top 90%', end: 'top 35%', scrub: .5, invalidateOnRefresh: true } })
        .fromTo(pass, {
          x: () => row.offsetWidth / 2 - (pass.offsetLeft + pass.offsetWidth / 2),
          y: () => -pass.offsetTop + Math.abs(index - middle) * 22 + 50,
          rotation: (index - middle) * 9, transformOrigin: '50% 150%'
        }, { x: 0, y: 0, rotation: 0, duration: 1, ease: 'power2.out' });
    });
  });
  mm.add('(prefers-reduced-motion: no-preference) and (max-width: 700px)', () => {
    passes.forEach((pass, index) => {
      if (!index) return;
      const above = passes[index - 1];
      gsap.timeline({ scrollTrigger: { id: `prices:pass-${index + 1}`, trigger: pass, start: 'top bottom', end: 'top 70%', scrub: .5, invalidateOnRefresh: true } })
        .fromTo(pass, { y: () => above.offsetTop - pass.offsetTop, rotation: index % 2 ? -5 : 5 }, { y: 0, rotation: 0, duration: 1, ease: 'power2.out' });
    });
  });
});
