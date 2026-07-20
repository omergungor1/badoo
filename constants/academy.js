/** Dr. Badoo Akademi — seriler, rozetler ve başlangıç ders içerikleri */

export const ACADEMY_XP_PER_LESSON = 20;

export const ACADEMY_STREAK_BONUSES = [
  { days: 30, bonus: 100 },
  { days: 14, bonus: 50 },
  { days: 7, bonus: 30 },
  { days: 3, bonus: 10 },
];

export function getStreakBonus(streakDays) {
  for (const item of ACADEMY_STREAK_BONUSES) {
    if (streakDays >= item.days) return item.bonus;
  }
  return 0;
}

export const ACADEMY_SERIES = [
  { series_key: 'vucudunu_tani', title: 'Vücudunu Tanı', description: 'Vücudunun sinyallerini okumayı öğren.', planned_lesson_count: 30, sort_order: 1, emoji: '🩺' },
  { series_key: 'sindirim_sistemi', title: 'Sindirim Sistemi', description: 'Ağızdan bağırsağa yolculuk.', planned_lesson_count: 40, sort_order: 2, emoji: '🫀' },
  { series_key: 'mikrobiyota', title: 'Bağırsak Mikrobiyotası', description: 'İçindeki milyarlarca dost.', planned_lesson_count: 30, sort_order: 3, emoji: '🦠' },
  { series_key: 'besin_hassasiyetleri', title: 'Besin Hassasiyetleri', description: 'Hangi besin sana nasıl dokunuyor?', planned_lesson_count: 35, sort_order: 4, emoji: '🥛' },
  { series_key: 'makro_besinler', title: 'Makro Besinler', description: 'Protein, karbonhidrat, yağ dengesi.', planned_lesson_count: 25, sort_order: 5, emoji: '🥗' },
  { series_key: 'vitaminler', title: 'Vitaminler', description: 'Küçük ama kritik destekçiler.', planned_lesson_count: 30, sort_order: 6, emoji: '🍊' },
  { series_key: 'mineraller', title: 'Mineraller', description: 'Vücudun gizli yapı taşları.', planned_lesson_count: 20, sort_order: 7, emoji: '🧂' },
  { series_key: 'uyku', title: 'Uyku', description: 'İyi sindirim iyi uykudan geçer.', planned_lesson_count: 20, sort_order: 8, emoji: '😴' },
  { series_key: 'su_elektrolit', title: 'Su ve Elektrolitler', description: 'Hidrasyonun gücü.', planned_lesson_count: 20, sort_order: 9, emoji: '💧' },
  { series_key: 'stres_sindirim', title: 'Stres ve Sindirim', description: 'Beyin-bağırsak hattı.', planned_lesson_count: 20, sort_order: 10, emoji: '🧘' },
  { series_key: 'yavas_yasam', title: 'Yavaş Yaşam', description: 'Küçük alışkanlıklar, büyük fark.', planned_lesson_count: 20, sort_order: 11, emoji: '🌿' },
  { series_key: 'bilimsel_beslenme', title: 'Bilimsel Beslenme', description: 'Kanıta dayalı seçimler.', planned_lesson_count: 50, sort_order: 12, emoji: '🔬' },
  { series_key: 'etiket_okuma', title: 'Etiket Okuma', description: 'Paketin arkası ne diyor?', planned_lesson_count: 20, sort_order: 13, emoji: '🏷️' },
  { series_key: 'bagirsak_beyin', title: 'Bağırsak - Beyin Bağlantısı', description: 'Ruh hali ve sindirim.', planned_lesson_count: 25, sort_order: 14, emoji: '🧠' },
  { series_key: 'eliminasyon', title: 'Eliminasyon Diyeti', description: 'Ne çıkarıp neyi geri eklemeli?', planned_lesson_count: 35, sort_order: 15, emoji: '🧪' },
  { series_key: 'ai_analiz', title: 'AI Analizlerini Okuma', description: 'Badoo skorlarını anlamlandır.', planned_lesson_count: 20, sort_order: 16, emoji: '✨' },
];

