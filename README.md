# guzelliksey

Güzelliksey güzellik merkezi tanıtım web sitesi — mobil-önce, statik, dönüşüm odaklı.

## Hızlı Başlangıç

Backend ve build adımı yoktur. `index.html` dosyasını tarayıcıda açmanız yeterlidir.

Yerel sunucu ile önizleme (önerilen):

```bash
python3 -m http.server 8080
# http://localhost:8080
```

## GitHub Pages ile Yayınlama

1. Repoyu GitHub'a yükleyin.
2. **Settings → Pages → Source:** `main` branch, `/ (root)`.
3. Site: `https://<kullanici>.github.io/guzelliksey/`

Alternatif: Netlify'e klasörü sürükleyip bırakın (build yok).

## Dosya Yapısı

```
guzelliksey/
├── index.html        # Ana sayfa (8 bölüm, LocalBusiness JSON-LD)
├── hizmetler.html    # Hizmet/fiyat listesi, filtre, SSS
├── css/
│   ├── tokens.css    # Tasarım token'ları (renk, tipografi, boşluk, a11y)
│   └── style.css     # Mobil-önce tam stil sistemi
├── js/
│   ├── site.js       # Veri katmanı (SERVICES), nav, akordeon, formlar
│   └── booking.js    # 3 adımlı randevu sihirbazı (.ics + WhatsApp onayı)
└── docs/
    └── PROJE_RAPORU.md  # Nihai proje raporu (kurulum, SEO, GitHub)
```

## Yayın Öncesi Yapılacaklar

- `[ADRES]`, `[TELEFON]` ve `wa.me/905000000000` yer tutucularını gerçek değerlerle değiştirin.
- `js/site.js` → `SERVICES` dizisindeki temsilî fiyatları güncelleyin.
- Yer tutucu renk bloklarını gerçek WebP fotoğraflarla değiştirin (lazy-load hazır).

## Teknolojiler

HTML5 · CSS3 (custom property token sistemi) · Vanilla JS (framework yok) · Cormorant Garamond + Inter · JSON-LD LocalBusiness

Ayrıntılar: `docs/PROJE_RAPORU.md`
