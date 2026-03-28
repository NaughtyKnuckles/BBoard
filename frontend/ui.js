const toastContainer = () => document.getElementById('toast-container');

export function formatDateLabel(date = new Date()) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getGreeting(name = '') {
  const hour = new Date().getHours();
  const prefix = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  return name ? `${prefix}, ${name}` : `${prefix}`;
}

export function applyTheme(theme) {
  document.body.classList.toggle('dark', theme === 'dark');
  const button = document.getElementById('theme-toggle');
  if (button) button.textContent = theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
}

export function notify(message) {
  const host = toastContainer();
  if (!host) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  host.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-6px)';
    setTimeout(() => toast.remove(), 180);
  }, 2200);
}

export function progressPercent(value, total) {
  if (!total || total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

export function todayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function esc(value = '') {
  const span = document.createElement('span');
  span.textContent = String(value);
  return span.innerHTML;
}
