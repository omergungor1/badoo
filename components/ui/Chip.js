import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, typography } from '../../theme';

export default function Chip({ label, selected = false, onPress, emoji }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.selected]}
    >
      {emoji ? <Text style={styles.emoji}>{emoji}</Text> : null}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  selectedLabel: {
    color: colors.primaryDark,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
});
