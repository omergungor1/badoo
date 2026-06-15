import { Pressable, StyleSheet, Text, View } from 'react-native';
import { clampMinutes, formatDurationMinutes } from '../../utils/duration';
import { colors, spacing, typography } from '../../theme';

export default function MinuteStepper({
  label,
  minutes,
  onChange,
  step = 15,
  min = 15,
  max = 180,
}) {
  const safeMinutes = clampMinutes(minutes, min, max, step);

  function setMinutes(next) {
    onChange(clampMinutes(next, min, max, step));
  }

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <Pressable
          onPress={() => setMinutes(safeMinutes - step)}
          style={[styles.stepBtn, safeMinutes <= min && styles.stepBtnDisabled]}
          disabled={safeMinutes <= min}
          hitSlop={8}
        >
          <Text style={styles.stepText}>−</Text>
        </Pressable>
        <View style={styles.valueWrap}>
          <Text style={styles.value}>{formatDurationMinutes(safeMinutes)}</Text>
          <Text style={styles.hint}>{safeMinutes} dk</Text>
        </View>
        <Pressable
          onPress={() => setMinutes(safeMinutes + step)}
          style={[styles.stepBtn, safeMinutes >= max && styles.stepBtnDisabled]}
          disabled={safeMinutes >= max}
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
    gap: 2,
  },
  value: {
    ...typography.body,
    color: colors.textPrimary,
    fontFamily: typography.bodyBold.fontFamily,
  },
  hint: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
