# -*- coding: utf-8 -*-
"""environments.py — 9:16 dikey sahne arka planları.
Katmanlar: gökyüzü (üst ~%45), orta plan (silüet/yapılar), zemin (alt ~%30).
Karakterler zemin çizgisine (GROUND_Y) basar."""
import math

from PIL import Image, ImageDraw

W, H = 1080, 1920
GROUND_Y = 1560
INK = (35, 32, 30)

DAY = {"sky_top": (125, 205, 235), "sky_bot": (125, 205, 235),
       "ground": (190, 190, 190), "ground2": (190, 190, 190)}
NIGHT = {"sky_top": (45, 55, 110), "sky_bot": (45, 55, 110),
         "ground": (130, 130, 145), "ground2": (130, 130, 145)}
INTERIOR = {"wall": (245, 205, 130), "wall2": (245, 205, 130),
            "floor": (200, 140, 80)}
INTERIOR_NIGHT = {"wall": (150, 125, 165), "wall2": (150, 125, 165),
                  "floor": (110, 90, 125)}


def _vgrad(img, y0, y1, c0, c1):
    ImageDraw.Draw(img).rectangle((0, y0, W, y1), fill=c0)


def _outdoor_base(img, sk, pal, t):
    _vgrad(img, 0, GROUND_Y - 380, pal["sky_top"], pal["sky_bot"])
    _vgrad(img, GROUND_Y - 380, H, pal["ground"], pal["ground2"])
    # bulutlar (statik)
    cx = 120
    for dx, dy, s in ((0, 220, 1.0), (620, 360, 0.7)):
        x = (cx + dx) % (W + 500) - 250
        col = (250, 250, 252) if pal is DAY else (80, 88, 120)
        sk.ellipse(x, dy, 130 * s, 40 * s, fill=col, outline=None)
        sk.ellipse(x + 80 * s, dy - 20 * s, 90 * s, 34 * s, fill=col, outline=None)


def _house(sk, x, y, s=1.0, color=(245, 170, 90), roof=(225, 80, 70)):
    sk.poly([(x - 110 * s, y), (x + 110 * s, y), (x + 110 * s, y - 150 * s), (x - 110 * s, y - 150 * s)],
            fill=color, outline=INK, width=4)
    sk.poly([(x - 125 * s, y - 150 * s), (x + 125 * s, y - 150 * s), (x + 95 * s, y - 195 * s), (x - 95 * s, y - 195 * s)],
            fill=roof, outline=INK, width=4)
    sk.poly([(x - 35 * s, y - 60 * s), (x + 35 * s, y - 60 * s), (x + 35 * s, y - 120 * s), (x - 35 * s, y - 120 * s)],
            fill=(140, 210, 240), outline=INK, width=3)
    sk.line((x, y - 60 * s), (x, y - 120 * s), fill=INK, width=2)
    sk.line((x - 35 * s, y - 90 * s), (x + 35 * s, y - 90 * s), fill=INK, width=2)


def _minaret(sk, x, y, s=1.0):
    sk.poly([(x - 14 * s, y), (x + 14 * s, y), (x + 10 * s, y - 330 * s), (x - 10 * s, y - 330 * s)],
            fill=(230, 225, 215), outline=INK, width=3)
    sk.poly([(x - 20 * s, y - 330 * s), (x + 20 * s, y - 330 * s), (x, y - 390 * s)],
            fill=(150, 150, 160), outline=INK, width=3)
    sk.ellipse(x, y - 250 * s, 22 * s, 10 * s, fill=(200, 195, 185), outline=INK, width=2)


def village_square(img, sk, t, night=False):
    pal = NIGHT if night else DAY
    _outdoor_base(img, sk, pal, t)
    _house(sk, 190, GROUND_Y - 320, 0.9, (200, 140, 85))
    _house(sk, 880, GROUND_Y - 300, 1.0, (215, 160, 100), (90, 110, 70))
    sk.poly([(455, GROUND_Y - 330), (635, GROUND_Y - 330), (635, GROUND_Y - 460), (455, GROUND_Y - 460)],
            fill=(235, 230, 220), outline=INK, width=5)
    sk.arc(545, GROUND_Y - 460, 90, 180, 360, fill=(120, 170, 120), width=40)
    _minaret(sk, 690, GROUND_Y - 330, 0.8)
    if night:
        from .props import moon
        moon(sk, 900, 260, 1.0, t)
    else:
        from .props import sun
        sun(sk, 900, 240, 0.9, t)
    from .props import tree
    tree(sk, 90, GROUND_Y - 300, 0.9, t)


def street(img, sk, t, night=False):
    pal = NIGHT if night else DAY
    _outdoor_base(img, sk, pal, t)
    _house(sk, 150, GROUND_Y - 260, 1.1)
    _house(sk, 930, GROUND_Y - 250, 1.15, (190, 150, 110))
    if night:
        from .props import moon
        moon(sk, 540, 230, 1.0, t)
        # pencerelerde sıcak ışık
        sk.poly([(115, GROUND_Y - 326), (185, GROUND_Y - 326), (185, GROUND_Y - 392), (115, GROUND_Y - 392)],
                fill=(255, 210, 110), outline=INK, width=3)


