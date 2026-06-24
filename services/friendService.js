import { getDb } from '../lib/db';
import { logSupabaseError } from '../lib/networkLog';
import { MAX_DAILY_NUDGES_PER_FRIEND } from '../constants/friends';
import {
  notifyFriendAccepted,
  notifyFriendRequest,
  notifyFriendRingsCompleted,
  notifyNudge,
} from './notificationService';
import { getLogsForDate } from './logService';
import { toISODate } from '../utils/date';
import { buildNutritionRings, getDisplayName } from '../utils/friendRings';

const PROFILE_FIELDS = 'user_id, nickname, bio, profile_image_url, profile_image_thumb_url, daily_calorie_goal, daily_protein_goal, daily_water_goal, daily_activity_goal, daily_activity_goal_type';

function getFriendUserId(row, currentUserId) {
  return row.requester_id === currentUserId ? row.addressee_id : row.requester_id;
}

async function getProfileMap(userIds) {
  if (!userIds.length) return {};

  const { data, error } = await getDb()
    .from('profiles')
    .select(PROFILE_FIELDS)
    .in('user_id', userIds);

  if (error) {
    logSupabaseError('getProfileMap', error, { userIds });
    return {};
  }

  return (data || []).reduce((acc, profile) => {
    acc[profile.user_id] = profile;
    return acc;
  }, {});
}

export async function searchProfiles(query, currentUserId) {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return { data: [], error: null };
  }

  const { data, error } = await getDb()
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('onboarding_completed', true)
    .neq('user_id', currentUserId)
    .ilike('nickname', `%${trimmed}%`)
    .limit(20);

  if (error) {
    logSupabaseError('searchProfiles', error, { query: trimmed });
  }

  return { data: data || [], error };
}

export async function getFriendshipBetween(userId, otherUserId) {
  const { data, error } = await getDb()
    .from('friendships')
    .select('*')
    .or(
      `and(requester_id.eq.${userId},addressee_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},addressee_id.eq.${userId})`,
    )
    .maybeSingle();

  if (error) {
    logSupabaseError('getFriendshipBetween', error, { userId, otherUserId });
  }

  return { data, error };
}

