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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

export function getWeekStartMonday(date = new Date()) {
  const d = startOfDay(date);
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

export function getFourWeekGridRows(endDate = new Date()) {
  const today = startOfDay(endDate);
  const todayDow = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const currentWeekMonday = new Date(today);
  currentWeekMonday.setDate(today.getDate() - todayDow);

  const rangeStart = new Date(today);
  rangeStart.setDate(today.getDate() - 27);

  const rows = [];
  for (let weekOffset = 3; weekOffset >= 0; weekOffset -= 1) {
    const rowMonday = new Date(currentWeekMonday);
    rowMonday.setDate(currentWeekMonday.getDate() - weekOffset * 7);

    const row = [];
    for (let d = 0; d < 7; d += 1) {
      const cellDate = new Date(rowMonday);
      cellDate.setDate(rowMonday.getDate() + d);
      const iso = toISODate(cellDate);
      row.push({
        date: iso,
        inRange: cellDate >= startOfDay(rangeStart) && cellDate <= today,
        isToday: iso === toISODate(today),
      });
    }
    rows.push(row);
  }
  return rows;
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
