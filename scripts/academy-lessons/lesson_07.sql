INSERT INTO badoo.academy_lessons (
    series_id, day_number, title, subtitle, cover_emoji, estimated_read_minutes, difficulty,
    content, summary, daily_task, tip_box, info_box, motivation, xp_reward, badge_key, sort_order, is_published
  )
  SELECT s.id, 7, $$Uyku sindirimi onarır$$, $$Gece vardiyası sessiz çalışır$$, $$😴$$, 3, $$kolay$$,
    $$Sindirim gündüz masada bitmez.
Gece de sessiz bir bakım çalışması vardır.

Uyku bozulunca:
- İştah sinyalleri karışabilir
- Daha fazla “hızlı enerji” arayışı artabilir
- Ertesi gün şişkinlik eşiği düşebilir

Bu yüzden Akademi uykuyu “ayrı konu” görmez.
Sindirimin parçasıdır.

Badoo’da uyku kaydı tutuyorsan,
zorlu günlerle ilişkisini zamanla daha net görürsün.

Bugün hedef: mükemmel gece değil.
Biraz daha bilinçli bir uyku ritmi.$$, $$İyi uyku, ertesi günün sindirim konforunu destekler.$$, $$Bu gece uyku saatini 15 dakika öne çekmeyi dene.$$, $$Yatmadan 2–3 saat önce ağır öğünü bitirmek gece konforunu artırabilir.$$, $$Kötü uyku, ertesi gün iştah ve seçimleri de etkileyebilir.$$, $$Dinlenmek de bir sağlık kararıdır. 😴$$,
    20, NULL, 7, true
  FROM badoo.academy_series s
  WHERE s.series_key = $$vucudunu_tani$$
  ON CONFLICT (series_id, day_number) DO NOTHING;