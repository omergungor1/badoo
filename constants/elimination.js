/** Dr. Badoo Laboratuvarı — eliminasyon programları ve oturum sabitleri */

export const ELIMINATION_DURATION_DAYS = 7;
export const REINTRODUCTION_DAYS = 2;

export const SYMPTOM_METRICS = [
  { key: 'bloating', label: 'Şişkinlik' },
  { key: 'gas', label: 'Gaz' },
  { key: 'abdominal_pain', label: 'Karın ağrısı' },
  { key: 'reflux', label: 'Reflü' },
  { key: 'heartburn', label: 'Mide yanması' },
  { key: 'constipation', label: 'Kabızlık' },
  { key: 'diarrhea', label: 'İshal' },
  { key: 'energy', label: 'Enerji' },
  { key: 'focus', label: 'Odaklanma' },
  { key: 'sleep', label: 'Uyku' },
  { key: 'mood', label: 'Ruh hali' },
  { key: 'headache', label: 'Baş ağrısı' },
  { key: 'skin', label: 'Cilt' },
];

export const SESSION_STATUS = {
  active: 'Eliminasyon devam ediyor',
  reintroduction: 'Yeniden tanıtım aşaması',
  completed: 'Tamamlandı',
  broken: 'Kural ihlali — oturum bozuldu',
  cancelled: 'İptal edildi',
};

export const STATUS_META = {
  waiting: { emoji: '⏳', label: 'Bekliyor' },
  active: { emoji: '🔬', label: 'Aktif deney' },
  completed: { emoji: '✅', label: 'Tamamlandı' },
  broken: { emoji: '💥', label: 'Bozuldu' },
  restartable: { emoji: '🔄', label: 'Yeniden başlatılabilir' },
};

function buildDailyContent(lessons, tasks) {
  return {
    dailyLessons: lessons.map((item, i) => ({ day: i + 1, ...item })),
    dailyTasks: tasks.map((item, i) => ({ day: i + 1, ...item })),
  };
}

const dairyContent = buildDailyContent(
  [
    { title: 'Süt izi nerede saklanır?', body: 'Laktoz ve süt proteini sadece bardakta değil; soslarda, hamur işlerinde ve “kremalı” etiketlerde gizlenir. Bu hafta dedektif modundasın: her öğün bir ipucu.' },
    { title: 'Laktoz mu, protein mi?', body: 'Bazı insanlar laktoza, bazıları kazein veya whey’e tepki verir. Eliminasyon ikisini de dışarı alır; yeniden tanıtımda hangi kanıtın öne çıktığını birlikte okuyacağız.' },
    { title: 'Kalsiyum alternatifleri', body: 'Süt kesilince kemiklerin çökmeyecek — yeşil yapraklı sebzeler, susam, badem ve takviye seçenekleri devreye girer. Önemli olan eksik bırakmamak, sadece sütü değiştirmek.' },
    { title: 'Gizli süt kaynakları', body: 'Whey, kazein, laktoz, süzme peynir tozu… Etiketlerde “süt tozu” bile yeterli. Bugün mutfak raflarında etiket avcılığı yap.' },
    { title: 'Bağırsak dinlenmesi', body: '7 gün boyunca süt yokken bazı belirtiler hafifleyebilir. Bu bir iyileşme vaadi değil; vücudunun “süt yokken ne oluyor?” sorusuna verdiği geçici cevap.' },
    { title: 'Sosyal yemek tuzakları', body: 'Dışarıda kahvaltı sosu, tatlı kreması veya “hafif” sandviç peyniri seni yakalayabilir. Menüyü sormak utangaçlık değil, veri toplamaktır.' },
    { title: 'Yeniden tanıtıma hazırlık', body: 'Yarın kontrollü bir miktar süt ürünü geri gelecek. Bugünkü belirti puanların referansın; karşılaştırma olmadan sonuç çıkmaz.' },
  ],
  [
    { title: 'Dolabı tara', body: 'Buzdolabı ve kilerde süt, peynir, yoğurt, tereyağı, krema ve süt içeren paketleri işaretle veya geçici olarak kenara al.' },
    { title: 'Etiket oku', body: 'Bugün yediğin 3 paketli üründe laktoz, whey, kazein veya süt tozu var mı kontrol et; Badoo’ya not düş.' },
    { title: 'Alternatif kahvaltı', body: 'Süt içermeyen bir kahvaltı planla (yulaf + bitkisel süt, yumurtasız seçenek veya meyve + kuruyemiş).' },
    { title: 'Restoran sorusu', body: 'Dışarıda yiyorsan garsona “yemekte süt veya peynir var mı?” diye sor; cevabı kısa not olarak kaydet.' },
    { title: 'Belirti tabanı', body: 'Şişkinlik, gaz ve enerji puanlarını sabah-akşam kaydet; 5. gün ortalamasını kendine referans al.' },
    { title: 'Tuzak listesi', body: 'Bugün gördüğün en şaşırtıcı gizli süt kaynağını (sos, bisküvi, hazır çorba vb.) tek cümleyle yaz.' },
    { title: 'Protokol provası', body: 'Yarınki yeniden tanıtım için 1 bardak süt veya 50 g peynir hazırla; saati ve ortamı (tek başına, sakin) planla.' },
  ],
);

