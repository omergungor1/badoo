INSERT INTO badoo.academy_lessons (
    series_id, day_number, title, subtitle, cover_emoji, estimated_read_minutes, difficulty,
    content, summary, daily_task, tip_box, info_box, motivation, xp_reward, badge_key, sort_order, is_published
  )
  SELECT s.id, 4, $$Şişkinlik ne anlatır?$$, $$Rahatsızlığı veriye çevir$$, $$🎈$$, 3, $$kolay$$,
    $$Şişkinlik can sıkıcıdır.
Ama aynı zamanda bilgi taşır.

Soru şu: “Neden şiştim?” değil,
“Ne zaman şiştim ve öncesinde ne vardı?”

Bu ayrım önemlidir.
Çünkü sebep; bir besin, tempo, stres veya uykusuzluk olabilir.

Badoo yaklaşımı:
Belirtiyi öğüne yakın pencerede eşleştirir.
Bu yüzden “süt bana dokunuyor” hissin, veriyle test edilebilir hale gelir.

Korkutucu kısım yok.
Sadece merak.
Ve merak, iyi bir sağlık alışkanlığıdır.$$, $$Şişkinlik bir sinyaldir. Zamanını kaydetmek, sebebini bulmaya yardım eder.$$, $$Bugün şişkinlik olursa saatini ve son öğünü not et.$$, $$Şişkinliği 1–5 arası puanlamak, örüntü yakalamayı kolaylaştırır.$$, $$Şişkinlik tek başına teşhis değildir. Zamanlama, yiyecek ve stres birlikte okunmalıdır.$$, $$Sinyali kaydetmek, panik etmekten daha güçlendiricidir. 🩺$$,
    20, NULL, 4, true
  FROM badoo.academy_series s
  WHERE s.series_key = $$vucudunu_tani$$
  ON CONFLICT (series_id, day_number) DO NOTHING;