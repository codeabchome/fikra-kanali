# -*- coding: utf-8 -*-
"""props.py — prop kütüphanesi. Her prop draw(sk, x, y, scale, t) imzalı.
Kütüphanede olmayan prop sessizce atlanır (pipeline kırılmaz)."""
import math

INK = (35, 32, 30)


def donkey(sk, x, y, s=1.0, t=0.0, walking=False, running=False):
    sp = 4.5 if running else (2.4 if walking else 0)
    swing = math.sin(t * 2 * math.pi * sp) * (26 if running else 14) if sp else 0
    body_y = y - 80 * s
    sk.ellipse(x, body_y, 85 * s, 45 * s, fill=(150, 140, 135), outline=INK, width=4)
    for i, lx in enumerate((-55, -25, 25, 55)):
        a = swing if i % 2 == 0 else -swing
        sk.line((x + lx * s, body_y + 30 * s), (x + lx * s + a * 0.4, y), fill=INK, width=5)
    nx = x + 75 * s
    sk.line((nx, body_y - 15 * s), (nx + 28 * s, body_y - 55 * s), fill=(150, 140, 135), width=int(16 * s))
    hx, hy = nx + 38 * s, body_y - 62 * s
    sk.ellipse(hx, hy, 30 * s, 20 * s, fill=(150, 140, 135), outline=INK, width=3)
    sk.ellipse(hx - 6 * s, hy - 26 * s, 6 * s, 20 * s, fill=(150, 140, 135), outline=INK, width=3)
    sk.ellipse(hx + 10 * s, hy - 26 * s, 6 * s, 20 * s, fill=(150, 140, 135), outline=INK, width=3)
    sk.d.ellipse((hx + 14 * s, hy - 4 * s, hx + 20 * s, hy + 2 * s), fill=INK)
    sk.line((x - 82 * s, body_y - 10 * s), (x - 105 * s, body_y + 25 * s), fill=INK, width=4)


def elephant(sk, x, y, s=1.0, t=0.0, **kw):
    body_y = y - 120 * s
    sk.ellipse(x, body_y, 130 * s, 85 * s, fill=(140, 140, 150), outline=INK, width=5)
    for lx in (-80, -35, 35, 80):
        sk.line((x + lx * s, body_y + 60 * s), (x + lx * s, y), fill=(140, 140, 150), width=int(26 * s))
        sk.line((x + lx * s, body_y + 60 * s), (x + lx * s, y), fill=None or INK, width=3)
    hx, hy = x + 125 * s, body_y - 40 * s
    sk.circle(hx, hy, 55 * s, fill=(140, 140, 150), outline=INK, width=4)
    sk.ellipse(hx - 35 * s, hy, 35 * s, 45 * s, fill=(120, 120, 132), outline=INK, width=3)
    tr = [(hx + 45 * s, hy + 10 * s), (hx + 75 * s, hy + 50 * s), (hx + 70 * s, hy + 100 * s),
          (hx + 50 * s, hy + 120 * s)]
    sk.polyline(tr, fill=INK, width=int(14 * s))
    sk.d.ellipse((hx + 12 * s, hy - 12 * s, hx + 20 * s, hy - 4 * s), fill=INK)


def quilt(sk, x, y, s=1.0, t=0.0, **kw):
    sk.poly([(x - 60 * s, y - 40 * s), (x + 60 * s, y - 50 * s),
             (x + 55 * s, y + 30 * s), (x - 55 * s, y + 35 * s)],
            fill=(180, 130, 90), outline=INK, width=4)
    for i in range(1, 3):
        sk.line((x - 55 * s, y - 40 * s + i * 26 * s), (x + 55 * s, y - 46 * s + i * 26 * s),
                fill=INK, width=2)


def candle(sk, x, y, s=1.0, t=0.0, **kw):
    sk.poly([(x - 18 * s, y), (x + 18 * s, y), (x + 12 * s, y - 8 * s), (x - 12 * s, y - 8 * s)],
            fill=(160, 120, 70), outline=INK, width=3)
    sk.poly([(x - 6 * s, y - 8 * s), (x + 6 * s, y - 8 * s), (x + 5 * s, y - 40 * s), (x - 5 * s, y - 40 * s)],
            fill=(240, 235, 210), outline=INK, width=3)
    fl = 1 + 0.25 * math.sin(t * 2 * math.pi * 3 + 1)
    sk.ellipse(x, y - 52 * s * fl, 7 * s, 14 * s * fl, fill=(255, 190, 60), outline=(200, 90, 20), width=2)
    # glow
    sk.circle(x, y - 50 * s, 26 * s * fl, outline=(255, 220, 120), width=2)


def moon(sk, x, y, s=1.0, t=0.0, **kw):
    sk.circle(x, y, 55 * s, fill=(250, 245, 220), outline=(200, 195, 170), width=3)