const glutenContent = buildDailyContent(
  [
    { title: 'Gluten haritası', body: 'Buğday, arpa, çavdar ve türevleri binlerce üründe. Eliminasyon haftanda amaç “sıfır gluten” — tam tahıl değil, gizli un.' },
    { title: 'Çapraz bulaşma', body: 'Aynı ekmek bıçağı, kızartma yağı veya fırın tepsisi gluten taşıyabilir. Küçük miktarlar bile belirti izi bırakabilir; mutfakta ayrım kur.' },
    { title: 'Etiket kodları', body: 'Buğday nişastası, malt, bulgur, spelt, kamut… “Glutensiz” yazsa bile üretim hattı uyarısına bak. Dedektif gözün bu satırlarda.' },
    { title: 'Lif ve enerji', body: 'Gluten kesilince bazıları daha hafif, bazıları daha yorgun hisseder. Enerji ve odak puanların bu haftanın gizli grafikleri.' },
    { title: 'Sosyal baskı', body: 'Ekmeksiz masa garip gelebilir. Hazırlıklı gel: kendi atıştırmalığını taşımak veri bütünlüğünü korur.' },
    { title: 'Bağırsak sakinliği', body: '5–6. günlerde şişkinlik veya dışkı alışkanlığında değişim olabilir. Yargılama; sadece kaydet.' },
    { title: 'Test ekmeği', body: 'Yarın bilinen miktarda gluten geri gelecek. Bugünkü sakin gün puanların karşılaştırma tabanın.' },
  ],
  [
    { title: 'Ekmek molası', body: 'Bu hafta buğdaylı ekmek, simit, börek ve makarna yok; pirinç, patates ve glutensiz tahıllara geç.' },
    { title: 'Sos kontrolü', body: 'Soya sosu, hazır çorba ve kızartma kaplamasında gluten olabilir; 2 ürün etiketini fotoğrafla veya not al.' },
    { title: 'Ayrı mutfak', body: 'Tost makinesi, kesme tahtası veya yağ tenceresini glutenli kullanımdan ayır.' },
    { title: 'Glutensiz liste', body: 'Güvenli 5 besinini yaz (pirinç, patates, et, sebze, glutensiz yulaf vb.) ve bugün bunlardan oluşan bir öğün ye.' },
    { title: 'Enerji izle', body: 'Öğle sonrası enerji düşüşü yaşıyor musun? 3 gün üst üste puanla.' },
    { title: 'Dışarıda seçim', body: 'Restoranda glutensiz menü veya salata + protein kombinasyonu seç; sos isteme.' },
    { title: 'Test hazırlığı', body: '1 dilim tam buğday ekmeği veya 2 yemek kaşığı bulgur pilavı için malzemeyi hazırla; yarın sabah veya öğle tek seferde tüket.' },
  ],
);

const eggContent = buildDailyContent(
  [
    { title: 'Yumurta her yerde', body: 'Kahvaltıdan mayoneze, pastadan köfteye kadar yumurta “bağlayıcı” olarak saklanır. Bu hafta sarısı ve akı birlikte dışarı.' },
    { title: 'Albumin ve lesitin', body: 'Etiketlerde yumurta; E1105 lesitin (yumurtalı kaynaklı olabilir) gibi kodlar. Alerjen satırı en hızlı ipucu.' },
    { title: 'Protein alternatifleri', body: 'Yumurtasız kahvaltıda baklagil, tofu veya et/tavuk proteini devreye girer. Aç kalmak protokolü bozmaz ama veriyi kirletir.' },
    { title: 'Pişirme tuzakları', body: 'Aynı tavada yumurtalı omlet yapıldıysa artık iz kalabilir. Temiz tava = temiz deney.' },
    { title: 'Cilt ve sindirim', body: 'Bazılarında yumurta cilt veya mide izi bırakır. Cilt ve karın puanlarını özellikle izle.' },
    { title: 'Fırın ürünleri', body: 'Kek, kurabiye, bazı ekmekler yumurtalıdır. Paketli tatlı bu haftanın en sık kural ihlali kaynağı.' },
    { title: 'Tek yumurta testi', body: 'Yarın kontrollü bir yumurta yeniden tanıtılacak. Bugün semptom tabanını net tut.' },
  ],
  [
    { title: 'Kahvaltı revizyonu', body: 'Yumurtasız kahvaltı planla; menemen, omlet ve mayonezli sandviç bu hafta yok.' },
    { title: 'Pastane alarmı', body: 'Bugün aldığın paketli üründe yumurta, albumin veya E1105 var mı bak.' },
    { title: 'Ev mutfağı', body: 'Yumurta kullanılan tava/spatula yerine temiz ekipman kullan.' },
    { title: 'Protein dengesi', body: 'Yumurta yerine 1 porsiyon baklagil veya et/tavuk ekle; öğünü Badoo’ya kaydet.' },
    { title: 'Belirti çifti', body: 'Karın ağrısı ve cilt puanını 7 gün boyunca günlük kaydet.' },
    { title: 'Sos taraması', body: 'Mayonez, ranch, bazı nugget kaplamaları — bir sos etiketini incele.' },
    { title: 'Test günü planı', body: 'Yarın 1 adet haşlanmış veya rafadan yumurta; tek başına, diğer yeni gıda olmadan.' },
  ],
);