def village_road(img, sk, t, night=False, slope=False):
    pal = NIGHT if night else DAY
    _outdoor_base(img, sk, pal, t)
    # yol
    sk.poly([(340, H), (740, H), (600, GROUND_Y - 420), (480, GROUND_Y - 420)],
            fill=(200, 170, 120) if not night else (110, 100, 100), outline=None)
    from .props import tree
    tree(sk, 130, GROUND_Y - 350, 0.8, t)
    tree(sk, 950, GROUND_Y - 380, 0.7, t)
    # çit
    for i in range(5):
        x = 60 + i * 70
        sk.line((x, GROUND_Y - 120), (x, GROUND_Y - 210), fill=(120, 85, 55), width=6)
    sk.line((50, GROUND_Y - 180), (360, GROUND_Y - 195), fill=(120, 85, 55), width=5)
    if slope:
        sk.line((60, GROUND_Y - 430), (1020, GROUND_Y - 560), fill=pal["ground2"], width=8)
    if not night:
        from .props import sun
        sun(sk, 180, 230, 0.8, t)


def home_interior(img, sk, t, night=False):
    pal = INTERIOR_NIGHT if night else INTERIOR
    _vgrad(img, 0, GROUND_Y - 200, pal["wall"], pal["wall2"])
    _vgrad(img, GROUND_Y - 200, H, pal["floor"], tuple(max(0, c - 20) for c in pal["floor"]))
    # kilim
    sk.poly([(180, GROUND_Y + 40), (900, GROUND_Y + 40), (960, GROUND_Y + 240), (120, GROUND_Y + 240)],
            fill=(160, 60, 60), outline=INK, width=4)
    sk.poly([(300, GROUND_Y + 80), (780, GROUND_Y + 80), (820, GROUND_Y + 200), (260, GROUND_Y + 200)],
            fill=(60, 90, 130), outline=INK, width=3)
    # pencere
    win = (150, 190, 230) if not night else (35, 45, 80)
    sk.poly([(720, 480), (960, 480), (960, 800), (720, 800)], fill=win, outline=INK, width=5)
    sk.line((840, 480), (840, 800), fill=INK, width=4)
    sk.line((720, 640), (960, 640), fill=INK, width=4)
    if night:
        sk.circle(880, 560, 34, fill=(250, 245, 220), outline=None)
    # duvar rafı + testi
    sk.line((130, 600), (430, 600), fill=(110, 75, 50), width=10)
    sk.ellipse(220, 570, 30, 26, fill=(170, 110, 70), outline=INK, width=3)
    sk.ellipse(330, 566, 24, 30, fill=(140, 100, 90), outline=INK, width=3)


def bedroom_night(img, sk, t, **kw):
    home_interior(img, sk, t, night=True)
    # yatak
    sk.poly([(120, GROUND_Y - 60), (700, GROUND_Y - 60), (700, GROUND_Y + 120), (120, GROUND_Y + 120)],
            fill=(120, 90, 70), outline=INK, width=4)
    sk.poly([(140, GROUND_Y - 40), (680, GROUND_Y - 40), (680, GROUND_Y + 60), (140, GROUND_Y + 60)],
            fill=(180, 130, 90), outline=INK, width=3)
    sk.ellipse(210, GROUND_Y - 60, 60, 26, fill=(240, 235, 220), outline=INK, width=3)


def palace_tent(img, sk, t, **kw):
    _vgrad(img, 0, H, (120, 40, 50), (90, 30, 40))
    # perdeler
    for side, x0 in ((1, 0), (-1, W)):
        pts = [(x0, 0)]
        for i in range(7):
            y = i * 300
            pts.append((x0 + side * (120 + 50 * math.sin(i + t * 0.5)), y + 150))
        sk.polyline(pts, fill=(60, 110, 70), width=90)
    _vgrad_strip = None
    # zemin / podyum
    sk.poly([(0, GROUND_Y - 60), (W, GROUND_Y - 60), (W, H), (0, H)], fill=(150, 110, 60), outline=None)
    sk.line((0, GROUND_Y - 60), (W, GROUND_Y - 60), fill=INK, width=5)
    sk.poly([(560, GROUND_Y - 60), (1040, GROUND_Y - 60), (1000, GROUND_Y - 180), (600, GROUND_Y - 180)],
            fill=(190, 150, 80), outline=INK, width=4)


def bazaar(img, sk, t, **kw):
    _outdoor_base(img, sk, DAY, t)
    from .props import market_stall
    market_stall(sk, 250, GROUND_Y - 240, 1.0, t)
    market_stall(sk, 860, GROUND_Y - 260, 0.9, t)
    _house(sk, 545, GROUND_Y - 430, 0.8)


