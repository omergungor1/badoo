import { FOOD_UNIT_LABELS, FOOD_UNIT_TYPES } from '../constants/foodUnits';

const LEGACY_UNIT_MAP = {
  adet: FOOD_UNIT_TYPES.PIECE,
  bardak: FOOD_UNIT_TYPES.CUP,
};

export function normalizeUnitType(unitType) {
  if (!unitType) return FOOD_UNIT_TYPES.GRAM;
  return LEGACY_UNIT_MAP[unitType] || unitType;
}

export function isGramUnit(unitType) {
  return normalizeUnitType(unitType) === FOOD_UNIT_TYPES.GRAM;
}

export function usesNumericQuantityInput(unitType) {
  const normalized = normalizeUnitType(unitType);
  return normalized === FOOD_UNIT_TYPES.GRAM || normalized === FOOD_UNIT_TYPES.ML;
}

export function getDefaultQuantity(unitType) {
  const normalized = normalizeUnitType(unitType);
  if (normalized === FOOD_UNIT_TYPES.GRAM) return 100;
  if (normalized === FOOD_UNIT_TYPES.ML) return 200;
  return 1;
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
  const normalized = normalizeUnitType(unitType);
  const unit = FOOD_UNIT_LABELS[normalized] || 'gram';

  if (normalized === FOOD_UNIT_TYPES.PIECE && amount === 0.5) {
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
  if (normalized === FOOD_UNIT_TYPES.CUP) return '1 bardak';
  if (normalized === FOOD_UNIT_TYPES.ML) return '1 ml';
  if (normalized === FOOD_UNIT_TYPES.TBSP) return '1 yemek kaşığı';
  if (normalized === FOOD_UNIT_TYPES.SLICE) return '1 dilim';
  return '1 adet';
}
