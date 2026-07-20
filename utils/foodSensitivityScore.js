const SYMPTOM_WINDOW_START_MS = 2 * 60 * 60 * 1000;
const SYMPTOM_WINDOW_END_MS = 12 * 60 * 60 * 1000;

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

export function foodMatchesCatalog(foodName, catalogItem) {
  const normalizedFood = normalizeText(foodName);
  if (!normalizedFood) return false;

  const catalogName = normalizeText(catalogItem.food_name);
  if (normalizedFood.includes(catalogName.split('&')[0].trim())) {
    return true;
  }

  return (catalogItem.keywords || []).some((keyword) => normalizedFood.includes(normalizeText(keyword)));
}

export function symptomsAfterMeal(mealTimestamp, symptomLogs = []) {
  const mealMs = new Date(mealTimestamp).getTime();
  if (Number.isNaN(mealMs)) return [];

  const windowStart = mealMs + SYMPTOM_WINDOW_START_MS;
  const windowEnd = mealMs + SYMPTOM_WINDOW_END_MS;

  return symptomLogs.filter((symptom) => {
    const symptomMs = new Date(symptom.timestamp).getTime();
    return symptomMs >= windowStart && symptomMs <= windowEnd;
  });
}

function declaredSensitivityBoost(catalogItem, declaredSensitivities = []) {
  for (const item of declaredSensitivities) {
    const declared = normalizeText(item.sensitivity_name);
    if (!declared) continue;

    const catalogLabel = normalizeText(catalogItem.food_name);
    if (catalogLabel.includes(declared) || declared.includes(catalogLabel.split('&')[0].trim())) {
      return 25;
    }

    const keywordHit = (catalogItem.keywords || []).some(
      (keyword) => declared.includes(normalizeText(keyword)) || normalizeText(keyword).includes(declared),
    );

    if (keywordHit) return 25;
  }

  return 0;
}

export function calculateFoodSensitivityScores({
  catalog = [],
  foodLogs = [],
  symptomLogs = [],
  declaredSensitivities = [],
}) {
  return catalog
    .map((catalogItem) => {
      const matchingMeals = foodLogs.filter((log) =>
        foodMatchesCatalog(log.foods?.food_name, catalogItem),
      );

      let symptomWeight = 0;
      let reactionMeals = 0;

      matchingMeals.forEach((meal) => {
        const linkedSymptoms = symptomsAfterMeal(meal.timestamp, symptomLogs);
        if (!linkedSymptoms.length) return;

        reactionMeals += 1;
        const mealWeight =
          linkedSymptoms.reduce((sum, symptom) => sum + (symptom.severity || 3), 0) /
          linkedSymptoms.length /
          5;

        symptomWeight += mealWeight;
      });

      const mealCount = matchingMeals.length;
      const reactionRate = mealCount ? symptomWeight / mealCount : 0;
      const dataScore = Math.round(reactionRate * 100);
      const boost = declaredSensitivityBoost(catalogItem, declaredSensitivities);
      const score = Math.min(100, dataScore + boost);

      return {
        catalogId: catalogItem.id,
        foodKey: catalogItem.food_key,
        foodName: catalogItem.food_name,
        emoji: catalogItem.emoji || '🍽',
        keywords: catalogItem.keywords || [],
        score,
        mealCount,
        reactionCount: reactionMeals,
        declaredMatch: boost > 0,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.mealCount - a.mealCount;
    });
}

export function getSensitivityLevel(score) {
  if (score >= 70) return { label: 'Yüksek', color: '#EF4444' };
  if (score >= 40) return { label: 'Orta', color: '#FB923C' };
  if (score > 0) return { label: 'Düşük', color: '#FACC15' };
  return { label: 'Veri yok', color: '#A3A3A3' };
}
