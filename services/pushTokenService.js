import { getDb } from '../lib/db';
import { logSupabaseError } from '../lib/networkLog';

export async function savePushToken(userId, token, platform = 'ios') {
  if (!userId || !token) {
    return { data: null, error: new Error('userId ve token gerekli') };
  }

  const { data, error } = await getDb()
    .from('device_push_tokens')
    .upsert(
      {
        user_id: userId,
        fcm_token: token,
        platform,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,fcm_token' },
    )
    .select('id, fcm_token')
    .single();

  if (error) {
    logSupabaseError('savePushToken', error, { userId, platform });
  }

  return { data, error };
}

export async function removePushToken(userId, token) {
  if (!userId || !token) {
    return { error: null };
  }

  const { error } = await getDb()
    .from('device_push_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('fcm_token', token);

  if (error) {
    logSupabaseError('removePushToken', error, { userId });
  }

  return { error };
}
