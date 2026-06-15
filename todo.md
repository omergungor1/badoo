# BEDEN GÜNLÜĞÜ – ÜRÜN TASARIM DOKÜMANI

Sen deneyimli bir Product Manager, UX Designer ve Senior Full Stack Developer'sın.

Bana "Beden Günlüğü" isimli mobil uygulamayı tasarlamanı ve geliştirmeni istiyorum.

Bu uygulama bir kalori sayma uygulaması değildir.

Temel amacı:

"Kullanıcının ne yediğini, ne içtiğini, nasıl uyuduğunu, hangi ilacı kullandığını, nasıl hissettiğini ve sindirim sisteminin nasıl tepki verdiğini uzun vadede takip ederek kişinin kendi vücudunu anlamasına yardımcı olmak."

İleride yapay zeka analizleri eklenecek ancak ilk sürümde AI yorumları olmayacak.

Öncelik kaliteli veri toplamaktır.

---

# TEKNOLOJİ

Backend:

* Supabase Auth
* Supabase PostgreSQL
* Supabase Storage

Mobil:

* React Native + Expo

Kod yapısı:

* ölçeklenebilir
* modüler
* feature based architecture

---

# TASARIM DİLİ

Tasarım dili:

* Duolingo kadar eğlenceli
* Blinkist kadar temiz
* Headspace kadar sıcak
* Apple Health kadar düzenli

Hedef:

Kullanıcı uygulamaya veri girmekten sıkılmamalı.

Tüm ekranlarda:

* büyük kartlar
* renkli ikonlar
* mikro animasyonlar
* ilerleme hissi
* görev tamamlama hissi

olmalı.

Asla hastane uygulaması gibi görünmemeli.

---

# ANA AMAÇ

Kullanıcı aşağıdaki sorulara zaman içinde cevap bulabilmeli:

* Ne yedim?
* Bana nasıl hissettirdi?
* Ne zaman şişkinlik yaşadım?
* Hangi besinler beni etkiliyor?
* Enerjim neden düştü?
* Uyku kalitem ne durumda?
* Yeterli protein alıyor muyum?
* Yeterli su içiyor muyum?
* Hareket ediyor muyum?

---

# İLK KURULUM (ONBOARDING)

Kullanıcıdan:

## Temel Bilgiler

* doğum yılı
* cinsiyet
* boy
* kilo
-> günlük kalori, protein, su ihityacını hesaplayıp kullanıcıya kaydedelim.
-> Boy kilo endeksini ve kilo eksikliği veya fazlalığını gösterelim (13kg almanız-vermeniz tavsiye ediliyor gibi...)

## Hedefler

* kilo vermek
* kilo almak
* kilosunu korumak
* sindirim sistemini anlamak
* protein takibi yapmak
* sağlıklı yaşam

birden fazla seçilebilir.

---

## Bilinen Hastalıklar

Kullanıcı seçebilmeli:

* IBS
* Gastrit
* Reflü
* Çölyak
* Laktoz intoleransı
* Fruktoz intoleransı
* H. pylori geçmişi
* Kabızlık
* Kronik ishal
* Diyabet
* Hipotiroidi
* Hashimoto

ve

* Hastalık Ekle

---

## Besin Hassasiyetleri

Kullanıcı işaretleyebilmeli:

* Süt
* Laktoz
* Gluten
* Buğday
* Yumurta
* Soya
* Fındık/Fıstık
* Deniz ürünleri

ve

* Hassasiyet Ekle

---

## Kullanılan İlaçlar

Hazır ilaç havuzu

ve

* İlaç Ekle

---

# ANA EKRAN

Uygulamanın merkezi burasıdır.

Bugün ekranı.

Üstte:

Günlük ilerleme yüzdesi.

Örnek:

Bugün %75 tamamlandı

---

# GÜNLÜK GÖREVLER

Kullanıcı veri girmeyi unutmasın.

Görevler:

☐ Sabah durumunu gir

☐ Öğünlerini ekle

☐ Su takibini tamamla

☐ Tuvalet kaydı ekle

☐ Gün sonu değerlendirmesi yap

Tamamlanan görevler kaybolmalı.

---

# HIZLI EKLE (+)

Ekranın merkezinde büyük FAB butonu.

Basınca:

* Yemek Ekle

* Su Ekle

* İçecek Ekle

* İlaç Ekle

* Belirti Ekle

* Tuvalet Ekle

* Uyku Ekle

* Aktivite Ekle

* Not Ekle

---

# YEMEK EKLE

Besin havuzu bulunmalı.

Arama yapılabilmeli.

Örnek:

