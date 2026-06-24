Hassasiyet sekmesine yeni bir özellik ekleyelim. Kullanıcnın birçok datası elimizde mevcut -> Ai analiz özelliği ekleyeceğiz. Bu analizleri de kaydetmemiz gerekiyor. Her analiz yeni bir ai sağlık chat ekranı açacak aslında. Bu ekranda kullanıcının son 2 haftalık verisi gönderilecek ve besin hassasiyetleri, durum analizi vs yapılacak. 

Ai modeli olarak open ai yeterli  bir modeli kullan. env içinde OPENAI_API_KEY mevcut. 

Kullanıcı yeni analiz butonu ile son iki haftasını tekrar ai gönderip analiz ettirebilir. Veya önceki bir analizini görüntüleybilir. Kullanıcının şikayetlerinin sebeplerini anlamaya ve kullanıcıyı aydınlatmaya yönelik cevaplamalıdır. 

Hassasiyetler sayfasına eklenebilir. Kullanıcı en üstte son analizini butonunu görsün analiz tarihi ile. Eski analizleri listeleyebilmelidir. Dilerse yeni analiz yaptırabilmelidir. Bu yapı ve akışı yönetecek bir sistem kuralım. Ai alınan veri db kaydedilmelidir. 


kullanıcı ile ilgili tüm verileri analiz için göndermelisin son iki haftanın:
- günlük yaptıkları
- aktiviteleri
- semptomları-şikayetleri
- notları
- uyku saatleri -> gün sonu değerlendirmesi
- tuvalet kayıtları
- beslenme kayıtları
- kadın ise: adet bilgisini
- ilaç kullanım geçmişini
- Su tüketimini
- aktivitelerini vs. 

Kullanıcnın yaşadığı sindirim sorunlarının tamamını anlamak için ne gerekiyorsa tüm data analiz için ai gönderilmelidir. 