import { getTodayAppleHealthActivity, isAppleHealthSupported, requestAppleHealthPermissions } from '../lib/appleHealth';
import { upsertAppleHealthActivity } from './logService';
import { toISODate } from '../utils/date';

export async function syncTodayAppleHealthActivity(userId, date = new Date()) {
  if (!userId || !isAppleHealthSupported()) {
    return { synced: false, reason: 'unsupported' };
  }

  const permission = await requestAppleHealthPermissions();
  if (!permission.granted) {
    return { synced: false, reason: permission.reason || 'denied' };
  }

  const healthData = await getTodayAppleHealthActivity(date);
  if (!healthData.available) {
    return { synced: false, reason: 'unavailable' };
  }

  const logDate = toISODate(date);
  const { error } = await upsertAppleHealthActivity({
    userId,
    logDate,
    steps: healthData.steps,
    distanceKm: healthData.distanceKm,
  });

  if (error) {
    return { synced: false, reason: 'db_error', error };
  }

  return {
    synced: true,
    steps: healthData.steps,
    distanceKm: healthData.distanceKm,
  };
}
