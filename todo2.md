# Sindirim Check-in Modal

## Görev

Uygulamaya, kullanıcının sindirim sistemi durumunu günde en fazla 2 kez sorduğu, hızlı doldurulabilen bir **check-in modalı** ekle. Modal; sabah ilk açılışta ve öğleden sonra (14:00'ten sonra) ilk açılışta otomatik tetiklenmeli, günde 2'den fazla gösterilmemeli.

## 1. Tetikleme Mantığı

Local storage'da (AsyncStorage / localStorage, projenin kullandığı yapıya göre) günlük bir kayıt tut:

```ts
type CheckinDayState = {
  date: string;        // "2026-07-21" formatında, cihaz local tarihine göre
  morningShown: boolean;
  afternoonShown: boolean;
};
```

Kurallar:
- Uygulama her ön plana geldiğinde (app foreground / mount) bu state kontrol edilir.
- Kayıtlı `date` bugünün tarihinden farklıysa state sıfırlanır (`morningShown: false, afternoonShown: false`), yeni tarih yazılır.
- Şu anki saat **14:00'ten önce** ise ve `morningShown === false` ise → modal açılır, sonra `morningShown = true` yapılır.
- Şu anki saat **14:00 veya sonrası** ise ve `afternoonShown === false` ise → modal açılır, sonra `afternoonShown = true` yapılır.
- Diğer tüm durumlarda modal açılmaz (aynı gün içinde tekrar tekrar tetiklenmemeli, örneğin kullanıcı uygulamayı 10 kez açsa bile günde max 2 kez gösterilir).
- Kullanıcı modalı "İyiyim" ile kapatsa da, formu doldurup kapatsa da, X ile geçse de → o slot `shown = true` olarak işaretlenmeli (tekrar sorulmasın). Sadece kapatma (dismiss) davranışını override etmek istersen, "X ile kapatma" durumunda tekrar hatırlatma eklenebilir ama **varsayılan davranış: bir kez gösterildi mi bir daha o slotta gösterilmez**.
- 14:00 eşik değerini bir config sabiti olarak tanımla (`AFTERNOON_CUTOFF_HOUR = 14`), ileride değiştirilebilsin.

## 2. Form Akışı (Modal İçeriği)

Amaç: **1-2 dokunuşla kapatılabilen**, gerektiğinde 1 ekstra adıma genişleyen bir akış.

### Adım 1 — Ana ekran (her zaman gösterilir)
- Başlık: "Şu an nasıl hissediyorsun?"
- Büyük, öne çıkan buton: **"İyiyim"** → tıklanınca direkt kaydet ve modalı kapat (tek dokunuş, form biter).
- Altında toggle chip grid'i (multi-select), örnek belirtiler:
  - Şişkinlik, Gaz, Karın ağrısı, Mide ağrısı, Mide yanması, Bulantı, Geğirme, Reflü hissi, Halsizlik, Baş ağrısı
- Kullanıcı bir veya birden fazla chip'e tıklarsa:
  - Chip seçili state'e geçer (renk/border değişimi).
  - **Aynı ekranda**, seçilen her chip'in altında/yanında inline bir şiddet seçici belirir (yeni sayfa/route açma — mevcut modal içinde genişlesin): **Hafif / Orta / Şiddetli** (3 buton, tek seçim).
  - Seçilmeyen chip'ler için hiçbir ek soru gösterilmez.
- Ekranın altında sabit bir **"Kaydet"** butonu bulunur (chip seçilmese bile "İyiyim" ile aynı işlevi görebilir, chip seçiliyse şiddetleri de kaydeder).

### Adım 2 — Koşullu ek soru (opsiyonel, nadiren tetiklenir)
- Sadece şu durumda gösterilir: seçilen belirtilerden en az biri **"Şiddetli"** işaretlendiyse.
- Kullanıcı "Kaydet"e bastığında, şiddetli belirti(ler) için modal içinde **tek bir ek soru** ekranı açılır (bir sonraki adım, aynı modal içinde slide/fade geçiş).
- Soru belirtiye göre değişebilir, örnek eşleme:
  - Reflü / mide yanması → "Yatar pozisyonda mı arttı?" (Evet / Hayır)
  - Gaz / şişkinlik / karın ağrısı → "Son öğünle ilişkili mi?" (Öğün öncesi / Öğün sonrası / Bağımsız)
  - Bulantı / mide ağrısı → "Ne kadar süredir devam ediyor?" (Yeni başladı / Birkaç saattir / Bütün gün)
- Bu ekranda üstte **"Atla"** linki olmalı — kullanıcı isterse cevaplamadan geçebilir.
- Birden fazla şiddetli belirti varsa bile **sadece 1 soru** sor (en öncelikli/ilk seçilen belirtiye göre), formu uzatma.

### Adım 3 — Kaydet ve kapan
- "Kaydet" veya "Atla" sonrası modal otomatik kapanır (ekstra "Tamamlandı" ekranına gerek yok, en fazla kısa bir toast/snackbar: "Kaydedildi").

## 3. Veri Şeması

```ts
type CheckinEntry = {
  id: string;
  timestamp: string;        // ISO 8601
  timeOfDay: "morning" | "afternoon";
  symptoms: {
    name: string;           // "gaz", "siskinlik" vs. sabit enum kullan
    severity: 1 | 2 | 3;    // Hafif / Orta / Şiddetli
  }[];
  followUp: {
    symptom: string;
    question: string;
    answer: string;
  } | null;
  note?: string;             // ileride eklenebilir, şimdilik opsiyonel/kullanılmayabilir
};
```

## 4. Kenar Durumlar

- Uygulama gece yarısını geçerse (kullanıcı gece 00:00'dan sonra hâlâ açıksa) yeni günün state'i doğru resetlenmeli.
- Kullanıcı saatini/saat dilimini değiştirirse tutarsızlık oluşmaması için cihaz local time kullan, UTC karmaşasına girme.
- Modal açıkken uygulama arka plana atılıp geri gelirse modal tekrar tetiklenmemeli (state zaten `shown=true` yazılmış olacak, açma işlemi sadece mount anında kontrol edilsin).
- Chip seçimi geri alınabilir olmalı (tekrar tıklayınca seçim kalkar, şiddet seçici de kaybolur).

## 5. Kabul Kriterleri

- [ ] Uygulama sabah (14:00'ten önce) ilk açıldığında modal 1 kez görünür.
- [ ] Aynı gün 14:00'ten sonra ilk açılışta modal 1 kez daha görünür.
- [ ] Aynı slot içinde uygulama tekrar tekrar açılsa modal tekrar görünmez.
- [ ] "İyiyim" butonuna basınca tek tıkla kayıt oluşur ve modal kapanır.
- [ ] Chip seçilince şiddet seçici aynı ekranda genişler, yeni sayfa açılmaz.
- [ ] Şiddetli seçilmediyse ek soru adımı hiç gösterilmez.
- [ ] Şiddetli seçildiyse tek bir ek soru gösterilir, "Atla" ile geçilebilir.
- [ ] Tüm veriler `CheckinEntry` şemasına uygun şekilde local storage'a kaydedilir.

---

Lütfen bu akışı yukarıdaki bileşen yapısına göre implemente et, mevcut proje stil/tema sistemine (varsa) uy. Veriyi supabase de kaydedeceğiz. Gerekli tabloları güncelle veya ihtiyaç varsa ekle. Kullanıcı sindirim sistemini anlamaya çalışıyor. Formda dr badoo ikon yer alabilir. 
