import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { maskKey } from './networkLog';
import { logFetchError, logFetchResponse, logFetchStart } from './networkLog';

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 600;
const DIAG_LOG_PREFIX = '[Supabase Diag]';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableNetworkError(error) {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('network') ||
    message.includes('connection') ||
    message.includes('fetch failed') ||
    message.includes('request failed')
  );
}

export function getRuntimeNetworkInfo() {
  return {
    platform: Platform.OS,
    isDevice: Constants.isDevice,
    osVersion: Platform.Version,
    executionEnvironment: Constants.executionEnvironment,
  };
}

export function createSupabaseFetch(baseFetch = fetch) {
  return async function supabaseFetch(url, options = {}) {
    const method = options.method || 'GET';
    let lastError;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const started = Date.now();

      if (attempt === 1) {
        logFetchStart(url, method);
      } else if (__DEV__) {
        // console.warn(`[Supabase] yeniden deneme ${attempt}/${MAX_ATTEMPTS}`, {
        //   method,
        //   path: typeof url === 'string' ? url.replace(/^https?:\/\/[^/]+/, '') : String(url),
        //   ...getRuntimeNetworkInfo(),
        // });
      }

      try {
        const response = await baseFetch(url, options);
        await logFetchResponse(url, method, response, Date.now() - started);
        return response;
      } catch (error) {
        lastError = error;
        logFetchError(url, method, error, Date.now() - started, { attempt, maxAttempts: MAX_ATTEMPTS });

        if (attempt < MAX_ATTEMPTS && isRetryableNetworkError(error)) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }

        throw error;
      }
    }

    throw lastError;
  };
}

function unwrapErrorChain(error) {
  const chain = [];
  let current = error;

  while (current) {
    chain.push({
      name: current.name,
      message: current.message,
      code: current.code,
    });
    current = current.cause;
  }

  return chain;
}

function validateSupabaseConfig(supabaseUrl, supabaseAnonKey) {
  const issues = [];

  if (!supabaseUrl) {
    issues.push('EXPO_PUBLIC_SUPABASE_URL tanımlı değil');
  } else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supabaseUrl.replace(/\/$/, ''))) {
    issues.push('Supabase URL formatı beklenenden farklı');
  }

  if (!supabaseAnonKey) {
    issues.push('Anon key tanımlı değil');
  } else if (!supabaseAnonKey.startsWith('eyJ') && !supabaseAnonKey.startsWith('sb_')) {
    issues.push('Anon key formatı tanınmadı (eyJ… veya sb_… beklenir)');
  }

  return {
    ok: issues.length === 0,
    url: supabaseUrl || 'MISSING',
    key: maskKey(supabaseAnonKey),
    keyType: supabaseAnonKey?.startsWith('eyJ')
      ? 'anon-jwt'
      : supabaseAnonKey?.startsWith('sb_')
        ? 'publishable'
        : 'unknown',
    issues,
  };
}

async function probeFetch(label, url, options = {}) {
  const started = Date.now();

  try {
    const response = await fetch(url, { ...options, signal: options.signal });
    let body = '';

    try {
      body = (await response.text()).slice(0, 200);
    } catch (readError) {
      body = `(body okunamadı: ${readError.message})`;
    }

    return {
      label,
      ok: response.ok,
      status: response.status,
      elapsedMs: Date.now() - started,
      body,
    };
  } catch (error) {
    return {
      label,
      ok: false,
      status: 0,
      elapsedMs: Date.now() - started,
      error: error.message,
      errorChain: unwrapErrorChain(error),
    };
  }
}

export const GOOGLE_PING_URL = 'https://clients3.google.com/generate_204';

export async function pingGoogle() {
  return probeFetch('google', GOOGLE_PING_URL);
}

export async function pingSupabase(supabaseUrl, supabaseAnonKey) {
  return probeFetch('supabase', `${supabaseUrl}/auth/v1/health`, {
    method: 'GET',
    headers: { apikey: supabaseAnonKey },
  });
}

export async function testSupabaseConnection(supabaseUrl, supabaseAnonKey) {
  return probeFetch('supabase-health', `${supabaseUrl}/auth/v1/health`, {
    method: 'GET',
    headers: { apikey: supabaseAnonKey },
  });
}

export async function probeConnectionQuick(supabaseUrl, supabaseAnonKey) {
  const result = await testSupabaseConnection(supabaseUrl, supabaseAnonKey);
  return {
    status: result.ok ? 'online' : result.error ? 'offline' : 'degraded',
    ...result,
    runtime: getRuntimeNetworkInfo(),
  };
}

