import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Flame, Star } from 'lucide-react';

const PLAN_STORAGE_KEY = 'byenboard_fitness_plan';

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
    exercises: [
      'Same as Wednesday',
      'Add: Wall Sit 3 × 45s',
      'Mountain Climber 3 × 30s'
    ]
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

function getSavedPlan() {
  try {
    const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function savePlanState(state) {
  window.localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(state));
}

export default function MyPlanPanel() {
  const [section, setSection] = useState('workout');
  const [loggedDays, setLoggedDays] = useState(() => getSavedPlan());
  const [nutritionFilter, setNutritionFilter] = useState('All');

  const streak = useMemo(() => {
    let value = 0;
    for (const day of workoutSchedule) {
      if (loggedDays[day.day]) value += 1;
      else break;
    }
    return value;
  }, [loggedDays]);

  const filteredFoods = useMemo(() => {
    if (nutritionFilter === 'All') return nutritionRows;
    if (nutritionFilter === 'Best Picks') return nutritionRows.filter((item) => item.best);
    if (nutritionFilter === 'Protein') return nutritionRows.filter((item) => item.category === 'Protein');
    if (nutritionFilter === 'Carbs') return nutritionRows.filter((item) => item.category === 'Carb');
    return nutritionRows.filter((item) => item.category === 'Vegetable');
  }, [nutritionFilter]);

  const toggleLoggedDay = (day) => {
    const next = { ...loggedDays, [day]: !loggedDays[day] };
    setLoggedDays(next);
    savePlanState(next);
  };

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
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${section === item.id ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {section === 'workout' ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">Weekly progress</p>
              <p className="inline-flex items-center gap-1 text-sm text-slate-600"><Flame className="h-4 w-4 text-amber-500" /> 🔥 {streak} day streak</p>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {workoutSchedule.map((day) => (
                <div key={day.day} className="text-center">
                  <div className={`mx-auto mb-1 h-8 w-8 rounded-full border ${loggedDays[day.day] ? typeClasses[day.type] : 'border-slate-200 bg-white text-slate-400'}`} />
                  <p className="text-[11px] text-slate-500">{day.short}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {workoutSchedule.map((day) => (
              <article key={day.day} className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{day.day}</h3>
                    <p className="text-xs text-slate-500">{day.focus}</p>
                  </div>
                  <span className={`rounded-full border px-2 py-1 text-xs ${typeClasses[day.type]}`}>{day.type}</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-600">
                  {day.exercises.map((exercise) => (
                    <li key={exercise}>• {exercise}</li>
                  ))}
                </ul>
                <button
                  onClick={() => toggleLoggedDay(day.day)}
                  className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${loggedDays[day.day] ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                >
                  {loggedDays[day.day] ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                  {loggedDays[day.day] ? 'Logged' : 'Log workout'}
                </button>
              </article>
            ))}
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
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${nutritionFilter === item ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full text-sm">
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
                      <td className="py-2 inline-flex items-center gap-1">{food.category}{food.best ? <Star className="h-3.5 w-3.5 text-amber-500" /> : null}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
