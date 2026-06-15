import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { BRISTOL_TYPES } from '../../constants/onboarding';
import { useAuth } from '../../context/AuthContext';
import { addStoolLog, completeTask } from '../../services/logService';
import FormActions from '../../components/ui/FormActions';
import Chip from '../../components/ui/Chip';
import Input from '../../components/ui/Input';
import { spacing } from '../../theme';

export default function AddStoolScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [consistency, setConsistency] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!consistency || !user?.id) {
      Alert.alert('Hata', 'Kıvam seç.');
      return;
    }

    setLoading(true);
    const { error } = await addStoolLog({ userId: user.id, consistency, note });
    await completeTask(user.id, 'stool');
    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {BRISTOL_TYPES.map((item) => (
        <Chip
          key={item.value}
          label={item.label}
          selected={consistency === item.value}
          onPress={() => setConsistency(item.value)}
        />
      ))}
      <Input label="Ek açıklama" value={note} onChangeText={setNote} multiline />
      <FormActions onSave={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.sm },
});
