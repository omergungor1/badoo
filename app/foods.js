import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  FOOD_UNIT_NUTRITION_HINTS,
  FOOD_UNIT_OPTIONS,
  FOOD_UNIT_TYPES,
} from '../constants/foodUnits';
import { createFood, getAllFoods, updateFood } from '../services/foodService';
import BackButton from '../components/ui/BackButton';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Input from '../components/ui/Input';
import SectionTitle from '../components/ui/SectionTitle';
import Toast from '../components/ui/Toast';
import { colors, radius, spacing, typography } from '../theme';

function formatFoodMeta(food) {
  const basis = FOOD_UNIT_NUTRITION_HINTS[food.unit_type] || FOOD_UNIT_NUTRITION_HINTS.gram;

  if (food.calories == null) {
    return basis;
  }

  return `${basis} · ${food.calories} kcal · P:${food.protein ?? 0}g · K:${food.carbohydrates ?? 0}g · Y:${food.fats ?? 0}g`;
}

function parseOptionalInt(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = parseInt(trimmed, 10);
  return Number.isNaN(num) ? null : num;
}

export default function FoodsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [foods, setFoods] = useState([]);
  const [newName, setNewName] = useState('');
  const [unitType, setUnitType] = useState(FOOD_UNIT_TYPES.GRAM);
  const [filter, setFilter] = useState('');
  const [adding, setAdding] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [editName, setEditName] = useState('');
  const [editUnitType, setEditUnitType] = useState(FOOD_UNIT_TYPES.GRAM);
  const [editCalories, setEditCalories] = useState('');
  const [editProtein, setEditProtein] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFats, setEditFats] = useState('');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const hideToast = useCallback(() => setToastMessage(null), []);

  const loadFoods = useCallback(async () => {
    const { data, error } = await getAllFoods();
    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    setFoods(data || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFoods();
    }, [loadFoods]),
  );

  const filteredFoods = useMemo(() => {
    const query = filter.trim().toLowerCase();
    if (!query) return foods;
    return foods.filter((food) => food.food_name.toLowerCase().includes(query));
  }, [foods, filter]);

  function openEditModal(food) {
    setEditingFood(food);
    setEditName(food.food_name || '');
    setEditUnitType(food.unit_type || FOOD_UNIT_TYPES.GRAM);
    setEditCalories(food.calories != null ? String(food.calories) : '');
    setEditProtein(food.protein != null ? String(food.protein) : '');
    setEditCarbs(food.carbohydrates != null ? String(food.carbohydrates) : '');
    setEditFats(food.fats != null ? String(food.fats) : '');
  }

  function closeEditModal() {
    setEditingFood(null);
    setSaving(false);
  }

  async function handleAdd() {
    const trimmed = newName.trim();
    if (!trimmed) {
      Alert.alert('Hata', 'Yemek veya içecek adı girin.');
      return;
    }

    const exists = foods.some(
      (food) => food.food_name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      Alert.alert('Hata', 'Bu yemek veya içecek zaten listede.');
      return;
    }

    setAdding(true);
    const { data, error } = await createFood(trimmed, unitType);
    setAdding(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    setNewName('');
    setUnitType(FOOD_UNIT_TYPES.GRAM);
    setFoods((prev) =>
      [...prev, data].sort((a, b) => a.food_name.localeCompare(b.food_name, 'tr')),
    );
    setToastMessage('Başarılı');
  }

  async function handleSaveEdit() {
    if (!editingFood) return;

    const trimmed = editName.trim();
    if (!trimmed) {
      Alert.alert('Hata', 'Yemek veya içecek adı girin.');
      return;
    }

    const duplicate = foods.some(
      (food) =>
        food.id !== editingFood.id &&
        food.food_name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) {
      Alert.alert('Hata', 'Bu yemek veya içecek adı zaten kullanılıyor.');
      return;
    }

    setSaving(true);
    const { data, error } = await updateFood(editingFood.id, {
      foodName: trimmed,
      unitType: editUnitType,
      calories: parseOptionalInt(editCalories),
      protein: parseOptionalInt(editProtein),
      carbohydrates: parseOptionalInt(editCarbs),
      fats: parseOptionalInt(editFats),
    });
    setSaving(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    setFoods((prev) =>
      prev
        .map((food) => (food.id === data.id ? data : food))
        .sort((a, b) => a.food_name.localeCompare(b.food_name, 'tr')),
    );
    closeEditModal();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Toast message={toastMessage} onHide={hideToast} />
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Yemek & İçecek Listesi</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <SectionTitle
          title="Yeni Ekle"
          subtitle="Besin değerleri OpenAI ile otomatik hesaplanır"
        />
        <Card style={styles.addCard}>
          <Input
            label="Ad"
            value={newName}
            onChangeText={setNewName}
            placeholder="Örn. Smoothie, lahmacun..."
          />

          <Text style={styles.fieldLabel}>Tür</Text>
          <View style={styles.unitChips}>
            {FOOD_UNIT_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={unitType === option.value}
                onPress={() => setUnitType(option.value)}
              />
            ))}
          </View>
          <Text style={styles.unitHint}>{FOOD_UNIT_NUTRITION_HINTS[unitType]}</Text>

          <Button
            title={adding ? 'Besin değerleri hesaplanıyor...' : 'Listeye Ekle'}
            onPress={handleAdd}
            loading={adding}
            style={styles.addBtn}
          />
        </Card>

        <SectionTitle
          title="Kayıtlı Besinler"
          subtitle={foods.length ? `${foods.length} kayıt` : 'Henüz besin eklenmedi'}
        />

        {foods.length ? (
          <Input
            label="Listede Ara"
            value={filter}
            onChangeText={setFilter}
            placeholder="Filtrele..."
          />
        ) : null}

        {filteredFoods.length ? (
          filteredFoods.map((food) => (
            <Pressable key={food.id} onPress={() => openEditModal(food)}>
              <Card style={styles.rowCard}>
                <Text style={styles.rowName}>{food.food_name}</Text>
                <Text style={styles.rowMeta}>{formatFoodMeta(food)}</Text>
              </Card>
            </Pressable>
          ))
        ) : (
          <Card>
            <Text style={styles.empty}>
              {foods.length
                ? 'Aramanıza uygun besin bulunamadı.'
                : 'Kayıtlı besin yok. Yukarıdan yeni ekleyebilirsiniz.'}
            </Text>
          </Card>
        )}
      </ScrollView>

      <Modal
        visible={!!editingFood}
        transparent
        animationType="slide"
        onRequestClose={closeEditModal}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.backdrop} onPress={closeEditModal} />
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Besin Düzenle</Text>

            <ScrollView
              contentContainerStyle={styles.sheetContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Input
                label="Ad"
                value={editName}
                onChangeText={setEditName}
                placeholder="Yemek veya içecek adı"
              />

              <Text style={styles.fieldLabel}>Tür</Text>
              <View style={styles.unitChips}>
                {FOOD_UNIT_OPTIONS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    selected={editUnitType === option.value}
                    onPress={() => setEditUnitType(option.value)}
                  />
                ))}
              </View>
              <Text style={styles.unitHint}>{FOOD_UNIT_NUTRITION_HINTS[editUnitType]}</Text>

              <Input
                label="Kalori (kcal)"
                value={editCalories}
                onChangeText={setEditCalories}
                placeholder="0"
                keyboardType="number-pad"
              />
              <Input
                label="Protein (g)"
                value={editProtein}
                onChangeText={setEditProtein}
                placeholder="0"
                keyboardType="number-pad"
              />
              <Input
                label="Karbonhidrat (g)"
                value={editCarbs}
                onChangeText={setEditCarbs}
                placeholder="0"
                keyboardType="number-pad"
              />
              <Input
                label="Yağ (g)"
                value={editFats}
                onChangeText={setEditFats}
                placeholder="0"
                keyboardType="number-pad"
              />

              <View style={styles.sheetActions}>
                <Button title="İptal" variant="outline" onPress={closeEditModal} />
                <Button
                  title={saving ? 'Kaydediliyor...' : 'Kaydet'}
                  onPress={handleSaveEdit}
                  loading={saving}
                />
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  addCard: { gap: spacing.sm },
  fieldLabel: { ...typography.bodySmall, color: colors.textSecondary },
  unitChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  unitHint: { ...typography.caption, color: colors.textSecondary },
  addBtn: { marginTop: spacing.xs },
  rowCard: { gap: 4, paddingVertical: spacing.md },
  rowName: { ...typography.body, color: colors.textPrimary },
  rowMeta: { ...typography.bodySmall, color: colors.textSecondary },
  empty: { ...typography.body, color: colors.textSecondary },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sheetContent: { gap: spacing.sm, paddingBottom: spacing.md },
  sheetActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
});
