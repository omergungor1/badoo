import { colors } from '../theme';

const SYMPTOM_WEIGHTS = {
  şişkinlik: 8,
  gaz: 6,
  'karın ağrısı': 10,
  'mide yanması': 8,
};

export function calculateDailyDigestionScore({
  symptoms = [],
  sleepLogs = [],
  statusLogs = [],
  stoolLogs = [],
}) {
  let score = 100;

  symptoms.forEach((symptom) => {
    const name = symptom.symptom_name?.toLowerCase();
    const weight = SYMPTOM_WEIGHTS[name];
    if (weight) {
      score -= (symptom.severity || 0) * weight;
    } else if (symptom.severity) {
      score -= symptom.severity * 4;
    }
  });

  const sleep = sleepLogs[0];
  if (sleep?.quality >= 4) {
    score += 5;
  }

  const status = statusLogs[0];
  if (status?.energy >= 4) {
    score += 5;
  }

  const stool = stoolLogs[0];
  if (stool?.consistency === 'Bristol 1' || stool?.consistency === 'Bristol 7') {
    score -= 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getScoreColor(score) {
  if (score >= 90) return colors.scoreExcellent;
  if (score >= 75) return colors.scoreGood;
  if (score >= 60) return colors.scoreMedium;
  if (score >= 40) return colors.scoreBad;
  return colors.scoreVeryBad;
}

export function getScoreEmoji(score) {
  if (score >= 90) return '🟩';
  if (score >= 75) return '🟨';
  if (score >= 60) return '🟧';
  if (score >= 40) return '🟥';
  return '⬛';
}

export function getComfortSummary(scores) {
  const comfortableDays = scores.filter((s) => s >= 75).length;
  return {
    comfortableDays,
    totalDays: scores.length,
    average: scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0,
  };
}

export function findLongestStreak(scores, threshold, above = true) {
  let max = 0;
  let current = 0;

  scores.forEach((score) => {
    const match = above ? score >= threshold : score < threshold;
    if (match) {
      current += 1;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  });

  return max;
}
