import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import {
  addMedication,
  deleteMedication,
  getMedications,
  updateMedication,
} from '../services/profileService';
import BackButton from '../components/ui/BackButton';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import SectionTitle from '../components/ui/SectionTitle';
import { colors, spacing, typography } from '../theme';

function MedicationRow({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.medication_name);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Hata', 'İlaç adı boş olamaz.');
      return;
    }

    if (trimmed === item.medication_name) {
      setEditing(false);
      return;
    }

    setLoading(true);
    const { error } = await onUpdate(item.id, trimmed);
    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    setEditing(false);
  }

  function handleCancel() {
    setName(item.medication_name);
    setEditing(false);
  }

  if (editing) {
    return (
      <Card style={styles.rowCard}>
        <Input value={name} onChangeText={setName} placeholder="İlaç adı" />
        <View style={styles.rowActions}>
          <Button title="Vazgeç" variant="outline" onPress={handleCancel} style={styles.actionBtn} />
          <Button title="Kaydet" onPress={handleSave} loading={loading} style={styles.actionBtn} />
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.rowCard}>
      <View style={styles.rowHeader}>
        <Text style={styles.rowName}>{item.medication_name}</Text>
        <View style={styles.rowActions}>
          <Pressable onPress={() => setEditing(true)} hitSlop={8}>
            <Text style={styles.link}>Düzenle</Text>
          </Pressable>
          <Pressable onPress={() => onDelete(item)} hitSlop={8}>
            <Text style={styles.danger}>Sil</Text>
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

export default function MedicationsScreen() {
  const { user } = useAuth();
  const router = useRouter();
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
    setMedications((prev) => [...prev, data].sort((a, b) => a.medication_name.localeCompare(b.medication_name, 'tr')));
  }

  async function handleUpdate(medicationId, medicationName) {
    if (!user?.id) return { error: { message: 'Oturum bulunamadı.' } };

    const { data, error } = await updateMedication(user.id, medicationId, medicationName);
    if (!error && data) {
      setMedications((prev) =>
        prev
          .map((med) => (med.id === medicationId ? data : med))
          .sort((a, b) => a.medication_name.localeCompare(b.medication_name, 'tr')),
      );
    }

    return { error };
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
          medications.map((item) => (
            <MedicationRow
              key={item.id}
              item={item}
              onUpdate={handleUpdate}
              onDelete={confirmDelete}
            />
          ))
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
  rowCard: { gap: spacing.sm },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowName: { ...typography.body, color: colors.textPrimary, flex: 1 },
  rowActions: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  actionBtn: { flex: 1 },
  link: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  danger: { ...typography.bodySmall, color: colors.danger, fontWeight: '600' },
  empty: { ...typography.body, color: colors.textSecondary },
});
