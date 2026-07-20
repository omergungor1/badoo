import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatTime } from '../../utils/date';
import { formatQuantityLabel } from '../../utils/foodQuantity';
import { colors, radius, spacing, typography } from '../../theme';

function MacroPill({ label, value, unit, color }) {
  return (
    <View style={styles.macroPill}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <Text style={styles.macroValue}>
        {value != null ? `${value}${unit}` : '—'}
      </Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

function getFoodName(item) {
  return item?.foods?.food_name || item?.food_name || null;
}

function getFoodPreview(items = [], limit = 3) {
  const names = items.map(getFoodName).filter(Boolean);
  if (!names.length) return null;

  const shown = names.slice(0, limit);
  const rest = names.length - shown.length;
  const preview = shown.join(' · ');
  return rest > 0 ? `${preview} +${rest}` : preview;
}

function getSourceLabel(source) {
  if (source === 'voice') return 'Sesli';
  if (source === 'image') return 'Fotoğraf';
  if (source === 'manual') return 'Manuel';
  return null;
}

export default function MealLogCard({ item, onPress }) {
  const title = item.meal_title || 'Öğün';
  const hasNutrition = item.calories != null;
  const foodItems = item.items || [];
  const preview = getFoodPreview(foodItems);
  const itemCount = foodItems.length;
  const sourceLabel = getSourceLabel(item.source);

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`${title} detayını aç`}
    >
      <View style={styles.header}>
        <Text style={styles.time}>{formatTime(item.sortTime)}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.calories}>
            {hasNutrition ? `${item.calories} kcal` : 'Detay'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
      </View>

      <View style={styles.body}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <View style={styles.imageFallback}>
            <Ionicons name="restaurant-outline" size={28} color={colors.primary} />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>

          {preview ? (
            <Text style={styles.foods} numberOfLines={2}>{preview}</Text>
          ) : null}

          {itemCount > 0 || sourceLabel ? (
            <Text style={styles.meta}>
              {[itemCount > 0 ? `${itemCount} ürün` : null, sourceLabel]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          ) : null}

          <View style={styles.macros}>
            <MacroPill label="Protein" value={item.protein} unit="g" color={colors.protein} />
            <MacroPill label="Yağ" value={item.fats} unit="g" color={colors.calories} />
            <MacroPill label="Karbonhidrat" value={item.carbohydrates} unit="g" color={colors.water} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function formatMealFoodLine(item) {
  const name = getFoodName(item) || 'Yiyecek';
  const quantity = formatQuantityLabel(
    item.quantity,
    item.foods?.unit_type || item.unit_type,
  );
  const calories = item.calories != null ? `${item.calories} kcal` : null;
  return [name, quantity, calories].filter(Boolean).join(' · ');
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  calories: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  body: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  image: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
  },
  imageFallback: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  foods: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
  macros: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  macroPill: {
    alignItems: 'center',
    gap: 2,
    minWidth: 52,
  },
  macroDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroValue: {
    ...typography.caption,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  macroLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
});
