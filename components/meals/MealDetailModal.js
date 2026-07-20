import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../ui/Button';
import { formatMealFoodLine } from './MealLogCard';
import { updateMealLogNutrition } from '../../services/foodService';
import { formatTime } from '../../utils/date';
import { colors, radius, spacing, typography } from '../../theme';

function toInputValue(value) {
  if (value == null || value === '') return '';
  return String(value);
}

function MacroStat({ label, value, unit, color }) {
  return (
    <View style={styles.macroStat}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <Text style={styles.macroStatValue}>
        {value != null ? `${value}${unit}` : '—'}
      </Text>
      <Text style={styles.macroStatLabel}>{label}</Text>
    </View>
  );
}

export default function MealDetailModal({ visible, mealLog, onClose, onSaved }) {
  const insets = useSafeAreaInsets();
  const [mealTitle, setMealTitle] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const foodItems = mealLog?.items || [];

  useEffect(() => {
    if (!mealLog) return;
    setMealTitle(mealLog.meal_title || 'Öğün');
    setCalories(toInputValue(mealLog.calories));
    setProtein(toInputValue(mealLog.protein));
    setCarbs(toInputValue(mealLog.carbohydrates));
    setFats(toInputValue(mealLog.fats));
    setEditing(false);
  }, [mealLog]);

  function dismissKeyboard() {
    Keyboard.dismiss();
  }

  async function handleSave() {
    if (!mealLog?.id) return;

    dismissKeyboard();
    setSaving(true);
    const { error } = await updateMealLogNutrition(mealLog.id, {
      mealTitle,
      calories: calories ? Number(calories) : null,
      protein: protein ? Number(protein) : null,
      carbohydrates: carbs ? Number(carbs) : null,
      fats: fats ? Number(fats) : null,
      mealId: mealLog.meal_id || (mealLog.isMealGroup ? mealLog.id : null),
    });
    setSaving(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    setEditing(false);
    onSaved?.();
    onClose?.();
  }

  function handleBackdropPress() {
    dismissKeyboard();
    onClose?.();
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={handleBackdropPress} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboard}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
            <View style={styles.handle} />

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >
              {mealLog?.image_url ? (
                <Image source={{ uri: mealLog.image_url }} style={styles.preview} />
              ) : null}

              <Text style={styles.title}>{mealLog?.meal_title || 'Öğün'}</Text>
              {mealLog?.sortTime ? (
                <Text style={styles.subtitle}>{formatTime(mealLog.sortTime)}</Text>
              ) : null}

              <View style={styles.macroRow}>
                <MacroStat label="Kalori" value={mealLog?.calories} unit=" kcal" color={colors.calories} />
                <MacroStat label="Protein" value={mealLog?.protein} unit="g" color={colors.protein} />
                <MacroStat label="Yağ" value={mealLog?.fats} unit="g" color={colors.calories} />
                <MacroStat label="Karbonhidrat" value={mealLog?.carbohydrates} unit="g" color={colors.water} />
              </View>

              {foodItems.length ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>İçerikler</Text>
                  {foodItems.map((food) => (
                    <View key={food.id} style={styles.foodRow}>
                      <Text style={styles.foodName} numberOfLines={2}>
                        {formatMealFoodLine(food)}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {!editing ? (
                <Pressable
                  onPress={() => setEditing(true)}
                  style={({ pressed }) => [styles.editLink, pressed && styles.editLinkPressed]}
                >
                  <Text style={styles.editLinkText}>Makroları düzenle</Text>
                </Pressable>
              ) : (
                <View style={styles.editBlock}>
                  <Text style={styles.sectionTitle}>Düzenle</Text>

                  <Text style={styles.label}>Öğün adı</Text>
                  <TextInput
                    value={mealTitle}
                    onChangeText={setMealTitle}
                    style={styles.input}
                    placeholder="Öğün"
                    placeholderTextColor={colors.textMuted}
                  />

                  <Text style={styles.label}>Kalori (kcal)</Text>
                  <TextInput
                    value={calories}
                    onChangeText={setCalories}
                    style={styles.input}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                  />

                  <Text style={styles.label}>Protein (g)</Text>
                  <TextInput
                    value={protein}
                    onChangeText={setProtein}
                    style={styles.input}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                  />

                  <Text style={styles.label}>Karbonhidrat (g)</Text>
                  <TextInput
                    value={carbs}
                    onChangeText={setCarbs}
                    style={styles.input}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                  />

                  <Text style={styles.label}>Yağ (g)</Text>
                  <TextInput
                    value={fats}
                    onChangeText={setFats}
                    style={styles.input}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
              )}
            </ScrollView>

            {editing ? (
              <View style={styles.actions}>
                <Button title="Vazgeç" variant="outline" onPress={() => setEditing(false)} />
                <Button title="Kaydet" onPress={handleSave} loading={saving} />
              </View>
            ) : (
              <Button title="Kapat" variant="outline" onPress={onClose} />
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  keyboard: {
    maxHeight: '92%',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxHeight: '100%',
    gap: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: -4,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  macroStat: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroStatValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  macroStatLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  section: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  foodRow: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  foodName: {
    ...typography.body,
    color: colors.textPrimary,
  },
  editLink: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
  },
  editLinkPressed: {
    opacity: 0.7,
  },
  editLinkText: {
    ...typography.bodySemiBold,
    color: colors.primary,
  },
  editBlock: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
  },
});
