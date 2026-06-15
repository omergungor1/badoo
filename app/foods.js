import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FOOD_UNIT_NUTRITION_HINTS,
  FOOD_UNIT_OPTIONS,
  FOOD_UNIT_TYPES,
} from '../constants/foodUnits';
import { createFood, getAllFoods } from '../services/foodService';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Chip from '../components/ui/Chip';
import Input from '../components/ui/Input';
import SectionTitle from '../components/ui/SectionTitle';
import { colors, spacing, typography } from '../theme';

function formatFoodMeta(food) {
  const basis = FOOD_UNIT_NUTRITION_HINTS[food.unit_type] || FOOD_UNIT_NUTRITION_HINTS.gram;

  if (food.calories == null) {
    return basis;
  }

  return `${basis} · ${food.calories} kcal · P:${food.protein ?? 0}g · K:${food.carbohydrates ?? 0}g · Y:${food.fats ?? 0}g`;
}

export default function FoodsScreen() {
  const router = useRouter();
  const [foods, setFoods] = useState([]);
  const [newName, setNewName] = useState('');
  const [unitType, setUnitType] = useState(FOOD_UNIT_TYPES.GRAM);
  const [filter, setFilter] = useState('');
  const [adding, setAdding] = useState(false);

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
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>← Geri</Text>
        </Pressable>
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
            <Card key={food.id} style={styles.rowCard}>
              <Text style={styles.rowName}>{food.food_name}</Text>
              <Text style={styles.rowMeta}>{formatFoodMeta(food)}</Text>
            </Card>
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
  addCard: { gap: spacing.sm },
  fieldLabel: { ...typography.bodySmall, color: colors.textSecondary },
  unitChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  unitHint: { ...typography.caption, color: colors.textSecondary },
  addBtn: { marginTop: spacing.xs },
  rowCard: { gap: 4, paddingVertical: spacing.md },
  rowName: { ...typography.body, color: colors.textPrimary },
  rowMeta: { ...typography.bodySmall, color: colors.textSecondary },
  empty: { ...typography.body, color: colors.textSecondary },
});
