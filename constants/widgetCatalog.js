import { WIDGET_KINDS } from './widgets';

export const WIDGET_SCREEN = {
  home: 'Ana sayfa',
  lock: 'Kilit ekranı',
};

export const WIDGET_FAMILY = {
  systemMedium: 'systemMedium',
  accessoryRectangular: 'accessoryRectangular',
};

export const PROGRESS_RING_COLORS = {
  calories: { color: '#FF7A00', trackColor: 'rgba(255,255,255,0.18)' },
  water: { color: '#4AA8FF', trackColor: 'rgba(255,255,255,0.18)' },
  activity: { color: '#22C55E', trackColor: 'rgba(255,255,255,0.18)' },
};

const QUICK_ACTIONS_BASE = {
  kind: WIDGET_KINDS.quickActions,
  title: 'Badoo Hızlı Ekle',
  description: 'Öğün, su ve aktivite kayıtlarını hızlıca ekle.',
  gradient: ['#1A1A1F', '#292933'],
  actions: [
    { icon: 'camera', title: 'Öğünü Çek', subtitle: 'Fotoğraf' },
    { icon: 'restaurant', title: 'Öğün Ekle', subtitle: 'Liste' },
    { icon: 'water', title: 'Su Ekle', subtitle: 'Takip' },
    { icon: 'walk', title: 'Aktivite', subtitle: 'Kayıt' },
  ],
};

const QUICK_PROGRESS_BASE = {
  kind: WIDGET_KINDS.quickProgress,
  title: 'Badoo Hızlı Hedefler',
  description: 'Öğün, su ve aktivite hedeflerine ulaşma yüzdesini gösterir.',
  gradient: ['#1A1A1F', '#292933'],
  actions: [
    { icon: 'camera', title: 'Öğünü Çek', subtitle: 'Fotoğraf', progressKey: null },
    {
      icon: 'restaurant',
      title: 'Öğün Ekle',
      subtitle: 'Liste',
      progressKey: 'calories',
    },
    {
      icon: 'water',
      title: 'Su Ekle',
      subtitle: 'Takip',
      progressKey: 'water',
    },
    {
      icon: 'walk',
      title: 'Aktivite',
      subtitle: 'Kayıt',
      progressKey: 'activity',
    },
  ],
};

const NUTRITION_BASE = {
  kind: WIDGET_KINDS.nutrition,
  title: 'Badoo Günlük Özet',
  description: 'Kalori, protein, su ve aktivite ilerlemeni gösterir.',
  gradient: ['#1F57C7', '#2E7AEB'],
};

export const PROFILE_WIDGETS = [
  {
    key: 'quick-actions-home',
    ...QUICK_ACTIONS_BASE,
    family: WIDGET_FAMILY.systemMedium,
    screen: WIDGET_SCREEN.home,
  },
  {
    key: 'quick-actions-lock',
    ...QUICK_ACTIONS_BASE,
    family: WIDGET_FAMILY.accessoryRectangular,
    screen: WIDGET_SCREEN.lock,
  },
  {
    key: 'quick-progress-home',
    ...QUICK_PROGRESS_BASE,
    family: WIDGET_FAMILY.systemMedium,
    screen: WIDGET_SCREEN.home,
  },
  {
    key: 'quick-progress-lock',
    ...QUICK_PROGRESS_BASE,
    family: WIDGET_FAMILY.accessoryRectangular,
    screen: WIDGET_SCREEN.lock,
  },
  {
    key: 'nutrition-home',
    ...NUTRITION_BASE,
    family: WIDGET_FAMILY.systemMedium,
    screen: WIDGET_SCREEN.home,
  },
  {
    key: 'nutrition-lock',
    ...NUTRITION_BASE,
    family: WIDGET_FAMILY.accessoryRectangular,
    screen: WIDGET_SCREEN.lock,
  },
];

export const WIDGET_ADD_INSTRUCTIONS = [
  'Ana ekranda veya kilit ekranında boş bir alana uzun basın.',
  'Sol üstteki + düğmesine dokunun.',
  'Badoo uygulamasını arayın.',
  'Hızlı Ekle, Hızlı Hedefler veya Günlük Özet widget\'ını seçin.',
  'Ana sayfa için orta boy, kilit ekranı için dikdörtgen boyutu seçip Ekle\'ye dokunun.',
];
