/* Gallery viewer: opens a photo larger in a native <dialog>. */
(() => {
  const dialog = document.querySelector('.gl__dialog');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const buttons = [...document.querySelectorAll('.gl__btn')];
  const big = dialog.querySelector('.gl__big');
  const cap = dialog.querySelector('.gl__cap');
  let index = 0;
  const show = i => {
    index = (i + buttons.length) % buttons.length;
    const b = buttons[index];
    big.src = b.dataset.full;
    big.alt = b.dataset.alt;
    cap.textContent = b.dataset.alt;
  };
  buttons.forEach((b, i) => b.addEventListener('click', () => { show(i); dialog.showModal(); window.lenis?.stop(); }));
  dialog.addEventListener('close', () => window.lenis?.start());
  dialog.querySelector('.gl__close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.gl__nav--prev').addEventListener('click', () => show(index - 1));
  dialog.querySelector('.gl__nav--next').addEventListener('click', () => show(index + 1));
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
})();
