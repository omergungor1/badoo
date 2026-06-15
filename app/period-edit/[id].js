import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getPeriodCycle, updatePeriodCycle } from '../../services/periodService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DatePickerField from '../../components/ui/DatePickerField';
import FormActions from '../../components/ui/FormActions';
import SectionTitle from '../../components/ui/SectionTitle';
import { formatDate, toISODate } from '../../utils/date';
import { formatPeriodDuration } from '../../utils/period';
import { colors, spacing, typography } from '../../theme';

export default function PeriodEditScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [hasEndDate, setHasEndDate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !id) return;

    getPeriodCycle(user.id, id).then(({ data, error }) => {
      setInitialLoading(false);
      if (error) {
        Alert.alert('Hata', error.message);
        return;
      }
      if (!data) {
        Alert.alert('Hata', 'Kayıt bulunamadı.');
        router.back();
        return;
      }

      setStartDate(data.start_date);
      setEndDate(data.end_date || '');
      setHasEndDate(!!data.end_date);
    });
  }, [user?.id, id, router]);

  async function handleSave() {
    if (!user?.id || !id) return;

    setLoading(true);
    const { error } = await updatePeriodCycle(user.id, id, {
      startDate,
      endDate: hasEndDate ? endDate : null,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    router.back();
  }

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <Text style={styles.loading}>Yükleniyor…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>← Geri</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Adet Kaydını Düzenle</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle title="Tarihleri güncelle" subtitle="Başlangıç ve bitiş günlerini düzenle" />

        <Card style={styles.card}>
          <DatePickerField
            label="Başlangıç günü"
            value={startDate}
            onChange={setStartDate}
            maximumDate={new Date()}
          />

          {hasEndDate ? (
            <DatePickerField
              label="Bitiş günü"
              value={endDate}
              onChange={setEndDate}
              minimumDate={startDate ? new Date(`${startDate}T12:00:00`) : undefined}
              maximumDate={new Date()}
            />
          ) : (
            <Text style={styles.ongoing}>Bu dönem devam ediyor (bitiş tarihi yok).</Text>
          )}

          {hasEndDate && startDate && endDate ? (
            <Text style={styles.duration}>
              Süre: {formatPeriodDuration({ start_date: startDate, end_date: endDate })}
            </Text>
          ) : null}
        </Card>

        {hasEndDate ? (
          <Button
            title="Bitiş Tarihini Kaldır (devam ediyor)"
            variant="outline"
            onPress={() => {
              setHasEndDate(false);
              setEndDate('');
            }}
          />
        ) : (
          <Button
            title="Bitiş Tarihi Ekle"
            variant="outline"
            onPress={() => {
              setHasEndDate(true);
              setEndDate(endDate || toISODate());
            }}
          />
        )}

        <FormActions saveTitle="Kaydet" onSave={handleSave} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  back: { ...typography.body, color: colors.primary },
  headerTitle: { ...typography.headingMedium, color: colors.textPrimary },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  card: { gap: spacing.md },
  ongoing: { ...typography.bodySmall, color: colors.primary },
  duration: { ...typography.caption, color: colors.textSecondary },
  loading: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
