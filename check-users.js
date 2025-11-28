const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./taki.db');

console.log('\n=== KULLANICI LİSTESİ ===\n');

db.all('SELECT id, ad, soyad, email, sifre, rol FROM kullanicilar ORDER BY id', [], (err, rows) => {
    if (err) {
        console.error('Hata:', err);
        return;
    }

    if (rows.length === 0) {
        console.log('Hiç kullanıcı yok!');
    } else {
        rows.forEach(user => {
            console.log(`ID: ${user.id}`);
            console.log(`Ad Soyad: ${user.ad} ${user.soyad}`);
            console.log(`Email: ${user.email}`);
            console.log(`Şifre: ${user.sifre}`);
            console.log(`Rol: ${user.rol}`);
            console.log('---');
        });
        console.log(`\nToplam ${rows.length} kullanıcı bulundu.`);
    }

    db.close();
});
