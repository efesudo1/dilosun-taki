const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const os = require('os');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Tüm network interface'lerinden erişim için

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Session yönetimi
app.use(session({
    secret: process.env.SESSION_SECRET || 'taki-websitesi-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Production'da HTTPS için true
        httpOnly: true,
        sameSite: 'lax', // Cross-site istekler için
        maxAge: 24 * 60 * 60 * 1000 // 24 saat
    }
}));

// EJS template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Veritabanı bağlantısı
const dbPath = path.join(__dirname, 'taki.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanı bağlantı hatası:', err.message);
    } else {
        console.log('Veritabanına başarıyla bağlandı.');
        // Foreign key kısıtlarını etkinleştir
        db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) {
                console.error('Foreign key kısıtları etkinleştirilemedi:', err.message);
            }
        });
    }
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


// Auth middleware - Giriş kontrolü
const requireAuth = (req, res, next) => {
    if (req.session && req.session.kullanici) {
        next();
    } else {
        console.log('requireAuth: Kullanıcı giriş yapmamış, /login\'e yönlendiriliyor');
        res.redirect('/login');
    }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
    if (req.session.kullanici && req.session.kullanici.rol === 'admin') {
        next();
    } else {
        res.status(403).send('Bu sayfaya erişim yetkiniz yok.');
    }
};

// Giriş sayfası
app.get('/login', (req, res) => {
    if (req.session.kullanici) {
        return res.redirect('/');
    }
    res.render('login', { hata: null });
});

// Kayıt sayfası
app.get('/register', (req, res) => {
    if (req.session.kullanici) {
        return res.redirect('/');
    }
    res.render('register', { hata: null });
});

