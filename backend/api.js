const SEARCH_ENDPOINT = 'https://world.openfoodfacts.org/cgi/search.pl?search_terms=';
const BARCODE_ENDPOINT = 'https://world.openfoodfacts.org/api/v0/product/';

const mockFoods = [
  { name: 'Eggs (2 large)', calories: 140, protein: 12, carbs: 1, fat: 10 },
  { name: 'Sardines (1 can)', calories: 190, protein: 22, carbs: 0, fat: 11 },
  { name: 'Cooked rice (1 cup)', calories: 205, protein: 4.3, carbs: 45, fat: 0.4 },
  { name: 'Chicken breast (100g)', calories: 165, protein: 31, carbs: 0, fat: 3.6 }
];

function toFoodModel(product) {
  const n = product?.nutriments || {};
  return {
    name: product?.product_name || 'Unknown food',
    calories: Number(n['energy-kcal_100g'] || n['energy-kcal'] || 0),
    protein: Number(n.proteins_100g || n.proteins || 0),
    carbs: Number(n.carbohydrates_100g || n.carbohydrates || 0),
    fat: Number(n.fat_100g || n.fat || 0)
  };
}

export async function fetchFoodByName(query) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const res = await fetch(`${SEARCH_ENDPOINT}${encodeURIComponent(trimmed)}&search_simple=1&action=process&json=1&page_size=6`);
    if (!res.ok) throw new Error('Search failed');
    const json = await res.json();
    const products = (json.products || []).map(toFoodModel).filter((x) => x.calories > 0 || x.protein > 0 || x.carbs > 0 || x.fat > 0);
    return products.length ? products : mockFoods.filter((f) => f.name.toLowerCase().includes(trimmed.toLowerCase()));
  } catch {
    return mockFoods.filter((f) => f.name.toLowerCase().includes(trimmed.toLowerCase()));
  }
}

export async function fetchFoodByBarcode(barcode) {
  const code = barcode.trim();
  if (!code) return null;

  try {
    const res = await fetch(`${BARCODE_ENDPOINT}${encodeURIComponent(code)}.json`);
    if (!res.ok) throw new Error('Lookup failed');
    const json = await res.json();
    if (json.status !== 1) throw new Error('Not found');
    return toFoodModel(json.product);
  } catch {
    return mockFoods[0];
  }
}
