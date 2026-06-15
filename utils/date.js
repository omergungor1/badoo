export function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function toISODate(date = new Date()) {
  return date.toISOString().split('T')[0];
}

export function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function formatShortDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

export function getLastNDays(n) {
  const days = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(toISODate(d));
  }
  return days;
}

export function isToday(dateString) {
  return toISODate(new Date(dateString)) === toISODate(new Date());
}

export function parseISODate(dateString) {
  return new Date(`${dateString}T12:00:00`);
}

export function getMonthDays(year, month) {
  const days = [];
  const cursor = new Date(year, month, 1);

  while (cursor.getMonth() === month) {
    days.push(toISODate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export function getMonthStartOffset(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  return firstDay === 0 ? 6 : firstDay - 1;
}

export function formatMonthYear(year, month) {
  return new Date(year, month, 1).toLocaleDateString('tr-TR', {
    month: 'long',
    year: 'numeric',
  });
}
