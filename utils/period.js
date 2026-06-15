import { toISODate } from './date';

const DAY_MS = 1000 * 60 * 60 * 24;
const DEFAULT_CYCLE_LENGTH = 28;

export function daysBetween(startDate, endDate) {
  const start = new Date(`${startDate}T12:00:00`);
  const end = new Date(`${endDate}T12:00:00`);
  return Math.round((end - start) / DAY_MS);
}

export function inclusiveDayCount(startDate, endDate) {
  return daysBetween(startDate, endDate) + 1;
}

export function addDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function buildPeriodSummary(cycles = []) {
  const sorted = [...cycles].sort((a, b) => b.start_date.localeCompare(a.start_date));
  const today = toISODate(new Date());
  const activeCycle = sorted.find((cycle) => !cycle.end_date) || null;
  const completedCycles = sorted.filter((cycle) => cycle.end_date);

  const daysSinceStart = activeCycle ? inclusiveDayCount(activeCycle.start_date, today) : null;

  let daysBetweenCycles = null;
  if (sorted.length >= 2) {
    daysBetweenCycles = daysBetween(sorted[1].start_date, sorted[0].start_date);
  }

  const lastCompleted = completedCycles[0] || null;
  const lastPeriodLength = lastCompleted
    ? inclusiveDayCount(lastCompleted.start_date, lastCompleted.end_date)
    : null;

  const cycleLengths = [];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    cycleLengths.push(daysBetween(sorted[i + 1].start_date, sorted[i].start_date));
  }

  const avgCycleLength = cycleLengths.length
    ? Math.round(cycleLengths.reduce((sum, value) => sum + value, 0) / cycleLengths.length)
    : DEFAULT_CYCLE_LENGTH;

  const referenceStart = sorted[0]?.start_date;
  const predictedNextStart = referenceStart ? addDays(referenceStart, avgCycleLength) : null;
  const daysUntilNext = predictedNextStart ? daysBetween(today, predictedNextStart) : null;

  return {
    activeCycle,
    isOngoing: !!activeCycle,
    daysSinceStart,
    daysBetweenCycles,
    lastPeriodLength,
    avgCycleLength,
    predictedNextStart,
    daysUntilNext,
    totalCycles: sorted.length,
    lastCompleted,
  };
}

export function formatPeriodRange(cycle) {
  if (!cycle) return '-';
  const end = cycle.end_date ? cycle.end_date : 'devam ediyor';
  return `${cycle.start_date} → ${end}`;
}

export function formatPeriodDuration(cycle) {
  if (!cycle?.end_date) {
    return cycle ? `${inclusiveDayCount(cycle.start_date, toISODate(new Date()))} gün (devam)` : '-';
  }
  return `${inclusiveDayCount(cycle.start_date, cycle.end_date)} gün`;
}

export function buildPeriodCalendarMarkers(cycles = []) {
  const markers = {};
  const today = toISODate(new Date());

  cycles.forEach((cycle) => {
    if (!cycle.start_date || cycle.start_date > today) return;

    const end = cycle.end_date && cycle.end_date <= today ? cycle.end_date : today;
    let cursor = cycle.start_date;

    while (cursor <= end) {
      if (!markers[cursor]) {
        markers[cursor] = { inPeriod: false, isStart: false, isEnd: false };
      }

      markers[cursor].inPeriod = true;
      if (cursor === cycle.start_date) markers[cursor].isStart = true;
      if (cycle.end_date && cursor === cycle.end_date) markers[cursor].isEnd = true;

      cursor = addDays(cursor, 1);
    }
  });

  return markers;
}

export function filterPeriodLogsForDate(logs = [], date) {
  return logs.filter((log) => toISODate(log.logged_at) === date);
}
