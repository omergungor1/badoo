import {
  ACTIVITY_GOAL_TYPES,
  DEFAULT_ACTIVITY_GOAL_TYPE,
  DEFAULT_DAILY_ACTIVITY_GOAL,
} from '../constants/onboarding';

export function getActivityGoalType(goalType) {
  return ACTIVITY_GOAL_TYPES[goalType] || ACTIVITY_GOAL_TYPES[DEFAULT_ACTIVITY_GOAL_TYPE];
}

export function getActivityGoal(profile) {
  const goalType = profile?.daily_activity_goal_type || DEFAULT_ACTIVITY_GOAL_TYPE;
  const config = getActivityGoalType(goalType);
  const goalValue = profile?.daily_activity_goal ?? config.defaultGoal;

  return {
    type: goalType,
    value: goalValue,
    config,
  };
}

export function calculateDailyActivityTotals(activityLogs = []) {
  const appleLog = activityLogs.find((log) => log.source === 'apple_health');
  const manualLogs = activityLogs.filter((log) => log.source !== 'apple_health');

  const appleSteps = appleLog?.steps || 0;
  const appleDistanceKm = Number(appleLog?.distance || 0);
  const manualSteps = manualLogs.reduce((sum, log) => sum + (log.steps || 0), 0);
  const manualDistanceKm = manualLogs.reduce((sum, log) => sum + Number(log.distance || 0), 0);
  const manualDuration = manualLogs.reduce((sum, log) => sum + (log.duration || 0), 0);

  return {
    steps: appleSteps + manualSteps,
    distanceKm: Number((appleDistanceKm + manualDistanceKm).toFixed(2)),
    durationMinutes: manualDuration,
    appleSteps,
    appleDistanceKm,
    manualSteps,
    manualDistanceKm,
  };
}

export function getActivityProgress(totals, goalType, goalValue) {
  const config = getActivityGoalType(goalType);
  const current =
    goalType === 'distance_km' ? totals.distanceKm : totals.steps;
  const safeGoal = goalValue || config.defaultGoal;

  if (!safeGoal) return 0;

  return Math.max(0, Math.min(100, Math.round((current / safeGoal) * 100)));
}

export function formatActivityValue(value, goalType) {
  const config = getActivityGoalType(goalType);

  if (goalType === 'distance_km') {
    const formatted = Number(value || 0).toFixed(1).replace(/\.0$/, '');
    return `${formatted} ${config.unit}`;
  }

  return `${Math.round(value || 0).toLocaleString('tr-TR')} ${config.unit}`;
}

export function formatActivityProgressText(totals, goalType, goalValue) {
  const config = getActivityGoalType(goalType);
  const current = goalType === 'distance_km' ? totals.distanceKm : totals.steps;
  const goal = goalValue || config.defaultGoal;

  return `${formatActivityValue(current, goalType)}/${formatActivityValue(goal, goalType)}`;
}

export function getDefaultActivityGoal(goalType = DEFAULT_ACTIVITY_GOAL_TYPE) {
  const config = getActivityGoalType(goalType);
  return config.defaultGoal ?? DEFAULT_DAILY_ACTIVITY_GOAL;
}
