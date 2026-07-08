import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileInviteCard from '../../components/profile/ProfileInviteCard';
import ProfileSection, { profilePageColors } from '../../components/profile/ProfileSection';
import ProfileSettingRow from '../../components/profile/ProfileSettingRow';
import ProfileUserCard from '../../components/profile/ProfileUserCard';
import ProfileWidgetsSection from '../../components/profile/ProfileWidgetsSection';
import Toast from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import { isAppleHealthSupported, requestAppleHealthPermissions } from '../../lib/appleHealth';
import {
  getConditions,
  getGoals,
  getMedications,
  getSensitivities,
} from '../../services/profileService';
import {
  getFriends,
  getIncomingFriendRequests,
} from '../../services/friendService';
import { getUnreadNotificationCount } from '../../services/notificationService';
import { colors, spacing, typography } from '../../theme';

const COMING_SOON_MESSAGE = 'Bu özellik daha sonra eklenecektir.';

function defaultNickname(profile, user) {
  if (profile?.nickname?.trim()) return profile.nickname.trim();
  const emailPrefix = user?.email?.split('@')[0];
  return emailPrefix || 'kullanici';
}

function buildHandle(nickname) {
  const slug = nickname
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 24);
  return `@${slug || 'kullanici'}`;
}

function formatSyncTime(date) {
  if (!date) return 'Henüz senkronize edilmedi';
  return date.toLocaleTimeString('tr-TR', { hour: 'numeric', minute: '2-digit' });
}