* Yumurta
* Tavuk
* Pirinç
* Ayran
* Muz

Seçilebilmeli.

Her besinde:

* kalori
* protein
* karbonhidrat
* yağ

olmalı.

Kullanıcı isterse:

* gram
* porsiyon

girebilmeli.

Saat otomatik gelsin.

İsterse değiştirebilsin.

---

# BESİN VERİTABANI

Yaygın Türk yemekleri bulunmalı.

Örnek:

* menemen
* mercimek çorbası
* kuru fasulye
* pilav
* simit
* börek

İleride genişletilebilir yapıda tasarlanmalı.

---

# SU TAKİBİ

Tek dokunuşla:

+200 ml

+300 ml

+500 ml

+1000 ml

eklenebilmeli.

Günlük hedef:

otomatik hesaplanmalı.

---

# İÇECEK TAKİBİ

* çay
* kahve
* kola
* enerji içeceği
* soda
* ayran

vb.

---

# İLAÇ TAKİBİ

İlaç havuzu olmalı.

Kullanıcı seçebilmeli.

Kaydedilen bilgiler:

* ilaç adı
* saat
* doz

---

# BELİRTİ TAKİBİ

Kullanıcı gün içinde istediği kadar belirti ekleyebilmeli.

Hazır belirtiler:

* şişkinlik
* gaz
* karın ağrısı
* mide ağrısı
* mide yanması
* mide bulantısı
* geğirme
* reflü hissi
* halsizlik
* baş ağrısı

Şiddet:

0-5

Opsiyonel not.

Örnek:

Gaz 4/5

Not:
Mercimek yedikten sonra başladı.

---

# SERBEST NOTLAR

Kullanıcı istediği zaman not bırakabilmeli.

Örnek:

"Karnım şu an çok rahat."

"Öğleden sonra gazım arttı."

"Süt içtikten sonra şişkinlik başladı."

Bu notlar zaman damgası ile kaydedilmeli.

---

# TUVALET TAKİBİ

Kaydedilmeli:

Saat

Kıvam:

* Bristol 1
* Bristol 2
* Bristol 3
* Bristol 4
* Bristol 5
* Bristol 6
* Bristol 7

Ek açıklama

---

# UYKU TAKİBİ

Sabah görevinde sorulmalı.

* kaç saat uyundu
* uyku kalitesi (1-5)
* gece kaç kez uyandı

---

# AKTİVİTE TAKİBİ

Hazır aktiviteler:

* yürüyüş
* koşu
* bisiklet
* fitness
* yüzme

Kaydedilmeli:

* süre
* mesafe (opsiyonel)

---

# GÜNLÜK DURUM

Her sabah ve akşam sorulmalı.

Enerji:

1-5

Stres:

1-5

Ruh Hali:

1-5

Motivasyon:

1-5

---

# BESLENME HEDEFLERİ

Sistem otomatik hesaplamalı:

* günlük kalori ihtiyacı
* günlük protein ihtiyacı
* günlük su ihtiyacı

Kullanıcının:

* yaş
* boy
* kilo
* cinsiyet
* hedef

bilgilerine göre.

---

# RAPORLAR

AI olmadan.

Haftalık:

* toplam kalori
* ortalama protein
* ortalama su
* toplam aktivite süresi
* belirtilerin dağılımı
* uyku ortalaması

---

# VERİ MODELİ

Supabase üzerinde aşağıdaki tablolar tasarlanmalı:

profiles
conditions
food_sensitivities
foods
food_logs
water_logs
drink_logs
medications
medication_logs
symptom_logs
stool_logs
sleep_logs
activity_logs
daily_status_logs
notes
daily_tasks
goals

Tüm tablolarda user_id bazlı Row Level Security uygulanmalı.

---

# ÖNEMLİ

Bu sürümde:

* Yapay zeka yorumları yok
* Tıbbi teşhis yok
* Hastalık tahmini yok

Ama veri modeli gelecekte AI analizlerine uygun tasarlanmalı.

Mimariyi buna göre kur.

Amaç:

Kullanıcının yaşam tarzını, beslenmesini, sindirim durumunu ve genel sağlık alışkanlıklarını mümkün olan en kaliteli şekilde kayıt altına almak.


Ben bu proje için **turuncu ağırlıklı bir palet** öneririm.

Sebebi:

* Duolingo yeşili artık dil öğrenme uygulamalarını çağrıştırıyor.
* Sağlık uygulamalarındaki klasik mavi çok klinik duruyor.
* Turuncu; enerji, sıcaklık, yaşam, sindirim ve beslenme temalarıyla daha uyumlu.
* Yemek uygulamalarında iştah açıcı etki yaratıyor.
* Kullanıcının her gün veri girmesini teşvik eden "pozitif" bir his veriyor.

