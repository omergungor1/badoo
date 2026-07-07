import { getDb } from '../lib/db';
import { lookupFoodNutrition } from './nutritionAiService';

import { getNutritionFactor } from '../utils/foodQuantity';

export async function searchFoods(query = '') {
  let request = getDb().from('foods').select('*').order('food_name');

  if (query.trim()) {
    request = request.ilike('food_name', `%${query.trim()}%`);
  }

  const { data, error } = await request.limit(30);
  return { data, error };
}

export async function getAllFoods() {
  const { data, error } = await getDb().from('foods').select('*').order('food_name');
  return { data, error };
}

export async function findFoodByName(foodName) {
  const trimmed = foodName.trim();
  if (!trimmed) {
    return { data: null, error: null };
  }

  const { data, error } = await getDb()
    .from('foods')
    .select('*')
    .ilike('food_name', trimmed);

  if (error) {
    return { data: null, error };
  }

  const match = (data || []).find(
    (food) => food.food_name.toLowerCase() === trimmed.toLowerCase(),
  );

  return { data: match || null, error: null };
}

export async function createFood(foodName, unitType = 'gram') {
  const trimmed = foodName.trim();
  if (!trimmed) {
    return { data: null, error: { message: 'Yemek veya içecek adı girin.' } };
  }

  const { data: existing, error: findError } = await findFoodByName(trimmed);
  if (findError) {
    return { data: null, error: findError };
  }

  if (existing) {
    return { data: null, error: { message: 'Bu yemek veya içecek zaten listede.' } };
  }

  const { data: nutrition, error: nutritionError } = await lookupFoodNutrition(trimmed, unitType);
  if (nutritionError) {
    return { data: null, error: nutritionError };
  }

  const { data, error } = await getDb()
    .from('foods')
    .insert({
      food_name: trimmed,
      unit_type: unitType,
      calories: nutrition.calories,
      protein: nutrition.protein,
      carbohydrates: nutrition.carbohydrates,
      fats: nutrition.fats,
    })
    .select()
    .single();

  return { data, error };
}

export async function updateFood(foodId, { foodName, unitType, calories, protein, carbohydrates, fats }) {
  const trimmed = foodName.trim();
  if (!trimmed) {
    return { data: null, error: { message: 'Yemek veya içecek adı girin.' } };
  }

  const { data: existing, error: findError } = await findFoodByName(trimmed);
  if (findError) {
    return { data: null, error: findError };
  }

  if (existing && existing.id !== foodId) {
    return { data: null, error: { message: 'Bu yemek veya içecek adı zaten kullanılıyor.' } };
  }

  const { data, error } = await getDb()
    .from('foods')
    .update({
      food_name: trimmed,
      unit_type: unitType,
      calories,
      protein,
      carbohydrates,
      fats,
    })
    .eq('id', foodId)
    .select()
    .single();

  return { data, error };
}

export async function addFoodLog({ userId, foodId, quantity, timestamp }) {
  const { data, error } = await getDb()
    .from('food_logs')
    .insert({
      user_id: userId,
      food_id: foodId,
      quantity,
      timestamp: timestamp || new Date().toISOString(),
    })
    .select('*, foods(food_name, unit_type, calories, protein, carbohydrates, fats)')
    .single();

  return { data, error };
}

export async function addMealPhotoLog({
  userId,
  imageUrl,
  imagePath,
  mealTitle = 'Öğün',
  timestamp,
}) {
  const { data, error } = await getDb()
    .from('food_logs')
    .insert({
      user_id: userId,
      meal_title: mealTitle,
      image_url: imageUrl,
      image_path: imagePath,
      quantity: 1,
      timestamp: timestamp || new Date().toISOString(),
    })
    .select('*')
    .single();

  return { data, error };
}

export async function updateMealLogNutrition(logId, {
  mealTitle,
  calories,
  protein,
  carbohydrates,
  fats,
}) {
  const { data, error } = await getDb()
    .from('food_logs')
    .update({
      meal_title: mealTitle?.trim() || 'Öğün',
      calories: calories ?? null,
      protein: protein ?? null,
      carbohydrates: carbohydrates ?? null,
      fats: fats ?? null,
    })
    .eq('id', logId)
    .is('deleted_at', null)
    .select('*')
    .single();

  return { data, error };
}

export async function deleteFoodLog(logId, userId) {
  const { error } = await getDb()
    .from('food_logs')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', logId)
    .eq('user_id', userId)
    .is('deleted_at', null);

  return { error };
}

export async function addFoodLogsBatch({ userId, items, timestamp }) {
  if (!items?.length) {
    return { data: [], error: null };
  }

  const ts = timestamp || new Date().toISOString();
  const rows = items.map(({ foodId, quantity }) => ({
    user_id: userId,
    food_id: foodId,
    quantity,
    timestamp: ts,
  }));

  const { data, error } = await getDb()
    .from('food_logs')
    .insert(rows)
    .select('*, foods(food_name, unit_type, calories, protein, carbohydrates, fats)');

  return { data, error };
}

export async function getFoodLogsForDay(userId, start, end) {
  const { data, error } = await getDb()
    .from('food_logs')
    .select('*, foods(food_name, unit_type, calories, protein, carbohydrates, fats)')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .gte('timestamp', start)
    .lte('timestamp', end)
    .order('timestamp', { ascending: false });

  return { data, error };
}

export function calculateFoodTotals(logs = []) {
  return logs.reduce(
    (acc, log) => {
      if (log.image_url) {
        acc.calories += log.calories || 0;
        acc.protein += log.protein || 0;
        acc.carbs += log.carbohydrates || 0;
        acc.fats += log.fats || 0;
        return acc;
      }

      const food = log.foods || {};
      const factor = getNutritionFactor(log.quantity, food.unit_type);
      acc.calories += Math.round((food.calories || 0) * factor);
      acc.protein += Math.round((food.protein || 0) * factor);
      acc.carbs += Math.round((food.carbohydrates || 0) * factor);
      acc.fats += Math.round((food.fats || 0) * factor);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 },
  );
}
