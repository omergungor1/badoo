import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../../components/ui/BackButton';
import Button from '../../../components/ui/Button';
import { SYMPTOM_METRICS } from '../../../constants/elimination';
import { useAuth } from '../../../context/AuthContext';
import { logEliminationSymptoms } from '../../../services/eliminationService';
import { colors, radius, spacing, typography } from '../../../theme';

function ScoreRow({ label, value, onChange }) {
  return (
    <View style={styles.scoreRow}>
      <Text style={styles.scoreLabel}>{label}</Text>
      <View style={styles.scoreTrack}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            style={[styles.scoreDot, value === n && styles.scoreDotActive]}
          >
            <Text style={[styles.scoreDotText, value === n && styles.scoreDotTextActive]}>
              {n}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function LabSymptomsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [scores, setScores] = useState(() =>
    Object.fromEntries(SYMPTOM_METRICS.map((m) => [m.key, 0])),
  );
  const [cheated, setCheated] = useState(false);
  const [cheatNote, setCheatNote] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const setScore = useCallback((key, value) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  }, []);

  async function handleSave() {
    if (!user?.id || saving) return;
    setSaving(true);
    const { error } = await logEliminationSymptoms(user.id, sessionId, {
      scores,
      cheated,
      cheatNote: cheated ? cheatNote : null,
      note,
    });
    setSaving(false);
    if (error) {
      Alert.alert('Kaydedilemedi', error.message);
      return;
    }
    Alert.alert('Kaydedildi', 'Bugünkü gözlem deftere işlendi.');
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Belirti takibi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Her belirti için 0–10 puan ver. Enerji, odak, uyku ve ruh hali için yüksek = daha iyi;
          diğerlerinde yüksek = daha şiddetli.
        </Text>

        {SYMPTOM_METRICS.map((metric) => (
          <ScoreRow
            key={metric.key}
            label={metric.label}
            value={scores[metric.key]}
            onChange={(n) => setScore(metric.key, n)}
          />
        ))}

        <Text style={styles.section}>Bugün kaçamak yaptın mı?</Text>
        <View style={styles.row}>
          <Pressable
            onPress={() => setCheated(false)}
            style={[styles.choice, !cheated && styles.choiceOn]}
          >
            <Text style={[styles.choiceText, !cheated && styles.choiceTextOn]}>Hayır</Text>
          </Pressable>
          <Pressable
            onPress={() => setCheated(true)}
            style={[styles.choice, cheated && styles.choiceOn]}
          >
            <Text style={[styles.choiceText, cheated && styles.choiceTextOn]}>Evet</Text>
          </Pressable>
        </View>

        {cheated ? (
          <TextInput
            style={styles.input}
            placeholder="Ne tükettin?"
            placeholderTextColor={colors.textMuted}
            value={cheatNote}
            onChangeText={setCheatNote}
          />
        ) : null}

        <TextInput
          style={[styles.input, styles.inputTall]}
          placeholder="Not (opsiyonel)"
          placeholderTextColor={colors.textMuted}
          value={note}
          onChangeText={setNote}
          multiline
        />

        <Button title="Kaydet" onPress={handleSave} loading={saving} />
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
  headerTitle: {
    ...typography.bodySemiBold,
    fontSize: 18,
    color: colors.textPrimary,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  intro: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  scoreRow: { gap: 6 },
  scoreLabel: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  scoreTrack: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  scoreDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scoreDotActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  scoreDotText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  scoreDotTextActive: { color: colors.white },
  section: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  choice: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceOn: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  choiceText: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  choiceTextOn: { color: colors.white },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 48,
  },
  inputTall: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
});