// Giriş işlemi
app.post('/login', (req, res) => {
    const { email, sifre } = req.body;

    if (!email || !sifre) {
        return res.render('login', { hata: 'E-posta ve şifre gereklidir.' });
    }

    db.get('SELECT * FROM kullanıcılar WHERE email = ?', [email], (err, kullanici) => {
        if (err) {
            console.error('Veritabanı hatası:', err.message);
            return res.render('login', { hata: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
        }

        if (!kullanici) {
            return res.render('login', { hata: 'E-posta veya şifre hatalı.' });
        }

        // Şifre kontrolü
        bcrypt.compare(sifre, kullanici.sifre, (err, match) => {
            if (err) {
                console.error('Şifre karşılaştırma hatası:', err.message);
                return res.render('login', { hata: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
            }

            if (match) {
                // Session'a kullanıcı bilgilerini kaydet
                req.session.kullanici = {
                    id: kullanici.id,
                    email: kullanici.email,
                    rol: kullanici.rol,
                    ad: kullanici.ad,
                    soyad: kullanici.soyad
                };
                res.redirect('/');
            } else {
                res.render('login', { hata: 'E-posta veya şifre hatalı.' });
            }
        });
    });
});

// Kayıt işlemi
app.post('/register', (req, res) => {
    const { email, sifre, sifreTekrar, ad, soyad, rol } = req.body;

    // Validasyon
    if (!email || !sifre || !sifreTekrar) {
        return res.render('register', { hata: 'E-posta ve şifre gereklidir.' });
    }

    if (sifre !== sifreTekrar) {
        return res.render('register', { hata: 'Şifreler eşleşmiyor.' });
    }

    if (sifre.length < 6) {
        return res.render('register', { hata: 'Şifre en az 6 karakter olmalıdır.' });
    }

    // E-posta format kontrolü (basit)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.render('register', { hata: 'Geçerli bir e-posta adresi giriniz.' });
    }

    // Kullanıcı rolü - sadece müşteri olabilir (admin manuel eklenir)
    const kullaniciRol = rol === 'admin' ? 'musteri' : (rol || 'musteri');

    // E-posta kontrolü
    db.get('SELECT * FROM kullanıcılar WHERE email = ?', [email], (err, mevcutKullanici) => {
        if (err) {
            console.error('Veritabanı hatası:', err.message);
            return res.render('register', { hata: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
        }

        if (mevcutKullanici) {
            return res.render('register', { hata: 'Bu e-posta adresi zaten kullanılıyor.' });
        }

        // Şifreyi hashle
        bcrypt.hash(sifre, 10, (err, hash) => {
            if (err) {
                console.error('Şifre hashleme hatası:', err.message);
                return res.render('register', { hata: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
            }

            // Kullanıcıyı veritabanına ekle
            db.run('INSERT INTO kullanıcılar (email, sifre, rol, ad, soyad) VALUES (?, ?, ?, ?, ?)',
                [email, hash, kullaniciRol, ad || null, soyad || null],
                function (err) {
                    if (err) {
                        console.error('Kullanıcı ekleme hatası:', err.message);
                        return res.render('register', { hata: 'Kayıt sırasında bir hata oluştu.' });
                    }

                    // Otomatik giriş yap
                    req.session.kullanici = {
                        id: this.lastID,
                        email: email,
                        rol: kullaniciRol,
                        ad: ad || null,
                        soyad: soyad || null
                    };

                    res.redirect('/');
                }
            );
        });
    });
});

// Çıkış işlemi
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Session silme hatası:', err.message);
        }
        res.redirect('/login');
    });
});

// Ana sayfa - Tüm ürünleri göster
app.get('/', (req, res) => {
    const { tur, materyal } = req.query;
    let query = 'SELECT * FROM urunler WHERE 1=1';
    const params = [];

    if (tur && tur !== 'tumu') {
        query += ' AND tur = ?';
        params.push(tur);
    }

    if (materyal && materyal !== 'tumu') {
        query += ' AND materyal = ?';
        params.push(materyal);
    }

    query += ' ORDER BY olusturma_tarihi DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Veritabanı sorgu hatası:', err.message);
            res.status(500).send('Veritabanı hatası');
            return;
        }

        // İstatistikler için sorgular
        db.all('SELECT DISTINCT tur FROM urunler', [], (err, turler) => {
            if (err) {
                console.error('Tür sorgusu hatası:', err.message);
            }

            db.all('SELECT DISTINCT materyal FROM urunler', [], (err, materyaller) => {
                if (err) {
                    console.error('Materyal sorgusu hatası:', err.message);
                }

                res.render('index', {
                    urunler: rows,
                    turler: turler || [],
                    materyaller: materyaller || [],
                    seciliTur: tur || 'tumu',
                    seciliMateryal: materyal || 'tumu',
                    kullanici: req.session.kullanici || null
                });
            });
        });
    });
});

