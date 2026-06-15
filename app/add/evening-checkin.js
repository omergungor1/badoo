import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { addDailyStatusLog, completeTask } from '../../services/logService';
import FormActions from '../../components/ui/FormActions';
import RatingPicker from '../../components/ui/RatingPicker';
import SectionTitle from '../../components/ui/SectionTitle';
import { spacing } from '../../theme';

export default function EveningCheckinScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [energy, setEnergy] = useState(3);
  const [stress, setStress] = useState(3);
  const [mood, setMood] = useState(3);
  const [motivation, setMotivation] = useState(3);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!user?.id) return;

    setLoading(true);
    const { error } = await addDailyStatusLog({
      userId: user.id,
      energy,
      stress,
      mood,
      motivation,
    });
    await completeTask(user.id, 'evening_checkin');
    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    Alert.alert('✅ Harika!', 'Gün sonu değerlendirmen kaydedildi.');
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionTitle title="🌙 Gün Sonu Değerlendirmesi" subtitle="Akşam durumunu kaydet" />
      <RatingPicker label="Enerji (1-5)" value={energy} onChange={setEnergy} max={5} />
      <RatingPicker label="Stres (1-5)" value={stress} onChange={setStress} max={5} />
      <RatingPicker label="Ruh hali (1-5)" value={mood} onChange={setMood} max={5} />
      <RatingPicker label="Motivasyon (1-5)" value={motivation} onChange={setMotivation} max={5} />
      <FormActions saveTitle="Tamamla" onSave={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
});
