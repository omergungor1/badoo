import { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ConfettiBurst from './ConfettiBurst';
import { colors, radius, spacing, typography } from '../../theme';

const AUTO_DISMISS_MS = 3200;

export default function StoryShareSuccessOverlay({ visible, onClose }) {
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(onClose, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [visible, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <ConfettiBurst active={visible} />

        <View style={[styles.card, { marginTop: insets.top + 80 }]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Story paylaşıldı!</Text>
          <Text style={styles.subtitle}>Story'n 24 saat boyunca görünür olacak.</Text>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
    zIndex: 30,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
