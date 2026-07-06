import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { QUICK_ADD_ITEMS } from '../../constants/onboarding';
import { MEAL_QUICK_ADD_ITEM } from '../../constants/meals';
import { PERIOD_QUICK_ADD_ITEM } from '../../constants/period';
import { completeTask } from '../../services/logService';
import { pickMealPhoto, uploadMealPhoto } from '../../services/mealPhotoService';
import { emitMealShared } from '../../utils/mealEvents';
import { colors, radius, spacing, typography } from '../../theme';

const PAGE_SIZE = 4;
const SCREEN_WIDTH = Dimensions.get('window').width;

function chunkItems(items, size) {
  const pages = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}

function QuickAddIcon({ item }) {
  if (item.imageIcon) {
    return <Image source={item.imageIcon} style={styles.imageIcon} resizeMode="contain" />;
  }

  return <Ionicons name={item.icon} size={34} color={colors.textPrimary} />;
}

function QuickAddCard({ item, onPress }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <QuickAddIcon item={item} />
      <Text style={styles.cardLabel} numberOfLines={2}>
        {item.label}
      </Text>
    </Pressable>
  );
}

function QuickAddPage({ pageItems, onSelect }) {
  const rows = [pageItems.slice(0, 2), pageItems.slice(2, 4)];

  return (
    <View style={styles.page}>
      {rows.map((rowItems, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {rowItems.map((item) => (
            <QuickAddCard key={item.key} item={item} onPress={() => onSelect(item)} />
          ))}
          {rowItems.length === 1 ? <View style={styles.cardSpacer} /> : null}
        </View>
      ))}
    </View>
  );
}

export default function QuickAddSheet({ visible, onClose }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const items = profile?.gender === 'kadın'
    ? [MEAL_QUICK_ADD_ITEM, ...QUICK_ADD_ITEMS, PERIOD_QUICK_ADD_ITEM]
    : [MEAL_QUICK_ADD_ITEM, ...QUICK_ADD_ITEMS];

  const pages = chunkItems(items, PAGE_SIZE);

  useEffect(() => {
    if (visible) {
      setPageIndex(0);
    }
  }, [visible]);

  async function handleShareMeal() {
    if (!user?.id || uploading) return;

    const { uri, error: pickError } = await pickMealPhoto();

    onClose();

    if (pickError) {
      Alert.alert('Hata', pickError.message);
      return;
    }

    if (!uri) return;

    setUploading(true);
    const { data, error } = await uploadMealPhoto(user.id, uri);
    setUploading(false);

    if (error) {
      Alert.alert('Hata', error.message || 'Öğün fotoğrafı yüklenemedi.');
      return;
    }

    if (data) {
      await completeTask(user.id, 'meals');
      emitMealShared(data);
    }
  }

  function handleSelect(item) {
    if (item.action === 'meal') {
      handleShareMeal();
      return;
    }
    onClose();
    router.push(item.route);
  }

  function handlePageScroll(event) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setPageIndex(nextIndex);
  }

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={onClose} />

          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
            <View style={styles.handle} />

            {pages.length > 1 ? (
              <View style={styles.dots}>
                {pages.map((_, index) => (
                  <View
                    key={`dot-${index}`}
                    style={[styles.dot, index === pageIndex && styles.dotActive]}
                  />
                ))}
              </View>
            ) : null}

            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handlePageScroll}
              contentContainerStyle={styles.pager}
            >
              {pages.map((pageItems, index) => (
                <QuickAddPage
                  key={`page-${index}`}
                  pageItems={pageItems}
                  onSelect={handleSelect}
                />
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={uploading} transparent animationType="fade">
        <View style={styles.uploadOverlay}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.uploadText}>Öğün yükleniyor...</Text>
        </View>
      </Modal>
    </>
  );
}

const CARD_GAP = spacing.sm;

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.textPrimary,
    width: 8,
    height: 8,
  },
  pager: {
    alignItems: 'flex-start',
  },
  page: {
    width: SCREEN_WIDTH,
    paddingHorizontal: spacing.lg,
    gap: CARD_GAP,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  card: {
    flex: 1,
    minHeight: 112,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  cardSpacer: {
    flex: 1,
  },
  imageIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
  },
  cardLabel: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold?.fontFamily || typography.body.fontFamily,
    textAlign: 'center',
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
