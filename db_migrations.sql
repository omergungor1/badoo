-- badoo - Supabase migration
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
  ADD COLUMN IF NOT EXISTS unit_type text NOT NULL DEFAULT 'gram';

ALTER TABLE badoo.food_logs
  ALTER COLUMN quantity TYPE numeric USING quantity::numeric;

ALTER TABLE badoo.foods DROP CONSTRAINT IF EXISTS foods_unit_type_check;
ALTER TABLE badoo.food_logs DROP CONSTRAINT IF EXISTS food_logs_unit_type_check;

UPDATE badoo.foods
SET unit_type = CASE unit_type
  WHEN 'adet' THEN 'piece'
  WHEN 'bardak' THEN 'cup'
  ELSE unit_type
END;

UPDATE badoo.food_logs
SET unit_type = CASE unit_type
  WHEN 'adet' THEN 'piece'
  WHEN 'bardak' THEN 'cup'
  ELSE unit_type
END;

UPDATE badoo.foods SET unit_type = 'piece', calories = 5, protein = 0, carbohydrates = 0, fats = 1
WHERE food_name ILIKE '%zeytin%';

UPDATE badoo.foods SET unit_type = 'piece'
WHERE food_name ILIKE '%(1 adet)%'
   OR food_name ILIKE '%(1 dilim)%'
   OR food_name ILIKE '%(1 porsiyon)%'
   OR food_name IN ('Yumurta', 'Muz', 'Avokado', 'Simit', 'Börek', 'Ekmek');

UPDATE badoo.foods SET unit_type = 'cup'
WHERE food_name ILIKE '%(1 bardak)%'
   OR food_name ILIKE '%(1 fincan)%'
   OR food_name ILIKE '%ayran%'
   OR food_name IN ('Ayran', 'Çay', 'Kahve');

UPDATE badoo.food_logs AS fl
SET unit_type = f.unit_type
FROM badoo.foods AS f
WHERE fl.food_id = f.id;

ALTER TABLE badoo.foods
  ADD CONSTRAINT foods_unit_type_check
  CHECK (unit_type IN ('gram', 'piece', 'cup', 'ml', 'tbsp', 'slice'));

ALTER TABLE badoo.food_logs
  ADD CONSTRAINT food_logs_unit_type_check
  CHECK (unit_type IN ('gram', 'piece', 'cup', 'ml', 'tbsp', 'slice'));

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
  ('Yumurta', 'piece', 78, 6, 1, 5),
  ('Menemen', 'gram', 180, 10, 8, 12),
  ('Mercimek Çorbası', 'gram', 150, 9, 20, 3),
  ('Kuru Fasulye', 'gram', 220, 12, 28, 6),
  ('Pilav', 'gram', 200, 4, 40, 3),
  ('Tavuk Göğsü', 'gram', 165, 31, 0, 4),
  ('Ayran', 'cup', 80, 4, 6, 3),
  ('Muz', 'piece', 105, 1, 27, 0),
  ('Avokado', 'piece', 160, 2, 9, 15),
  ('Simit', 'piece', 280, 8, 50, 5),
  ('Börek', 'piece', 320, 8, 30, 18),
  ('Köfte', 'gram', 250, 18, 5, 18),
  ('Cacık', 'gram', 90, 4, 6, 5),
  ('Salata (yeşil)', 'gram', 60, 2, 8, 2),
  ('Zeytin', 'piece', 5, 0, 0, 1),
  ('Peynir', 'gram', 90, 6, 1, 7),
  ('Ekmek', 'piece', 80, 3, 15, 1),
  ('Balık Izgara', 'gram', 170, 22, 0, 8),
  ('Makarna', 'gram', 180, 6, 35, 2),
  ('Yoğurt', 'gram', 90, 5, 7, 4),
  ('Çilek', 'gram', 32, 1, 8, 0),
  ('Çay', 'cup', 2, 0, 0, 0),
  ('Kahve', 'cup', 5, 0, 1, 0)
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
ALTER TABLE badoo.common_sensitivity_foods DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "goal_options_read" ON badoo.goal_options;
DROP POLICY IF EXISTS "period_symptom_options_read" ON badoo.period_symptom_options;
DROP POLICY IF EXISTS "period_cycles_own" ON badoo.period_cycles;
DROP POLICY IF EXISTS "period_logs_own" ON badoo.period_logs;
DROP POLICY IF EXISTS "common_sensitivity_foods_read" ON badoo.common_sensitivity_foods;

