INSERT INTO badoo.academy_lessons (
    series_id, day_number, title, subtitle, cover_emoji, estimated_read_minutes, difficulty,
    content, summary, daily_task, tip_box, info_box, motivation, xp_reward, badge_key, sort_order, is_published
  )
  SELECT s.id, 10, $$Kendi verinin çevirmeni ol$$, $$AI’yı daha iyi kullanmak için$$, $$✨$$, 3, $$orta$$,
    $$Badoo’da AI analizleri sihir değildir.
Senin bıraktığın izlerden öğrenir.

Az kayıt = bulanık resim
Düzenli kayıt = net örüntü

Bu dersin amacı seni “mükemmel kullanıcı” yapmak değil.
Kendi verinin çevirmeni yapmak.

Bundan sonra bir skor gördüğünde sor:
- Bu skor hangi günlere dayanıyor?
- Ben o günlerde ne hissettim?
- Hangi küçük denemeyi yapabilirim?

Akademi burada bitmiyor.
Ama ilk 10 günle temel atıldı:
Dinle, kaydet, yavaşla, bağla, devam et.

Yarın yeni bir gün, yeni bir ders.
Birlikte ilerleyelim.$$, $$Kendi verini anlamak, AI analizlerini güçlendirir.$$, $$Bugün bir öğün ve varsa bir belirti kaydı ekle.$$, $$AI özeti bir emir değil; senin kayıtların üzerinden kurulmuş bir yorumdur.$$, $$Ne kadar düzenli kayıt, o kadar anlamlı analiz.$$, $$Senin hikâyen, senin kayıtlarınla yazılır. ✨$$,
    20, NULL, 10, true
  FROM badoo.academy_series s
  WHERE s.series_key = $$vucudunu_tani$$
  ON CONFLICT (series_id, day_number) DO NOTHING;