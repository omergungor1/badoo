

Şimdi kullanıcı etkileşim ve daha sık ziyaret etmesi için bir özellik geliştireceğiz. 

Bunun için db.sql dosyasındaki tabloları oku. Gerek gördüğün tabloları düzenle veya ekle gerekli sql leri db_migrations.sql içinde bana ver ki supabase de çalıştırayım.

Notifications tablosu ekleyelim. Kullanıcılara belli aralıklarla notification atmamız gerekiyor. Örn: bugün henüz 5 su bardağı geridesin ha gayret gibi. Motivasyon ve bilgi bildirimleri atacağız. Arkadaşllık isteğini notification atabiliriz. Mesaj, dürtme ve arkadaşın hareket halkasını tamamladı gibi sende bitir gibi...

Şimdi arkadaş ekleme özelliğini yapacağız. Arkadaş ekle ile kullanıcılar birbirini aratabilir ve arkadaşlık isteği yollayabilirler. 

Mevcut ui akışını incele ve en uygun yere arkadaş listemi koy. Arkadaş ekleme özelliği ekle. Gelen istekler kısmı ekle -> gelen istekler onaylanabileceği bir arayüz ekle. 

Arkadaşlar birbirlerine not gönderebilmelidir. Mesaj gibi ama geçici bir metin (süre seçilip süre içinde görülebilsin. Süreyi not girerken el ile seçsin 8saat, 16 saat gibi... Bu kısımı tam planlayamadım. Not işini etkileşim ve uygulamaya sık girme alışkanlığı geliştirmek için eğlenceli bir hale getir). Bildirim metni gibi, örn motivasyonal bir şeyler yazılabilir. Bunu da ilgili arkadaşın kartında görebileyim. Etkileişimi arttırmak için buna benzer bir özellik ekleyelim. Kullanıcıya etiket gibi belirli süre gözüken mesaj balonları çıkabilir. Modern anlık ve geçici bir mesajlaşma türü gibi... Anlık mesaj gönderince yanında cevapla butonu çıkabilir, tıklayınca açılan bir input alanı ile metin girip gönderilebilmelidir. 

Kullanıcılar birbirini dürtebilmelidir ve bu bildirim olarak ilgili kullanıcıya gitmelidir. Mesaj gönderince xxx kullanıcısından (profil resmi, ismi, bildirim türü gibi) yeni mesajınız var diye bildirim düşmelidir vs. 

Arkadaş olarak onaylandı ise arkadaşlarımın da DailyActivityRings lerini ana sayfamda görebileyim. Kullanıcıya tıklayıp profilini açabileyim. Mesaj gönderip onu dürtebileyim. Kullanıcı bana süreli not göndermişse görmeliyim. 

Bildirim için firebase cloud messaging kullanacağız. Gerekli kurulumlar yapıldı. Bildirim anlık kullanıcıya gitmelidir. Amacımız badoo uygulamasını daha bağımlılık yapıcı ve hergün girmek gereken bir yapıya sokma istemem. 

Şimdi gerekli tabloları oluşturalım ve istediğim geliştirmeleri yapalım...