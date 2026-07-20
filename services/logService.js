import { getDb } from '../lib/db';
import { DAILY_TASKS } from '../constants/onboarding';
import { GLASS_ML } from '../utils/water';
import { endOfDay, parseISODate, startOfDay, toISODate } from '../utils/date';
import { groupFoodLogsForTimeline } from '../utils/mealTimeline';

export async function addWaterLog({ userId, amount, timestamp }) {
  return getDb()
    .from('water_logs')
    .insert({
      user_id: userId,
      amount,
      timestamp: timestamp || new Date().toISOString(),
    })
    .select()
    .single();
}

export async function syncTodayWaterGlasses(userId, glasses) {
  const start = startOfDay().toISOString();
  const end = endOfDay().toISOString();

  const { error: deleteError } = await getDb()
    .from('water_logs')
    .delete()
    .eq('user_id', userId)
    .gte('timestamp', start)
    .lte('timestamp', end);

  if (deleteError) {
    return { data: null, error: deleteError };
  }

  if (glasses <= 0) {
    return { data: null, error: null };
  }

  return addWaterLog({
    userId,
    amount: glasses * GLASS_ML,
    timestamp: new Date().toISOString(),
  });
}

export async function addDrinkLog({ userId, drinkName, timestamp }) {
  return getDb()
    .from('drink_logs')
    .insert({
      user_id: userId,
      drink_name: drinkName,
      timestamp: timestamp || new Date().toISOString(),
    })
    .select()
    .single();
}

export async function addMedicationLog({ userId, medicationId, dose, timestamp }) {
  return getDb()
    .from('medication_logs')
    .insert({
      user_id: userId,
      medication_id: medicationId,
      dose,
      timestamp: timestamp || new Date().toISOString(),
    })
    .select('*, medications(medication_name)')
    .single();
}

export async function addSymptomLog({ userId, symptomName, severity, note, timestamp }) {
  return getDb()
    .from('symptom_logs')
    .insert({
      user_id: userId,
      symptom_name: symptomName,
      severity,
      note,
      timestamp: timestamp || new Date().toISOString(),
    })
    .select()
    .single();
}

export async function addStoolLog({ userId, consistency, note, time }) {
  return getDb()
    .from('stool_logs')
    .insert({
      user_id: userId,
      consistency,
      note,
      time: time || new Date().toISOString(),
    })
    .select()
    .single();
}

export async function addSleepLog({ userId, hours, quality, wakeCount, durationMinutes, timestamp }) {
  const payload = {
    user_id: userId,
    quality,
    timestamp: timestamp || new Date().toISOString(),
  };

  if (durationMinutes != null) {
    payload.duration_minutes = durationMinutes;
    payload.hours = Math.floor(durationMinutes / 60);
    payload.wake_count = 0;
  } else {
    payload.hours = hours ?? 0;
    payload.wake_count = wakeCount ?? 0;
  }

  return getDb()
    .from('sleep_logs')
    .insert(payload)
    .select()
    .single();
}

export async function addActivityLog({
  userId,
  activityName,
  duration,
  distance,
  steps,
  source = 'manual',
  timestamp,
}) {
  return getDb()
    .from('activity_logs')
    .insert({
      user_id: userId,
      activity_name: activityName,
      duration,
      distance,
      steps,
      source,
      timestamp: timestamp || new Date().toISOString(),
    })
    .select()
    .single();
}

