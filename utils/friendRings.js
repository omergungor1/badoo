import { NUTRITION_RING_CONFIG } from '../constants/onboarding';
import {
  calculateDailyActivityTotals,
  formatActivityProgressText,
  getActivityGoal,
  getActivityProgress,
} from './activity';
import { calculateFoodTotals } from '../services/foodService';
import { formatWater } from './nutrition';

function clampProgress(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function buildNutritionRings(profile, foodLogs, waterLogs, activityLogs) {
  const calorieGoal = profile?.daily_calorie_goal || 2000;
  const proteinGoal = profile?.daily_protein_goal || 100;
  const waterGoal = profile?.daily_water_goal || 2000;
  const activityGoalConfig = getActivityGoal(profile);
  const activityGoalType = activityGoalConfig.type;
  const activityGoalValue = activityGoalConfig.value;

  const totals = calculateFoodTotals(foodLogs || []);
  const waterTotal = (waterLogs || []).reduce((sum, log) => sum + (log.amount || 0), 0);
  const activityTotals = calculateDailyActivityTotals(activityLogs || []);

  const rings = [
    {
      key: 'calories',
      label: NUTRITION_RING_CONFIG.calories.label,
      progress: clampProgress((totals.calories / calorieGoal) * 100),
      valueText: `${totals.calories}/${calorieGoal}`,
      color: NUTRITION_RING_CONFIG.calories.color,
      trackColor: NUTRITION_RING_CONFIG.calories.trackColor,
    },
    {
      key: 'protein',
      label: NUTRITION_RING_CONFIG.protein.label,
      progress: clampProgress((totals.protein / proteinGoal) * 100),
      valueText: `${totals.protein}/${proteinGoal}g`,
      color: NUTRITION_RING_CONFIG.protein.color,
      trackColor: NUTRITION_RING_CONFIG.protein.trackColor,
    },
    {
      key: 'water',
      label: NUTRITION_RING_CONFIG.water.label,
      progress: clampProgress((waterTotal / waterGoal) * 100),
      valueText: `${formatWater(waterTotal)}/${formatWater(waterGoal)}`,
      color: NUTRITION_RING_CONFIG.water.color,
      trackColor: NUTRITION_RING_CONFIG.water.trackColor,
    },
    {
      key: 'activity',
      label: activityGoalConfig.config.ringLabel,
      progress: getActivityProgress(activityTotals, activityGoalType, activityGoalValue),
      valueText: formatActivityProgressText(activityTotals, activityGoalType, activityGoalValue),
      color: NUTRITION_RING_CONFIG.activity.color,
      trackColor: NUTRITION_RING_CONFIG.activity.trackColor,
    },
  ];

  const average = rings.length
    ? Math.round(rings.reduce((sum, ring) => sum + ring.progress, 0) / rings.length)
    : 0;

  return {
    rings,
    average,
    allClosed: rings.every((ring) => ring.progress >= 100),
  };
}

export function getDisplayName(profile, fallback = 'Kullanıcı') {
  if (profile?.nickname?.trim()) return profile.nickname.trim();
  return fallback;
}