GRANT USAGE ON SCHEMA badoo TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.goal_options TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.period_symptom_options TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.period_cycles TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.period_logs TO anon, authenticated, service_role;
GRANT SELECT ON badoo.common_sensitivity_foods TO anon, authenticated, service_role;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA badoo TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA badoo
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA badoo
  GRANT USAGE, SELECT ON SEQUENCES TO anon, authenticated, service_role;

-- foods güncelleme (besin değerlerini manuel düzenleme)
GRANT UPDATE ON badoo.foods TO authenticated;

DROP POLICY IF EXISTS "foods_update" ON badoo.foods;
CREATE POLICY "foods_update" ON badoo.foods
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- profiles sosyal alanları (nickname, bio, profil fotoğrafı)
ALTER TABLE badoo.profiles
  ADD COLUMN IF NOT EXISTS nickname text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS profile_image_url text,
  ADD COLUMN IF NOT EXISTS profile_image_thumb_url text;

-- public profil fotoğrafları bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "profile_images_public_read" ON storage.objects;
CREATE POLICY "profile_images_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'profile-images');

DROP POLICY IF EXISTS "profile_images_insert_own" ON storage.objects;
CREATE POLICY "profile_images_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "profile_images_update_own" ON storage.objects;
CREATE POLICY "profile_images_update_own" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "profile_images_delete_own" ON storage.objects;
CREATE POLICY "profile_images_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- common_sensitivity_foods (Türkiye'de sık görülen besin hassasiyetleri)
CREATE TABLE IF NOT EXISTS badoo.common_sensitivity_foods (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  food_key text UNIQUE NOT NULL,
  food_name text NOT NULL,
  emoji text,
  keywords text[] NOT NULL DEFAULT '{}',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE badoo.common_sensitivity_foods DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "common_sensitivity_foods_read" ON badoo.common_sensitivity_foods;

GRANT SELECT ON badoo.common_sensitivity_foods TO anon, authenticated, service_role;

INSERT INTO badoo.common_sensitivity_foods (food_key, food_name, emoji, keywords, sort_order)
SELECT * FROM (VALUES
  ('milk', 'Süt & Laktoz', '🥛', ARRAY['süt','laktoz','ayran','yoğurt','peynir','kefir','kaymak'], 1),
  ('gluten', 'Gluten & Buğday', '🌾', ARRAY['gluten','buğday','ekmek','makarna','börek','simit','un','bulgur'], 2),
  ('egg', 'Yumurta', '🥚', ARRAY['yumurta','menemen','omlet'], 3),
  ('nuts', 'Kuruyemiş', '🥜', ARRAY['fıstık','fındık','ceviz','badem','kuruyemiş'], 4),
  ('legumes', 'Baklagiller', '🫘', ARRAY['mercimek','nohut','fasulye','bakla','bezelye','barbunya'], 5),
  ('onion_garlic', 'Soğan & Sarımsak', '🧅', ARRAY['soğan','sarımsak'], 6),
  ('tomato', 'Domates', '🍅', ARRAY['domates','salça'], 7),
  ('coffee', 'Kahve', '☕', ARRAY['kahve','espresso','latte','cappuccino','türk kahvesi'], 8),
  ('citrus', 'Narenciye', '🍊', ARRAY['portakal','limon','greyfurt','mandalina'], 9),
  ('spicy', 'Acı Baharat', '🌶️', ARRAY['acı','isot','pul biber'], 10),
  ('chocolate', 'Çikolata', '🍫', ARRAY['çikolata','kakao'], 11),
  ('seafood', 'Deniz Ürünleri', '🦐', ARRAY['balık','karides','midye','hamsi','levrek','somon','deniz'], 12),
  ('soy', 'Soya', '🫛', ARRAY['soya','tofu','edamame'], 13),
  ('cabbage', 'Lahana & Brokoli', '🥦', ARRAY['lahana','brokoli','karnabahar','brüksel'], 14),
  ('fried', 'Kızartma & Yağlı', '🍟', ARRAY['kızart','patates','tava'], 15)
) AS v(food_key, food_name, emoji, keywords, sort_order)
WHERE NOT EXISTS (
  SELECT 1 FROM badoo.common_sensitivity_foods c WHERE c.food_key = v.food_key
);

-- günlük aktivite hedefi (adım veya km)
ALTER TABLE badoo.profiles
  ADD COLUMN IF NOT EXISTS daily_activity_goal integer DEFAULT 10000;

ALTER TABLE badoo.profiles
  ADD COLUMN IF NOT EXISTS daily_activity_goal_type text DEFAULT 'steps';

UPDATE badoo.profiles
SET daily_activity_goal = 10000,
    daily_activity_goal_type = 'steps'
WHERE daily_activity_goal IS NULL
   OR daily_activity_goal <= 100;

UPDATE badoo.profiles
SET daily_activity_goal_type = 'steps'
WHERE daily_activity_goal_type IS NULL;

-- aktivite kaynakları (apple_health / manual)
ALTER TABLE badoo.activity_logs
  ADD COLUMN IF NOT EXISTS steps integer;

ALTER TABLE badoo.activity_logs
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';

UPDATE badoo.activity_logs
SET source = 'manual'
WHERE source IS NULL;

ALTER TABLE badoo.activity_logs
  ALTER COLUMN distance TYPE numeric USING distance::numeric;

-- FCM push tokenları (Firebase Cloud Messaging, Supabase auth ile eşleşir)
CREATE TABLE IF NOT EXISTS badoo.device_push_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  fcm_token text NOT NULL,
  platform text NOT NULL DEFAULT 'ios',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, fcm_token)
);