export async function upsertAppleHealthActivity({ userId, logDate, steps, distanceKm }) {
  const dayStart = startOfDay(parseISODate(logDate)).toISOString();
  const dayEnd = endOfDay(parseISODate(logDate)).toISOString();
  const incomingSteps = Math.max(0, Math.round(Number(steps) || 0));
  const incomingDistance = Math.max(0, Number(Number(distanceKm || 0).toFixed(2)));

  const { data: existing, error: fetchError } = await getDb()
    .from('activity_logs')
    .select('id, steps, distance')
    .eq('user_id', userId)
    .eq('source', 'apple_health')
    .gte('timestamp', dayStart)
    .lte('timestamp', dayEnd)
    .maybeSingle();

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  if (existing?.id) {
    const existingSteps = Math.max(0, Math.round(Number(existing.steps) || 0));
    const existingDistance = Math.max(0, Number(Number(existing.distance || 0).toFixed(2)));

    // Apple Sağlık gece 00:00'da yeni gün için 0 döner; mevcut günün kaydını silme/azaltma
    if (incomingSteps === 0 && incomingDistance === 0 && (existingSteps > 0 || existingDistance > 0)) {
      return { data: existing, error: null, skipped: true };
    }

    const nextSteps = Math.max(existingSteps, incomingSteps);
    const nextDistance = Math.max(existingDistance, incomingDistance);

    if (nextSteps === existingSteps && nextDistance === existingDistance) {
      return { data: existing, error: null, skipped: true };
    }

    return getDb()
      .from('activity_logs')
      .update({
        activity_name: 'Apple Sağlık',
        duration: 0,
        steps: nextSteps,
        distance: nextDistance,
        source: 'apple_health',
      })
      .eq('id', existing.id)
      .select()
      .single();
  }

  // Yeni gün: 0 ile başlamak normal (henüz adım yok)
  if (incomingSteps === 0 && incomingDistance === 0) {
    return { data: null, error: null, skipped: true };
  }

  return getDb()
    .from('activity_logs')
    .insert({
      user_id: userId,
      activity_name: 'Apple Sağlık',
      duration: 0,
      steps: incomingSteps,
      distance: incomingDistance,
      source: 'apple_health',
      timestamp: parseISODate(logDate).toISOString(),
    })
    .select()
    .single();
}

export async function addDailyStatusLog({ userId, energy, stress, mood, motivation, timestamp }) {
  return getDb()
    .from('daily_status_logs')
    .insert({
      user_id: userId,
      energy,
      stress,
      mood,
      motivation,
      timestamp: timestamp || new Date().toISOString(),
    })
    .select()
    .single();
}

export async function addNote({ userId, note, timestamp }) {
  return getDb()
    .from('notes')
    .insert({
      user_id: userId,
      note,
      timestamp: timestamp || new Date().toISOString(),
    })
    .select()
    .single();
}

export async function ensureDailyTasks(userId) {
  const today = toISODate();
  const { data: existing } = await getDb()
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('task_date', today);

  if (existing?.length) {
    return { data: existing, error: null };
  }

  const rows = DAILY_TASKS.map((task) => ({
    user_id: userId,
    task_key: task.key,
    task_name: task.name,
    task_emoji: task.emoji,
    completed: false,
    task_date: today,
  }));

  const { data, error } = await getDb().from('daily_tasks').insert(rows).select();
  return { data, error };
}

export async function getAllDailyTasksForToday(userId) {
  const today = toISODate();
  await ensureDailyTasks(userId);

  const { data, error } = await getDb()
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('task_date', today)
    .order('created_at', { ascending: true });

  return { data, error };
}

