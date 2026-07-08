import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../ui/Button';
import {
  createHealthAnalysis,
  getHealthAnalysisPreview,
} from '../../services/healthAiAnalysisService';
import { ANALYSIS_PERIOD_DAYS } from '../../utils/healthAiPayload';
import { formatDate, formatShortDate } from '../../utils/date';
import { colors, radius, spacing, typography } from '../../theme';

const STATUS_MESSAGES = [
  'Öğün kayıtları analiz ediliyor...',
  'Belirtiler ve sindirim verileri inceleniyor...',
  'Uyku ve aktivite kayıtları kontrol ediliyor...',
  'Beslenme örüntüleri değerlendiriliyor...',
  'Hassasiyet bağlantıları taranıyor...',
  'AI sağlık özeti hazırlanıyor...',
];

const SHEET_MAX_HEIGHT = Dimensions.get('window').height * 0.88;

function AnalysisPreviewStats({ preview }) {
  if (!preview) return null;

  const items = [
    { label: 'Öğün', value: preview.stats.meals },
    { label: 'Belirti', value: preview.stats.symptoms },
    { label: 'Uyku', value: preview.stats.sleep },
    { label: 'Aktivite', value: preview.stats.activities },
    { label: 'Günlük', value: preview.stats.checkins },
    { label: 'Su', value: preview.stats.water },
  ].filter((item) => item.value > 0);

  return (
    <View style={styles.previewBox}>
      <Text style={styles.previewTitle}>
        Son {ANALYSIS_PERIOD_DAYS} günde toplam{' '}
        <Text style={styles.previewHighlight}>{preview.dataPointCount}</Text> kayıt analiz edilecek.
      </Text>
      <Text style={styles.previewPeriod}>
        {formatShortDate(preview.period.startDate)} – {formatShortDate(preview.period.endDate)}
      </Text>
      {items.length ? (
        <View style={styles.previewChips}>
          {items.map((item) => (
            <View key={item.label} style={styles.previewChip}>
              <Text style={styles.previewChipValue}>{item.value}</Text>
              <Text style={styles.previewChipLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function AnalysisLoadingOverlay({ visible, message }) {
  const pulse = useRef(new Animated.Value(0.4)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    if (!visible) return undefined;

    textOpacity.setValue(0);
    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 320,
      useNativeDriver: true,
    }).start();
  }, [message, textOpacity, visible]);

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
          <Animated.Text style={[styles.loadingMessage, { opacity: textOpacity }]}>
            {message}
          </Animated.Text>
          <ActivityIndicator color={colors.white} style={styles.loadingSpinner} />
        </View>
      </View>
    </Modal>
  );
}

function AnalysisListItem({ item, onPress, isLast }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.listItem,
        !isLast && styles.listItemDivider,
        pressed && styles.listItemPressed,
      ]}
    >
      <View style={styles.listIcon}>
        <Ionicons name="sparkles-outline" size={18} color={colors.primary} />
      </View>
      <View style={styles.listContent}>
        <Text style={styles.listTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.listMeta} numberOfLines={1}>
          {formatDate(item.created_at)} · {formatShortDate(item.period_start)} –{' '}
          {formatShortDate(item.period_end)}
        </Text>
        {item.summary ? (
          <Text style={styles.listSummary} numberOfLines={2}>
            {item.summary}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export default function HealthAiAnalysisSection({ userId, analyses = [], onCreated }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [note, setNote] = useState('');
  const [creating, setCreating] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);

  const recentAnalyses = analyses.slice(0, 3);

  const closeSheet = useCallback(() => {
    setSheetOpen(false);
    setNote('');
    setPreview(null);
  }, []);

  const openSheet = useCallback(async () => {
    if (!userId) return;

    setSheetOpen(true);
    setPreviewLoading(true);

    const { data } = await getHealthAnalysisPreview(userId);
    setPreview(data || null);
    setPreviewLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!creating) return undefined;

    const timer = setInterval(() => {
      setStatusIndex((current) => (current + 1) % STATUS_MESSAGES.length);
    }, 2200);

    return () => clearInterval(timer);
  }, [creating]);

  async function handleStartAnalysis() {
    if (!userId || creating) return;

    Keyboard.dismiss();
    setCreating(true);
    setStatusIndex(0);

    const { data, error } = await createHealthAnalysis(userId, {
      userNote: note.trim() || undefined,
    });

    setCreating(false);

    if (error) {
      Alert.alert('Analiz yapılamadı', error.message);
      return;
    }

    closeSheet();
    await onCreated?.();
    router.push(`/ai-analysis/${data.id}`);
  }

  return (
    <>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <View style={styles.titleRow}>
              <Ionicons name="sparkles" size={18} color={colors.primary} />
              <Text style={styles.title}>AI Sağlık Analizi</Text>
            </View>
            <Text style={styles.subtitle}>
              Son analizlerini görüntüle veya yeni bir AI değerlendirmesi başlat.
            </Text>
          </View>

          <Pressable
            onPress={openSheet}
            style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
          >
            <Ionicons name="add" size={26} color={colors.white} />
          </Pressable>
        </View>

        {recentAnalyses.length ? (
          <View style={styles.list}>
            {recentAnalyses.map((item, index) => (
              <AnalysisListItem
                key={item.id}
                item={item}
                isLast={index === recentAnalyses.length - 1}
                onPress={() => router.push(`/ai-analysis/${item.id}`)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Henüz analiz yok</Text>
            <Text style={styles.emptyText}>
              + butonuna basarak ilk AI sağlık analizini oluşturabilirsin.
            </Text>
          </View>
        )}
      </View>

      <Modal
        visible={sheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!creating) closeSheet();
        }}
      >
        <View style={styles.sheetBackdrop}>
          <Pressable
            style={styles.sheetDismissArea}
            onPress={() => {
              if (!creating) closeSheet();
            }}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardWrap}
            keyboardVerticalOffset={Platform.OS === 'ios' ? spacing.sm : 0}
          >
            <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md, maxHeight: SHEET_MAX_HEIGHT }]}>
              <View style={styles.sheetHandle} />

              <ScrollView
                ref={scrollRef}
                style={styles.sheetScroll}
                contentContainerStyle={styles.sheetScrollContent}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.sheetTitle}>Yeni AI Analizi</Text>
                <Text style={styles.sheetSubtitle}>
                  Son {ANALYSIS_PERIOD_DAYS} günlük verilerin değerlendirilecek.
                </Text>

                {previewLoading ? (
                  <View style={styles.previewLoading}>
                    <ActivityIndicator color={colors.primary} />
                    <Text style={styles.previewLoadingText}>Veriler hazırlanıyor...</Text>
                  </View>
                ) : (
                  <AnalysisPreviewStats preview={preview} />
                )}

                <View style={styles.noteBox}>
                  <Text style={styles.noteLabel}>Özel not (opsiyonel)</Text>
                  <Text style={styles.noteHint}>
                    Özellikle sormak istediğin bir konu varsa buraya yazabilirsin.
                  </Text>
                  <TextInput
                    value={note}
                    onChangeText={setNote}
                    placeholder="Örn: Son hafta şişkinlik arttı, kahve ile ilişkisi var mı?"
                    placeholderTextColor={colors.textMuted}
                    multiline
                    maxLength={500}
                    style={styles.noteInput}
                    textAlignVertical="top"
                    editable={!creating}
                    onFocus={() => {
                      setTimeout(() => {
                        scrollRef.current?.scrollToEnd({ animated: true });
                      }, 120);
                    }}
                  />
                </View>
              </ScrollView>

              <Button
                title="Analizi Başlat"
                onPress={handleStartAnalysis}
                loading={creating}
                disabled={previewLoading || !preview}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <AnalysisLoadingOverlay visible={creating} message={STATUS_MESSAGES[statusIndex]} />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F7F8FC',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E4E8F2',
    padding: spacing.md,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    ...typography.bodySemiBold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  addBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  list: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  listItemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  listItemPressed: {
    backgroundColor: colors.background,
  },
  listIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F0F2F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    flex: 1,
    gap: 2,
  },
  listTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
  listMeta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  listSummary: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: 2,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 4,
  },
  emptyTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetDismissArea: {
    flex: 1,
  },
  keyboardWrap: {
    width: '100%',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  sheetScroll: {
    flexShrink: 1,
  },
  sheetScrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.xs,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  sheetTitle: {
    ...typography.bodySemiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: -6,
  },
  previewBox: {
    backgroundColor: '#F4F6FB',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E7F1',
  },
  previewTitle: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  previewHighlight: {
    fontFamily: typography.bodySemiBold.fontFamily,
    color: colors.primary,
  },
  previewPeriod: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  previewChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  previewChip: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 54,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewChipValue: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
  previewChipLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  previewLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  previewLoadingText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  noteBox: {
    gap: spacing.xs,
  },
  noteLabel: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
  noteHint: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  noteInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
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
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
