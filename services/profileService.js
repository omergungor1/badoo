import { getDb } from '../lib/db';
import { FALLBACK_GOAL_OPTIONS, mapFallbackGoalOptions } from '../constants/goalOptions';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(value) {
  return UUID_RE.test(String(value || ''));
}

async function resolveGoalSelections(goalOptionIds) {
  const uuids = goalOptionIds.filter(isUuid);
  const keys = goalOptionIds.filter((id) => !isUuid(id));
  const resolved = [];

  if (uuids.length) {
    const { data } = await getDb()
      .from('goal_options')
      .select('id, goal_key, goal_name')
      .in('id', uuids)
      .eq('is_active', true);
    resolved.push(...(data || []));
  }

  if (keys.length) {
    const { data } = await getDb()
      .from('goal_options')
      .select('id, goal_key, goal_name')
      .in('goal_key', keys)
      .eq('is_active', true);
    resolved.push(...(data || []));
  }

  const foundKeys = new Set(resolved.map((option) => option.goal_key));

  for (const selected of goalOptionIds) {
    const lookupKey = isUuid(selected)
      ? resolved.find((option) => option.id === selected)?.goal_key
      : selected;

    if (lookupKey && foundKeys.has(lookupKey)) continue;

    const fallback = FALLBACK_GOAL_OPTIONS.find(
      (option) => option.goal_key === selected || option.goal_key === lookupKey,
    );

    if (fallback && !foundKeys.has(fallback.goal_key)) {
      resolved.push({
        id: null,
        goal_key: fallback.goal_key,
        goal_name: fallback.goal_name,
      });
      foundKeys.add(fallback.goal_key);
    }
  }

  return resolved;
}

export async function getProfile(userId) {
  const { data, error } = await getDb()
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return { data, error };
}

export async function upsertProfile(profile) {
  const { data, error } = await getDb()
    .from('profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select()
    .single();

  return { data, error };
}

export async function updateProfile(userId, fields) {
  const { data, error } = await getDb()
    .from('profiles')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  return { data, error };
}

export async function getGoalOptions() {
  const { data, error } = await getDb()
    .from('goal_options')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.warn('[goal_options] veritabanı hatası, yerel liste kullanılıyor:', error.message);
    return { data: mapFallbackGoalOptions(), error: null };
  }

  if (!data?.length) {
    console.warn('[goal_options] liste boş, yerel liste kullanılıyor');
    return { data: mapFallbackGoalOptions(), error: null };
  }

  return { data, error: null };
}

export async function saveGoals(userId, goalOptionIds) {
  if (!goalOptionIds?.length) {
    return { data: [], error: { message: 'En az 3 hedef seçmelisiniz.' } };
  }

  if (goalOptionIds.length < 3) {
    return { data: null, error: { message: 'En az 3 hedef seçmelisiniz.' } };
  }

  const options = await resolveGoalSelections(goalOptionIds);

  if (!options.length || options.length !== goalOptionIds.length) {
    return { data: null, error: { message: 'Geçersiz hedef seçimi.' } };
  }

  const { error: deleteError } = await getDb().from('goals').delete().eq('user_id', userId);
  if (deleteError) return { data: null, error: deleteError };

  const rows = options.map((option) => ({
    user_id: userId,
    goal_option_id: option.id,
    goal_name: option.goal_name,
  }));

  const { data, error } = await getDb().from('goals').insert(rows).select();
  return { data, error };
}

export async function saveConditions(userId, conditions) {
  await getDb().from('conditions').delete().eq('user_id', userId);

  if (!conditions.length) return { data: [], error: null };

  const rows = conditions.map((condition_name) => ({ user_id: userId, condition_name }));
  const { data, error } = await getDb().from('conditions').insert(rows).select();
  return { data, error };
}

export async function saveSensitivities(userId, sensitivities) {
  await getDb().from('food_sensitivities').delete().eq('user_id', userId);

  if (!sensitivities.length) return { data: [], error: null };

  const rows = sensitivities.map((sensitivity_name) => ({ user_id: userId, sensitivity_name }));
  const { data, error } = await getDb().from('food_sensitivities').insert(rows).select();
  return { data, error };
}

