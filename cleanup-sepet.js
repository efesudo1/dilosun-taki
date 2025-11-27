const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'taki.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanı bağlantı hatası:', err.message);
        process.exit(1);
    }
    console.log('SQLite veritabanına bağlandı.');
});

// Orphaned sepet kayıtlarını temizle (silinmiş ürünlere ait sepet kayıtları)
db.all(`SELECT s.id 
        FROM sepet s
        LEFT JOIN urunler u ON s.urun_id = u.id
        WHERE u.id IS NULL`, [], (err, orphanedItems) => {
    if (err) {
        console.error('Orphaned kayıt sorgusu hatası:', err.message);
        db.close();
        return;
    }

    if (orphanedItems.length === 0) {
        console.log('Temizlenecek orphaned sepet kaydı bulunamadı.');
        db.close();
        return;
    }

    const ids = orphanedItems.map(item => item.id);
    const placeholders = ids.map(() => '?').join(',');
    
    db.run(`DELETE FROM sepet WHERE id IN (${placeholders})`, ids, function(err) {
        if (err) {
            console.error('Orphaned kayıtları silme hatası:', err.message);
        } else {
            console.log(`${this.changes} adet orphaned sepet kaydı temizlendi.`);
        }
        db.close();
    });
});



