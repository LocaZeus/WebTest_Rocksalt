queueMotion(() => {
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const section = document.getElementById('airtime');
    const image = section.querySelector('.at__img');
    const [first, second] = section.querySelectorAll('.at__line');
    const text = section.querySelector('.at__text');
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { id: 'airtime', trigger: section, start: 'top bottom', end: 'bottom bottom', scrub: .6, invalidateOnRefresh: true } })
      .fromTo(image, { scale: 1.3, yPercent: 6 }, { scale: 1, yPercent: 0, duration: .7 }, 0)
      .fromTo(first, { y: () => window.innerHeight * .55 }, { y: 0, duration: .48, ease: 'power3.out' }, 0)
      .fromTo(second, { y: () => window.innerHeight * .8 }, { y: 0, duration: .55, ease: 'power3.out' }, 0)
      .fromTo(text, { y: () => window.innerHeight * .6, opacity: 0 }, { y: 0, opacity: 1, duration: .5, ease: 'power3.out' }, .06)
      .to({}, { duration: .3 }, .7);
  });
});