def forest(img, sk, t, road=False, **kw):
    _outdoor_base(img, sk, DAY, t)
    from .props import tree, tree_big
    tree(sk, 140, GROUND_Y - 340, 0.9, t)
    tree(sk, 940, GROUND_Y - 300, 1.0, t)
    tree(sk, 700, GROUND_Y - 480, 0.6, t)
    if not road:
        tree_big(sk, 380, GROUND_Y - 60, 1.0, t)
    else:
        sk.poly([(380, H), (700, H), (620, GROUND_Y - 380), (500, GROUND_Y - 380)],
                fill=(200, 170, 120), outline=None)


def riverside(img, sk, t, **kw):
    _outdoor_base(img, sk, DAY, t)
    # nehir
    sk.poly([(0, GROUND_Y - 240), (W, GROUND_Y - 320), (W, GROUND_Y - 80), (0, GROUND_Y - 20)],
            fill=(90, 150, 190), outline=None)
    for i in range(5):
        y = GROUND_Y - 220 + i * 36
        x = (t * 40 + i * 220) % (W + 200) - 100
        sk.arc(x, y, 40, 200, 340, fill=(180, 215, 235), width=3)
    from .props import tree
    tree(sk, 120, GROUND_Y - 380, 0.9, t)


def barn_interior(img, sk, t, **kw):
    _vgrad(img, 0, GROUND_Y, (140, 105, 70), (115, 85, 55))
    _vgrad(img, GROUND_Y, H, (110, 90, 60), (95, 75, 50))
    for i in range(5):
        sk.line((i * 260, 0), (i * 260 + 30, GROUND_Y), fill=(90, 65, 40), width=8)
    # saman yığını
    sk.ellipse(860, GROUND_Y - 40, 160, 70, fill=(220, 190, 90), outline=(170, 140, 50), width=4)


def inn_interior(img, sk, t, **kw):
    home_interior(img, sk, t, night=True)
    # sarkan eğri tavan kirişleri
    for i in range(4):
        y = 180 + i * 90 + math.sin(t * 3 + i) * 4
        sk.line((40, y + 30), (W - 40, y - 20), fill=(90, 65, 40), width=14)
    # gıcırtı çizgileri
    sk.line((820, 150), (860, 110), fill=(240, 240, 240), width=3)
    sk.line((860, 160), (900, 130), fill=(240, 240, 240), width=3)


def mosque_courtyard(img, sk, t, **kw):
    _outdoor_base(img, sk, DAY, t)
    sk.ellipse(540, GROUND_Y - 560, 240, 130, fill=(200, 200, 205), outline=INK, width=4)
    sk.poly([(300, GROUND_Y - 560), (780, GROUND_Y - 560), (780, GROUND_Y - 300), (300, GROUND_Y - 300)],
            fill=(225, 215, 200), outline=INK, width=4)
    _minaret(sk, 220, GROUND_Y - 300, 1.1)
    _minaret(sk, 865, GROUND_Y - 300, 1.1)
    # avlu taşları
    for i in range(4):
        sk.line((80, GROUND_Y - 60 + i * 90), (1000, GROUND_Y - 80 + i * 90),
                fill=(190, 145, 90), width=3)


def castle_wall(img, sk, t, **kw):
    _outdoor_base(img, sk, NIGHT, t)
    sk.poly([(0, GROUND_Y - 200), (W, GROUND_Y - 200), (W, GROUND_Y - 620), (0, GROUND_Y - 620)],
            fill=(90, 90, 105), outline=INK, width=5)
    for i in range(7):
        sk.poly([(i * 160, GROUND_Y - 620), (i * 160 + 90, GROUND_Y - 620),
                 (i * 160 + 90, GROUND_Y - 690), (i * 160, GROUND_Y - 690)],
                fill=(90, 90, 105), outline=INK, width=4)
    from .props import moon
    moon(sk, 880, 220, 1.0, t)


REGISTRY = {
    "village_square": village_square,
    "street_day": lambda i, s, t: street(i, s, t, night=False),
    "street_night": lambda i, s, t: street(i, s, t, night=True),
    "village_road": village_road,
    "hill_road": lambda i, s, t: village_road(i, s, t, slope=True),
    "mountain_road": lambda i, s, t: village_road(i, s, t, slope=True),
    "forest_road": lambda i, s, t: forest(i, s, t, road=True),
    "forest": forest,
    "home_interior": home_interior,
    "home_door": lambda i, s, t: street(i, s, t),
    "bedroom_night": bedroom_night,
    "palace_tent": palace_tent,
    "feast_hall": lambda i, s, t: home_interior(i, s, t),
    "bazaar": bazaar,
    "butcher_shop": lambda i, s, t: bazaar(i, s, t),
    "riverside": riverside,
    "barn_interior": barn_interior,
    "inn_interior": inn_interior,
    "inn_exterior_night": lambda i, s, t: street(i, s, t, night=True),
    "mosque_courtyard": mosque_courtyard,
    "castle_wall": castle_wall,
}


def draw_environment(name, img, sk, t):
    fn = REGISTRY.get(name.strip().lower())
    if fn is None:
        village_square(img, sk, t)  # güvenli varsayılan
    else:
        fn(img, sk, t)
