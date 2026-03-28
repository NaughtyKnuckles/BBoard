export const APP_VERSION = '3.0.0';
const STORAGE_KEY = 'novaboard_state';
const LEGACY_KEY = 'dashboard_state_v2';

const defaultState = {
  app_version: APP_VERSION,
  settings: {
    userName: '',
    theme: 'light',
    calorieGoal: 2200
  },
  todos: [],
  goals: [],
  schedule: [],
  fitness: {
    mealsByDate: {},
    habitsByDate: {}
  }
};

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function mergeState(base, incoming) {
  return {
    ...base,
    ...incoming,
    settings: { ...base.settings, ...(incoming?.settings || {}) },
    fitness: {
      ...base.fitness,
      ...(incoming?.fitness || {}),
      mealsByDate: { ...base.fitness.mealsByDate, ...(incoming?.fitness?.mealsByDate || {}) },
      habitsByDate: { ...base.fitness.habitsByDate, ...(incoming?.fitness?.habitsByDate || {}) }
    }
  };
}

function migrateLegacy(legacyRaw) {
  const legacy = safeParse(legacyRaw, {});
  const migrated = structuredClone(defaultState);

  migrated.todos = (legacy.todos || []).map((t) => ({
    id: t.id || Date.now() + Math.random(),
    text: t.text || '',
    priority: t.tag === 'urgent' ? 'high' : 'medium',
    done: !!t.done,
    createdAt: Date.now()
  }));

  migrated.goals = (legacy.goals || []).map((g) => ({
    id: g.id || Date.now() + Math.random(),
    title: g.name || 'Goal',
    target: 100,
    current: Math.max(0, Number(g.progress || 0)),
    milestones: []
  }));

  migrated.schedule = legacy.schedule || [];

  migrated.fitness.mealsByDate = {};
  migrated.fitness.habitsByDate = {};

  (legacy.fitness?.workouts || []).forEach((w) => {
    const day = w.date;
    if (!migrated.fitness.habitsByDate[day]) migrated.fitness.habitsByDate[day] = { workout: false, diet: false };
    if (w.type !== 'rest') migrated.fitness.habitsByDate[day].workout = true;
  });

  return migrated;
}

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    const saved = safeParse(raw, defaultState);
    const merged = mergeState(defaultState, saved);
    if (saved.app_version !== APP_VERSION) merged.app_version = APP_VERSION;
    return merged;
  }

  const legacyRaw = localStorage.getItem(LEGACY_KEY);
  if (legacyRaw) {
    const migrated = migrateLegacy(legacyRaw);
    saveState(migrated);
    return migrated;
  }

  return structuredClone(defaultState);
}

export function saveState(state) {
  const payload = { ...state, app_version: APP_VERSION };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function getDefaultState() {
  return structuredClone(defaultState);
}