def sun(sk, x, y, s=1.0, t=0.0, **kw):
    sk.circle(x, y, 55 * s, fill=(255, 210, 80), outline=(230, 160, 40), width=3)
    for i in range(10):
        a = 2 * math.pi * i / 10
        sk.line((x + math.cos(a) * 65 * s, y + math.sin(a) * 65 * s),
                (x + math.cos(a) * 90 * s, y + math.sin(a) * 90 * s),
                fill=(230, 160, 40), width=3)


def tree(sk, x, y, s=1.0, t=0.0, **kw):
    sk.line((x, y), (x - 5 * s, y - 130 * s), fill=(110, 75, 50), width=int(16 * s))
    sway = math.sin(t * 2 * math.pi * 0.4) * 4 * s
    for dx, dy, r in ((-45, -170, 55), (40, -180, 60), (0, -230, 65)):
        sk.circle(x + dx * s + sway, y + dy * s, r * s, fill=(70, 140, 70), outline=(40, 100, 45), width=4)


def tree_big(sk, x, y, s=1.0, t=0.0, **kw):
    tree(sk, x, y, s * 1.6, t)
    # kesilebilir yatay dal
    sk.line((x, y - 200 * s), (x + 190 * s, y - 230 * s), fill=(110, 75, 50), width=int(14 * s))


def axe(sk, x, y, s=1.0, t=0.0, **kw):
    sk.line((x, y), (x + 10 * s, y - 60 * s), fill=(120, 85, 55), width=int(7 * s))
    sk.poly([(x + 4 * s, y - 60 * s), (x + 34 * s, y - 72 * s), (x + 30 * s, y - 46 * s)],
            fill=(160, 160, 170), outline=INK, width=3)


def hay_bundle(sk, x, y, s=1.0, t=0.0, **kw):
    sk.ellipse(x, y - 18 * s, 45 * s, 20 * s, fill=(220, 190, 90), outline=(170, 140, 50), width=3)
    for i in range(6):
        sk.line((x - 40 * s + i * 16 * s, y - 30 * s), (x - 30 * s + i * 16 * s, y - 4 * s),
                fill=(170, 140, 50), width=2)


def meat_package(sk, x, y, s=1.0, t=0.0, **kw):
    sk.poly([(x - 25 * s, y - 30 * s), (x + 25 * s, y - 30 * s), (x + 20 * s, y), (x - 20 * s, y)],
            fill=(190, 90, 80), outline=INK, width=3)
    sk.line((x - 22 * s, y - 16 * s), (x + 22 * s, y - 16 * s), fill=(240, 230, 220), width=3)


def recipe_paper(sk, x, y, s=1.0, t=0.0, **kw):
    sk.poly([(x - 20 * s, y - 30 * s), (x + 20 * s, y - 34 * s), (x + 22 * s, y), (x - 18 * s, y + 3 * s)],
            fill=(250, 246, 232), outline=INK, width=3)
    for i in range(3):
        sk.line((x - 12 * s, y - 24 * s + i * 9 * s), (x + 14 * s, y - 26 * s + i * 9 * s), fill=(120, 120, 130), width=2)


def eagle(sk, x, y, s=1.0, t=0.0, **kw):
    flap = math.sin(t * 2 * math.pi * 3) * 30
    sk.ellipse(x, y, 30 * s, 14 * s, fill=(60, 50, 45), outline=INK, width=3)
    for side in (-1, 1):
        wx = x + side * 26 * s
        sk.poly([(wx, y), (wx + side * 60 * s, y - (30 + flap) * s * 0.8),
                 (wx + side * 40 * s, y + 6 * s)], fill=(60, 50, 45), outline=INK, width=3)
    sk.circle(x + 32 * s, y - 6 * s, 9 * s, fill=(60, 50, 45), outline=INK, width=2)
    sk.poly([(x + 40 * s, y - 6 * s), (x + 52 * s, y - 2 * s), (x + 40 * s, y + 2 * s)], fill=(220, 170, 60))


def sack(sk, x, y, s=1.0, t=0.0, wiggle=False, **kw):
    wob = math.sin(t * 2 * math.pi * 5) * 4 * s if wiggle else 0
    sk.poly([(x - 30 * s + wob, y), (x + 30 * s - wob, y), (x + 22 * s, y - 55 * s),
             (x + 8 * s, y - 70 * s), (x - 8 * s, y - 70 * s), (x - 22 * s, y - 55 * s)],
            fill=(190, 160, 110), outline=INK, width=3)
    sk.line((x - 10 * s, y - 68 * s), (x + 10 * s, y - 68 * s), fill=INK, width=4)


