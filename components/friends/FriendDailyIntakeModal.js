import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatDate, formatTime, isToday, toISODate } from '../../utils/date';
import { formatQuantityLabel } from '../../utils/foodQuantity';
import { colors, radius, spacing, typography } from '../../theme';

function formatIntakeLabel(item) {
  switch (item.intakeType) {
    case 'food':
      return `🍽 ${item.foods?.food_name || 'Yemek'} (${formatQuantityLabel(item.quantity, item.foods?.unit_type)})`;
    case 'water':
      return `💧 Su +${item.amount} ml`;
    case 'drink':
      return `☕ ${item.drink_name}`;
    default:
      return 'Kayıt';
  }
}

export default function FriendDailyIntakeModal({
  visible,
  onClose,
  friendName,
  items = [],
  loading = false,
  date = toISODate(),
}) {
  const insets = useSafeAreaInsets();
  const dateLabel = isToday(date) ? 'Bugün' : formatDate(date);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>{friendName}</Text>
            <Text style={styles.subtitle}>{dateLabel} — yedi & içti</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : items.length ? (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item) => (
              <View key={`${item.intakeType}-${item.id}`} style={styles.row}>
                <Text style={styles.rowLabel}>{formatIntakeLabel(item)}</Text>
                <Text style={styles.rowTime}>{formatTime(item.sortTime)}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Bu gün için yeme-içme kaydı yok.</Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  loading: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  rowTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  empty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
