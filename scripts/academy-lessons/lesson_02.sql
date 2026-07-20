INSERT INTO badoo.academy_lessons (
    series_id, day_number, title, subtitle, cover_emoji, estimated_read_minutes, difficulty,
    content, summary, daily_task, tip_box, info_box, motivation, xp_reward, badge_key, sort_order, is_published
  )
  SELECT s.id, 2, $$Sindirim bir yarış değil$$, $$Yavaşlamak da bir beceri$$, $$🐢$$, 3, $$kolay$$,
    $$Birçok insan “ne yediğini” konuşur.
Ama “nasıl yediğini” unutur.

Sindirim, tabağa bakmakla bitmez.
Çiğneme, tempo, nefes… hepsi parçası.

Bilimsel ama sade:
Ağızda öğütülmeyen yiyecek, mide ve bağırsak için ekstra iş demektir.
Acele yemek de genellikle daha fazla hava yutturur. Sonuç? Gaz ve şişkinlik.

Gerçek hayat:
Öğle arasında 7 dakikada yemek bitirmek “başarı” gibi görünür.
Ama akşamüstü şişkinlik “sır” gibi gelir. Oysa bağlantı çoğu zaman temposundadır.

Badoo’da bunu nasıl görürsün?
Belirti saatleri öğün saatine yakınsa ve sık tekrarlanıyorsa, tempo alışkanlığını gözden geçirmek iyi bir ipucudur.

Bugünkü dersin özeti:
Yavaş yemek, diyet hilesi değil. Sindirimin doğal hızına yaklaşmaktır.$$, $$Sindirim ağızda başlar. Tempo, konforu doğrudan etkiler.$$, $$Bugün en az bir öğünde telefonu bırakıp yavaş ye.$$, $$İlk lokmaları 20 kez çiğnemek, midene “hazırım” sinyali göndermeye yardımcı olur.$$, $$Acele yemek, daha fazla hava yutmaya ve erken doygunluk hissinin bozulmasına yol açabilir.$$, $$Yavaşlamak tembellik değil; vücuda saygı. 🌿$$,
    20, NULL, 2, true
  FROM badoo.academy_series s
  WHERE s.series_key = $$vucudunu_tani$$
  ON CONFLICT (series_id, day_number) DO NOTHING;