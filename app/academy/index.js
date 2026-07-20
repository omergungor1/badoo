import { useCallback, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import AcademyRoadmap from '../../components/academy/AcademyRoadmap';
import BackButton from '../../components/ui/BackButton';
import { useAuth } from '../../context/AuthContext';
import { getAcademyMap } from '../../services/academyService';
import { colors, radius, spacing, typography } from '../../theme';

export default function AcademyScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    const { data: map } = await getAcademyMap(user.id);
    setData(map);
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

  function handleNodePress(node) {
    if (node.status === 'tomorrow') {
      Alert.alert(
        'Yarın açılacak',
        'Bugünkü dersini tamamladın. Günde yalnızca 1 ders ilerleyebilirsin — bu ders yarın açılacak.',
      );
      return;
    }
    if (node.status === 'locked') {
      Alert.alert(
        'Kilitli',
        'Bu ders henüz açılmadı. Her gün yalnızca 1 ders okuyabilirsin; sıradaki dersler gün gün açılır.',
      );
      return;
    }
    // completed veya today → açılabilir
    router.push(`/academy/lesson/${node.id}`);
  }

  const progress = data?.progress;
  const nodes = data?.nodes || [];
  const badges = data?.badges || [];
  const todayNode = nodes.find((n) => n.status === 'today');
  const tomorrowNode = nodes.find((n) => n.status === 'tomorrow');
  const earnedBadges = badges.filter((b) => b.earned);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.topBar}>
        <BackButton />
        <Text style={styles.brand}>Dr. Badoo Akademi</Text>
        <View style={styles.topStats}>
          <View style={styles.chip}>
            <Text style={styles.chipIcon}>🔥</Text>
            <Text style={styles.chipValue}>{progress?.current_streak || 0}</Text>
          </View>
          <View style={[styles.chip, styles.chipXp]}>
            <Text style={styles.chipIcon}>⚡</Text>
            <Text style={styles.chipValue}>{progress?.total_xp || 0}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#58CC02" />
        }
      >
        {loading ? (
          <ActivityIndicator color="#58CC02" style={{ marginTop: spacing.xl }} />
        ) : (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>
                  Yolculuk %{data?.journeyPercent || 0} · Günde 1 ders
                </Text>
                <Text style={styles.heroTitle}>
                  {todayNode
                    ? `Gün ${todayNode.day_number} seni bekliyor`
                    : 'Bugünkü dersi tamamladın'}
                </Text>
                <Text style={styles.heroSub}>
                  {todayNode
                    ? todayNode.title
                    : tomorrowNode
                      ? `Sıradaki: Gün ${tomorrowNode.day_number} · yarın açılacak`
                      : 'Tüm dersler tamamlandı. Harika iş!'}
                </Text>
              </View>
              {todayNode ? (
                <Pressable
                  onPress={() => handleNodePress(todayNode)}
                  style={({ pressed }) => [styles.heroCta, pressed && styles.heroCtaPressed]}
                >
                  <Text style={styles.heroCtaText}>Dersi aç</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.white} />
                </Pressable>
              ) : (
                <View style={styles.heroDoneBadge}>
                  <Text style={styles.heroDoneText}>
                    {tomorrowNode ? '✓ Bugünlük hakkın doldu' : '✓ Tamamlandı'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(100, data?.journeyPercent || 0)}%` },
                ]}
              />
            </View>
            <Text style={styles.progressMeta}>
              {data?.completedCount || 0} / {nodes.length} ders tamamlandı
            </Text>

            <AcademyRoadmap nodes={nodes} onPressNode={handleNodePress} />

            <View style={styles.badgeSection}>
              <Text style={styles.badgeTitle}>Rozetler</Text>
              <Text style={styles.badgeSub}>
                {earnedBadges.length}/{badges.length} kazanıldı
              </Text>
              <View style={styles.badgeGrid}>
                {badges.map((badge) => (
                  <View
                    key={badge.id}
                    style={[styles.badgeCard, !badge.earned && styles.badgeLocked]}
                  >
                    <Text style={styles.badgeEmoji}>{badge.earned ? badge.emoji : '🔒'}</Text>
                    <Text style={styles.badgeName} numberOfLines={2}>
                      {badge.title}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7FBF4' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  brand: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 17,
    flex: 1,
  },
  topStats: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: '#FFE4C4',
  },
  chipXp: {
    borderColor: '#C7E9FF',
  },
  chipIcon: { fontSize: 13 },
  chipValue: {
    ...typography.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.sm,
  },
  heroCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 2,
    borderColor: '#E2F0D9',
    shadowColor: '#58CC02',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  heroCopy: { gap: 4 },
  heroEyebrow: {
    ...typography.caption,
    color: '#58CC02',
    fontFamily: typography.bodySemiBold.fontFamily,
    letterSpacing: 0.4,
  },
  heroTitle: {
    ...typography.bodySemiBold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  heroSub: {
    ...typography.body,
    color: colors.textSecondary,
  },
  heroCta: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#58CC02',
    borderRadius: radius.full,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 4,
    borderBottomColor: '#46A302',
  },
  heroCtaPressed: {
    borderBottomWidth: 2,
    transform: [{ translateY: 2 }],
  },
  heroCtaText: {
    ...typography.bodySemiBold,
    color: colors.white,
  },
  heroDoneBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F8E0',
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CDEAD4',
  },
  heroDoneText: {
    ...typography.bodySemiBold,
    color: '#46A302',
    fontSize: 14,
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.full,
    backgroundColor: '#E5E5E5',
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#58CC02',
    borderRadius: radius.full,
  },
  progressMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  badgeSection: {
    marginTop: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  badgeTitle: {
    ...typography.bodySemiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  badgeSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: -4,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeCard: {
    width: '30%',
    flexGrow: 1,
    minWidth: '28%',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: '#E2F0D9',
    padding: spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  badgeLocked: { opacity: 0.45 },
  badgeEmoji: { fontSize: 24 },
  badgeName: {
    ...typography.caption,
    color: colors.textPrimary,
    textAlign: 'center',
    fontFamily: typography.bodySemiBold.fontFamily,
  },
});
