const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'taki.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    console.log('Veritabanı güncelleniyor...');

    // Siparişler tablosuna telefon sütunu ekle
    db.run("ALTER TABLE siparisler ADD COLUMN telefon TEXT", (err) => {
        if (err) {
            // Sütun zaten varsa hata verir, bu normaldir
            if (err.message.includes('duplicate column name')) {
                console.log('✓ Telefon sütunu zaten mevcut.');
            } else {
                console.error('Sütun ekleme hatası:', err.message);
            }
        } else {
            console.log('✓ Telefon sütunu başarıyla eklendi.');
        }
    });
});

db.close(() => {
    console.log('İşlem tamamlandı.');
});
