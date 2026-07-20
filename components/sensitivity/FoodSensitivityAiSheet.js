import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
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
import Button from '../ui/Button';
import {
  createFoodSensitivityAnalysis,
  getFoodSensitivityAnalyses,
  getTodayFoodSensitivityAnalysis,
} from '../../services/healthAiAnalysisService';
import { getSensitivityLevel } from '../../utils/foodSensitivityScore';
import { formatDate } from '../../utils/date';
import { colors, radius, spacing, typography } from '../../theme';

const SHEET_MAX_HEIGHT = Dimensions.get('window').height * 0.88;

const STATUS_MESSAGES = [
  'Skor nedenleri inceleniyor...',
  'Öğün ve belirti ilişkileri taranıyor...',
  'Hassasiyet ipuçları hazırlanıyor...',
  'AI değerlendirmesi oluşturuluyor...',
];

function LoadingOverlay({ visible, message }) {
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (!visible) return undefined;

    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
      ]),
    );
    pulseAnim.start();
    return () => pulseAnim.stop();
  }, [visible, pulse]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={styles.loadingBackdrop}>
        <View style={styles.loadingCard}>
          <View style={styles.loadingIconWrap}>
            <Animated.View style={[styles.loadingGlow, { opacity: pulse }]} />
            <Ionicons name="sparkles" size={28} color={colors.white} />
          </View>
          <Text style={styles.loadingTitle}>AI analiz ediyor</Text>
          <Text style={styles.loadingMessage}>{message}</Text>
          <ActivityIndicator color={colors.white} style={styles.loadingSpinner} />
        </View>
      </View>
    </Modal>
  );
}

export default function FoodSensitivityAiSheet({ visible, foodItem, userId, onClose }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [todayBlocked, setTodayBlocked] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);

  const level = foodItem ? getSensitivityLevel(foodItem.score) : null;

  const loadHistory = useCallback(async () => {
    if (!userId || !foodItem?.foodKey) return;

    setLoading(true);
    const [{ data }, todayRes] = await Promise.all([
      getFoodSensitivityAnalyses(userId, foodItem.foodKey),
      getTodayFoodSensitivityAnalysis(userId, foodItem.foodKey),
    ]);
    setHistory(data || []);
    setTodayBlocked(Boolean(todayRes.data));
    setLoading(false);
  }, [userId, foodItem?.foodKey]);

  useEffect(() => {
    if (!visible) return;
    loadHistory();
  }, [visible, loadHistory]);

  useEffect(() => {
    if (!creating) return undefined;

    const timer = setInterval(() => {
      setStatusIndex((current) => (current + 1) % STATUS_MESSAGES.length);
    }, 2200);

    return () => clearInterval(timer);
  }, [creating]);

  async function handleCreate() {
    if (!userId || !foodItem || creating) return;

    if (todayBlocked) {
      Alert.alert(
        'Günlük limit',
        'Bu besin için bugün zaten bir AI analizi yaptın. Yarın tekrar deneyebilirsin.',
      );
      return;
    }

    setCreating(true);
    setStatusIndex(0);

    const { data, error } = await createFoodSensitivityAnalysis(userId, foodItem);
    setCreating(false);

    if (error) {
      Alert.alert('Analiz yapılamadı', error.message);
      if (error.code === 'DAILY_LIMIT') {
        setTodayBlocked(true);
        loadHistory();
      }
      return;
    }

    setTodayBlocked(true);
    await loadHistory();
    onClose?.();
    router.push(`/ai-analysis/${data.id}`);
  }

  function openAnalysis(id) {
    onClose?.();
    router.push(`/ai-analysis/${id}`);
  }

  if (!foodItem) return null;

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.backdrop}>
          <Pressable style={styles.dismissArea} onPress={onClose} />
          <View
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom + spacing.md, maxHeight: SHEET_MAX_HEIGHT },
            ]}
          >
            <View style={styles.handle} />

            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.emoji}>{foodItem.emoji}</Text>
                <View style={styles.headerText}>
                  <Text style={styles.title}>{foodItem.foodName}</Text>
                  <Text style={styles.subtitle}>
                    Skor {foodItem.score} · {level?.label}
                  </Text>
                </View>
              </View>
              <Pressable onPress={onClose} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Text style={styles.helper}>
              Bu skoru neden aldığını, gerçek bir hassasiyet olup olmadığını nasıl anlayabileceğini AI ile sorabilirsin.
            </Text>

            <Button
              title={todayBlocked ? 'Bugün analiz yapıldı' : 'Yeni AI analizi başlat'}
              onPress={handleCreate}
              loading={creating}
              disabled={todayBlocked || loading}
            />

            {todayBlocked ? (
              <Text style={styles.limitNote}>
                Aynı besine günde bir analiz yapılabilir. Yarın yeniden sorabilirsin.
              </Text>
            ) : null}

            <Text style={styles.sectionLabel}>Önceki analizler</Text>

            {loading ? (
              <View style={styles.loadingInline}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : history.length ? (
              <ScrollView
                style={styles.historyScroll}
                contentContainerStyle={styles.historyList}
                showsVerticalScrollIndicator={false}
              >
                {history.map((item, index) => (
                  <Pressable
                    key={item.id}
                    onPress={() => openAnalysis(item.id)}
                    style={({ pressed }) => [
                      styles.historyItem,
                      index < history.length - 1 && styles.historyDivider,
                      pressed && styles.historyPressed,
                    ]}
                  >
                    <View style={styles.historyIcon}>
                      <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                    </View>
                    <View style={styles.historyContent}>
                      <Text style={styles.historyTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.historyMeta}>{formatDate(item.created_at)}</Text>
                      {item.summary ? (
                        <Text style={styles.historySummary} numberOfLines={2}>
                          {item.summary}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyHistoryText}>
                  Henüz bu besin için AI analizi yok. İlk analizi başlatabilirsin.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <LoadingOverlay visible={creating} message={STATUS_MESSAGES[statusIndex]} />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerCopy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  emoji: {
    fontSize: 28,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodySemiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  helper: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  limitNote: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: -spacing.xs,
  },
  sectionLabel: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
  loadingInline: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  historyScroll: {
    flexShrink: 1,
  },
  historyList: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  historyDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  historyPressed: {
    backgroundColor: colors.background,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContent: {
    flex: 1,
    gap: 2,
  },
  historyTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 14,
  },
  historyMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  historySummary: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16,
  },
  emptyHistory: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  emptyHistoryText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  loadingBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 12, 18, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  loadingCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#151821',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  loadingIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  loadingGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    backgroundColor: 'rgba(138, 180, 255, 0.25)',
  },
  loadingTitle: {
    ...typography.bodySemiBold,
    color: colors.white,
    fontSize: 18,
  },
  loadingMessage: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'center',
    minHeight: 40,
    lineHeight: 20,
  },
  loadingSpinner: {
    marginTop: spacing.sm,
  },
});
