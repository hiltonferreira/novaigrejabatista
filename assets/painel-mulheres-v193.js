(() => {
  'use strict';
  const form = document.getElementById('registration-search');
  if (!form) return;
  const input = form.querySelector('[name="q"]');
  let restoring = false;
  function restoreList() {
    if (restoring || input.value.trim() || !form.dataset.appliedQuery) return;
    restoring = true;
    window.location.assign(form.getAttribute('action') || window.location.pathname);
  }
  input.addEventListener('input', restoreList);
  input.addEventListener('search', restoreList);
})();
