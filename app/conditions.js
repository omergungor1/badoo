import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRESET_CONDITIONS } from '../constants/conditions';
import { useAuth } from '../context/AuthContext';
import {
  addCondition,
  deleteCondition,
  getConditions,
} from '../services/profileService';
import BackButton from '../components/ui/BackButton';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Input from '../components/ui/Input';
import SectionTitle from '../components/ui/SectionTitle';
import SwipeToDeleteRow from '../components/ui/SwipeToDeleteRow';
import { colors, spacing, typography } from '../theme';

function normalizeName(value) {
  return String(value || '').trim().toLocaleLowerCase('tr-TR');
}

function ConditionRow({ item }) {
  return (
    <Card style={styles.rowCard}>
      <Text style={styles.rowName}>{item.condition_name}</Text>
    </Card>
  );
}

export default function ConditionsScreen() {
  const { user } = useAuth();
  const [conditions, setConditions] = useState([]);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addingPreset, setAddingPreset] = useState(null);

  const availablePresets = useMemo(() => {
    const owned = new Set(conditions.map((item) => normalizeName(item.condition_name)));
    return PRESET_CONDITIONS.filter((name) => !owned.has(normalizeName(name)));
  }, [conditions]);

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

  async function addByName(name) {
    if (!user?.id) return null;

    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Hata', 'Hastalık adı girin.');
      return null;
    }

    const exists = conditions.some(
      (item) => normalizeName(item.condition_name) === normalizeName(trimmed),
    );
    if (exists) {
      Alert.alert('Hata', 'Bu hastalık zaten listede.');
      return null;
    }

    const { data, error } = await addCondition(user.id, trimmed);
    if (error) {
      Alert.alert('Hata', error.message);
      return null;
    }

    setConditions((prev) =>
      [...prev, data].sort((a, b) => a.condition_name.localeCompare(b.condition_name, 'tr')),
    );
    return data;
  }

  async function handleAdd() {
    setAdding(true);
    const data = await addByName(newName);
    setAdding(false);
    if (data) setNewName('');
  }

  async function handlePresetAdd(name) {
    if (addingPreset) return;

    setAddingPreset(name);
    await addByName(name);
    setAddingPreset(null);
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
        <BackButton />
        <Text style={styles.headerTitle}>Hastalık Yönetimi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {availablePresets.length ? (
          <>
            <SectionTitle
              title="Hazır Hastalıklar"
              subtitle="Dokunarak hızlıca ekle"
            />
            <Card>
              <View style={styles.chips}>
                {availablePresets.map((name) => (
                  <Chip
                    key={name}
                    label={addingPreset === name ? 'Ekleniyor…' : `+ ${name}`}
                    onPress={() => handlePresetAdd(name)}
                  />
                ))}
              </View>
            </Card>
          </>
        ) : null}

        <SectionTitle title="Yeni Hastalık" subtitle="Listede yoksa adını yazarak ekle" />
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
          <View style={styles.list}>
            {conditions.map((item) => (
              <SwipeToDeleteRow key={item.id} onDelete={() => confirmDelete(item)}>
                <ConditionRow item={item} />
              </SwipeToDeleteRow>
            ))}
          </View>
        ) : (
          <Card>
            <Text style={styles.empty}>
              Kayıtlı hastalık yok. Yukarıdaki hazır listeden seçebilir veya yeni hastalık ekleyebilirsin.
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
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  addBtn: { marginTop: spacing.sm },
  list: { gap: spacing.sm },
  rowCard: {
    paddingVertical: spacing.md,
  },
  rowName: { ...typography.body, color: colors.textPrimary },
  empty: { ...typography.body, color: colors.textSecondary },
});