export const ACADEMY_BADGES = [
  { badge_key: 'ilk_ders', title: 'İlk Ders', description: 'İlk Akademi dersini tamamladın.', emoji: '🎓', unlock_type: 'lessons', unlock_value: 1, sort_order: 1 },
  { badge_key: 'sindirim_kasifi', title: 'Sindirim Kaşifi', description: 'Sindirim yolculuğuna adım attın.', emoji: '🧭', unlock_type: 'lessons', unlock_value: 5, sort_order: 2 },
  { badge_key: 'su_ustasi', title: 'Su Ustası', description: 'Su ve hidrasyon derslerini keşfettin.', emoji: '💧', unlock_type: 'manual', unlock_value: null, sort_order: 3 },
  { badge_key: 'lif_ustasi', title: 'Lif Ustası', description: 'Lifin gücünü öğrendin.', emoji: '🌾', unlock_type: 'manual', unlock_value: null, sort_order: 4 },
  { badge_key: 'mikrobiyota_dostu', title: 'Mikrobiyota Dostu', description: 'Bağırsak dostlarınla tanıştın.', emoji: '🦠', unlock_type: 'manual', unlock_value: null, sort_order: 5 },
  { badge_key: 'uyku_uzmani', title: 'Uyku Uzmanı', description: 'Uyku-sindirim bağlantısını öğrendin.', emoji: '😴', unlock_type: 'manual', unlock_value: null, sort_order: 6 },
  { badge_key: 'besin_dedektifi', title: 'Besin Dedektifi', description: 'Hassasiyet izlerini sürmeyi öğrendin.', emoji: '🔍', unlock_type: 'manual', unlock_value: null, sort_order: 7 },
  { badge_key: 'protein_uzmani', title: 'Protein Uzmanı', description: 'Protein dengesi hakkında bilgi edindin.', emoji: '💪', unlock_type: 'manual', unlock_value: null, sort_order: 8 },
  { badge_key: 'seker_avcisi', title: 'Şeker Avcısı', description: 'Şekerin etkilerini fark ettin.', emoji: '🍬', unlock_type: 'manual', unlock_value: null, sort_order: 9 },
  { badge_key: 'bagirsak_kasifi', title: 'Bağırsak Kaşifi', description: 'Bağırsak sağlığında derinleştin.', emoji: '🗺️', unlock_type: 'lessons', unlock_value: 14, sort_order: 10 },
  { badge_key: 'eliminasyon_ustasi', title: 'Eliminasyon Ustası', description: 'Eliminasyon yaklaşımını öğrendin.', emoji: '🧪', unlock_type: 'manual', unlock_value: null, sort_order: 11 },
  { badge_key: 'streak_30', title: '30 Günlük Seri', description: '30 gün üst üste ders tamamladın.', emoji: '🔥', unlock_type: 'streak', unlock_value: 30, sort_order: 12 },
  { badge_key: 'streak_100', title: '100 Günlük Seri', description: '100 günlük öğrenme serisi.', emoji: '💯', unlock_type: 'streak', unlock_value: 100, sort_order: 13 },
  { badge_key: 'streak_200', title: '200 Günlük Seri', description: '200 günlük efsane seri.', emoji: '🏆', unlock_type: 'streak', unlock_value: 200, sort_order: 14 },
  { badge_key: 'streak_365', title: '365 Günlük Seri', description: 'Bir yıllık öğrenme yolculuğu.', emoji: '👑', unlock_type: 'streak', unlock_value: 365, sort_order: 15 },
];