export async function getDailyTasks(userId) {
  const today = toISODate();
  await ensureDailyTasks(userId);

  const { data, error } = await getDb()
    .from('daily_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('task_date', today)
    .eq('completed', false)
    .order('created_at', { ascending: true });

  return { data, error };
}

export async function completeTask(userId, taskKey) {
  const today = toISODate();
  const { data, error } = await getDb()
    .from('daily_tasks')
    .update({ completed: true })
    .eq('user_id', userId)
    .eq('task_key', taskKey)
    .eq('task_date', today)
    .select()
    .single();

  return { data, error };
}

export async function getTimelineForDay(userId, start, end) {
  const tables = [
    {
      table: 'food_logs',
      type: 'food',
      timeField: 'timestamp',
      select:
        '*, foods(food_name, unit_type, calories, protein, carbohydrates, fats), meals:meal_id(id, meal_title, source, image_url, image_path, total_calories, total_protein, total_carbohydrates, total_fats, eaten_at, deleted_at)',
    },
    { table: 'water_logs', type: 'water', timeField: 'timestamp' },
    { table: 'drink_logs', type: 'drink', timeField: 'timestamp' },
    { table: 'medication_logs', type: 'medication', timeField: 'timestamp', select: '*, medications(medication_name)' },
    { table: 'symptom_logs', type: 'symptom', timeField: 'timestamp' },
    { table: 'stool_logs', type: 'stool', timeField: 'time' },
    { table: 'sleep_logs', type: 'sleep', timeField: 'timestamp' },
    { table: 'activity_logs', type: 'activity', timeField: 'timestamp' },
    { table: 'daily_status_logs', type: 'status', timeField: 'timestamp' },
    { table: 'notes', type: 'note', timeField: 'timestamp' },
  ];

  const results = await Promise.all(
    tables.map(async ({ table, type, timeField, select }) => {
      let request = getDb()
        .from(table)
        .select(select || '*')
        .eq('user_id', userId)
        .gte(timeField, start)
        .lte(timeField, end);

      if (table === 'food_logs') {
        request = request.is('deleted_at', null);
      }

      const { data } = await request;

      return (data || []).map((item) => ({
        ...item,
        logType: type,
        sortTime: item[timeField],
      }));
    }),
  );

  const flat = results.flat();
  const foodLogs = flat.filter((item) => item.logType === 'food');
  const otherLogs = flat.filter((item) => item.logType !== 'food');

  return [
    ...groupFoodLogsForTimeline(foodLogs),
    ...otherLogs,
  ].sort((a, b) => new Date(b.sortTime) - new Date(a.sortTime));
}

export async function getLogsForDate(userId, date) {
  const start = startOfDay(parseISODate(date)).toISOString();
  const end = endOfDay(parseISODate(date)).toISOString();

  const [symptoms, sleep, status, stool, foodLogs, waterLogs, activityLogs] = await Promise.all([
    getDb().from('symptom_logs').select('*').eq('user_id', userId).gte('timestamp', start).lte('timestamp', end),
    getDb().from('sleep_logs').select('*').eq('user_id', userId).gte('timestamp', start).lte('timestamp', end),
    getDb().from('daily_status_logs').select('*').eq('user_id', userId).gte('timestamp', start).lte('timestamp', end),
    getDb().from('stool_logs').select('*').eq('user_id', userId).gte('time', start).lte('time', end),
    getDb().from('food_logs').select('*, foods(food_name, unit_type, calories, protein, carbohydrates, fats)').eq('user_id', userId).is('deleted_at', null).gte('timestamp', start).lte('timestamp', end),
    getDb().from('water_logs').select('*').eq('user_id', userId).gte('timestamp', start).lte('timestamp', end),
    getDb().from('activity_logs').select('*').eq('user_id', userId).gte('timestamp', start).lte('timestamp', end),
  ]);

  return {
    symptoms: symptoms.data || [],
    sleepLogs: sleep.data || [],
    statusLogs: status.data || [],
    stoolLogs: stool.data || [],
    foodLogs: foodLogs.data || [],
    waterLogs: waterLogs.data || [],
    activityLogs: activityLogs.data || [],
  };
}

export async function getWeeklyStats(userId, start, end) {
  const [foodLogs, waterLogs, activityLogs, symptomLogs, sleepLogs] = await Promise.all([
    getDb().from('food_logs').select('*, foods(unit_type, calories, protein)').eq('user_id', userId).is('deleted_at', null).gte('timestamp', start).lte('timestamp', end),
    getDb().from('water_logs').select('*').eq('user_id', userId).gte('timestamp', start).lte('timestamp', end),
    getDb().from('activity_logs').select('*').eq('user_id', userId).gte('timestamp', start).lte('timestamp', end),
    getDb().from('symptom_logs').select('*').eq('user_id', userId).gte('timestamp', start).lte('timestamp', end),
    getDb().from('sleep_logs').select('*').eq('user_id', userId).gte('timestamp', start).lte('timestamp', end),
  ]);

  return {
    foodLogs: foodLogs.data || [],
    waterLogs: waterLogs.data || [],
    activityLogs: activityLogs.data || [],
    symptomLogs: symptomLogs.data || [],
    sleepLogs: sleepLogs.data || [],
  };
}
