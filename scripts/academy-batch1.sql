INSERT INTO badoo.academy_lessons (
    series_id, day_number, title, subtitle, cover_emoji, estimated_read_minutes, difficulty,
    content, summary, daily_task, tip_box, info_box, motivation, xp_reward, badge_key, sort_order, is_published
  )
  SELECT s.id, 1, $$Vücudun sana konuşuyor$$, $$Sinyalleri duymayı öğren$$, $$👂$$, 3, $$kolay$$,
    $$Merhaba, ben Dr. Badoo.

Bugün sana ilaç yazmayacağım. Teşhis de koymayacağım.
Sadece şunu hatırlatacağım: vücudun her gün seninle konuşuyor.

Şişkinlik, gaz, yemek sonrası yorgunluk, sabah ağırlığı…
Bunlar “şanssızlık” değil; çoğu zaman bir örüntü.

Neden önemli?
Çünkü kendi verilerini okumayı öğrenirsen, AI analizleri de daha anlamlı hale gelir.
Badoo’da bir skor gördüğünde “acaba?” demek yerine “evet, bunu yaşamıştım” diyebilirsin.

Gerçek hayattan örnek:
Aynı kahvaltıyı iki gün üst üste yedin. Birinde enerjin iyi, diğerinde şişkin oldun.
Fark; tempo, uyku, stres veya miktar olabilir. Ama farkı görmeden tahmin yaparsın.

Bugün bunu neden öğreniyorsun?
Çünkü Akademi’nin amacı seni korkutmak değil, kendi vücudunun çevirmeni yapmak.

Badoo bunu nasıl kullanıyor?
Öğün + belirti kayıtların zaman penceresinde eşleşir. Senin “hissettim” dediğin şey, uygulamada izlenebilir hale gelir.

Küçük adım yeter. Büyük değişim, farkındalıkla başlar.$$, $$Vücudun sürekli sinyal gönderir. Onları yargılamadan fark etmek, iyileşmenin ilk adımıdır.$$, $$Bugün bir öğününden sonra nasıl hissettiğini 1 cümleyle not et.$$, $$Şişkinlik, gaz, enerji düşüşü veya ruh hali değişimi bir “şikayet” değil; veri olabilir.$$, $$Badoo, öğün ve belirti kayıtlarını birleştirerek bu sinyalleri görünür hale getirir.$$, $$Bugün sadece dinledin. Bu bile büyük bir başlangıç. 🩺$$,
    20, $$ilk_ders$$, 1, true
  FROM badoo.academy_series s
  WHERE s.series_key = $$vucudunu_tani$$
  ON CONFLICT (series_id, day_number) DO NOTHING;

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