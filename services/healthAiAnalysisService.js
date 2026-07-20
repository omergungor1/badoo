import { getDb } from '../lib/db';
import { logSupabaseError } from '../lib/networkLog';
import { getOpenAiApiKey } from '../lib/openai';
import { startOfDay, toISODate } from '../utils/date';
import {
  buildAnalysisPrompt,
  buildFoodSensitivityPrompt,
  buildHealthAnalysisPayload,
  getAnalysisPeriod,
} from '../utils/healthAiPayload';
import { foodMatchesCatalog, getSensitivityLevel } from '../utils/foodSensitivityScore';
import { getUserFoodSensitivityInsights } from './foodSensitivityService';
import { getPeriodCycles, getPeriodLogs } from './periodService';
import {
  getConditions,
  getMedications,
  getProfile,
  getSensitivities,
} from './profileService';

const AI_MODEL = 'gpt-4o-mini';
const ANALYSIS_TYPE_GENERAL = 'general';
const ANALYSIS_TYPE_FOOD_SENSITIVITY = 'food_sensitivity';

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

  return {
    payload,
    profile,
    dataPointCount,
    foodLogs: foodLogsRes.data || [],
    symptomLogs: symptomLogsRes.data || [],
    drinkLogs: drinkLogsRes.data || [],
  };
}

async function requestOpenAiAnalysis(prompt, fallbackTitle = 'Sağlık Analizi') {
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
          content: prompt,
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

  const parsed = parseAiResponse(content);
  if (!parsed.title || parsed.title === 'Sağlık Analizi') {
    parsed.title = fallbackTitle;
  }

  return { data: parsed, error: null };
}

export async function getHealthAnalyses(userId, limit = 20) {
  const { data, error } = await getDb()
    .from('health_ai_analyses')
    .select('id, title, summary, period_start, period_end, status, created_at, analysis_type, food_key, food_name')
    .eq('user_id', userId)
    .eq('analysis_type', ANALYSIS_TYPE_GENERAL)
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
    .eq('analysis_type', ANALYSIS_TYPE_GENERAL)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logSupabaseError('getLatestHealthAnalysis', error, { userId });
  }

  return { data, error };
}

export async function getFoodSensitivityAnalyses(userId, foodKey, limit = 20) {
  const { data, error } = await getDb()
    .from('health_ai_analyses')
    .select('id, title, summary, period_start, period_end, status, created_at, food_key, food_name')
    .eq('user_id', userId)
    .eq('analysis_type', ANALYSIS_TYPE_FOOD_SENSITIVITY)
    .eq('food_key', foodKey)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    logSupabaseError('getFoodSensitivityAnalyses', error, { userId, foodKey });
  }

  return { data: data || [], error };
}

export async function getTodayFoodSensitivityAnalysis(userId, foodKey) {
  const dayStart = startOfDay().toISOString();

  const { data, error } = await getDb()
    .from('health_ai_analyses')
    .select('id, title, summary, created_at')
    .eq('user_id', userId)
    .eq('analysis_type', ANALYSIS_TYPE_FOOD_SENSITIVITY)
    .eq('food_key', foodKey)
    .gte('created_at', dayStart)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    logSupabaseError('getTodayFoodSensitivityAnalysis', error, { userId, foodKey });
  }

  return { data, error };
}

export async function getHealthAnalysisPreview(userId) {
  const period = getAnalysisPeriod();
  const { payload, dataPointCount } = await gatherAnalysisData(userId, period);

  return {
    data: {
      period,
      dataPointCount,
      stats: {
        meals: payload.nutrition?.meals?.length || 0,
        symptoms: payload.symptoms?.length || 0,
        sleep: payload.sleep?.length || 0,
        activities: payload.activities?.length || 0,
        stool: payload.stool?.length || 0,
        checkins: payload.dailyCheckins?.length || 0,
        water: payload.hydration?.length || 0,
      },
    },
    error: null,
  };
}