ALTER TABLE badoo.device_push_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "device_push_tokens_own" ON badoo.device_push_tokens;
CREATE POLICY "device_push_tokens_own" ON badoo.device_push_tokens
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.device_push_tokens TO authenticated;

-- Arkadaşlık, süreli notlar ve bildirimler
CREATE TABLE IF NOT EXISTS badoo.friendships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT friendships_no_self CHECK (requester_id != addressee_id),
  CONSTRAINT friendships_status_check CHECK (status IN ('pending', 'accepted', 'rejected'))
);

CREATE UNIQUE INDEX IF NOT EXISTS friendships_pair_unique ON badoo.friendships (
  LEAST(requester_id, addressee_id),
  GREATEST(requester_id, addressee_id)
);

CREATE TABLE IF NOT EXISTS badoo.friend_notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  message text NOT NULL,
  duration_hours integer NOT NULL DEFAULT 8,
  expires_at timestamptz NOT NULL,
  parent_note_id uuid REFERENCES badoo.friend_notes(id) ON DELETE SET NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS friend_notes_receiver_active_idx
  ON badoo.friend_notes (receiver_id, expires_at DESC);

CREATE TABLE IF NOT EXISTS badoo.friend_nudges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS badoo.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  sender_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  body text,
  payload jsonb DEFAULT '{}',
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
  ON badoo.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_unread_idx
  ON badoo.notifications (user_id)
  WHERE read_at IS NULL;

-- Arkadaşlık kontrol fonksiyonu
CREATE OR REPLACE FUNCTION badoo.are_friends(user_a uuid, user_b uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = badoo
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM badoo.friendships f
    WHERE f.status = 'accepted'
      AND (
        (f.requester_id = user_a AND f.addressee_id = user_b)
        OR (f.requester_id = user_b AND f.addressee_id = user_a)
      )
  );
$$;

GRANT EXECUTE ON FUNCTION badoo.are_friends(uuid, uuid) TO authenticated;

-- RLS
ALTER TABLE badoo.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.friend_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.friend_nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_discover" ON badoo.profiles;
CREATE POLICY "profiles_discover" ON badoo.profiles
  FOR SELECT TO authenticated
  USING (onboarding_completed = true AND user_id IS NOT NULL);

DROP POLICY IF EXISTS "friendships_participant" ON badoo.friendships;
CREATE POLICY "friendships_participant" ON badoo.friendships
  FOR ALL TO authenticated
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id)
  WITH CHECK (auth.uid() = requester_id OR auth.uid() = addressee_id);

DROP POLICY IF EXISTS "friend_notes_participant" ON badoo.friend_notes;
CREATE POLICY "friend_notes_participant" ON badoo.friend_notes
  FOR ALL TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (
    auth.uid() = sender_id
    AND badoo.are_friends(auth.uid(), receiver_id)
  );

