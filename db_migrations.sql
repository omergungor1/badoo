-- Beden Günlüğü - Supabase migration
-- Bu dosyayı Supabase SQL Editor'de çalıştırın.

-- 1) Schema API'ye açık olmalı:
--    Supabase Dashboard > Project Settings > Data API > Exposed schemas
--    listesine "badoo" ekleyin (şu an yalnızca public açıksa API 406 döner).

-- 2) profiles genişletme
ALTER TABLE badoo.profiles
  ADD COLUMN IF NOT EXISTS daily_calorie_goal integer,
  ADD COLUMN IF NOT EXISTS daily_protein_goal integer,
  ADD COLUMN IF NOT EXISTS daily_water_goal integer,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS profiles_user_id_unique ON badoo.profiles (user_id);

-- 3) daily_tasks genişletme
ALTER TABLE badoo.daily_tasks
  ADD COLUMN IF NOT EXISTS task_key text,
  ADD COLUMN IF NOT EXISTS task_emoji text,
  ADD COLUMN IF NOT EXISTS task_date date,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS daily_tasks_user_task_date_unique
  ON badoo.daily_tasks (user_id, task_key, task_date);

-- 4) medications soft delete
ALTER TABLE badoo.medications
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 4b) conditions soft delete
ALTER TABLE badoo.conditions
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 4c) food_sensitivities soft delete
ALTER TABLE badoo.food_sensitivities
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 5) timestamp alanları için varsayılan
ALTER TABLE badoo.food_logs ALTER COLUMN timestamp SET DEFAULT now();
ALTER TABLE badoo.water_logs ALTER COLUMN timestamp SET DEFAULT now();
ALTER TABLE badoo.drink_logs ALTER COLUMN timestamp SET DEFAULT now();
ALTER TABLE badoo.medication_logs ALTER COLUMN timestamp SET DEFAULT now();
ALTER TABLE badoo.symptom_logs ALTER COLUMN timestamp SET DEFAULT now();
ALTER TABLE badoo.sleep_logs ALTER COLUMN timestamp SET DEFAULT now();
ALTER TABLE badoo.activity_logs ALTER COLUMN timestamp SET DEFAULT now();
ALTER TABLE badoo.daily_status_logs ALTER COLUMN timestamp SET DEFAULT now();
ALTER TABLE badoo.notes ALTER COLUMN timestamp SET DEFAULT now();
ALTER TABLE badoo.stool_logs ALTER COLUMN time SET DEFAULT now();

-- 5b) sleep_logs ara uyku süresi (dakika)
ALTER TABLE badoo.sleep_logs
  ADD COLUMN IF NOT EXISTS duration_minutes integer;

-- 5c) foods birim tipi + food_logs ondalık miktar
ALTER TABLE badoo.foods
  ADD COLUMN IF NOT EXISTS unit_type text NOT NULL DEFAULT 'gram';

ALTER TABLE badoo.food_logs
  ALTER COLUMN quantity TYPE numeric USING quantity::numeric;

UPDATE badoo.foods SET unit_type = 'adet', calories = 5, protein = 0, carbohydrates = 0, fats = 1
WHERE food_name ILIKE '%zeytin%';

UPDATE badoo.foods SET unit_type = 'adet'
WHERE food_name ILIKE '%(1 adet)%'
   OR food_name ILIKE '%(1 dilim)%'
   OR food_name ILIKE '%(1 porsiyon)%'
   OR food_name IN ('Yumurta', 'Muz', 'Avokado', 'Simit', 'Börek', 'Ekmek');

UPDATE badoo.foods SET unit_type = 'bardak'
WHERE food_name ILIKE '%(1 bardak)%'
   OR food_name ILIKE '%(1 fincan)%'
   OR food_name ILIKE '%ayran%'
   OR food_name IN ('Ayran', 'Çay', 'Kahve');

