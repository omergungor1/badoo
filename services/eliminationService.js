import { getDb } from '../lib/db';
import { logSupabaseError } from '../lib/networkLog';
import {
  ELIMINATION_DURATION_DAYS,
  REINTRODUCTION_DAYS,
  getEliminationProgram,
  getProgramDayContent,
} from '../constants/elimination';
import { toISODate } from '../utils/date';

function daysBetween(a, b) {
  const start = new Date(`${a}T00:00:00`);
  const end = new Date(`${b}T00:00:00`);
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}

function computeCurrentDay(startDate, today = toISODate()) {
  const diff = daysBetween(startDate, today);
  if (diff < 0) return 1;
  return Math.min(ELIMINATION_DURATION_DAYS, diff + 1);
}

function avgScore(logs, key) {
  const values = (logs || [])
    .map((log) => Number(log.scores?.[key]))
    .filter((n) => Number.isFinite(n));
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function buildResultSummary(program, elimLogs, reintroLogs) {
  const focusKeys = ['bloating', 'gas', 'abdominal_pain', 'reflux', 'diarrhea', 'constipation'];
  const deltas = focusKeys
    .map((key) => {
      const before = avgScore(elimLogs, key);
      const after = avgScore(reintroLogs, key);
      if (before == null || after == null) return null;
      return { key, before, after, delta: after - before };
    })
    .filter(Boolean);

  const positive = deltas.filter((d) => d.delta >= 2);
  const maxDelta = deltas.reduce((m, d) => Math.max(m, d.delta), 0);

  let likelihood = 'inconclusive';
  if (positive.length >= 2 || maxDelta >= 3.5) likelihood = 'high';
  else if (positive.length === 1 || maxDelta >= 2) likelihood = 'medium';
  else if (deltas.length) likelihood = 'low';

  const likelihoodLabel = {
    high: 'Yüksek olasılıkla',
    medium: 'Orta olasılıkla',
    low: 'Düşük olasılıkla',
    inconclusive: 'Net sonuç çıkmadı —',
  }[likelihood];

  const top = [...deltas].sort((a, b) => b.delta - a.delta).slice(0, 3);
  const topText = top.length
    ? top.map((d) => `${d.key}: ${d.delta >= 0 ? '+' : ''}${d.delta.toFixed(1)}`).join(', ')
    : 'yeterli karşılaştırma verisi yok';

  const summary =
    likelihood === 'inconclusive'
      ? `${program.title} için yeterli belirti karşılaştırması oluşmadı. Daha uzun veya ikinci bir oturum deneyebilirsin. Bu tıbbi tanı değildir.`
      : `${likelihoodLabel} ${program.title.toLowerCase()} belirtilerinle ilişkili olabilir. Yeniden tanıtım sonrası öne çıkan değişimler: ${topText}. Bu bir olasılık analizidir; tıbbi tanı değildir.`;

  return { likelihood, summary, deltas: top, payload: { deltas, positiveCount: positive.length } };
}

function enrichSession(row) {
  if (!row) return null;
  const program = getEliminationProgram(row.program_slug);
  const today = toISODate();
  const currentDay =
    row.status === 'active' ? computeCurrentDay(row.start_date, today) : row.current_day;
  const dayContent = program ? getProgramDayContent(program, currentDay) : null;
  const progressPercent =
    row.status === 'completed'
      ? 100
      : row.status === 'reintroduction'
        ? 90
        : Math.round((currentDay / ELIMINATION_DURATION_DAYS) * 100);

  return {
    ...row,
    program,
    currentDay,
    dayContent,
    progressPercent,
    durationDays: ELIMINATION_DURATION_DAYS,
  };
}

export async function getActiveEliminationSession(userId) {
  const { data, error } = await getDb()
    .from('elimination_sessions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'reintroduction'])
    .maybeSingle();

  if (error) {
    logSupabaseError('getActiveEliminationSession', error, { userId });
    return { data: null, error };
  }

  return { data: enrichSession(data), error: null };
}

export async function getEliminationLabOverview(userId) {
  const [{ data: active }, { data: sessions, error }] = await Promise.all([
    getActiveEliminationSession(userId),
    getDb()
      .from('elimination_sessions')
      .select('id, program_slug, status, start_date, ended_at, result_likelihood, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  if (error) {
    logSupabaseError('getEliminationLabOverview', error, { userId });
    return { data: null, error };
  }

  const bySlug = {};
  (sessions || []).forEach((s) => {
    if (!bySlug[s.program_slug]) bySlug[s.program_slug] = [];
    bySlug[s.program_slug].push(s);
  });

  return {
    data: {
      active: active || null,
      sessions: sessions || [],
      bySlug,
      hasActive: Boolean(active),
    },
    error: null,
  };
}

export async function getEliminationHomeCard(userId) {
  const { data: active, error } = await getActiveEliminationSession(userId);
  if (error || !active) return { data: null, error };

  let todaySymptom = null;
  if (active.status === 'active' || active.status === 'reintroduction') {
    const phase = active.status === 'reintroduction' ? 'reintroduction' : 'elimination';
    const { data: log } = await getDb()
      .from('elimination_symptom_logs')
      .select('id')
      .eq('session_id', active.id)
      .eq('log_date', toISODate())
      .eq('phase', phase)
      .maybeSingle();
    todaySymptom = log;
  }

  return {
    data: {
      session: active,
      todaySymptomLogged: Boolean(todaySymptom),
    },
    error: null,
  };
}

export async function getEliminationSessionDetail(userId, sessionId) {
  const { data: session, error } = await getDb()
    .from('elimination_sessions')
    .select('*')
    .eq('id', sessionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    logSupabaseError('getEliminationSessionDetail', error, { userId, sessionId });
    return { data: null, error };
  }
  if (!session) return { data: null, error: { message: 'Oturum bulunamadı.' } };

  const [{ data: symptoms }, { data: cheats }] = await Promise.all([
    getDb()
      .from('elimination_symptom_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('log_date', { ascending: true }),
    getDb()
      .from('elimination_cheat_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false }),
  ]);

  const enriched = enrichSession(session);
  // Sync current_day if drifted
  if (
    session.status === 'active' &&
    enriched.currentDay !== session.current_day
  ) {
    await getDb()
      .from('elimination_sessions')
      .update({ current_day: enriched.currentDay, updated_at: new Date().toISOString() })
      .eq('id', sessionId)
      .eq('user_id', userId);
  }

  return {
    data: {
      session: enriched,
      symptoms: symptoms || [],
      cheats: cheats || [],
      todayLog: (symptoms || []).find(
        (s) =>
          s.log_date === toISODate() &&
          s.phase === (session.status === 'reintroduction' ? 'reintroduction' : 'elimination'),
      ),
    },
    error: null,
  };
}

export async function startEliminationSession(userId, programSlug) {
  const program = getEliminationProgram(programSlug);
  if (!program) return { data: null, error: { message: 'Program bulunamadı.' } };

  const { data: existing } = await getActiveEliminationSession(userId);
  if (existing) {
    return {
      data: null,
      error: {
        message: `Zaten aktif bir eliminasyonun var: ${existing.program?.title || existing.program_slug}. Önce onu bitir veya boz.`,
      },
    };
  }

  const today = toISODate();
  const { data, error } = await getDb()
    .from('elimination_sessions')
    .insert({
      user_id: userId,
      program_slug: programSlug,
      status: 'active',
      start_date: today,
      current_day: 1,
    })
    .select('*')
    .single();

  if (error) {
    logSupabaseError('startEliminationSession', error, { userId, programSlug });
    return { data: null, error };
  }

  return { data: enrichSession(data), error: null };
}

export async function logEliminationSymptoms(userId, sessionId, payload) {
  const { data: detail, error: detailError } = await getEliminationSessionDetail(userId, sessionId);
  if (detailError) return { data: null, error: detailError };
  const session = detail.session;
  if (!['active', 'reintroduction'].includes(session.status)) {
    return { data: null, error: { message: 'Bu oturuma belirti eklenemez.' } };
  }

  const phase = session.status === 'reintroduction' ? 'reintroduction' : 'elimination';
  const today = toISODate();
  const row = {
    session_id: sessionId,
    user_id: userId,
    log_date: today,
    day_number: session.currentDay,
    phase,
    scores: payload.scores || {},
    cheated: Boolean(payload.cheated),
    cheat_note: payload.cheatNote || null,
    note: payload.note || null,
  };

  const { data, error } = await getDb()
    .from('elimination_symptom_logs')
    .upsert(row, { onConflict: 'session_id,log_date,phase' })
    .select('*')
    .single();

  if (error) {
    logSupabaseError('logEliminationSymptoms', error, { userId, sessionId });
    return { data: null, error };
  }

  return { data, error: null };
}

export async function breakEliminationSession(userId, sessionId, payload) {
  const { data: session } = await getActiveEliminationSession(userId);
  if (!session || session.id !== sessionId) {
    return { data: null, error: { message: 'Aktif oturum bulunamadı.' } };
  }

  await getDb().from('elimination_cheat_logs').insert({
    session_id: sessionId,
    user_id: userId,
    log_date: toISODate(),
    food_text: payload.food || null,
    amount_text: payload.amount || null,
    intent: payload.intent || null,
    note: payload.note || null,
  });

  const markBroken = payload.markBroken !== false;
  if (!markBroken) {
    return { data: session, error: null };
  }

  const { data, error } = await getDb()
    .from('elimination_sessions')
    .update({
      status: 'broken',
      ended_at: new Date().toISOString(),
      break_food: payload.food || null,
      break_amount: payload.amount || null,
      break_intent: payload.intent || null,
      break_note: payload.note || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    logSupabaseError('breakEliminationSession', error, { userId, sessionId });
    return { data: null, error };
  }

  return { data: enrichSession(data), error: null };
}

export async function finishEliminationPhase(userId, sessionId) {
  const { data: detail, error: detailError } = await getEliminationSessionDetail(userId, sessionId);
  if (detailError) return { data: null, error: detailError };
  const session = detail.session;

  if (session.status !== 'active') {
    return { data: null, error: { message: 'Yalnızca aktif eliminasyon bitirilebilir.' } };
  }
  if (session.currentDay < ELIMINATION_DURATION_DAYS) {
    return {
      data: null,
      error: {
        message: `Henüz 7. güne gelmedin (Gün ${session.currentDay}). Erken bitirmek için “Bozdum” kullanabilirsin.`,
      },
    };
  }

  const program = session.program;
  const { data, error } = await getDb()
    .from('elimination_sessions')
    .update({
      status: 'reintroduction',
      current_day: ELIMINATION_DURATION_DAYS,
      reintroduction_started_at: new Date().toISOString(),
      reintroduction_food: program?.reintroductionProtocol?.food || null,
      reintroduction_amount: program?.reintroductionProtocol?.amount || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    logSupabaseError('finishEliminationPhase', error, { userId, sessionId });
    return { data: null, error };
  }

  return { data: enrichSession(data), error: null };
}

export async function completeReintroduction(userId, sessionId) {
  const { data: detail, error: detailError } = await getEliminationSessionDetail(userId, sessionId);
  if (detailError) return { data: null, error: detailError };
  const session = detail.session;

  if (session.status !== 'reintroduction') {
    return { data: null, error: { message: 'Yeniden tanıtım aşamasında değilsin.' } };
  }

  const elimLogs = (detail.symptoms || []).filter((s) => s.phase === 'elimination');
  const reintroLogs = (detail.symptoms || []).filter((s) => s.phase === 'reintroduction');
  const result = buildResultSummary(session.program, elimLogs, reintroLogs);

  const { data, error } = await getDb()
    .from('elimination_sessions')
    .update({
      status: 'completed',
      ended_at: new Date().toISOString(),
      result_summary: result.summary,
      result_likelihood: result.likelihood,
      result_payload: result.payload,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) {
    logSupabaseError('completeReintroduction', error, { userId, sessionId });
    return { data: null, error };
  }

  return { data: enrichSession(data), error: null };
}

export async function cancelEliminationSession(userId, sessionId) {
  const { data, error } = await getDb()
    .from('elimination_sessions')
    .update({
      status: 'cancelled',
      ended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .eq('user_id', userId)
    .in('status', ['active', 'reintroduction'])
    .select('*')
    .single();

  if (error) {
    logSupabaseError('cancelEliminationSession', error, { userId, sessionId });
    return { data: null, error };
  }

  return { data: enrichSession(data), error: null };
}

export { ELIMINATION_DURATION_DAYS, REINTRODUCTION_DAYS, computeCurrentDay };
