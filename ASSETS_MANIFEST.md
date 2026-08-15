# VARLIK KÜTÜPHANESİ — BATCH 01 MANİFESTOSU
# Bu dosya kümülatif kütüphanenin başlangıç envanteri.
# Kural: bir kez çizilen varlık kalıcıdır, bir daha çizilmez.

## İMZA KARAKTERLER (özel çizim fonksiyonu)
hoca            → dev kavuk, beyaz sakal, cübbe, göbek. Rig: tam iskelet + yüz ifade seti (deadpan, şaşkın, kurnaz gülüş)
wife (hanım)    → başörtüsü, entari. Rig: tam iskelet + facepalm aksiyonu

## PARAMETRİK ŞABLONLAR (human.py)
adult_male      → parametreler: build (thin/stocky/fat), beard, headwear (sarık/fes/külah), outfit, palette
child           → YENİ SINIF: küçük gövde + büyük kafa oranı (f105 için)
# Batch 1'den doğan şablon örnekleri: host, guest x2, traveler, plaintiff,
# defendant, fighter x2, peasant, stranger x3, merchant, kid x4

## PROP'LAR (öncelik sırasıyla)
donkey          → RIG (eklemli, anırma + yürüme + yük taşıma) — onlarca fıkrada geçiyor, EN YÜKSEK ÖNCELİK
quilt           → taşıma + kapıp kaçma animasyonu
candle          → glow efekti (gece sahneleri)
fur_coat        → hoca rig'ine giyilebilir katman
axe, tree_big (kesilebilir dal eklemi), branch_falling, wood_load
feast_table, table_spread, soup_pot, soup_bowls, water_jug
whistle, coin, market_stall
hare, mirror, moon

## ENVIRONMENT'LAR (9:16 dikey kompozisyon: alt=zemin, orta=aksiyon, üst=gökyüzü/metin)
village_square  → kerpiç evler + minare + ağaç (gündüz)
street_day / street_night (palet varyantı)
home_interior   → kilim, ocak, pencere (gündüz/gece varyantı)
home_door       → dış kapı kadrajı
bedroom_night
feast_hall      → yastıklar, halı, zengin iç mekân
bazaar          → tezgâhlar, tenteler
forest, forest_road, hill_road (village_road eğim varyantı)

## MİKRO HAREKETLER (env canlılığı)
bacadan duman, mum titremesi, yaprak sallanması, bulut kayması

## BÖLÜM → VARLIK MALİYETİ (birikimin kanıtı)
f172 Ye Kürküm      : 5 yeni prop + 1 env
f017 Bindiği Dal    : donkey rig + 4 prop + 2 env
f125 Sen de Haklısın: ~0 yeni varlık (tamamı yeniden kullanım) ← hedef durum
f173 Yorgan         : 3 prop + 2 env
f105 Düdük          : child şablonu + 3 prop + 1 env
f139 Tavşan Suyu    : 5 prop + 1 env
