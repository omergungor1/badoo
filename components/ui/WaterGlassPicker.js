import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GLASS_ML, MAX_WATER_GLASSES, clampGlasses } from '../../utils/water';
import { colors, spacing, typography } from '../../theme';

export default function WaterGlassPicker({ glasses, onChange, min = 0, max = MAX_WATER_GLASSES }) {
  const safeGlasses = Math.min(max, Math.max(min, clampGlasses(glasses)));

  function setGlasses(next) {
    onChange(Math.min(max, Math.max(min, clampGlasses(next))));
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {Array.from({ length: max }, (_, index) => {
          const glassNumber = index + 1;
          const filled = glassNumber <= safeGlasses;

          return (
            <Pressable
              key={glassNumber}
              onPress={() => setGlasses(glassNumber)}
              style={[styles.glassBtn, filled && styles.glassBtnFilled]}
            >
              <Text style={styles.glassEmoji}>{filled ? '🥤' : '○'}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.summary}>
        <Pressable onPress={() => setGlasses(safeGlasses - 1)} style={styles.stepBtn} hitSlop={8}>
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <View style={styles.summaryText}>
          <Text style={styles.count}>{safeGlasses} bardak</Text>
          <Text style={styles.ml}>{safeGlasses * GLASS_ML} ml</Text>
        </View>
        <Pressable onPress={() => setGlasses(safeGlasses + 1)} style={styles.stepBtn} hitSlop={8}>
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  glassBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassBtnFilled: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.water,
  },
  glassEmoji: {
    fontSize: 20,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    ...typography.h2,
    color: colors.primary,
    lineHeight: 32,
  },
  summaryText: {
    alignItems: 'center',
    minWidth: 120,
  },
  count: {
    ...typography.body,
    color: colors.textPrimary,
    fontFamily: typography.bodyBold.fontFamily,
  },
  ml: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
