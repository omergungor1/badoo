import { Platform } from 'react-native';
import { ExtensionStorage } from '@bacons/apple-targets';
import { WIDGET_APP_GROUP, WIDGET_KEYS, WIDGET_KINDS } from '../constants/widgets';

const storage = new ExtensionStorage(WIDGET_APP_GROUP);

export function syncNutritionWidget(summary) {
  if (Platform.OS !== 'ios' || !summary) return;

  storage.set(WIDGET_KEYS.nutrition, {
    calories: summary.calories ?? 0,
    calorieGoal: summary.calorieGoal ?? 0,
    protein: summary.protein ?? 0,
    proteinGoal: summary.proteinGoal ?? 0,
    water: summary.water ?? 0,
    waterGoal: summary.waterGoal ?? 0,
    activityProgress: summary.activityProgress ?? 0,
    activityLabel: summary.activityLabel || 'Aktivite',
    activityValue: summary.activityValue || '0',
    updatedAt: new Date().toISOString(),
  });

  ExtensionStorage.reloadWidget(WIDGET_KINDS.nutrition);
}
