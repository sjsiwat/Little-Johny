const fabMain = document.getElementById('fabMain');
const fabMenu = document.getElementById('fabMenu');

if (fabMain && fabMenu) {
  function closeFab() {
    fabMenu.hidden = true;
    fabMain.setAttribute('aria-expanded', 'false');
    fabMain.classList.remove('open');
  }
  fabMain.addEventListener('click', function (e) {
    e.stopPropagation();
    const isOpen = !fabMenu.hidden;
    isOpen ? closeFab() : (fabMenu.hidden = false, fabMain.setAttribute('aria-expanded', 'true'), fabMain.classList.add('open'));
  });
  document.addEventListener('click', function (e) {
    if (!fabMenu.hidden && !fabMenu.contains(e.target)) closeFab();
  });
  fabMenu.addEventListener('click', function (e) {
    const item = e.target.closest('.fab-item[data-view-jump]');
    if (item) setTimeout(closeFab, 120);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeFab();
  });
}