const fodmapContent = buildDailyContent(
  [
    { title: 'FODMAP nedir?', body: 'Fermente olabilen kısa zincirli karbonhidratlar: fruktan, laktoz, fruktoz, poliol ve GOS. Bağırsakta gaz ve su çekebilirler — bu hafta yüksek FODMAP’leri eleyeceğiz.' },
    { title: 'Soğan ve sarımsak', body: 'En sık gizlenen suçlular. Toz halde sos, çorba, hazır yemek — “sebzeli” yazsa bile olabilir.' },
    { title: 'Elma ve bal', body: 'Fruktoz ve fruktan kaynakları: elma, armut, bal, kayısı. Tatlı ihtiyacını düşük FODMAP meyvelerle karşıla.' },
    { title: 'Baklagil ve lahana', body: 'Fasulye, mercimek, karnabahar, brokoli yüksek FODMAP olabilir. Porsiyon ve pişirme yöntemi önemli; bu hafta daha sade seç.' },
    { title: 'Poliol tuzakları', body: 'Sorbitol, mannitol — diyet sakızı, “şekersiz” ürünler. Etikette -ol ile biten tatlandırıcıları ara.' },
    { title: 'Lif dengesi', body: 'FODMAP düşürünce bazıları kabız, bazıları rahatlar. Su ve yürüyüş veriyi netleştirir.' },
    { title: 'Tek grup testi', body: 'Tam FODMAP eliminasyonu karmaşıktır; yeniden tanıtımda tek yüksek FODMAP gıda (ör. yarım elma) ile başlayacağız.' },
  ],
  [
    { title: 'Soğansız mutfak', body: 'Bugün soğan, sarımsak, pırasa ve soğan tozu kullanma; soğan yerine yeşillik ve baharat (kimyon, zencefil) dene.' },
    { title: 'Meyve seçimi', body: 'Elma yerine kavun veya mandalina gibi düşük FODMAP meyve tüket.' },
    { title: 'Etiket avı', body: 'Hazır sosta soğan tozu, sarımsak tozu, inulin veya fruktooligosakkarit var mı kontrol et.' },
    { title: 'Sebze sadeleştir', body: 'Karnabahar/brokoli yerine havuç, kabak veya patates ağırlıklı öğün ye.' },
    { title: 'Gaz grafiği', body: 'Şişkinlik ve gaz puanlarını günde iki kez kaydet; 4. gün trendine bak.' },
    { title: 'Sakız kontrolü', body: 'Şekersiz sakız veya diyet içecekte sorbitol/mannitol ara.' },
    { title: 'Test hazırlığı', body: 'Yarın yarım elma veya 1 yemek kaşığı bal — tek FODMAP kaynağı, başka yeni gıda yok.' },
  ],
);

const histamineContent = buildDailyContent(
  [
    { title: 'Histamin dosyası', body: 'Histamin bazı gıdalarda doğal, bazılarında zamanla artar. Eliminasyon haftanda taze, az fermente, az olgun seç.' },
    { title: 'Olgun meyve ve turşu', body: 'Muz olgunlaştıkça, avokado bekledikçe histamin artabilir. Turşu, sirke ve fermente gıdalar şüpheli listede.' },
    { title: 'Balık ve et', body: 'Uzun bekleyen veya ısın-tekrar ısın balık histamin bombası olabilir. Bugün taze pişmiş, aynı gün tüket.' },
    { title: 'Kakao ve domates', body: 'Çikolata, domates, salça, siyah çay — sık atlanan kaynaklar. Kahveni histamin haftasında sadeleştir.' },
    { title: 'Sakız ve fermente süt', body: 'Aged peynir, salam, sucuk, kefir histamin yüksek olabilir. Etiket + tazelik birlikte okunur.' },
    { title: 'Baş ağrısı izi', body: 'Histamin bazen baş ağrısı ve cilt kızarıklığı ile gelir. Bu metrikleri özellikle puanla.' },
    { title: 'Kontrollü geri dönüş', body: 'Yarın küçük miktarda domates veya 2 dilim salam — tek sefer, belirtileri 24 saat izle.' },
  ],
  [
    { title: 'Taze liste', body: 'Bugün taze pişmiş et/tavuk/balık tercih et; dünkü kalan balığı kullanma.' },
    { title: 'Turşu molası', body: 'Turşu, kimchi, kombucha ve sirke bazlı soslardan kaçın.' },
    { title: 'Domates kontrolü', body: 'Salça, ketçap ve domates sosu içeren yemekleri bu hafta değiştir.' },
    { title: 'Peynir seçimi', body: 'Olgun/yaşlanmış peynir yerine taze lor veya histamin dostu alternatif kullan.' },
    { title: 'Baş ağrısı günlüğü', body: 'Baş ağrısı ve cilt puanını sabah-akşam kaydet.' },
    { title: 'Çay-kahve', body: 'Siyah çay ve espresso yerine bitki çayı veya sade filtre kahve dene.' },
    { title: 'Test planı', body: 'Yarın 1 orta boy domates veya 2 ince dilim salam; saatini not et.' },
  ],
);

const caffeineContent = buildDailyContent(
  [
    { title: 'Kafein ağı', body: 'Kahve, çay, enerji içeceği, kolada ve bitter çikolatada kafein gizlenir. 7 gün tam kesinti — yarım fincan bile protokolü bozar.' },
    { title: 'Yoksunluk dalgası', body: '1–3. gün baş ağrısı, yorgunluk normal olabilir. Su, uyku ve hafif yürüyüş semptom günlüğünü okumayı kolaylaştırır.' },
    { title: 'Adrenalin ve sindirim', body: 'Kafein mide asidini ve bağırsak hareketini etkileyebilir. Reflü ve ishal puanlarına dikkat.' },
    { title: 'Gizli kafein', body: 'Guarana, mate, yeşil çay ekstraktı, bazı ağrı kesiciler — etiket avcılığı devam.' },
    { title: 'Enerji tabanı', body: '4. günden sonra enerji ve odak nasıl? Kafeinsiz “normalin” neye benzediğini kaydet.' },
    { title: 'Uyku kalitesi', body: 'Kafein kesilince uyku derinleşebilir. Uyku puanını her sabah işaretle.' },
    { title: 'Tek fincan testi', body: 'Yarın standart 1 fincan filtre kahve veya 1 bardak siyah çay — aynı saatte, şeker ve süt ekleme.' },
  ],
  [
    { title: 'Kafein envanteri', body: 'Tükettiğin tüm kafein kaynaklarını listele (kahve, çay, kolalar, enerji içeceği, bitter çikolata).' },
    { title: 'Alternatif içecek', body: 'Bugün kafeinsiz bitki çayı veya su; kahve makinesini geçici olarak devre dışı bırak.' },
    { title: 'Baş ağrısı takibi', body: 'Yoksunluk baş ağrısı olursa puanla ama kafein alma — geçici olabilir.' },
    { title: 'Etiket taraması', body: 'Enerji barı veya gazlı içecekte guarana/kafein var mı bak.' },
    { title: 'Enerji eğrisi', body: 'Öğleden sonra enerji düşüşün hâlâ var mı? 3 gün puan ortalaması al.' },
    { title: 'Uyku saati', body: 'Bu gece aynı saatte yat; sabah uyku puanını kaydet.' },
    { title: 'Test hazırlığı', body: 'Yarın için 1 fincan kahve veya 200 ml siyah çay malzemesini hazırla; saat 09:00 gibi sabitle.' },
  ],
);

