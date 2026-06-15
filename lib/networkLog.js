const LOG_PREFIX = '[Supabase]';

export function maskKey(key) {
  if (!key) return 'MISSING';
  if (key.startsWith('eyJ')) return `jwt:${key.slice(0, 8)}...${key.slice(-4)}`;
  if (key.startsWith('sb_')) return `publishable:${key.slice(0, 16)}...`;
  return `${String(key).slice(0, 8)}...`;
}

export function logSupabaseConfig({ url, key, schema }) {
  // if (!__DEV__) return;

  // console.log(`${LOG_PREFIX} Config`, {
  //   url: url || 'MISSING',
  //   key: maskKey(key),
  //   keyType: key?.startsWith('eyJ') ? 'anon-jwt' : key?.startsWith('sb_') ? 'publishable' : 'unknown',
  //   schema: schema || 'MISSING',
  // });
}

function shortenUrl(url) {
  if (typeof url !== 'string') return String(url);
  return url.replace(/^https?:\/\/[^/]+/, '');
}

export function logFetchStart(url, method) {
  // if (!__DEV__) return;
  // console.log(`${LOG_PREFIX} → ${method || 'GET'} ${shortenUrl(url)}`);
}

export async function logFetchResponse(url, method, response, elapsedMs) {
  // if (!__DEV__) return;

  // const path = shortenUrl(url);
  // const summary = `${LOG_PREFIX} ← ${response.status} ${method || 'GET'} ${path} (${elapsedMs}ms)`;

  // if (response.ok) {
  //   console.log(summary);
  //   return;
  // }

  // let bodyPreview = '';
  // try {
  //   const clone = response.clone();
  //   const text = await clone.text();
  //   bodyPreview = text.slice(0, 400);
  // } catch (readError) {
  //   bodyPreview = `(body okunamadı: ${readError.message})`;
  // }

  // console.warn(summary, {
  //   statusText: response.statusText,
  //   body: bodyPreview || '(boş)',
  // });
}

export function logFetchError(url, method, error, elapsedMs, extra = {}) {
  console.error(`${LOG_PREFIX} ✗ FETCH FAILED (${elapsedMs}ms)`, {
    method: method || 'GET',
    url: typeof url === 'string' ? url : String(url),
    path: shortenUrl(url),
    name: error?.name,
    message: error?.message,
    cause: error?.cause?.message || error?.cause,
    stack: error?.stack,
    ...extra,
  });
}

export function logSupabaseError(context, error, extra = {}) {
  if (!error) return;

  console.error(`${LOG_PREFIX} ${context}`, {
    ...extra,
    name: error.name,
    message: error.message,
    status: error.status,
    code: error.code,
    details: error.details,
    hint: error.hint,
    cause: error.cause?.message || error.cause,
    stack: error.stack,
  });
}
