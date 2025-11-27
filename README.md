# 💎 Diloşun Takı Dünyası

Modern ve şık bir takı e-ticaret web sitesi. Node.js, Express ve SQLite ile geliştirilmiştir.

## ✨ Özellikler

- 🔐 Kullanıcı girişi ve kayıt sistemi
- 👑 Admin paneli (ürün, kullanıcı, sipariş yönetimi)
- 💍 Ürün kategorileri (Küpe, Bilezik, Kolye, Yüzük)
- 🔍 Ürün arama ve filtreleme
- 📦 Benzersiz ürün kodları sistemi
- 📋 Kopyalanabilir ürün kodları
- 🎨 Modern ve responsive tasarım
- 🌙 Koyu tema (dark mode)

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Veritabanını başlat
npm run init-db

# Sunucuyu başlat
npm start
```

Tarayıcıda `http://localhost:3000` adresini açın.

## 👤 Varsayılan Hesaplar

**Admin:**
- Email: `admin@taki.com`
- Şifre: `admin123`

**Müşteri:**
- Email: `musteri@taki.com`
- Şifre: `musteri123`

## 📁 Proje Yapısı

```
taki/
├── server.js              # Ana sunucu dosyası
├── init-db.js            # Veritabanı başlatma
├── migrate-product-codes.js  # Migration script
├── package.json          # Proje bağımlılıkları
├── public/              # Static dosyalar
│   ├── css/            # Stil dosyaları
│   ├── js/             # JavaScript dosyaları
│   └── images/         # Ürün görselleri
├── views/              # EJS template'leri
│   ├── index.ejs       # Ana sayfa
│   ├── login.ejs       # Giriş sayfası
│   ├── register.ejs    # Kayıt sayfası
│   └── admin-*.ejs     # Admin panel sayfaları
└── taki.db            # SQLite veritabanı
```

## 🌐 Deployment

Detaylı deployment rehberi için `DEPLOYMENT.md` dosyasına bakın.

**Hızlı Deploy (Render.com):**
1. GitHub'a yükle
2. Render.com'da hesap oluştur
3. Repository'yi bağla
4. Deploy et!

## 🔧 Teknolojiler

- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Template Engine:** EJS
- **Authentication:** bcrypt, express-session
- **Styling:** Vanilla CSS (Glassmorphism)

## 📝 License

MIT

## 👨‍💻 Geliştirici

Diloşun Takı Dünyası - 2024
