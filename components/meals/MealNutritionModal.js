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
import { updateMealLogNutrition } from '../../services/foodService';
import { colors, radius, spacing, typography } from '../../theme';

function toInputValue(value) {
  if (value == null || value === '') return '';
  return String(value);
}

export default function MealNutritionModal({ visible, mealLog, onClose, onSaved }) {
  const insets = useSafeAreaInsets();
  const [mealTitle, setMealTitle] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!mealLog) return;
    setMealTitle(mealLog.meal_title || 'Öğün');
    setCalories(toInputValue(mealLog.calories));
    setProtein(toInputValue(mealLog.protein));
    setCarbs(toInputValue(mealLog.carbohydrates));
    setFats(toInputValue(mealLog.fats));
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
    });
    setSaving(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

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
              <Pressable onPress={dismissKeyboard}>
                <Text style={styles.title}>Öğün Bilgileri</Text>
                <Text style={styles.subtitle}>Kalori ve makroları manuel gir</Text>
              </Pressable>

              {mealLog?.image_url ? (
                <Pressable onPress={dismissKeyboard}>
                  <Image source={{ uri: mealLog.image_url }} style={styles.preview} />
                </Pressable>
              ) : null}

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
            </ScrollView>

            <Button title="Kaydet" onPress={handleSave} loading={saving} />
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
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
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
});
