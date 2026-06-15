import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';
import { DB_SCHEMA } from './constants';
import { logSupabaseConfig } from './networkLog';
import { createSupabaseFetch, getRuntimeNetworkInfo } from './supabaseFetch';
import { supabaseStorage } from './supabaseStorage';

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || extra.supabaseUrl;
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  extra.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase ortam değişkenleri eksik. .env dosyasında EXPO_PUBLIC_SUPABASE_URL ve EXPO_PUBLIC_ANON_KEY tanımlayın.',
  );
}

logSupabaseConfig({ url: supabaseUrl, key: supabaseAnonKey, schema: DB_SCHEMA });

// if (__DEV__) {
//   console.log('[Supabase] Runtime', getRuntimeNetworkInfo());
// }

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: DB_SCHEMA,
  },
  global: {
    fetch: createSupabaseFetch(fetch),
  },
});

export { supabaseUrl, supabaseAnonKey };
