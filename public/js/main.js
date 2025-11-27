// Filtreleme işlevselliği
document.addEventListener('DOMContentLoaded', () => {
    const turFilter = document.getElementById('tur-filter');
    const materyalFilter = document.getElementById('materyal-filter');

    // Filtre değiştiğinde sayfayı yenile
    function applyFilters() {
        const tur = turFilter.value;
        const materyal = materyalFilter.value;

        // URL parametrelerini güncelle
        const params = new URLSearchParams();
        if (tur !== 'tumu') params.append('tur', tur);
        if (materyal !== 'tumu') params.append('materyal', materyal);

        // Sayfayı yenile
        const queryString = params.toString();
        window.location.href = queryString ? `/?${queryString}` : '/';
    }

    if (turFilter) turFilter.addEventListener('change', applyFilters);
    if (materyalFilter) materyalFilter.addEventListener('change', applyFilters);
});

// Bildirim gösterici
function showNotification(message, type = 'success') {
    // Mevcut bildirimi kaldır
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Stil ekle
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? 'rgba(40, 167, 69, 0.9)' : 'rgba(220, 53, 69, 0.9)'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // 3 saniye sonra kaldır
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// CSS animasyonları ekle
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);


// Ürün kodu kopyalama fonksiyonu
function copyProductCode(code) {
    // Clipboard API kullanarak kopyala
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code)
            .then(() => {
                showNotification(`Ürün kodu kopyalandı: ${code}`, 'success');
            })
            .catch(err => {
                console.error('Kopyalama hatası:', err);
                // Fallback yöntemi
                fallbackCopy(code);
            });
    } else {
        // Eski tarayıcılar için fallback
        fallbackCopy(code);
    }
}

// Fallback kopyalama yöntemi
function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
        document.execCommand('copy');
        showNotification(`Ürün kodu kopyalandı: ${text}`, 'success');
    } catch (err) {
        console.error('Fallback kopyalama hatası:', err);
        showNotification('Kopyalama başarısız oldu', 'error');
    }

    document.body.removeChild(textArea);
}


