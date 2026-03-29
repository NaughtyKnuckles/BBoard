import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Flame, Star, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';

const PLAN_STORAGE_KEY = 'byenboard_fitness_plan';
const PR_STORAGE_KEY = 'byenboard_prs';
const NUTRITION_LOG_STORAGE_KEY = 'byenboard_nutrition_log';

const workoutSchedule = [
  {
    day: 'Monday',
    short: 'Mon',
    type: 'Push',
    focus: 'Chest, Shoulders, Triceps',
    exercises: [
      'Push-up / Bench Press — 3 × 8–12',
      'Diamond Push-up — 3 × 6–10',
      'Pike Push-up — 3 × 6–10',
      'Tricep Dip — 3 × 10–12',
      'Plank — 3 × 45s'
    ]
  },
  {
    day: 'Tuesday',
    short: 'Tue',
    type: 'Walk',
    focus: 'Light Cardio',
    exercises: ['5 km brisk walk', 'Target pace: 9:30–10:00 min/km']
  },
  {
    day: 'Wednesday',
    short: 'Wed',
    type: 'Legs',
    focus: 'Legs + Core',
    exercises: [
      'Bodyweight Squat — 4 × 20',
      'Reverse Lunge — 3 × 12 each leg',
      'Glute Bridge — 3 × 20',
      'Leg Raises — 3 × 12',
      'Bicycle Crunch — 3 × 20'
    ]
  },
  {
    day: 'Thursday',
    short: 'Thu',
    type: 'Walk',
    focus: 'Active Recovery',
    exercises: ['5 km walk or light stretching', 'Full muscle rest']
  },
  {
    day: 'Friday',
    short: 'Fri',
    type: 'Pull',
    focus: 'Back, Biceps, Forearms',
    exercises: [
      'Table Row / Lat Pulldown — 3 × 8–12',
      'Dumbbell Row — 3 × 10–12 each',
      'Bicep Curl — 3 × 10–12',
      'Hammer Curl — 3 × 10–12',
      'Wrist Curl — 3 × 20'
    ]
  },
  {
    day: 'Saturday',
    short: 'Sat',
    type: 'Legs',
    focus: 'Legs + Core',
    exercises: ['Same as Wednesday', 'Add: Wall Sit 3 × 45s', 'Mountain Climber 3 × 30s']
  },
  {
    day: 'Sunday',
    short: 'Sun',
    type: 'Rest',
    focus: 'Full Rest',
    exercises: ['Sleep 8+ hours. Recover.']
  }
];

