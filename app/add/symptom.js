import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SYMPTOMS } from '../../constants/onboarding';
import { useAuth } from '../../context/AuthContext';
import { addSymptomLog } from '../../services/logService';
import FormActions from '../../components/ui/FormActions';
import Chip from '../../components/ui/Chip';
import Input from '../../components/ui/Input';
import RatingPicker from '../../components/ui/RatingPicker';
import { spacing } from '../../theme';

export default function AddSymptomScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selected, setSelected] = useState('');
  const [severity, setSeverity] = useState(3);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!selected || !user?.id) {
      Alert.alert('Hata', 'Belirti seç.');
      return;
    }

    setLoading(true);
    const { error } = await addSymptomLog({
      userId: user.id,
      symptomName: selected,
      severity,
      note,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    router.back();
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.chips}>
        {SYMPTOMS.map((symptom) => (
          <Chip key={symptom} label={symptom} selected={selected === symptom} onPress={() => setSelected(symptom)} />
        ))}
      </View>
      <RatingPicker label="Şiddet (0-5)" value={severity} onChange={setSeverity} max={5} />
      <Input label="Not (opsiyonel)" value={note} onChangeText={setNote} multiline placeholder="Ne yedikten sonra başladı?" />
      <FormActions onSave={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
