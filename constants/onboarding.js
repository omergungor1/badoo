export const CONDITIONS = [
  'IBS',
  'Gastrit',
  'Reflü',
  'Çölyak',
  'Laktoz intoleransı',
  'Fruktoz intoleransı',
  'H. pylori geçmişi',
  'Kabızlık',
  'Kronik ishal',
  'Diyabet',
  'Hipotiroidi',
  'Hashimoto',
];

export const SENSITIVITIES = [
  'Süt',
  'Laktoz',
  'Gluten',
  'Buğday',
  'Yumurta',
  'Soya',
  'Fındık/Fıstık',
  'Deniz ürünleri',
];

export const MEDICATIONS = [
  'Omeprazol',
  'Pantoprazol',
  'Metformin',
  'Levotiroksin',
  'Probiyotik',
  'Laktaz enzimi',
  'İbuprofen',
  'Parasetamol',
];

export const SYMPTOMS = [
  'Şişkinlik',
  'Gaz',
  'Karın ağrısı',
  'Mide ağrısı',
  'Mide yanması',
  'Mide bulantısı',
  'Geğirme',
  'Reflü hissi',
  'Halsizlik',
  'Baş ağrısı',
];

export const DRINKS = [
  'Çay',
  'Kahve',
  'Kola',
  'Enerji içeceği',
  'Soda',
  'Ayran',
  'Meyve suyu',
  'Su',
];

export const ACTIVITIES = [
  'Yürüyüş',
  'Koşu',
  'Bisiklet',
  'Fitness',
  'Yüzme',
];

export const BRISTOL_TYPES = [
  { value: 'Bristol 1', label: 'Bristol 1 - Sert topaklar' },
  { value: 'Bristol 2', label: 'Bristol 2 - Sosis şeklinde topaklı' },
  { value: 'Bristol 3', label: 'Bristol 3 - Çatlaklı sosis' },
  { value: 'Bristol 4', label: 'Bristol 4 - Pürüzsüz sosis' },
  { value: 'Bristol 5', label: 'Bristol 5 - Yumuşak parçalar' },
  { value: 'Bristol 6', label: 'Bristol 6 - Bulanık kenarlı' },
  { value: 'Bristol 7', label: 'Bristol 7 - Sıvı' },
];

export const GENDERS = [
  { value: 'kadın', label: 'Kadın' },
  { value: 'erkek', label: 'Erkek' },
  { value: 'belirtmek istemiyorum', label: 'Belirtmek istemiyorum' },
];

export const DAILY_TASKS = [
  { key: 'morning_checkin', name: 'Sabah durumunu gir', emoji: '☀️' },
  { key: 'meals', name: 'Öğünlerini ekle', emoji: '🍽' },
  { key: 'water', name: 'Su takibini tamamla', emoji: '💧' },
  { key: 'stool', name: 'Tuvalet kaydı ekle', emoji: '🚽' },
  { key: 'evening_checkin', name: 'Gün sonu değerlendirmesi yap', emoji: '🌙' },
];

export const DAILY_TASK_RING_CONFIG = {
  morning_checkin: {
    slogan: 'Sabah kaydını tamamla',
    shortLabel: 'Sabah',
    color: '#FF9F43',
    trackColor: '#FFF0E0',
  },
  meals: {
    slogan: 'Beslenme halkanını kapat',
    shortLabel: 'Öğün',
    color: '#FF7A00',
    trackColor: '#FFF1E5',
  },
  water: {
    slogan: 'Su halkanını doldur',
    shortLabel: 'Su',
    color: '#4AA8FF',
    trackColor: '#E8F4FF',
  },
  stool: {
    slogan: 'Sindirim kaydını ekle',
    shortLabel: 'Tuvalet',
    color: '#8B5CF6',
    trackColor: '#F3EEFF',
  },
  evening_checkin: {
    slogan: 'Gün sonu kaydını tamamla',
    shortLabel: 'Gün sonu',
    color: '#7C83FD',
    trackColor: '#EEF0FF',
  },
};

export const DEFAULT_DAILY_ACTIVITY_GOAL = 10000;
export const DEFAULT_ACTIVITY_GOAL_TYPE = 'steps';

export const ACTIVITY_GOAL_TYPES = {
  steps: {
    key: 'steps',
    label: 'Adım',
    unit: 'adım',
    defaultGoal: 10000,
    ringLabel: 'Adım',
  },
  distance_km: {
    key: 'distance_km',
    label: 'Yürüyüş mesafesi',
    unit: 'km',
    defaultGoal: 5,
    ringLabel: 'Yürüyüş',
  },
};

export const ACTIVITY_GOAL_TYPE_OPTIONS = Object.values(ACTIVITY_GOAL_TYPES);

export const NUTRITION_RING_CONFIG = {
  calories: {
    label: 'Kalori',
    color: '#FF7A00',
    trackColor: '#FFF1E5',
  },
  protein: {
    label: 'Protein',
    color: '#8B5CF6',
    trackColor: '#F3EEFF',
  },
  water: {
    label: 'Su',
    color: '#4AA8FF',
    trackColor: '#E8F4FF',
  },
  activity: {
    label: 'Aktivite',
    color: '#22C55E',
    trackColor: '#EAFBF0',
  },
};

export const WATER_AMOUNTS = [200, 300, 500, 1000];

export const QUICK_ADD_ITEMS = [
  { key: 'voice', label: 'Sesli Kayıt', icon: 'mic', route: '/add/voice-note' },
  { key: 'food', label: 'Yiyecek Listesi', icon: 'search', route: '/add/food' },
  { key: 'water', label: 'Su Ekle', icon: 'water', route: '/add/water' },
  { key: 'medication', label: 'İlaç Ekle', icon: 'medkit', route: '/add/medication' },
  { key: 'symptom', label: 'Belirti Ekle', icon: 'pulse', route: '/add/symptom' },
  { key: 'stool', label: 'Tuvalet Ekle', icon: 'stats-chart', route: '/add/stool' },
  { key: 'sleep', label: 'Ara Uyku Ekle', icon: 'moon', route: '/add/sleep' },
  { key: 'activity', label: 'Aktivite Ekle', icon: 'walk', route: '/add/activity' },
  { key: 'note', label: 'Not Ekle', icon: 'document-text', route: '/add/note' },
];
