import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/ui/BackButton';
import Button from '../../components/ui/Button';
import { getEliminationProgram } from '../../constants/elimination';
import { useAuth } from '../../context/AuthContext';
import { startEliminationSession } from '../../services/eliminationService';
import { colors, radius, spacing, typography } from '../../theme';

export default function LabProgramScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  const program = useMemo(() => getEliminationProgram(slug), [slug]);
  const [starting, setStarting] = useState(false);

  async function handleStart() {
    if (!user?.id || !program || starting) return;
    setStarting(true);
    const { data, error } = await startEliminationSession(user.id, program.slug);
    setStarting(false);
    if (error) {
      Alert.alert('Başlatılamadı', error.message);
      return;
    }
    router.replace(`/lab/session/${data.id}`);
  }

  if (!program) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Program</Text>
        </View>
        <Text style={styles.missing}>Program bulunamadı.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{program.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.emoji}>{program.emoji}</Text>
        <Text style={styles.title}>{program.title}</Text>
        <Text style={styles.desc}>{program.description}</Text>

        <View style={styles.quote}>
          <Text style={styles.quoteText}>
            Bugün kaloriyi değil, vücudunu test ediyoruz. 7 gün iz sür, sonra kontrollü geri getir.
          </Text>
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

        {program.hiddenSources?.length ? (
          <>
            <Text style={styles.section}>🕵️ Gizli kaynaklar</Text>
            <View style={styles.chipWrap}>
              {program.hiddenSources.map((item) => (
                <View key={item} style={styles.chip}>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <View style={styles.protocol}>
          <Text style={styles.protocolTitle}>Yeniden tanıtım</Text>
          <Text style={styles.protocolBody}>
            {program.reintroductionProtocol.food} — {program.reintroductionProtocol.instruction}
          </Text>
        </View>

        <Button title="Deneyi başlat (7 gün)" onPress={handleStart} loading={starting} />
        <Text style={styles.disclaimer}>
          Aynı anda yalnızca 1 aktif eliminasyon olabilir. Sonuçlar tıbbi tanı değildir.
        </Text>
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
  missing: {
    ...typography.body,
    color: colors.textSecondary,
    padding: spacing.lg,
  },
  emoji: { fontSize: 48, textAlign: 'center' },
  title: {
    ...typography.bodySemiBold,
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
    color: colors.textPrimary,
  },
  desc: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  quote: {
    backgroundColor: '#F3F0FF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  quoteText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  section: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: colors.white,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipBad: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  chipGood: { backgroundColor: '#F3FBF5', borderColor: '#CDEAD4' },
  chipText: { ...typography.caption, color: colors.textPrimary },
  protocol: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  protocolTitle: { ...typography.bodySemiBold, color: colors.textPrimary },
  protocolBody: { ...typography.bodySmall, color: colors.textSecondary, lineHeight: 20 },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
