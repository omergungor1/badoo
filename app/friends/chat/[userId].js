import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FriendChatBubble from '../../../components/friends/FriendChatBubble';
import BackButton from '../../../components/ui/BackButton';
import { useAuth } from '../../../context/AuthContext';
import {
  getFriendConversation,
  markConversationRead,
  sendFriendNote,
} from '../../../services/friendNoteService';
import { getFriendProfile, getFriendshipBetween } from '../../../services/friendService';
import { getDisplayName } from '../../../utils/friendRings';
import { colors, radius, spacing, typography } from '../../../theme';

export default function FriendChatScreen() {
  const params = useLocalSearchParams();
  const friendId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const sendingRef = useRef(false);

  const [messages, setMessages] = useState([]);
  const [friendName, setFriendName] = useState('');
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const loadChat = useCallback(async () => {
    if (!user?.id || !friendId) return;

    const [{ data: relation }, { data: profile }] = await Promise.all([
      getFriendshipBetween(user.id, friendId),
      getFriendProfile(friendId),
    ]);

    if (relation?.status !== 'accepted') {
      setBlocked(true);
      setLoading(false);
      return;
    }

    setFriendName(getDisplayName(profile));
    setBlocked(false);

    const { data, error } = await getFriendConversation(user.id, friendId);
    if (error) {
      Alert.alert('Hata', 'Mesajlar yüklenemedi.');
    }

    setMessages(data || []);
    setLoading(false);
    await markConversationRead(user.id, friendId);
  }, [user?.id, friendId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadChat();
    }, [loadChat]),
  );

  async function handleSend() {
    const text = draft.trim();
    if (!text || sendingRef.current || !user?.id) return;

    sendingRef.current = true;
    setDraft('');
    setSending(true);

    const { data, error } = await sendFriendNote({
      senderId: user.id,
      receiverId: friendId,
      message: text,
    });

    sendingRef.current = false;
    setSending(false);

    if (error) {
      setDraft(text);
      Alert.alert('Hata', error.message);
      return;
    }

    setMessages((prev) => [...prev, data]);
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Mesaj</Text>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (blocked) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>Mesaj</Text>
        </View>
        <View style={styles.center}>
          <Text style={styles.blockedText}>Bu kullanıcıyla mesajlaşamazsın.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerCopy}>
          <Text style={styles.headerTitle}>{friendName}</Text>
          <Text style={styles.headerSubtitle}>Mesajlar 24 saat sonra kaybolur</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        {messages.length ? (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => (
              <FriendChatBubble
                message={item.message}
                isMine={item.sender_id === user.id}
                timestamp={item.created_at}
              />
            )}
          />
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Henüz mesaj yok</Text>
            <Text style={styles.emptyText}>İlk mesajı sen gönder — 24 saat görünür kalır.</Text>
          </View>
        )}

        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Mesaj yaz..."
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
            multiline
            maxLength={500}
            editable={!sending}
          />
          <Pressable
            onPress={handleSend}
            disabled={!draft.trim() || sending}
            style={({ pressed }) => [
              styles.sendBtn,
              (!draft.trim() || sending) && styles.sendBtnDisabled,
              pressed && draft.trim() && !sending && styles.sendBtnPressed,
            ]}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={colors.white} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCopy: { flex: 1, gap: 2 },
  headerTitle: { ...typography.headingMedium, color: colors.textPrimary },
  headerSubtitle: { ...typography.caption, color: colors.textSecondary },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  blockedText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: { ...typography.bodySemiBold, color: colors.textPrimary },
  emptyText: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 120,
    textAlignVertical: 'top',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendBtnPressed: {
    opacity: 0.85,
  },
});
