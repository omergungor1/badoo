import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import {
  addMedication,
  deleteMedication,
  getMedications,
} from '../services/profileService';
import BackButton from '../components/ui/BackButton';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import SectionTitle from '../components/ui/SectionTitle';
import SwipeToDeleteRow from '../components/ui/SwipeToDeleteRow';
import { colors, spacing, typography } from '../theme';

function MedicationRow({ item }) {
  return (
    <Card style={styles.rowCard}>
      <Text style={styles.rowName}>{item.medication_name}</Text>
    </Card>
  );
}

export default function MedicationsScreen() {
  const { user } = useAuth();
  const [medications, setMedications] = useState([]);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const loadMedications = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await getMedications(user.id);
    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    setMedications(data || []);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadMedications();
    }, [loadMedications]),
  );

  async function handleAdd() {
    if (!user?.id) return;

    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert('Hata', 'İlaç adı girin.');
      return;
    }

    const exists = medications.some(
      (med) => med.medication_name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      Alert.alert('Hata', 'Bu ilaç zaten listede.');
      return;
    }

    setAdding(true);
    const { data, error } = await addMedication(user.id, trimmed);
    setAdding(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    setNewName('');
    setMedications((prev) =>
      [...prev, data].sort((a, b) => a.medication_name.localeCompare(b.medication_name, 'tr')),
    );
  }

  function confirmDelete(item) {
    Alert.alert(
      'İlacı sil',
      `"${item.medication_name}" listeden kaldırılsın mı? Geçmiş ilaç kayıtlarınız korunur.`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;

            const { error } = await deleteMedication(user.id, item.id);
            if (error) {
              Alert.alert('Hata', error.message);
              return;
            }

            setMedications((prev) => prev.filter((med) => med.id !== item.id));
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>İlaç Yönetimi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle title="Yeni İlaç" subtitle="Listeye eklemek için adı yazın" />
        <Card>
          <Input
            label="İlaç adı"
            value={newName}
            onChangeText={setNewName}
            placeholder="Örn. Omeprazol"
          />
          <Button title="Ekle" onPress={handleAdd} loading={adding} style={styles.addBtn} />
        </Card>

        <SectionTitle
          title="Kayıtlı İlaçlar"
          subtitle={medications.length ? `${medications.length} ilaç` : 'Henüz ilaç eklenmedi'}
        />

        {medications.length ? (
          <View style={styles.list}>
            {medications.map((item) => (
              <SwipeToDeleteRow key={item.id} onDelete={() => confirmDelete(item)}>
                <MedicationRow item={item} />
              </SwipeToDeleteRow>
            ))}
          </View>
        ) : (
          <Card>
            <Text style={styles.empty}>Kayıtlı ilaç yok. Yukarıdan yeni ilaç ekleyebilirsiniz.</Text>
          </Card>
        )}
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
  addBtn: { marginTop: spacing.sm },
  list: { gap: spacing.sm },
  rowCard: {
    paddingVertical: spacing.md,
  },
  rowName: { ...typography.body, color: colors.textPrimary },
  empty: { ...typography.body, color: colors.textSecondary },
});