const alcoholContent = buildDailyContent(
  [
    { title: 'Alkol ve bağırsak', body: 'Alkol bağırsak bariyerini ve mikrobiyotayı etkileyebilir. 7 gün sıfır alkol — sos ve ilaçlardaki alkol dahil.' },
    { title: 'Gizli kaynaklar', body: 'Malt sirkesi, bazı ilaçlar, parfüm gibi değil — yiyecek: et marinasyonu, bazı tatlılar.' },
    { title: 'Uyku illüzyonu', body: 'Alkol uykuya dalmanı kolaylaştırır ama kaliteyi düşürebilir. Uyku puanını izle.' },
    { title: 'Karaciğer molası', body: 'Kesinti sonrası enerji ve odak değişebilir; yargılama, kaydet.' },
    { title: 'Sosyal baskı', body: '“Bir kadeh” protokolü bozar. Mocktail veya maden suyu taşı.' },
    { title: 'Cilt ve reflü', body: 'Alkol reflü ve cilt kızarıklığını tetikleyebilir; bu metrikleri puanla.' },
    { title: 'Tek kadeh testi', body: 'Yarın 1 standart kadeh (150 ml şarap veya 1 biralık) — tek sefer, başka yeni faktör yok.' },
  ],
  [
    { title: 'Alkol sıfır', body: 'Bugün ve bu hafta alkol, alkollü kokteyl ve alkollü tatlı yok.' },
    { title: 'Sos kontrolü', body: 'Yemekte şarap veya likör kullanıldı mı sor; evde pişiriyorsan alkol ekleme.' },
    { title: 'Alternatif içecek', body: 'Sosyal ortamda maden suyu veya alkolsüz kokteyl hazırla.' },
    { title: 'Uyku kaydı', body: 'Alkolsüz gece sonrası sabah uyku puanını kaydet.' },
    { title: 'Reflü izle', body: 'Akşam yemeği sonrası reflü ve mide yanması puanla.' },
    { title: 'Enerji notu', body: 'Öğleden sonra enerji ve odak puanlarını kaydet.' },
    { title: 'Test planı', body: 'Yarın 150 ml şarap veya 330 ml biranın saatini planla.' },
  ],
);

const spicesContent = buildDailyContent(
  [
    { title: 'Baharat spektrumu', body: 'Acı biber, karabiber, kimyon, curry karışımları bağırsak ve reflüyü uyarıabilir. Bu hafta hafif tatlandırma.' },
    { title: 'Capsaicin izi', body: 'Acı biber mide yanması ve ishal ile ilişkilendirilebilir. Acıyı geçici olarak kes.' },
    { title: 'Hazır karışımlar', body: 'Curry, taco, baharatlı tuz — tek tek bileşen bilinmiyorsa risk. Sade tuz + nane dene.' },
    { title: 'Reflü bağlantısı', body: 'Baharatlı yemek sonrası reflü artıyor mu? Öğün sonrası 2 saat puanla.' },
    { title: 'Kültürel alışkanlık', body: 'Acısız yemek sıkıcı gelebilir; nane, kekik, limon ile lezzet kat.' },
    { title: 'Cilt ve terleme', body: 'Aşırı acı bazen cilt kızarıklığı ve terlemeyi artırır; cilt puanını izle.' },
    { title: 'Tek baharat testi', body: 'Yarın yemeğine 1 çay kaşığı kırmızı biber veya karabiber ekle — tek değişken.' },
  ],
  [
    { title: 'Acıyı kes', body: 'Acı biber, pul biber, acı sos ve baharatlı cips bu hafta yok.' },
    { title: 'Sade pişir', body: 'Bugün tuz, nane, kekik dışında baharat kullanma.' },
    { title: 'Hazır karışım', body: 'Curry/taco tozu yerine tek baharat seç veya hiç kullanma.' },
    { title: 'Reflü günlüğü', body: 'Akşam yemeği sonrası reflü ve mide yanması puanla.' },
    { title: 'Dışarıda sipariş', body: '“Az baharatlı” veya “sade” iste; sos isteme.' },
    { title: 'Lezzet alternatifi', body: 'Limon, zeytinyağı ve taze otlarla öğün tatlandır.' },
    { title: 'Test hazırlığı', body: 'Yarın 1 çay kaşığı pul biber veya karabiber için hazırla.' },
  ],
);

