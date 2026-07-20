import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../../components/ui/BackButton';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../context/AuthContext';
import { breakEliminationSession } from '../../../services/eliminationService';
import { colors, radius, spacing, typography } from '../../../theme';

export default function LabBreakScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [food, setFood] = useState('');
  const [amount, setAmount] = useState('');
  const [intent, setIntent] = useState('accidental');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave(markBroken) {
    if (!user?.id || saving) return;
    if (!food.trim()) {
      Alert.alert('Eksik', 'Hangi besini tükettiğini yaz.');
      return;
    }
    setSaving(true);
    const { error } = await breakEliminationSession(user.id, sessionId, {
      food: food.trim(),
      amount: amount.trim(),
      intent,
      note: note.trim(),
      markBroken,
    });
    setSaving(false);
    if (error) {
      Alert.alert('Kaydedilemedi', error.message);
      return;
    }

    if (markBroken) {
      Alert.alert(
        'Oturum bozuldu',
        'Sorun değil. Bugünkü gözlemi kaydettik. İstersen aynı deneyi sonra yeniden başlatabilirsin.',
        [{ text: 'Tamam', onPress: () => router.replace('/lab') }],
      );
    } else {
      Alert.alert(
        'Not alındı',
        'Kaçağı kaydettik; deneye devam edebilirsin.',
        [{ text: 'Tamam', onPress: () => router.back() }],
      );
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Diyeti bozdum</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.intro}>
          Sorun değil. Bugünkü gözlemi yine kaydedeceğiz. İstersen oturumu tamamen bozabilir veya
          sadece kaçak notu düşüp devam edebilirsin.
        </Text>

        <Text style={styles.label}>Hangi besini tükettin?</Text>
        <TextInput
          style={styles.input}
          value={food}
          onChangeText={setFood}
          placeholder="Örn. bir dilim pizza"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Yaklaşık ne kadar?</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="Örn. 2 dilim"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>Bilerek mi, yanlışlıkla mı?</Text>
        <View style={styles.row}>
          <Pressable
            onPress={() => setIntent('intentional')}
            style={[styles.choice, intent === 'intentional' && styles.choiceOn]}
          >
            <Text style={[styles.choiceText, intent === 'intentional' && styles.choiceTextOn]}>
              Bilerek
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setIntent('accidental')}
            style={[styles.choice, intent === 'accidental' && styles.choiceOn]}
          >
            <Text style={[styles.choiceText, intent === 'accidental' && styles.choiceTextOn]}>
              Yanlışlıkla
            </Text>
          </Pressable>
        </View>

        <TextInput
          style={[styles.input, styles.inputTall]}
          value={note}
          onChangeText={setNote}
          placeholder="Not (opsiyonel)"
          placeholderTextColor={colors.textMuted}
          multiline
        />

        <Button
          title="Sadece kaçak notu — devam et"
          onPress={() => handleSave(false)}
          loading={saving}
          variant="outline"
        />
        <Button
          title="Oturumu boz ve bitir"
          onPress={() => handleSave(true)}
          loading={saving}
        />
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
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  label: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 48,
  },
  inputTall: { minHeight: 88, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: spacing.sm },
  choice: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceOn: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  choiceText: { ...typography.bodySemiBold, color: colors.textPrimary },
  choiceTextOn: { color: colors.white },
});
