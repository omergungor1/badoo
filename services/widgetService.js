import { Platform } from 'react-native';
import { WIDGET_APP_GROUP, WIDGET_KEYS, WIDGET_KINDS } from '../constants/widgets';

let storage = null;
let storageUnavailable = false;

async function getExtensionStorageModule() { 
  if (Platform.OS !== 'ios' || storageUnavailable) {
    return null;
  }

  try {
    return await import('@bacons/apple-targets');
  } catch (error) {
    storageUnavailable = true;
    console.warn('[widgetService] ExtensionStorage modülü yüklenemedi:', error?.message || error);
    return null;
  }
}

async function getStorage() {
  if (Platform.OS !== 'ios' || storageUnavailable) {
    return null;
  }

  if (storage) {
    return storage;
  }

  const module = await getExtensionStorageModule();
  if (!module?.ExtensionStorage) {
    storageUnavailable = true;
    return null;
  }

  try {
    storage = new module.ExtensionStorage(WIDGET_APP_GROUP);
    return storage;
  } catch (error) {
    storageUnavailable = true;
    console.warn('[widgetService] ExtensionStorage başlatılamadı:', error?.message || error);
    return null;
  }
}

export async function syncNutritionWidget(summary) {
  if (Platform.OS !== 'ios' || !summary) return;

  const widgetStorage = await getStorage();
  if (!widgetStorage) return;

  widgetStorage.set(WIDGET_KEYS.nutrition, {
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

  const module = await getExtensionStorageModule();
  module?.ExtensionStorage?.reloadWidget(WIDGET_KINDS.nutrition);
  module?.ExtensionStorage?.reloadWidget(WIDGET_KINDS.quickProgress);
}
