import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ACTIVITIES } from '../../constants/onboarding';
import { useAuth } from '../../context/AuthContext';
import { addActivityLog } from '../../services/logService';
import FormActions from '../../components/ui/FormActions';
import Chip from '../../components/ui/Chip';
import Input from '../../components/ui/Input';
import { getActivityGoal } from '../../utils/activity';
import { colors, spacing, typography } from '../../theme';

export default function AddActivityScreen() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [steps, setSteps] = useState('');
  const [loading, setLoading] = useState(false);

  const activityGoal = getActivityGoal(profile);
  const isDistanceGoal = activityGoal.type === 'distance_km';

  async function handleSave() {
    if (!selected || !user?.id) {
      Alert.alert('Hata', 'Aktivite seç.');
      return;
    }

    const parsedSteps = steps ? Number(steps) : null;
    const parsedDistance = distance ? Number(distance) : null;
    const parsedDuration = duration ? Number(duration) : null;

    if (
      (steps && Number.isNaN(parsedSteps)) ||
      (distance && Number.isNaN(parsedDistance)) ||
      (duration && Number.isNaN(parsedDuration))
    ) {
      Alert.alert('Hata', 'Sayısal alanları kontrol edin.');
      return;
    }

    if (!parsedSteps && !parsedDistance && !parsedDuration) {
      Alert.alert('Hata', isDistanceGoal ? 'Mesafe veya süre girin.' : 'Adım veya süre girin.');
      return;
    }

    setLoading(true);
    const { error } = await addActivityLog({
      userId: user.id,
      activityName: selected,
      duration: parsedDuration || 0,
      distance: parsedDistance,
      steps: parsedSteps,
      source: 'manual',
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
      <Text style={styles.helper}>
        Apple Sağlık verilerin otomatik senkronize edilir. Buradan eklediğin kayıtlar manuel olarak üstüne eklenir.
      </Text>

      <View style={styles.chips}>
        {ACTIVITIES.map((activity) => (
          <Chip key={activity} label={activity} selected={selected === activity} onPress={() => setSelected(activity)} />
        ))}
      </View>

      {isDistanceGoal ? (
        <Input
          label="Mesafe (km)"
          value={distance}
          onChangeText={setDistance}
          keyboardType="decimal-pad"
          placeholder="Örn. 2.5"
        />
      ) : (
        <Input
          label="Adım"
          value={steps}
          onChangeText={setSteps}
          keyboardType="number-pad"
          placeholder="Örn. 3000"
        />
      )}

      <Input
        label={isDistanceGoal ? 'Adım (opsiyonel)' : 'Mesafe (km, opsiyonel)'}
        value={isDistanceGoal ? steps : distance}
        onChangeText={isDistanceGoal ? setSteps : setDistance}
        keyboardType={isDistanceGoal ? 'number-pad' : 'decimal-pad'}
      />
      <Input label="Süre (dakika, opsiyonel)" value={duration} onChangeText={setDuration} keyboardType="number-pad" />
      <FormActions onSave={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  helper: { ...typography.bodySmall, color: colors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
