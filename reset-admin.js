const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('taki.db');

console.log('Admin şifresini sıfırlıyorum...');

const yeniSifre = bcrypt.hashSync('dilos4543', 10);

db.run('UPDATE kullanıcılar SET sifre = ? WHERE email = ?', [yeniSifre, 'admin@taki.com'], function (err) {
    if (err) {
        console.error('Hata:', err);
    } else if (this.changes === 0) {
        console.log('Admin kullanıcısı bulunamadı, yeni oluşturuluyor...');
        db.run('INSERT INTO kullanıcılar (email, sifre, rol, ad, soyad) VALUES (?, ?, ?, ?, ?)',
            ['admin@taki.com', yeniSifre, 'admin', 'Admin', 'Kullanıcı'],
            (err) => {
                if (err) {
                    console.error('Ekleme hatası:', err);
                } else {
                    console.log('✅ Admin oluşturuldu: admin@taki.com / dilos4543');
                }
                db.close();
            }
        );
    } else {
        console.log('✅ Admin şifresi güncellendi: admin@taki.com / dilos4543');
        db.close();
    }
});
