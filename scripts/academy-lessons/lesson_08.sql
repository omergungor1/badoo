INSERT INTO badoo.academy_lessons (
    series_id, day_number, title, subtitle, cover_emoji, estimated_read_minutes, difficulty,
    content, summary, daily_task, tip_box, info_box, motivation, xp_reward, badge_key, sort_order, is_published
  )
  SELECT s.id, 8, $$Aynı yemek, farklı sonuç$$, $$Bağlam her şeyi değiştirir$$, $$🧩$$, 3, $$orta$$,
    $$Dün yoğurt iyi gitti.
Bugün aynı yoğurt şişirdi.

Bu çelişki gibi görünür.
Ama çoğu zaman bağlam farklıdır.

Belki:
- Daha az çiğnedin
- Daha stresliydin
- Gece az uyudun
- Yanına başka bir şey ekledin

Badoo’nun hassasiyet skoru da bu yüzden tek olaya kilitlenmez.
Zaman penceresi ve tekrarlar önemlidir.

Akademi kuralı:
Tek olay = ipucu
Tekrar = örüntü

Bugün bir adım daha dedektif gibi düşün.$$, $$Besin etkisi yalnızca içerik değil; bağlamla birlikte okunmalıdır.$$, $$Bugün bir yiyeceği not ederken yanına “nasıl yedim?” de yaz.$$, $$“Bu yiyecek bana dokunuyor” demeden önce tempo, stres ve uyku bağlamını da bak.$$, $$Tek bir öğün kaydı yargı için azdır. Tekrarlayan örüntü daha değerlidir.$$, $$Meraklı kal, acele yargılama. 🔍$$,
    20, NULL, 8, true
  FROM badoo.academy_series s
  WHERE s.series_key = $$vucudunu_tani$$
  ON CONFLICT (series_id, day_number) DO NOTHING;