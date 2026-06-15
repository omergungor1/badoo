import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../theme';

export default function RatingPicker({ value, onChange, max = 5, label }) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        {Array.from({ length: max + 1 }).map((_, index) => {
          const active = value === index;
          return (
            <Pressable
              key={index}
              onPress={() => onChange(index)}
              style={[styles.item, active && styles.active]}
            >
              <Text style={[styles.text, active && styles.activeText]}>{index}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  item: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  text: {
    ...typography.body,
    color: colors.textPrimary,
  },
  activeText: {
    color: colors.white,
    fontFamily: typography.bodyBold.fontFamily,
  },
});
