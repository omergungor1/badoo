import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { QUICK_ADD_ITEMS } from '../../constants/onboarding';
import { PERIOD_QUICK_ADD_ITEM } from '../../constants/period';
import { colors, radius, spacing, typography } from '../../theme';

export default function QuickAddSheet({ visible, onClose }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();

  const items = profile?.gender === 'kadın'
    ? [...QUICK_ADD_ITEMS, PERIOD_QUICK_ADD_ITEM]
    : QUICK_ADD_ITEMS;

  function handleSelect(route) {
    onClose();
    router.push(route);
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <View style={styles.handle} />
        <Text style={styles.title}>Hızlı Ekle</Text>
        <View style={styles.grid}>
          {items.map((item) => (
            <Pressable key={item.key} style={styles.item} onPress={() => handleSelect(item.route)}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.label}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
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
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    width: '47%',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 6,
  },
  emoji: {
    fontSize: 24,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold?.fontFamily || typography.body.fontFamily,
  },
});
