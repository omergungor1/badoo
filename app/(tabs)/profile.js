import { useCallback, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import {
  getConditions,
  getGoals,
  getMedications,
  getSensitivities,
} from '../../services/profileService';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import SectionTitle from '../../components/ui/SectionTitle';
import { GENDERS } from '../../constants/onboarding';
import { formatWaterGoal } from '../../utils/water';
import { colors, spacing, typography } from '../../theme';

function genderLabel(value) {
  return GENDERS.find((g) => g.value === value)?.label || value || '-';
}

function ChipList({ items, labelKey = 'goal_name' }) {
  if (!items?.length) {
    return <Text style={styles.empty}>Kayıt yok</Text>;
  }

  return (
    <View style={styles.chips}>
      {items.map((item) => (
        <View key={item.id} style={styles.chip}>
          <Text style={styles.chipText}>{item[labelKey]}</Text>
        </View>
      ))}
    </View>
  );
}

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [sensitivities, setSensitivities] = useState([]);
  const [medications, setMedications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadProfileData = useCallback(async () => {
    if (!user?.id) return;

    const [g, c, s, m] = await Promise.all([
      getGoals(user.id),
      getConditions(user.id),
      getSensitivities(user.id),
      getMedications(user.id),
    ]);

    setGoals(g.data || []);
    setConditions(c.data || []);
    setSensitivities(s.data || []);
    setMedications(m.data || []);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
  }

  function handleSignOut() {
    Alert.alert(
      'Emin misiniz?',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/login');
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <SectionTitle title="Profil" subtitle={user?.email} />

        <Pressable onPress={() => router.push('/edit-profile')}>
          <Card>
            <Text style={styles.row}>Boy: {profile?.height || '-'} cm</Text>
            <Text style={styles.row}>Kilo: {profile?.weight || '-'} kg</Text>
            <Text style={styles.row}>Doğum Yılı: {profile?.birth_year || '-'}</Text>
            <Text style={styles.row}>Cinsiyet: {genderLabel(profile?.gender)}</Text>
            <Text style={styles.row}>Günlük Kalori Hedefi: {profile?.daily_calorie_goal || '-'} kcal</Text>
            <Text style={styles.row}>Günlük Protein Hedefi: {profile?.daily_protein_goal || '-'} g</Text>
            <Text style={styles.row}>Günlük Su Hedefi: {formatWaterGoal(profile?.daily_water_goal)}</Text>
          </Card>
        </Pressable>

        <SectionTitle title="Hedefler" subtitle="Yönetmek için dokunun" />
        <Pressable onPress={() => router.push('/goals')}>
          <Card>
            <ChipList items={goals} labelKey="goal_name" />
          </Card>
        </Pressable>

        <SectionTitle title="Hastalıklar" subtitle="Yönetmek için dokunun" />
        <Pressable onPress={() => router.push('/conditions')}>
          <Card>
            <ChipList items={conditions} labelKey="condition_name" />
          </Card>
        </Pressable>

        <SectionTitle title="Besin Hassasiyetleri" subtitle="Yönetmek için dokunun" />
        <Pressable onPress={() => router.push('/sensitivities')}>
          <Card>
            <ChipList items={sensitivities} labelKey="sensitivity_name" />
          </Card>
        </Pressable>

        <SectionTitle title="İlaçlar" subtitle="Yönetmek için dokunun" />
        <Pressable onPress={() => router.push('/medications')}>
          <Card>
            <ChipList items={medications} labelKey="medication_name" />
          </Card>
        </Pressable>

        <SectionTitle title="Yemek & İçecek Listesi" subtitle="Yönetmek için dokunun" />
        <Pressable onPress={() => router.push('/foods')}>
          <Card>
            <Text style={styles.row}>Yemek ve içecek kataloğuna yeni besin ekleyin.</Text>
          </Card>
        </Pressable>

        <Button title="Çıkış Yap" variant="outline" onPress={handleSignOut} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  row: { ...typography.body, color: colors.textPrimary, marginBottom: 6 },
  tapHint: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
    fontFamily: typography.bodyBold.fontFamily,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: { ...typography.bodySmall, color: colors.textPrimary },
  empty: { ...typography.body, color: colors.textSecondary },
});
