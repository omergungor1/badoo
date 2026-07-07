import { getDb } from '../lib/db';
import { logSupabaseError } from '../lib/networkLog';
import { getOpenAiApiKey } from '../lib/openai';
import {
  buildAnalysisPrompt,
  buildHealthAnalysisPayload,
  getAnalysisPeriod,
} from '../utils/healthAiPayload';
import { getUserFoodSensitivityInsights } from './foodSensitivityService';
import { getPeriodCycles, getPeriodLogs } from './periodService';
import {
  getConditions,
  getMedications,
  getProfile,
  getSensitivities,
} from './profileService';

const AI_MODEL = 'gpt-4o-mini';

function parseAiResponse(content) {
  try {
    const parsed = JSON.parse(content);
    return {
      title: parsed.title || 'Sağlık Analizi',
      summary: parsed.summary || '',
      analysisText: parsed.analysis || parsed.analysis_text || content,
    };
  } catch {
    return {
      title: 'Sağlık Analizi',
      summary: content.slice(0, 160),
      analysisText: content,
    };
  }
}

async function gatherAnalysisData(userId, period) {
  const [
    profileRes,
    conditionsRes,
    sensitivitiesRes,
    medicationsRes,
    sensitivityInsights,
    foodLogsRes,
    waterLogsRes,
    drinkLogsRes,
    symptomLogsRes,
    stoolLogsRes,
    sleepLogsRes,
    activityLogsRes,
    statusLogsRes,
    medicationLogsRes,
    notesRes,
    periodCyclesRes,
    periodLogsRes,
  ] = await Promise.all([
    getProfile(userId),
    getConditions(userId),
    getSensitivities(userId),
    getMedications(userId),
    getUserFoodSensitivityInsights(userId),
    getDb()
      .from('food_logs')
      .select('*, foods(food_name, unit_type, calories, protein)')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .gte('timestamp', period.startIso)
      .lte('timestamp', period.endIso),
    getDb()
      .from('water_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', period.startIso)
      .lte('timestamp', period.endIso),
    getDb()
      .from('drink_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', period.startIso)
      .lte('timestamp', period.endIso),
    getDb()
      .from('symptom_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', period.startIso)
      .lte('timestamp', period.endIso),
    getDb()
      .from('stool_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('time', period.startIso)
      .lte('time', period.endIso),
    getDb()
      .from('sleep_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', period.startIso)
      .lte('timestamp', period.endIso),
    getDb()
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', period.startIso)
      .lte('timestamp', period.endIso),
    getDb()
      .from('daily_status_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', period.startIso)
      .lte('timestamp', period.endIso),
    getDb()
      .from('medication_logs')
      .select('*, medications(medication_name)')
      .eq('user_id', userId)
      .gte('timestamp', period.startIso)
      .lte('timestamp', period.endIso),
    getDb()
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', period.startIso)
      .lte('timestamp', period.endIso),
    getPeriodCycles(userId),
    getPeriodLogs(userId),
  ]);

  const profile = profileRes.data;

  const payload = buildHealthAnalysisPayload({
    profile,
    conditions: conditionsRes.data || [],
    sensitivities: sensitivitiesRes.data || [],
    medications: medicationsRes.data || [],
    foodSensitivityInsights: sensitivityInsights.data || [],
    foodLogs: foodLogsRes.data || [],
    waterLogs: waterLogsRes.data || [],
    drinkLogs: drinkLogsRes.data || [],
    symptomLogs: symptomLogsRes.data || [],
    stoolLogs: stoolLogsRes.data || [],
    sleepLogs: sleepLogsRes.data || [],
    activityLogs: activityLogsRes.data || [],
    statusLogs: statusLogsRes.data || [],
    medicationLogs: medicationLogsRes.data || [],
    notes: notesRes.data || [],
    periodCycles: periodCyclesRes.data || [],
    periodLogs: (periodLogsRes.data || []).filter((log) => {
      const day = log.logged_at?.split('T')[0];
      return day >= period.startDate && day <= period.endDate;
    }),
    period,
  });

  const dataPointCount =
    (payload.nutrition?.meals?.length || 0) +
    (payload.symptoms?.length || 0) +
    (payload.stool?.length || 0) +
    (payload.dailyCheckins?.length || 0);

  return { payload, profile, dataPointCount };
}

async function requestOpenAiAnalysis(payload) {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    return { data: null, error: { message: 'OPENAI_API_KEY tanımlı değil.' } };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Sen sindirim sağlığı ve beslenme alanında bilgi veren bir sağlık asistanısın. Türkçe yanıt ver. Yalnızca geçerli JSON döndür: {"title":"...","summary":"kısa özet","analysis":"detaylı analiz metni (markdown kullanabilirsin)"}',
        },
        {
          role: 'user',
          content: buildAnalysisPrompt(payload),
        },
      ],
    }),
  });

  const body = await response.json();

  if (!response.ok) {
    return {
      data: null,
      error: { message: body?.error?.message || 'OpenAI isteği başarısız oldu.' },
    };
  }

  const content = body?.choices?.[0]?.message?.content;
  if (!content) {
    return { data: null, error: { message: 'OpenAI boş yanıt döndürdü.' } };
  }

  return { data: parseAiResponse(content), error: null };
}

export async function getHealthAnalyses(userId, limit = 20) {
  const { data, error } = await getDb()
    .from('health_ai_analyses')
    .select('id, title, summary, period_start, period_end, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    logSupabaseError('getHealthAnalyses', error, { userId });
  }

  return { data: data || [], error };
}

export async function getHealthAnalysisById(userId, analysisId) {
  const { data, error } = await getDb()
    .from('health_ai_analyses')
    .select('*')
    .eq('id', analysisId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    logSupabaseError('getHealthAnalysisById', error, { userId, analysisId });
  }

  return { data, error };
}

export async function getLatestHealthAnalysis(userId) {
  const { data, error } = await getDb()
    .from('health_ai_analyses')
    .select('id, title, summary, period_start, period_end, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logSupabaseError('getLatestHealthAnalysis', error, { userId });
  }

  return { data, error };
}

export async function createHealthAnalysis(userId) {
  const period = getAnalysisPeriod();
  const { payload, dataPointCount } = await gatherAnalysisData(userId, period);

  if (dataPointCount < 3) {
    return {
      data: null,
      error: {
        message: 'Analiz için yeterli kayıt yok. Son 2 haftada öğün, belirti veya günlük kayıt ekle.',
      },
    };
  }

  const aiResult = await requestOpenAiAnalysis(payload);
  if (aiResult.error) {
    return { data: null, error: aiResult.error };
  }

  const { title, summary, analysisText } = aiResult.data;

  const { data, error } = await getDb()
    .from('health_ai_analyses')
    .insert({
      user_id: userId,
      title,
      summary,
      analysis_text: analysisText,
      input_snapshot: payload,
      period_start: period.startDate,
      period_end: period.endDate,
      model: AI_MODEL,
      status: 'completed',
    })
    .select()
    .single();

  if (error) {
    logSupabaseError('createHealthAnalysis', error, { userId });
    return { data: null, error };
  }

  return { data, error: null };
}
