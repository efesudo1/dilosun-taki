const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'taki.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanı bağlantı hatası:', err.message);
        return;
    }
    console.log('SQLite veritabanına bağlandı.');
});

// Veritabanı tablolarını oluştur
db.serialize(() => {
    // Kullanıcılar tablosu
    db.run(`CREATE TABLE IF NOT EXISTS kullanıcılar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        sifre TEXT NOT NULL,
        rol TEXT NOT NULL DEFAULT 'musteri',
        ad TEXT,
        soyad TEXT,
        olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Kullanıcılar tablosu oluşturma hatası:', err.message);
        } else {
            console.log('Kullanıcılar tablosu oluşturuldu.');
        }
    });

    // Ürünler tablosu
    db.run(`CREATE TABLE IF NOT EXISTS urunler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ad TEXT NOT NULL,
        tur TEXT NOT NULL,
        materyal TEXT NOT NULL,
        fiyat REAL NOT NULL,
        resim TEXT,
        aciklama TEXT,
        stok INTEGER DEFAULT 0,
        urun_kodu TEXT UNIQUE,
        olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Tablo oluşturma hatası:', err.message);
        } else {
            console.log('Ürünler tablosu oluşturuldu.');
        }
    });

    // Sepet tablosu
    db.run(`CREATE TABLE IF NOT EXISTS sepet (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kullanici_id INTEGER NOT NULL,
        urun_id INTEGER NOT NULL,
        adet INTEGER DEFAULT 1,
        olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kullanici_id) REFERENCES kullanıcılar(id) ON DELETE CASCADE,
        FOREIGN KEY (urun_id) REFERENCES urunler(id) ON DELETE CASCADE,
        UNIQUE(kullanici_id, urun_id)
    )`, (err) => {
        if (err) {
            console.error('Sepet tablosu oluşturma hatası:', err.message);
        } else {
            console.log('Sepet tablosu oluşturuldu.');
        }
    });

    // Siparişler tablosu
    db.run(`CREATE TABLE IF NOT EXISTS siparisler (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kullanici_id INTEGER NOT NULL,
        toplam_tutar REAL NOT NULL,
        durum TEXT DEFAULT 'beklemede',
        adres TEXT,
        telefon TEXT,
        notlar TEXT,
        olusturma_tarihi DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kullanici_id) REFERENCES kullanıcılar(id)
    )`, (err) => {
        if (err) {
            console.error('Siparişler tablosu oluşturma hatası:', err.message);
        } else {
            console.log('Siparişler tablosu oluşturuldu.');
        }
    });

    // Sipariş detayları tablosu
    db.run(`CREATE TABLE IF NOT EXISTS siparis_detaylari (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        siparis_id INTEGER NOT NULL,
        urun_id INTEGER NOT NULL,
        adet INTEGER NOT NULL,
        birim_fiyat REAL NOT NULL,
        toplam_fiyat REAL NOT NULL,
        FOREIGN KEY (siparis_id) REFERENCES siparisler(id) ON DELETE CASCADE,
        FOREIGN KEY (urun_id) REFERENCES urunler(id)
    )`, (err) => {
        if (err) {
            console.error('Sipariş detayları tablosu oluşturma hatası:', err.message);
        } else {
            console.log('Sipariş detayları tablosu oluşturuldu.');
        }
    });

    // Örnek veriler ekle
    const urunler = [
        { ad: 'Klasik Altın Küpe', tur: 'küpe', materyal: 'altın', fiyat: 2500, resim: '/images/kup1.jpg', aciklama: 'Zarif altın küpe' },
        { ad: 'Elmaslı Gümüş Küpe', tur: 'küpe', materyal: 'gümüş', fiyat: 850, resim: '/images/kup2.jpg', aciklama: 'Elmaslı gümüş küpe' },
        { ad: 'Bronz Vintage Küpe', tur: 'küpe', materyal: 'bronz', fiyat: 350, resim: '/images/kup3.jpg', aciklama: 'Vintage bronz küpe' },
        { ad: 'Altın Zincir Bilezik', tur: 'bilezik', materyal: 'altın', fiyat: 3200, resim: '/images/bil1.jpg', aciklama: 'Klasik altın bilezik' },
        { ad: 'Gümüş Örgü Bilezik', tur: 'bilezik', materyal: 'gümüş', fiyat: 650, resim: '/images/bil2.jpg', aciklama: 'Örgü desenli gümüş bilezik' },
        { ad: 'Bronz Bangle Bilezik', tur: 'bilezik', materyal: 'bronz', fiyat: 280, resim: '/images/bil3.jpg', aciklama: 'Geniş bronz bangle' },
        { ad: 'Altın İnci Kolye', tur: 'kolye', materyal: 'altın', fiyat: 4500, resim: '/images/kol1.jpg', aciklama: 'İnci detaylı altın kolye' },
        { ad: 'Gümüş Yıldız Kolye', tur: 'kolye', materyal: 'gümüş', fiyat: 750, resim: '/images/kol2.jpg', aciklama: 'Yıldız motifli gümüş kolye' },
        { ad: 'Bronz Pendant Kolye', tur: 'kolye', materyal: 'bronz', fiyat: 420, resim: '/images/kol3.jpg', aciklama: 'Pendant detaylı bronz kolye' },
        { ad: 'Altın Halka Küpe', tur: 'küpe', materyal: 'altın', fiyat: 1800, resim: '/images/kup4.jpg', aciklama: 'Modern halka küpe' },
        { ad: 'Gümüş Çiçek Kolye', tur: 'kolye', materyal: 'gümüş', fiyat: 920, resim: '/images/kol4.jpg', aciklama: 'Çiçek desenli gümüş kolye' },
        { ad: 'Bronz Yılan Bilezik', tur: 'bilezik', materyal: 'bronz', fiyat: 380, resim: '/images/bil4.jpg', aciklama: 'Yılan desenli bronz bilezik' }
    ];

    // Örnek kullanıcıları ekle
    db.get('SELECT COUNT(*) as count FROM kullanıcılar', (err, row) => {
        if (err) {
            console.error('Kullanıcı kontrolü hatası:', err.message);
            return;
        }

        if (row.count === 0) {
            console.log('Örnek kullanıcılar ekleniyor...');

            // Şifreleri hashle
            const adminSifre = bcrypt.hashSync('dilos4543', 10);
            const musteriSifre = bcrypt.hashSync('musteri123', 10);

            const kullanicilar = [
                { email: 'admin@taki.com', sifre: adminSifre, rol: 'admin', ad: 'Admin', soyad: 'Kullanıcı' },
                { email: 'musteri@taki.com', sifre: musteriSifre, rol: 'musteri', ad: 'Müşteri', soyad: 'Test' }
            ];

            const userStmt = db.prepare(`INSERT INTO kullanıcılar (email, sifre, rol, ad, soyad) 
                                         VALUES (?, ?, ?, ?, ?)`);

            kullanicilar.forEach(kullanici => {
                userStmt.run([kullanici.email, kullanici.sifre, kullanici.rol, kullanici.ad, kullanici.soyad]);
            });

            userStmt.finalize((err) => {
                if (err) {
                    console.error('Kullanıcı ekleme hatası:', err.message);
                } else {
                    console.log(`${kullanicilar.length} örnek kullanıcı eklendi.`);
                    console.log('Admin: admin@taki.com / dilos4543');
                    console.log('Müşteri: musteri@taki.com / musteri123');
                }

                // Ürünleri ekle
                addProducts();
            });
        } else {
            console.log('Kullanıcılar zaten mevcut.');
            addProducts();
        }
    });

    function addProducts() {
        // Mevcut ürünleri kontrol et
        db.get('SELECT COUNT(*) as count FROM urunler', (err, row) => {
            if (err) {
                console.error('Veri kontrolü hatası:', err.message);
                db.close();
                return;
            }

            if (row.count === 0) {
                console.log('Örnek ürünler ekleniyor...');

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

                const stmt = db.prepare(`INSERT INTO urunler (ad, tur, materyal, fiyat, resim, aciklama, stok, urun_kodu) 
                                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
                let productId = 1;
                urunler.forEach(urun => {
                    const urunKodu = generateProductCode(urun.tur, productId);
                    stmt.run([urun.ad, urun.tur, urun.materyal, urun.fiyat, urun.resim, urun.aciklama, Math.floor(Math.random() * 50) + 10, urunKodu]);
                    productId++;
                });

                stmt.finalize((err) => {
                    if (err) {
                        console.error('Veri ekleme hatası:', err.message);
                    } else {
                        console.log(`${urunler.length} örnek ürün eklendi.`);
                    }
                    db.close();
                });
            } else {
                console.log('Ürünler zaten mevcut.');
                db.close();
            }
        });
    }
});

