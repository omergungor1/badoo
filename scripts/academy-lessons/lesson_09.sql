INSERT INTO badoo.academy_lessons (
    series_id, day_number, title, subtitle, cover_emoji, estimated_read_minutes, difficulty,
    content, summary, daily_task, tip_box, info_box, motivation, xp_reward, badge_key, sort_order, is_published
  )
  SELECT s.id, 9, $$Küçük alışkanlıklar kazanır$$, $$Mükemmellik değil süreklilik$$, $$🌱$$, 3, $$kolay$$,
    $$İnsanlar sık sık “pazartesi yeni hayat” ister.
Sonra çarşamba yorulur.

Dr. Badoo’nun önerisi farklı:
Her gün küçük bir ders.
Her gün küçük bir görev.

Bu yüzden Akademi günde tek ders verir.
Beyni yormadan, alışkanlık kasını çalıştırır.

XP ve streak bunun süsü değil.
İlerlemeni hissetmen için tasarlandı.

Unutma:
Kayıt etmek de bir başarıdır.
Okumak da.
Uygulamak da.

Hepsi sayılır.$$, $$Sağlıkta sürdürülebilirlik, dramatik değişimden daha güçlüdür.$$, $$Bugün Akademi görevlerinden birini bilerek tamamla.$$, $$Her gün 1 küçük görev, 30 günde görünür fark yaratabilir.$$, $$Sert diyetler kısa sürer. Küçük ritüeller uzun yaşar.$$, $$Bugün %1 ilerlediysen, yolundasın. 🌱$$,
    20, NULL, 9, true
  FROM badoo.academy_series s
  WHERE s.series_key = $$vucudunu_tani$$
  ON CONFLICT (series_id, day_number) DO NOTHING;