DROP POLICY IF EXISTS "friend_nudges_participant" ON badoo.friend_nudges;
CREATE POLICY "friend_nudges_participant" ON badoo.friend_nudges
  FOR ALL TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id)
  WITH CHECK (
    auth.uid() = sender_id
    AND badoo.are_friends(auth.uid(), receiver_id)
  );

DROP POLICY IF EXISTS "notifications_own" ON badoo.notifications;
CREATE POLICY "notifications_own" ON badoo.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert" ON badoo.notifications;
CREATE POLICY "notifications_insert" ON badoo.notifications
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    OR sender_id IS NULL
  );

DROP POLICY IF EXISTS "notifications_update_own" ON badoo.notifications;
CREATE POLICY "notifications_update_own" ON badoo.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Arkadaşların günlük halka verisini görmek için okuma
DROP POLICY IF EXISTS "food_logs_friends_read" ON badoo.food_logs;
CREATE POLICY "food_logs_friends_read" ON badoo.food_logs
  FOR SELECT TO authenticated
  USING (badoo.are_friends(auth.uid(), user_id));

DROP POLICY IF EXISTS "water_logs_friends_read" ON badoo.water_logs;
CREATE POLICY "water_logs_friends_read" ON badoo.water_logs
  FOR SELECT TO authenticated
  USING (badoo.are_friends(auth.uid(), user_id));

DROP POLICY IF EXISTS "activity_logs_friends_read" ON badoo.activity_logs;
CREATE POLICY "activity_logs_friends_read" ON badoo.activity_logs
  FOR SELECT TO authenticated
  USING (badoo.are_friends(auth.uid(), user_id));

GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.friendships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.friend_notes TO authenticated;
GRANT SELECT, INSERT ON badoo.friend_nudges TO authenticated;
GRANT SELECT, INSERT, UPDATE ON badoo.notifications TO authenticated;

-- AI sağlık analizleri (RLS kapalı MVP)
CREATE TABLE IF NOT EXISTS badoo.health_ai_analyses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  summary text,
  analysis_text text NOT NULL,
  input_snapshot jsonb DEFAULT '{}',
  period_start date NOT NULL,
  period_end date NOT NULL,
  model text DEFAULT 'gpt-4o-mini',
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS health_ai_analyses_user_created_idx
  ON badoo.health_ai_analyses (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.health_ai_analyses TO authenticated;

-- Mesaj insert → push bildirimi (edge function: on-friend-message)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS badoo.runtime_config (
  key text PRIMARY KEY,
  value text NOT NULL
);

COMMENT ON TABLE badoo.runtime_config IS
  'Deploy sonrası doldur: friend_message_webhook_url, webhook_secret, service_role_key';

ALTER TABLE badoo.runtime_config ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION badoo.trigger_friend_message_push()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = badoo, public, extensions
AS $$
DECLARE
  webhook_url text;
  webhook_secret text;
  service_role_key text;
  req_headers jsonb;
BEGIN
  SELECT value INTO webhook_url FROM badoo.runtime_config WHERE key = 'friend_message_webhook_url';
  SELECT value INTO webhook_secret FROM badoo.runtime_config WHERE key = 'webhook_secret';
  SELECT value INTO service_role_key FROM badoo.runtime_config WHERE key = 'service_role_key';

  IF webhook_url IS NULL OR webhook_url = '' THEN
    RETURN NEW;
  END IF;

  IF (webhook_secret IS NULL OR webhook_secret = '')
     AND (service_role_key IS NULL OR service_role_key = '') THEN
    RETURN NEW;
  END IF;

  req_headers := jsonb_build_object('Content-Type', 'application/json');

  IF webhook_secret IS NOT NULL AND webhook_secret <> '' THEN
    req_headers := req_headers || jsonb_build_object('X-Webhook-Secret', webhook_secret);
  END IF;

  IF service_role_key IS NOT NULL AND service_role_key <> '' THEN
    req_headers := req_headers || jsonb_build_object('Authorization', 'Bearer ' || service_role_key);
  END IF;

  PERFORM net.http_post(
    url := webhook_url,
    headers := req_headers,
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', to_jsonb(NEW)
    ),
    timeout_milliseconds := 5000
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS friend_notes_push_after_insert ON badoo.friend_notes;
CREATE TRIGGER friend_notes_push_after_insert
  AFTER INSERT ON badoo.friend_notes
  FOR EACH ROW
  EXECUTE FUNCTION badoo.trigger_friend_message_push();

-- Deploy sonrası SQL Editor'de çalıştır:
-- INSERT INTO badoo.runtime_config (key, value) VALUES
--   ('friend_message_webhook_url', 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/on-friend-message'),
--   ('webhook_secret', 'YOUR_WEBHOOK_SECRET'),
--   ('service_role_key', 'YOUR_SERVICE_ROLE_KEY')
-- ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
--
-- DOĞRU URL:  .../functions/v1/on-friend-message  (sonunda TEK kez!)
-- YANLIŞ URL: .../on-friend-message/on-friend-message
-- YANLIŞ URL: .../send-push-notification/on-friend-message

-- 12) Stories (24 saatlik, Instagram benzeri)
CREATE TABLE IF NOT EXISTS badoo.stories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  image_path text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS stories_user_active_idx
  ON badoo.stories (user_id, expires_at DESC);

CREATE INDEX IF NOT EXISTS stories_expires_at_idx
  ON badoo.stories (expires_at);

ALTER TABLE badoo.stories DISABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.stories TO anon, authenticated, service_role;

-- stories storage bucket (public read, MVP açık yazma)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'stories',
  'stories',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "stories_public_read" ON storage.objects;
CREATE POLICY "stories_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'stories');

DROP POLICY IF EXISTS "stories_insert_mvp" ON storage.objects;
CREATE POLICY "stories_insert_mvp" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'stories');