def grain_scoop(sk, x, y, s=1.0, t=0.0, **kw):
    sk.poly([(x - 25 * s, y - 20 * s), (x + 15 * s, y - 20 * s), (x + 10 * s, y), (x - 20 * s, y)],
            fill=(150, 110, 70), outline=INK, width=3)
    sk.line((x + 15 * s, y - 18 * s), (x + 45 * s, y - 30 * s), fill=(150, 110, 70), width=int(7 * s))


def hare(sk, x, y, s=1.0, t=0.0, **kw):
    sk.ellipse(x, y - 18 * s, 26 * s, 16 * s, fill=(200, 190, 180), outline=INK, width=3)
    sk.circle(x + 22 * s, y - 28 * s, 11 * s, fill=(200, 190, 180), outline=INK, width=2)
    sk.ellipse(x + 20 * s, y - 46 * s, 4 * s, 12 * s, fill=(200, 190, 180), outline=INK, width=2)
    sk.ellipse(x + 27 * s, y - 46 * s, 4 * s, 12 * s, fill=(200, 190, 180), outline=INK, width=2)


def soup_pot(sk, x, y, s=1.0, t=0.0, **kw):
    sk.ellipse(x, y - 22 * s, 40 * s, 26 * s, fill=(70, 70, 80), outline=INK, width=4)
    sk.ellipse(x, y - 44 * s, 34 * s, 8 * s, fill=(120, 120, 130), outline=INK, width=3)
    for i in range(2):
        sx = x - 10 * s + i * 20 * s
        sk.line((sx, y - 52 * s), (sx + 4 * s, y - 70 * s - math.sin(t * 4 + i) * 4 * s),
                fill=(180, 180, 190), width=3)


def soup_bowls(sk, x, y, s=1.0, t=0.0, **kw):
    for dx in (-45, 0, 45):
        sk.ellipse(x + dx * s, y - 8 * s, 22 * s, 10 * s, fill=(210, 190, 160), outline=INK, width=3)


def whistle(sk, x, y, s=1.0, t=0.0, **kw):
    sk.ellipse(x, y, 14 * s, 9 * s, fill=(200, 60, 60), outline=INK, width=2)
    sk.line((x + 12 * s, y - 3 * s), (x + 28 * s, y - 8 * s), fill=(200, 60, 60), width=int(6 * s))


def coin(sk, x, y, s=1.0, t=0.0, **kw):
    sk.circle(x, y, 10 * s, fill=(230, 190, 80), outline=(160, 120, 30), width=2)


def bread(sk, x, y, s=1.0, t=0.0, **kw):
    sk.ellipse(x, y, 24 * s, 12 * s, fill=(215, 170, 100), outline=(150, 110, 50), width=3)


def ducks_x3(sk, x, y, s=1.0, t=0.0, scattered=False, **kw):
    for i, dx in enumerate((-70, 0, 70)):
        oy = math.sin(t * 2 + i) * 3 * s
        px = x + dx * s * (1.8 if scattered else 1.0)
        sk.ellipse(px, y + oy, 22 * s, 12 * s, fill=(240, 240, 235), outline=INK, width=2)
        sk.circle(px + 18 * s, y - 12 * s + oy, 8 * s, fill=(240, 240, 235), outline=INK, width=2)
        sk.poly([(px + 25 * s, y - 12 * s), (px + 34 * s, y - 10 * s), (px + 25 * s, y - 8 * s)], fill=(230, 160, 40))


def fire_load(sk, x, y, s=1.0, t=0.0, **kw):
    for i in range(4):
        fl = 1 + 0.3 * math.sin(t * 8 + i * 2)
        sk.ellipse(x + (i - 1.5) * 18 * s, y - 20 * s * fl, 10 * s, 22 * s * fl,
                   fill=(255, 150 + i * 20, 40), outline=(200, 80, 20), width=2)


def thornbush_load(sk, x, y, s=1.0, t=0.0, **kw):
    sk.ellipse(x, y - 14 * s, 50 * s, 22 * s, fill=(140, 110, 60), outline=(90, 70, 40), width=3)
    for i in range(8):
        a = math.pi * i / 7
        sk.line((x, y - 14 * s), (x + math.cos(a) * 55 * s, y - 14 * s - math.sin(a) * 30 * s),
                fill=(90, 70, 40), width=2)


def throne(sk, x, y, s=1.0, t=0.0, **kw):
    sk.poly([(x - 60 * s, y), (x + 60 * s, y), (x + 60 * s, y - 55 * s), (x - 60 * s, y - 55 * s)],
            fill=(140, 90, 40), outline=INK, width=4)
    sk.poly([(x - 55 * s, y - 55 * s), (x + 55 * s, y - 55 * s), (x + 40 * s, y - 150 * s), (x - 40 * s, y - 150 * s)],
            fill=(170, 40, 40), outline=INK, width=4)
    sk.circle(x, y - 150 * s, 14 * s, fill=(230, 190, 80), outline=INK, width=3)


