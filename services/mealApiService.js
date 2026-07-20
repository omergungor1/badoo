import Constants, { ExecutionEnvironment } from 'expo-constants';
import { supabase } from '../lib/supabase';

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};
const LOCAL_API_URL = 'http://192.168.1.103:3000';
const PRODUCTION_API_URL = 'https://badoo-api.vercel.app';

function trimTrailingSlash(url) {
  return String(url || '').replace(/\/+$/, '');
}

export function getMealApiBaseUrl() {
  const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

  if (isExpoGo) {
    return trimTrailingSlash(
      process.env.EXPO_PUBLIC_BADOO_API_LOCAL_URL ||
        extra.badooApiLocalUrl ||
        LOCAL_API_URL,
    );
  }

  return trimTrailingSlash(
    process.env.EXPO_PUBLIC_BADOO_API_URL ||
      extra.badooApiUrl ||
      PRODUCTION_API_URL,
  );
}

async function getAccessToken(refresh = false) {
  const result = refresh
    ? await supabase.auth.refreshSession()
    : await supabase.auth.getSession();

  if (result.error) {
    throw result.error;
  }

  const accessToken = result.data?.session?.access_token;
  if (!accessToken) {
    throw new Error('Oturum bulunamadı. Lütfen yeniden giriş yapın.');
  }

  return accessToken;
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

async function requestMealApi(path, createRequest, retryAuth = true) {
  try {
    const accessToken = await getAccessToken(false);
    const request = createRequest();
    let response = await fetch(`${getMealApiBaseUrl()}${path}`, {
      ...request,
      headers: {
        ...request.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401 && retryAuth) {
      const refreshedToken = await getAccessToken(true);
      const retryRequest = createRequest();
      response = await fetch(`${getMealApiBaseUrl()}${path}`, {
        ...retryRequest,
        headers: {
          ...retryRequest.headers,
          Authorization: `Bearer ${refreshedToken}`,
        },
      });
    }

    const payload = await parseResponse(response);
    if (!response.ok) {
      return {
        data: null,
        error: {
          message: payload?.error || 'Öğün analizi başarısız oldu.',
          code: payload?.code || null,
          status: response.status,
        },
      };
    }

    if (!payload?.meal || !Array.isArray(payload?.items)) {
      return {
        data: null,
        error: {
          message: 'Öğün servisinden geçersiz yanıt alındı.',
          code: 'invalid_response',
          status: response.status,
        },
      };
    }

    return { data: payload, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error?.message || 'Öğün servisine bağlanılamadı.',
        code: 'network_error',
      },
    };
  }
}

export async function analyzeMealText(text) {
  const normalized = text?.trim();
  if (!normalized) {
    return { data: null, error: { message: 'Analiz edilecek metin boş olamaz.' } };
  }

  return requestMealApi('/api/meals/analyze-text', () => ({
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: normalized }),
  }));
}

export async function analyzeMealImage(localUri) {
  if (!localUri) {
    return { data: null, error: { message: 'Analiz edilecek fotoğraf bulunamadı.' } };
  }

  return requestMealApi('/api/meals/analyze-image', () => {
    const form = new FormData();
    form.append('image', {
      uri: localUri,
      name: 'meal.jpg',
      type: 'image/jpeg',
    });

    return {
      method: 'POST',
      body: form,
    };
  });
}
