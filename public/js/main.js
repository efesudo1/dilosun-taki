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
function koduKopyalaVeEkle(kod, id, ad) {
    // 1. Kopyala
    navigator.clipboard.writeText(kod).then(() => {
        // 2. Sepete Ekle (Backend'e bildir)
        fetch('/api/sepet/ekle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urun_id: id, urun_kodu: kod, urun_ad: ad })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Bildirim göster
                    const btn = event.target;
                    const originalText = btn.innerText;
                    btn.innerText = '✅ Eklendi';
                    btn.style.background = 'rgba(40, 167, 69, 0.3)';
                    btn.style.color = '#28a745';
                    btn.style.borderColor = '#28a745';

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
