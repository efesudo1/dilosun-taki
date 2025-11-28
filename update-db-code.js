const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'taki.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // urun_kodu sütununu eklemeyi dene
    db.run("ALTER TABLE urunler ADD COLUMN urun_kodu TEXT UNIQUE", (err) => {
        if (err) {
            console.log("urun_kodu sütunu zaten var veya hata:", err.message);
        } else {
            console.log("urun_kodu sütunu eklendi.");
        }

        // Her durumda ürün kodlarını güncelle (boş olanlar için)
        db.all("SELECT id, tur, urun_kodu FROM urunler", (err, rows) => {
            if (err) {
                console.error("Ürünler okunamadı:", err);
                return;
            }

            const stmt = db.prepare("UPDATE urunler SET urun_kodu = ? WHERE id = ?");
            let count = 0;

            rows.forEach(row => {
                if (!row.urun_kodu) {
                    const turKisaltmalari = { 'küpe': 'KUP', 'bilezik': 'BIL', 'kolye': 'KOL', 'yüzük': 'YUZ', 'piercing': 'PIE' };
                    const turKisa = turKisaltmalari[(row.tur || '').toLowerCase()] || 'URN';
                    const kod = `TK-${turKisa}-${String(row.id).padStart(3, '0')}`;
                    stmt.run(kod, row.id);
                    count++;
                }
            });

            stmt.finalize(() => {
                console.log(`${count} ürünün kodu güncellendi.`);
                db.close();
            });
        });
    });
});
