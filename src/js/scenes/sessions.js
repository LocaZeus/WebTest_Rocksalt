queueMotion(() => {
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const section = document.getElementById('sessions');
    const title = section.querySelector('.ss__title');
    const glow = section.querySelector('.ss__ticket--glow');
    const tokens = getComputedStyle(document.documentElement);
    const colour = n => tokens.getPropertyValue(`--color-${n}`).trim();
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { id: 'sessions', trigger: section, start: 'top 40%', end: 'bottom 75%', scrub: .5 } })
      .fromTo(section, { '--ground': colour(4) }, { '--ground': colour(5), duration: .22 }, .16)
      .to(section, { '--ground': colour(2), duration: .2 }, .4)
      .to(section, { '--ground': colour(3), duration: .16 }, .62)
      .fromTo(title, { color: colour(3) }, { color: colour(1), duration: .03 }, .57)
      .fromTo(glow, { '--glow': 0 }, { '--glow': 1, duration: .1 }, .84);
    return () => gsap.set([section, title, glow], { clearProps: 'all' });
  });
});
