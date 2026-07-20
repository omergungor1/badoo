INSERT INTO badoo.academy_lessons (
    series_id, day_number, title, subtitle, cover_emoji, estimated_read_minutes, difficulty,
    content, summary, daily_task, tip_box, info_box, motivation, xp_reward, badge_key, sort_order, is_published
  )
  SELECT s.id, 5, $$Lif nedir, ne işe yarar?$$, $$Bağırsakların sevdiği yakıt$$, $$🌾$$, 3, $$kolay$$,
    $$Lif, “diyet lafı” gibi duyulabilir.
Ama bağırsak için gerçek bir yakıttır.

Basitçe:
Bazı lifler dışkıya hacim katar.
Bazıları ise bağırsak bakterileri tarafından fermente edilir.

Dikkat:
Lifi bir günde ikiye katlamak gazı artırabilir.
Yavaş artırmak daha akıllıcadır. Su da unutulmamalı.

Badoo’da öğün çeşitliliğin arttıkça,
hassasiyet ve konfor örüntülerin daha netleşir.

Bugünün amacı mükemmel tabak değil.
Bir adım daha lifli bir tercih.$$, $$Lif, bağırsak düzeni ve mikrobiyota için kritik bir destektir.$$, $$Bugün bir öğüne sebze, meyve veya baklagil eklemeyi dene.$$, $$Lifi birden değil, kademeli artırmak gaz şikayetini azaltabilir.$$, $$Çözünür ve çözünmez lif farklı işler yapar; ikisi de değerlidir.$$, $$Bugün lif eklediysen, bağırsakların teşekkür eder. 🌾$$,
    20, NULL, 5, true
  FROM badoo.academy_series s
  WHERE s.series_key = $$vucudunu_tani$$
  ON CONFLICT (series_id, day_number) DO NOTHING;