-- 6) Yetkiler
GRANT USAGE ON SCHEMA badoo TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA badoo TO authenticated;
-- Yapılmadı altta 2 sorgu:
GRANT SELECT ON badoo.foods TO anon;
GRANT SELECT, INSERT ON badoo.foods TO authenticated;

-- 7) RLS
ALTER TABLE badoo.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.food_sensitivities ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.drink_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.stool_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.daily_status_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.goals ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles_own" ON badoo.profiles;
CREATE POLICY "profiles_own" ON badoo.profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- user scoped tables helper macro pattern
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'conditions','food_sensitivities','food_logs','water_logs','drink_logs',
    'medications','medication_logs','symptom_logs','stool_logs','sleep_logs',
    'activity_logs','daily_status_logs','notes','daily_tasks','goals'
  ]
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON badoo.%I', t || '_own', t);
    EXECUTE format(
      'CREATE POLICY %I ON badoo.%I FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)',
      t || '_own', t
    );
  END LOOP;
END $$;

-- foods (global read, authenticated insert)
DROP POLICY IF EXISTS "foods_read" ON badoo.foods;
CREATE POLICY "foods_read" ON badoo.foods
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "foods_insert" ON badoo.foods;
CREATE POLICY "foods_insert" ON badoo.foods
  FOR INSERT TO authenticated WITH CHECK (true);

-- 8) Türk yemekleri seed (tekrar çalıştırmada çoğaltmamak için kontrol)
INSERT INTO badoo.foods (food_name, unit_type, calories, protein, carbohydrates, fats)
SELECT * FROM (VALUES
  ('Yumurta', 'adet', 78, 6, 1, 5),
  ('Menemen', 'gram', 180, 10, 8, 12),
  ('Mercimek Çorbası', 'gram', 150, 9, 20, 3),
  ('Kuru Fasulye', 'gram', 220, 12, 28, 6),
  ('Pilav', 'gram', 200, 4, 40, 3),
  ('Tavuk Göğsü', 'gram', 165, 31, 0, 4),
  ('Ayran', 'bardak', 80, 4, 6, 3),
  ('Muz', 'adet', 105, 1, 27, 0),
  ('Avokado', 'adet', 160, 2, 9, 15),
  ('Simit', 'adet', 280, 8, 50, 5),
  ('Börek', 'adet', 320, 8, 30, 18),
  ('Köfte', 'gram', 250, 18, 5, 18),
  ('Cacık', 'gram', 90, 4, 6, 5),
  ('Salata (yeşil)', 'gram', 60, 2, 8, 2),
  ('Zeytin', 'adet', 5, 0, 0, 1),
  ('Peynir', 'gram', 90, 6, 1, 7),
  ('Ekmek', 'adet', 80, 3, 15, 1),
  ('Balık Izgara', 'gram', 170, 22, 0, 8),
  ('Makarna', 'gram', 180, 6, 35, 2),
  ('Yoğurt', 'gram', 90, 5, 7, 4),
  ('Çilek', 'gram', 32, 1, 8, 0),
  ('Çay', 'bardak', 2, 0, 0, 0),
  ('Kahve', 'bardak', 5, 0, 1, 0)
) AS v(food_name, unit_type, calories, protein, carbohydrates, fats)
WHERE NOT EXISTS (
  SELECT 1 FROM badoo.foods f WHERE f.food_name = v.food_name
);

