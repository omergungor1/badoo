import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import BackButton from '../../components/ui/BackButton';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { getFriendshipBetween, searchProfiles, sendFriendRequest } from '../../services/friendService';
import { getDisplayName } from '../../utils/friendRings';
import { colors, radius, spacing, typography } from '../../theme';

export default function AddFriendScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(text) {
    setQuery(text);
    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const { data } = await searchProfiles(text, user.id);
    setResults(data || []);
    setLoading(false);
  }

  async function handleSendRequest(targetUserId) {
    const { data: existing } = await getFriendshipBetween(user.id, targetUserId);

    if (existing?.status === 'accepted') {
      Alert.alert('Bilgi', 'Zaten arkadaşsınız.');
      router.push(`/friends/${targetUserId}`);
      return;
    }

    if (existing?.status === 'pending') {
      Alert.alert('Bilgi', 'Bekleyen bir istek zaten var.');
      return;
    }

    const { error } = await sendFriendRequest(user.id, targetUserId);
    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    Alert.alert('Gönderildi', 'Arkadaşlık isteği gönderildi.');
    setResults((prev) => prev.filter((item) => item.user_id !== targetUserId));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Arkadaş Ekle</Text>
      </View>

      <View style={styles.content}>
        <Input
          label="Kullanıcı ara"
          value={query}
          onChangeText={handleSearch}
          placeholder="Takma ad ile ara..."
        />
        <Text style={styles.helper}>
          {loading ? 'Aranıyor...' : 'En az 2 karakter yaz'}
        </Text>

        <FlatList
          data={results}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.profile_image_thumb_url ? (
                <Image source={{ uri: item.profile_image_thumb_url }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text>👤</Text>
                </View>
              )}

              <View style={styles.copy}>
                <Text style={styles.name}>{getDisplayName(item)}</Text>
                {item.bio ? <Text style={styles.bio} numberOfLines={1}>{item.bio}</Text> : null}
              </View>

              <Pressable onPress={() => handleSendRequest(item.user_id)} style={styles.addBtn}>
                <Text style={styles.addText}>İstek Gönder</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            query.trim().length >= 2 && !loading ? (
              <Text style={styles.empty}>Sonuç bulunamadı.</Text>
            ) : null
          }
        />
      </View>
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
  headerTitle: { ...typography.headingMedium, color: colors.textPrimary, flex: 1 },
  content: { flex: 1, padding: spacing.lg, gap: spacing.sm },
  helper: { ...typography.caption, color: colors.textSecondary },
  list: { gap: spacing.sm, paddingTop: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 2 },
  name: { ...typography.bodySemiBold, color: colors.textPrimary },
  bio: { ...typography.caption, color: colors.textSecondary },
  addBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  addText: {
    ...typography.caption,
    color: colors.primary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.lg },
});
