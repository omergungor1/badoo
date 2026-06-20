import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileAvatar from '../../components/profile/ProfileAvatar';
import ProfileImageViewer from '../../components/profile/ProfileImageViewer';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import {
  deleteProfileImage,
  pickProfileImage,
  uploadProfileImage,
} from '../../services/profileImageService';
import {
  getConditions,
  getGoals,
  getMedications,
  getSensitivities,
  updateProfile,
} from '../../services/profileService';
import { formatActivityValue, getActivityGoal } from '../../utils/activity';
import { formatWaterGoal } from '../../utils/water';
import { colors, radius, spacing, typography } from '../../theme';

const BIO_MAX = 150;
const NICKNAME_MAX = 30;

function StatItem({ value, label }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProfileMenuRow({ title, count, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
    >
      <Text style={styles.menuTitle}>{title}</Text>
      <View style={styles.menuRight}>
        {count != null ? <Text style={styles.menuCount}>{count}</Text> : null}
        <Text style={styles.menuChevron}>›</Text>
      </View>
    </Pressable>
  );
}

function defaultNickname(profile, user) {
  if (profile?.nickname?.trim()) return profile.nickname.trim();
  const emailPrefix = user?.email?.split('@')[0];
  return emailPrefix || 'kullanici';
}

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [sensitivities, setSensitivities] = useState([]);
  const [medications, setMedications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [savingText, setSavingText] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [localThumbUri, setLocalThumbUri] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  const displayNickname = defaultNickname(profile, user);

  useEffect(() => {
    setNickname(profile?.nickname || '');
    setBio(profile?.bio || '');
    setLocalThumbUri(null);
  }, [profile?.nickname, profile?.bio, profile?.profile_image_thumb_url]);

  const profileDirty = useMemo(() => {
    const currentNickname = profile?.nickname || '';
    const currentBio = profile?.bio || '';
    return nickname.trim() !== currentNickname || bio.trim() !== currentBio;
  }, [nickname, bio, profile?.nickname, profile?.bio]);

  const activityGoalLabel = useMemo(() => {
    const goal = getActivityGoal(profile);
    return formatActivityValue(goal.value, goal.type);
  }, [profile]);

  const thumbUri = localThumbUri || profile?.profile_image_thumb_url || null;
  const originalUri = profile?.profile_image_url || null;

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
      if (user?.id) refreshProfile(user.id);
    }, [loadProfileData, refreshProfile, user?.id]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([loadProfileData(), user?.id ? refreshProfile(user.id) : Promise.resolve()]);
    setRefreshing(false);
  }

  async function handleSaveText() {
    if (!user?.id) return;

    const trimmedNickname = nickname.trim();
    const trimmedBio = bio.trim();

    if (!trimmedNickname) {
      Alert.alert('Hata', 'Kullanıcı adı boş olamaz.');
      return;
    }

    if (trimmedNickname.length > NICKNAME_MAX) {
      Alert.alert('Hata', `Kullanıcı adı en fazla ${NICKNAME_MAX} karakter olabilir.`);
      return;
    }

    if (trimmedBio.length > BIO_MAX) {
      Alert.alert('Hata', `Biyografi en fazla ${BIO_MAX} karakter olabilir.`);
      return;
    }

    setSavingText(true);
    const { error } = await updateProfile(user.id, {
      nickname: trimmedNickname,
      bio: trimmedBio,
    });
    setSavingText(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    await refreshProfile(user.id);
  }

  async function handleUploadPhoto() {
    if (!user?.id || uploadingPhoto) return;

    const { uri, error: pickError } = await pickProfileImage();
    if (pickError) {
      Alert.alert('Hata', pickError.message);
      return;
    }
    if (!uri) return;

    setUploadingPhoto(true);
    setLocalThumbUri(uri);

    const { previewUri, error } = await uploadProfileImage(user.id, uri);
    setUploadingPhoto(false);

    if (error) {
      setLocalThumbUri(null);
      Alert.alert('Hata', error.message);
      return;
    }

    setLocalThumbUri(previewUri || uri);
    await refreshProfile(user.id);
  }

  async function handleDeletePhoto() {
    if (!user?.id || uploadingPhoto) return;

    setUploadingPhoto(true);
    const { error } = await deleteProfileImage(user.id);
    setUploadingPhoto(false);

    if (error) {
      Alert.alert('Hata', error.message);
      return;
    }

    setLocalThumbUri(null);
    setViewerOpen(false);
    await refreshProfile(user.id);
  }

  function confirmDeletePhoto() {
    Alert.alert(
      'Profil fotoğrafını sil',
      'Profil fotoğrafını kaldırmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: handleDeletePhoto },
      ],
    );
  }

  function handleAvatarPress() {
    if (originalUri) {
      setViewerOpen(true);
      return;
    }
    handleUploadPhoto();
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={styles.topBar}>
          <Text style={styles.topUsername}>{displayNickname}</Text>
          <Pressable onPress={() => router.push('/edit-profile')} hitSlop={8}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </Pressable>
        </View>

        <View style={styles.profileRow}>
          <ProfileAvatar
            thumbUri={thumbUri}
            uploading={uploadingPhoto}
            onPress={handleAvatarPress}
          />

          <View style={styles.statsRow}>
            <StatItem value={goals.length} label="Hedef" />
            <StatItem value={conditions.length} label="Hastalık" />
            <StatItem value={medications.length} label="İlaç" />
          </View>
        </View>

        <View style={styles.identityBlock}>
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="Kullanıcı adı"
            placeholderTextColor={colors.textSecondary}
            maxLength={NICKNAME_MAX}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.nicknameInput}
          />

          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Biyografi yaz..."
            placeholderTextColor={colors.textSecondary}
            maxLength={BIO_MAX}
            multiline
            style={styles.bioInput}
          />
          <Text style={styles.bioCount}>{bio.length}/{BIO_MAX}</Text>

          {profileDirty ? (
            <Pressable
              onPress={handleSaveText}
              disabled={savingText}
              style={({ pressed }) => [styles.saveTextBtn, pressed && styles.saveTextBtnPressed]}
            >
              <Text style={styles.saveTextLabel}>{savingText ? 'Kaydediliyor...' : 'Kaydet'}</Text>
            </Pressable>
          ) : null}

          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Pressable
          onPress={() => router.push('/edit-profile')}
          style={({ pressed }) => [styles.editProfileBtn, pressed && styles.editProfileBtnPressed]}
        >
          <Text style={styles.editProfileText}>Profili Düzenle</Text>
        </Pressable>

        <View style={styles.metaCard}>
          <Text style={styles.metaLine}>
            {profile?.height || '-'} cm · {profile?.weight || '-'} kg · {profile?.birth_year || '-'}
          </Text>
          <Text style={styles.metaLine}>
            {profile?.daily_calorie_goal || '-'} kcal · {profile?.daily_protein_goal || '-'} g protein · {formatWaterGoal(profile?.daily_water_goal)} · {activityGoalLabel} aktivite
          </Text>
        </View>

        <View style={styles.menuSection}>
          <ProfileMenuRow title="İstatistikler" onPress={() => router.push('/stats')} />
          <ProfileMenuRow title="Hedefler" count={goals.length} onPress={() => router.push('/goals')} />
          <ProfileMenuRow title="Hastalıklar" count={conditions.length} onPress={() => router.push('/conditions')} />
          <ProfileMenuRow
            title="Besin Hassasiyetleri"
            count={sensitivities.length}
            onPress={() => router.push('/sensitivities')}
          />
          <ProfileMenuRow title="İlaçlar" count={medications.length} onPress={() => router.push('/medications')} />
          <ProfileMenuRow title="Yemek & İçecek Listesi" onPress={() => router.push('/foods')} />
        </View>

        <Button title="Çıkış Yap" variant="outline" onPress={handleSignOut} />
      </ScrollView>

      <ProfileImageViewer
        visible={viewerOpen}
        imageUri={originalUri}
        onClose={() => setViewerOpen(false)}
        onUpload={handleUploadPhoto}
        onDelete={confirmDeletePhoto}
        uploading={uploadingPhoto}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  content: {
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  topUsername: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 18,
  },
  settingsIcon: {
    fontSize: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 18,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  identityBlock: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  nicknameInput: {
    ...typography.bodySemiBold,
    color: colors.textPrimary,
    padding: 0,
  },
  bioInput: {
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 48,
    textAlignVertical: 'top',
    padding: 0,
  },
  bioCount: {
    ...typography.caption,
    color: colors.textSecondary,
    alignSelf: 'flex-end',
  },
  saveTextBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
  },
  saveTextBtnPressed: {
    opacity: 0.85,
  },
  saveTextLabel: {
    ...typography.bodySmall,
    color: colors.white,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  email: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  editProfileBtn: {
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  editProfileBtnPressed: {
    backgroundColor: colors.background,
  },
  editProfileText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  metaCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
  },
  metaLine: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  menuSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  menuRowPressed: {
    backgroundColor: colors.background,
  },
  menuTitle: {
    ...typography.body,
    color: colors.textPrimary,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 22,
  },
  menuCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  menuChevron: {
    color: colors.textSecondary,
    fontSize: 22,
    lineHeight: 22,
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginTop: -1,
  },
});
