import { StyleSheet, Text, View } from 'react-native';
import Chip from './Chip';
import { MIN_GOAL_SELECTION } from '../../utils/goals';
import { colors, spacing, typography } from '../../theme';

export default function GoalPicker({ options, selectedIds, onChange, min = MIN_GOAL_SELECTION }) {
  function toggle(goalOptionId) {
    const next = selectedIds.includes(goalOptionId)
      ? selectedIds.filter((id) => id !== goalOptionId)
      : [...selectedIds, goalOptionId];
    onChange(next);
  }

  const reachedMin = selectedIds.length >= min;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.counter, reachedMin && styles.counterOk]}>
        {selectedIds.length} / en az {min} hedef seçildi
      </Text>

      <View style={styles.chips}>
        {options.map((option) => (
          <Chip
            key={option.id}
            label={option.goal_name}
            selected={selectedIds.includes(option.id)}
            onPress={() => toggle(option.id)}
          />
        ))}
      </View>

      {!options.length ? (
        <Text style={styles.empty}>Hedef seçenekleri yüklenemedi.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  counter: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  counterOk: {
    color: colors.scoreGood,
    fontFamily: typography.bodyBold.fontFamily,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  empty: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
