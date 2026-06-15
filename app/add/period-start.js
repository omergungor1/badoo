import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { startPeriod } from '../../services/periodService';
import Card from '../../components/ui/Card';
import DatePickerField from '../../components/ui/DatePickerField';
import FormActions from '../../components/ui/FormActions';
import SectionTitle from '../../components/ui/SectionTitle';
import { toISODate } from '../../utils/date';
import { spacing } from '../../theme';

export default function PeriodStartScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [startDate, setStartDate] = useState(toISODate());
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!user?.id) return;

    setLoading(true);
    const { error } = await startPeriod(user.id, startDate);
    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    Alert.alert('Kaydedildi', `${startDate} tarihli adet başlangıcı kaydedildi.`);
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionTitle
        title="Adet Başlangıcı"
        subtitle="Geçmiş bir günde başlayan adeti de bildirebilirsin"
      />

      <Card>
        <DatePickerField
          label="Başlangıç günü"
          value={startDate}
          onChange={setStartDate}
          maximumDate={new Date()}
        />
      </Card>

      <FormActions saveTitle="Başlangıç Bildir" onSave={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
});