export default function ProfileScreen() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const router = useRouter();
  const [goals, setGoals] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [sensitivities, setSensitivities] = useState([]);
  const [medications, setMedications] = useState([]);
  const [friendCount, setFriendCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);
  const [appleHealthConnected, setAppleHealthConnected] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const displayNickname = defaultNickname(profile, user);
  const displayHandle = buildHandle(displayNickname);
  const thumbUri = profile?.profile_image_thumb_url || null;

  const hideToast = useCallback(() => setToastMessage(null), []);
  const showComingSoon = useCallback(() => setToastMessage(COMING_SOON_MESSAGE), []);

  const loadProfileData = useCallback(async () => {
    if (!user?.id) return;

    const [g, c, s, m, friends, requests, notifications] = await Promise.all([
      getGoals(user.id),
      getConditions(user.id),
      getSensitivities(user.id),
      getMedications(user.id),
      getFriends(user.id),
      getIncomingFriendRequests(user.id),
      getUnreadNotificationCount(user.id),
    ]);

    setGoals(g.data || []);
    setConditions(c.data || []);
    setSensitivities(s.data || []);
    setMedications(m.data || []);
    setFriendCount(friends.data?.length || 0);
    setRequestCount(requests.data?.length || 0);
    setNotificationCount(notifications.count || 0);
    setLastSyncedAt(new Date());
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
      if (user?.id) refreshProfile(user.id);
      setAppleHealthConnected(isAppleHealthSupported());
    }, [loadProfileData, refreshProfile, user?.id]),
  );

  async function onRefresh() {
    setRefreshing(true);
    await Promise.all([loadProfileData(), user?.id ? refreshProfile(user.id) : Promise.resolve()]);
    setRefreshing(false);
  }

  const handleAppleHealthPress = useCallback(async () => {
    if (Platform.OS !== 'ios' || !isAppleHealthSupported()) {
      showComingSoon();
      return;
    }

    const result = await requestAppleHealthPermissions();
    setAppleHealthConnected(result.granted || isAppleHealthSupported());

    if (!result.granted) {
      setToastMessage('Apple Health bağlantısı kurulamadı.');
      return;
    }

    setToastMessage('Apple Health bağlandı.');
  }, [showComingSoon]);

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

  const accountRows = useMemo(
    () => [
      { key: 'personal', icon: 'card-outline', title: 'Kişisel Bilgiler', onPress: () => router.push('/edit-profile') },
      { key: 'notifications', icon: 'notifications-outline', title: 'Bildirimler', onPress: () => router.push('/notifications'), rightText: notificationCount > 0 ? String(notificationCount) : null },
      { key: 'preferences', icon: 'options-outline', title: 'Tercihler', onPress: showComingSoon },
      { key: 'language', icon: 'language-outline', title: 'Dil', onPress: showComingSoon },
    ],
    [notificationCount, router, showComingSoon],
  );

  const goalsRows = useMemo(
    () => [
      {
        key: 'apple-health',
        icon: 'heart-outline',
        title: 'Apple Health',
        onPress: handleAppleHealthPress,
        rightText: appleHealthConnected ? 'Bağlı' : null,
        rightIcon: appleHealthConnected ? 'checkmark-circle' : null,
        showChevron: !appleHealthConnected,
      },
      { key: 'nutrition', icon: 'nutrition-outline', title: 'Beslenme Hedefleri', onPress: () => router.push('/edit-profile') },
      { key: 'goals', icon: 'flag-outline', title: 'Hedefler ve güncel kilo', onPress: () => router.push('/goals'), rightText: goals.length > 0 ? String(goals.length) : null },
      { key: 'reminders', icon: 'alarm-outline', title: 'Takip Hatırlatıcıları', onPress: showComingSoon },
      { key: 'stats', icon: 'stats-chart-outline', title: 'İstatistikler', onPress: () => router.push('/stats') },
      { key: 'weight-history', icon: 'time-outline', title: 'Kilo Geçmişi', onPress: showComingSoon },
      { key: 'rings', icon: 'ellipse-outline', title: 'Aktivite Halkaları', onPress: showComingSoon },
      { key: 'foods', icon: 'restaurant-outline', title: 'Yemek & İçecek Listesi', onPress: () => router.push('/foods') },
      { key: 'conditions', icon: 'medkit-outline', title: 'Hastalıklar', onPress: () => router.push('/conditions'), rightText: conditions.length > 0 ? String(conditions.length) : null },
      { key: 'medications', icon: 'medical-outline', title: 'İlaçlar', onPress: () => router.push('/medications'), rightText: medications.length > 0 ? String(medications.length) : null },
      { key: 'sensitivities', icon: 'leaf-outline', title: 'Besin Hassasiyetleri', onPress: () => router.push('/sensitivities'), rightText: sensitivities.length > 0 ? String(sensitivities.length) : null },
    ],
    [
      appleHealthConnected,
      conditions.length,
      goals.length,
      handleAppleHealthPress,
      medications.length,
      router,
      sensitivities.length,
      showComingSoon,
    ],
  );

  const socialRows = useMemo(
    () => [
      { key: 'friends', icon: 'people-outline', title: 'Arkadaşlarım', onPress: () => router.push('/friends'), rightText: friendCount > 0 ? String(friendCount) : null },
      { key: 'requests', icon: 'mail-unread-outline', title: 'Gelen İstekler', onPress: () => router.push('/friends/requests'), rightText: requestCount > 0 ? String(requestCount) : null },
    ],
    [friendCount, requestCount, router],
  );

  const supportRows = useMemo(
    () => [
      { key: 'feature', icon: 'megaphone-outline', title: 'Özellik Öner', onPress: showComingSoon },
      { key: 'support', icon: 'mail-outline', title: 'Destek E-postası', onPress: showComingSoon },
      { key: 'export', icon: 'document-text-outline', title: 'PDF Özet Raporu', onPress: showComingSoon },
      { key: 'sync', icon: 'refresh-outline', title: 'Veri Senkronizasyonu', onPress: onRefresh, rightText: `Son: ${formatSyncTime(lastSyncedAt)}` },
      { key: 'terms', icon: 'document-outline', title: 'Kullanım Şartları', onPress: showComingSoon },
      { key: 'privacy', icon: 'shield-checkmark-outline', title: 'Gizlilik Politikası', onPress: showComingSoon },
    ],
    [lastSyncedAt, showComingSoon],
  );

  const followRows = useMemo(
    () => [
      { key: 'instagram', icon: 'logo-instagram', title: 'Instagram', onPress: showComingSoon },
      { key: 'tiktok', icon: 'logo-tiktok', title: 'TikTok', onPress: showComingSoon },
      { key: 'x', icon: 'logo-twitter', title: 'X', onPress: showComingSoon },
    ],
    [showComingSoon],
  );

  function renderRows(rows) {
    return rows.map((row, index) => (
      <ProfileSettingRow
        key={row.key}
        icon={row.icon}
        title={row.title}
        onPress={row.onPress}
        rightText={row.rightText}
        rightIcon={row.rightIcon}
        showChevron={row.showChevron ?? true}
        isLast={index === rows.length - 1}
      />
    ));
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={styles.pageTitle}>Profil</Text>

        <ProfileUserCard
          name={displayNickname}
          handle={displayHandle}
          avatarUrl={thumbUri}
          onPress={() => router.push('/edit-profile')}
        />

        <View style={styles.block}>
          <Text style={styles.sectionTitle}>Arkadaş Davet</Text>
          <ProfileInviteCard onPress={() => router.push('/friends/add')} />
        </View>

        <View style={styles.block}>
          <ProfileSection title="Sosyal">
            {renderRows(socialRows)}
          </ProfileSection>
        </View>

        <View style={styles.block}>
          <ProfileSection title="Hesap">
            {renderRows(accountRows)}
          </ProfileSection>
        </View>

        <View style={styles.block}>
          <ProfileSection title="Hedefler & Takip">
            {renderRows(goalsRows)}
          </ProfileSection>
        </View>

        <View style={styles.block}>
          <ProfileWidgetsSection profile={profile} />
        </View>

        <View style={styles.block}>
          <ProfileSection title="Destek & Yasal">
            {renderRows(supportRows)}
          </ProfileSection>
        </View>

        <View style={styles.block}>
          <ProfileSection title="Bizi Takip Edin">
            {renderRows(followRows)}
          </ProfileSection>
        </View>

        <View style={styles.block}>
          <ProfileSection title="Hesap İşlemleri">
            <ProfileSettingRow
              icon="log-out-outline"
              title="Çıkış Yap"
              onPress={handleSignOut}
              isLast={false}
            />
            <ProfileSettingRow
              icon="person-remove-outline"
              title="Hesabı Sil"
              onPress={showComingSoon}
              destructive
              isLast
            />
          </ProfileSection>
        </View>
      </ScrollView>

      <Toast message={toastMessage} onHide={hideToast} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: profilePageColors.background,
  },
  content: {
    paddingBottom: 120,
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  pageTitle: {
    ...typography.h2,
    fontSize: 34,
    lineHeight: 40,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  block: {
    gap: spacing.xs,
  },
  sectionTitle: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: profilePageColors.sectionTitle,
    paddingHorizontal: spacing.lg,
    marginBottom: 2,
  },
});
