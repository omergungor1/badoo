import AsyncStorage from '@react-native-async-storage/async-storage';
import { CHECKIN_STORAGE_KEY, getTimeOfDay } from '../constants/digestionCheckin';
import { toISODate } from './date';

function emptyDay(date) {
  return {
    date,
    morningShown: false,
    afternoonShown: false,
  };
}

export async function getCheckinDayState() {
  try {
    const raw = await AsyncStorage.getItem(CHECKIN_STORAGE_KEY);
    const today = toISODate();
    if (!raw) return emptyDay(today);

    const parsed = JSON.parse(raw);
    if (!parsed?.date || parsed.date !== today) {
      const next = emptyDay(today);
      await AsyncStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(next));
      return next;
    }

    return {
      date: parsed.date,
      morningShown: Boolean(parsed.morningShown),
      afternoonShown: Boolean(parsed.afternoonShown),
    };
  } catch {
    return emptyDay(toISODate());
  }
}

export async function markCheckinSlotShown(timeOfDay = getTimeOfDay()) {
  const today = toISODate();
  const current = await getCheckinDayState();
  const next = {
    date: today,
    morningShown: current.date === today ? current.morningShown : false,
    afternoonShown: current.date === today ? current.afternoonShown : false,
  };

  if (timeOfDay === 'morning') next.morningShown = true;
  else next.afternoonShown = true;

  await AsyncStorage.setItem(CHECKIN_STORAGE_KEY, JSON.stringify(next));
  return next;
}

/**
 * Bu açılışta modal gösterilmeli mi?
 * Gösterilecekse ilgili slotu hemen shown=true yazar (tekrar tetiklenmesin).
 */
export async function claimCheckinSlotIfNeeded(now = new Date()) {
  const timeOfDay = getTimeOfDay(now);
  const state = await getCheckinDayState();

  if (timeOfDay === 'morning' && !state.morningShown) {
    await markCheckinSlotShown('morning');
    return { shouldShow: true, timeOfDay: 'morning' };
  }

  if (timeOfDay === 'afternoon' && !state.afternoonShown) {
    await markCheckinSlotShown('afternoon');
    return { shouldShow: true, timeOfDay: 'afternoon' };
  }

  return { shouldShow: false, timeOfDay };
}
