const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'taki.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Veritabanı güncelleniyor...');

    // Favoriler tablosunu oluştur
    db.run(`CREATE TABLE IF NOT EXISTS favoriler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kullanici_id INTEGER,
        urun_id INTEGER,
        olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(id),
        FOREIGN KEY (urun_id) REFERENCES urunler(id) ON DELETE CASCADE
    )`, (err) => {
        if (err) console.error('Favoriler tablosu hatası:', err.message);
        else console.log('✓ Favoriler tablosu kontrol edildi/oluşturuldu.');
    });

    // Sipariş Detayları tablosunu kontrol et (Eğer yoksa)
    db.run(`CREATE TABLE IF NOT EXISTS siparis_detaylari (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        siparis_id INTEGER,
        urun_id INTEGER,
        adet INTEGER,
        birim_fiyat REAL,
        FOREIGN KEY (siparis_id) REFERENCES siparisler(id) ON DELETE CASCADE,
        FOREIGN KEY (urun_id) REFERENCES urunler(id)
    )`, (err) => {
        if (err) console.error('Sipariş detayları hatası:', err.message);
        else console.log('✓ Sipariş detayları tablosu kontrol edildi.');
    });
});

db.close(() => {
    console.log('İşlem tamamlandı.');
});
