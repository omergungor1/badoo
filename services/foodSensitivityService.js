import { mapFallbackSensitivityFoods } from '../constants/sensitivityFoods';
import { getDb } from '../lib/db';
import { calculateFoodSensitivityScores } from '../utils/foodSensitivityScore';
import { getSensitivities } from './profileService';

const ANALYSIS_DAYS = 90;

export async function getCommonSensitivityFoods() {
  const { data, error } = await getDb()
    .from('common_sensitivity_foods')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error || !data?.length) {

    console.log('data:', data)
    return { data: mapFallbackSensitivityFoods(), error: null };
  }

  return { data, error: null };
}

export async function getUserFoodSensitivityInsights(userId) {
  const start = new Date();
  start.setDate(start.getDate() - ANALYSIS_DAYS);
  const startIso = start.toISOString();
  const endIso = new Date().toISOString();

  const [{ data: catalog }, { data: foodLogs }, { data: symptomLogs }, { data: declared }] =
    await Promise.all([
      getCommonSensitivityFoods(),
      getDb()
        .from('food_logs')
        .select('id, timestamp, foods(food_name)')
        .eq('user_id', userId)
        .gte('timestamp', startIso)
        .lte('timestamp', endIso),
      getDb()
        .from('symptom_logs')
        .select('id, symptom_name, severity, timestamp')
        .eq('user_id', userId)
        .gte('timestamp', startIso)
        .lte('timestamp', endIso),
      getSensitivities(userId),
    ]);

  const scores = calculateFoodSensitivityScores({
    catalog: catalog || [],
    foodLogs: foodLogs || [],
    symptomLogs: symptomLogs || [],
    declaredSensitivities: declared || [],
  });

  const withSignal = scores.filter((item) => item.score > 0 || item.mealCount > 0);
  const results = withSignal.length ? withSignal : scores.slice(0, 8);

  return {
    data: results,
    meta: {
      days: ANALYSIS_DAYS,
      mealLogs: foodLogs?.length || 0,
      symptomLogs: symptomLogs?.length || 0,
    },
    error: null,
  };
}
