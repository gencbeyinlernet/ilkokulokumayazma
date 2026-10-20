# Minik Kelimeler

İlkokul öğrencileri için Türkçe okuma, dinleme, yazma ve rakam oyunları. Kurulum paketi veya veritabanı gerektirmeyen HTML, CSS ve JavaScript uygulaması. Telefon, tablet ve bilgisayar ekranlarına uyumludur.

## Başlatma

Node.js 20 veya üzeri kurulu bir bilgisayarda bu klasörde terminal açın:

```sh
npm start
```

Tarayıcıda `http://localhost:4173` adresini açın. `npm install` gerekmez; harici paket kullanılmaz. ES modülleri nedeniyle `index.html` dosyasını çift tıklamak yerine HTTP sunucusu kullanın.

## Oyunlar

| Bölüm | Etkinlik |
| --- | --- |
| Oku & Birleştir | Harf eşleştir; harflerden hece ve kelime, kelimelerden cümle oluştur. |
| Dinle & Bul | Türkçe seslendirmeyi dinle ve dört seçenek arasından yanıtla. |
| Yaz & Öğren | Dokunmatik ekran/fare ile çiz, sonra klavye yanıtını kontrol et. |
| Rakamları Keşfet | 0–9 arasındaki yıldız sayısını doğru rakamla eşleştir. |

Ana sayfanın altından **Harfler, Heceler, Kelimeler, Cümleler** adımı seçilir; ardından bir oyun açılır. Oyun içinde de adım değiştirilebilir. Rakamlar ayrı, sabit bir bölümdür. Her turda 5 farklı soru vardır. Yanlış cevapta tekrar deneme ve ipucu bulunur. Her tamamlanan soruda bir yıldız kazanılır; tekrar oynanan sorular da yıldız verir. Bu nedenle yıldızlar ustalık veya sınav puanı değildir. İlk denemede ipucusuz çözülen soru sayısı tur sonunda ayrıca gösterilir.

## Kendi sunucunuza yükleme

Statik barındırma yeterlidir. Şu dosyaları aynı klasör yapısını koruyarak `public_html/minik-kelimeler/` gibi bir dizine yükleyin:

```text
index.html
style.css
app.js
data.js
assets/favicon.svg
```

Sonra `https://alan-adiniz.com/minik-kelimeler/` adresinden açın. Alt dizinde çalışır; derleme veya yönlendirme kuralı gerektirmez. Sunucunuz `.js` dosyalarını JavaScript MIME türüyle sunmalıdır. Üretimde HTTPS kullanın.

Node sunucusu kullanılacaksa `npm start` çalıştırın. Varsayılan olarak sadece `127.0.0.1:4173` üzerinde dinler. Dış erişim için `HOST=0.0.0.0` ve gerektiğinde `PORT` ortam değişkenlerini ayarlayın; HTTPS için ters vekil kullanın. Örneğin PowerShell:

```powershell
$env:HOST = '0.0.0.0'
$env:PORT = '4173'
npm start
```

## GitHub ve GitHub Pages

1. GitHub'da boş bir depo oluşturun.
2. **Bu klasörün içeriğini** deponun köküne yükleyin (üst klasördeki diğer okul dosyalarını yüklemeyin).
3. Depoda **Settings → Pages** bölümünde yayın kaynağını **Deploy from a branch**, dalı `main`, klasörü `/ (root)` seçin.
4. GitHub'ın verdiği Pages adresini açın. `.nojekyll` dosyası pakette bulunur.

Depoyu terminalden yüklemek isterseniz bu proje klasöründe çalışın; uzak depo adresini kendinizle değiştirin:

```sh
git init
git add .
git commit -m "Minik Kelimeler ilk sürüm"
git branch -M main
git remote add origin https://github.com/KULLANICI/minik-kelimeler.git
git push -u origin main
```

Bu paket GitHub'a otomatik gönderilmemiştir ve bir uzak sunucuya kurulmamıştır.

## Eğitim ve teknik sınırlar

- İçerik örnek alıştırmalardan oluşur; resmî müfredat uyumu veya pedagojik onay iddiası yoktur. Harf sırası ve içerik öğretmenle birlikte `data.js` dosyasından uyarlanabilir. Bütün bölümler açıktır.
- Dinleme Web Speech API kullanır. Cihazda Türkçe ses bulunması ve tarayıcının seslendirmeyi desteklemesi gerekir; başka cihazlarda farklı telaffuz olabilir. Bazı cihazların ses servisi ağ bağlantısına ihtiyaç duyabilir. Türkçe ses yoksa işletim sistemi ayarlarından ekleyin. Oyun cihazdaki eksik ses paketini yükleyemez.
- Harf seslendirmesinde metin okuma motoru harf **adını** okuyabilir. Ses temelli ilk okuma öğretiminde öğretmenin modellemesi gerekir. Profesyonel ses kayıtları bu sürüme dahil değildir.
- Üstteki ses anahtarı otomatik başarı sesini kapatır; öğrencinin bilerek bastığı dinleme düğmesi çalışmaya devam eder.
- Çizimler otomatik tanınmaz, puanlanmaz ve saklanmaz. Yazma kontrolü klavye girişine dayanır; Türkçe büyük/küçük harf, boşluklar ve `. ! ?` işaretleri normalize edilir. Noktalama ve büyük harf doğruluğu ayrıca puanlanmaz.
- İlerleme `localStorage` içinde cihaz ve site adresine özeldir. Hesap, sunucu veritabanı, sınıf yönetimi veya cihazlar arası eşitleme yoktur. Gizli mod/veri temizliği ilerlemeyi silebilir. Depolama engellenirse oyun çalışır; kalıcı kayıt sağlanamaz.
- Kullanıcı adı, mikrofon erişimi, analitik, reklam ve harici yazı tipi kullanılmaz. Seslendirme cihaz/tarayıcı sağlayıcısının hizmetinden yararlanabilir.
- Oyun klavye ile kullanılabilir; çizim yerine yazı alanı vardır. Hareket azaltma tercihi desteklenir. Resmî erişilebilirlik denetimi yapılmamıştır.

## Geliştirme ve kontrol

```sh
npm run check
npm test
```

Testler Türkçe yanıt karşılaştırmasını, tekrar eden harfleri, seçeneklerin benzersizliğini ve bütün oyun/adım kombinasyonlarının çözülebilirliğini denetler. Ses ve dokunmatik çizimi hedef cihazda ayrıca deneyin.

Dosyalar: `data.js` eğitim içeriği ve soru üretimi; `app.js` oyun akışı, çizim, ses ve kayıt; `style.css` uyarlanabilir arayüz; `server.mjs` bağımlılıksız yerel/statik sunucu.

Lisans: MIT. Yayınlarken lisansın telif satırını projenizin hak sahibine göre düzenleyebilirsiniz.
