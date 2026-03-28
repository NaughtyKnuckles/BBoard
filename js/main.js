import { loadState, saveState } from './modules/storage.js';
import { applyTheme, formatDateLabel, getGreeting, notify, todayKey } from './modules/ui.js';
import { setupNavigation } from './modules/navigation.js';
import { getGoalStats, initGoalsModule, renderGoals } from './modules/goals.js';
import { getTodoStats, initTodoModule, renderTodos } from './modules/todo.js';
import { initScheduleModule, renderSchedule } from './modules/schedule.js';
import { getHabitStats, getTodayNutritionStats, getWeeklyCalories, initFitnessModule, renderFitness } from './modules/fitness.js';

const state = loadState();

function save() {
  saveState(state);
}

function renderGreeting() {
  const greeting = document.getElementById('greeting-title');
  const date = document.getElementById('date-subtitle');
  if (greeting) greeting.textContent = getGreeting(state.settings.userName);
  if (date) date.textContent = `${formatDateLabel()} • Version ${state.app_version}`;

  const userInput = document.getElementById('username-input');
  if (userInput) userInput.value = state.settings.userName;
}

function overviewCard(title, value, note, emoji) {
  return `
    <article class="card glass">
      <div class="section-head">
        <h3>${emoji} ${title}</h3>
        <p>${note}</p>
      </div>
      <h2 style="margin:10px 0 0;font-size:2rem;">${value}</h2>
    </article>`;
}

function renderHome() {
  const todoStats = getTodoStats(state);
  const goalStats = getGoalStats(state);
  const nutrition = getTodayNutritionStats(state);
  const habits = getHabitStats(state);

  const overview = document.getElementById('overview-cards');
  if (overview) {
    overview.innerHTML = [
      overviewCard('Tasks Completed', `${todoStats.completed}/${todoStats.total}`, 'Daily execution score', '✅'),
      overviewCard('Calories Today', Math.round(nutrition.calories), 'Total intake today', '🔥'),
      overviewCard('Goals Finished', `${goalStats.completed}/${goalStats.total}`, 'Long-term momentum', '🎯')
    ].join('');
  }

  const habitsPanel = document.getElementById('home-weekly-habits');
  if (habitsPanel) {
    habitsPanel.innerHTML = `
      <div class="section-head"><h3>Habit Momentum</h3><p>Keep your streaks alive.</p></div>
      <div class="item-row mt-14"><span>Workout streak</span><strong>${habits.workoutStreak} day(s)</strong></div>
      <div class="item-row mt-10"><span>Diet streak</span><strong>${habits.dietStreak} day(s)</strong></div>
    `;
  }

  const focusPanel = document.getElementById('home-daily-focus');
  if (focusPanel) {
    const todayEvents = state.schedule.filter((s) => s.time && s.title).slice(0, 3);
    focusPanel.innerHTML = `
      <div class="section-head"><h3>Daily Focus</h3><p>What matters next.</p></div>
      ${
        todayEvents.length
          ? todayEvents.map((event) => `<div class="item-row mt-10"><span>${event.time}</span><strong>${event.title}</strong></div>`).join('')
          : '<div class="empty mt-14">No schedule blocks yet.</div>'
      }
    `;
  }
}

function renderAnalytics() {
  const calHost = document.getElementById('calorie-chart');
  const prodHost = document.getElementById('productivity-chart');

  const calorieSeries = getWeeklyCalories(state);
  const maxCalories = Math.max(1, ...calorieSeries.map((x) => x.value));

  if (calHost) {
    calHost.innerHTML = calorieSeries
      .map((point) => {
        const height = Math.max(8, Math.round((point.value / maxCalories) * 170));
        const label = point.day.slice(5);
        return `<div class="bar-col"><div class="bar" style="height:${height}px"></div><div class="bar-value">${point.value}</div><div class="bar-label">${label}</div></div>`;
      })
      .join('');
  }

  if (prodHost) {
    const todoByDay = Array.from({ length: 7 }).map((_, i) => {
      const day = todayKey(i - 6);
      const doneCount = state.todos.filter((t) => t.done && new Date(t.createdAt).toISOString().slice(0, 10) <= day).length;
      return { day, value: doneCount };
    });

    const habits = getHabitStats(state);
    const maxProd = Math.max(1, ...todoByDay.map((x) => x.value), habits.workoutStreak, habits.dietStreak);

    prodHost.innerHTML = todoByDay
      .map((point, i) => {
        const height = Math.max(8, Math.round((point.value / maxProd) * 170));
        const label = point.day.slice(5);
        const suffix = i === 6 ? ` • 🔥${habits.workoutStreak}` : '';
        return `<div class="bar-col"><div class="bar" style="height:${height}px"></div><div class="bar-value">${point.value}${suffix}</div><div class="bar-label">${label}</div></div>`;
      })
      .join('');
  }
}

function refreshAll() {
  renderGreeting();
  renderTodos(state);
  renderGoals(state);
  renderSchedule(state);
  renderFitness(state);
  renderHome();
  renderAnalytics();
}

function setupTopbarActions() {
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    state.settings.theme = state.settings.theme === 'dark' ? 'light' : 'dark';
    applyTheme(state.settings.theme);
    save();
  });

  document.getElementById('save-username-btn')?.addEventListener('click', () => {
    const value = document.getElementById('username-input').value.trim();
    state.settings.userName = value;
    save();
    refreshAll();
    notify(value ? `Welcome, ${value}.` : 'Name cleared.');
  });
}

function init() {
  applyTheme(state.settings.theme);
  setupNavigation((page) => {
    if (page === 'analytics') renderAnalytics();
  });

  setupTopbarActions();

  initTodoModule({ state, save, notify, refreshAll });
  initGoalsModule({ state, save, notify, refreshAll });
  initScheduleModule({ state, save, notify, refreshAll });
  initFitnessModule({ state, save, notify, refreshAll });

  refreshAll();
}

init();