/** Seri 1 — ilk 10 ders (seed). Admin/AI ile genişletilecek. */
export const ACADEMY_SEED_LESSONS = [
  {
    series_key: 'vucudunu_tani',
    day_number: 1,
    title: 'Vücudun sana konuşuyor',
    subtitle: 'Sinyalleri duymayı öğren',
    cover_emoji: '👂',
    estimated_read_minutes: 3,
    difficulty: 'kolay',
    badge_key: 'ilk_ders',
    tip_box: 'Şişkinlik, gaz, enerji düşüşü veya ruh hali değişimi bir “şikayet” değil; veri olabilir.',
    info_box: 'Badoo, öğün ve belirti kayıtlarını birleştirerek bu sinyalleri görünür hale getirir.',
    daily_task: 'Bugün bir öğününden sonra nasıl hissettiğini 1 cümleyle not et.',
    summary: 'Vücudun sürekli sinyal gönderir. Onları yargılamadan fark etmek, iyileşmenin ilk adımıdır.',
    motivation: 'Bugün sadece dinledin. Bu bile büyük bir başlangıç. 🩺',
    content: `Merhaba, ben Dr. Badoo.

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

Küçük adım yeter. Büyük değişim, farkındalıkla başlar.`,
  },
  {
    series_key: 'vucudunu_tani',
    day_number: 2,
    title: 'Sindirim bir yarış değil',
    subtitle: 'Yavaşlamak da bir beceri',
    cover_emoji: '🐢',
    estimated_read_minutes: 3,
    difficulty: 'kolay',
    tip_box: 'İlk lokmaları 20 kez çiğnemek, midene “hazırım” sinyali göndermeye yardımcı olur.',
    info_box: 'Acele yemek, daha fazla hava yutmaya ve erken doygunluk hissinin bozulmasına yol açabilir.',
    daily_task: 'Bugün en az bir öğünde telefonu bırakıp yavaş ye.',
    summary: 'Sindirim ağızda başlar. Tempo, konforu doğrudan etkiler.',
    motivation: 'Yavaşlamak tembellik değil; vücuda saygı. 🌿',
    content: `Birçok insan “ne yediğini” konuşur.
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
Yavaş yemek, diyet hilesi değil. Sindirimin doğal hızına yaklaşmaktır.`,
  },
  {
    series_key: 'vucudunu_tani',
    day_number: 3,
    title: 'Su: sessiz kahraman',
    subtitle: 'Hidrasyon sindirimi destekler',
    cover_emoji: '💧',
    estimated_read_minutes: 3,
    difficulty: 'kolay',
    tip_box: 'Günün başında 1 bardak su, “sistem açılışı” gibi çalışabilir.',
    info_box: 'Yetersiz sıvı, kabızlık riskini artırabilir. Ama aşırı hızlı büyük miktar da midede rahatsızlık yaratabilir.',
    daily_task: 'Bugün hedefine 1 bardak daha eklemeyi dene.',
    summary: 'Su, sindirim yolunu kaygan ve düzenli tutmaya yardım eder.',
    motivation: 'Küçük bir bardak, büyük bir fark yaratabilir. 💧',
    content: `Su sık sık “basit” diye geçilir.
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
Akademi böyle ilerler: küçük, sürdürülebilir adımlar.`,
  },
  {
    series_key: 'vucudunu_tani',
    day_number: 4,
    title: 'Şişkinlik ne anlatır?',
    subtitle: 'Rahatsızlığı veriye çevir',
    cover_emoji: '🎈',
    estimated_read_minutes: 3,
    difficulty: 'kolay',
    tip_box: 'Şişkinliği 1–5 arası puanlamak, örüntü yakalamayı kolaylaştırır.',
    info_box: 'Şişkinlik tek başına teşhis değildir. Zamanlama, yiyecek ve stres birlikte okunmalıdır.',
    daily_task: 'Bugün şişkinlik olursa saatini ve son öğünü not et.',
    summary: 'Şişkinlik bir sinyaldir. Zamanını kaydetmek, sebebini bulmaya yardım eder.',
    motivation: 'Sinyali kaydetmek, panik etmekten daha güçlendiricidir. 🩺',
    content: `Şişkinlik can sıkıcıdır.
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
Ve merak, iyi bir sağlık alışkanlığıdır.`,
  },
  {
    series_key: 'vucudunu_tani',
    day_number: 5,
    title: 'Lif nedir, ne işe yarar?',
    subtitle: 'Bağırsakların sevdiği yakıt',
    cover_emoji: '🌾',
    estimated_read_minutes: 3,
    difficulty: 'kolay',
    tip_box: 'Lifi birden değil, kademeli artırmak gaz şikayetini azaltabilir.',
    info_box: 'Çözünür ve çözünmez lif farklı işler yapar; ikisi de değerlidir.',
    daily_task: 'Bugün bir öğüne sebze, meyve veya baklagil eklemeyi dene.',
    summary: 'Lif, bağırsak düzeni ve mikrobiyota için kritik bir destektir.',
    motivation: 'Bugün lif eklediysen, bağırsakların teşekkür eder. 🌾',
    content: `Lif, “diyet lafı” gibi duyulabilir.
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
Bir adım daha lifli bir tercih.`,
  },
  {
    series_key: 'vucudunu_tani',
    day_number: 6,
    title: 'Stres midene iner',
    subtitle: 'Beyin-bağırsak hattı gerçek',
    cover_emoji: '🧠',
    estimated_read_minutes: 3,
    difficulty: 'kolay',
    tip_box: 'Yemekten önce 3 yavaş nefes, sindirim için “hazır ol” sinyali verebilir.',
    info_box: 'Stres, bağırsak hareketlerini hızlandırabilir veya yavaşlatabilir. İkisi de normal bir stres yanıtıdır.',
    daily_task: 'Bir öğünden önce 60 saniye nefes molası ver.',
    summary: 'Stres sadece kafada kalmaz; sindirim temposunu da değiştirir.',
    motivation: 'Nefes almak ücretsiz bir sindirim desteğidir. 🧘',
    content: `Yoğun bir günde midende kelebekler…
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
Bir öğünden önce kısa bir nefes yeter.`,
  },
  {
    series_key: 'vucudunu_tani',
    day_number: 7,
    title: 'Uyku sindirimi onarır',
    subtitle: 'Gece vardiyası sessiz çalışır',
    cover_emoji: '😴',
    estimated_read_minutes: 3,
    difficulty: 'kolay',
    tip_box: 'Yatmadan 2–3 saat önce ağır öğünü bitirmek gece konforunu artırabilir.',
    info_box: 'Kötü uyku, ertesi gün iştah ve seçimleri de etkileyebilir.',
    daily_task: 'Bu gece uyku saatini 15 dakika öne çekmeyi dene.',
    summary: 'İyi uyku, ertesi günün sindirim konforunu destekler.',
    motivation: 'Dinlenmek de bir sağlık kararıdır. 😴',
    content: `Sindirim gündüz masada bitmez.
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
Biraz daha bilinçli bir uyku ritmi.`,
  },
  {
    series_key: 'vucudunu_tani',
    day_number: 8,
    title: 'Aynı yemek, farklı sonuç',
    subtitle: 'Bağlam her şeyi değiştirir',
    cover_emoji: '🧩',
    estimated_read_minutes: 3,
    difficulty: 'orta',
    tip_box: '“Bu yiyecek bana dokunuyor” demeden önce tempo, stres ve uyku bağlamını da bak.',
    info_box: 'Tek bir öğün kaydı yargı için azdır. Tekrarlayan örüntü daha değerlidir.',
    daily_task: 'Bugün bir yiyeceği not ederken yanına “nasıl yedim?” de yaz.',
    summary: 'Besin etkisi yalnızca içerik değil; bağlamla birlikte okunmalıdır.',
    motivation: 'Meraklı kal, acele yargılama. 🔍',
    content: `Dün yoğurt iyi gitti.
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

Bugün bir adım daha dedektif gibi düşün.`,
  },
  {
    series_key: 'vucudunu_tani',
    day_number: 9,
    title: 'Küçük alışkanlıklar kazanır',
    subtitle: 'Mükemmellik değil süreklilik',
    cover_emoji: '🌱',
    estimated_read_minutes: 3,
    difficulty: 'kolay',
    tip_box: 'Her gün 1 küçük görev, 30 günde görünür fark yaratabilir.',
    info_box: 'Sert diyetler kısa sürer. Küçük ritüeller uzun yaşar.',
    daily_task: 'Bugün Akademi görevlerinden birini bilerek tamamla.',
    summary: 'Sağlıkta sürdürülebilirlik, dramatik değişimden daha güçlüdür.',
    motivation: 'Bugün %1 ilerlediysen, yolundasın. 🌱',
    content: `İnsanlar sık sık “pazartesi yeni hayat” ister.
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

Hepsi sayılır.`,
  },
  {
    series_key: 'vucudunu_tani',
    day_number: 10,
    title: 'Kendi verinin çevirmeni ol',
    subtitle: 'AI’yı daha iyi kullanmak için',
    cover_emoji: '✨',
    estimated_read_minutes: 3,
    difficulty: 'orta',
    tip_box: 'AI özeti bir emir değil; senin kayıtların üzerinden kurulmuş bir yorumdur.',
    info_box: 'Ne kadar düzenli kayıt, o kadar anlamlı analiz.',
    daily_task: 'Bugün bir öğün ve varsa bir belirti kaydı ekle.',
    summary: 'Kendi verini anlamak, AI analizlerini güçlendirir.',
    motivation: 'Senin hikâyen, senin kayıtlarınla yazılır. ✨',
    content: `Badoo’da AI analizleri sihir değildir.
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
Birlikte ilerleyelim.`,
  },
];
