import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { addDailyStatusLog, addSleepLog, completeTask } from '../../services/logService';
import FormActions from '../../components/ui/FormActions';
import NumberStepper from '../../components/ui/NumberStepper';
import RatingPicker from '../../components/ui/RatingPicker';
import SectionTitle from '../../components/ui/SectionTitle';
import { spacing } from '../../theme';

export default function MorningCheckinScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [hours, setHours] = useState(7);
  const [quality, setQuality] = useState(3);
  const [wakeCount, setWakeCount] = useState(0);
  const [energy, setEnergy] = useState(3);
  const [mood, setMood] = useState(3);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!user?.id) return;

    setLoading(true);
    const sleepResult = await addSleepLog({
      userId: user.id,
      hours,
      quality,
      wakeCount,
    });

    const statusResult = await addDailyStatusLog({
      userId: user.id,
      energy,
      stress: 3,
      mood,
      motivation: 3,
    });

    await completeTask(user.id, 'morning_checkin');
    setLoading(false);

    if (sleepResult.error || statusResult.error) {
      Alert.alert('Hata', sleepResult.error?.message || statusResult.error?.message);
      return;
    }

    Alert.alert('✅ Harika!', 'Sabah check-in tamamlandı.');
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionTitle title="☀️ Sabah Check-in" subtitle="Uyku ve sabah durumun" />
      <NumberStepper label="Kaç saat uyudun?" value={hours} onChange={setHours} min={0} max={14} unit="saat" />
      <RatingPicker label="Uyku kalitesi (1-5)" value={quality} onChange={setQuality} max={5} />
      <NumberStepper label="Gece kaç kez uyandın?" value={wakeCount} onChange={setWakeCount} min={0} max={10} unit="kez" />
      <RatingPicker label="Enerji (1-5)" value={energy} onChange={setEnergy} max={5} />
      <RatingPicker label="Ruh hali (1-5)" value={mood} onChange={setMood} max={5} />
      <FormActions saveTitle="Tamamla" onSave={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
});
