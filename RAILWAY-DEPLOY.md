# Railway.app Deployment Rehberi

## Adım 1: GitHub'a Yükleme

```bash
cd c:\Users\ahmet\Desktop\taki

# Git başlat (eğer yoksa)
git init

# Tüm dosyaları ekle
git add .

# Commit yap
git commit -m "Diloşun Takı Website - Ready for Railway"

# GitHub repository oluştur:
# https://github.com/new adresine git
# Repository name: dilosun-taki
# Public seç
# Create repository tıkla

# GitHub'a yükle (YOUR-USERNAME değiştir)
git remote add origin https://github.com/YOUR-USERNAME/dilosun-taki.git
git branch -M main
git push -u origin main
```

## Adım 2: Railway.app Deployment

1. **https://railway.app** adresine git
2. **"Login"** → GitHub ile giriş yap
3. **"New Project"** tıkla
4. **"Deploy from GitHub repo"** seç
5. Repository'ni seç: **dilosun-taki**
6. Railway otomatik deploy başlatacak!

## Adım 3: Environment Variables (Opsiyonel)

Proje sayfasında:
1. **"Variables"** sekmesine tıkla
2. **"New Variable"** → Ekle:
   - `SESSION_SECRET` = `dilosun-railway-secret-2024-production`
   - `NODE_ENV` = `production`

## Adım 4: Database Başlatma

Deploy tamamlandıktan sonra (3-5 dakika):

1. Proje sayfasında **"Deployments"** sekmesi
2. En son deployment'a tıkla
3. **"View Logs"** tıkla
4. Eğer "Server started" görüyorsan hazır!

**VEYA** Terminal ile:

```bash
# Railway CLI kur
npm install -g @railway/cli

# Login
railway login

# Project link
railway link

# Database başlat
railway run npm run init-db

# Product codes migrate
railway run npm run migrate
```

## Adım 5: Domain Al

1. **"Settings"** sekmesi
2. **"Networking"** → **"Generate Domain"**
3. URL alacaksın: `https://dilosun-taki-production.up.railway.app`

🎉 **HAZIR!**

## Özel Domain Ekleme (Opsiyonel)

Eğer kendi domain'in varsa (örn: dilosun.com):

1. Railway'de **"Settings"** → **"Networking"**
2. **"Custom Domain"** → Domain'i ekle
3. DNS sağlayıcında (GoDaddy, Namecheap, vb.):
   - CNAME record ekle
   - Host: `www` (veya `@`)
   - Value: Railway verdiği CNAME

## Sorun Giderme

**Deploy başarısız olursa:**

1. **Logs kontrol et:** "View Logs"
2. **Node version kontrol et:** package.json'da engines var
3. **Start script doğru mu:** `"start": "node server.js"`

**Database boş kalıyorsa:**

Railway CLI ile:
```bash
railway run npm run init-db
railway run npm run migrate
```

## Avantajları

✅ SQLite kalıcı çalışıyor
✅ Ücretsiz 500 saat/ay
✅ Otomatik HTTPS
✅ Hızlı deploy (3-5 dk)
✅ Sleep yok, her zaman aktif
✅ Kolay CLI

## Limitler

- 500 execution hours/ay (ücretsiz)
- 512 MB RAM
- 1 GB Disk

**Daha fazlası için:** $5/ay Hobby plan
