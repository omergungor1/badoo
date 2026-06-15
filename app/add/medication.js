import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { getMedications } from '../../services/profileService';
import { addMedicationLog } from '../../services/logService';
import FormActions from '../../components/ui/FormActions';
import Chip from '../../components/ui/Chip';
import Input from '../../components/ui/Input';
import { spacing } from '../../theme';

export default function AddMedicationScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [medications, setMedications] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [dose, setDose] = useState('1 tablet');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    getMedications(user.id).then(({ data }) => setMedications(data || []));
  }, [user?.id]);

  async function handleSave() {
    if (!selectedId || !user?.id) {
      Alert.alert('Hata', 'İlaç seç.');
      return;
    }

    setLoading(true);
    const { error } = await addMedicationLog({
      userId: user.id,
      medicationId: selectedId,
      dose,
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
        {medications.map((med) => (
          <Chip
            key={med.id}
            label={med.medication_name}
            selected={selectedId === med.id}
            onPress={() => setSelectedId(med.id)}
          />
        ))}
      </View>
      <Input label="Doz" value={dose} onChangeText={setDose} placeholder="1 tablet, 5 ml..." />
      <FormActions onSave={handleSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
