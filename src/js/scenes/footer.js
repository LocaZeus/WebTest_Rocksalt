queueMotion(() => {
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const footer = document.getElementById('footer');
    const wrap = footer.querySelector('.ft__mark-wrap');
    const mark = footer.querySelector('.ft__mark');
    const discs = [...footer.querySelectorAll('.ft__disc')];
    const split = SplitText.create(mark, { type: 'chars', charsClass: 'ft__char' });
    const timeline = gsap.timeline({ scrollTrigger: { id: 'footer', trigger: wrap, start: 'top bottom', end: 'bottom bottom', scrub: .5, invalidateOnRefresh: true } });
    split.chars.forEach((char, index) => {
      const at = index * .13;
      timeline
        .fromTo(char, { y: () => -(wrap.offsetTop * .8 + index * 12), rotation: index % 2 ? 14 : -12 }, { y: 0, rotation: 0, duration: .34, ease: 'power2.in' }, at)
        .fromTo(char, { scaleX: 1, scaleY: 1 }, { scaleX: 1.14, scaleY: .74, duration: .05, ease: 'power1.out', immediateRender: false }, at + .34)
        .to(char, { scaleX: 1, scaleY: 1, duration: .2, ease: 'back.out(3)' }, at + .39);
    });
    const tilts = discs.map(disc => Number(gsap.getProperty(disc, 'rotation')) || 0);
    discs.forEach((disc, index) => timeline.fromTo(disc, { y: () => -wrap.offsetTop * .3, rotation: tilts[index] + (index % 2 ? 30 : -30) }, { y: 0, rotation: tilts[index], duration: .45, ease: 'bounce.out' }, .08 + index * .18));
    return () => split.revert();
  });
});
