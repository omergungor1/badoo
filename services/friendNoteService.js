import { getDb } from '../lib/db';
import { logSupabaseError } from '../lib/networkLog';
import { FRIEND_CHAT_DURATION_HOURS, FRIEND_NOTE_DURATIONS } from '../constants/friends';

function buildExpiresAt(hours) {
  const expires = new Date();
  expires.setHours(expires.getHours() + hours);
  return expires.toISOString();
}

export async function sendFriendNote({
  senderId,
  receiverId,
  message,
  durationHours = FRIEND_CHAT_DURATION_HOURS,
  parentNoteId = null,
}) {
  const trimmed = message.trim();
  if (!trimmed) {
    return { data: null, error: { message: 'Not boş olamaz.' } };
  }

  const hours = durationHours || FRIEND_CHAT_DURATION_HOURS;
  const allowed = FRIEND_NOTE_DURATIONS.some((item) => item.hours === hours);
  if (!allowed) {
    return { data: null, error: { message: 'Geçersiz süre seçimi.' } };
  }

  const { data, error } = await getDb()
    .from('friend_notes')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      message: trimmed,
      duration_hours: hours,
      expires_at: buildExpiresAt(hours),
      parent_note_id: parentNoteId,
    })
    .select()
    .single();

  if (error) {
    logSupabaseError('sendFriendNote', error, { senderId, receiverId });
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getActiveNotesForUser(userId) {
  const now = new Date().toISOString();

  const { data, error } = await getDb()
    .from('friend_notes')
    .select('*')
    .eq('receiver_id', userId)
    .gt('expires_at', now)
    .order('created_at', { ascending: false });

  if (error) {
    logSupabaseError('getActiveNotesForUser', error, { userId });
    return { data: [], error };
  }

  const senderIds = [...new Set((data || []).map((note) => note.sender_id))];
  const { data: profiles } = await getDb()
    .from('profiles')
    .select('user_id, nickname, profile_image_thumb_url')
    .in('user_id', senderIds);

  const profileMap = (profiles || []).reduce((acc, profile) => {
    acc[profile.user_id] = profile;
    return acc;
  }, {});

  return {
    data: (data || []).map((note) => ({
      ...note,
      senderProfile: profileMap[note.sender_id] || null,
    })),
    error: null,
  };
}

export async function getFriendConversation(userId, friendId) {
  const now = new Date().toISOString();

  const { data, error } = await getDb()
    .from('friend_notes')
    .select('*')
    .gt('expires_at', now)
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`,
    )
    .order('created_at', { ascending: true });

  if (error) {
    logSupabaseError('getFriendConversation', error, { userId, friendId });
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

export async function markConversationRead(userId, friendId) {
  const now = new Date().toISOString();

  const { error } = await getDb()
    .from('friend_notes')
    .update({ read_at: new Date().toISOString() })
    .eq('receiver_id', userId)
    .eq('sender_id', friendId)
    .gt('expires_at', now)
    .is('read_at', null);

  if (error) {
    logSupabaseError('markConversationRead', error, { userId, friendId });
  }

  return { error };
}

export async function getActiveNotesFromFriend(receiverId, senderId) {
  const now = new Date().toISOString();

  const { data, error } = await getDb()
    .from('friend_notes')
    .select('*')
    .eq('receiver_id', receiverId)
    .eq('sender_id', senderId)
    .gt('expires_at', now)
    .order('created_at', { ascending: false });

  if (error) {
    logSupabaseError('getActiveNotesFromFriend', error, { receiverId, senderId });
  }

  return { data: data || [], error };
}

export async function markFriendNoteRead(noteId, userId) {
  const { data, error } = await getDb()
    .from('friend_notes')
    .update({ read_at: new Date().toISOString() })
    .eq('id', noteId)
    .eq('receiver_id', userId)
    .select()
    .single();

  if (error) {
    logSupabaseError('markFriendNoteRead', error, { noteId, userId });
  }

  return { data, error };
}

export function getNoteTimeLeft(expiresAt) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Süresi doldu';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours} sa ${minutes} dk`;
  return `${minutes} dk`;
}
