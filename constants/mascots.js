/**
 * Maskot görselleri.
 * mascot3 yalnızca tebrik / mutluluk anlarında kullanılır — diğer yerlerde gösterme.
 */
export const CELEBRATION_MASCOT = require('../assets/maskot/mascot3.png');

/** Günlük / rastgele kullanım — mascot3 hariç */
export const MASCOTS = [
  require('../assets/maskot/mascot1.png'),
  require('../assets/maskot/mascot2.png'),
  require('../assets/maskot/mascot4.png'),
  require('../assets/maskot/mascot5.png'),
  require('../assets/maskot/mascot6.png'),
];

export function getRandomMascot() {
  return MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
}

/** Gün numarasına göre sabit maskot (1-indexed day → pool) */
export function getMascotByDay(dayNumber) {
  const n = Math.max(1, Number(dayNumber) || 1);
  return MASCOTS[(n - 1) % MASCOTS.length];
}

export const getMascotForDay = getMascotByDay;
