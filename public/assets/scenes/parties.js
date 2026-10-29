queueMotion(() => {
  const section = document.getElementById('parties');
  const route = section.querySelector('.pt__route');
  const ball = section.querySelector('.pt__ball');
  const ballIn = section.querySelector('.pt__ball-in');
  const stops = [...section.querySelectorAll('.pt__stop')];
  const pops = stops.map(stop => stop.querySelector('.pt__pop'));
  const within = element => {
    let x = 0, y = 0, node = element;
    while (node && node !== route) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; }
    return { x: x + element.offsetWidth / 2, y: y + element.offsetHeight / 2 };
  };
  const landing = (timeline, index, at) => {
    timeline
      .to(ballIn, { scaleY: .7, scaleX: 1.25, duration: .05, ease: 'power1.out' }, at)
      .to(ballIn, { scaleY: 1, scaleX: 1, duration: .14, ease: 'back.out(3)' }, at + .05)
      .fromTo(pops[index], { scale: 1 }, { scale: 1.08, duration: .05, ease: 'power1.out', immediateRender: false }, at)
      .to(pops[index], { scale: 1, duration: .2, ease: 'back.out(3)' }, at + .05);
  };
  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference) and (min-width: 901px)', () => {
    section.setAttribute('data-route', '');
    const path = section.querySelector('.pt__dash');
    const trail = section.querySelector('.pt__trail');
    const total = path.getTotalLength();
    const box = path.ownerSVGElement.viewBox.baseVal;
    const samples = Array.from({ length: 401 }, (_, i) => { const p = path.getPointAtLength(total * i / 400); return { f: i / 400, x: p.x, y: p.y }; });
    const fractions = pops.map(pop => {
      const c = within(pop), vx = c.x / route.offsetWidth * box.width, vy = c.y / route.offsetHeight * box.height;
      return samples.reduce((best, s) => ((s.x - vx) ** 2 + (s.y - vy) ** 2 < (best.x - vx) ** 2 + (best.y - vy) ** 2 ? s : best)).f;
    });
    const along = (start, end) => ({ path, align: path, alignOrigin: [.5, .5], start, end });
    gsap.set(ball, { motionPath: along(fractions[0], fractions[0]) });
    gsap.set(trail, { strokeDasharray: total, strokeDashoffset: total * (1 - fractions[0]) });
    const timeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { id: 'parties', trigger: route, start: 'top 65%', end: 'bottom 80%', scrub: .6 } });
    for (let i = 0; i < stops.length - 1; i++) {
      timeline
        .to(ball, { motionPath: along(fractions[i], fractions[i + 1]), duration: 1 }, i)
        .fromTo(trail, { strokeDashoffset: total * (1 - fractions[i]) }, { strokeDashoffset: total * (1 - fractions[i + 1]), duration: 1, immediateRender: false }, i)
        .to(ballIn, { y: -110, duration: .5, ease: 'power2.out' }, i)
        .to(ballIn, { y: 0, duration: .5, ease: 'power2.in' }, i + .5);
      landing(timeline, i + 1, i + 1);
    }
    return () => { section.removeAttribute('data-route'); gsap.set([ball, ballIn, trail, ...pops], { clearProps: 'all' }); };
  });
  mm.add('(prefers-reduced-motion: no-preference) and (max-width: 900px)', () => {
    section.setAttribute('data-route', '');
    const list = section.querySelector('.pt__stops');
    const ys = () => pops.map(pop => within(pop).y);
    const listTop = () => within(list).y - list.offsetHeight / 2;
    const timeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { id: 'parties', trigger: list, start: 'top 60%', end: 'bottom 70%', scrub: .6, invalidateOnRefresh: true } });
    for (let i = 0; i < stops.length - 1; i++) {
      timeline
        .fromTo(ball, { y: () => ys()[i] }, { y: () => ys()[i + 1], duration: 1, immediateRender: !i }, i)
        .fromTo(list, { '--trail': () => (ys()[i] - listTop()) / list.offsetHeight }, { '--trail': () => (ys()[i + 1] - listTop()) / list.offsetHeight, duration: 1, immediateRender: !i }, i)
        .to(ballIn, { x: 26, duration: .5, ease: 'power2.out' }, i)
        .to(ballIn, { x: 0, duration: .5, ease: 'power2.in' }, i + .5);
      landing(timeline, i + 1, i + 1);
    }
    return () => { section.removeAttribute('data-route'); gsap.set([ball, ballIn, list, ...pops], { clearProps: 'all' }); };
  });
});
