export const NAP_STEP_MINUTES = 15;
export const NAP_MIN_MINUTES = 15;
export const NAP_MAX_MINUTES = 180;

export function clampMinutes(minutes, min = NAP_MIN_MINUTES, max = NAP_MAX_MINUTES, step = NAP_STEP_MINUTES) {
  const clamped = Math.min(max, Math.max(min, minutes));
  return Math.round(clamped / step) * step;
}

export function formatDurationMinutes(minutes) {
  if (!minutes) return '-';

  if (minutes < 60) {
    return `${minutes} dk`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (!remainder) {
    return `${hours} saat`;
  }

  return `${hours} sa ${remainder} dk`;
}

export function formatSleepLogLabel(item) {
  if (item.duration_minutes) {
    return `Ara uyku ${formatDurationMinutes(item.duration_minutes)}`;
  }

  if (item.hours) {
    return `Uyku ${item.hours} saat`;
  }

  return 'Uyku';
}
