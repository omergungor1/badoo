import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { addNote } from '../../services/logService';
import FormActions from '../../components/ui/FormActions';
import Input from '../../components/ui/Input';
import { spacing } from '../../theme';

export default function AddNoteScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!note.trim() || !user?.id) {
      Alert.alert('Hata', 'Not yaz.');
      return;
    }

    setLoading(true);
    const { error } = await addNote({ userId: user.id, note: note.trim() });
    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Input
        label="Not"
        value={note}
        onChangeText={setNote}
        multiline
        placeholder="Karnım şu an çok rahat..."
      />
      <FormActions onSave={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
});
