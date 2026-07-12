/* ============================================================
   FAB MENU — quick-action popover
   ------------------------------------------------------------
   Toggled by clicking the Johny mascot (see mascot.js). This
   module only handles the OPEN/CLOSE state + outside-click and
   Escape dismissal. Selecting an item is delegated to app.js
   (data-view-jump / data-open-task-modal listeners).
   ============================================================ */
const fabMenu = document.getElementById('fabMenu');

function fabAnchor() {
  return document.querySelector('.johny-buddy-body');
}

function closeFab() {
  if (!fabMenu) return;
  fabMenu.hidden = true;
  const a = fabAnchor();
  if (a) {
    a.setAttribute('aria-expanded', 'false');
    a.classList.remove('is-fab-open');
  }
}

function openFab() {
  if (!fabMenu) return;
  fabMenu.hidden = false;
  const a = fabAnchor();
  if (a) {
    a.setAttribute('aria-expanded', 'true');
    a.classList.add('is-fab-open');
  }
}

// Toggle from anywhere (mascot.js dispatches this)
window.addEventListener('johny:fab-toggle', () => {
  if (!fabMenu) return;
  if (fabMenu.hidden) openFab(); else closeFab();
});

// Selecting an item auto-closes after the delegated handler fires
if (fabMenu) {
  fabMenu.addEventListener('click', (e) => {
    if (e.target.closest('.fab-item')) setTimeout(closeFab, 120);
  });
}

// Outside click closes — but ignore clicks on the mascot itself,
// so its own click handler decides open vs close.
document.addEventListener('click', (e) => {
  if (!fabMenu || fabMenu.hidden) return;
  if (fabMenu.contains(e.target)) return;
  if (e.target.closest('.johny-buddy')) return;
  closeFab();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeFab();
});
