import { FOOD_UNIT_NUTRITION_HINTS } from '../constants/foodUnits';
import { getOpenAiApiKey } from '../lib/openai';

function toInt(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num);
}

function parseNutritionPayload(raw) {
  if (!raw || typeof raw !== 'object') {
    return { data: null, error: { message: 'OpenAI yanıtı okunamadı.' } };
  }

  const nutrition = {
    calories: toInt(raw.calories),
    protein: toInt(raw.protein),
    carbohydrates: toInt(raw.carbohydrates),
    fats: toInt(raw.fats),
  };

  const hasValue = Object.values(nutrition).some((value) => value != null);
  if (!hasValue) {
    return { data: null, error: { message: 'Besin değerleri alınamadı.' } };
  }

  return { data: nutrition, error: null };
}

export async function lookupFoodNutrition(foodName, unitType = 'gram') {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    return {
      data: null,
      error: { message: 'OPENAI_API_KEY tanımlı değil. .env dosyasını kontrol edin.' },
    };
  }

  const basis = FOOD_UNIT_NUTRITION_HINTS[unitType] || FOOD_UNIT_NUTRITION_HINTS.gram;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Sen bir beslenme uzmanısın. Türkiye\'de tüketilen yiyecek ve içecekler için gerçekçi ortalama besin değeri tahminleri yap. Yalnızca geçerli JSON döndür. Tüm alanlar tam sayı olmalı: calories (kcal), protein (g), carbohydrates (g), fats (g).',
          },
          {
            role: 'user',
            content: `Yiyecek/içecek: "${foodName}". Değerler şu baz için olmalı: ${basis}. Bardak için standart bir bardak (yaklaşık 200 ml) kabul et.`,
          },
        ],
      }),
    });

    const payload = await response.json();

    if (!response.ok) {
      const message = payload?.error?.message || 'OpenAI isteği başarısız oldu.';
      return { data: null, error: { message } };
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (!content) {
      return { data: null, error: { message: 'OpenAI boş yanıt döndürdü.' } };
    }

    const parsed = JSON.parse(content);
    return parseNutritionPayload(parsed);
  } catch (error) {
    return {
      data: null,
      error: { message: error.message || 'Besin değerleri alınırken hata oluştu.' },
    };
  }
}
