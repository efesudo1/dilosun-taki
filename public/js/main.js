// Favori Ekle/Çıkar
function toggleFavori(urunId, btn) {
    fetch('/api/favori/toggle', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ urun_id: urunId })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.islem === 'eklendi') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                    // Eğer favorilerim sayfasındaysak, kartı kaldır
                    if (window.location.pathname === '/favorilerim') {
                        btn.closest('.product-card').remove();
                        // Eğer hiç ürün kalmadıysa sayfayı yenile (boş durumu göstermek için)
                        if (document.querySelectorAll('.product-card').length === 0) {
                            location.reload();
                        }
                    }
                }
            } else {
                alert('Bu işlem için giriş yapmalısınız.');
                window.location.href = '/login';
            }
        })
        .catch(error => console.error('Hata:', error));
}

// Kodu Kopyala ve Sepete Ekle
function koduKopyalaVeEkle(kod, id, ad, fiyat, btn) {
    // 1. Kopyala
    navigator.clipboard.writeText(kod).then(() => {
        // 2. Sepete Ekle (Backend'e bildir)
        fetch('/api/sepet/ekle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                urun_id: id,
                urun_kodu: kod,
                urun_ad: ad,
                fiyat: fiyat
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Bildirim göster
                    const originalText = btn.innerText;
                    btn.innerText = '✅ Eklendi';
                    btn.style.background = 'rgba(40, 167, 69, 0.3)';
                    btn.style.color = '#28a745';
                    btn.style.borderColor = '#28a745';

                    // Mini Sepeti Güncelle
                    updateMiniCart(data.sepetSayisi, data.toplamFiyat);

                    setTimeout(() => {
                        btn.innerText = originalText;
                        btn.style.background = '';
                        btn.style.color = '';
                        btn.style.borderColor = '';
                    }, 2000);
                }
            });
    }).catch(err => {
        console.error('Kopyalama hatası:', err);
        alert('Kod kopyalanamadı.');
    });
}

function updateMiniCart(sayi, toplam) {
    let miniCart = document.getElementById('mini-cart-widget');

    if (!miniCart) {
        miniCart = document.createElement('div');
        miniCart.id = 'mini-cart-widget';
        miniCart.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(212, 175, 55, 0.9);
            color: #000;
            padding: 15px 25px;
            border-radius: 50px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 1000;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            transition: transform 0.3s ease;
        `;
        miniCart.onclick = () => window.location.href = '/sepetim';
        document.body.appendChild(miniCart);
    }

    miniCart.innerHTML = `
        <span style="font-size: 1.2rem;">🛍️</span>
        <span>${sayi} Ürün</span>
        <span style="border-left: 1px solid #000; padding-left: 10px;">${toplam.toLocaleString('tr-TR')} ₺</span>
    `;

    // Animasyon
    miniCart.style.transform = 'scale(1.1)';
    setTimeout(() => miniCart.style.transform = 'scale(1)', 200);
}
