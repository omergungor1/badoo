import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import Button from './Button';
import { confirmCancel } from '../../utils/confirmCancel';
import { spacing } from '../../theme';

export default function FormActions({
  saveTitle = 'Kaydet',
  onSave,
  loading = false,
  confirmOnCancel = true,
}) {
  const router = useRouter();

  function handleCancel() {
    if (confirmOnCancel) {
      confirmCancel(() => router.back());
      return;
    }

    router.back();
  }

  return (
    <View style={styles.row}>
      <Button
        title="Vazgeç"
        variant="outline"
        onPress={handleCancel}
        disabled={loading}
        style={styles.button}
      />
      <Button
        title={saveTitle}
        onPress={onSave}
        loading={loading}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
  },
});
