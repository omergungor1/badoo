import { useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { FOOD_UNIT_LABELS, FOOD_UNIT_NUTRITION_HINTS } from '../../constants/foodUnits';
import { useAuth } from '../../context/AuthContext';
import { addFoodLogsBatch, searchFoods } from '../../services/foodService';
import { completeTask } from '../../services/logService';
import Button from '../../components/ui/Button';
import FormActions from '../../components/ui/FormActions';
import FractionStepper from '../../components/ui/FractionStepper';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import SectionTitle from '../../components/ui/SectionTitle';
import {
  formatNutritionBasis,
  formatQuantityLabel,
  getDefaultQuantity,
  isGramUnit,
  normalizeUnitType,
} from '../../utils/foodQuantity';
import { colors, spacing, typography } from '../../theme';

function createBatchKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getFoodMeta(food) {
  const unitType = normalizeUnitType(food.unit_type);
  const basis = FOOD_UNIT_NUTRITION_HINTS[unitType] || FOOD_UNIT_NUTRITION_HINTS.gram;
  const calories = food.calories ?? '-';
  const protein = food.protein ?? '-';
  const carbs = food.carbohydrates ?? '-';
  const fats = food.fats ?? '-';

  return `${basis} · ${calories} kcal · P:${protein}g · K:${carbs}g · Y:${fats}g`;
}

export default function AddFoodScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState([]);
  const [selected, setSelected] = useState(null);
  const [gramQuantity, setGramQuantity] = useState('100');
  const [pieceQuantity, setPieceQuantity] = useState(1);
  const [batch, setBatch] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedUnitType = selected ? normalizeUnitType(selected.unit_type) : null;
  const isGram = selected ? isGramUnit(selected.unit_type) : false;

  async function handleSearch(text) {
    setQuery(text);

    if (selected && text !== selected.food_name) {
      setSelected(null);
      setGramQuantity('100');
      setPieceQuantity(1);
    }

    if (!text.trim()) {
      setFoods([]);
      return;
    }

    const { data } = await searchFoods(text);
    setFoods(data || []);
  }

  function handleSelectFood(food) {
    setSelected(food);
    setGramQuantity(String(getDefaultQuantity(food.unit_type)));
    setPieceQuantity(getDefaultQuantity(food.unit_type));
    setQuery(food.food_name);
    setFoods([]);
  }

  function getCurrentQuantity() {
    if (!selected) return null;
    if (isGramUnit(selected.unit_type)) {
      return Number(gramQuantity);
    }
    return pieceQuantity;
  }

  function handleAddToBatch() {
    if (!selected) {
      Alert.alert('Hata', 'Lütfen bir yemek veya içecek seç.');
      return;
    }

    const amount = getCurrentQuantity();
    if (!amount || amount <= 0) {
      Alert.alert('Hata', 'Geçerli bir miktar gir.');
      return;
    }

    setBatch((prev) => [
      ...prev,
      {
        key: createBatchKey(),
        food: selected,
        quantity: amount,
      },
    ]);

    setSelected(null);
    setGramQuantity('100');
    setPieceQuantity(1);
    setQuery('');
    setFoods([]);
  }

  function handleRemoveFromBatch(key) {
    setBatch((prev) => prev.filter((item) => item.key !== key));
  }

  async function handleSave() {
    if (!batch.length || !user?.id) {
      Alert.alert('Hata', 'Kaydetmek için en az bir kayıt ekleyin.');
      return;
    }

    setLoading(true);
    const { error } = await addFoodLogsBatch({
      userId: user.id,
      items: batch.map((item) => ({
        foodId: item.food.id,
        quantity: item.quantity,
      })),
    });
    await completeTask(user.id, 'meals');
    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Input
        label="Yemek veya İçecek Ara"
        value={query}
        onChangeText={handleSearch}
        placeholder="Menemen, çay, kahve..."
      />

      {!selected && query.trim() ? (
        <FlatList
          data={foods}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable onPress={() => handleSelectFood(item)}>
              <Card style={styles.foodItem}>
                <Text style={styles.foodName}>{item.food_name}</Text>
                <Text style={styles.foodMeta}>{getFoodMeta(item)}</Text>
              </Card>
            </Pressable>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Sonuç bulunamadı.</Text>}
        />
      ) : null}

      {selected ? (
        <View style={styles.selectedSection}>
          <Text style={styles.unitHint}>
            Besin değerleri {formatNutritionBasis(selectedUnitType)} için hesaplanır.
          </Text>

          {isGram ? (
            <Input
              label="Miktar (gram)"
              value={gramQuantity}
              onChangeText={setGramQuantity}
              keyboardType="number-pad"
            />
          ) : (
            <FractionStepper
              label={`Miktar (${FOOD_UNIT_LABELS[selectedUnitType]})`}
              value={pieceQuantity}
              onChange={setPieceQuantity}
              unit={FOOD_UNIT_LABELS[selectedUnitType]}
            />
          )}

          <Button title="Ekle" onPress={handleAddToBatch} />
        </View>
      ) : null}

      {batch.length ? (
        <View style={styles.batchSection}>
          <SectionTitle title="Eklenecekler" subtitle={`${batch.length} kayıt`} />
          {batch.map((item) => (
            <Card key={item.key} style={styles.batchItem}>
              <View style={styles.batchBody}>
                <Text style={styles.foodName}>{item.food.food_name}</Text>
                <Text style={styles.batchMeta}>
                  {formatQuantityLabel(item.quantity, item.food.unit_type)}
                </Text>
              </View>
              <Pressable onPress={() => handleRemoveFromBatch(item.key)} hitSlop={8}>
                <Text style={styles.removeText}>Kaldır</Text>
              </Pressable>
            </Card>
          ))}
        </View>
      ) : null}

      <FormActions
        onSave={handleSave}
        loading={loading}
        saveTitle={batch.length ? `Kaydet (${batch.length})` : 'Kaydet'}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  foodItem: { marginBottom: spacing.sm },
  selectedSection: { gap: spacing.sm },
  unitHint: { ...typography.bodySmall, color: colors.textSecondary },
  foodName: { ...typography.body, color: colors.textPrimary, fontFamily: typography.bodySemiBold.fontFamily },
  foodMeta: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  empty: { ...typography.body, color: colors.textSecondary },
  batchSection: { gap: spacing.sm },
  batchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  batchBody: { flex: 1, gap: 2 },
  batchMeta: { ...typography.bodySmall, color: colors.textSecondary },
  removeText: { ...typography.bodySmall, color: colors.danger, fontFamily: typography.bodySemiBold.fontFamily },
});
