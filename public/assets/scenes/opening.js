queueMotion(() => {
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const section = document.getElementById('opening');
    const jumper = section.querySelector('.op__jumper');
    const word = section.querySelector('.op__title-in');
    const stickers = section.querySelectorAll('.op__sticker');
    const wave = section.querySelector('.op__wave');
    const fan = section.querySelector('.op__fan');
    const cards = [...fan.querySelectorAll('.op__card')];
    const bed = (wave._wave ||= waveDriver(wave));
    const tilt = [-9, 3, 11];
    const bedBox = section.querySelector('.op__bed');
    const distance = () => window.innerHeight * 1.05;
    const contact = p => Math.max(-30, bedBox.offsetTop + wave.getBoundingClientRect().height * .16 - p * distance() - (jumper.offsetTop + jumper.offsetHeight));
    const timeline = gsap.timeline({
      defaults: { ease: 'none' },
      onUpdate: bed.draw,
      scrollTrigger: { id: 'opening', trigger: section, start: 'top top', end: () => '+=' + Math.round(distance()), scrub: .6, invalidateOnRefresh: true }
    });
    timeline
      .to(jumper, { y: () => contact(.2), duration: .2, ease: 'power1.in' }, 0)
      .to(bed.state, { sag: 58, duration: .12, ease: 'power2.out' }, .2)
      .to(jumper, { y: () => contact(.31) + wave.getBoundingClientRect().height * .5, duration: .11, ease: 'power2.out' }, .2)
      .to(jumper, { scaleY: .78, scaleX: 1.12, duration: .1, ease: 'power2.out' }, .22)
      .to(word, { scaleY: .84, scaleX: 1.02, duration: .1, ease: 'power2.out' }, .24)
      .to(bed.state, { sag: -14, duration: .1, ease: 'power2.out' }, .33)
      .to(bed.state, { sag: 7, duration: .1, ease: 'sine.inOut' }, .43)
      .to(bed.state, { sag: 0, duration: .14, ease: 'sine.inOut' }, .53)
      .to(jumper, { scaleY: 1.08, scaleX: .94, duration: .08, ease: 'power2.out' }, .32)
      .to(jumper, { y: () => -window.innerHeight * 1.15, rotation: -360, duration: .34, ease: 'power3.out' }, .31)
      .to(jumper, { scaleY: 1, scaleX: 1, duration: .2 }, .4)
      .to(word, { scaleY: 1.12, scaleX: .98, duration: .08, ease: 'power2.out' }, .34)
      .to(word, { scaleY: 1, scaleX: 1, duration: .22, ease: 'elastic.out(1, .35)' }, .42);
    stickers.forEach((sticker, index) => timeline.to(sticker, {
      y: () => -window.innerHeight * (.7 + index * .15), x: index ? 80 : -80, rotation: index ? 40 : -50, duration: .34, ease: 'power2.out'
    }, .3 + index * .03));
    cards.forEach((card, index) => timeline.fromTo(card, {
      x: () => fan.offsetWidth / 2 - (card.offsetLeft + card.offsetWidth / 2), y: () => fan.offsetHeight * .18, rotation: -tilt[index] - (index - 1) * 2
    }, { x: 0, y: 0, rotation: 0, duration: .4, ease: 'power2.out' }, .56 + index * .06));
    return () => { bed.state.sag = 0; bed.draw(); };
  });
}, { first: true });
