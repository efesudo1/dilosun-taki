# Web Sitesini Yayınlama Rehberi

## Seçenek 1: Render.com (ÖNERİLEN - Ücretsiz)

### Adım 1: GitHub'a Yükleme

1. GitHub hesabı oluşturun (yoksa): https://github.com
2. Yeni repository oluşturun (Public veya Private)
3. Terminal'de şu komutları çalıştırın:

```bash
cd c:\Users\ahmet\Desktop\takik

# Git başlat
git init

# .gitignore dosyası oluştur (node_modules'u ignore et)
echo node_modules/ > .gitignore
echo .env >> .gitignore

# Dosyaları ekle
git add .
git commit -m "Initial commit"

# GitHub'a bağlan (YOUR-USERNAME ve YOUR-REPO değiştirin)
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

### Adım 2: Render.com'da Deploy

1. https://render.com adresine gidin
2. "Sign Up" ile hesap oluşturun (GitHub ile giriş yapabilirsiniz)
3. Dashboard'da "New +" → "Web Service" seçin
4. GitHub repository'nizi bağlayın ve seçin
5. Ayarları yapın:

**Build & Deploy Ayarları:**
- Name: `dilosun-taki` (istediğiniz isim)
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Instance Type: `Free`

6. "Advanced" → "Add Environment Variable" tıklayın:
   - `SESSION_SECRET`: `taki-websitesi-secret-key-2024-render` (güvenli bir key)
   - `NODE_ENV`: `production`

7. "Create Web Service" butonuna tıklayın

### Adım 3: Veritabanını Başlatma

Deploy tamamlandıktan sonra (5-10 dakika sürebilir):

1. Render dashboard'unda servisinize tıklayın
2. "Shell" sekmesine gidin
3. Şu komutu çalıştırın:
```bash
npm run init-db
```

✅ Site hazır! URL: `https://dilosun-taki.onrender.com`

---

## Seçenek 2: Railway.app (Ücretsiz, Kolay)

### Adım 1: GitHub'a Yükleyin (Yukarıdaki gibi)

### Adım 2: Railway'de Deploy

1. https://railway.app adresine gidin
2. "Start a New Project" → "Deploy from GitHub repo"
3. Repository'nizi seçin
4. Railway otomatik deploy edecek

**Environment Variables Ekleyin:**
- Settings → Variables
- `SESSION_SECRET`: güvenli bir key
- `NODE_ENV`: `production`

5. Deploy sonrası "Shell" sekmesinden:
```bash
npm run init-db
```

✅ Site hazır!

---

## Seçenek 3: Vercel (Ücretsiz, ama Serverless)

**NOT:** Vercel SQLite ile iyi çalışmaz. PostgreSQL kullanmanız gerekir. Bu seçeneği önerMİyorum.

---

## Seçenek 4: VPS (Ücretli ama Full Kontrol)

### DigitalOcean Droplet ($4/ay)

1. DigitalOcean hesabı oluşturun
2. Ubuntu 22.04 Droplet oluşturun
3. SSH ile bağlanın
4. Kurulum:

```bash
# Node.js kur
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kur (process manager)
sudo npm install -g pm2

# Projeyi clone et
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
cd YOUR-REPO

# Bağımlılıkları kur
npm install

# Veritabanını başlat
npm run init-db

# Uygulamayı başlat
pm2 start server.js --name taki-website
pm2 save
pm2 startup
```

5. Domain bağlama ve SSL için Nginx kullanın

---

## ⚡ Hızlı Başlangıç: Render.com

En kolay yol için şu adımları takip edin:

1. **GitHub Repository Oluştur**
   - https://github.com/new
   - Repository adı: `dilosun-taki`
   - Public seçin
   - Create

2. **Kodları Yükle**
```bash
cd c:\Users\ahmet\Desktop\taki
git init
echo node_modules/ > .gitignore
git add .
git commit -m "Diloşun Takı Website"
git remote add origin https://github.com/YOUR-USERNAME/dilosun-taki.git
git push -u origin main
```

3. **Render'da Deploy Et**
   - https://render.com → Sign Up (GitHub ile)
   - New Web Service
   - Repository'yi seç
   - Deploy!

4. **Veritabanını Başlat**
   - Shell'de: `npm run init-db`

**Site Hazır:** `https://dilosun-taki.onrender.com` 🎉

---

## 📝 Notlar

- **Render Free Tier:** 15 dakika işlem yoksa uyur, ilk istek yavaş olabilir
- **Railway:** Aylık 500 saat ücretsiz
- **Domain:** Özel domain eklemek isterseniz (örn: dilosun.com) DNS ayarları yapmanız gerekir

## 🔒 Güvenlik

Production'da mutlaka:
1. Güçlü `SESSION_SECRET` kullanın
2. `NODE_ENV=production` set edin
3. HTTPS kullanın (Render otomatik sağlar)
4. Admin şifresini değiştirin

## 🆘 Yardım

Problem yaşarsanız:
- Render: https://render.com/docs
- Railway: https://docs.railway.app
- Discord: Render/Railway community
