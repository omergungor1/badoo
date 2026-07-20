import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { addWaterLog, completeTask } from '../../services/logService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Toast from '../../components/ui/Toast';
import WaterGlassPicker from '../../components/ui/WaterGlassPicker';
import { confirmCancel } from '../../utils/confirmCancel';
import { GLASS_ML, glassesToMl } from '../../utils/water';
import { colors, spacing, typography } from '../../theme';

export default function AddWaterScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [glasses, setGlasses] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const hideToast = useCallback(() => setToastMessage(null), []);

  async function handleAdd() {
    if (!user?.id) return;

    const amount = glassesToMl(glasses);
    if (!amount) {
      Alert.alert('Hata', 'En az 1 bardak seçin.');
      return;
    }

    setLoading(true);
    const { error } = await addWaterLog({ userId: user.id, amount });
    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    await completeTask(user.id, 'water');
    setToastMessage(`${glasses} bardak (${amount} ml) su eklendi.`);
    setTimeout(() => router.back(), 1000);
  }

  return (
    <View style={styles.content}>
      <Toast message={toastMessage} onHide={hideToast} />
      <Text style={styles.title}>Su Ekle</Text>
      <Text style={styles.subtitle}>1 bardak = {GLASS_ML} ml</Text>

      <Card>
        <WaterGlassPicker
          title="Su miktarı"
          glasses={glasses}
          onChange={setGlasses}
          min={1}
          max={5}
        />
      </Card>

      <Button title={`${glasses} Bardak Ekle`} onPress={handleAdd} loading={loading} style={styles.saveBtn} />
      <Button
        title="Vazgeç"
        variant="outline"
        onPress={() => confirmCancel(() => router.back())}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background },
  title: { ...typography.h2, color: colors.textPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary },
  saveBtn: { backgroundColor: colors.water },
});
