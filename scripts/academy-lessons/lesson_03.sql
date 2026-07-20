INSERT INTO badoo.academy_lessons (
    series_id, day_number, title, subtitle, cover_emoji, estimated_read_minutes, difficulty,
    content, summary, daily_task, tip_box, info_box, motivation, xp_reward, badge_key, sort_order, is_published
  )
  SELECT s.id, 3, $$Su: sessiz kahraman$$, $$Hidrasyon sindirimi destekler$$, $$💧$$, 3, $$kolay$$,
    $$Su sık sık “basit” diye geçilir.
Ama sindirim için sessiz bir kahramandır.

Liflerin işini yapabilmesi için suya ihtiyacı vardır.
Sıvı azsa, bağırsak hareketleri de yavaşlayabilir.

Denge önemli:
Az su → konfor düşebilir.
Çok hızlı, çok büyük miktar → mide şişkin hissedebilir.

Badoo’da su takibi bu yüzden var.
Kalori kadar “görünmez” alışkanlıklar da skorunu etkiler.

Bugün abartma.
Sadece bir bardak daha bilinçli iç.
Akademi böyle ilerler: küçük, sürdürülebilir adımlar.$$, $$Su, sindirim yolunu kaygan ve düzenli tutmaya yardım eder.$$, $$Bugün hedefine 1 bardak daha eklemeyi dene.$$, $$Günün başında 1 bardak su, “sistem açılışı” gibi çalışabilir.$$, $$Yetersiz sıvı, kabızlık riskini artırabilir. Ama aşırı hızlı büyük miktar da midede rahatsızlık yaratabilir.$$, $$Küçük bir bardak, büyük bir fark yaratabilir. 💧$$,
    20, NULL, 3, true
  FROM badoo.academy_series s
  WHERE s.series_key = $$vucudunu_tani$$
  ON CONFLICT (series_id, day_number) DO NOTHING;