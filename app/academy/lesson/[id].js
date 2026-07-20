import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import ConfettiCannon from 'react-native-confetti-cannon';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../../components/ui/BackButton';
import Button from '../../../components/ui/Button';
import { CELEBRATION_MASCOT, getMascotForDay } from '../../../constants/mascots';
import { useAuth } from '../../../context/AuthContext';
import {
  completeAcademyLesson,
  getAcademyLesson,
} from '../../../services/academyService';
import { colors, radius, spacing, typography } from '../../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELEBRATION_MS = 3500;

export default function AcademyLessonScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const lessonId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [celebration, setCelebration] = useState(null);
  const celebrationTimer = useRef(null);

  const dismissCelebration = useCallback(() => {
    if (celebrationTimer.current) {
      clearTimeout(celebrationTimer.current);
      celebrationTimer.current = null;
    }
    setCelebration(null);
    router.replace('/academy');
  }, [router]);

  useEffect(() => {
    if (!celebration) return undefined;
    celebrationTimer.current = setTimeout(dismissCelebration, CELEBRATION_MS);
    return () => {
      if (celebrationTimer.current) clearTimeout(celebrationTimer.current);
    };
  }, [celebration, dismissCelebration]);

  const load = useCallback(async () => {
    if (!user?.id || !lessonId) return;
    const { data, error } = await getAcademyLesson(user.id, lessonId);
    if (error) {
      Alert.alert('Hata', error.message);
    }
    setPayload(data);
    setLoading(false);
  }, [user?.id, lessonId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function handleComplete() {
    if (!user?.id || !lessonId || completing) return;
    setCompleting(true);
    const { data, error } = await completeAcademyLesson(user.id, lessonId);
    setCompleting(false);

    if (error) {
      Alert.alert('Tamamlanamadı', error.message);
      return;
    }

    setCelebration(data);
    await load();
  }

  const lesson = payload?.lesson;
  const completed = Boolean(payload?.completion);
  const locked = Boolean(payload?.locked);
  const lessonMascot = getMascotForDay(lesson?.day_number || 1);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Ders</Text>
      </View>

      {loading || !lesson ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.cover}>
            <Image source={lessonMascot} style={styles.coverMascot} resizeMode="contain" />
            <Text style={styles.series}>
              {lesson.series?.emoji} {lesson.series?.title} · Gün {lesson.day_number}
            </Text>
            <Text style={styles.title}>{lesson.title}</Text>
            {lesson.subtitle ? <Text style={styles.subtitle}>{lesson.subtitle}</Text> : null}
            <Text style={styles.meta}>
              ~{lesson.estimated_read_minutes} dk · {lesson.difficulty} · +{lesson.xp_reward} XP
            </Text>
          </View>

          {locked && !completed ? (
            <View style={styles.lockBox}>
              <Text style={styles.lockTitle}>Bu ders kilitli</Text>
              <Text style={styles.lockText}>
                Her gün yalnızca 1 ders açılır. Bugünkü dersini tamamladıysan yarın tekrar gel.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.body}>{lesson.content}</Text>

              {lesson.info_box ? (
                <View style={styles.infoBox}>
                  <Text style={styles.boxLabel}>Bilgi</Text>
                  <Text style={styles.boxText}>{lesson.info_box}</Text>
                </View>
              ) : null}

              {lesson.tip_box ? (
                <View style={styles.tipBox}>
                  <Text style={styles.boxLabel}>İpucu</Text>
                  <Text style={styles.boxText}>{lesson.tip_box}</Text>
                </View>
              ) : null}

              {lesson.daily_task ? (
                <View style={styles.taskBox}>
                  <Text style={styles.boxLabel}>Bugünkü görevin</Text>
                  <Text style={styles.boxText}>{lesson.daily_task}</Text>
                </View>
              ) : null}

              {lesson.summary ? (
                <View style={styles.summaryBox}>
                  <Text style={styles.boxLabel}>Özet</Text>
                  <Text style={styles.boxText}>{lesson.summary}</Text>
                </View>
              ) : null}

              {completed ? (
                <View style={styles.doneBox}>
                  <Text style={styles.doneTitle}>Ders tamamlandı</Text>
                  <Text style={styles.doneText}>
                    +{payload.completion.xp_earned} XP kazandın.
                    {lesson.motivation ? `\n${lesson.motivation}` : ''}
                  </Text>
                </View>
              ) : (
                <Button
                  title="Dersi Tamamla"
                  onPress={handleComplete}
                  loading={completing}
                />
              )}
            </>
          )}
        </ScrollView>
      )}

      <Modal visible={Boolean(celebration)} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.celebrationRoot}>
          {celebration ? (
            <ConfettiCannon
              count={120}
              origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
              fadeOut
              autoStart
              explosionSpeed={350}
              fallSpeed={2500}
              colors={['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF8FAB', '#C77DFF']}
            />
          ) : null}
          <View style={styles.celebrationCenter}>
            <Image
              source={CELEBRATION_MASCOT}
              style={styles.celebrationMascot}
              resizeMode="contain"
            />
            <Text style={styles.celebrationTitle}>Harika iş!</Text>
            <Text style={styles.celebrationXp}>+{celebration?.xpEarned || 0} XP</Text>
            {celebration?.newBadges?.length ? (
              <Text style={styles.celebrationBadge}>
                Yeni rozet: {celebration.newBadges.map((b) => `${b.emoji} ${b.title}`).join(', ')}
              </Text>
            ) : null}
          </View>
          <View style={styles.celebrationStreak}>
            <Text style={styles.celebrationStreakLabel}>Seri</Text>
            <Text style={styles.celebrationStreakValue}>
              {celebration?.progress?.current_streak || 1} gün
            </Text>
            {celebration?.streakBonus ? (
              <Text style={styles.celebrationStreakBonus}>
                +{celebration.streakBonus} streak bonusu
              </Text>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 18,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  cover: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
    alignItems: 'center',
  },
  coverMascot: {
    width: 140,
    height: 140,
    marginBottom: spacing.xs,
  },
  series: { ...typography.caption, color: colors.textSecondary },
  title: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 22,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  meta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  body: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  infoBox: {
    backgroundColor: '#EEF6FF',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  tipBox: {
    backgroundColor: '#FFF8E8',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  taskBox: {
    backgroundColor: '#F3FBF5',
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  summaryBox: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
  },
  boxLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  boxText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  lockBox: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lockTitle: { ...typography.bodySemiBold, color: colors.textPrimary },
  lockText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
  doneBox: {
    backgroundColor: '#F3FBF5',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  doneTitle: { ...typography.bodySemiBold, color: colors.textPrimary },
  doneText: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
  celebrationRoot: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationCenter: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    zIndex: 2,
  },
  celebrationMascot: {
    width: 200,
    height: 200,
  },
  celebrationTitle: {
    ...typography.bodySemiBold,
    fontSize: 28,
    lineHeight: 36,
    color: colors.white,
  },
  celebrationXp: {
    ...typography.bodySemiBold,
    fontSize: 36,
    lineHeight: 46,
    color: colors.activity,
  },
  celebrationBadge: {
    ...typography.bodySmall,
    color: colors.white,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  celebrationStreak: {
    position: 'absolute',
    bottom: 56,
    alignItems: 'center',
    gap: 4,
    zIndex: 2,
  },
  celebrationStreakLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  celebrationStreakValue: {
    ...typography.bodySemiBold,
    fontSize: 22,
    lineHeight: 30,
    color: colors.white,
  },
  celebrationStreakBonus: {
    ...typography.bodySmall,
    color: colors.activity,
  },
});
