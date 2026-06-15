import { getDb } from '../lib/db';
import {
  FALLBACK_PERIOD_SYMPTOMS,
  mapFallbackPeriodSymptoms,
} from '../constants/period';
import { buildPeriodSummary } from '../utils/period';
import { toISODate } from '../utils/date';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return UUID_RE.test(String(value || ''));
}

export async function getPeriodSymptomOptions() {
  const { data, error } = await getDb()
    .from('period_symptom_options')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error || !data?.length) {
    return { data: mapFallbackPeriodSymptoms(), error: null };
  }

  return { data, error: null };
}

export async function getPeriodCycles(userId) {
  const { data, error } = await getDb()
    .from('period_cycles')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  return { data: data || [], error };
}

export async function getActivePeriodCycle(userId) {
  const { data, error } = await getDb()
    .from('period_cycles')
    .select('*')
    .eq('user_id', userId)
    .is('end_date', null)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data, error };
}

export async function getPeriodLogs(userId, cycleId) {
  let query = getDb()
    .from('period_logs')
    .select('*')
    .eq('user_id', userId)
    .order('logged_at', { ascending: false });

  if (cycleId) {
    query = query.eq('cycle_id', cycleId);
  }

  const { data, error } = await query;
  return { data: data || [], error };
}

export async function getPeriodLogsForDate(userId, date) {
  const start = `${date}T00:00:00.000Z`;
  const end = `${date}T23:59:59.999Z`;

  const { data, error } = await getDb()
    .from('period_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('logged_at', start)
    .lte('logged_at', end)
    .order('logged_at', { ascending: false });

  return { data: data || [], error };
}

export async function getPeriodDashboard(userId) {
  const [cyclesResult, logsResult] = await Promise.all([
    getPeriodCycles(userId),
    getPeriodLogs(userId),
  ]);

  if (cyclesResult.error) return { data: null, error: cyclesResult.error };
  if (logsResult.error) return { data: null, error: logsResult.error };

  const summary = buildPeriodSummary(cyclesResult.data);
  const recentLogs = logsResult.data.slice(0, 8);

  return {
    data: {
      summary,
      cycles: cyclesResult.data,
      recentLogs,
    },
    error: null,
  };
}

async function insertPeriodLog(userId, cycleId, logType, fields = {}) {
  return getDb()
    .from('period_logs')
    .insert({
      user_id: userId,
      cycle_id: cycleId,
      log_type: logType,
      ...fields,
      logged_at: new Date().toISOString(),
    })
    .select()
    .single();
}

export async function startPeriod(userId, startDate = toISODate()) {
  const { data: active } = await getActivePeriodCycle(userId);
  if (active) {
    return { data: null, error: { message: 'Devam eden bir regl kaydı var. Önce bitiş bildirin.' } };
  }

  if (!startDate) {
    return { data: null, error: { message: 'Başlangıç tarihi seçin.' } };
  }

  if (startDate > toISODate()) {
    return { data: null, error: { message: 'Başlangıç tarihi gelecekte olamaz.' } };
  }

  const { data: cycle, error } = await getDb()
    .from('period_cycles')
    .insert({
      user_id: userId,
      start_date: startDate,
    })
    .select()
    .single();

  if (error) return { data: null, error };

  await insertPeriodLog(userId, cycle.id, 'start', {
    note: `Adet başlangıcı: ${startDate}`,
  });
  return { data: cycle, error: null };
}

export async function endPeriod(userId, endDate = toISODate()) {
  const { data: active, error: activeError } = await getActivePeriodCycle(userId);
  if (activeError) return { data: null, error: activeError };
  if (!active) {
    return { data: null, error: { message: 'Aktif regl kaydı bulunamadı.' } };
  }

  if (!endDate) {
    return { data: null, error: { message: 'Bitiş tarihi seçin.' } };
  }

  if (endDate > toISODate()) {
    return { data: null, error: { message: 'Bitiş tarihi gelecekte olamaz.' } };
  }

  if (endDate < active.start_date) {
    return { data: null, error: { message: 'Bitiş tarihi başlangıçtan önce olamaz.' } };
  }

  const { data: cycle, error } = await getDb()
    .from('period_cycles')
    .update({
      end_date: endDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', active.id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return { data: null, error };

  await insertPeriodLog(userId, cycle.id, 'end', { note: `Adet bitişi: ${endDate}` });
  return { data: cycle, error: null };
}

export async function getPeriodCycle(userId, cycleId) {
  const { data, error } = await getDb()
    .from('period_cycles')
    .select('*')
    .eq('id', cycleId)
    .eq('user_id', userId)
    .maybeSingle();

  return { data, error };
}

export async function updatePeriodCycle(userId, cycleId, { startDate, endDate }) {
  const { data: existing, error: existingError } = await getPeriodCycle(userId, cycleId);
  if (existingError) return { data: null, error: existingError };
  if (!existing) {
    return { data: null, error: { message: 'Adet kaydı bulunamadı.' } };
  }

  const nextStart = startDate || existing.start_date;
  const nextEnd = endDate === undefined ? existing.end_date : endDate;

  if (!nextStart) {
    return { data: null, error: { message: 'Başlangıç tarihi gerekli.' } };
  }

  if (nextStart > toISODate()) {
    return { data: null, error: { message: 'Başlangıç tarihi gelecekte olamaz.' } };
  }

  if (nextEnd && nextEnd > toISODate()) {
    return { data: null, error: { message: 'Bitiş tarihi gelecekte olamaz.' } };
  }

  if (nextEnd && nextEnd < nextStart) {
    return { data: null, error: { message: 'Bitiş tarihi başlangıçtan önce olamaz.' } };
  }

  const { data, error } = await getDb()
    .from('period_cycles')
    .update({
      start_date: nextStart,
      end_date: nextEnd || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cycleId)
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
}

async function resolveSymptomOption(symptomOptionId) {
  if (isUuid(symptomOptionId)) {
    const { data } = await getDb()
      .from('period_symptom_options')
      .select('id, symptom_name')
      .eq('id', symptomOptionId)
      .maybeSingle();
    if (data) return data;
  }

  const fallback = FALLBACK_PERIOD_SYMPTOMS.find(
    (item) => item.symptom_key === symptomOptionId,
  );

  if (!fallback) return null;

  const { data } = await getDb()
    .from('period_symptom_options')
    .select('id, symptom_name')
    .eq('symptom_key', fallback.symptom_key)
    .maybeSingle();

  return data || { id: null, symptom_name: fallback.symptom_name };
}

export async function addPeriodSymptom(userId, symptomOptionId, note = '') {
  return addPeriodSymptoms(userId, [symptomOptionId], note);
}

export async function addPeriodSymptoms(userId, symptomOptionIds, note = '') {
  const ids = Array.isArray(symptomOptionIds) ? symptomOptionIds.filter(Boolean) : [];
  if (!ids.length) {
    return { data: null, error: { message: 'En az bir semptom seçin.' } };
  }

  const { data: active, error: activeError } = await getActivePeriodCycle(userId);
  if (activeError) return { data: null, error: activeError };
  if (!active) {
    return { data: null, error: { message: 'Semptom eklemek için önce başlangıç bildirin.' } };
  }

  const symptoms = [];
  for (const symptomOptionId of ids) {
    const symptom = await resolveSymptomOption(symptomOptionId);
    if (!symptom) {
      return { data: null, error: { message: 'Geçersiz semptom seçimi.' } };
    }
    symptoms.push(symptom);
  }

  const loggedAt = new Date().toISOString();
  const trimmedNote = note.trim() || null;
  const rows = symptoms.map((symptom) => ({
    user_id: userId,
    cycle_id: active.id,
    log_type: 'symptom',
    symptom_option_id: symptom.id,
    symptom_name: symptom.symptom_name,
    note: trimmedNote,
    logged_at: loggedAt,
  }));

  const { data, error } = await getDb().from('period_logs').insert(rows).select();
  return { data, error };
}

export async function addPeriodNote(userId, note) {
  const trimmed = note.trim();
  if (!trimmed) {
    return { data: null, error: { message: 'Not boş olamaz.' } };
  }

  const { data: active, error: activeError } = await getActivePeriodCycle(userId);
  if (activeError) return { data: null, error: activeError };
  if (!active) {
    return { data: null, error: { message: 'Not eklemek için önce başlangıç bildirin.' } };
  }

  const { data, error } = await insertPeriodLog(userId, active.id, 'note', { note: trimmed });
  return { data, error };
}