export async function sendFriendRequest(requesterId, addresseeId) {
  if (requesterId === addresseeId) {
    return { data: null, error: { message: 'Kendine istek gönderemezsin.' } };
  }

  const existing = await getFriendshipBetween(requesterId, addresseeId);
  if (existing.data) {
    if (existing.data.status === 'accepted') {
      return { data: null, error: { message: 'Zaten arkadaşsınız.' } };
    }
    if (existing.data.status === 'pending') {
      return { data: null, error: { message: 'Bekleyen bir istek zaten var.' } };
    }
    if (existing.data.status === 'rejected') {
      const { data, error } = await getDb()
        .from('friendships')
        .update({
          requester_id: requesterId,
          addressee_id: addresseeId,
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.data.id)
        .select()
        .single();

      if (error) {
        logSupabaseError('sendFriendRequest.retry', error, { requesterId, addresseeId });
        return { data: null, error };
      }

      const profiles = await getProfileMap([requesterId]);
      const senderName = getDisplayName(profiles[requesterId]);
      await notifyFriendRequest({
        receiverId: addresseeId,
        senderId: requesterId,
        senderName,
      });

      return { data, error: null };
    }
  }

  const { data, error } = await getDb()
    .from('friendships')
    .insert({
      requester_id: requesterId,
      addressee_id: addresseeId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    logSupabaseError('sendFriendRequest', error, { requesterId, addresseeId });
    return { data: null, error };
  }

  const profiles = await getProfileMap([requesterId]);
  const senderName = getDisplayName(profiles[requesterId]);
  await notifyFriendRequest({
    receiverId: addresseeId,
    senderId: requesterId,
    senderName,
  });

  return { data, error: null };
}

export async function respondFriendRequest({ friendshipId, userId, accept }) {
  const { data: friendship, error: fetchError } = await getDb()
    .from('friendships')
    .select('*')
    .eq('id', friendshipId)
    .eq('addressee_id', userId)
    .eq('status', 'pending')
    .maybeSingle();

  if (fetchError || !friendship) {
    return { data: null, error: fetchError || { message: 'İstek bulunamadı.' } };
  }

  const { data, error } = await getDb()
    .from('friendships')
    .update({
      status: accept ? 'accepted' : 'rejected',
      updated_at: new Date().toISOString(),
    })
    .eq('id', friendshipId)
    .select()
    .single();

  if (error) {
    logSupabaseError('respondFriendRequest', error, { friendshipId, accept });
    return { data: null, error };
  }

  if (accept) {
    const profiles = await getProfileMap([userId]);
    const senderName = getDisplayName(profiles[userId]);
    await notifyFriendAccepted({
      receiverId: friendship.requester_id,
      senderId: userId,
      senderName,
    });
  }

  return { data, error: null };
}

export async function getIncomingFriendRequests(userId) {
  const { data, error } = await getDb()
    .from('friendships')
    .select('*')
    .eq('addressee_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    logSupabaseError('getIncomingFriendRequests', error, { userId });
    return { data: [], error };
  }

  const profileMap = await getProfileMap((data || []).map((row) => row.requester_id));

  return {
    data: (data || []).map((row) => ({
      ...row,
      profile: profileMap[row.requester_id] || null,
    })),
    error: null,
  };
}

export async function getFriends(userId) {
  const { data, error } = await getDb()
    .from('friendships')
    .select('*')
    .eq('status', 'accepted')
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    logSupabaseError('getFriends', error, { userId });
    return { data: [], error };
  }

  const friendIds = (data || []).map((row) => getFriendUserId(row, userId));
  const profileMap = await getProfileMap(friendIds);

  return {
    data: (data || []).map((row) => {
      const friendId = getFriendUserId(row, userId);
      return {
        ...row,
        friendId,
        profile: profileMap[friendId] || null,
      };
    }),
    error: null,
  };
}

export async function getFriendProfile(friendUserId) {
  const { data, error } = await getDb()
    .from('profiles')
    .select(PROFILE_FIELDS)
    .eq('user_id', friendUserId)
    .maybeSingle();

  if (error) {
    logSupabaseError('getFriendProfile', error, { friendUserId });
  }

  return { data, error };
}

export async function getFriendDailyRings(friendUserId, date = toISODate()) {
  const { data: profile, error: profileError } = await getFriendProfile(friendUserId);
  if (profileError || !profile) {
    return { data: null, error: profileError || { message: 'Profil bulunamadı.' } };
  }

  const logs = await getLogsForDate(friendUserId, date);
  const ringData = buildNutritionRings(
    profile,
    logs.foodLogs,
    logs.waterLogs,
    logs.activityLogs,
  );

  return {
    data: {
      profile,
      ...ringData,
    },
    error: null,
  };
}

export async function getFriendDailyIntake(currentUserId, friendUserId, date = toISODate()) {
  const friendship = await getFriendshipBetween(currentUserId, friendUserId);
  if (!friendship.data || friendship.data.status !== 'accepted') {
    return { data: null, error: { message: 'Bu veriye erişemezsin.' } };
  }

  const start = `${date}T00:00:00.000Z`;
  const end = `${date}T23:59:59.999Z`;

  const [logs, drinkResult] = await Promise.all([
    getLogsForDate(friendUserId, date),
    getDb()
      .from('drink_logs')
      .select('*')
      .eq('user_id', friendUserId)
      .gte('timestamp', start)
      .lte('timestamp', end),
  ]);

  if (drinkResult.error) {
    logSupabaseError('getFriendDailyIntake.drink', drinkResult.error, { friendUserId, date });
  }

  const items = [
    ...(logs.foodLogs || []).map((item) => ({ ...item, intakeType: 'food', sortTime: item.timestamp })),
    ...(logs.waterLogs || []).map((item) => ({ ...item, intakeType: 'water', sortTime: item.timestamp })),
    ...(drinkResult.data || []).map((item) => ({ ...item, intakeType: 'drink', sortTime: item.timestamp })),
  ].sort((a, b) => new Date(b.sortTime) - new Date(a.sortTime));

  return { data: items, error: null };
}

export async function getFriendsWithRings(userId, date = toISODate()) {
  const { data: friends, error } = await getFriends(userId);
  if (error || !friends.length) {
    return { data: [], error };
  }

  const enriched = await Promise.all(
    friends.map(async (friend) => {
      const ringsResult = await getFriendDailyRings(friend.friendId, date);
      return {
        ...friend,
        rings: ringsResult.data?.rings || [],
        ringAverage: ringsResult.data?.average || 0,
        allRingsClosed: ringsResult.data?.allClosed || false,
      };
    }),
  );

  return { data: enriched, error: null };
}

export async function sendNudge(senderId, receiverId) {
  const friendship = await getFriendshipBetween(senderId, receiverId);
  if (!friendship.data || friendship.data.status !== 'accepted') {
    return { data: null, error: { message: 'Sadece arkadaşlarını dürtebilirsin.' } };
  }

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const { count, error: countError } = await getDb()
    .from('friend_nudges')
    .select('id', { count: 'exact', head: true })
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId)
    .gte('created_at', start.toISOString());

  if (countError) {
    logSupabaseError('sendNudge.count', countError, { senderId, receiverId });
  }

  if ((count || 0) >= MAX_DAILY_NUDGES_PER_FRIEND) {
    return { data: null, error: { message: 'Bugün bu arkadaşa en fazla 3 dürtme gönderebilirsin.' } };
  }

  const { data, error } = await getDb()
    .from('friend_nudges')
    .insert({ sender_id: senderId, receiver_id: receiverId })
    .select()
    .single();

  if (error) {
    logSupabaseError('sendNudge', error, { senderId, receiverId });
    return { data: null, error };
  }

  const profiles = await getProfileMap([senderId]);
  const senderName = getDisplayName(profiles[senderId]);
  await notifyNudge({ receiverId, senderId, senderName });

  return { data, error: null };
}

export async function maybeNotifyFriendRingsCompleted(viewerId, friendId) {
  const ringsResult = await getFriendDailyRings(friendId);
  if (!ringsResult.data?.allClosed) return;

  const profiles = await getProfileMap([friendId]);
  const senderName = getDisplayName(profiles[friendId]);
  await notifyFriendRingsCompleted({
    receiverId: viewerId,
    senderId: friendId,
    senderName,
  });
}
