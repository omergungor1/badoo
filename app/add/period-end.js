import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { endPeriod } from '../../services/periodService';
import Card from '../../components/ui/Card';
import DatePickerField from '../../components/ui/DatePickerField';
import FormActions from '../../components/ui/FormActions';
import SectionTitle from '../../components/ui/SectionTitle';
import { toISODate } from '../../utils/date';
import { spacing } from '../../theme';

export default function PeriodEndScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [endDate, setEndDate] = useState(toISODate());
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!user?.id) return;

    setLoading(true);
    const { error } = await endPeriod(user.id, endDate);
    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    Alert.alert('Kaydedildi', `${endDate} tarihli adet bitişi kaydedildi.`);
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionTitle
        title="Adet Bitişi"
        subtitle="Adetin bittiği günü seç"
      />

      <Card>
        <DatePickerField
          label="Bitiş günü"
          value={endDate}
          onChange={setEndDate}
          maximumDate={new Date()}
        />
      </Card>

      <FormActions saveTitle="Bitiş Bildir" onSave={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
});