DROP POLICY IF EXISTS "stories_update_mvp" ON storage.objects;
CREATE POLICY "stories_update_mvp" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'stories')
  WITH CHECK (bucket_id = 'stories');

DROP POLICY IF EXISTS "stories_delete_mvp" ON storage.objects;
CREATE POLICY "stories_delete_mvp" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'stories');

-- 13) Öğün fotoğrafları (food_logs genişletme, meal-photos bucket)
ALTER TABLE badoo.food_logs ADD COLUMN IF NOT EXISTS meal_title text;
ALTER TABLE badoo.food_logs ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE badoo.food_logs ADD COLUMN IF NOT EXISTS image_path text;
ALTER TABLE badoo.food_logs ADD COLUMN IF NOT EXISTS calories integer;
ALTER TABLE badoo.food_logs ADD COLUMN IF NOT EXISTS protein integer;
ALTER TABLE badoo.food_logs ADD COLUMN IF NOT EXISTS carbohydrates integer;
ALTER TABLE badoo.food_logs ADD COLUMN IF NOT EXISTS fats integer;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'meal-photos',
  'meal-photos',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "meal_photos_public_read" ON storage.objects;
CREATE POLICY "meal_photos_public_read" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'meal-photos');

DROP POLICY IF EXISTS "meal_photos_insert_mvp" ON storage.objects;
CREATE POLICY "meal_photos_insert_mvp" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'meal-photos');

DROP POLICY IF EXISTS "meal_photos_update_mvp" ON storage.objects;
CREATE POLICY "meal_photos_update_mvp" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'meal-photos')
  WITH CHECK (bucket_id = 'meal-photos');

DROP POLICY IF EXISTS "meal_photos_delete_mvp" ON storage.objects;
CREATE POLICY "meal_photos_delete_mvp" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'meal-photos');

-- 14) food_logs soft delete
ALTER TABLE badoo.food_logs
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

DROP POLICY IF EXISTS "food_logs_friends_read" ON badoo.food_logs;
CREATE POLICY "food_logs_friends_read" ON badoo.food_logs
  FOR SELECT TO authenticated
  USING (badoo.are_friends(auth.uid(), user_id) AND deleted_at IS NULL);

-- 15) AI meal API: meals + food_logs ilişkisi ve İngilizce birimler
CREATE TABLE IF NOT EXISTS badoo.meals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  meal_title text,
  source text NOT NULL CHECK (source IN ('image', 'voice', 'manual')),
  raw_input text,
  image_url text,
  image_path text,
  total_calories integer NOT NULL DEFAULT 0,
  total_protein integer NOT NULL DEFAULT 0,
  total_carbohydrates integer NOT NULL DEFAULT 0,
  total_fats integer NOT NULL DEFAULT 0,
  eaten_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE badoo.food_logs ADD COLUMN IF NOT EXISTS meal_id uuid;
