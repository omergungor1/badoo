import { getDb } from '../lib/db';
import { logSupabaseError } from '../lib/networkLog';
import { toISODate } from '../utils/date';

export async function saveDigestionCheckin(userId, entry) {
  if (!userId) return { data: null, error: { message: 'Kullanıcı yok.' } };

  const row = {
    user_id: userId,
    checkin_date: entry.checkinDate || toISODate(),
    time_of_day: entry.timeOfDay,
    feeling_ok: Boolean(entry.feelingOk),
    symptoms: entry.symptoms || [],
    follow_up: entry.followUp || null,
    note: entry.note || null,
  };

  const { data, error } = await getDb()
    .from('digestion_checkins')
    .insert(row)
    .select('*')
    .single();

  if (error) {
    logSupabaseError('saveDigestionCheckin', error, { userId });
    return { data: null, error };
  }

  return { data, error: null };
}
