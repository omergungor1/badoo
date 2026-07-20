INSERT INTO badoo.academy_series (series_key, title, description, planned_lesson_count, sort_order, emoji) VALUES

($$vucudunu_tani$$, $$Vücudunu Tanı$$, $$Vücudunun sinyallerini okumayı öğren.$$, 30, 1, $$🩺$$),
($$sindirim_sistemi$$, $$Sindirim Sistemi$$, $$Ağızdan bağırsağa yolculuk.$$, 40, 2, $$🫀$$),
($$mikrobiyota$$, $$Bağırsak Mikrobiyotası$$, $$İçindeki milyarlarca dost.$$, 30, 3, $$🦠$$),
($$besin_hassasiyetleri$$, $$Besin Hassasiyetleri$$, $$Hangi besin sana nasıl dokunuyor?$$, 35, 4, $$🥛$$),
($$makro_besinler$$, $$Makro Besinler$$, $$Protein, karbonhidrat, yağ dengesi.$$, 25, 5, $$🥗$$),
($$vitaminler$$, $$Vitaminler$$, $$Küçük ama kritik destekçiler.$$, 30, 6, $$🍊$$),
($$mineraller$$, $$Mineraller$$, $$Vücudun gizli yapı taşları.$$, 20, 7, $$🧂$$),
($$uyku$$, $$Uyku$$, $$İyi sindirim iyi uykudan geçer.$$, 20, 8, $$😴$$),
($$su_elektrolit$$, $$Su ve Elektrolitler$$, $$Hidrasyonun gücü.$$, 20, 9, $$💧$$),
($$stres_sindirim$$, $$Stres ve Sindirim$$, $$Beyin-bağırsak hattı.$$, 20, 10, $$🧘$$),
($$yavas_yasam$$, $$Yavaş Yaşam$$, $$Küçük alışkanlıklar, büyük fark.$$, 20, 11, $$🌿$$),
($$bilimsel_beslenme$$, $$Bilimsel Beslenme$$, $$Kanıta dayalı seçimler.$$, 50, 12, $$🔬$$),
($$etiket_okuma$$, $$Etiket Okuma$$, $$Paketin arkası ne diyor?$$, 20, 13, $$🏷️$$),
($$bagirsak_beyin$$, $$Bağırsak - Beyin Bağlantısı$$, $$Ruh hali ve sindirim.$$, 25, 14, $$🧠$$),
($$eliminasyon$$, $$Eliminasyon Diyeti$$, $$Ne çıkarıp neyi geri eklemeli?$$, 35, 15, $$🧪$$),
($$ai_analiz$$, $$AI Analizlerini Okuma$$, $$Badoo skorlarını anlamlandır.$$, 20, 16, $$✨$$)
ON CONFLICT (series_key) DO NOTHING;

INSERT INTO badoo.academy_badges (badge_key, title, description, emoji, unlock_type, unlock_value, sort_order) VALUES

($$ilk_ders$$, $$İlk Ders$$, $$İlk Akademi dersini tamamladın.$$, $$🎓$$, $$lessons$$, 1, 1),
($$sindirim_kasifi$$, $$Sindirim Kaşifi$$, $$Sindirim yolculuğuna adım attın.$$, $$🧭$$, $$lessons$$, 5, 2),
($$su_ustasi$$, $$Su Ustası$$, $$Su ve hidrasyon derslerini keşfettin.$$, $$💧$$, $$manual$$, NULL, 3),
($$lif_ustasi$$, $$Lif Ustası$$, $$Lifin gücünü öğrendin.$$, $$🌾$$, $$manual$$, NULL, 4),
($$mikrobiyota_dostu$$, $$Mikrobiyota Dostu$$, $$Bağırsak dostlarınla tanıştın.$$, $$🦠$$, $$manual$$, NULL, 5),
($$uyku_uzmani$$, $$Uyku Uzmanı$$, $$Uyku-sindirim bağlantısını öğrendin.$$, $$😴$$, $$manual$$, NULL, 6),
($$besin_dedektifi$$, $$Besin Dedektifi$$, $$Hassasiyet izlerini sürmeyi öğrendin.$$, $$🔍$$, $$manual$$, NULL, 7),
($$protein_uzmani$$, $$Protein Uzmanı$$, $$Protein dengesi hakkında bilgi edindin.$$, $$💪$$, $$manual$$, NULL, 8),
($$seker_avcisi$$, $$Şeker Avcısı$$, $$Şekerin etkilerini fark ettin.$$, $$🍬$$, $$manual$$, NULL, 9),
($$bagirsak_kasifi$$, $$Bağırsak Kaşifi$$, $$Bağırsak sağlığında derinleştin.$$, $$🗺️$$, $$lessons$$, 14, 10),
($$eliminasyon_ustasi$$, $$Eliminasyon Ustası$$, $$Eliminasyon yaklaşımını öğrendin.$$, $$🧪$$, $$manual$$, NULL, 11),
($$streak_30$$, $$30 Günlük Seri$$, $$30 gün üst üste ders tamamladın.$$, $$🔥$$, $$streak$$, 30, 12),
($$streak_100$$, $$100 Günlük Seri$$, $$100 günlük öğrenme serisi.$$, $$💯$$, $$streak$$, 100, 13),
($$streak_200$$, $$200 Günlük Seri$$, $$200 günlük efsane seri.$$, $$🏆$$, $$streak$$, 200, 14),
($$streak_365$$, $$365 Günlük Seri$$, $$Bir yıllık öğrenme yolculuğu.$$, $$👑$$, $$streak$$, 365, 15)
ON CONFLICT (badge_key) DO NOTHING;

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