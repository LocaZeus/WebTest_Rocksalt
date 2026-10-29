/* Menu search and filters: shows or hides the menu items already in the page. */
(() => {
  const root = document.querySelector('.mn');
  if (!root) return;
  const q = document.getElementById('mn-q');
  const sectionSel = document.getElementById('mn-section');
  const labelSel = document.getElementById('mn-label');
  const clear = document.getElementById('mn-clear');
  const status = document.getElementById('mn-status');
  const empty = document.getElementById('mn-empty');
  const total = Number(root.dataset.total);
  const items = [...root.querySelectorAll('.mn__item')];
  const sections = [...root.querySelectorAll('.mn__sec')];
  const groups = [...root.querySelectorAll('.mn__group')];
  const jump = root.querySelector('.mn__jump');

  const apply = () => {
    const term = q.value.trim().toLowerCase();
    const sec = sectionSel.value;
    const label = labelSel.value;
    let shown = 0;
    items.forEach(item => {
      const inSection = !sec || item.closest('.mn__sec').dataset.section === sec;
      const hit = !term || term.split(/\s+/).every(w => item.dataset.text.includes(w));
      const labelled = !label || item.dataset.labels.split(' ').includes(label);
      const ok = inSection && hit && labelled;
      item.hidden = !ok;
      if (ok) shown++;
    });
    sections.forEach(s => { s.hidden = !s.querySelector('.mn__item:not([hidden])'); });
    groups.forEach(g => { g.hidden = !g.querySelector('.mn__sec:not([hidden])'); });
    const filtered = term || sec || label;
    jump.hidden = Boolean(filtered);
    empty.hidden = shown > 0;
    status.textContent = filtered ? `Showing ${shown} of ${total} menu entries` : `${total} menu entries`;
  };

  [q, sectionSel, labelSel].forEach(el => el.addEventListener('input', apply));
  clear.addEventListener('click', () => { q.value = ''; sectionSel.value = ''; labelSel.value = ''; apply(); q.focus(); });
  apply();
})();
