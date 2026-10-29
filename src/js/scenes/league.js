queueMotion(() => {
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const section = document.getElementById('league');
    const list = section.querySelector('.lg__rows');
    const rows = [...list.children];
    const step = () => (rows.length > 1 ? rows[1].offsetTop - rows[0].offsetTop : 0);
    rows.forEach((row, index) => {
      const shift = (Number(row.dataset.week) || index + 1) - 1 - index;
      gsap.timeline({ scrollTrigger: { id: `league:row-${index + 1}`, trigger: list, start: 'top 85%', end: 'bottom 65%', scrub: .5, invalidateOnRefresh: true } })
        .fromTo(row, { y: () => shift * step() }, { y: 0, duration: 1, ease: 'power1.inOut' }, 0)
        .fromTo(row, { x: 0 }, { x: Math.sign(shift) * -30, duration: .5, ease: 'sine.out', immediateRender: false }, 0)
        .to(row, { x: 0, duration: .5, ease: 'sine.in' }, .5);
    });
  });
});
