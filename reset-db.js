const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const bcrypt = require('bcrypt');

const DB_PATH = './taki.db';

// Eski veritabanını sil
if (fs.existsSync(DB_PATH)) {
    try {
        fs.unlinkSync(DB_PATH);
        console.log('✓ Eski veritabanı silindi');
    } catch (err) {
        console.error('Eski veritabanı silinemedi (kullanımda olabilir):', err.message);
        process.exit(1);
    }
}

const db = new sqlite3.Database(DB_PATH);

console.log('Veritabanı oluşturuluyor...');

db.serialize(() => {
    // Foreign keys etkinleştir
    db.run('PRAGMA foreign_keys = ON');

    // 1. Kullanıcılar Tablosu
    db.run(`CREATE TABLE IF NOT EXISTS kullanicilar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ad TEXT,
        soyad TEXT,
        email TEXT UNIQUE NOT NULL,
        sifre TEXT NOT NULL,
        rol TEXT DEFAULT 'musteri',
        telefon TEXT,
        adres TEXT,
        olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('✓ Kullanıcılar tablosu oluşturuldu');

    // 2. Ürünler Tablosu
    db.run(`CREATE TABLE IF NOT EXISTS urunler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        urun_kodu TEXT,
        ad TEXT NOT NULL,
        tur TEXT,
        materyal TEXT,
        fiyat REAL,
        resim TEXT,
        aciklama TEXT,
        stok INTEGER DEFAULT 0,
        olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    console.log('✓ Ürünler tablosu oluşturuldu');

    // 3. Siparişler Tablosu
    db.run(`CREATE TABLE IF NOT EXISTS siparisler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kullanici_id INTEGER,
        durum TEXT DEFAULT 'beklemede',
        toplam_tutar REAL DEFAULT 0,
        notlar TEXT,
        olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id)
    )`);
    console.log('✓ Siparişler tablosu oluşturuldu');

    // 4. Sipariş Detayları Tablosu
    db.run(`CREATE TABLE IF NOT EXISTS siparis_detaylari (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        siparis_id INTEGER,
        urun_id INTEGER,
        adet INTEGER,
        birim_fiyat REAL,
        FOREIGN KEY (siparis_id) REFERENCES siparisler(id) ON DELETE CASCADE,
        FOREIGN KEY (urun_id) REFERENCES urunler(id)
    )`);
    console.log('✓ Sipariş detayları tablosu oluşturuldu');

    // Admin Kullanıcısı Ekle
    const adminEmail = 'admin@taki.com';
    const adminPass = 'admin123';

    bcrypt.hash(adminPass, 10, (err, hash) => {
        if (err) {
            console.error('Şifre hashleme hatası:', err);
            return;
        }

        const stmt = db.prepare('INSERT INTO kullanicilar (ad, soyad, email, sifre, rol) VALUES (?, ?, ?, ?, ?)');
        stmt.run('Admin', 'User', adminEmail, hash, 'admin', (err) => {
            if (err) {
                console.error('Admin ekleme hatası:', err.message);
            } else {
                console.log(`✓ Admin kullanıcısı eklendi: ${adminEmail} / ${adminPass}`);
            }
        });
        stmt.finalize();

        // Örnek Ürünler Ekle
        const urunStmt = db.prepare(`INSERT INTO urunler (urun_kodu, ad, tur, materyal, fiyat, resim, aciklama, stok) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

        urunStmt.run('TK-KOL-001', 'Altın Kalp Kolye', 'kolye', 'altin', 1500.00, 'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?q=80&w=1000&auto=format&fit=crop', 'Zarif altın kalp kolye.', 10);
        urunStmt.run('TK-YUZ-001', 'Gümüş Tektaş Yüzük', 'yüzük', 'gumus', 750.00, 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop', 'Parlak gümüş tektaş yüzük.', 15);
        urunStmt.run('TK-KUP-001', 'Pırlanta Küpe', 'küpe', 'pirlanta', 3500.00, 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop', 'Zarif pırlanta küpe.', 5);

        urunStmt.finalize(() => {
            console.log('✓ Örnek ürünler eklendi');
            console.log('\n🎉 Veritabanı başarıyla sıfırlandı ve hazır!');
            db.close();
        });
    });
});
