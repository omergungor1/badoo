import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  CONDITIONS,
  GENDERS,
  MEDICATIONS,
  SENSITIVITIES,
} from '../../constants/onboarding';
import { useAuth } from '../../context/AuthContext';
import {
  getGoalOptions,
  saveConditions,
  saveGoals,
  saveMedications,
  saveSensitivities,
  upsertProfile,
} from '../../services/profileService';
import Button from '../../components/ui/Button';
import Chip from '../../components/ui/Chip';
import GoalPicker from '../../components/ui/GoalPicker';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { calculateDailyTargets, getWeightAdvice } from '../../utils/nutrition';
import { formatActivityValue } from '../../utils/activity';
import { goalNamesFromOptions, validateGoalSelection } from '../../utils/goals';
import { colors, spacing, typography } from '../../theme';

const STEPS = ['Temel Bilgiler', 'Hedefler', 'Hastalıklar', 'Hassasiyetler', 'İlaçlar', 'Özet'];

function toggleItem(list, item) {
  return list.includes(item) ? list.filter((i) => i !== item) : [...list, item];
}

export default function OnboardingScreen() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [birthYear, setBirthYear] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goals, setGoals] = useState([]);
  const [goalOptions, setGoalOptions] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [customCondition, setCustomCondition] = useState('');
  const [sensitivities, setSensitivities] = useState([]);
  const [customSensitivity, setCustomSensitivity] = useState('');
  const [medications, setMedications] = useState([]);
  const [customMedication, setCustomMedication] = useState('');

  useEffect(() => {
    getGoalOptions().then(({ data, error }) => {
      if (error) {
        Alert.alert('Hata', error.message);
        return;
      }
      setGoalOptions(data || []);
    });
  }, []);

  const selectedGoalNames = useMemo(
    () => goalNamesFromOptions(goalOptions, goals),
    [goalOptions, goals],
  );

  const advice = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w) return null;
    return getWeightAdvice(w, h);
  }, [height, weight]);

  const targets = useMemo(() => {
    const year = Number(birthYear);
    const h = Number(height);
    const w = Number(weight);
    if (!year || !h || !w || !gender) return null;
    return calculateDailyTargets({ birthYear: year, gender, height: h, weight: w, goals: selectedGoalNames });
  }, [birthYear, gender, height, weight, selectedGoalNames]);

  async function handleFinish() {
    if (!user?.id) return;

    setLoading(true);

    const profilePayload = {
      user_id: user.id,
      birth_year: Number(birthYear),
      gender,
      height: Number(height),
      weight: Number(weight),
      daily_calorie_goal: targets?.calories || null,
      daily_protein_goal: targets?.protein || null,
      daily_water_goal: targets?.water || null,
      daily_activity_goal: targets?.activity || 10000,
      daily_activity_goal_type: 'steps',
      onboarding_completed: true,
    };

    const { error: profileError } = await upsertProfile(profilePayload);
    if (profileError) {
      setLoading(false);
      Alert.alert('Hata', profileError.message);
      return;
    }

    const allConditions = customCondition.trim()
      ? [...conditions, customCondition.trim()]
      : conditions;
    const allSensitivities = customSensitivity.trim()
      ? [...sensitivities, customSensitivity.trim()]
      : sensitivities;
    const allMedications = customMedication.trim()
      ? [...medications, customMedication.trim()]
      : medications;

    await Promise.all([
      saveGoals(user.id, goals),
      saveConditions(user.id, allConditions),
      saveSensitivities(user.id, allSensitivities),
      saveMedications(user.id, allMedications),
    ]);

    await refreshProfile(user.id);
    setLoading(false);
    router.replace('/(tabs)');
  }

  function nextStep() {
    if (step === 0) {
      if (!birthYear || !gender || !height || !weight) {
        Alert.alert('Eksik bilgi', 'Lütfen tüm temel bilgileri doldur.');
        return;
      }
    }

    if (step === 1) {
      const validation = validateGoalSelection(goals);
      if (!validation.ok) {
        Alert.alert('Eksik seçim', validation.message);
        return;
      }
    }

    if (step === STEPS.length - 1) {
      handleFinish();
      return;
    }

    setStep((s) => s + 1);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.progress}>
        Adım {step + 1}/{STEPS.length}
      </Text>
      <Text style={styles.title}>{STEPS[step]}</Text>

      {step === 0 && (
        <View style={styles.section}>
          <Input label="Doğum Yılı" value={birthYear} onChangeText={setBirthYear} keyboardType="number-pad" placeholder="1990" />
          <Text style={styles.label}>Cinsiyet</Text>
          <View style={styles.chips}>
            {GENDERS.map((item) => (
              <Chip key={item.value} label={item.label} selected={gender === item.value} onPress={() => setGender(item.value)} />
            ))}
          </View>
          <Input label="Boy (cm)" value={height} onChangeText={setHeight} keyboardType="number-pad" placeholder="170" />
          <Input label="Kilo (kg)" value={weight} onChangeText={setWeight} keyboardType="number-pad" placeholder="70" />
          {advice ? (
            <Card variant="light">
              <Text style={styles.cardTitle}>Vücut Kitle Endeksi: {advice.bmi}</Text>
              <Text style={styles.cardText}>{advice.category} — {advice.message}</Text>
              <Text style={styles.cardText}>İdeal aralık: {advice.idealRange}</Text>
            </Card>
          ) : null}
        </View>
      )}

      {step === 1 && (
        <View style={styles.section}>
          <Text style={styles.helper}>Birden fazla hedef seçebilirsin. En az 3 hedef zorunlu.</Text>
          <GoalPicker options={goalOptions} selectedIds={goals} onChange={setGoals} />
          {targets ? (
            <Card variant="light">
              <Text style={styles.cardTitle}>Günlük Hedeflerin</Text>
              <Text style={styles.cardText}>Kalori: {targets.calories} kcal</Text>
              <Text style={styles.cardText}>Protein: {targets.protein} g</Text>
              <Text style={styles.cardText}>Su: {targets.water} ml</Text>
              <Text style={styles.cardText}>
                Aktivite: {formatActivityValue(targets.activity, 'steps')}
              </Text>
            </Card>
          ) : null}
        </View>
      )}

      {step === 2 && (
        <View style={styles.section}>
          <View style={styles.chips}>
            {CONDITIONS.map((item) => (
              <Chip key={item} label={item} selected={conditions.includes(item)} onPress={() => setConditions(toggleItem(conditions, item))} />
            ))}
          </View>
          <Input label="Hastalık Ekle" value={customCondition} onChangeText={setCustomCondition} placeholder="Özel hastalık adı" />
        </View>
      )}

      {step === 3 && (
        <View style={styles.section}>
          <View style={styles.chips}>
            {SENSITIVITIES.map((item) => (
              <Chip key={item} label={item} selected={sensitivities.includes(item)} onPress={() => setSensitivities(toggleItem(sensitivities, item))} />
            ))}
          </View>
          <Input label="Hassasiyet Ekle" value={customSensitivity} onChangeText={setCustomSensitivity} placeholder="Özel hassasiyet" />
        </View>
      )}

      {step === 4 && (
        <View style={styles.section}>
          <View style={styles.chips}>
            {MEDICATIONS.map((item) => (
              <Chip key={item} label={item} selected={medications.includes(item)} onPress={() => setMedications(toggleItem(medications, item))} />
            ))}
          </View>
          <Input label="İlaç Ekle" value={customMedication} onChangeText={setCustomMedication} placeholder="Özel ilaç adı" />
        </View>
      )}

      {step === 5 && (
        <Card variant="light">
          <Text style={styles.cardTitle}>Harika! Hazırsın 🎉</Text>
          <Text style={styles.cardText}>Profilin kaydedilecek ve günlük takibe başlayabilirsin.</Text>
          {targets ? (
            <>
              <Text style={styles.cardText}>Günlük kalori hedefi: {targets.calories} kcal</Text>
              <Text style={styles.cardText}>Günlük protein hedefi: {targets.protein} g</Text>
              <Text style={styles.cardText}>Günlük su hedefi: {targets.water} ml</Text>
              <Text style={styles.cardText}>
                Günlük aktivite hedefi: {formatActivityValue(targets.activity, 'steps')}
              </Text>
            </>
          ) : null}
        </Card>
      )}

      <View style={styles.actions}>
        {step > 0 ? (
          <Button title="Geri" variant="outline" onPress={() => setStep((s) => s - 1)} style={styles.half} />
        ) : null}
        <Button
          title={step === STEPS.length - 1 ? 'Başla' : 'Devam Et'}
          onPress={nextStep}
          loading={loading}
          style={step > 0 ? styles.half : undefined}
        />
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  progress: { ...typography.caption, color: colors.textSecondary },
  title: { ...typography.h1, color: colors.textPrimary },
  section: { gap: spacing.md },
  label: { ...typography.bodySmall, color: colors.textSecondary },
  helper: { ...typography.bodySmall, color: colors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cardTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: 8 },
  cardText: { ...typography.body, color: colors.textSecondary },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  half: { flex: 1 },
});
