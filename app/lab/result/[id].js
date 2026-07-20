import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../../components/ui/BackButton';
import Button from '../../../components/ui/Button';
import { CELEBRATION_MASCOT, getRandomMascot } from '../../../constants/mascots';
import { useAuth } from '../../../context/AuthContext';
import {
  completeReintroduction,
  getEliminationSessionDetail,
} from '../../../services/eliminationService';
import { colors, radius, spacing, typography } from '../../../theme';

const LIKELIHOOD_LABEL = {
  high: 'Yüksek olasılık',
  medium: 'Orta olasılık',
  low: 'Düşük olasılık',
  inconclusive: 'Belirsiz',
};

export default function LabResultScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const calmMascot = useMemo(() => getRandomMascot(), []);

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [computing, setComputing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id || !sessionId) return;
    const { data, error } = await getEliminationSessionDetail(user.id, sessionId);
    if (error) Alert.alert('Hata', error.message);
    setSession(data?.session || null);
    setLoading(false);

    if (data?.session?.status === 'reintroduction') {
      setComputing(true);
      const { data: done, error: doneError } = await completeReintroduction(user.id, sessionId);
      setComputing(false);
      if (doneError) {
        Alert.alert('Hesaplanamadı', doneError.message);
        return;
      }
      setSession(done);
    }
  }, [user?.id, sessionId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const program = session?.program;
  const showCelebrate = session?.result_likelihood === 'high';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Sonuç</Text>
      </View>

      {loading || computing || !session ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Image
            source={showCelebrate ? CELEBRATION_MASCOT : calmMascot}
            style={styles.mascot}
            resizeMode="contain"
          />
          <Text style={styles.emoji}>{program?.emoji}</Text>
          <Text style={styles.title}>{program?.title}</Text>
          <Text style={styles.badge}>
            {LIKELIHOOD_LABEL[session.result_likelihood] || 'Sonuç'}
          </Text>
          <Text style={styles.summary}>{session.result_summary}</Text>

          {program?.completionBadge ? (
            <View style={styles.badgeCard}>
              <Text style={styles.badgeCardTitle}>Rozet</Text>
              <Text style={styles.badgeCardBody}>{program.completionBadge}</Text>
            </View>
          ) : null}

          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimer}>
              Bu sonuç kullanıcı verilerine dayalı bir olasılık analizidir; tıbbi tanı değildir.
              Şiddetli belirtilerde hekime danış.
            </Text>
          </View>

          <Button title="Laboratuvara dön" onPress={() => router.replace('/lab')} />
        </ScrollView>
      )}
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
    alignItems: 'center',
    paddingBottom: spacing.xxl,
  },
  mascot: { width: 140, height: 140 },
  emoji: { fontSize: 36 },
  title: {
    ...typography.bodySemiBold,
    fontSize: 24,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  badge: {
    ...typography.caption,
    color: '#7C3AED',
    fontFamily: typography.bodySemiBold.fontFamily,
    backgroundColor: '#F3F0FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  summary: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  badgeCard: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 4,
  },
  badgeCardTitle: { ...typography.caption, color: colors.textSecondary },
  badgeCardBody: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 18,
  },
  disclaimerBox: {
    width: '100%',
    backgroundColor: '#FFF8E8',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
});
