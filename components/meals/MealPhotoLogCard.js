import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatTime } from '../../utils/date';
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

export default function MealPhotoLogCard({ item, onPress }) {
  const title = item.meal_title || 'Öğün';
  const hasNutrition = item.calories != null;

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.header}>
        <Text style={styles.time}>{formatTime(item.sortTime)}</Text>
        <Text style={styles.calories}>
          {hasNutrition ? `${item.calories} kcal` : 'Bilgi gir'}
        </Text>
      </View>

      <View style={styles.body}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : null}

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>

          <View style={styles.macros}>
            <MacroPill label="Protein" value={item.protein} unit="g" color={colors.protein} />
            <MacroPill label="Yağ" value={item.fats} unit="g" color={colors.calories} />
            <MacroPill label="Karb" value={item.carbohydrates} unit="g" color={colors.water} />
          </View>

          {!hasNutrition ? (
            <Text style={styles.hint}>Dokunarak bilgileri gir</Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
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
  info: {
    flex: 1,
    gap: spacing.sm,
  },
  title: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  macros: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
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
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
