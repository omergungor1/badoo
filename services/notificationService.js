import { supabase } from '../lib/supabase';
import { getDb } from '../lib/db';
import { logSupabaseError } from '../lib/networkLog';
import { NOTIFICATION_TYPES } from '../constants/friends';

async function dispatchPushNotification({ userId, title, body, data = {} }) {
  try {
    const { error } = await supabase.functions.invoke('send-push-notification', {
      body: {
        userId,
        title,
        body,
        data,
      },
    });

    if (error && __DEV__) {
      console.warn('[push] edge function hatası:', error.message);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[push] gönderilemedi:', error?.message || error);
    }
  }
}

export async function createNotification({
  userId,
  senderId = null,
  type,
  title,
  body,
  payload = {},
  sendPush = true,
}) {
  const { data, error } = await getDb()
    .from('notifications')
    .insert({
      user_id: userId,
      sender_id: senderId,
      type,
      title,
      body,
      payload,
    })
    .select()
    .single();

  if (error) {
    logSupabaseError('createNotification', error, { userId, type });
    return { data: null, error };
  }

  if (sendPush) {
    await dispatchPushNotification({
      userId,
      title,
      body: body || title,
      data: {
        type,
        notificationId: data.id,
        senderId,
        ...payload,
      },
    });
  }

  return { data, error: null };
}

export function resolveNotificationRoute(notification) {
  const { type, sender_id: senderId, payload = {} } = notification;

  if (type === NOTIFICATION_TYPES.NOTE_REPLY) {
    if (senderId) {
      return `/friends/chat/${senderId}`;
    }

    const route = payload.route || '';
    const chatMatch = route.match(/^\/friends\/chat\/([^/]+)/);
    if (chatMatch) {
      return `/friends/chat/${chatMatch[1]}`;
    }

    const friendMatch = route.match(/^\/friends\/([^/]+)/);
    if (friendMatch && !['add', 'requests', 'chat'].includes(friendMatch[1])) {
      return `/friends/chat/${friendMatch[1]}`;
    }
  }

  return payload.route || null;
}

export async function getNotifications(userId, limit = 50) {
  const { data, error } = await getDb()
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    logSupabaseError('getNotifications', error, { userId });
  }

  return { data: data || [], error };
}

export async function getUnreadNotificationCount(userId) {
  const { count, error } = await getDb()
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) {
    logSupabaseError('getUnreadNotificationCount', error, { userId });
    return { count: 0, error };
  }

  return { count: count || 0, error: null };
}

export async function markNotificationRead(notificationId, userId) {
  const { data, error } = await getDb()
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    logSupabaseError('markNotificationRead', error, { notificationId, userId });
  }

  return { data, error };
}

export async function markAllNotificationsRead(userId) {
  const { error } = await getDb()
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) {
    logSupabaseError('markAllNotificationsRead', error, { userId });
  }

  return { error };
}

export async function notifyFriendRequest({ receiverId, senderId, senderName }) {
  return createNotification({
    userId: receiverId,
    senderId,
    type: NOTIFICATION_TYPES.FRIEND_REQUEST,
    title: 'Yeni arkadaşlık isteği',
    body: `${senderName} seninle arkadaş olmak istiyor`,
    payload: { route: '/friends/requests' },
  });
}

export async function notifyFriendAccepted({ receiverId, senderId, senderName }) {
  return createNotification({
    userId: receiverId,
    senderId,
    type: NOTIFICATION_TYPES.FRIEND_ACCEPTED,
    title: 'Arkadaşlık isteği kabul edildi',
    body: `${senderName} artık arkadaşın`,
    payload: { route: '/friends' },
  });
}

export async function notifyNudge({ receiverId, senderId, senderName }) {
  return createNotification({
    userId: receiverId,
    senderId,
    type: NOTIFICATION_TYPES.NUDGE,
    title: 'Dürtme geldi 👋',
    body: `${senderName} seni dürtüyor — halkalarını tamamla!`,
    payload: { route: '/(tabs)' },
  });
}

export async function notifyEphemeralNote({ receiverId, senderId, senderName, noteId }) {
  return createNotification({
    userId: receiverId,
    senderId,
    type: NOTIFICATION_TYPES.FRIEND_MESSAGE,
    title: 'Yeni mesajın var',
    body: `${senderName} sana mesaj gönderdi`,
    payload: { route: `/friends/chat/${senderId}`, noteId },
  });
}

export async function notifyNoteReply({ receiverId, senderId, senderName, noteId }) {
  return createNotification({
    userId: receiverId,
    senderId,
    type: NOTIFICATION_TYPES.NOTE_REPLY,
    title: 'Notuna cevap geldi',
    body: `${senderName} notuna yanıt verdi`,
    payload: { route: `/friends/chat/${senderId}`, noteId },
  });
}

export async function notifyFriendRingsCompleted({ receiverId, senderId, senderName }) {
  return createNotification({
    userId: receiverId,
    senderId,
    type: NOTIFICATION_TYPES.FRIEND_RINGS_COMPLETED,
    title: 'Arkadaşın halkalarını kapattı 🎉',
    body: `${senderName} bugünkü halkalarını tamamladı — sende bitir!`,
    payload: { route: '/(tabs)' },
  });
}

export { NOTIFICATION_TYPES };