export async function createHealthAnalysis(userId, options = {}) {
  const userNote = options.userNote?.trim() || '';
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

  const aiResult = await requestOpenAiAnalysis(
    buildAnalysisPrompt(payload, userNote),
    'Sağlık Analizi',
  );
  if (aiResult.error) {
    return { data: null, error: aiResult.error };
  }

  const { title, summary, analysisText } = aiResult.data;
  const snapshot = userNote ? { ...payload, userQuestion: userNote } : payload;

  const { data, error } = await getDb()
    .from('health_ai_analyses')
    .insert({
      user_id: userId,
      title,
      summary,
      analysis_text: analysisText,
      input_snapshot: snapshot,
      period_start: period.startDate,
      period_end: period.endDate,
      model: AI_MODEL,
      status: 'completed',
      analysis_type: ANALYSIS_TYPE_GENERAL,
    })
    .select()
    .single();

  if (error) {
    logSupabaseError('createHealthAnalysis', error, { userId });
    return { data: null, error };
  }

  return { data, error: null };
}

function buildFoodCatalogItem(foodInsight) {
  return {
    food_key: foodInsight.foodKey,
    food_name: foodInsight.foodName,
    keywords: foodInsight.keywords || [],
  };
}

export async function createFoodSensitivityAnalysis(userId, foodInsight) {
  if (!foodInsight?.foodKey) {
    return { data: null, error: { message: 'Besin bilgisi eksik.' } };
  }

  const { data: todayAnalysis } = await getTodayFoodSensitivityAnalysis(userId, foodInsight.foodKey);
  if (todayAnalysis) {
    return {
      data: null,
      error: {
        message: 'Bu besin için bugün zaten bir AI analizi yaptın. Yarın tekrar deneyebilirsin.',
        code: 'DAILY_LIMIT',
        analysisId: todayAnalysis.id,
      },
    };
  }

  const period = getAnalysisPeriod();
  const { payload, foodLogs, symptomLogs, drinkLogs } = await gatherAnalysisData(userId, period);
  const catalogItem = buildFoodCatalogItem(foodInsight);

  const matchingMeals = (foodLogs || []).filter((log) =>
    foodMatchesCatalog(log.foods?.food_name || log.food_name, catalogItem),
  );
  const matchingDrinks = (drinkLogs || []).filter((log) =>
    foodMatchesCatalog(log.drink_name, catalogItem),
  );

  const level = getSensitivityLevel(foodInsight.score || 0);
  const focusedPayload = {
    ...payload,
    targetFood: {
      foodKey: foodInsight.foodKey,
      foodName: foodInsight.foodName,
      emoji: foodInsight.emoji,
      score: foodInsight.score,
      levelLabel: level.label,
      mealCount: foodInsight.mealCount,
      reactionCount: foodInsight.reactionCount,
      declaredMatch: foodInsight.declaredMatch,
      matchingMeals: matchingMeals.slice(0, 40).map((log) => ({
        date: log.timestamp?.split('T')[0],
        food: log.foods?.food_name || log.food_name || log.meal_title,
        time: log.timestamp,
      })),
      matchingDrinks: matchingDrinks.slice(0, 20).map((log) => ({
        date: log.timestamp?.split('T')[0],
        drink: log.drink_name,
      })),
      relatedSymptoms: (symptomLogs || []).slice(0, 40).map((log) => ({
        date: log.timestamp?.split('T')[0],
        symptom: log.symptom_name,
        severity: log.severity,
      })),
    },
  };

  const aiResult = await requestOpenAiAnalysis(
    buildFoodSensitivityPrompt(focusedPayload),
    `${foodInsight.foodName} Hassasiyet Analizi`,
  );
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
      input_snapshot: focusedPayload,
      period_start: period.startDate,
      period_end: period.endDate,
      model: AI_MODEL,
      status: 'completed',
      analysis_type: ANALYSIS_TYPE_FOOD_SENSITIVITY,
      food_key: foodInsight.foodKey,
      food_name: foodInsight.foodName,
    })
    .select()
    .single();

  if (error) {
    logSupabaseError('createFoodSensitivityAnalysis', error, {
      userId,
      foodKey: foodInsight.foodKey,
    });
    return { data: null, error };
  }

  return { data, error: null };
}

export function analysisCreatedOnLocalDay(createdAt, day = toISODate()) {
  if (!createdAt) return false;
  return toISODate(new Date(createdAt)) === day;
}
