import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../../components/ui/BackButton';
import Button from '../../../components/ui/Button';
import { getRandomMascot } from '../../../constants/mascots';
import { ELIMINATION_DURATION_DAYS } from '../../../constants/elimination';
import { useAuth } from '../../../context/AuthContext';
import {
  finishEliminationPhase,
  getEliminationSessionDetail,
} from '../../../services/eliminationService';
import { colors, radius, spacing, typography } from '../../../theme';

export default function LabSessionScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionId = Array.isArray(params.id) ? params.id[0] : params.id;
  const mascot = useMemo(() => getRandomMascot(), []);

  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id || !sessionId) return;
    const { data, error } = await getEliminationSessionDetail(user.id, sessionId);
    if (error) Alert.alert('Hata', error.message);
    setPayload(data);
    setLoading(false);
  }, [user?.id, sessionId]);

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

  async function handleFinish() {
    if (!user?.id || finishing) return;
    setFinishing(true);
    const { data, error } = await finishEliminationPhase(user.id, sessionId);
    setFinishing(false);
    if (error) {
      Alert.alert('Bitirilemedi', error.message);
      return;
    }
    Alert.alert(
      'Yeniden tanıtım',
      `${data.program?.reintroductionProtocol?.instruction || 'Kontrollü geri getir.'}`,
    );
    await load();
  }

  async function handleCompleteReintro() {
    router.push(`/lab/result/${sessionId}`);
  }

  const session = payload?.session;
  const program = session?.program;
  const isReintro = session?.status === 'reintroduction';
  const canFinish =
    session?.status === 'active' && session.currentDay >= ELIMINATION_DURATION_DAYS;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Deney</Text>
      </View>

      {loading || !session || !program ? (
        <ActivityIndicator color="#7C3AED" style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />
          }
        >
          <View style={styles.hero}>
            <Image source={mascot} style={styles.mascot} resizeMode="contain" />
            <Text style={styles.emoji}>{program.emoji}</Text>
            <Text style={styles.title}>{program.title}</Text>
            <Text style={styles.dayLabel}>
              {isReintro
                ? 'Yeniden tanıtım · 48 saat'
                : `Gün ${session.currentDay} / ${ELIMINATION_DURATION_DAYS}`}
            </Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  { width: `${Math.min(100, session.progressPercent || 0)}%` },
                ]}
              />
            </View>
          </View>

          {isReintro ? (
            <View style={styles.box}>
              <Text style={styles.boxLabel}>Protokol</Text>
              <Text style={styles.boxTitle}>{session.reintroduction_food}</Text>
              <Text style={styles.boxBody}>
                {program.reintroductionProtocol?.instruction}
              </Text>
            </View>
          ) : (
            <>
              {session.dayContent?.lesson ? (
                <View style={styles.box}>
                  <Text style={styles.boxLabel}>Bugünkü bilgi</Text>
                  <Text style={styles.boxTitle}>{session.dayContent.lesson.title}</Text>
                  <Text style={styles.boxBody}>{session.dayContent.lesson.body}</Text>
                </View>
              ) : null}

              {session.dayContent?.task ? (
                <View style={[styles.box, styles.taskBox]}>
                  <Text style={styles.boxLabel}>Bugünkü görev</Text>
                  <Text style={styles.boxTitle}>{session.dayContent.task.title}</Text>
                  <Text style={styles.boxBody}>{session.dayContent.task.body}</Text>
                </View>
              ) : null}
            </>
          )}

          <View style={styles.box}>
            <Text style={styles.boxLabel}>Belirtiler</Text>
            <Text style={styles.boxBody}>
              {payload.todayLog
                ? 'Bugünkü belirti kaydın alındı. Güncellemek için tekrar girebilirsin.'
                : 'Bugünkü belirti puanlarını gir — dedektiflik bununla ilerler.'}
            </Text>
            <Button
              title={payload.todayLog ? 'Belirtiyi güncelle' : 'Bugünkü belirtiyi gir'}
              onPress={() => router.push(`/lab/symptoms/${sessionId}`)}
            />
          </View>

          <Text style={styles.section}>❌ Yasaklılar</Text>
          <View style={styles.chipWrap}>
            {program.prohibitedFoods.map((item) => (
              <View key={item} style={[styles.chip, styles.chipBad]}>
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.section}>✔ Serbestler</Text>
          <View style={styles.chipWrap}>
            {program.allowedFoods.map((item) => (
              <View key={item} style={[styles.chip, styles.chipGood]}>
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
          </View>

          {canFinish ? (
            <Button
              title="7 günü bitir → Yeniden tanıtım"
              onPress={handleFinish}
              loading={finishing}
            />
          ) : null}

          {isReintro ? (
            <Button title="Sonuçları hesapla" onPress={handleCompleteReintro} />
          ) : null}

          {session.status === 'active' || isReintro ? (
            <Pressable
              onPress={() => router.push(`/lab/break/${sessionId}`)}
              style={({ pressed }) => [styles.breakBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.breakText}>🍕 Bugün diyeti bozdum</Text>
            </Pressable>
          ) : null}

          {session.status === 'completed' ? (
            <Button title="Sonucu gör" onPress={() => router.push(`/lab/result/${sessionId}`)} />
          ) : null}

          <Text style={styles.disclaimer}>
            Bu deney tıbbi tanı değildir. Belirtilerin şiddetliyse hekime danış.
          </Text>
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
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mascot: { width: 88, height: 88 },
  emoji: { fontSize: 28 },
  title: {
    ...typography.bodySemiBold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  dayLabel: {
    ...typography.caption,
    color: '#7C3AED',
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  track: {
    width: '100%',
    height: 8,
    borderRadius: radius.full,
    backgroundColor: 'rgba(124,58,237,0.12)',
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  fill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: radius.full,
  },
  box: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskBox: { backgroundColor: '#F8F5FF', borderColor: '#DDD6FE' },
  boxLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  boxTitle: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  boxBody: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.white,
    borderColor: colors.border,
  },
  chipBad: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  chipGood: { backgroundColor: '#F3FBF5', borderColor: '#CDEAD4' },
  chipText: { ...typography.caption, color: colors.textPrimary },
  breakBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FFF7F7',
  },
  breakText: {
    ...typography.bodySemiBold,
    color: colors.danger,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
