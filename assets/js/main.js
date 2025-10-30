  (function () {
    const toggle = document.getElementById('langToggle');
    const menu = document.getElementById('langMenu');
    function setOpen(open){
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) setOpen(false);
    });
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!menu.classList.contains('open')); }
      if (e.key === 'Escape') setOpen(false);
    });
    menu.querySelectorAll('.lang-option').forEach(btn => {
      btn.addEventListener('click', () => {
        menu.querySelectorAll('.lang-option').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        toggle.querySelector('.lang-code').textContent = btn.dataset.value; 
        setOpen(false);

      });
    });
  })();