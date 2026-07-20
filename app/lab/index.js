import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/ui/BackButton';
import { getAllEliminationPrograms, STATUS_META } from '../../constants/elimination';
import { useAuth } from '../../context/AuthContext';
import { getEliminationLabOverview } from '../../services/eliminationService';
import { colors, radius, spacing, typography } from '../../theme';

function resolveCardStatus(programSlug, bySlug, hasActive, activeSlug) {
  const history = bySlug[programSlug] || [];
  if (hasActive && activeSlug === programSlug) return 'active';
  if (history.some((s) => s.status === 'completed')) return 'completed';
  if (history.some((s) => s.status === 'broken')) return 'broken';
  if (history.length) return 'restartable';
  return 'waiting';
}

export default function LabScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const programs = useMemo(() => getAllEliminationPrograms(), []);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await getEliminationLabOverview(user.id);
    if (error) Alert.alert('Hata', error.message);
    setOverview(data);
    setLoading(false);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const active = overview?.active;
  const bySlug = overview?.bySlug || {};

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Dr. Badoo Laboratuvarı</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />
        }
      >
        {loading ? (
          <ActivityIndicator color="#7C3AED" style={{ marginTop: spacing.xl }} />
        ) : (
          <>
            <View style={styles.intro}>
              <Text style={styles.introEmoji}>🔬</Text>
              <Text style={styles.introTitle}>Besin dedektifliği</Text>
              <Text style={styles.introBody}>
                Aynı anda yalnızca 1 eliminasyon. 7 gün izle, yeniden tanıt, sonucu oku. Bu tıbbi
                tanı değildir.
              </Text>
            </View>

            {active ? (
              <Pressable
                onPress={() => router.push(`/lab/session/${active.id}`)}
                style={({ pressed }) => [styles.activeCard, pressed && styles.pressed]}
              >
                <Text style={styles.activeLabel}>Aktif eliminasyon</Text>
                <Text style={styles.activeTitle}>
                  {active.program?.emoji} {active.program?.title}
                </Text>
                <Text style={styles.activeMeta}>
                  {active.status === 'reintroduction'
                    ? 'Yeniden tanıtım aşaması'
                    : `Gün ${active.currentDay} / 7`}
                </Text>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      { width: `${Math.min(100, active.progressPercent || 0)}%` },
                    ]}
                  />
                </View>
                {active.dayContent?.lesson ? (
                  <Text style={styles.activeMsg} numberOfLines={3}>
                    {active.dayContent.lesson.body}
                  </Text>
                ) : null}
              </Pressable>
            ) : null}

            <Text style={styles.section}>
              {active ? 'Diğer deneyler' : 'Başlatılacak eliminasyonlar'}
            </Text>

            <View style={styles.list}>
              {programs.map((program) => {
                const statusKey = resolveCardStatus(
                  program.slug,
                  bySlug,
                  Boolean(active),
                  active?.program_slug,
                );
                const meta = STATUS_META[statusKey] || STATUS_META.waiting;
                const isThisActive = statusKey === 'active';

                return (
                  <Pressable
                    key={program.slug}
                    onPress={() => {
                      if (isThisActive) {
                        router.push(`/lab/session/${active.id}`);
                        return;
                      }
                      router.push(`/lab/${program.slug}`);
                    }}
                    style={({ pressed }) => [styles.programCard, pressed && styles.pressed]}
                  >
                    <Text style={styles.programEmoji}>{program.emoji}</Text>
                    <View style={styles.programCopy}>
                      <Text style={styles.programTitle}>{program.title}</Text>
                      <Text style={styles.programStatus}>
                        {meta.emoji} {meta.label}
                      </Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
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
    fontSize: 18,
    color: colors.textPrimary,
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  intro: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  introEmoji: { fontSize: 28 },
  introTitle: {
    ...typography.bodySemiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  introBody: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  activeCard: {
    backgroundColor: '#F3F0FF',
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: '#DDD6FE',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  pressed: { opacity: 0.92 },
  activeLabel: {
    ...typography.caption,
    color: '#7C3AED',
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  activeTitle: {
    ...typography.bodySemiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  activeMeta: { ...typography.caption, color: colors.textSecondary },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: 'rgba(124,58,237,0.12)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: radius.full,
  },
  activeMsg: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    ...typography.bodySemiBold,
    fontSize: 17,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  list: { gap: spacing.sm },
  programCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  programEmoji: { fontSize: 28 },
  programCopy: { flex: 1, gap: 2 },
  programTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  programStatus: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
  },
});
