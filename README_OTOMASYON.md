# FIKRA OTOMASYONU — İŞLETME REHBERİ

## SENİN TEK İŞİN
`content/scripts/` klasörüne yeni fıkra `.txt` dosyası atmak. Bitti.

Sistem her gün 3 kez (TR saatiyle ~09:30 / 14:30 / 18:30) çalışır:
sıradaki YAYINLANMAMIŞ senaryoyu alfabetik sırayla alır → EN+TR render eder
→ EN videoyu Scribbled Yarns'a, TR videoyu Karalama Fıkralar'a yükler
→ `content/published/published.json` defterine işler (aynı fıkra iki kez yayınlanmaz).

Senaryo dosyalarını ben (Claude) üretiyorum — sen sadece repoya atıyorsun.

## İLK GÜN AÇILIŞ KONTROLÜ (bir kez yap)
Cron'a bırakmadan önce gerçek sesle bir deneme:
1. Actions → "Gunluk Fikra Yayini" → Run workflow
   - episodes: 1, privacy: **unlisted**
2. ~5-10 dk bekle, yeşil tik gör.
3. İki kanalda unlisted videoyu izle: ses (gerçek edge-tts), altyazı, animasyon.
4. Memnunsan videoları public yap ya da sil; cron zaten public yayınlamaya
   devam edecek. Memnun değilsen bana söyle, ayar çekelim.

## TEMPO AYARI
- Günde 3 bölüm = daily.yml'deki 3 cron satırı. Azaltmak için satır sil,
  artırmak için yeni saat ekle (kanal başına günde 5 upload'ı geçme — kota).
- İlk 2 hafta günde 2 öneririm: en alttaki cron satırının başına `#` koy.

## ARIZA DURUMLARI
- Kırmızı workflow + "invalid_grant" → refresh token bozulmuş; OAuth
  Playground turunu tekrarla, secret'ı güncelle.
- "quotaExceeded" → günlük API kotası doldu; ertesi gün kendiliğinden düzelir.
- edge-tts hatası → o çalıştırmada sessiz yedek üretilir; nadir ağ sorunudur,
  video sessizse sil, workflow'u elle tekrar çalıştır.
- Bir fıkrayı yayından atlamak istersen: published.json'a elle
  `"dosya_adi.txt": {"skipped": true}` ekle.

## DOSYA HARİTASI
```
content/scripts/      ← FIKRALAR (senin attıkların)
content/published/    ← yayın defteri (bot yazar, dokunma)
pipeline/             ← motor (parser, ses, çizim, montaj, upload)
.github/workflows/
  daily.yml           ← günlük yayın (cron + elle tetikleme)
  test_upload.yml     ← bağlantı testi (artık gerekmedikçe kullanma)
requirements.txt
```

## SENARYO FORMATI (yeni fıkra yazdırırken değişmez sözleşme)
```
# title_en: X | title_tr: Y
# voice_en: en-US-AndrewNeural | voice_tr: tr-TR-AhmetNeural
[scene: env_adi | chars: hoca, wife | props: donkey | action: aksiyon_adi]
EN: İngilizce anlatım satırı
TR: Türkçe anlatım satırı
# punchline_hold: 2
```
Mevcut environment/prop/aksiyon adlarını kullanan senaryolar anında çalışır;
yeni sahne/prop gerekirse kütüphaneye birlikte ekleriz.
