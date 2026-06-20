import Constants from 'expo-constants';
import { Platform } from 'react-native';

const READ_TYPES = [
  'HKQuantityTypeIdentifierStepCount',
  'HKQuantityTypeIdentifierDistanceWalkingRunning',
];

let healthKitModule = null;
let healthKitLoadAttempted = false;
let healthKitUnavailable = false;

function isExpoGo() {
  return Constants.appOwnership === 'expo';
}

export function isAppleHealthSupported() {
  if (Platform.OS !== 'ios' || isExpoGo()) {
    return false;
  }

  return !healthKitUnavailable;
}

async function getHealthKitModule() {
  if (Platform.OS !== 'ios' || isExpoGo() || healthKitUnavailable) {
    return null;
  }

  if (healthKitModule) {
    return healthKitModule;
  }

  if (healthKitLoadAttempted) {
    return null;
  }

  healthKitLoadAttempted = true;

  try {
    healthKitModule = await import('@kingstinct/react-native-healthkit');
    return healthKitModule;
  } catch (error) {
    healthKitUnavailable = true;
    console.warn('[appleHealth] modül yüklenemedi:', error?.message || error);
    return null;
  }
}

export async function requestAppleHealthPermissions() {
  const HealthKit = await getHealthKitModule();
  if (!HealthKit?.requestAuthorization) {
    return { granted: false, reason: 'unsupported' };
  }

  if (HealthKit.isHealthDataAvailable && !HealthKit.isHealthDataAvailable()) {
    healthKitUnavailable = true;
    return { granted: false, reason: 'unavailable' };
  }

  try {
    await HealthKit.requestAuthorization({
      toShare: [],
      toRead: READ_TYPES,
    });
    return { granted: true };
  } catch (error) {
    console.warn('[appleHealth] izin hatası:', error?.message || error);
    return { granted: false, reason: 'denied', error };
  }
}

function getDayRange(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function readSumQuantity(stats) {
  const quantity = stats?.sumQuantity?.quantity ?? stats?.sumQuantity ?? 0;
  return Number(quantity) || 0;
}

export async function getTodayAppleHealthActivity(date = new Date()) {
  const HealthKit = await getHealthKitModule();
  if (!HealthKit?.queryStatisticsForQuantity) {
    return { steps: 0, distanceKm: 0, available: false };
  }

  if (HealthKit.isHealthDataAvailable && !HealthKit.isHealthDataAvailable()) {
    healthKitUnavailable = true;
    return { steps: 0, distanceKm: 0, available: false };
  }

  const { start, end } = getDayRange(date);

  try {
    const [stepStats, distanceStats] = await Promise.all([
      HealthKit.queryStatisticsForQuantity(
        'HKQuantityTypeIdentifierStepCount',
        ['cumulativeSum'],
        {
          unit: 'count',
          filter: {
            date: {
              startDate: start,
              endDate: end,
            },
          },
        },
      ),
      HealthKit.queryStatisticsForQuantity(
        'HKQuantityTypeIdentifierDistanceWalkingRunning',
        ['cumulativeSum'],
        {
          unit: 'km',
          filter: {
            date: {
              startDate: start,
              endDate: end,
            },
          },
        },
      ),
    ]);

    const steps = Math.round(readSumQuantity(stepStats));
    const distanceKm = Number(readSumQuantity(distanceStats).toFixed(2));

    return {
      steps,
      distanceKm,
      available: true,
    };
  } catch (error) {
    console.warn('[appleHealth] günlük veri okunamadı:', error?.message || error);
    return { steps: 0, distanceKm: 0, available: false, error };
  }
}
