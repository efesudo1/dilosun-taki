# Görsel Ekleme Rehberi

## Arka Plan Görseli Ekleme

### Mücevher Arka Plan Görseli

Websitenin arka planına mücevher teması eklemek için aşağıdaki adımları izleyin:

1. **Görsel Dosyasını Hazırlayın:**
   - Görsel adı: `jewelry-background.webp` (önerilen), `jewelry-background.jpg` veya `jewelry-background.png`
   - **EN KALİTELİ İÇİN ÖNERİLEN BOYUTLAR:**
     - **Minimum (Standart):** 1920x1080px (16:9 oran) - Çoğu ekran için yeter
     - **Önerilen (Yüksek Kalite):** 2560x1440px (16:9 oran) - Retina ve 4K ekranlar için ideal
     - **Maksimum (En Kaliteli):** 3840x2160px (16:9 oran - 4K) - En büyük ekranlar için
   - **En-Boy Oranı:** 16:9 (1.78:1) - Tüm modern ekranlara uyumlu
   - Format: WebP (önerilen - daha küçük dosya boyutu), JPG veya PNG
   - Önerilen içerik: Altın, gümüş, bronz mücevherler, elmaslar, lüks takılar

2. **Görseli Yerleştirin:**
   - Dosyayı `public/images/` klasörüne koyun
   - Dosya adı: `jewelry-background.webp` (önerilen), `jewelry-background.jpg` veya `jewelry-background.png`
   - Sistem önce WebP formatını kontrol eder, yoksa JPG, sonra PNG formatını dener

3. **Görsel Özellikleri:**
   - **Futuristik görünüm için:** Parlak, yüksek kontrastlı görseller
   - **Klas görünüm için:** Lüks, sofistike mücevher fotoğrafları
   - **Renk paleti:** Altın (#D4AF37), Gümüş (#C0C0C0), Bronz tonları
   - **Stil:** Karanlık arka plan üzerinde parlayan mücevherler

4. **Görsel Bulamazsanız:**
   - CSS otomatik olarak mücevher deseni oluşturur
   - Görsel yoksa, gradient ve pattern efektleri kullanılır
   - Görsel eklemek zorunlu değildir, ancak daha etkileyici bir görünüm sağlar

### Ücretsiz Görsel Kaynakları

1. **Unsplash** (https://unsplash.com)
   - Arama: "jewelry", "gold jewelry", "luxury jewelry", "diamond"
   - Telif hakkı: Ücretsiz, ticari kullanım için uygun

2. **Pexels** (https://www.pexels.com)
   - Arama: "jewelry background", "gold jewelry", "luxury"
   - Telif hakkı: Ücretsiz

3. **Pixabay** (https://pixabay.com)
   - Arama: "jewelry", "gold", "diamond", "luxury jewelry"
   - Telif hakkı: Ücretsiz

### Görsel Optimizasyonu

Görseli optimize etmek için:

1. **Boyut:** 1920x1080px yeterlidir (daha büyük de olabilir)
2. **Kalite:** JPG için %80-85 kalite yeterli
3. **Araçlar:**
   - TinyPNG (https://tinypng.com) - PNG/JPG sıkıştırma
   - Squoosh (https://squoosh.app) - Görsel optimizasyonu

### Örnek Görsel Özellikleri

- **Genişlik:** 1920px veya daha fazla
- **Yükseklik:** 1080px veya daha fazla
- **Format:** WebP (önerilen - en küçük dosya boyutu), JPG veya PNG
- **Dosya boyutu:** 
  - WebP: 200KB - 800KB (optimize edilmiş)
  - JPG: 500KB - 2MB (optimize edilmiş)
  - PNG: 1MB - 3MB (optimize edilmiş)
- **Renk modu:** RGB
- **Çözünürlük:** 72-150 DPI (web için yeterli)

## Ürün Görselleri Ekleme

### Ürün Görselleri İçin

1. **Klasör:** `public/images/` klasörüne ekleyin
2. **Dosya adı:** İstediğiniz ismi kullanabilirsiniz (örn: `kolye-altin-1.jpg`)
3. **Boyut:** 800x800px veya 1000x1000px (kare format önerilir)
4. **Format:** JPG veya PNG
5. **Admin panelinden:** Ürün eklerken resim yolunu belirtin (örn: `/images/kolye-altin-1.jpg`)

### Ürün Görseli Özellikleri

- **Format:** JPG (önerilen) veya PNG
- **Boyut:** 800x800px - 1200x1200px (kare)
- **Arka plan:** Beyaz veya şeffaf (PNG için)
- **Kalite:** Yüksek kalite, net görüntü
- **Dosya boyutu:** 100KB - 500KB arası (optimize edilmiş)

## Notlar

- Görseller `public/images/` klasörüne eklendiğinde otomatik olarak erişilebilir olur
- Görsel yolu `/images/dosya-adi.jpg` formatında kullanılmalıdır
- Görsel yoksa placeholder (💎 emoji) gösterilir
- Arka plan görseli yoksa CSS otomatik olarak mücevher deseni oluşturur