**Beden Günlüğü** için hedefimiz:

> Hastane uygulaması değil, "vücudunu keşfetme oyunu" hissi.

---

# Tasarım Karakteri

Karışım:

* Duolingo → eğlenceli
* Finch → kişisel gelişim
* Headspace → sıcak
* Blinkist → sade

---

# Ana Renk Paleti

### Primary Orange

```css
#FF7A00
```

Ana CTA'lar

* Kaydet
* Ekle
* Devam Et

---

### Primary Dark

```css
#E86800
```

Pressed state

---

### Primary Light

```css
#FFF1E5
```

Kart arkaplanları

---

### Background

```css
#FFF9F3
```

Tam beyaz yerine hafif krem

Daha sıcak görünür.

---

### Text Primary

```css
#2D2D2D
```

---

### Text Secondary

```css
#6D6D6D
```

---

### Border

```css
#EFE5DB
```

---

# Durum Renkleri

### Su Takibi

```css
#4AA8FF
```

---

### Protein

```css
#8B5CF6
```

---

### Aktivite

```css
#22C55E
```

---

### Uyku

```css
#7C83FD
```

---

### Sindirim

```css
#FF9F43
```

---

### Ağrı / Kötü Durum

```css
#FF5A5F
```

---

# Font

Expo için:

### Başlık

**Baloo 2**

Tombul ve eğlenceli.

Örnek:

```txt
Bugün nasılsın?
```

çok sevimli görünür.

---

### İçerik

**Nunito Sans**

Okunabilirliği yüksek.

---

# Tab Navigation

5 sekmeli yapı öneriyorum.

```txt
Ana Sayfa
Günlük
    +
İstatistik
Profil
```

---

## 1. Ana Sayfa

🏠

Bugün ekranı

İçerik:

* Günlük görevler
* Kalori ilerlemesi
* Protein ilerlemesi
* Su ilerlemesi
* Son eklenen kayıtlar

---

## 2. Günlük

📖

Zaman çizelgesi

Örnek:

```txt
08:15 Uyandın
08:20 Uyku kaydı
09:00 Kahvaltı
10:30 Su
12:45 Gaz belirtisi
13:00 Öğle yemeği
```

Kullanıcı gününü burada görür.

---

# Ortadaki FAB

➕

En önemli aksiyon.

Yuvarlak.

Turuncu.

Alt navigasyondan dışarı taşmalı.

Yaklaşık:

```txt
64x64
```

---

Basınca Bottom Sheet açılır.

---

## Hızlı Ekle Menüsü

🍽 Yemek Ekle

💧 Su Ekle

☕ İçecek Ekle

💊 İlaç Ekle

😖 Belirti Ekle

🚽 Tuvalet Ekle

😴 Uyku Ekle

🚶 Aktivite Ekle

📝 Not Ekle

---

Bu ekran uygulamanın en çok kullanılan alanı olacak.

---

## 4. İstatistikler

📊

Haftalık

Aylık

Trendler

Kartlar:

* Kalori
* Protein
* Su
* Uyku
* Şişkinlik
* Gaz
* Tuvalet düzeni

---

## 5. Profil

👤

İçerik:

* Boy
* Kilo
* Hedefler
* Hastalıklar
* Hassasiyetler
* İlaçlar
* Bildirimler

---

# Günlük Görev Kartları

Ana sayfanın yıldızı olmalı.

Örnek:

```txt
☀️ Sabah Check-in
```

İçerik:

* Uyku
* Enerji
* Ruh Hali

Buton:

```txt
Tamamla →
```

---

```txt
🍽 Öğünlerini Kaydet
```

---

```txt
🌙 Gün Sonu Değerlendirmesi
```

---

Tamamlanınca:

```txt
✅ Harika!
```

animasyonu.

---

# Genel Hissiyat

Uygulamayı açınca kullanıcı:

> "Bugün vücudum nasıl gidiyor?"

hissini yaşamalı.

Şu hissi vermemeli:

> "Hastalık takip sistemi"

Vermesi gereken his:

> "Kendimi daha iyi tanıyorum."

Bu yüzden turuncu + krem zemin + tombul başlık fontları + büyük kartlar kombinasyonu, Beden Günlüğü'nün konseptine en uygun tek renk paleti ve tasarım yönü olacaktır.


Bu özellik bence uygulamanın en güçlü ekranlarından biri olabilir. Çünkü kullanıcılar tablo okumaktan çok **desen görmeyi** sever.