const nutsContent = buildDailyContent(
  [
    { title: 'Kuruyemiş ailesi', body: 'Badem, ceviz, fındık, fıstık, kaju — hepsi bu hafta dışarı. Süt alternatiflerinde bile iz olabilir.' },
    { title: 'Gizli fıstık', body: 'Fıstık ezmesi, satay sosu, bazı çikolatalar. Alerjen satırı şart.' },
    { title: 'Omega alternatifleri', body: 'Balık veya keten tohumu ile yağ asidi dengesini koru.' },
    { title: 'Cilt ve nefes', body: 'Kuruyemiş bazen cilt ve sindirim izi bırakır; cilt ve karın puanla.' },
    { title: 'Atıştırmalık planı', body: 'Meyve, humus (susam yoksa), yoğurt alternatifi hazırla.' },
    { title: 'Çapraz iz', body: 'Aynı kasede kuruyemiş varsa başka atıştırmalıklara geçme.' },
    { title: 'Tek fıstık testi', body: 'Yarın 10–12 adet çiğ badem veya 1 yemek kaşığı fıstık ezmesi.' },
  ],
  [
    { title: 'Kuruyemiş molası', body: 'Tüm kuruyemiş, fıstık ezmesi ve kuruyemişli barları kenara al.' },
    { title: 'Etiket oku', body: '“İz miktarda kuruyemiş” uyarısı olan ürünleri bu hafta alma.' },
    { title: 'Alternatif atıştır', body: 'Elma dilimi + humus veya havuç çubuk kullan.' },
    { title: 'Cilt takibi', body: 'Cilt ve karın ağrısı puanlarını günlük kaydet.' },
    { title: 'Sos taraması', body: 'Satay, pesto (çam fıstığı), bazı salata sosları — bir etiket incele.' },
    { title: 'Omega kaynağı', body: 'Bugün balık veya 1 yemek kaşığı keten tohumu tüket.' },
    { title: 'Test planı', body: 'Yarın 10 çiğ badem; tek başına, başka yeni gıda yok.' },
  ],
);

const sweetenersContent = buildDailyContent(
  [
    { title: 'Yapay tatlandırıcılar', body: 'Aspartam, sukraloz, sakarin, stevia — bağırsak ve baş ağrısı ile ilişkilendirilir. 7 gün tam kesinti.' },
    { title: 'Diyet ürünler', body: 'Diyet kola, şekersiz sakız, “zero” içecekler. Etikette -ol veya “diet” ara.' },
    { title: 'Mikrobiyota etkisi', body: 'Tatlandırıcılar bazı bağırsak bakterilerini etkileyebilir. Gaz ve şişkinliği izle.' },
    { title: 'Baş ağrısı', body: 'Aspartam bazı kişilerde baş ağrısı tetikleyici olabilir; puanla.' },
    { title: 'Doğal tat alternatifi', body: 'Bu hafta küçük miktar bal veya meyve — FODMAP programın yoksa.' },
    { title: 'Gizli kaynak', body: 'Protein tozu, vitamin, şekersiz yoğurt tatlandırıcı içerebilir.' },
    { title: 'Tek tatlandırıcı testi', body: 'Yarın diyet kolada veya 1 stick tatlandırılmış içecek — standart porsiyon.' },
  ],
  [
    { title: 'Diyet içecek kes', body: 'Diyet kola, zero içecek ve tatlandırılmış sakızı bırak.' },
    { title: 'Etiket avı', body: 'Aspartam, sukraloz, sakarin, acesulfam-K ara; 2 ürün kontrol et.' },
    { title: 'Gaz grafiği', body: 'Şişkinlik ve gaz puanlarını kaydet.' },
    { title: 'Baş ağrısı', body: 'Gün boyu baş ağrısı puanla.' },
    { title: 'Protein tozu', body: 'Kullanıyorsan tatlandırıcı içeriyor mu etikete bak.' },
    { title: 'Doğal tat', body: 'Tatlı isteğini meyve veya az bal ile karşıla — başka programlarla çakışmıyorsa.' },
    { title: 'Test hazırlığı', body: 'Yarın 1 kutu diyet kola veya 1 stick tatlandırıcı için plan yap.' },
  ],
);

const sugaryDrinksContent = buildDailyContent(
  [
    { title: 'Sıvı şeker', body: 'Kola, meyve suyu, soğuk çay, enerji içeceği — hızlı kan şekeri dalgası. 7 gün şekerli içecek yok.' },
    { title: 'Meyve suyu tuzağı', body: '“Doğal” meyve suyu bile yoğun fruktoz taşır. Bu hafta tam meyve tercih et.' },
    { title: 'Enerji ve odak', body: 'Şekerli içecek sonrası çöküş olabilir. Enerji ve odak puanlarını izle.' },
    { title: 'Diş ve reflü', body: 'Asitli ve şekerli içecekler reflüyü artırabilir; akşam puanla.' },
    { title: 'Alışkanlık kırma', body: 'Her öğünde bir bardak alışkanlığını su veya maden suyu ile değiştir.' },
    { title: 'Gizli şeker', body: 'Smoothie, bubble tea, soğuk kahve şurubu — porsiyon şaşırtıcı büyük olabilir.' },
    { title: 'Tek bardak testi', body: 'Yarın 330 ml kola veya 200 ml paket meyve suyu — tek sefer.' },
  ],
  [
    { title: 'Şekerli içecek sıfır', body: 'Kola, gazlı, meyve suyu, hazır soğuk çay — bu hafta yok.' },
    { title: 'Su şişesi', body: 'Yanında su taşı; susayınca otomatik şekerliye uzanma.' },
    { title: 'Enerji eğrisi', body: 'Öğleden sonra enerji düşüşünü 3 gün puanla.' },
    { title: 'Reflü notu', body: 'Akşam gazlı içecek yerine su iç; reflü puanını kaydet.' },
    { title: 'Smoothie kontrolü', body: 'Dışarıda smoothie sipariş etme; evde tam meyve ye.' },
    { title: 'Kafein çakışması', body: 'Enerji içeceği hem şeker hem kafein — ikisini de kes.' },
    { title: 'Test planı', body: 'Yarın 330 ml kola saatini sabitle.' },
  ],
);

