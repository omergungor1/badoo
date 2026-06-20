import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ACTIVITY_GOAL_TYPE_OPTIONS, GENDERS } from '../constants/onboarding';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/profileService';
import BackButton from '../components/ui/BackButton';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import FormActions from '../components/ui/FormActions';
import Input from '../components/ui/Input';
import SectionTitle from '../components/ui/SectionTitle';
import WaterGlassPicker from '../components/ui/WaterGlassPicker';
import { getDefaultActivityGoal } from '../utils/activity';
import { glassesToMl, mlToGlasses } from '../utils/water';
import { colors, spacing, typography } from '../theme';

export default function EditProfileScreen() {
  const { user, profile, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [calorieGoal, setCalorieGoal] = useState('');
  const [proteinGoal, setProteinGoal] = useState('');
  const [activityGoal, setActivityGoal] = useState('10000');
  const [activityGoalType, setActivityGoalType] = useState('steps');
  const [waterGlasses, setWaterGlasses] = useState(8);

  useEffect(() => {
    if (!profile) return;

    setBirthYear(profile.birth_year ? String(profile.birth_year) : '');
    setGender(profile.gender || '');
    setHeight(profile.height ? String(profile.height) : '');
    setWeight(profile.weight ? String(profile.weight) : '');
    setCalorieGoal(profile.daily_calorie_goal ? String(profile.daily_calorie_goal) : '');
    setProteinGoal(profile.daily_protein_goal ? String(profile.daily_protein_goal) : '');
    setWaterGlasses(mlToGlasses(profile.daily_water_goal) || 8);
    setActivityGoal(
      profile.daily_activity_goal != null
        ? String(profile.daily_activity_goal)
        : String(getDefaultActivityGoal(profile.daily_activity_goal_type)),
    );
    setActivityGoalType(profile.daily_activity_goal_type || 'steps');
  }, [profile]);

  async function handleSave() {
    if (!user?.id) return;

    if (!birthYear || !gender || !height || !weight) {
      Alert.alert('Eksik bilgi', 'Boy, kilo, doğum yılı ve cinsiyet zorunludur.');
      return;
    }

    const parsedBirthYear = Number(birthYear);
    const parsedHeight = Number(height);
    const parsedWeight = Number(weight);
    const parsedCalories = calorieGoal ? Number(calorieGoal) : null;
    const parsedProtein = proteinGoal ? Number(proteinGoal) : null;
    const parsedActivity = activityGoal ? Number(activityGoal) : null;

    if (
      Number.isNaN(parsedBirthYear) ||
      Number.isNaN(parsedHeight) ||
      Number.isNaN(parsedWeight) ||
      (calorieGoal && Number.isNaN(parsedCalories)) ||
      (proteinGoal && Number.isNaN(parsedProtein)) ||
      (activityGoal && Number.isNaN(parsedActivity))
    ) {
      Alert.alert('Hata', 'Sayısal alanları kontrol edin.');
      return;
    }

    setLoading(true);

    const { error } = await updateProfile(user.id, {
      birth_year: parsedBirthYear,
      gender,
      height: parsedHeight,
      weight: parsedWeight,
      daily_calorie_goal: parsedCalories,
      daily_protein_goal: parsedProtein,
      daily_water_goal: glassesToMl(waterGlasses),
      daily_activity_goal: parsedActivity || getDefaultActivityGoal(activityGoalType),
      daily_activity_goal_type: activityGoalType,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    await refreshProfile(user.id);
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Profil Bilgileri</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle title="Temel Bilgiler" subtitle="Boy, kilo ve kişisel bilgiler" />
        <Card style={styles.card}>
          <Input
            label="Doğum yılı"
            value={birthYear}
            onChangeText={setBirthYear}
            placeholder="1990"
            keyboardType="number-pad"
          />
          <Input
            label="Boy (cm)"
            value={height}
            onChangeText={setHeight}
            placeholder="170"
            keyboardType="number-pad"
          />
          <Input
            label="Kilo (kg)"
            value={weight}
            onChangeText={setWeight}
            placeholder="70"
            keyboardType="number-pad"
          />

          <Text style={styles.fieldLabel}>Cinsiyet</Text>
          <View style={styles.chips}>
            {GENDERS.map((item) => (
              <Chip
                key={item.value}
                label={item.label}
                selected={gender === item.value}
                onPress={() => setGender(item.value)}
              />
            ))}
          </View>
        </Card>

        <SectionTitle title="Günlük Hedefler" subtitle="Kalori, protein, su ve aktivite hedefleriniz" />
        <Card style={styles.card}>
          <Input
            label="Günlük kalori hedefi (kcal)"
            value={calorieGoal}
            onChangeText={setCalorieGoal}
            placeholder="2000"
            keyboardType="number-pad"
          />
          <Input
            label="Günlük protein hedefi (g)"
            value={proteinGoal}
            onChangeText={setProteinGoal}
            placeholder="100"
            keyboardType="number-pad"
          />
          <Text style={styles.fieldLabel}>Aktivite hedef türü</Text>
          <View style={styles.chips}>
            {ACTIVITY_GOAL_TYPE_OPTIONS.map((option) => (
              <Chip
                key={option.key}
                label={option.label}
                selected={activityGoalType === option.key}
                onPress={() => {
                  setActivityGoalType(option.key);
                  setActivityGoal(String(option.defaultGoal));
                }}
              />
            ))}
          </View>
          <Input
            label={
              activityGoalType === 'distance_km'
                ? 'Günlük yürüyüş hedefi (km)'
                : 'Günlük adım hedefi'
            }
            value={activityGoal}
            onChangeText={setActivityGoal}
            placeholder={activityGoalType === 'distance_km' ? '5' : '10000'}
            keyboardType="number-pad"
          />

          <Text style={styles.fieldLabel}>Günlük su hedefi (1 bardak = 200 ml)</Text>
          <WaterGlassPicker glasses={waterGlasses} onChange={setWaterGlasses} />
        </Card>

        <FormActions onSave={handleSave} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTitle: { ...typography.headingMedium, color: colors.textPrimary, flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  card: { gap: spacing.md },
  fieldLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
});
