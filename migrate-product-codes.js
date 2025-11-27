const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'taki.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanı bağlantı hatası:', err.message);
        process.exit(1);
    }
    console.log('✓ SQLite veritabanına bağlandı.\n');
});

// Ürün türü kısaltmaları
const turKisaltmalari = {
    'küpe': 'KUP',
    'bilezik': 'BIL',
    'kolye': 'KOL',
    'yüzük': 'YUZ',
    'piercing': 'PIE'
};

// Ürün kodu üretme fonksiyonu
function generateProductCode(tur, id) {
    const turKisa = turKisaltmalari[tur.toLowerCase()] || 'URN';
    const idPadded = String(id).padStart(3, '0');
    return `TK-${turKisa}-${idPadded}`;
}

console.log('Migration başlatılıyor...\n');

// Önce sütunu ekle
db.run(`ALTER TABLE urunler ADD COLUMN urun_kodu TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
        console.error('❌ Sütun ekleme hatası:', err.message);
        db.close();
        process.exit(1);
    }

    if (err && err.message.includes('duplicate column')) {
        console.log('✓ urun_kodu sütunu zaten mevcut.');
    } else {
        console.log('✓ urun_kodu sütunu eklendi.');
    }

    // Şimdi kodları oluştur
    console.log('\nÜrün kodları oluşturuluyor...\n');

    db.all('SELECT id, tur, urun_kodu FROM urunler', [], (err, urunler) => {
        if (err) {
            console.error('❌ Ürünleri okuma hatası:', err.message);
            db.close();
            process.exit(1);
        }

        if (urunler.length === 0) {
            console.log('⚠️  Hiç ürün bulunamadı!\n');
            db.close();
            return;
        }

        console.log(`${urunler.length} ürün bulundu.\n`);

        let updatedCount = 0;
        let skippedCount = 0;

        const updatePromises = urunler.map((urun) => {
            return new Promise((resolve, reject) => {
                // Eğer ürün kodu zaten varsa atla
                if (urun.urun_kodu) {
                    skippedCount++;
                    console.log(`  ⊘ Ürün #${urun.id} zaten koda sahip: ${urun.urun_kodu}`);
                    resolve();
                    return;
                }

                const kod = generateProductCode(urun.tur, urun.id);

                db.run('UPDATE urunler SET urun_kodu = ? WHERE id = ?', [kod, urun.id], (err) => {
                    if (err) {
                        console.error(`  ❌ Ürün #${urun.id} güncellenemedi:`, err.message);
                        reject(err);
                    } else {
                        updatedCount++;
                        console.log(`  ✓ Ürün #${urun.id} → ${kod}`);
                        resolve();
                    }
                });
            });
        });

        Promise.all(updatePromises)
            .then(() => {
                console.log('\n' + '='.repeat(50));
                console.log('✅ Migration tamamlandı!');
                console.log('='.repeat(50));
                console.log(`✓ Güncellenen ürün sayısı: ${updatedCount}`);
                console.log(`⊘ Atlanan ürün sayısı: ${skippedCount}`);
                console.log(`📊 Toplam ürün: ${urunler.length}`);
                console.log('='.repeat(50) + '\n');
                db.close();
            })
            .catch((err) => {
                console.error('\n❌ Migration hatası:', err.message);
                db.close();
                process.exit(1);
            });
    });
});
