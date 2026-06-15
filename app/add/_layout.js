import { Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../theme';

function HeaderBackButton() {
  const router = useRouter();

  return (
    <Pressable onPress={() => router.back()} hitSlop={12} style={{ marginLeft: 4 }}>
      <Ionicons name="chevron-back" size={28} color={colors.primary} />
    </Pressable>
  );
}

const ADD_SCREEN_TITLES = {
  food: 'Yemek & İçecek Ekle',
  water: 'Su Ekle',
  medication: 'İlaç Ekle',
  symptom: 'Belirti Ekle',
  stool: 'Tuvalet Ekle',
  sleep: 'Ara Uyku Ekle',
  activity: 'Aktivite Ekle',
  note: 'Not Ekle',
  period: 'Regl Takibi',
  'period-start': 'Adet Başlangıcı',
  'period-end': 'Adet Bitişi',
  'period-symptom': 'Regl Semptomu',
  'period-note': 'Regl Notu',
  'morning-checkin': 'Sabah Check-in',
  'evening-checkin': 'Gün Sonu Değerlendirmesi',
};

export default function AddLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontFamily: typography.headingMedium.fontFamily },
        headerLeft: () => <HeaderBackButton />,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {Object.entries(ADD_SCREEN_TITLES).map(([name, title]) => (
        <Stack.Screen key={name} name={name} options={{ title }} />
      ))}
    </Stack>
  );
}
