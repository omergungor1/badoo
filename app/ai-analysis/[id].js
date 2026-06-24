import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/ui/BackButton';
import Card from '../../components/ui/Card';
import MarkdownText from '../../components/ui/MarkdownText';
import { useAuth } from '../../context/AuthContext';
import { getHealthAnalysisById } from '../../services/healthAiAnalysisService';
import { formatDate } from '../../utils/date';
import { colors, spacing, typography } from '../../theme';

export default function HealthAnalysisDetailScreen() {
  const params = useLocalSearchParams();
  const analysisId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.id || !analysisId) return;

    const { data } = await getHealthAnalysisById(user.id, analysisId);
    setAnalysis(data);
  }, [user?.id, analysisId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>AI Sağlık Analizi</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {analysis ? (
          <>
            <Card style={styles.metaCard}>
              <Text style={styles.title}>{analysis.title}</Text>
              {analysis.summary ? <Text style={styles.summary}>{analysis.summary}</Text> : null}
              <Text style={styles.meta}>
                {formatDate(analysis.period_start)} – {formatDate(analysis.period_end)}
              </Text>
              <Text style={styles.meta}>Oluşturulma: {formatDate(analysis.created_at)}</Text>
            </Card>

            <Card style={styles.analysisCard}>
              <MarkdownText>{analysis.analysis_text}</MarkdownText>
            </Card>

            <Text style={styles.disclaimer}>
              Bu analiz bilgilendirme amaçlıdır; tıbbi teşhis veya tedavi yerine geçmez. Şikayetlerin devam ederse bir sağlık uzmanına danış.
            </Text>
          </>
        ) : (
          <Text style={styles.empty}>Analiz bulunamadı.</Text>
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
  headerTitle: { ...typography.headingMedium, color: colors.textPrimary, flex: 1 },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  metaCard: { gap: spacing.sm },
  title: { ...typography.h3, color: colors.textPrimary },
  summary: { ...typography.body, color: colors.textSecondary },
  meta: { ...typography.caption, color: colors.textSecondary },
  analysisCard: { gap: spacing.sm },
  disclaimer: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
    textAlign: 'center',
  },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
});
