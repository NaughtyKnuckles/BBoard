import { esc } from '../js/modules/ui.js';

function sortSchedule(list) {
  list.sort((a, b) => a.time.localeCompare(b.time));
}

export function initScheduleModule({ state, save, notify, refreshAll }) {
  const form = document.getElementById('schedule-form');
  const time = document.getElementById('schedule-time');
  const title = document.getElementById('schedule-title');
  const type = document.getElementById('schedule-type');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!time.value || !title.value.trim()) return;

    state.schedule.push({
      id: crypto.randomUUID(),
      time: time.value,
      title: title.value.trim(),
      type: type.value
    });

    sortSchedule(state.schedule);
    title.value = '';
    save();
    refreshAll();
    notify('Event added to your day plan.');
  });

  document.getElementById('schedule-list')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete]');
    if (!button) return;
    state.schedule = state.schedule.filter((s) => s.id !== button.dataset.delete);
    save();
    refreshAll();
    notify('Event removed.');
  });
}

export function renderSchedule(state) {
  const host = document.getElementById('schedule-list');
  if (!host) return;

  if (!state.schedule.length) {
    host.innerHTML = '<div class="empty">No schedule entries yet.</div>';
    return;
  }

  host.innerHTML = state.schedule
    .map(
      (item) => `
      <article class="timeline-item">
        <div class="timeline-top">
          <strong>${item.time}</strong>
          <span class="badge medium">${esc(item.type)}</span>
        </div>
        <div>${esc(item.title)}</div>
        <div class="item-actions mt-10">
          <button class="icon-btn danger" data-delete="${item.id}">Delete</button>
        </div>
      </article>`
    )
    .join('');
}
