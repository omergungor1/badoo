import { toISODate } from './date';
import { formatQuantityLabel } from './foodQuantity';

export const ANALYSIS_PERIOD_DAYS = 14;

export function getAnalysisPeriod() {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (ANALYSIS_PERIOD_DAYS - 1));

  return {
    startDate: toISODate(start),
    endDate: toISODate(end),
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

function compactList(items, limit = 80) {
  return (items || []).slice(0, limit);
}

function mapFoodLogs(logs) {
  return compactList(logs).map((log) => ({
    date: log.timestamp?.split('T')[0],
    time: log.timestamp,
    food: log.foods?.food_name || 'Bilinmeyen',
    quantity: formatQuantityLabel(log.quantity, log.foods?.unit_type),
    calories: log.foods?.calories,
    protein: log.foods?.protein,
  }));
}

function mapSymptomLogs(logs) {
  return compactList(logs).map((log) => ({
    date: log.timestamp?.split('T')[0],
    symptom: log.symptom_name,
    severity: log.severity,
    note: log.note || null,
  }));
}

function mapStoolLogs(logs) {
  return compactList(logs).map((log) => ({
    date: (log.time || '').split('T')[0],
    consistency: log.consistency,
    note: log.note || null,
  }));
}

function mapSleepLogs(logs) {
  return compactList(logs).map((log) => ({
    date: log.timestamp?.split('T')[0],
    hours: log.hours,
    durationMinutes: log.duration_minutes,
    quality: log.quality,
    wakeCount: log.wake_count,
  }));
}

function mapStatusLogs(logs) {
  return compactList(logs).map((log) => ({
    date: log.timestamp?.split('T')[0],
    energy: log.energy,
    stress: log.stress,
    mood: log.mood,
    motivation: log.motivation,
  }));
}

function mapActivityLogs(logs) {
  return compactList(logs).map((log) => ({
    date: log.timestamp?.split('T')[0],
    name: log.activity_name,
    duration: log.duration,
    steps: log.steps,
    distance: log.distance,
    source: log.source,
  }));
}

function mapMedicationLogs(logs) {
  return compactList(logs).map((log) => ({
    date: log.timestamp?.split('T')[0],
    medication: log.medications?.medication_name || 'İlaç',
    dose: log.dose,
  }));
}

function mapWaterLogs(logs) {
  const total = (logs || []).reduce((sum, log) => sum + (log.amount || 0), 0);
  return {
    totalMl: total,
    dailyAverageMl: logs?.length ? Math.round(total / ANALYSIS_PERIOD_DAYS) : 0,
    entries: compactList(logs, 30).map((log) => ({
      date: log.timestamp?.split('T')[0],
      amount: log.amount,
    })),
  };
}

function mapNotes(logs) {
  return compactList(logs, 30).map((log) => ({
    date: log.timestamp?.split('T')[0],
    note: log.note,
  }));
}

function mapPeriodData(cycles, periodLogs) {
  return {
    cycles: compactList(cycles, 10).map((cycle) => ({
      startDate: cycle.start_date,
      endDate: cycle.end_date,
    })),
    logs: compactList(periodLogs, 40).map((log) => ({
      date: log.logged_at?.split('T')[0],
      type: log.log_type,
      symptom: log.symptom_name,
      flowLevel: log.flow_level,
      note: log.note,
    })),
  };
}

export function buildHealthAnalysisPayload({
  profile,
  conditions,
  sensitivities,
  medications,
  foodSensitivityInsights,
  foodLogs,
  waterLogs,
  drinkLogs,
  symptomLogs,
  stoolLogs,
  sleepLogs,
  activityLogs,
  statusLogs,
  medicationLogs,
  notes,
  periodCycles,
  periodLogs,
  period,
}) {
  const payload = {
    period: {
      days: ANALYSIS_PERIOD_DAYS,
      start: period.startDate,
      end: period.endDate,
    },
    profile: {
      gender: profile?.gender || null,
      birthYear: profile?.birth_year || null,
      height: profile?.height || null,
      weight: profile?.weight || null,
    },
    declaredConditions: (conditions || []).map((item) => item.condition_name),
    declaredSensitivities: (sensitivities || []).map((item) => item.sensitivity_name),
    declaredMedications: (medications || []).map((item) => item.medication_name),
    foodSensitivityScores: (foodSensitivityInsights || []).slice(0, 15).map((item) => ({
      food: item.foodName,
      score: item.score,
      mealCount: item.mealCount,
      reactionCount: item.reactionCount,
      declaredMatch: item.declaredMatch,
    })),
    nutrition: {
      meals: mapFoodLogs(foodLogs),
      drinks: compactList(drinkLogs, 30).map((log) => ({
        date: log.timestamp?.split('T')[0],
        drink: log.drink_name,
      })),
    },
    hydration: mapWaterLogs(waterLogs),
    symptoms: mapSymptomLogs(symptomLogs),
    stool: mapStoolLogs(stoolLogs),
    sleep: mapSleepLogs(sleepLogs),
    activities: mapActivityLogs(activityLogs),
    dailyCheckins: mapStatusLogs(statusLogs),
    medicationUsage: mapMedicationLogs(medicationLogs),
    personalNotes: mapNotes(notes),
  };

  if (profile?.gender === 'kadın') {
    payload.menstrual = mapPeriodData(periodCycles, periodLogs);
  }

  return payload;
}

export function buildAnalysisPrompt(payload) {
  return `Aşağıdaki JSON, bir kullanıcının son ${ANALYSIS_PERIOD_DAYS} günlük sindirim ve yaşam tarzı kayıtlarını içeriyor. Türkçe, anlaşılır ve destekleyici bir sağlık analizi yaz.

Kurallar:
- Teşhis koyma, doktorun yerine geçme
- Olası örüntüleri, tetikleyicileri ve besin hassasiyeti bağlantılarını açıkla
- Kullanıcıyı aydınlat, korkutma
- Somut gözlemlere dayan, veri yoksa bunu belirt
- Pratik öneriler ver (kısa madde listesi)

JSON veri:
${JSON.stringify(payload)}`;
}