ALTER TABLE badoo.food_logs ADD COLUMN IF NOT EXISTS unit_type text NOT NULL DEFAULT 'gram';
ALTER TABLE badoo.food_logs ADD COLUMN IF NOT EXISTS is_manual boolean NOT NULL DEFAULT false;
ALTER TABLE badoo.food_logs ADD COLUMN IF NOT EXISTS food_name text;

ALTER TABLE badoo.food_logs
  DROP CONSTRAINT IF EXISTS food_logs_meal_id_fkey;

ALTER TABLE badoo.food_logs
  ADD CONSTRAINT food_logs_meal_id_fkey
  FOREIGN KEY (meal_id) REFERENCES badoo.meals(id) ON DELETE CASCADE;

GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.meals TO authenticated;

ALTER TABLE badoo.meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meals_own" ON badoo.meals;
CREATE POLICY "meals_own" ON badoo.meals
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- Besin hassasiyeti AI analizleri
ALTER TABLE badoo.health_ai_analyses
  ADD COLUMN IF NOT EXISTS analysis_type text NOT NULL DEFAULT 'general';

ALTER TABLE badoo.health_ai_analyses
  ADD COLUMN IF NOT EXISTS food_key text;

ALTER TABLE badoo.health_ai_analyses
  ADD COLUMN IF NOT EXISTS food_name text;

UPDATE badoo.health_ai_analyses
SET analysis_type = 'general'
WHERE analysis_type IS NULL;

CREATE INDEX IF NOT EXISTS health_ai_analyses_user_food_created_idx
  ON badoo.health_ai_analyses (user_id, food_key, created_at DESC)
  WHERE food_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS health_ai_analyses_user_type_created_idx
  ON badoo.health_ai_analyses (user_id, analysis_type, created_at DESC);

-- ============================================================
-- Dr. Badoo Akademi
-- ============================================================
CREATE TABLE IF NOT EXISTS badoo.academy_series (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_key text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  planned_lesson_count integer NOT NULL DEFAULT 0,
  emoji text DEFAULT '📚',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS badoo.academy_lessons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id uuid NOT NULL REFERENCES badoo.academy_series(id) ON DELETE CASCADE,
  day_number integer NOT NULL,
  title text NOT NULL,
  subtitle text,
  cover_emoji text DEFAULT '🩺',
  estimated_read_minutes integer NOT NULL DEFAULT 3,
  difficulty text NOT NULL DEFAULT 'kolay',
  content text NOT NULL,
  summary text,
  daily_task text,
  tip_box text,
  info_box text,
  motivation text,
  quiz jsonb DEFAULT NULL,
  xp_reward integer NOT NULL DEFAULT 20,
  badge_key text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (series_id, day_number)
);

