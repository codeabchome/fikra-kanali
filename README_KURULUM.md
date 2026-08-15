# FIKRA OTOMASYONU — KURULUM VE YÜKLEME REHBERİ

## 1. REPO YAPISI (GitHub'da böyle kur)

```
fikra-kanali/                      ← public veya private repo
├── content/
│   ├── catalog.json               ← 175 fıkralık ana katalog (bu pakette)
│   ├── scripts/                   ← SENARYO DOSYALARI BURAYA (bu paketteki 16 .txt)
│   └── published/                 ← yayınlananların kaydı (workflow otomatik yazar)
├── assets/
│   ├── characters/                ← hoca.py, wife.py, human.py (parametrik şablon)
│   ├── props/                     ← donkey.py, quilt.py, ...
│   └── environments/              ← village_square.py, home_interior.py, ...
├── pipeline/
│   ├── parser.py                  ← .txt senaryoyu okur: sahne etiketi + EN/TR satırları
│   ├── narrate.py                 ← edge-tts (dil başına ses + kelime zaman damgası)
│   ├── animate.py                 ← iskelet sistem + sketchy.py render
│   ├── assemble.py                ← FFmpeg: 1080x1920, sahne + ses + altyazı
│   └── upload.py                  ← YouTube Data API (kanal başına ayrı credentials)
└── .github/workflows/
    └── daily.yml                  ← cron: her gün 3 bölüm işle, 2 kanala yükle
```

## 2. YÜKLEME ADIMLARI

1. GitHub'da yeni repo aç: `fikra-kanali`
2. Bu paketteki dosyaları yerleştir:
   - `fikra_catalog.json` → `content/catalog.json`
   - Tüm `f*.txt` senaryolar → `content/scripts/`
   - `ASSETS_MANIFEST.md` → repo köküne (varlık geliştirme yol haritası)
3. İki GCP projesi aç (TR kanal + EN kanal), her birinde YouTube Data API v3 aktif et,
   OAuth client oluştur, refresh token al (ambience kanallarındaki akışın aynısı).
4. Repo Secrets'a ekle:
   - `YT_TR_CLIENT_ID`, `YT_TR_CLIENT_SECRET`, `YT_TR_REFRESH_TOKEN`
   - `YT_EN_CLIENT_ID`, `YT_EN_CLIENT_SECRET`, `YT_EN_REFRESH_TOKEN`
5. Workflow mantığı (daily.yml):
   - catalog.json'dan status=scripted olan ilk 3 bölümü seç
   - her bölüm için: parser → narrate (TR ve EN ayrı) → animate → assemble (dil başına ayrı render, süreler o dilin TTS zaman damgalarından)
   - upload: EN video → EN kanal, TR video → TR kanal
   - status=published yaz, commit et

## 3. SENARYO DOSYA FORMATI (parser sözleşmesi)

```
[scene: ENV_ADI | chars: KARAKTERLER | props: NESNELER | action: AKSIYON_ADI]
EN: İngilizce anlatım satırı
TR: Türkçe anlatım satırı
```
- `# punchline_hold:` → son karede dondurma süresi
- `# NEW ASSETS:` → o bölümün kütüphaneye eklediği yeni varlıklar
- Meta bloğundaki voice_en / voice_tr → edge-tts ses seçimi

## 4. YAYIN SIRASI ÖNERİSİ (ilk hafta, kanal ısınması)
Gün 1-3: günde 2 bölüm | Gün 4+: günde 3 bölüm
Başlangıç sırası: f125 (en ucuz) → f173 → f_ordek_corbasi → f172 → f_op_de_basina_koy → ...
