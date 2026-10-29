queueMotion(() => {
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const section = document.getElementById('faq');
    const list = section.querySelector('.fq__list');
    const mark = list.querySelector('.fq__mark');
    const items = [...list.querySelectorAll('.fq__item')];
    const centre = item => item.offsetTop + item.querySelector('summary').offsetHeight / 2;
    const offset = index => centre(items[index]) - centre(items[0]);
    const timeline = gsap.timeline({ scrollTrigger: { id: 'faq', trigger: list, start: 'top 50%', end: 'bottom 62%', scrub: .5, invalidateOnRefresh: true } });
    for (let i = 1; i < items.length; i++) {
      timeline
        .to(mark, { y: () => offset(i - 1) - 50, duration: .42, ease: 'power2.out' }, i - 1)
        .to(mark, { y: () => offset(i), duration: .5, ease: 'power2.in' }, i - .58)
        .to(mark, { scaleY: .72, scaleX: 1.2, duration: .06, ease: 'power1.out' }, i - .08)
        .to(mark, { scaleY: 1, scaleX: 1, duration: .2, ease: 'back.out(3)' }, i - .02);
    }
    const onToggle = () => refreshScroll();
    items.forEach(item => item.addEventListener('toggle', onToggle));
    return () => items.forEach(item => item.removeEventListener('toggle', onToggle));
  });
});
