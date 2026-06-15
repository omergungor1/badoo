import { FOOD_UNIT_LABELS, FOOD_UNIT_TYPES } from '../constants/foodUnits';

export function normalizeUnitType(unitType) {
  return unitType || FOOD_UNIT_TYPES.GRAM;
}

export function isGramUnit(unitType) {
  return normalizeUnitType(unitType) === FOOD_UNIT_TYPES.GRAM;
}

export function getDefaultQuantity(unitType) {
  return isGramUnit(unitType) ? 100 : 1;
}

export function getNutritionFactor(quantity, unitType) {
  const amount = Number(quantity) || 0;
  if (isGramUnit(unitType)) {
    return amount / 100;
  }
  return amount;
}

export function formatQuantityLabel(quantity, unitType) {
  const amount = Number(quantity) || 0;
  const unit = FOOD_UNIT_LABELS[normalizeUnitType(unitType)] || 'gram';

  if (unitType === FOOD_UNIT_TYPES.ADET && amount === 0.5) {
    return 'yarım adet';
  }

  if (Number.isInteger(amount)) {
    return `${amount} ${unit}`;
  }

  return `${amount} ${unit}`;
}

export function formatNutritionBasis(unitType) {
  const normalized = normalizeUnitType(unitType);
  if (normalized === FOOD_UNIT_TYPES.GRAM) return '100 g';
  if (normalized === FOOD_UNIT_TYPES.BARDAK) return '1 bardak';
  return '1 adet';
}
