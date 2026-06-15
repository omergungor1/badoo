import { useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { addPeriodNote } from '../../services/periodService';
import FormActions from '../../components/ui/FormActions';
import Input from '../../components/ui/Input';
import SectionTitle from '../../components/ui/SectionTitle';
import { spacing } from '../../theme';

export default function PeriodNoteScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!user?.id) return;

    setLoading(true);
    const { error } = await addPeriodNote(user.id, note);
    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionTitle title="Regl Notu" subtitle="Döngünle ilgili notunu yaz" />
      <Input
        label="Not"
        value={note}
        onChangeText={setNote}
        multiline
        placeholder="Örn. bugün akış yoğun, karın ağrısı var"
      />
      <FormActions onSave={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
});
