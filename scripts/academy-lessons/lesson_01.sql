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