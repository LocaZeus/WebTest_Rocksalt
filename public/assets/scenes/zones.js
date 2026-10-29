queueMotion(() => {
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    const section = document.getElementById('zones');
    const rows = [...section.querySelectorAll('.zn__row')];
    const discs = rows.map(row => row.querySelector('.zn__disc'));
    const names = rows.map(row => row.querySelector('.zn__name'));
    const progress = rows.map(() => ({ p: 0 }));
    const set = (targets, prop, unit) => targets.map(target => gsap.quickSetter(target, prop, unit));
    const discX = set(discs, 'x', 'px'), discY = set(discs, 'y', 'px'), discSX = set(discs, 'scaleX'), discSY = set(discs, 'scaleY');
    const nameY = set(names, 'y', 'px'), nameSY = set(names, 'scaleY');
    let rest = [], lifts = [], origin = { x: 0, y: 0 };
    const centre = element => {
      let x = 0, y = 0, node = element;
      while (node && node !== section) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; }
      return { x: x + element.offsetWidth / 2, y: y + element.offsetHeight / 2 };
    };
    const measure = () => {
      rest = discs.map(centre);
      lifts = rows.map(row => Math.max(70, row.offsetHeight * .35));
      origin = { x: -discs[0].offsetWidth * .7, y: rest[0].y - rows[0].offsetHeight * .6 };
    };
    const layout = () => {
      let previous = origin;
      discs.forEach((disc, i) => {
        const p = progress[i].p, home = rest[i];
        const x = (previous.x - home.x) * (1 - p);
        const y = (previous.y - home.y) * (1 - p) - lifts[i] * 4 * p * (1 - p);
        const squash = p > .9 && p < 1 ? Math.sin((p - .9) / .1 * Math.PI) : 0;
        discX[i](x); discY[i](y); discSX[i](1 + .16 * squash); discSY[i](1 - .2 * squash);
        nameY[i](8 * squash); nameSY[i](1 - .12 * squash);
        previous = { x: home.x + x, y: home.y + y };
      });
    };
    measure(); layout();
    ScrollTrigger.create({ id: 'zones:measure', trigger: section, start: 'top bottom', end: 'bottom top', onRefresh: () => { measure(); layout(); } });
    const bodyCentre = i => { const body = rows[i].querySelector('.zn__body'); return centre(body).y - centre(rows[i]).y + rows[i].offsetHeight / 2; };
    const landAt = i => window.innerHeight * .64 - bodyCentre(i);
    const leaveAt = i => {
      if (!i) return window.innerHeight * .95;
      const previous = bodyCentre(i - 1) - (rows[i].offsetTop - rows[i - 1].offsetTop);
      return Math.max(window.innerHeight * .36 - previous, landAt(i) + window.innerHeight * .14);
    };
    rows.forEach((row, i) => gsap.to(progress[i], {
      p: 1, ease: 'none', onUpdate: layout,
      scrollTrigger: { id: `zones:row-${i + 1}`, trigger: row, start: () => `top ${Math.round(leaveAt(i))}px`, end: () => `top ${Math.round(landAt(i))}px`, scrub: .4 }
    }));
    return () => gsap.set([...discs, ...names], { clearProps: 'transform' });
  });
});
