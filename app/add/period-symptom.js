import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { addPeriodSymptoms, getPeriodSymptomOptions } from '../../services/periodService';
import Chip from '../../components/ui/Chip';
import FormActions from '../../components/ui/FormActions';
import Input from '../../components/ui/Input';
import SectionTitle from '../../components/ui/SectionTitle';
import { spacing } from '../../theme';

export default function PeriodSymptomScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [options, setOptions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPeriodSymptomOptions().then(({ data }) => setOptions(data || []));
  }, []);

  function toggleSymptom(symptomId) {
    setSelectedIds((current) =>
      current.includes(symptomId)
        ? current.filter((id) => id !== symptomId)
        : [...current, symptomId],
    );
  }

  async function handleSave() {
    if (!user?.id || !selectedIds.length) {
      Alert.alert('Hata', 'En az bir semptom seçin.');
      return;
    }

    setLoading(true);
    const { error } = await addPeriodSymptoms(user.id, selectedIds, note);
    setLoading(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    router.back();
  }

  const saveTitle = selectedIds.length > 1
    ? `${selectedIds.length} Semptom Kaydet`
    : 'Kaydet';

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <SectionTitle
        title="Regl Semptomu"
        subtitle="Birden fazla belirti seçebilirsin"
      />
      <View style={styles.chips}>
        {options.map((option) => (
          <Chip
            key={option.id}
            label={option.symptom_name}
            selected={selectedIds.includes(option.id)}
            onPress={() => toggleSymptom(option.id)}
          />
        ))}
      </View>
      <Input
        label="Ek not (opsiyonel)"
        value={note}
        onChangeText={setNote}
        multiline
        placeholder="Örn. hafif kramp, akşam arttı"
      />
      <FormActions saveTitle={saveTitle} onSave={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
