import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

function formatValue(value, unit) {
  if (unit === 'adet' && value === 0.5) {
    return 'yarım adet';
  }

  const display = Number.isInteger(value) ? String(value) : String(value);
  return unit ? `${display} ${unit}` : display;
}

export default function FractionStepper({
  label,
  value,
  onChange,
  min = 0.5,
  max = 20,
  step = 0.5,
  unit = 'adet',
}) {
  const safeValue = Math.min(max, Math.max(min, value));

  function setValue(next) {
    const clamped = Math.min(max, Math.max(min, next));
    onChange(Math.round(clamped / step) * step);
  }

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <Pressable
          onPress={() => setValue(safeValue - step)}
          style={[styles.stepBtn, safeValue <= min && styles.stepBtnDisabled]}
          disabled={safeValue <= min}
          hitSlop={8}
        >
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <View style={styles.valueWrap}>
          <Text style={styles.value}>{formatValue(safeValue, unit)}</Text>
        </View>
        <Pressable
          onPress={() => setValue(safeValue + step)}
          style={[styles.stepBtn, safeValue >= max && styles.stepBtnDisabled]}
          disabled={safeValue >= max}
          hitSlop={8}
        >
          <Text style={styles.stepText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.35,
  },
  stepText: {
    ...typography.h2,
    color: colors.primary,
    lineHeight: 32,
  },
  valueWrap: {
    minWidth: 120,
    alignItems: 'center',
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontFamily: typography.bodyBold.fontFamily,
    textAlign: 'center',
  },
});
