import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { getGoalOptions, getGoals, saveGoals } from '../services/profileService';
import BackButton from '../components/ui/BackButton';
import Card from '../components/ui/Card';
import FormActions from '../components/ui/FormActions';
import GoalPicker from '../components/ui/GoalPicker';
import SectionTitle from '../components/ui/SectionTitle';
import { mapSavedGoalsToSelectedIds, validateGoalSelection } from '../utils/goals';
import { colors, spacing, typography } from '../theme';

export default function GoalsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [options, setOptions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    setInitialLoading(true);

    const [optionsResult, goalsResult] = await Promise.all([
      getGoalOptions(),
      getGoals(user.id),
    ]);

    if (optionsResult.error) {
      Alert.alert('Hata', optionsResult.error.message);
      setInitialLoading(false);
      return;
    }

    const loadedOptions = optionsResult.data || [];
    setOptions(loadedOptions);

    if (goalsResult.error) {
      Alert.alert('Hata', goalsResult.error.message);
    } else {
      setSelectedIds(mapSavedGoalsToSelectedIds(goalsResult.data || [], loadedOptions));
    }

    setInitialLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  async function handleSave() {
    if (!user?.id) return;

    const validation = validateGoalSelection(selectedIds);
    if (!validation.ok) {
      Alert.alert('Eksik seçim', validation.message);
      return;
    }

    setLoading(true);
    const { error } = await saveGoals(user.id, selectedIds);
    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    router.back();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Hedeflerim</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle
          title="Hedef Seçimi"
          subtitle="Uygulama deneyimini kişiselleştirmek için en az 3 hedef seçin"
        />

        <Card>
          {initialLoading ? (
            <Text style={styles.loading}>Hedefler yükleniyor…</Text>
          ) : (
            <GoalPicker options={options} selectedIds={selectedIds} onChange={setSelectedIds} />
          )}
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
  loading: { ...typography.body, color: colors.textSecondary },
});
