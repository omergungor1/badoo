import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ACTIVITIES } from '../../constants/onboarding';
import { useAuth } from '../../context/AuthContext';
import { addActivityLog } from '../../services/logService';
import FormActions from '../../components/ui/FormActions';
import Chip from '../../components/ui/Chip';
import Input from '../../components/ui/Input';
import { spacing } from '../../theme';

export default function AddActivityScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [duration, setDuration] = useState('30');
  const [distance, setDistance] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!selected || !user?.id) {
      Alert.alert('Hata', 'Aktivite seç.');
      return;
    }

    setLoading(true);
    const { error } = await addActivityLog({
      userId: user.id,
      activityName: selected,
      duration: Number(duration) || 0,
      distance: distance ? Number(distance) : null,
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
      <View style={styles.chips}>
        {ACTIVITIES.map((activity) => (
          <Chip key={activity} label={activity} selected={selected === activity} onPress={() => setSelected(activity)} />
        ))}
      </View>
      <Input label="Süre (dakika)" value={duration} onChangeText={setDuration} keyboardType="number-pad" />
      <Input label="Mesafe (km, opsiyonel)" value={distance} onChangeText={setDistance} keyboardType="decimal-pad" />
      <FormActions onSave={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
