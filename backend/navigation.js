export function setupNavigation(onChange) {
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;

  nav.addEventListener('click', (event) => {
    const btn = event.target.closest('.nav-item');
    if (!btn) return;
    const page = btn.dataset.page;
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.page').forEach((section) => section.classList.remove('active'));
    const activeSection = document.getElementById(`page-${page}`);
    if (activeSection) activeSection.classList.add('active');

    if (onChange) onChange(page);
  });
}
