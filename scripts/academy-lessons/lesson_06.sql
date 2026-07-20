INSERT INTO badoo.academy_lessons (
    series_id, day_number, title, subtitle, cover_emoji, estimated_read_minutes, difficulty,
    content, summary, daily_task, tip_box, info_box, motivation, xp_reward, badge_key, sort_order, is_published
  )
  SELECT s.id, 6, $$Stres midene iner$$, $$Beyin-bağırsak hattı gerçek$$, $$🧠$$, 3, $$kolay$$,
    $$Yoğun bir günde midende kelebekler…
Bu sadece “psikolojik” değil.

Beyin ve bağırsak sürekli haberleşir.
Stres yükselince sindirim öncelik listesinde gerileyebilir.

Sonuç?
İştah değişir, gaz artar, tuvalet düzeni bozulabilir.

Bu seni suçlamak için değil.
Fark etmek için.

Badoo’da ruh hali / enerji kayıtların varsa,
öğün sonrası belirtilerle birlikte okunabilir.

Bugün büyük meditasyon şart değil.
Bir öğünden önce kısa bir nefes yeter.$$, $$Stres sadece kafada kalmaz; sindirim temposunu da değiştirir.$$, $$Bir öğünden önce 60 saniye nefes molası ver.$$, $$Yemekten önce 3 yavaş nefes, sindirim için “hazır ol” sinyali verebilir.$$, $$Stres, bağırsak hareketlerini hızlandırabilir veya yavaşlatabilir. İkisi de normal bir stres yanıtıdır.$$, $$Nefes almak ücretsiz bir sindirim desteğidir. 🧘$$,
    20, NULL, 6, true
  FROM badoo.academy_series s
  WHERE s.series_key = $$vucudunu_tani$$
  ON CONFLICT (series_id, day_number) DO NOTHING;