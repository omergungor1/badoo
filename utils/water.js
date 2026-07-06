export const GLASS_ML = 200;
export const MAX_WATER_GLASSES = 15;

export function mlToGlasses(ml) {
  if (!ml || ml <= 0) return 0;
  return Math.round(ml / GLASS_ML);
}

export function glassesToMl(glasses) {
  return Math.max(0, glasses) * GLASS_ML;
}

export function formatWaterGoal(ml) {
  if (!ml) return '-';
  const glasses = mlToGlasses(ml);
  return `${ml} ml (${glasses} bardak)`;
}

export function clampGlasses(glasses) {
  return Math.min(MAX_WATER_GLASSES, Math.max(0, glasses));
}

export function goalGlassesFromMl(ml) {
  if (!ml || ml <= 0) return 8;
  return Math.max(1, Math.round(ml / GLASS_ML));
}

export function consumedGlassesFromMl(ml) {
  if (!ml || ml <= 0) return 0;
  return Math.floor(ml / GLASS_ML);
}
