# PostgreSQL'e Geçiş Rehberi

## Neden PostgreSQL?

- ✅ Render'da ücretsiz
- ✅ Kalıcı veri depolama
- ✅ Production-ready
- ✅ Daha güvenli ve hızlı

## Adım 1: package.json Güncelle

```bash
npm install pg
```

package.json'a ekle:
```json
"dependencies": {
  "pg": "^8.11.3"
}
```

## Adım 2: Render'da PostgreSQL Oluştur

1. Render Dashboard → "New +" → "PostgreSQL"
2. Name: `dilosun-taki-db`
3. Database: `taki_db`
4. User: `taki_user`
5. Region: Frankfurt (veya yakın)
6. "Create Database"

**Internal Database URL'i kopyalayın!**

## Adım 3: Web Service'e Environment Variable Ekle

Render Web Service'inizde:
- Settings → Environment
- Key: `DATABASE_URL`
- Value: (Kopyaladığınız Internal Database URL)

## Adım 4: server.js Değiştir

SQLite yerine PostgreSQL kullan:

```javascript
// Eski (SQLite)
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbPath);

// Yeni (PostgreSQL)
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

Sorguları da güncelle:
```javascript
// SQLite
db.run('INSERT INTO ...', [params], callback);

// PostgreSQL
pool.query('INSERT INTO ...', [params], callback);
```

**VEYA daha kolay:**

## Alternatif: Sequelize ORM Kullan

Hem SQLite hem PostgreSQL destekler, değişiklik minimal:

```bash
npm install sequelize pg pg-hstore
```

---

## VEYA: Render Disk (Ücretli)

Eğer SQLite'ta ısrarcıysanız:

1. Render Dashboard → Web Service → Settings
2. "Disks" sekmesi
3. Mount Path: `/var/data`
4. Size: 1 GB (aylık $0.25/GB)
5. server.js'de: `const dbPath = '/var/data/taki.db';`

**Ama bu ücretli ve pek önerilmez.**

---

## Hızlı Test İçin SQLite Kullanımı

Sadece test amaçlı, veriler kaybolsa da sorun değilse:

init-db.js'i her başlangıçta çalıştırın:

package.json:
```json
"scripts": {
  "start": "node init-db.js && node server.js"
}
```

Her açılışta örnek verilerle başlar ama **production için uygun değil!**

---

## Öneri

🎯 **En İyi Çözüm:** PostgreSQL'e geçin (45 dakika iş)
🎯 **Hızlı Test:** init-db.js'i start'a ekleyin (5 dakika)
🎯 **Para varsa:** Render Disk ($0.25/ay)

Hangisini seçerseniz yardımcı olabilirim!
