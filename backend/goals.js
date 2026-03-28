import { esc, progressPercent } from '../js/modules/ui.js';

export function initGoalsModule({ state, save, notify, refreshAll }) {
  const form = document.getElementById('goal-form');
  const titleInput = document.getElementById('goal-title');
  const targetInput = document.getElementById('goal-target');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const title = titleInput.value.trim();
    const target = Number(targetInput.value);
    if (!title || target <= 0) return;

    state.goals.unshift({
      id: crypto.randomUUID(),
      title,
      target,
      current: 0,
      milestones: []
    });

    titleInput.value = '';
    targetInput.value = '';
    save();
    refreshAll();
    notify('Goal created. Let’s move it forward.');
  });

  document.getElementById('goals-list')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const { id, action } = button.dataset;
    const goal = state.goals.find((g) => g.id === id);

    if (action === 'delete') {
      state.goals = state.goals.filter((g) => g.id !== id);
      notify('Goal removed.');
    }

    if (goal && action === 'plus') {
      goal.current = Math.min(goal.target, goal.current + Math.max(1, Math.round(goal.target * 0.1)));
      if (goal.current === goal.target) notify(`Goal completed: ${goal.title}`);
    }

    if (goal && action === 'minus') {
      goal.current = Math.max(0, goal.current - Math.max(1, Math.round(goal.target * 0.1)));
    }

    save();
    refreshAll();
  });
}

export function renderGoals(state) {
  const host = document.getElementById('goals-list');
  if (!host) return;

  if (!state.goals.length) {
    host.innerHTML = '<div class="empty">No goals yet. Build your first milestone.</div>';
    return;
  }

  host.innerHTML = state.goals
    .map((goal) => {
      const pct = progressPercent(goal.current, goal.target);
      return `
      <article class="item-row">
        <div style="flex:1;min-width:0;">
          <div><strong>${esc(goal.title)}</strong></div>
          <div class="item-meta">${goal.current} / ${goal.target} (${pct}%)</div>
          <div class="progress-track mt-10"><div class="progress-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="item-actions">
          <button class="icon-btn" data-action="minus" data-id="${goal.id}">−</button>
          <button class="icon-btn" data-action="plus" data-id="${goal.id}">+</button>
          <button class="icon-btn danger" data-action="delete" data-id="${goal.id}">✕</button>
        </div>
      </article>`;
    })
    .join('');
}

export function getGoalStats(state) {
  const total = state.goals.length;
  const completed = state.goals.filter((g) => g.current >= g.target).length;
  return { total, completed };
}
