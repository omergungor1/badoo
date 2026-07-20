import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PRESET_SENSITIVITIES } from '../constants/sensitivities';
import { useAuth } from '../context/AuthContext';
import {
  addSensitivity,
  deleteSensitivity,
  getSensitivities,
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

function SensitivityRow({ item }) {
  return (
    <Card style={styles.rowCard}>
      <Text style={styles.rowName}>{item.sensitivity_name}</Text>
    </Card>
  );
}

export default function SensitivitiesScreen() {
  const { user } = useAuth();
  const [sensitivities, setSensitivities] = useState([]);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addingPreset, setAddingPreset] = useState(null);

  const availablePresets = useMemo(() => {
    const owned = new Set(sensitivities.map((item) => normalizeName(item.sensitivity_name)));
    return PRESET_SENSITIVITIES.filter((name) => !owned.has(normalizeName(name)));
  }, [sensitivities]);

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

  async function addByName(name) {
    if (!user?.id) return null;

    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Hata', 'Hassasiyet adı girin.');
      return null;
    }

    const exists = sensitivities.some(
      (item) => normalizeName(item.sensitivity_name) === normalizeName(trimmed),
    );
    if (exists) {
      Alert.alert('Hata', 'Bu hassasiyet zaten listede.');
      return null;
    }

    const { data, error } = await addSensitivity(user.id, trimmed);
    if (error) {
      Alert.alert('Hata', error.message);
      return null;
    }

    setSensitivities((prev) =>
      [...prev, data].sort((a, b) => a.sensitivity_name.localeCompare(b.sensitivity_name, 'tr')),
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
        {availablePresets.length ? (
          <>
            <SectionTitle
              title="Hazır Hassasiyetler"
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

        <SectionTitle title="Yeni Hassasiyet" subtitle="Listede yoksa adını yazarak ekle" />
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
          <View style={styles.list}>
            {sensitivities.map((item) => (
              <SwipeToDeleteRow key={item.id} onDelete={() => confirmDelete(item)}>
                <SensitivityRow item={item} />
              </SwipeToDeleteRow>
            ))}
          </View>
        ) : (
          <Card>
            <Text style={styles.empty}>
              Kayıtlı hassasiyet yok. Yukarıdaki hazır listeden seçebilir veya yeni hassasiyet ekleyebilirsin.
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
