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