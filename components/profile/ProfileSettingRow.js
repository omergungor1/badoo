import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { profilePageColors } from './ProfileSection';
import { colors, spacing, typography } from '../../theme';

export default function ProfileSettingRow({
  icon,
  title,
  subtitle,
  onPress,
  rightText,
  rightIcon,
  showChevron = true,
  destructive = false,
  isLast = false,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowDivider,
        pressed && styles.rowPressed,
      ]}
    >
      {icon ? (
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={20} color={destructive ? colors.danger : colors.textPrimary} />
        </View>
      ) : (
        <View style={styles.iconSpacer} />
      )}

      <View style={styles.content}>
        <Text style={[styles.title, destructive && styles.titleDestructive]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={styles.right}>
        {rightText ? <Text style={styles.rightText}>{rightText}</Text> : null}
        {rightIcon ? <Ionicons name={rightIcon} size={16} color={colors.textSecondary} /> : null}
        {showChevron && !rightText && !rightIcon ? (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        ) : null}
        {showChevron && (rightText || rightIcon) ? (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={styles.chevronAfterMeta} />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: profilePageColors.card,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: profilePageColors.divider,
  },
  rowPressed: {
    backgroundColor: colors.background,
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  iconSpacer: {
    width: 28,
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.body,
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 20,
  },
  titleDestructive: {
    color: colors.danger,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: spacing.sm,
  },
  rightText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 13,
  },
  chevronAfterMeta: {
    marginLeft: 2,
  },
});