GitHub contribution graph mantığıyla çalışan bir **"Sindirim Takvimi"** eklemek çok mantıklı.

---

# Sindirim Takvimi

Amaç:

Kullanıcı tek bakışta:

* Hangi günler rahatmış
* Hangi günler sorun yaşamış
* Sorunların ne sıklıkla tekrar ettiğini

görebilsin.

---

## Yerleşim

Ana Sayfa içerisinde küçük özet kartı:

```txt
Sindirim Takvimi

🟩 🟩 🟩 🟨 🟩 🟩 🟩
🟩 🟧 🟥 🟥 🟨 🟩 🟩
🟩 🟩 🟩 🟧 🟩 🟩 🟩
🟨 🟥 🟧 🟩 🟩 🟩 🟩
```

Son 30 gün.

Kartın altında:

```txt
Son 30 günün 21 günü rahattı.
```

---

# Detay Ekranı

Takvime tıklanınca:

## Son 30 Gün

```txt
Mayıs
```

⬜ ⬜ 🟩 🟩 🟩 🟩 🟨

🟩 🟩 🟧 🟧 🟩 🟩 🟩

🟥 🟥 🟧 🟩 🟩 🟩 🟩

🟩 🟩 🟩 🟩 🟨 🟩 🟩

---

# Gün Skoru Hesabı

Kullanıcının girdiği verilere göre günlük bir skor üretilebilir.

Bu tıbbi yorum değildir.

Sadece günlük konfor puanıdır.

---

Örnek girdiler:

Şişkinlik

0-5

Gaz

0-5

Karın Ağrısı

0-5

Mide Yanması

0-5

Tuvalet Durumu

Uyku Kalitesi

Enerji

---

Örnek formül:

```txt
100 puan başlangıç

Şişkinlik × -8
Gaz × -6
Karın ağrısı × -10
Mide yanması × -8

İyi uyku +5
Yüksek enerji +5
```

Sonuç:

0-100 arası

---

# Renkler

## Çok İyi

```txt
90-100
```

🟩

```css
#22C55E
```

---

## İyi

```txt
75-89
```

🟨

```css
#FACC15
```

---

## Orta

```txt
60-74
```

🟧

```css
#FB923C
```

---

## Kötü

```txt
40-59
```

🟥

```css
#EF4444
```

---

## Çok Kötü

```txt
0-39
```

⬛

```css
#7F1D1D
```

---

# Gün Hücresine Basınca

Örnek:

```txt
12 Mayıs
Sindirim Skoru: 42
```

Göster:

```txt
Şişkinlik: 4/5
Gaz: 5/5
Karın Ağrısı: 2/5

Protein: 95g
Su: 2.3L

Uyku: 6 saat

Yemekler:
- Menemen
- Ayran
- Mercimek Çorbası
- Kuru Fasulye
```

---

# Takvimin Altında

Mini özetler:

```txt
En uzun rahat dönem
```

🟩 9 gün

---

```txt
En uzun sorunlu dönem
```

🟥 4 gün

---

```txt
Bu ayın ortalama sindirim skoru
```

82/100

---

# Veri Toplama Açısından Büyük Avantaj

Bu takvim kullanıcıyı veri girmeye teşvik eder.

Çünkü insanlar boş kare görmek istemez.

GitHub'daki contribution grafiğinin etkisi burada da oluşur:

```txt
Bugün boş kalmasın.
```

motivasyonu oluşur.

---

Ben olsam bu özelliği ana navigasyonda ayrı bir sekme yapmazdım.

**Ana Sayfa → Sindirim Takvimi Kartı → Detay Sayfası** akışı daha doğru olur.

Tab bar zaten:

* Ana Sayfa
* Günlük
* ➕
* İstatistikler
* Profil

olarak yeterince dolu. Sindirim Takvimi ise uygulamanın "imza özelliği" olarak Ana Sayfa'nın üst kısmında, protein ve su kartlarının hemen altında yer almalı. Bu sayede kullanıcı uygulamayı açar açmaz son 30 günlük sindirim desenini görür.

proje db si ana dizinde db.sql içinde belirtildi. Tüm tablo yapıları orada mevcut. Bir tablo ekleyebilir, kaldırabilir veya güncelleyebilirsin. Gerekli alter kodunu bana ver ben çalıştırırım. 

ana dizindeki .env içine EXPO_PUBLIC_SUPABASE_URL ve EXPO_PUBLIC_SUPABASE_KEY ekledim. Başka bir bağlantı için ihtiyacın olursa söyle. 