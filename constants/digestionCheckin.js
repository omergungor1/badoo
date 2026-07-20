/** Sindirim check-in — günde max 2 (sabah / öğleden sonra) */

export const AFTERNOON_CUTOFF_HOUR = 14;

export const CHECKIN_STORAGE_KEY = 'badoo_digestion_checkin_day_v1';

export const CHECKIN_SYMPTOMS = [
  { key: 'bloating', label: 'Şişkinlik' },
  { key: 'gas', label: 'Gaz' },
  { key: 'abdominal_pain', label: 'Karın ağrısı' },
  { key: 'stomach_pain', label: 'Mide ağrısı' },
  { key: 'heartburn', label: 'Mide yanması' },
  { key: 'nausea', label: 'Bulantı' },
  { key: 'burping', label: 'Geğirme' },
  { key: 'reflux', label: 'Reflü hissi' },
  { key: 'fatigue', label: 'Halsizlik' },
  { key: 'headache', label: 'Baş ağrısı' },
];

export const SEVERITY_OPTIONS = [
  { value: 1, label: 'Hafif' },
  { value: 2, label: 'Orta' },
  { value: 3, label: 'Şiddetli' },
];

/** Şiddetli belirti için tek takip sorusu (öncelik sırası) */
export const FOLLOW_UP_BY_SYMPTOM = {
  reflux: {
    question: 'Yatar pozisyonda mı arttı?',
    options: [
      { value: 'yes', label: 'Evet' },
      { value: 'no', label: 'Hayır' },
    ],
  },
  heartburn: {
    question: 'Yatar pozisyonda mı arttı?',
    options: [
      { value: 'yes', label: 'Evet' },
      { value: 'no', label: 'Hayır' },
    ],
  },
  gas: {
    question: 'Son öğünle ilişkili mi?',
    options: [
      { value: 'before_meal', label: 'Öğün öncesi' },
      { value: 'after_meal', label: 'Öğün sonrası' },
      { value: 'independent', label: 'Bağımsız' },
    ],
  },
  bloating: {
    question: 'Son öğünle ilişkili mi?',
    options: [
      { value: 'before_meal', label: 'Öğün öncesi' },
      { value: 'after_meal', label: 'Öğün sonrası' },
      { value: 'independent', label: 'Bağımsız' },
    ],
  },
  abdominal_pain: {
    question: 'Son öğünle ilişkili mi?',
    options: [
      { value: 'before_meal', label: 'Öğün öncesi' },
      { value: 'after_meal', label: 'Öğün sonrası' },
      { value: 'independent', label: 'Bağımsız' },
    ],
  },
  nausea: {
    question: 'Ne kadar süredir devam ediyor?',
    options: [
      { value: 'just_started', label: 'Yeni başladı' },
      { value: 'few_hours', label: 'Birkaç saattir' },
      { value: 'all_day', label: 'Bütün gün' },
    ],
  },
  stomach_pain: {
    question: 'Ne kadar süredir devam ediyor?',
    options: [
      { value: 'just_started', label: 'Yeni başladı' },
      { value: 'few_hours', label: 'Birkaç saattir' },
      { value: 'all_day', label: 'Bütün gün' },
    ],
  },
};

export const FOLLOW_UP_PRIORITY = [
  'reflux',
  'heartburn',
  'gas',
  'bloating',
  'abdominal_pain',
  'nausea',
  'stomach_pain',
  'burping',
  'fatigue',
  'headache',
];

export function getTimeOfDay(now = new Date()) {
  return now.getHours() < AFTERNOON_CUTOFF_HOUR ? 'morning' : 'afternoon';
}

export function pickFollowUpSymptom(selectedSymptoms) {
  const severe = (selectedSymptoms || []).filter((s) => s.severity === 3);
  if (!severe.length) return null;

  for (const key of FOLLOW_UP_PRIORITY) {
    const match = severe.find((s) => s.name === key);
    if (match && FOLLOW_UP_BY_SYMPTOM[key]) {
      return { symptom: key, ...FOLLOW_UP_BY_SYMPTOM[key] };
    }
  }

  const first = severe[0];
  return {
    symptom: first.name,
    question: 'Bu belirti günlük hayatını ne kadar etkiledi?',
    options: [
      { value: 'mild_impact', label: 'Az' },
      { value: 'moderate_impact', label: 'Orta' },
      { value: 'high_impact', label: 'Çok' },
    ],
  };
}