const ultraprocessedContent = buildDailyContent(
  [
    { title: 'Ultra işlenmiş nedir?', body: 'Uzun içerik listesi, emülgatör, aroma, stabilizatör — fabrika formülü gıdalar. 7 gün minimum işlem.' },
    { title: 'Hazır öğün', body: 'Dondurulmuş pizza, nugget, hazır çorba, cips — tipik UPF. Evde sade malzemeye dön.' },
    { title: 'Bağırsak ve ruh hali', body: 'UPF tüketimi bağırsak ve ruh hali ile ilişkilendirilir; mood puanını izle.' },
    { title: 'Tuz ve iştah', body: 'Ultra işlenmiş gıdalar iştahı artırabilir. Doygunluk hissini not et.' },
    { title: 'Etiket kuralı', body: '5’ten fazla bileşen veya okuyamadığın kimyasal ad = şüpheli.' },
    { title: 'Zaman kazancı', body: 'Basit yemek (pilav + sebze + protein) UPF’ten yavaş değil; planlama işi.' },
    { title: 'Tek UPF testi', body: 'Yarın 1 porsiyon hazır hamburger veya 1 paket cips — kontrollü miktar.' },
  ],
  [
    { title: 'UPF envanteri', body: 'Bugün yediğin paketli gıdaları listele; yarın azalt.' },
    { title: 'Sade öğün', body: 'Bugün tamamen ev yapımı: protein + sebze + tahıl/patates.' },
    { title: 'Etiket kuralı', body: '5+ bileşenli ürün alma; 1 ürün etiketini incele.' },
    { title: 'Ruh hali', body: 'Mood ve enerji puanlarını akşam kaydet.' },
    { title: 'Atıştırmalık', body: 'Cips yerine mısır patlağı (sade) veya meyve dene.' },
    { title: 'Hazır yemek', body: 'Dondurulmuş hazır yemek yerine 20 dk’lık tencere yemeği pişir.' },
    { title: 'Test hazırlığı', body: 'Yarın 1 standart UPF porsiyonu (hamburger veya küçük cips) planla.' },
  ],
);