const nutritionRows = [
  ['Whole egg', '1 large (50g)', 70, '6g', '0g', '5g', 'Protein', true],
  ['Bangus grilled', '1 fillet (120g)', 190, '26g', '0g', '9g', 'Protein', true],
  ['Tilapia grilled', '1 fillet (120g)', 160, '26g', '0g', '4g', 'Protein', true],
  ['Sardines canned (tomato)', '1 can (155g)', 180, '22g', '3g', '8g', 'Protein', true],
  ['Sardines canned (oil)', '1 can (155g)', 210, '22g', '0g', '13g', 'Protein', true],
  ['Canned tuna (water)', '1 can (185g)', 130, '30g', '0g', '1g', 'Protein', true],
  ['Mackerel grilled', '1 medium (100g)', 175, '19g', '0g', '11g', 'Protein', true],
  ['Dried fish (tuyo/daing)', '2 pieces (40g)', 110, '18g', '0g', '4g', 'Protein', true],
  ['Chicken breast grilled', '1 breast (120g)', 165, '31g', '0g', '4g', 'Protein', true],
  ['Corned beef canned', '½ can (100g)', 210, '14g', '1g', '16g', 'Protein', false],
  ['Longganisa', '2 pieces (60g)', 200, '8g', '6g', '16g', 'Fat', false],
  ['Chicken thigh', '1 thigh (100g)', 210, '22g', '0g', '13g', 'Protein', false],
  ['Pork belly (liempo)', '1 slice (100g)', 395, '18g', '0g', '35g', 'Fat', false],
  ['Cooked white rice', '1 cup (186g)', 200, '4g', '44g', '0g', 'Carb', false],
  ['Instant noodles', '1 pack (80g)', 350, '8g', '52g', '12g', 'Carb', false],
  ['Pandesal', '1 piece (30g)', 90, '3g', '16g', '2g', 'Carb', false],
  ['Banana (lakatan)', '1 medium (100g)', 90, '1g', '23g', '0g', 'Carb', true],
  ['Saging na saba', '1 piece (100g)', 110, '1g', '28g', '0g', 'Carb', false],
  ['Sweet potato boiled', '1 medium (130g)', 112, '2g', '26g', '0g', 'Carb', true],
  ['Kangkong cooked', '1 cup (56g)', 20, '3g', '3g', '0g', 'Vegetable', true],
  ['Ampalaya cooked', '½ cup (60g)', 12, '1g', '3g', '0g', 'Vegetable', true],
  ['Sitaw cooked', '1 cup (100g)', 31, '2g', '7g', '0g', 'Vegetable', true],
  ['Pechay cooked', '1 cup (85g)', 13, '2g', '2g', '0g', 'Vegetable', true],
  ['Malunggay (moringa)', '¼ cup (20g)', 13, '2g', '2g', '0g', 'Vegetable', true],
  ['Tomato', '1 medium (123g)', 22, '1g', '5g', '0g', 'Vegetable', false],
  ['Water', '1 glass (250ml)', 0, '0g', '0g', '0g', 'Drink', true],
  ['Black coffee (no sugar)', '1 cup (240ml)', 2, '0g', '0g', '0g', 'Drink', true],
  ['Calamansi juice (unsweetened)', '4 pcs in water', 10, '0g', '3g', '0g', 'Drink', false],
  ['Softdrinks/juice bottled', '1 can (355ml)', 150, '0g', '39g', '0g', 'Drink', false]
].map(([name, serving, calories, protein, carbs, fat, category, best]) => ({
  name,
  serving,
  calories,
  protein,
  carbs,
  fat,
  category,
  best
}));

const typeClasses = {
  Push: 'border-blue-200 bg-blue-50 text-blue-700',
  Pull: 'border-purple-200 bg-purple-50 text-purple-700',
  Legs: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Walk: 'border-amber-200 bg-amber-50 text-amber-700',
  Rest: 'border-slate-200 bg-slate-100 text-slate-600'
};

const typeCellClasses = {
  Push: 'border-blue-200 bg-blue-50',
  Pull: 'border-purple-200 bg-purple-50',
  Legs: 'border-emerald-200 bg-emerald-50',
  Walk: 'border-amber-200 bg-amber-50',
  Rest: 'border-slate-200 bg-slate-100'
};

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function normalizeFitnessData(raw) {
  if (!raw || typeof raw !== 'object') {
    return { currentDate: getTodayKey(), dayChecks: {}, loggedByDate: {}, notesByDate: {} };
  }
  return {
    currentDate: raw.currentDate || getTodayKey(),
    dayChecks: raw.dayChecks && typeof raw.dayChecks === 'object' ? raw.dayChecks : {},
    loggedByDate: raw.loggedByDate && typeof raw.loggedByDate === 'object' ? raw.loggedByDate : {},
    notesByDate: raw.notesByDate && typeof raw.notesByDate === 'object' ? raw.notesByDate : {}
  };
}

function getSavedFitnessPlan() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PLAN_STORAGE_KEY) || '{}');
    const normalized = normalizeFitnessData(parsed);
    if (normalized.currentDate !== getTodayKey()) {
      normalized.dayChecks = {};
      normalized.currentDate = getTodayKey();
    }
    return normalized;
  } catch {
    return normalizeFitnessData({});
  }
}

function saveFitnessPlan(value) {
  window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(value));
}

function getSavedPrs() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PR_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePrs(value) {
  window.localStorage.setItem(PR_STORAGE_KEY, JSON.stringify(value));
}

