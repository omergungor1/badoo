export const FALLBACK_PERIOD_SYMPTOMS = [
  { symptom_key: 'cramp', symptom_name: 'Kramp', sort_order: 1 },
  { symptom_key: 'bloating', symptom_name: 'Şişkinlik', sort_order: 2 },
  { symptom_key: 'headache', symptom_name: 'Baş ağrısı', sort_order: 3 },
  { symptom_key: 'fatigue', symptom_name: 'Yorgunluk', sort_order: 4 },
  { symptom_key: 'mood', symptom_name: 'Ruh hali değişimi', sort_order: 5 },
  { symptom_key: 'breast_tenderness', symptom_name: 'Göğüs hassasiyeti', sort_order: 6 },
  { symptom_key: 'discharge', symptom_name: 'Akıntı', sort_order: 7 },
  { symptom_key: 'spotting', symptom_name: 'Lekelenme', sort_order: 8 },
  { symptom_key: 'back_pain', symptom_name: 'Bel ağrısı', sort_order: 9 },
  { symptom_key: 'nausea', symptom_name: 'Mide bulantısı', sort_order: 10 },
  { symptom_key: 'acne', symptom_name: 'Akne', sort_order: 11 },
  { symptom_key: 'craving', symptom_name: 'İştah / şeker isteği', sort_order: 12 },
  { symptom_key: 'insomnia', symptom_name: 'Uyku sorunu', sort_order: 13 },
  { symptom_key: 'diarrhea', symptom_name: 'İshal', sort_order: 14 },
  { symptom_key: 'constipation', symptom_name: 'Kabızlık', sort_order: 15 },
];

export function mapFallbackPeriodSymptoms() {
  return FALLBACK_PERIOD_SYMPTOMS.map((item) => ({
    ...item,
    id: item.symptom_key,
    is_active: true,
  }));
}

export const PERIOD_QUICK_ADD_ITEM = {
  key: 'period',
  label: 'Regl',
  emoji: '🩸',
  route: '/add/period',
  femaleOnly: true,
};

export const PERIOD_LOG_LABELS = {
  start: 'Başlangıç',
  end: 'Bitiş',
  symptom: 'Semptom',
  note: 'Not',
};
