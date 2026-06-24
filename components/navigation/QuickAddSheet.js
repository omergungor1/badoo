import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { QUICK_ADD_ITEMS } from '../../constants/onboarding';
import { PERIOD_QUICK_ADD_ITEM } from '../../constants/period';
import { STORY_QUICK_ADD_ITEM } from '../../constants/stories';
import { pickStoryPhoto, uploadStory } from '../../services/storyService';
import { emitStoryShared } from '../../utils/storyEvents';
import { colors, radius, spacing, typography } from '../../theme';

export default function QuickAddSheet({ visible, onClose }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const items = profile?.gender === 'kadın'
    ? [STORY_QUICK_ADD_ITEM, ...QUICK_ADD_ITEMS, PERIOD_QUICK_ADD_ITEM]
    : [STORY_QUICK_ADD_ITEM, ...QUICK_ADD_ITEMS];

  async function handleShareStory() {
    if (!user?.id || uploading) return;

    // Kamera sheet kapanmadan açılır — iOS dokunuş bağlamı korunur, modal çakışması olmaz
    const { uri, error: pickError } = await pickStoryPhoto();

    onClose();

    if (pickError) {
      Alert.alert('Hata', pickError.message);
      return;
    }

    if (!uri) return;

    setUploading(true);
    const { data, error } = await uploadStory(user.id, uri);
    setUploading(false);

    if (error) {
      Alert.alert('Hata', error.message || 'Story yüklenemedi.');
      return;
    }

    if (data) {
      emitStoryShared(data);
    }
  }

  function handleSelect(item) {
    if (item.action === 'story') {
      handleShareStory();
      return;
    }
    onClose();
    router.push(item.route);
  }

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>Hızlı Ekle</Text>
          <View style={styles.grid}>
            {items.map((item) => (
              <Pressable key={item.key} style={styles.item} onPress={() => handleSelect(item)}>
                <Text style={styles.emoji}>{item.emoji}</Text>
                <Text style={styles.label}>{item.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      <Modal visible={uploading} transparent animationType="fade">
        <View style={styles.uploadOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.uploadText}>Story yükleniyor...</Text>
        </View>
      </Modal>
    </>
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
  uploadOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  uploadText: {
    ...typography.body,
    color: colors.white,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
});
