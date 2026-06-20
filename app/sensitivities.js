import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import {
  addSensitivity,
  deleteSensitivity,
  getSensitivities,
  updateSensitivity,
} from '../services/profileService';
import BackButton from '../components/ui/BackButton';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import SectionTitle from '../components/ui/SectionTitle';
import { colors, spacing, typography } from '../theme';

function SensitivityRow({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.sensitivity_name);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Hata', 'Hassasiyet adı boş olamaz.');
      return;
    }

    if (trimmed === item.sensitivity_name) {
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
    setName(item.sensitivity_name);
    setEditing(false);
  }

  if (editing) {
    return (
      <Card style={styles.rowCard}>
        <Input value={name} onChangeText={setName} placeholder="Hassasiyet adı" />
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
        <Text style={styles.rowName}>{item.sensitivity_name}</Text>
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

export default function SensitivitiesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [sensitivities, setSensitivities] = useState([]);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const loadSensitivities = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await getSensitivities(user.id);
    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    setSensitivities(data || []);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadSensitivities();
    }, [loadSensitivities]),
  );

  async function handleAdd() {
    if (!user?.id) return;

    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert('Hata', 'Hassasiyet adı girin.');
      return;
    }

    const exists = sensitivities.some(
      (item) => item.sensitivity_name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      Alert.alert('Hata', 'Bu hassasiyet zaten listede.');
      return;
    }

    setAdding(true);
    const { data, error } = await addSensitivity(user.id, trimmed);
    setAdding(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    setNewName('');
    setSensitivities((prev) =>
      [...prev, data].sort((a, b) => a.sensitivity_name.localeCompare(b.sensitivity_name, 'tr')),
    );
  }

  async function handleUpdate(sensitivityId, sensitivityName) {
    if (!user?.id) return { error: { message: 'Oturum bulunamadı.' } };

    const { data, error } = await updateSensitivity(user.id, sensitivityId, sensitivityName);
    if (!error && data) {
      setSensitivities((prev) =>
        prev
          .map((item) => (item.id === sensitivityId ? data : item))
          .sort((a, b) => a.sensitivity_name.localeCompare(b.sensitivity_name, 'tr')),
      );
    }

    return { error };
  }

  function confirmDelete(item) {
    Alert.alert(
      'Hassasiyeti sil',
      `"${item.sensitivity_name}" listeden kaldırılsın mı?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;

            const { error } = await deleteSensitivity(user.id, item.id);
            if (error) {
              Alert.alert('Hata', error.message);
              return;
            }

            setSensitivities((prev) => prev.filter((s) => s.id !== item.id));
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Besin Hassasiyeti Yönetimi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle title="Yeni Hassasiyet" subtitle="Listeye eklemek için adı yazın" />
        <Card>
          <Input
            label="Hassasiyet adı"
            value={newName}
            onChangeText={setNewName}
            placeholder="Örn. Laktoz"
          />
          <Button title="Ekle" onPress={handleAdd} loading={adding} style={styles.addBtn} />
        </Card>

        <SectionTitle
          title="Kayıtlı Hassasiyetler"
          subtitle={
            sensitivities.length
              ? `${sensitivities.length} hassasiyet`
              : 'Henüz hassasiyet eklenmedi'
          }
        />

        {sensitivities.length ? (
          sensitivities.map((item) => (
            <SensitivityRow
              key={item.id}
              item={item}
              onUpdate={handleUpdate}
              onDelete={confirmDelete}
            />
          ))
        ) : (
          <Card>
            <Text style={styles.empty}>
              Kayıtlı hassasiyet yok. Yukarıdan yeni hassasiyet ekleyebilirsiniz.
            </Text>
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