export async function runConnectionDiagnostics(supabaseUrl, supabaseAnonKey) {
  const started = Date.now();
  const runtime = getRuntimeNetworkInfo();
  const config = validateSupabaseConfig(supabaseUrl, supabaseAnonKey);

  console.log(`${DIAG_LOG_PREFIX} başlatıldı`, { runtime, config });

  const probes = await Promise.all([
    probeFetch('genel-internet', GOOGLE_PING_URL),
    probeFetch('supabase-health-raw', `${supabaseUrl}/auth/v1/health`, {
      method: 'GET',
      headers: { apikey: supabaseAnonKey },
    }),
    (async () => {
      const wrappedFetch = createSupabaseFetch(fetch);
      const startedProbe = Date.now();

      try {
        const response = await wrappedFetch(`${supabaseUrl}/auth/v1/health`, {
          method: 'GET',
          headers: { apikey: supabaseAnonKey },
        });
        const body = (await response.text()).slice(0, 200);

        return {
          label: 'supabase-health-wrapped',
          ok: response.ok,
          status: response.status,
          elapsedMs: Date.now() - startedProbe,
          body,
        };
      } catch (error) {
        return {
          label: 'supabase-health-wrapped',
          ok: false,
          status: 0,
          elapsedMs: Date.now() - startedProbe,
          error: error.message,
          errorChain: unwrapErrorChain(error),
        };
      }
    })(),
    probeFetch('supabase-rest', `${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    }),
  ]);

  const generalInternet = probes.find((p) => p.label === 'genel-internet');
  const supabaseRaw = probes.find((p) => p.label === 'supabase-health-raw');
  const supabaseWrapped = probes.find((p) => p.label === 'supabase-health-wrapped');

  const hints = [];

  if (!config.ok) {
    hints.push(`Yapılandırma: ${config.issues.join(', ')}`);
  }

  if (!generalInternet?.ok) {
    hints.push('Genel internet erişimi yok. Wi‑Fi, VPN veya simülatör ağını kontrol edin.');
  } else if (!supabaseRaw?.ok && !supabaseWrapped?.ok) {
    if (runtime.platform === 'ios' && !runtime.isDevice) {
      hints.push(
        'iOS simülatör ağ hatası olabilir. Simülatörü sıfırlayın (Erase All Content) veya fiziksel cihazda deneyin.',
      );
    } else {
      hints.push('İnternet var ama Supabase’e ulaşılamıyor. VPN/firewall veya proje duraklatılmış olabilir.');
    }
  } else if (supabaseRaw?.ok && !supabaseWrapped?.ok) {
    hints.push('Ham fetch çalışıyor, sarmalayıcı fetch başarısız — özel fetch katmanını inceleyin.');
  } else if (supabaseRaw?.status === 401 || supabaseRaw?.status === 403) {
    hints.push('Anahtar veya proje izinleri hatalı (401/403). Dashboard’dan anon key’i doğrulayın.');
  }

  if (supabaseRaw?.elapsedMs < 200 && supabaseRaw?.error?.includes('connection was lost')) {
    hints.push(
      'Çok hızlı bağlantı kopması (~100ms): genelde anahtar değil, yerel ağ katmanı veya simülatör sorunudur.',
    );
  }

  const report = {
    ok: config.ok && supabaseRaw?.ok,
    elapsedMs: Date.now() - started,
    runtime,
    config,
    probes,
    hints,
    summary: hints[0] || (supabaseRaw?.ok ? 'Supabase bağlantısı sağlıklı görünüyor.' : 'Bağlantı testi başarısız.'),
  };

  console.log(`${DIAG_LOG_PREFIX} rapor`, report);

  return report;
}

export function getNetworkErrorHint(error) {
  const runtime = getRuntimeNetworkInfo();
  const isIosSimulator = runtime.platform === 'ios' && !runtime.isDevice;

  if (error?.name === 'AuthRetryableFetchError' || isRetryableNetworkError(error)) {
    if (isIosSimulator) {
      return 'iOS simülatör ağ hatası olabilir. Simülatörü iOS 18.3 veya daha düşük sürüme indirin, simülatörü sıfırlayın (Device > Erase All Content) veya fiziksel cihazda deneyin.';
    }

    return 'Ağ bağlantısı kurulamadı. Wi‑Fi/VPN kontrol edin ve uygulamayı yeniden başlatın.';
  }

  return error?.message || 'Bilinmeyen hata';
}