export const ELIMINATION_PROGRAMS = [
  {
    slug: 'dairy',
    title: 'Süt Ürünleri',
    emoji: '🥛',
    description: 'Süt, peynir ve gizli laktoz kaynaklarını 7 gün dışarı al. Vücudunun süt yokken verdiği sinyalleri topla — teşhis değil, iz sürme.',
    durationDays: ELIMINATION_DURATION_DAYS,
    prohibitedFoods: ['Süt', 'Peynir', 'Yoğurt', 'Tereyağı', 'Krema', 'Ayran', 'Whey protein', 'Laktozlu tatlılar'],
    allowedFoods: ['Et, tavuk, balık', 'Sebze ve meyve', 'Pirinç, patates', 'Zeytinyağı', 'Bitkisel sütler (susam hariç programına göre)'],
    hiddenSources: ['Whey', 'Kazein', 'Laktoz', 'Süt tozu', 'Kremalı soslar', 'Bisküvi ve kek'],
    reintroductionProtocol: {
      food: '1 bardak süt veya 50 g kaşar peyniri',
      amount: 'Tek seferde, diğer yeni gıda olmadan',
      instruction: 'Sabah veya öğle yemeğinde tüket. Sonraki 48 saat belirti puanlarını eliminasyon ortalamasıyla karşılaştır.',
    },
    completionBadge: 'Süt Dedektifi',
    ...dairyContent,
  },
  {
    slug: 'gluten',
    title: 'Gluten',
    emoji: '🌾',
    description: 'Buğday, arpa ve çavdarı 7 gün sıfırla. Gizli un ve çapraz bulaşma en büyük düşman — dedektif defterini aç.',
    durationDays: ELIMINATION_DURATION_DAYS,
    prohibitedFoods: ['Buğday ekmeği', 'Makarna', 'Bulgur', 'Börek', 'Simit', 'Arpa', 'Çavdar', 'Glutenli soslar'],
    allowedFoods: ['Pirinç', 'Patates', 'Mısır', 'Glutensiz yulaf (sertifikalı)', 'Et, sebze, meyve'],
    hiddenSources: ['Soya sosu', 'Malt', 'Bulgur', 'Spelt', 'Kızartma kaplaması', 'Hazır çorba'],
    reintroductionProtocol: {
      food: '1 dilim tam buğday ekmeği veya 2 yemek kaşığı bulgur pilavı',
      amount: 'Tek öğünde',
      instruction: '48 saat boyunca şişkinlik, gaz ve enerji puanlarını kaydet; eliminasyon haftası ortalamasıyla kıyasla.',
    },
    completionBadge: 'Gluten Kaşifi',
    ...glutenContent,
  },
  {
    slug: 'egg',
    title: 'Yumurta',
    emoji: '🥚',
    description: 'Yumurta ve yumurtalı bileşenleri bir hafta dışarıda tut. Sarı mı ak mı değil — önce tam eliminasyon, sonra tek yumurta kanıtı.',
    durationDays: ELIMINATION_DURATION_DAYS,
    prohibitedFoods: ['Yumurta', 'Mayonez', 'Yumurtalı pasta', 'Albumin içeren ürünler', 'Nugget kaplaması (yumurtalı)'],
    allowedFoods: ['Et, tavuk, balık', 'Baklagil', 'Sebze, meyve', 'Pirinç, patates', 'Yumurtasız ekmek'],
    hiddenSources: ['Albumin', 'Lesitin (E322)', 'Yumurta tozu', 'Mayonez', 'Kek ve kurabiye'],
    reintroductionProtocol: {
      food: '1 adet haşlanmış veya rafadan yumurta',
      amount: 'Tek başına',
      instruction: 'Kahvaltıda tüket; 24–48 saat karın ağrısı, cilt ve sindirim puanlarını izle.',
    },
    completionBadge: 'Yumurta İzleyicisi',
    ...eggContent,
  },
  {
    slug: 'fodmap',
    title: 'Yüksek FODMAP',
    emoji: '🧅',
    description: 'Soğan, elma, baklagil ve fermente olabilen karbonhidratları geçici olarak kes. Bağırsak gazı ve şişkinlik ipuçlarını ayır.',
    durationDays: ELIMINATION_DURATION_DAYS,
    prohibitedFoods: ['Soğan, sarımsak', 'Elma, armut', 'Bal', 'Fasulye, mercimek (yüksek porsiyon)', 'Karnabahar, brokoli', 'Sorbitol içeren sakız'],
    allowedFoods: ['Havuç, kabak, patates', 'Kavun, mandalina', 'Pirinç, yulaf (düşük porsiyon)', 'Et, tavuk, balık', 'Hard peynir (küçük miktar)'],
    hiddenSources: ['Soğan tozu', 'Sarımsak tozu', 'Inulin', 'Fruktooligosakkarit', 'Hazır soslar'],
    reintroductionProtocol: {
      food: 'Yarım elma veya 1 yemek kaşığı bal',
      amount: 'Tek FODMAP kaynağı',
      instruction: 'Başka yeni gıda ekleme; 48 saat gaz ve şişkinlik puanlarını takip et.',
    },
    completionBadge: 'FODMAP Avcısı',
    ...fodmapContent,
  },
  {
    slug: 'histamine',
    title: 'Histamin',
    emoji: '🍅',
    description: 'Olgun, fermente ve bekletilmiş gıdaları sadeleştir. Baş ağrısı ve cilt izlerini histamin haftasında netleştir.',
    durationDays: ELIMINATION_DURATION_DAYS,
    prohibitedFoods: ['Turşu, kimchi', 'Olgun peynir, salam', 'Domates, salça', 'Balık (eski/ısıt-tekrar)', 'Siyah çay, kakao'],
    allowedFoods: ['Taze pişmiş et', 'Taze balık (aynı gün)', 'Taze sebze', 'Taze lor peyniri', 'Bitki çayları'],
    hiddenSources: ['Salam, sucuk', 'Kombucha', 'Sirke bazlı sos', 'Olgun avokado/muz', 'Çikolata'],
    reintroductionProtocol: {
      food: '1 orta boy domates veya 2 ince dilim salam',
      amount: 'Tek sefer',
      instruction: 'Tüketim saatini kaydet; 24–48 saat baş ağrısı, cilt ve sindirim puanlarını izle.',
    },
    completionBadge: 'Histamin Dedektifi',
    ...histamineContent,
  },
  {
    slug: 'caffeine',
    title: 'Kafein',
    emoji: '☕',
    description: 'Kahve, çay ve gizli kafeini 7 gün kes. Yoksunluk dalgası geçici olabilir — enerji ve uyku grafiğin asıl kanıt.',
    durationDays: ELIMINATION_DURATION_DAYS,
    prohibitedFoods: ['Kahve', 'Siyah/yeşil çay', 'Enerji içeceği', 'Kola', 'Guarana', 'Bitter çikolata (yüksek kakao)'],
    allowedFoods: ['Su', 'Bitki çayları (kafeinsiz)', 'Maden suyu', 'Kafeinsiz içecekler', 'Normal yemekler (kafeinsiz)'],
    hiddenSources: ['Guarana', 'Mate', 'Yeşil çay ekstraktı', 'Kafeinli ağrı kesiciler', 'Protein barları'],
    reintroductionProtocol: {
      food: '1 fincan filtre kahve veya 200 ml siyah çay',
      amount: 'Standart porsiyon, şekersiz',
      instruction: 'Aynı saatte tüket; 48 saat enerji, uyku, baş ağrısı ve reflü puanlarını kaydet.',
    },
    completionBadge: 'Kafein Gözlemcisi',
    ...caffeineContent,
  },
  {
    slug: 'alcohol',
    title: 'Alkol',
    emoji: '🍷',
    description: 'Bir hafta sıfır alkol — bağırsak, uyku ve reflü sinyallerini netleştirmek için en temiz deney.',
    durationDays: ELIMINATION_DURATION_DAYS,
    prohibitedFoods: ['Bira, şarap, rakı', 'Kokteyl', 'Alkollü tatlı', 'Yemekte şarap'],
    allowedFoods: ['Su', 'Maden suyu', 'Alkolsüz kokteyl', 'Normal yemekler', 'Bitki çayları'],
    hiddenSources: ['Şarap sosu', 'Malt sirkesi (bazı)', 'Alkollü ekstre', 'Marinasyon'],
    reintroductionProtocol: {
      food: '150 ml şarap veya 330 ml bira',
      amount: '1 standart porsiyon',
      instruction: 'Akşam tek sefer; 48 saat uyku, reflü ve ruh hali puanlarını eliminasyon ortalamasıyla karşılaştır.',
    },
    completionBadge: 'Alkol Analisti',
    ...alcoholContent,
  },
  {
    slug: 'spices',
    title: 'Baharat',
    emoji: '🌶',
    description: 'Acı ve yoğun baharat karışımlarını geçici olarak kes. Reflü ve mide yanması izlerini sadeleştir.',
    durationDays: ELIMINATION_DURATION_DAYS,
    prohibitedFoods: ['Acı biber, pul biber', 'Curry tozu', 'Baharatlı cips', 'Acı sos', 'Karabiber (yüksek miktar)'],
    allowedFoods: ['Tuz', 'Nane, kekik', 'Limon', 'Zeytinyağı', 'Sade et ve sebze'],
    hiddenSources: ['Taco seasoning', 'Hazır baharatlı tuz', 'Acı salça', 'Kimchi (acılı)'],
    reintroductionProtocol: {
      food: '1 çay kaşığı pul biber veya karabiber',
      amount: 'Tek öğüne serpiştirilmiş',
      instruction: 'Akşam yemeğinde dene; 24–48 saat reflü, mide yanması ve ishal puanlarını izle.',
    },
    completionBadge: 'Baharat Gözlemcisi',
    ...spicesContent,
  },
  {
    slug: 'nuts',
    title: 'Kuruyemiş',
    emoji: '🥜',
    description: 'Tüm kuruyemiş ve fıstık türevlerini bir hafta çıkar. Cilt ve sindirim ipuçlarını ayır.',
    durationDays: ELIMINATION_DURATION_DAYS,
    prohibitedFoods: ['Badem, ceviz, fındık', 'Fıstık ve fıstık ezmesi', 'Kaju, antep fıstığı', 'Kuruyemişli bar'],
    allowedFoods: ['Et, tavuk, balık', 'Sebze, meyve', 'Pirinç, patates', 'Keten tohumu', 'Humus (susam yoksa)'],
    hiddenSources: ['Pesto', 'Satay sosu', 'Çikolata içi', 'Granola', 'Süt alternatiflerinde iz'],
    reintroductionProtocol: {
      food: '10–12 adet çiğ badem veya 1 yemek kaşığı fıstık ezmesi',
      amount: 'Tek atıştırmalık',
      instruction: 'Öğleden sonra tüket; 48 saat cilt, karın ağrısı ve gaz puanlarını kaydet.',
    },
    completionBadge: 'Kuruyemiş Kaşifi',
    ...nutsContent,
  },
  {
    slug: 'sweeteners',
    title: 'Yapay Tatlandırıcılar',
    emoji: '🍭',
    description: 'Aspartam, sukraloz ve diyet içecekleri kes. Bağırsak ve baş ağrısı desenlerini sadeleştir.',
    durationDays: ELIMINATION_DURATION_DAYS,
    prohibitedFoods: ['Diyet kola', 'Zero içecek', 'Tatlandırılmış sakız', 'Şekersiz yoğurt (tatlandırıcılı)', 'Protein tozu (tatlandırıcılı)'],
    allowedFoods: ['Su', 'Maden suyu', 'Normal yemekler', 'Meyve', 'Bal (FODMAP programın yoksa)'],
    hiddenSources: ['Aspartam', 'Sukraloz', 'Sakarin', 'Acesulfam-K', 'Stevia (yoğun ürünler)'],
    reintroductionProtocol: {
      food: '1 kutu diyet kola veya 1 stick tatlandırılmış içecek',
      amount: 'Standart porsiyon',
      instruction: 'Tek sefer; 48 saat gaz, şişkinlik ve baş ağrısı puanlarını izle.',
    },
    completionBadge: 'Tatlandırıcı Dedektifi',
    ...sweetenersContent,
  },
  {
    slug: 'sugary_drinks',
    title: 'Şekerli İçecekler',
    emoji: '🥤',
    description: 'Kola, meyve suyu ve şekerli soğuk içecekleri bir hafta bırak. Enerji dalgası ve reflü izlerini oku.',
    durationDays: ELIMINATION_DURATION_DAYS,
    prohibitedFoods: ['Kola, gazlı içecek', 'Paket meyve suyu', 'Hazır soğuk çay', 'Enerji içeceği (şekerli)', 'Bubble tea'],
    allowedFoods: ['Su', 'Maden suyu', 'Bitki çayı', 'Tam meyve', 'Sade kahve (kafein programın yoksa)'],
    hiddenSources: ['Smoothie şurubu', 'Soğuk kahve şurubu', 'Toz içecek karışımları', 'Spor içecekleri'],
    reintroductionProtocol: {
      food: '330 ml kola veya 200 ml paket meyve suyu',
      amount: 'Tek bardak',
      instruction: 'Öğleden sonra tüket; 48 saat enerji, odak ve reflü puanlarını kaydet.',
    },
    completionBadge: 'Şekerli İçecek Avcısı',
    ...sugaryDrinksContent,
  },
  {
    slug: 'ultraprocessed',
    title: 'Ultra İşlenmiş Gıdalar',
    emoji: '🍔',
    description: 'Uzun etiket listeli fabrika gıdalarını kes; sade malzemeyle bir hafta geçir. Ruh hali ve bağırsak sinyallerini netleştir.',
    durationDays: ELIMINATION_DURATION_DAYS,
    prohibitedFoods: ['Hazır pizza', 'Nugget, cips', 'Hazır çorba', 'İşlenmiş et ürünleri', 'Endüstriyel tatlı'],
    allowedFoods: ['Ev yapımı yemek', 'Taze sebze, meyve', 'Tam tahıl (basit)', 'Et, tavuk, balık', 'Zeytinyağı'],
    hiddenSources: ['Emülgatör', 'Aroma', 'Hazır sos', 'Dondurulmuş hazır yemek', 'Protein barı'],
    reintroductionProtocol: {
      food: '1 porsiyon hazır hamburger veya 1 küçük paket cips',
      amount: 'Standart porsiyon',
      instruction: 'Tek öğünde tüket; 48 saat mood, enerji ve sindirim puanlarını eliminasyon ortalamasıyla karşılaştır.',
    },
    completionBadge: 'UPF Dedektifi',
    ...ultraprocessedContent,
  },
];

const programBySlug = Object.fromEntries(ELIMINATION_PROGRAMS.map((p) => [p.slug, p]));

export function getEliminationProgram(slug) {
  return programBySlug[slug] || null;
}

export function getProgramDayContent(program, dayNumber) {
  if (!program) return { lesson: null, task: null };
  const day = Math.max(1, Math.min(ELIMINATION_DURATION_DAYS, Number(dayNumber) || 1));
  const lesson = (program.dailyLessons || []).find((item) => item.day === day) || null;
  const task = (program.dailyTasks || []).find((item) => item.day === day) || null;
  return { lesson, task };
}

export function getAllEliminationPrograms() {
  return ELIMINATION_PROGRAMS;
}
