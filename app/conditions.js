import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import {
  addCondition,
  deleteCondition,
  getConditions,
  updateCondition,
} from '../services/profileService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import SectionTitle from '../components/ui/SectionTitle';
import { colors, spacing, typography } from '../theme';

function ConditionRow({ item, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(item.condition_name);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Hata', 'Hastalık adı boş olamaz.');
      return;
    }

    if (trimmed === item.condition_name) {
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
    setName(item.condition_name);
    setEditing(false);
  }

  if (editing) {
    return (
      <Card style={styles.rowCard}>
        <Input value={name} onChangeText={setName} placeholder="Hastalık adı" />
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
        <Text style={styles.rowName}>{item.condition_name}</Text>
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

export default function ConditionsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [conditions, setConditions] = useState([]);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const loadConditions = useCallback(async () => {
    if (!user?.id) return;

    const { data, error } = await getConditions(user.id);
    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    setConditions(data || []);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadConditions();
    }, [loadConditions]),
  );

  async function handleAdd() {
    if (!user?.id) return;

    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert('Hata', 'Hastalık adı girin.');
      return;
    }

    const exists = conditions.some(
      (item) => item.condition_name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      Alert.alert('Hata', 'Bu hastalık zaten listede.');
      return;
    }

    setAdding(true);
    const { data, error } = await addCondition(user.id, trimmed);
    setAdding(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    setNewName('');
    setConditions((prev) =>
      [...prev, data].sort((a, b) => a.condition_name.localeCompare(b.condition_name, 'tr')),
    );
  }

  async function handleUpdate(conditionId, conditionName) {
    if (!user?.id) return { error: { message: 'Oturum bulunamadı.' } };

    const { data, error } = await updateCondition(user.id, conditionId, conditionName);
    if (!error && data) {
      setConditions((prev) =>
        prev
          .map((item) => (item.id === conditionId ? data : item))
          .sort((a, b) => a.condition_name.localeCompare(b.condition_name, 'tr')),
      );
    }

    return { error };
  }

  function confirmDelete(item) {
    Alert.alert(
      'Hastalığı sil',
      `"${item.condition_name}" listeden kaldırılsın mı?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;

            const { error } = await deleteCondition(user.id, item.id);
            if (error) {
              Alert.alert('Hata', error.message);
              return;
            }

            setConditions((prev) => prev.filter((c) => c.id !== item.id));
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>← Geri</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Hastalık Yönetimi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <SectionTitle title="Yeni Hastalık" subtitle="Listeye eklemek için adı yazın" />
        <Card>
          <Input
            label="Hastalık adı"
            value={newName}
            onChangeText={setNewName}
            placeholder="Örn. Gastrit"
          />
          <Button title="Ekle" onPress={handleAdd} loading={adding} style={styles.addBtn} />
        </Card>

        <SectionTitle
          title="Kayıtlı Hastalıklar"
          subtitle={conditions.length ? `${conditions.length} hastalık` : 'Henüz hastalık eklenmedi'}
        />

        {conditions.length ? (
          conditions.map((item) => (
            <ConditionRow
              key={item.id}
              item={item}
              onUpdate={handleUpdate}
              onDelete={confirmDelete}
            />
          ))
        ) : (
          <Card>
            <Text style={styles.empty}>Kayıtlı hastalık yok. Yukarıdan yeni hastalık ekleyebilirsiniz.</Text>
          </Card>
        )}
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
