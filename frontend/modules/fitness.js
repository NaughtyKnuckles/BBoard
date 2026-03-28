import { fetchFoodByBarcode, fetchFoodByName } from './api.js';
import { esc, progressPercent, todayKey } from './ui.js';

function ensureTodayCollections(state) {
  const today = todayKey();
  if (!state.fitness.mealsByDate[today]) state.fitness.mealsByDate[today] = [];
  if (!state.fitness.habitsByDate[today]) state.fitness.habitsByDate[today] = { workout: false, diet: false };
}

function dayMeals(state, day = todayKey()) {
  return state.fitness.mealsByDate[day] || [];
}

function sumMacros(meals) {
  return meals.reduce(
    (acc, meal) => {
      acc.calories += Number(meal.calories || 0);
      acc.protein += Number(meal.protein || 0);
      acc.carbs += Number(meal.carbs || 0);
      acc.fat += Number(meal.fat || 0);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function getStreak(state, habitKey) {
  let streak = 0;
  let offset = 0;

  while (offset < 365) {
    const day = todayKey(-offset);
    const habits = state.fitness.habitsByDate[day];
    if (!habits || !habits[habitKey]) break;
    streak += 1;
    offset += 1;
  }

  return streak;
}

export function initFitnessModule({ state, save, notify, refreshAll }) {
  ensureTodayCollections(state);

  document.getElementById('goal-calorie-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const goal = Number(document.getElementById('calorie-goal-input').value);
    if (goal < 1200) return;
    state.settings.calorieGoal = goal;
    save();
    refreshAll();
    notify('Daily calorie goal updated.');
  });

  document.getElementById('meal-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    ensureTodayCollections(state);
    const meal = {
      id: crypto.randomUUID(),
      category: document.getElementById('meal-category').value,
      name: document.getElementById('meal-name').value.trim(),
      calories: Number(document.getElementById('meal-calories').value),
      protein: Number(document.getElementById('meal-protein').value),
      carbs: Number(document.getElementById('meal-carbs').value),
      fat: Number(document.getElementById('meal-fat').value),
      createdAt: Date.now()
    };

    if (!meal.name) return;
    state.fitness.mealsByDate[todayKey()].unshift(meal);
    document.getElementById('meal-form').reset();
    save();
    refreshAll();
    notify('Meal logged. Nice consistency.');
  });

  document.getElementById('meals-list')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-delete-meal]');
    if (!button) return;
    const today = todayKey();
    state.fitness.mealsByDate[today] = dayMeals(state, today).filter((m) => m.id !== button.dataset.deleteMeal);
    save();
    refreshAll();
    notify('Meal removed.');
  });

  document.getElementById('food-search-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const query = document.getElementById('food-search-input').value.trim();
    const resultsHost = document.getElementById('food-results');
    if (!query || !resultsHost) return;

    resultsHost.innerHTML = '<div class="empty">Searching…</div>';
    const foods = await fetchFoodByName(query);
    if (!foods.length) {
      resultsHost.innerHTML = '<div class="empty">No results found. Use manual meal input.</div>';
      return;
    }

    resultsHost.innerHTML = foods
      .map(
        (food) => `
        <article class="item-row">
          <div>
            <strong>${esc(food.name)}</strong>
            <div class="item-meta">${food.calories} kcal • P ${food.protein}g • C ${food.carbs}g • F ${food.fat}g</div>
          </div>
          <button class="icon-btn" data-apply-food='${JSON.stringify(food).replace(/'/g, '&apos;')}'>Use</button>
        </article>`
      )
      .join('');
  });

  document.getElementById('barcode-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const code = document.getElementById('barcode-input').value.trim();
    if (!code) return;
    const food = await fetchFoodByBarcode(code);
    if (!food) return notify('No product found for that barcode.');
    applyFoodToForm(food);
    notify('Barcode data loaded to meal form.');
  });

  document.getElementById('food-results')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-apply-food]');
    if (!button) return;
    const food = JSON.parse(button.dataset.applyFood.replace(/&apos;/g, "'"));
    applyFoodToForm(food);
    notify('Food values copied to meal form.');
  });

  document.querySelectorAll('.habit-btn').forEach((button) => {
    button.addEventListener('click', () => {
      ensureTodayCollections(state);
      const key = button.dataset.habit;
      const habits = state.fitness.habitsByDate[todayKey()];
      habits[key] = !habits[key];
      save();
      refreshAll();
      notify(habits[key] ? `Habit logged: ${key}` : `Habit unlogged: ${key}`);
    });
  });
}

function applyFoodToForm(food) {
  document.getElementById('meal-name').value = food.name;
  document.getElementById('meal-calories').value = Math.round(food.calories || 0);
  document.getElementById('meal-protein').value = Number(food.protein || 0).toFixed(1);
  document.getElementById('meal-carbs').value = Number(food.carbs || 0).toFixed(1);
  document.getElementById('meal-fat').value = Number(food.fat || 0).toFixed(1);
}

export function renderFitness(state) {
  ensureTodayCollections(state);

  const meals = dayMeals(state);
  const macro = sumMacros(meals);
  const goal = state.settings.calorieGoal || 2200;
  const pct = progressPercent(macro.calories, goal);

  const meterLabel = document.getElementById('calorie-meter-label');
  const macroLabel = document.getElementById('macro-summary');
  const bar = document.getElementById('calorie-progress');
  if (meterLabel) meterLabel.textContent = `${Math.round(macro.calories)} / ${goal} kcal`;
  if (macroLabel) macroLabel.textContent = `P ${macro.protein.toFixed(1)}g • C ${macro.carbs.toFixed(1)}g • F ${macro.fat.toFixed(1)}g`;
  if (bar) bar.style.width = `${pct}%`;

  const mealHost = document.getElementById('meals-list');
  if (mealHost) {
    mealHost.innerHTML = meals.length
      ? meals
          .map(
            (meal) => `
            <article class="item-row">
              <div>
                <strong>${esc(meal.category)} • ${esc(meal.name)}</strong>
                <div class="item-meta">${meal.calories} kcal • P ${meal.protein}g • C ${meal.carbs}g • F ${meal.fat}g</div>
              </div>
              <button class="icon-btn danger" data-delete-meal="${meal.id}">Delete</button>
            </article>`
          )
          .join('')
      : '<div class="empty">No meals logged today yet.</div>';
  }

  const todayHabits = state.fitness.habitsByDate[todayKey()] || { workout: false, diet: false };
  document.querySelectorAll('.habit-btn').forEach((btn) => {
    const key = btn.dataset.habit;
    btn.classList.toggle('active', !!todayHabits[key]);
  });

  const workoutStreak = getStreak(state, 'workout');
  const dietStreak = getStreak(state, 'diet');
  const status = document.getElementById('habit-status');
  if (status) status.textContent = `Workout streak: ${workoutStreak} day(s) • Diet streak: ${dietStreak} day(s)`;
}

export function getTodayNutritionStats(state) {
  const meals = dayMeals(state);
  return sumMacros(meals);
}

export function getHabitStats(state) {
  return {
    workoutStreak: getStreak(state, 'workout'),
    dietStreak: getStreak(state, 'diet')
  };
}

export function getWeeklyCalories(state) {
  return Array.from({ length: 7 }).map((_, i) => {
    const day = todayKey(i - 6);
    const meals = state.fitness.mealsByDate[day] || [];
    const total = meals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
    return { day, value: Math.round(total) };
  });
}