def fur_coat(sk, x, y, s=1.0, t=0.0, **kw):
    sk.poly([(x - 42 * s, y - 130 * s), (x + 42 * s, y - 130 * s), (x + 55 * s, y), (x - 55 * s, y)],
            fill=(150, 110, 60), outline=INK, width=4)
    for i in range(6):
        sk.arc(x - 40 * s + i * 16 * s, y - 128 * s, 9 * s, 180, 360, fill=(90, 65, 35), width=2)


def feast_table(sk, x, y, s=1.0, t=0.0, **kw):
    sk.ellipse(x, y, 150 * s, 40 * s, fill=(180, 140, 90), outline=INK, width=4)
    for dx in (-90, -30, 30, 90):
        sk.ellipse(x + dx * s, y - 8 * s, 24 * s, 10 * s, fill=(230, 225, 210), outline=INK, width=2)
    sk.ellipse(x, y - 16 * s, 30 * s, 14 * s, fill=(200, 120, 60), outline=INK, width=3)


def market_stall(sk, x, y, s=1.0, t=0.0, **kw):
    sk.poly([(x - 90 * s, y), (x + 90 * s, y), (x + 90 * s, y - 60 * s), (x - 90 * s, y - 60 * s)],
            fill=(160, 120, 70), outline=INK, width=4)
    sk.poly([(x - 100 * s, y - 60 * s), (x + 100 * s, y - 60 * s), (x + 80 * s, y - 110 * s), (x - 80 * s, y - 110 * s)],
            fill=(200, 80, 70), outline=INK, width=4)
    for i in range(4):
        sk.arc(x - 75 * s + i * 50 * s, y - 108 * s, 24 * s, 0, 180, fill=(240, 235, 220), width=6)


def staff(sk, x, y, s=1.0, t=0.0, **kw):
    sk.line((x, y), (x + 6 * s, y - 170 * s), fill=(120, 85, 55), width=int(7 * s))
    sk.arc(x + 8 * s, y - 175 * s, 14 * s, 180, 400, fill=(120, 85, 55), width=int(6 * s))


def bundle(sk, x, y, s=1.0, t=0.0, **kw):
    sk.circle(x, y - 20 * s, 24 * s, fill=(200, 90, 90), outline=INK, width=3)
    sk.line((x, y - 40 * s), (x + 30 * s, y - 70 * s), fill=(120, 85, 55), width=int(6 * s))


def turban_cloth(sk, x, y, s=1.0, t=0.0, **kw):
    pts = [(x - 60 * s + i * 20 * s, y - 10 * s + math.sin(i + t * 3) * 8 * s) for i in range(7)]
    sk.polyline(pts, fill=(240, 236, 220), width=int(12 * s))
    sk.polyline(pts, fill=INK, width=2)


REGISTRY = {k: v for k, v in list(globals().items()) if callable(v) and not k.startswith("_")}
ALIASES = {
    "donkey_running_fire": lambda sk, x, y, s=1.0, t=0.0, **k: (donkey(sk, x, y, s, t, running=True), fire_load(sk, x, y - 120 * s, s, t)),
    "donkey_distant_fire": lambda sk, x, y, s=1.0, t=0.0, **k: (donkey(sk, x, y, s * 0.5, t, running=True), fire_load(sk, x, y - 60 * s, s * 0.5, t)),
    "eagle_distant": lambda sk, x, y, s=1.0, t=0.0, **k: eagle(sk, x, y, s * 0.5, t),
    "sack_moving": lambda sk, x, y, s=1.0, t=0.0, **k: sack(sk, x, y, s, t, wiggle=True),
    "hare_escaping": hare, "broken_branch": None, "branch_falling": None,
    "wood_load": thornbush_load, "empty_baskets": None, "bran_handful": None,
    "table_spread": feast_table, "old_turban": turban_cloth, "new_turban_cloth": turban_cloth,
    "tangled_turban": turban_cloth, "mirror": None, "flint": None, "spear": staff,
    "castle": None, "gallows_silhouette": None, "creaky_ceiling": None, "calendar_x": None,
    "camel_dream_bubble": None, "moon_dream_bubble": moon, "barley_dream_bubble": None,
    "dream_bubble": None, "knife": None, "counter": None, "meat_hooks": None, "river": None,
    "lake_distant": None, "crooked_inn": None, "window": None, "water_jug": soup_bowls,
}


def draw_prop(name, sk, x, y, s=1.0, t=0.0, **kw):
    key = name.strip().lower()
    fn = REGISTRY.get(key) or ALIASES.get(key)
    if fn is None:
        return False
    fn(sk, x, y, s=s, t=t, **kw)
    return True
