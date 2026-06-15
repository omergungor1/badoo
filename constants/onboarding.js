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

export const WATER_AMOUNTS = [200, 300, 500, 1000];

export const QUICK_ADD_ITEMS = [
  { key: 'food', label: 'Yemek & İçecek', emoji: '🍽', route: '/add/food' },
  { key: 'water', label: 'Su Ekle', emoji: '💧', route: '/add/water' },
  { key: 'medication', label: 'İlaç Ekle', emoji: '💊', route: '/add/medication' },
  { key: 'symptom', label: 'Belirti Ekle', emoji: '😖', route: '/add/symptom' },
  { key: 'stool', label: 'Tuvalet Ekle', emoji: '🚽', route: '/add/stool' },
  { key: 'sleep', label: 'Ara Uyku Ekle', emoji: '😴', route: '/add/sleep' },
  { key: 'activity', label: 'Aktivite Ekle', emoji: '🚶', route: '/add/activity' },
  { key: 'note', label: 'Not Ekle', emoji: '📝', route: '/add/note' },
];
