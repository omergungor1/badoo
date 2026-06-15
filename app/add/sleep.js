import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { addSleepLog } from '../../services/logService';
import FormActions from '../../components/ui/FormActions';
import MinuteStepper from '../../components/ui/MinuteStepper';
import RatingPicker from '../../components/ui/RatingPicker';
import SectionTitle from '../../components/ui/SectionTitle';
import { NAP_MAX_MINUTES, NAP_MIN_MINUTES, NAP_STEP_MINUTES } from '../../utils/duration';
import { colors, spacing, typography } from '../../theme';

export default function AddSleepScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [quality, setQuality] = useState(3);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!user?.id) return;

    setLoading(true);
    const { error } = await addSleepLog({
      userId: user.id,
      durationMinutes,
      quality,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionTitle title="😴 Ara Uyku" subtitle="Gün içi şekerleme veya kısa uyku kaydı" />
      <Text style={styles.helper}>Süreyi 15 dakikalık adımlarla ayarlayın.</Text>
      <MinuteStepper
        label="Ne kadar uyudun?"
        minutes={durationMinutes}
        onChange={setDurationMinutes}
        step={NAP_STEP_MINUTES}
        min={NAP_MIN_MINUTES}
        max={NAP_MAX_MINUTES}
      />
      <RatingPicker label="Uyku kalitesi (1-5)" value={quality} onChange={setQuality} max={5} />
      <FormActions onSave={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  helper: { ...typography.bodySmall, color: colors.textSecondary },
});