// API: Ürünleri getir (AJAX için)
app.get('/api/urunler', (req, res) => {
    const { tur, materyal } = req.query;
    let query = 'SELECT * FROM urunler WHERE 1=1';
    const params = [];

    if (tur && tur !== 'tumu') {
        query += ' AND tur = ?';
        params.push(tur);
    }

    if (materyal && materyal !== 'tumu') {
        query += ' AND materyal = ?';
        params.push(materyal);
    }

    query += ' ORDER BY olusturma_tarihi DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});



// ========== KULLANICI SİPARİŞLERİ ==========

// Test route - Route'un çalışıp çalışmadığını kontrol etmek için
app.get('/test-siparislerim', (req, res) => {
    res.send('Route çalışıyor! Session: ' + JSON.stringify(req.session.kullanici || 'Yok'));
});

// Kullanıcı siparişleri sayfası
app.get('/siparislerim', requireAuth, (req, res) => {
    try {
        // Session kontrolü
        if (!req.session.kullanici || !req.session.kullanici.id) {
            console.error('Session hatası: Kullanıcı bilgisi bulunamadı');
            return res.redirect('/login');
        }

        const kullanici_id = req.session.kullanici.id;

        db.all(`SELECT s.*, 
                       (SELECT COUNT(*) FROM siparis_detaylari sd WHERE sd.siparis_id = s.id) as urun_sayisi
                FROM siparisler s
                WHERE s.kullanici_id = ?
                ORDER BY s.olusturma_tarihi DESC`,
            [kullanici_id], (err, siparisler) => {
                if (err) {
                    console.error('Sipariş listesi hatası:', err.message);
                    return res.status(500).render('error', {
                        message: 'Siparişler yüklenemedi.',
                        error: err.message
                    });
                }

                // Her sipariş için detayları al
                if (!siparisler || siparisler.length === 0) {
                    return res.render('siparislerim', {
                        kullanici: req.session.kullanici,
                        siparisler: []
                    });
                }

                const siparislerDetayli = siparisler.map((siparis) => {
                    return new Promise((resolve, reject) => {
                        db.all(`SELECT sd.*, u.ad as urun_ad, u.resim
                            FROM siparis_detaylari sd
                            JOIN urunler u ON sd.urun_id = u.id
                            WHERE sd.siparis_id = ?`, [siparis.id], (err, detaylar) => {
                            if (err) {
                                console.error(`Sipariş ${siparis.id} detay hatası:`, err.message);
                                siparis.detaylar = [];
                            } else {
                                siparis.detaylar = detaylar || [];
                            }
                            resolve(siparis);
                        });
                    });
                });

                Promise.all(siparislerDetayli)
                    .then(siparislerTamamli => {
                        res.render('siparislerim', {
                            kullanici: req.session.kullanici,
                            siparisler: siparislerTamamli
                        });
                    })
                    .catch(err => {
                        console.error('Promise.all hatası:', err.message);
                        res.status(500).send('Sipariş detayları yüklenirken hata oluştu.');
                    });
            });
    } catch (error) {
        console.error('Siparişlerim route hatası:', error.message);
        res.status(500).send('Bir hata oluştu: ' + error.message);
    }
});

// ========== ADMIN PANELİ ==========

// Admin paneli ana sayfa
app.get('/admin', requireAuth, requireAdmin, (req, res) => {
    // Kullanıcı sayısı
    db.get('SELECT COUNT(*) as count FROM kullanıcılar', [], (err, kullaniciSayisi) => {
        // Sipariş sayısı
        db.get('SELECT COUNT(*) as count FROM siparisler', [], (err, siparisSayisi) => {
            // Ürün sayısı
            db.get('SELECT COUNT(*) as count FROM urunler', [], (err, urunSayisi) => {
                // Toplam gelir
                db.get('SELECT SUM(toplam_tutar) as toplam FROM siparisler WHERE durum = "tamamlandi"', [], (err, gelir) => {
                    res.render('admin', {
                        kullanici: req.session.kullanici,
                        istatistikler: {
                            kullaniciSayisi: kullaniciSayisi?.count || 0,
                            siparisSayisi: siparisSayisi?.count || 0,
                            urunSayisi: urunSayisi?.count || 0,
                            toplamGelir: gelir?.toplam || 0
                        }
                    });
                });
            });
        });
    });
});

// Admin - Kullanıcılar listesi
app.get('/admin/kullanicilar', requireAuth, requireAdmin, (req, res) => {
    db.all('SELECT id, email, rol, ad, soyad, olusturma_tarihi FROM kullanıcılar ORDER BY olusturma_tarihi DESC',
        [], (err, kullanicilar) => {
            if (err) {
                console.error('Kullanıcı listesi hatası:', err.message);
                return res.status(500).send('Kullanıcılar yüklenemedi.');
            }
            res.render('admin-kullanicilar', {
                kullanici: req.session.kullanici,
                kullanicilar: kullanicilar || []
            });
        });
});

// Admin - Siparişler listesi
app.get('/admin/siparisler', requireAuth, requireAdmin, (req, res) => {
    db.all(`SELECT s.*, k.email, k.ad, k.soyad
            FROM siparisler s
            JOIN kullanıcılar k ON s.kullanici_id = k.id
            ORDER BY s.olusturma_tarihi DESC`,
        [], (err, siparisler) => {
            if (err) {
                console.error('Sipariş listesi hatası:', err.message);
                return res.status(500).send('Siparişler yüklenemedi.');
            }
            res.render('admin-siparisler', {
                kullanici: req.session.kullanici,
                siparisler: siparisler || []
            });
        });
});

// Admin - Sipariş detayları
app.get('/admin/siparis/:id', requireAuth, requireAdmin, (req, res) => {
    const siparis_id = req.params.id;

    db.get(`SELECT s.*, k.email, k.ad, k.soyad
            FROM siparisler s
            JOIN kullanıcılar k ON s.kullanici_id = k.id
            WHERE s.id = ?`, [siparis_id], (err, siparis) => {
        if (err || !siparis) {
            return res.status(404).send('Sipariş bulunamadı.');
        }

        db.all(`SELECT sd.*, u.ad as urun_ad, u.resim
                FROM siparis_detaylari sd
                JOIN urunler u ON sd.urun_id = u.id
                WHERE sd.siparis_id = ?`, [siparis_id], (err, detaylar) => {
            res.render('admin-siparis-detay', {
                kullanici: req.session.kullanici,
                siparis: siparis,
                detaylar: detaylar || []
            });
        });
    });
});

// Admin - Sipariş durumu güncelle
app.post('/admin/siparis/durum', requireAuth, requireAdmin, (req, res) => {
    const { siparis_id, durum } = req.body;

    db.run('UPDATE siparisler SET durum = ? WHERE id = ?', [durum, siparis_id], (err) => {
        if (err) {
            return res.json({ success: false, message: 'Durum güncellenemedi.' });
        }
        res.json({ success: true, message: 'Sipariş durumu güncellendi.' });
    });
});

// Admin - Ürün ekleme sayfası
app.get('/admin/urun/ekle', requireAuth, requireAdmin, (req, res) => {
    res.render('admin-urun-ekle', {
        kullanici: req.session.kullanici,
        hata: null,
        basarili: null
    });
});

// Admin - Ürün ekle
app.post('/admin/urun/ekle', requireAuth, requireAdmin, (req, res) => {
    const { ad, tur, materyal, fiyat, resim, aciklama, stok } = req.body;

    if (!ad || !tur || !materyal || !fiyat) {
        return res.render('admin-urun-ekle', {
            kullanici: req.session.kullanici,
            hata: 'Zorunlu alanları doldurunuz.',
            basarili: null
        });
    }

    db.run(`INSERT INTO urunler (ad, tur, materyal, fiyat, resim, aciklama, stok)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [ad, tur, materyal, parseFloat(fiyat), resim || null, aciklama || null, parseInt(stok) || 0],
        function (err) {
            if (err) {
                console.error('Ürün ekleme hatası:', err.message);
                return res.render('admin-urun-ekle', {
                    kullanici: req.session.kullanici,
                    hata: 'Ürün eklenirken hata oluştu.',
                    basarili: null
                });
            }

            // Ürün kodu oluştur ve güncelle
            const urunId = this.lastID;
            const urunKodu = generateProductCode(tur, urunId);

            db.run('UPDATE urunler SET urun_kodu = ? WHERE id = ?', [urunKodu, urunId], (updateErr) => {
                if (updateErr) {
                    console.error('Ürün kodu güncelleme hatası:', updateErr.message);
                }

                res.render('admin-urun-ekle', {
                    kullanici: req.session.kullanici,
                    hata: null,
                    basarili: `Ürün başarıyla eklendi! Ürün Kodu: ${urunKodu}`
                });
            });
        }
    );
});

// Admin - Ürün listesi
app.get('/admin/urunler', requireAuth, requireAdmin, (req, res) => {
    db.all('SELECT * FROM urunler ORDER BY olusturma_tarihi DESC', [], (err, urunler) => {
        if (err) {
            console.error('Ürün listesi hatası:', err.message);
            return res.status(500).send('Ürünler yüklenemedi.');
        }
        res.render('admin-urunler', {
            kullanici: req.session.kullanici,
            urunler: urunler || []
        });
    });
});

// Admin - Ürün arama (ürün koduna göre)
app.get('/api/admin/urun/ara', requireAuth, requireAdmin, (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.json([]);
    }

    db.all(`SELECT * FROM urunler 
            WHERE urun_kodu LIKE ? OR ad LIKE ?
            ORDER BY olusturma_tarihi DESC`,
        [`%${q}%`, `%${q}%`], (err, urunler) => {
            if (err) {
                console.error('Ürün arama hatası:', err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json(urunler || []);
        });
});

// Admin - Ürün sil
app.post('/admin/urun/sil', requireAuth, requireAdmin, (req, res) => {
    const { urun_id } = req.body;

    db.run('DELETE FROM urunler WHERE id = ?', [urun_id], (err) => {
        if (err) {
            return res.json({ success: false, message: 'Ürün silinemedi.' });
        }
        res.json({ success: true, message: 'Ürün silindi.' });
    });
});

// Admin - Ürün güncelleme sayfası
app.get('/admin/urun/guncelle/:id', requireAuth, requireAdmin, (req, res) => {
    const urun_id = req.params.id;

    db.get('SELECT * FROM urunler WHERE id = ?', [urun_id], (err, urun) => {
        if (err || !urun) {
            return res.status(404).send('Ürün bulunamadı.');
        }

        res.render('admin-urun-guncelle', {
            kullanici: req.session.kullanici,
            urun: urun,
            hata: null,
            basarili: null
        });
    });
});

// Admin - Ürün güncelle
app.post('/admin/urun/guncelle', requireAuth, requireAdmin, (req, res) => {
    const { urun_id, ad, tur, materyal, fiyat, resim, aciklama, stok } = req.body;

    if (!urun_id || !ad || !tur || !materyal || !fiyat) {
        return res.render('admin-urun-guncelle', {
            kullanici: req.session.kullanici,
            urun: { id: urun_id, ad, tur, materyal, fiyat, resim, aciklama, stok },
            hata: 'Zorunlu alanları doldurunuz.',
            basarili: null
        });
    }

    db.run(`UPDATE urunler 
            SET ad = ?, tur = ?, materyal = ?, fiyat = ?, resim = ?, aciklama = ?, stok = ?
            WHERE id = ?`,
        [ad, tur, materyal, parseFloat(fiyat), resim || null, aciklama || null, parseInt(stok) || 0, urun_id],
        function (err) {
            if (err) {
                console.error('Ürün güncelleme hatası:', err.message);
                return res.render('admin-urun-guncelle', {
                    kullanici: req.session.kullanici,
                    urun: { id: urun_id, ad, tur, materyal, fiyat, resim, aciklama, stok },
                    hata: 'Ürün güncellenirken hata oluştu.',
                    basarili: null
                });
            }

            // Güncellenmiş ürünü tekrar al
            db.get('SELECT * FROM urunler WHERE id = ?', [urun_id], (err, guncelUrun) => {
                if (err) {
                    return res.redirect('/admin/urunler');
                }

                res.render('admin-urun-guncelle', {
                    kullanici: req.session.kullanici,
                    urun: guncelUrun,
                    hata: null,
                    basarili: 'Ürün başarıyla güncellendi!'
                });
            });
        }
    );
});

// Local IP adresini bul
const getLocalIP = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
};

// Sunucuyu başlat
app.listen(PORT, HOST, () => {
    const localIP = getLocalIP();
    console.log('='.repeat(50));
    console.log('🚀 Sunucu başarıyla başlatıldı!');
    console.log('='.repeat(50));
    console.log(`📍 Local:     http://localhost:${PORT}`);
    if (HOST === '0.0.0.0' && localIP !== 'localhost') {
        console.log(`🌐 Network:   http://${localIP}:${PORT}`);
        console.log(`\n💡 Aynı ağdaki cihazlardan erişim için: http://${localIP}:${PORT}`);
    }
    console.log('='.repeat(50));
    console.log('Veritabanını başlatmak için: npm run init-db');
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Veritabanı bağlantısı kapatıldı.');
        process.exit(0);
    });
});

