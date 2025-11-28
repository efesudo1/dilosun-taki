const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('./taki.db');

const adminEmail = 'admin@taki.com';
const newPassword = 'admin123';

console.log(`Admin (${adminEmail}) şifresi güncelleniyor...`);

bcrypt.hash(newPassword, 10, (err, hash) => {
    if (err) {
        console.error('Hash hatası:', err);
        return;
    }

    // Önce kullanıcı var mı kontrol et
    db.get('SELECT * FROM kullanicilar WHERE email = ?', [adminEmail], (err, row) => {
        if (err) {
            console.error('Veritabanı okuma hatası:', err);
            return;
        }

        if (!row) {
            console.log('Admin kullanıcısı bulunamadı, oluşturuluyor...');
            db.run('INSERT INTO kullanicilar (ad, soyad, email, sifre, rol) VALUES (?, ?, ?, ?, ?)',
                ['Admin', 'User', adminEmail, hash, 'admin'],
                (err) => {
                    if (err) {
                        console.error('Kullanıcı oluşturma hatası:', err);
                    } else {
                        console.log('✓ Admin kullanıcısı oluşturuldu ve şifresi ayarlandı.');
                    }
                    db.close();
                }
            );
        } else {
            // Kullanıcı varsa şifresini güncelle
            db.run('UPDATE kullanicilar SET sifre = ? WHERE email = ?', [hash, adminEmail], (err) => {
                if (err) {
                    console.error('Güncelleme hatası:', err);
                } else {
                    console.log('✓ Admin şifresi başarıyla güncellendi (Hashed).');
                }
                db.close();
            });
        }
    });
});
