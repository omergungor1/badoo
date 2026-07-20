export const FOOD_UNIT_TYPES = {
  GRAM: 'gram',
  PIECE: 'piece',
  CUP: 'cup',
  ML: 'ml',
  TBSP: 'tbsp',
  SLICE: 'slice',
  // Eski kullanım adları; değerler DB'de İngilizce tutulur.
  ADET: 'piece',
  BARDAK: 'cup',
};

export const FOOD_UNIT_LABELS = {
  gram: 'gram',
  piece: 'adet',
  cup: 'bardak',
  ml: 'ml',
  tbsp: 'yemek kaşığı',
  slice: 'dilim',
};

export const FOOD_UNIT_NUTRITION_HINTS = {
  gram: '100 g başına',
  piece: '1 adet başına',
  cup: '1 bardak başına',
  ml: '1 ml başına',
  tbsp: '1 yemek kaşığı başına',
  slice: '1 dilim başına',
};

export const FOOD_UNIT_OPTIONS = [
  { value: FOOD_UNIT_TYPES.GRAM, label: 'Gram' },
  { value: FOOD_UNIT_TYPES.PIECE, label: 'Adet' },
  { value: FOOD_UNIT_TYPES.CUP, label: 'Bardak' },
  { value: FOOD_UNIT_TYPES.ML, label: 'Mililitre' },
  { value: FOOD_UNIT_TYPES.TBSP, label: 'Yemek Kaşığı' },
  { value: FOOD_UNIT_TYPES.SLICE, label: 'Dilim' },
];