CREATE TABLE IF NOT EXISTS badoo.academy_badges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_key text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  emoji text DEFAULT '🏅',
  unlock_type text NOT NULL DEFAULT 'manual',
  unlock_value integer,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS badoo.academy_user_progress (
  user_id uuid PRIMARY KEY,
  total_xp integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_completed_date date,
  completed_lesson_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS badoo.academy_user_lessons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES badoo.academy_lessons(id) ON DELETE CASCADE,
  xp_earned integer NOT NULL DEFAULT 0,
  streak_bonus integer NOT NULL DEFAULT 0,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS badoo.academy_user_badges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL REFERENCES badoo.academy_badges(id) ON DELETE CASCADE,
  earned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS academy_lessons_series_day_idx
  ON badoo.academy_lessons (series_id, day_number);

CREATE INDEX IF NOT EXISTS academy_user_lessons_user_idx
  ON badoo.academy_user_lessons (user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS academy_user_badges_user_idx
  ON badoo.academy_user_badges (user_id, earned_at DESC);

GRANT SELECT ON badoo.academy_series TO authenticated;
GRANT SELECT ON badoo.academy_lessons TO authenticated;
GRANT SELECT ON badoo.academy_badges TO authenticated;
GRANT SELECT, INSERT, UPDATE ON badoo.academy_user_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.academy_user_lessons TO authenticated;
GRANT SELECT, INSERT, DELETE ON badoo.academy_user_badges TO authenticated;

ALTER TABLE badoo.academy_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.academy_user_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.academy_user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.academy_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.academy_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS academy_user_progress_own ON badoo.academy_user_progress;
CREATE POLICY academy_user_progress_own ON badoo.academy_user_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS academy_user_lessons_own ON badoo.academy_user_lessons;
CREATE POLICY academy_user_lessons_own ON badoo.academy_user_lessons
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS academy_user_badges_own ON badoo.academy_user_badges;
CREATE POLICY academy_user_badges_own ON badoo.academy_user_badges
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS academy_series_read ON badoo.academy_series;
CREATE POLICY academy_series_read ON badoo.academy_series FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS academy_lessons_read ON badoo.academy_lessons;
CREATE POLICY academy_lessons_read ON badoo.academy_lessons FOR SELECT TO authenticated USING (is_published = true);

DROP POLICY IF EXISTS academy_badges_read ON badoo.academy_badges;
CREATE POLICY academy_badges_read ON badoo.academy_badges FOR SELECT TO authenticated USING (true);

-- ─── Dr. Badoo Laboratuvarı (eliminasyon) ───
CREATE TABLE IF NOT EXISTS badoo.elimination_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  program_slug text NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'reintroduction', 'completed', 'broken', 'cancelled')),
  start_date date NOT NULL DEFAULT (CURRENT_DATE),
  current_day integer NOT NULL DEFAULT 1,
  ended_at timestamptz,
  break_food text,
  break_amount text,
  break_intent text,
  break_note text,
  reintroduction_started_at timestamptz,
  reintroduction_food text,
  reintroduction_amount text,
  result_summary text,
  result_likelihood text,
  result_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS elimination_sessions_one_open
  ON badoo.elimination_sessions (user_id)
  WHERE status IN ('active', 'reintroduction');

CREATE INDEX IF NOT EXISTS elimination_sessions_user_idx
  ON badoo.elimination_sessions (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS badoo.elimination_symptom_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL REFERENCES badoo.elimination_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  log_date date NOT NULL,
  day_number integer,
  phase text NOT NULL DEFAULT 'elimination'
    CHECK (phase IN ('elimination', 'reintroduction')),
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  cheated boolean NOT NULL DEFAULT false,
  cheat_note text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, log_date, phase)
);

CREATE INDEX IF NOT EXISTS elimination_symptom_logs_session_idx
  ON badoo.elimination_symptom_logs (session_id, log_date);

CREATE TABLE IF NOT EXISTS badoo.elimination_cheat_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid NOT NULL REFERENCES badoo.elimination_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  log_date date NOT NULL DEFAULT (CURRENT_DATE),
  food_text text,
  amount_text text,
  intent text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS elimination_cheat_logs_session_idx
  ON badoo.elimination_cheat_logs (session_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.elimination_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.elimination_symptom_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.elimination_cheat_logs TO authenticated;

ALTER TABLE badoo.elimination_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.elimination_symptom_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badoo.elimination_cheat_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS elimination_sessions_own ON badoo.elimination_sessions;
CREATE POLICY elimination_sessions_own ON badoo.elimination_sessions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS elimination_symptom_logs_own ON badoo.elimination_symptom_logs;
CREATE POLICY elimination_symptom_logs_own ON badoo.elimination_symptom_logs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS elimination_cheat_logs_own ON badoo.elimination_cheat_logs;
CREATE POLICY elimination_cheat_logs_own ON badoo.elimination_cheat_logs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Sindirim check-in (günde max 2)
CREATE TABLE IF NOT EXISTS badoo.digestion_checkins (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  checkin_date date NOT NULL,
  time_of_day text NOT NULL CHECK (time_of_day IN ('morning', 'afternoon')),
  feeling_ok boolean NOT NULL DEFAULT false,
  symptoms jsonb NOT NULL DEFAULT '[]'::jsonb,
  follow_up jsonb,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS digestion_checkins_user_date_idx
  ON badoo.digestion_checkins (user_id, checkin_date DESC, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON badoo.digestion_checkins TO authenticated;

ALTER TABLE badoo.digestion_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS digestion_checkins_own ON badoo.digestion_checkins;
CREATE POLICY digestion_checkins_own ON badoo.digestion_checkins
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