-- 9) goal_options tablosu ve seed
CREATE TABLE IF NOT EXISTS badoo.goal_options (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_key text UNIQUE NOT NULL,
  goal_name text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE badoo.goals
  ADD COLUMN IF NOT EXISTS goal_option_id uuid REFERENCES badoo.goal_options(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS goals_user_option_unique
  ON badoo.goals (user_id, goal_option_id);

ALTER TABLE badoo.goal_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "goal_options_read" ON badoo.goal_options;
CREATE POLICY "goal_options_read" ON badoo.goal_options
  FOR SELECT TO anon, authenticated USING (is_active = true);

GRANT SELECT ON badoo.goal_options TO anon, authenticated;

INSERT INTO badoo.goal_options (goal_key, goal_name, sort_order)
SELECT * FROM (VALUES
  ('lose_weight', 'Kilo vermek', 1),
  ('gain_weight', 'Kilo almak', 2),
  ('maintain_weight', 'Kilosunu korumak', 3),
  ('understand_digestion', 'Sindirim sistemini anlamak', 4),
  ('track_protein', 'Protein takibi yapmak', 5),
  ('healthy_life', 'Sağlıklı yaşam', 6)
) AS v(goal_key, goal_name, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM badoo.goal_options g WHERE g.goal_key = v.goal_key
);

-- 10) Regl takibi tabloları
CREATE TABLE IF NOT EXISTS badoo.period_symptom_options (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  symptom_key text UNIQUE NOT NULL,
  symptom_name text NOT NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS badoo.period_cycles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS badoo.period_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  cycle_id uuid REFERENCES badoo.period_cycles(id) ON DELETE CASCADE,
  log_type text NOT NULL,
  symptom_option_id uuid REFERENCES badoo.period_symptom_options(id) ON DELETE SET NULL,
  symptom_name text,
  flow_level text,
  note text,
  logged_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS period_cycles_user_start_idx
  ON badoo.period_cycles (user_id, start_date DESC);

CREATE INDEX IF NOT EXISTS period_logs_cycle_idx
  ON badoo.period_logs (cycle_id, logged_at DESC);

ALTER TABLE badoo.period_symptom_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.period_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.period_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "period_symptom_options_read" ON badoo.period_symptom_options;
CREATE POLICY "period_symptom_options_read" ON badoo.period_symptom_options
  FOR SELECT TO anon, authenticated USING (is_active = true);

DROP POLICY IF EXISTS "period_cycles_own" ON badoo.period_cycles;
CREATE POLICY "period_cycles_own" ON badoo.period_cycles
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "period_logs_own" ON badoo.period_logs;
CREATE POLICY "period_logs_own" ON badoo.period_logs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

GRANT SELECT ON badoo.period_symptom_options TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.period_cycles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.period_logs TO authenticated;

INSERT INTO badoo.period_symptom_options (symptom_key, symptom_name, sort_order)
SELECT * FROM (VALUES
  ('cramp', 'Kramp', 1),
  ('bloating', 'Şişkinlik', 2),
  ('headache', 'Baş ağrısı', 3),
  ('fatigue', 'Yorgunluk', 4),
  ('mood', 'Ruh hali değişimi', 5),
  ('breast_tenderness', 'Göğüs hassasiyeti', 6),
  ('discharge', 'Akıntı', 7),
  ('spotting', 'Lekelenme', 8),
  ('back_pain', 'Bel ağrısı', 9),
  ('nausea', 'Mide bulantısı', 10),
  ('acne', 'Akne', 11),
  ('craving', 'İştah / şeker isteği', 12),
  ('insomnia', 'Uyku sorunu', 13),
  ('diarrhea', 'İshal', 14),
  ('constipation', 'Kabızlık', 15)
) AS v(symptom_key, symptom_name, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM badoo.period_symptom_options s WHERE s.symptom_key = v.symptom_key
);

-- 11) MVP: goal_options + period tabloları Data API erişimi (RLS kapalı)
-- Not: Dashboard > Project Settings > Data API > Exposed schemas içinde
--      "badoo" şeması da açık olmalı. Sonra "Reload schema" yapın.

ALTER TABLE badoo.goal_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.period_symptom_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.period_cycles DISABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.period_logs DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "goal_options_read" ON badoo.goal_options;
DROP POLICY IF EXISTS "period_symptom_options_read" ON badoo.period_symptom_options;
DROP POLICY IF EXISTS "period_cycles_own" ON badoo.period_cycles;
DROP POLICY IF EXISTS "period_logs_own" ON badoo.period_logs;

GRANT USAGE ON SCHEMA badoo TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.goal_options TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.period_symptom_options TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.period_cycles TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.period_logs TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA badoo TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA badoo
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA badoo
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;
