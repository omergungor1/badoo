import { DB_SCHEMA } from './constants';
import { supabase } from './supabase';

export function getDb() {
  return supabase.schema(DB_SCHEMA);
}