export async function saveMedications(userId, medications) {
  await getDb().from('medications').delete().eq('user_id', userId);

  if (!medications.length) return { data: [], error: null };

  const rows = medications.map((medication_name) => ({ user_id: userId, medication_name }));
  const { data, error } = await getDb().from('medications').insert(rows).select();
  return { data, error };
}

export async function getGoals(userId) {
  const { data, error } = await getDb()
    .from('goals')
    .select('id, user_id, goal_option_id, goal_name, created_at')
    .eq('user_id', userId)
    .order('goal_name');
  return { data, error };
}

export async function getConditions(userId) {
  const { data, error } = await getDb()
    .from('conditions')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('condition_name');
  return { data, error };
}

export async function addCondition(userId, conditionName) {
  const trimmed = conditionName.trim();
  if (!trimmed) return { data: null, error: { message: 'Hastalık adı boş olamaz.' } };

  const { data, error } = await getDb()
    .from('conditions')
    .insert({ user_id: userId, condition_name: trimmed })
    .select()
    .single();

  return { data, error };
}

export async function updateCondition(userId, conditionId, conditionName) {
  const trimmed = conditionName.trim();
  if (!trimmed) return { data: null, error: { message: 'Hastalık adı boş olamaz.' } };

  const { data, error } = await getDb()
    .from('conditions')
    .update({ condition_name: trimmed, updated_at: new Date().toISOString() })
    .eq('id', conditionId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .select()
    .single();

  return { data, error };
}

export async function deleteCondition(userId, conditionId) {
  const { data, error } = await getDb()
    .from('conditions')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', conditionId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .select()
    .single();

  return { data, error };
}

export async function getSensitivities(userId) {
  const { data, error } = await getDb()
    .from('food_sensitivities')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('sensitivity_name');
  return { data, error };
}

export async function addSensitivity(userId, sensitivityName) {
  const trimmed = sensitivityName.trim();
  if (!trimmed) return { data: null, error: { message: 'Hassasiyet adı boş olamaz.' } };

  const { data, error } = await getDb()
    .from('food_sensitivities')
    .insert({ user_id: userId, sensitivity_name: trimmed })
    .select()
    .single();

  return { data, error };
}

export async function updateSensitivity(userId, sensitivityId, sensitivityName) {
  const trimmed = sensitivityName.trim();
  if (!trimmed) return { data: null, error: { message: 'Hassasiyet adı boş olamaz.' } };

  const { data, error } = await getDb()
    .from('food_sensitivities')
    .update({ sensitivity_name: trimmed, updated_at: new Date().toISOString() })
    .eq('id', sensitivityId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .select()
    .single();

  return { data, error };
}

export async function deleteSensitivity(userId, sensitivityId) {
  const { data, error } = await getDb()
    .from('food_sensitivities')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', sensitivityId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .select()
    .single();

  return { data, error };
}

export async function getMedications(userId) {
  const { data, error } = await getDb()
    .from('medications')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('medication_name');
  return { data, error };
}

export async function addMedication(userId, medicationName) {
  const trimmed = medicationName.trim();
  if (!trimmed) return { data: null, error: { message: 'İlaç adı boş olamaz.' } };

  const { data, error } = await getDb()
    .from('medications')
    .insert({ user_id: userId, medication_name: trimmed })
    .select()
    .single();

  return { data, error };
}

export async function updateMedication(userId, medicationId, medicationName) {
  const trimmed = medicationName.trim();
  if (!trimmed) return { data: null, error: { message: 'İlaç adı boş olamaz.' } };

  const { data, error } = await getDb()
    .from('medications')
    .update({ medication_name: trimmed, updated_at: new Date().toISOString() })
    .eq('id', medicationId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .select()
    .single();

  return { data, error };
}

export async function deleteMedication(userId, medicationId) {
  const { data, error } = await getDb()
    .from('medications')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', medicationId)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .select()
    .single();

  return { data, error };
}