function getSavedNutritionLog() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(NUTRITION_LOG_STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveNutritionLog(value) {
  window.localStorage.setItem(NUTRITION_LOG_STORAGE_KEY, JSON.stringify(value));
}

function getMonday(date) {
  const copy = new Date(date);
  const day = (copy.getDay() + 6) % 7;
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function monthMatrix(viewDate) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const first = getMonday(start);
  const last = new Date(end);
  const offset = (7 - ((last.getDay() + 6) % 7) - 1 + 7) % 7;
  last.setDate(last.getDate() + offset);

  const days = [];
  const cursor = new Date(first);
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  const rows = [];
  for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
  return rows;
}

function toNumber(value) {
  return Number(String(value).replace('g', '').replace(' cal', '')) || 0;
}

function multiply(value, servings) {
  return Math.round(value * servings * 10) / 10;
}

export default function MyPlanPanel() {
  const [section, setSection] = useState('workout');
  const [workoutView, setWorkoutView] = useState('week');
  const [fitnessPlan, setFitnessPlan] = useState(() => getSavedFitnessPlan());
  const [pulseMap, setPulseMap] = useState({});
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [openCalendarCell, setOpenCalendarCell] = useState('');

  const [prExpanded, setPrExpanded] = useState(false);
  const [prs, setPrs] = useState(() => getSavedPrs());
  const [prForm, setPrForm] = useState({ exercise: '', customExercise: '', record: '', date: getTodayKey(), note: '' });

  const [nutritionFilter, setNutritionFilter] = useState('All');
  const [nutritionLog, setNutritionLog] = useState(() => getSavedNutritionLog());
  const [foodForm, setFoodForm] = useState({ foodName: nutritionRows[0]?.name || '', servings: 1, note: '' });

  const weekDates = useMemo(() => {
    const monday = getMonday(new Date());
    return workoutSchedule.map((item, index) => {
      const d = new Date(monday);
      d.setDate(d.getDate() + index);
      return { ...item, dateKey: formatDateKey(d) };
    });
  }, []);

  const streak = useMemo(() => {
    let value = 0;
    for (const day of weekDates) {
      if (fitnessPlan.loggedByDate[day.dateKey]) value += 1;
      else break;
    }
    return value;
  }, [fitnessPlan.loggedByDate, weekDates]);

  const exerciseProgress = useMemo(
    () =>
      weekDates.reduce((acc, day) => {
        const checked = fitnessPlan.dayChecks[day.day] || [];
        const done = checked.filter(Boolean).length;
        acc[day.day] = { done, total: day.exercises.length, allDone: day.exercises.length > 0 && done === day.exercises.length };
        return acc;
      }, {}),
    [fitnessPlan.dayChecks, weekDates]
  );


  const filteredFoods = useMemo(() => {
    if (nutritionFilter === 'All') return nutritionRows;
    if (nutritionFilter === 'Best Picks') return nutritionRows.filter((item) => item.best);
    if (nutritionFilter === 'Protein') return nutritionRows.filter((item) => item.category === 'Protein');
    if (nutritionFilter === 'Carbs') return nutritionRows.filter((item) => item.category === 'Carb');
    return nutritionRows.filter((item) => item.category === 'Vegetable');
  }, [nutritionFilter]);

  const todayLog = nutritionLog[getTodayKey()] || [];

  const totals = useMemo(() => {
    return todayLog.reduce(
      (acc, row) => ({
        calories: acc.calories + row.calories,
        protein: acc.protein + row.protein,
        carbs: acc.carbs + row.carbs,
        fat: acc.fat + row.fat
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [todayLog]);

  const exerciseOptions = useMemo(() => {
    return Array.from(new Set(workoutSchedule.flatMap((day) => day.exercises))).sort();
  }, []);

  const groupedPrs = useMemo(() => {
    const grouped = prs.reduce((acc, item) => {
      const key = item.exercise;
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});
    Object.values(grouped).forEach((rows) => rows.sort((a, b) => new Date(a.date) - new Date(b.date)));
    return grouped;
  }, [prs]);

  const mostLoggedExercise = useMemo(() => {
    const entries = Object.entries(groupedPrs).sort((a, b) => b[1].length - a[1].length);
    return entries[0]?.[0] || '';
  }, [groupedPrs]);

  const calendarRows = useMemo(() => monthMatrix(calendarDate), [calendarDate]);

  const monthSummary = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const monthEntries = Object.entries(fitnessPlan.loggedByDate)
      .filter(([key]) => {
        const date = new Date(`${key}T00:00:00`);
        return date.getFullYear() === year && date.getMonth() === month;
      })
      .map(([, value]) => value);

    const totalDays = new Date(year, month + 1, 0).getDate();
    const totalLogged = monthEntries.length;
    const totalWorkouts = monthEntries.filter((item) => item.type !== 'Rest').length;
    const totalRest = monthEntries.filter((item) => item.type === 'Rest').length;

    const dates = Object.keys(fitnessPlan.loggedByDate)
      .filter((key) => {
        const date = new Date(`${key}T00:00:00`);
        return date.getFullYear() === year && date.getMonth() === month;
      })
      .sort();

    let bestStreak = 0;
    let current = 0;
    let previous = null;
    for (const key of dates) {
      const date = new Date(`${key}T00:00:00`);
      if (!previous) {
        current = 1;
      } else {
        const diff = (date - previous) / (24 * 60 * 60 * 1000);
        current = diff === 1 ? current + 1 : 1;
      }
      previous = date;
      if (current > bestStreak) bestStreak = current;
    }

    return {
      totalWorkouts,
      totalRest,
      bestStreak,
      completionRate: totalDays ? Math.round((totalLogged / totalDays) * 100) : 0
    };
  }, [calendarDate, fitnessPlan.loggedByDate]);

  const toggleExercise = (dayName, index) => {
    const existing = fitnessPlan.dayChecks[dayName] || [];
    const nextChecks = [...existing];
    nextChecks[index] = !nextChecks[index];

    const dayMeta = weekDates.find((day) => day.day === dayName);
    const total = dayMeta?.exercises.length || 0;
    const done = nextChecks.filter(Boolean).length;

    const next = {
      ...fitnessPlan,
      currentDate: getTodayKey(),
      dayChecks: { ...fitnessPlan.dayChecks, [dayName]: nextChecks }
    };
    setFitnessPlan(next);
    saveFitnessPlan(next);

    if (total > 0 && done === total) {
      setPulseMap((prev) => ({ ...prev, [dayName]: true }));
      setTimeout(() => {
        setPulseMap((prev) => ({ ...prev, [dayName]: false }));
      }, 700);
    }
  };

  const logWorkoutDay = (day) => {
    const existing = fitnessPlan.loggedByDate[day.dateKey];
    const progress = exerciseProgress[day.day] || { done: 0, total: day.exercises.length };
    const nextLoggedByDate = { ...fitnessPlan.loggedByDate };
    if (existing) {
      delete nextLoggedByDate[day.dateKey];
    } else {
      nextLoggedByDate[day.dateKey] = {
        type: day.type,
        dayName: day.day,
        completedCount: progress.done,
        totalCount: progress.total,
        note: fitnessPlan.notesByDate[day.dateKey] || ''
      };
    }

    const next = { ...fitnessPlan, loggedByDate: nextLoggedByDate };
    setFitnessPlan(next);
    saveFitnessPlan(next);
  };

  const addPr = () => {
    const exercise = prForm.exercise === '__custom__' ? prForm.customExercise.trim() : prForm.exercise;
    if (!exercise || !prForm.record.trim() || !prForm.date) return;
    const item = {
      id: crypto.randomUUID(),
      exercise,
      record: prForm.record.trim(),
      date: prForm.date,
      note: prForm.note.trim()
    };
    const next = [...prs, item];
    setPrs(next);
    savePrs(next);
    setPrForm({ exercise: '', customExercise: '', record: '', date: getTodayKey(), note: '' });
  };

  const deletePr = (id) => {
    const next = prs.filter((item) => item.id !== id);
    setPrs(next);
    savePrs(next);
  };

  const addFoodToLog = () => {
    const food = nutritionRows.find((item) => item.name === foodForm.foodName);
    if (!food) return;
    const servings = Number(foodForm.servings) || 1;
    const entry = {
      id: crypto.randomUUID(),
      name: food.name,
      servings,
      calories: multiply(food.calories, servings),
      protein: multiply(toNumber(food.protein), servings),
      carbs: multiply(toNumber(food.carbs), servings),
      fat: multiply(toNumber(food.fat), servings),
      note: foodForm.note.trim()
    };
    const key = getTodayKey();
    const next = { ...nutritionLog, [key]: [...(nutritionLog[key] || []), entry] };
    setNutritionLog(next);
    saveNutritionLog(next);
    setFoodForm((prev) => ({ ...prev, servings: 1, note: '' }));
  };

  const removeFood = (id) => {
    const key = getTodayKey();
    const nextRows = (nutritionLog[key] || []).filter((item) => item.id !== id);
    const next = { ...nutritionLog, [key]: nextRows };
    setNutritionLog(next);
    saveNutritionLog(next);
  };

  const clearFoodLog = () => {
    const key = getTodayKey();
    const next = { ...nutritionLog, [key]: [] };
    setNutritionLog(next);
    saveNutritionLog(next);
  };

  const meterItems = [
    { label: 'Calories', value: totals.calories, target: 1950, suffix: '' },
    { label: 'Protein', value: totals.protein, target: 110, suffix: 'g' },
    { label: 'Carbs', value: totals.carbs, target: 220, suffix: 'g' },
    { label: 'Fat', value: totals.fat, target: 55, suffix: 'g' }
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { id: 'workout', label: 'Weekly Workout Plan' },
          { id: 'nutrition', label: 'Nutrition Guide' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition duration-200 ${section === item.id ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === 'workout' ? (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'week', label: 'Week View' },
              { id: 'month', label: 'Month View' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setWorkoutView(item.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-medium transition duration-200 ${workoutView === item.id ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {workoutView === 'week' ? (
            <>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Weekly progress</p>
                  <p className="inline-flex items-center gap-1 text-sm text-slate-600"><Flame className="h-4 w-4 text-amber-500" /> 🔥 {streak} day streak</p>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {weekDates.map((day) => (
                    <div key={day.day} className="text-center">
                      <div className={`mx-auto mb-1 h-8 w-8 rounded-full border transition duration-200 ${fitnessPlan.loggedByDate[day.dateKey] ? typeClasses[day.type] : 'border-slate-200 bg-white text-slate-400'}`} />
                      <p className="text-[11px] text-slate-500">{day.short}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
                {weekDates.map((day) => {
                  const checked = fitnessPlan.dayChecks[day.day] || [];
                  const progress = exerciseProgress[day.day] || { done: 0, total: day.exercises.length, allDone: false };
                  const isLogged = Boolean(fitnessPlan.loggedByDate[day.dateKey]);
                  return (
                    <article key={day.day} className="flex h-full flex-col rounded-2xl border border-slate-200 p-4">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">{day.day}</h3>
                          <p className="text-xs text-slate-500">{day.focus}</p>
                          <p className="mt-2 text-xs text-slate-600">{progress.done} / {progress.total} exercises done</p>
                          <div className="mt-1 h-1.5 w-full max-w-[180px] rounded-full bg-slate-200">
                            <div className="h-1.5 rounded-full bg-indigo-500 transition-all duration-300 ease-out" style={{ width: `${(progress.done / Math.max(progress.total, 1)) * 100}%` }} />
                          </div>
                        </div>
                        <span className={`rounded-full border px-2 py-1 text-xs ${typeClasses[day.type]}`}>{day.type}</span>
                      </div>

                      <div className="flex-1 space-y-1">
                        {day.exercises.map((exercise, index) => {
                          const done = Boolean(checked[index]);
                          return (
                            <label key={exercise} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition duration-200 hover:bg-slate-50">
                              <input type="checkbox" checked={done} onChange={() => toggleExercise(day.day, index)} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
                              <span className={`text-xs transition duration-200 ${done ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{exercise}</span>
                            </label>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => logWorkoutDay(day)}
                        className={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition duration-200 ${progress.allDone ? 'bg-indigo-600 text-white hover:bg-indigo-500' : isLogged ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-indigo-600 text-white hover:bg-indigo-500'} ${pulseMap[day.day] ? 'animate-pulse' : ''}`}
                      >
                        {isLogged ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                        {progress.allDone ? 'Complete — Log day ✓' : isLogged ? 'Logged' : 'Log workout'}
                      </button>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <button onClick={() => setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition duration-200 hover:bg-slate-100">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <h3 className="text-sm font-semibold text-slate-900">{calendarDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition duration-200 hover:bg-slate-100">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-slate-500">
                {dayNames.map((name) => <div key={name} className="py-1">{name}</div>)}
              </div>
              <div className="space-y-1">
                {calendarRows.map((week, rowIndex) => (
                  <div key={rowIndex} className="grid grid-cols-7 gap-1">
                    {week.map((day) => {
                      const key = formatDateKey(day);
                      const log = fitnessPlan.loggedByDate[key];
                      const isCurrentMonth = day.getMonth() === calendarDate.getMonth();
                      return (
                        <button
                          key={key}
                          onClick={() => setOpenCalendarCell((prev) => (prev === key ? '' : key))}
                          className={`relative aspect-square rounded-xl border p-1 text-left transition duration-200 ${log ? typeCellClasses[log.type] || 'border-slate-200 bg-slate-100' : 'border-slate-200 bg-white'} ${isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}`}
                        >
                          <span className="text-[11px]">{day.getDate()}</span>
                          {openCalendarCell === key && log ? (
                            <div className="absolute left-1/2 top-full z-10 mt-1 w-48 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-600 shadow-soft">
                              <p className="font-semibold text-slate-900">{log.dayName} · {day.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              <p className="mt-1">Type: {log.type}</p>
                              <p>{log.completedCount || 0} / {log.totalCount || 0} exercises done</p>
                              <p>{log.note || 'No note saved'}</p>
                            </div>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">Total workouts: <span className="font-semibold text-slate-900">{monthSummary.totalWorkouts}</span></div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">Total rest days: <span className="font-semibold text-slate-900">{monthSummary.totalRest}</span></div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">Your best this month: <span className="font-semibold text-slate-900">{monthSummary.bestStreak} day streak</span></div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">Completion rate: <span className="font-semibold text-slate-900">{monthSummary.completionRate}%</span></div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200">
            <button onClick={() => setPrExpanded((prev) => !prev)} className="flex w-full items-center justify-between p-4 text-left transition duration-200 hover:bg-slate-50">
              <div>
                <p className="text-sm font-semibold text-slate-900">Personal Records</p>
                <p className="text-xs text-slate-500">Track your best sets, reps, and holds.</p>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-500 transition duration-200 ${prExpanded ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-out ${prExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="space-y-4 border-t border-slate-200 p-4">
                  <div className="grid gap-2 md:grid-cols-2">
                    <label className="text-xs text-slate-600">Exercise
                      <select value={prForm.exercise} onChange={(e) => setPrForm((prev) => ({ ...prev, exercise: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                        <option value="">Select exercise</option>
                        {exerciseOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                        <option value="__custom__">Custom exercise</option>
                      </select>
                    </label>
                    {prForm.exercise === '__custom__' ? (
                      <label className="text-xs text-slate-600">Custom exercise
                        <input value={prForm.customExercise} onChange={(e) => setPrForm((prev) => ({ ...prev, customExercise: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                      </label>
                    ) : null}
                    <label className="text-xs text-slate-600">Record
                      <input value={prForm.record} onChange={(e) => setPrForm((prev) => ({ ...prev, record: e.target.value }))} placeholder="20 reps" className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                    </label>
                    <label className="text-xs text-slate-600">Date
                      <input type="date" value={prForm.date} onChange={(e) => setPrForm((prev) => ({ ...prev, date: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                    </label>
                  </div>
                  <label className="block text-xs text-slate-600">Note (optional)
                    <input value={prForm.note} onChange={(e) => setPrForm((prev) => ({ ...prev, note: e.target.value }))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
                  </label>
                  <button onClick={addPr} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-indigo-500">Save PR</button>

                  {mostLoggedExercise ? <p className="text-xs text-slate-600">Most logged exercise: <span className="font-semibold text-slate-900">{mostLoggedExercise}</span></p> : null}

                  {Object.keys(groupedPrs).length === 0 ? (
                    <p className="text-sm text-slate-500">No records yet. Start logging.</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(groupedPrs).map(([exercise, entries]) => (
                        <div key={exercise} className="rounded-xl border border-slate-200 p-3">
                          <p className="text-sm font-semibold text-slate-900">{exercise}</p>
                          <div className="mt-2 space-y-2">
                            {entries.map((entry, index) => (
                              <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-medium text-slate-800">{entry.record}</span>
                                  <span>{new Date(`${entry.date}T00:00:00`).toLocaleDateString()}</span>
                                  {entry.note ? <span>• {entry.note}</span> : null}
                                  {index === entries.length - 1 ? <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700">Latest</span> : null}
                                </div>
                                <button onClick={() => deletePr(entry.id)} className="rounded-md p-1 text-slate-500 transition duration-200 hover:bg-slate-200"><X className="h-3.5 w-3.5" /></button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Calories', '1,950 / day'],
              ['Protein', '110g / day'],
              ['Carbs', '220g / day'],
              ['Fat', '55g / day']
            ].map(([label, value]) => (
              <article key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
              </article>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="mb-4 flex flex-wrap gap-2">
              {['All', 'Protein', 'Carbs', 'Vegetables', 'Best Picks'].map((item) => (
                <button
                  key={item}
                  onClick={() => setNutritionFilter(item)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition duration-200 ${nutritionFilter === item ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="pb-2">Food name</th>
                    <th className="pb-2">Serving size</th>
                    <th className="pb-2">Calories</th>
                    <th className="pb-2">Protein</th>
                    <th className="pb-2">Carbs</th>
                    <th className="pb-2">Fat</th>
                    <th className="pb-2">Category</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFoods.map((food) => (
                    <tr key={food.name} className="border-b border-slate-100 text-slate-700">
                      <td className="py-2 font-medium text-slate-900">{food.name}</td>
                      <td className="py-2">{food.serving}</td>
                      <td className="py-2">{food.calories} cal</td>
                      <td className="py-2">{food.protein}</td>
                      <td className="py-2">{food.carbs}</td>
                      <td className="py-2">{food.fat}</td>
                      <td className="inline-flex items-center gap-1 py-2">{food.category}{food.best ? <Star className="h-3.5 w-3.5 text-amber-500" /> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="grid gap-2 md:grid-cols-[2fr,1fr,2fr,auto]">
              <select value={foodForm.foodName} onChange={(e) => setFoodForm((prev) => ({ ...prev, foodName: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none">
                {nutritionRows.map((food) => <option key={food.name} value={food.name}>{food.name}</option>)}
              </select>
              <input type="number" min="0.5" step="0.5" value={foodForm.servings} onChange={(e) => setFoodForm((prev) => ({ ...prev, servings: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
              <input value={foodForm.note} onChange={(e) => setFoodForm((prev) => ({ ...prev, note: e.target.value }))} placeholder="Note (optional)" className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none" />
              <button onClick={addFoodToLog} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition duration-200 hover:bg-indigo-500">Add to log</button>
            </div>

            <div className="mt-4 space-y-2">
              {todayLog.map((row) => (
                <div key={row.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span className="font-medium text-slate-900">{row.name}</span>
                  <span>• {row.servings} servings</span>
                  <span>• {row.calories.toFixed(1)} cal</span>
                  <span>• {row.protein.toFixed(1)}g protein</span>
                  <span>• {row.carbs.toFixed(1)}g carbs</span>
                  <span>• {row.fat.toFixed(1)}g fat</span>
                  {row.note ? <span>• {row.note}</span> : null}
                  <button onClick={() => removeFood(row.id)} className="ml-auto rounded-md p-1 text-slate-500 transition duration-200 hover:bg-slate-200"><X className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {meterItems.map((item) => {
                const percent = Math.min((item.value / item.target) * 100, 100);
                const over = item.value > item.target;
                return (
                  <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="mb-2 flex items-center justify-between text-xs text-slate-600">
                      <span>{item.label}</span>
                      <span>{item.value.toFixed(1)}{item.suffix} / {item.target}{item.suffix}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200">
                      <div className={`h-2 rounded-full transition-all duration-300 ease-out ${over ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <button onClick={clearFoodLog} className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition duration-200 hover:bg-slate-50">Clear log</button>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['Breakfast (~500 cal)', '3 eggs + 1 cup rice + tomato'],
              ['Lunch (~650 cal)', '1 can sardines + 1 cup rice + vegetables'],
              ['Snack (~200 cal)', '2 boiled eggs + 1 banana'],
              ['Dinner (~600 cal)', '1 bangus/tilapia fillet + 1 cup rice + vegetables + 1 egg']
            ].map(([title, items]) => (
              <article key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-xs text-slate-600">{items}</p>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
