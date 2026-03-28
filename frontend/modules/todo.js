import { esc, progressPercent } from './ui.js';

export function initTodoModule({ state, save, notify, refreshAll }) {
  const form = document.getElementById('todo-form');
  const input = document.getElementById('todo-input');
  const priority = document.getElementById('todo-priority');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    state.todos.unshift({
      id: crypto.randomUUID(),
      text,
      priority: priority.value,
      done: false,
      createdAt: Date.now()
    });
    input.value = '';
    save();
    refreshAll();
    notify('Task added. Let’s execute.');
  });

  document.getElementById('todo-list')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-action]');
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const task = state.todos.find((t) => t.id === id);
    if (!task) return;

    if (action === 'toggle') {
      task.done = !task.done;
      notify(task.done ? 'Task completed. Nice.' : 'Task marked as active again.');
    }
    if (action === 'delete') {
      state.todos = state.todos.filter((t) => t.id !== id);
      notify('Task removed.');
    }

    save();
    refreshAll();
  });
}

export function renderTodos(state) {
  const host = document.getElementById('todo-list');
  const progress = document.getElementById('todo-progress');
  if (!host || !progress) return;

  if (!state.todos.length) {
    host.innerHTML = '<div class="empty">No tasks yet. Add your first one above.</div>';
    progress.textContent = '0% completed';
    return;
  }

  const completed = state.todos.filter((t) => t.done).length;
  const pct = progressPercent(completed, state.todos.length);
  progress.textContent = `${completed} / ${state.todos.length} tasks done (${pct}%)`;

  host.innerHTML = state.todos
    .map(
      (task) => `
      <article class="item-row" style="opacity:${task.done ? 0.68 : 1}">
        <div>
          <div>${task.done ? '✅' : '⬜'} ${esc(task.text)}</div>
          <div class="item-meta">${new Date(task.createdAt).toLocaleDateString()}</div>
        </div>
        <div class="item-actions">
          <span class="badge ${task.priority}">${task.priority}</span>
          <button class="icon-btn" data-action="toggle" data-id="${task.id}">${task.done ? 'Undo' : 'Done'}</button>
          <button class="icon-btn danger" data-action="delete" data-id="${task.id}">✕</button>
        </div>
      </article>`
    )
    .join('');
}

export function getTodoStats(state) {
  const total = state.todos.length;
  const completed = state.todos.filter((t) => t.done).length;
  return { total, completed };
}
