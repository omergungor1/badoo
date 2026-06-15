import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../theme';

export default function ProgressBar({ progress = 0, color = colors.primary, label, valueText }) {
  const clamped = Math.max(0, Math.min(100, progress));

  return (
    <View style={styles.wrap}>
      {(label || valueText) && (
        <View style={styles.header}>
          {label ? <Text style={styles.label}>{label}</Text> : null}
          {valueText ? <Text style={styles.value}>{valueText}</Text> : null}
        </View>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  value: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  track: {
    height: 10,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
  },
});
