# -*- coding: utf-8 -*-
"""human.py — v2: Paint Terk stili karakterler.
Sari yuvarlak kafa + yuvarlatilmis dikdortgen govde + kalin siyah kol/bacak,
kirmizi yanak. STATIK."""
import hashlib
import math

INK = (15, 15, 15)
SKIN = (255, 200, 10)
CHEEK = (235, 60, 50)

SHIRT_COLORS = [(255, 200, 10), (90, 200, 90), (250, 120, 60), (120, 170, 250),
                (240, 110, 170), (170, 130, 250), (250, 210, 90)]
HAT_COLORS = [(20, 20, 20), (200, 40, 40), (40, 120, 200), (90, 60, 40)]

TR_NAMES = {"hoca": "HOCA", "wife": "HANIM", "timur": "TIMUR", "guard": "ASKER",
            "butcher": "KASAP", "traveler": "YOLCU", "innkeeper": "HANCI",
            "dervish": "DERVIS", "merchant": "SATICI", "peasant": "KOYLU",
            "friend": "AHBAP", "host": "EV SAHIBI", "buyer": "MUSTERI",
            "auctioneer": "TELLAL", "passerby": "YOLCU"}
EN_NAMES = {"hoca": "HODJA", "wife": "WIFE", "timur": "TIMUR", "guard": "GUARD",
            "butcher": "BUTCHER", "traveler": "TRAVELER", "innkeeper": "INNKEEPER",
            "dervish": "DERVISH", "merchant": "MERCHANT", "peasant": "VILLAGER",
            "friend": "FRIEND", "host": "HOST", "buyer": "BUYER",
            "auctioneer": "AUCTIONEER", "passerby": "PASSERBY"}
GENERIC_TR = {"villager": "KOYLU", "fighter": "KAVGACI", "kid": "COCUK",
              "stranger": "MISAFIR", "guest": "MISAFIR", "neighbor": "KOMSU",
              "plaintiff": "DAVACI", "defendant": "DAVALI"}
GENERIC_EN = {"villager": "VILLAGER", "fighter": "FIGHTER", "kid": "KID",
              "stranger": "GUEST", "guest": "GUEST", "neighbor": "NEIGHBOR",
              "plaintiff": "MAN 1", "defendant": "MAN 2"}

TR_FIX = {"TIMUR": "TIMUR", "DERVIS": "DERVI\u015e", "KOYLU": "K\u00d6YL\u00dc",
          "MUSTERI": "M\u00dc\u015eTER\u0130", "COCUK": "\u00c7OCUK",
          "MISAFIR": "M\u0130SAF\u0130R", "KOMSU": "KOM\u015eU"}


def display_name(key, lang="TR"):
    key = key.lower()
    table = TR_NAMES if lang == "TR" else EN_NAMES
    label = None
    if key in table:
        label = table[key]
    else:
        gen = GENERIC_TR if lang == "TR" else GENERIC_EN
        for g, lb in gen.items():
            if key.startswith(g):
                label = lb
                break
    if label is None:
        label = key.upper().replace("_", " ")
    if lang == "TR":
        label = TR_FIX.get(label, label)
    return label


def _h(name):
    return int(hashlib.md5(name.encode()).hexdigest(), 16)


class Character:
    def __init__(self, name, child=False, female=False):
        h = _h(name)
        self.name = name
        self.child = child
        self.female = female
        self.key = name.lower()
        self.is_hoca = self.key == "hoca"
        self.is_timur = self.key == "timur"
        self.shirt = SHIRT_COLORS[h % len(SHIRT_COLORS)]
        self.hat = HAT_COLORS[(h >> 4) % len(HAT_COLORS)]
        self.hair_style = (h >> 8) % 3
        if self.is_hoca:
            self.shirt = (150, 90, 200)
        if self.is_timur:
            self.shirt = (230, 60, 60)
        if female and not self.is_hoca:
            self.shirt = (250, 120, 170)
        self.hand_pos = None

    def draw(self, sk, x, y, scale=1.0, pose="idle", t=0.0, facing=1):
        s = scale * (0.65 if self.child else 1.0)
        head_r = 62 * s
        body_w = 130 * s
        body_h = 170 * s
        leg_h = 110 * s
        lw = max(10, int(16 * s))

        hip_y = y - leg_h
        top_y = hip_y - body_h
        head_c = (x, top_y - head_r * 0.55)
        self.hand_pos = (x + body_w * 0.42 * facing + 80 * s * facing,
                         top_y + 60 * s)

        if pose == "lie":
            self._lying(sk, x, y, s, body_w, head_r, lw)
            return

        # bacaklar + ayaklar
        for side in (-1, 1):
            lx = x + body_w * 0.24 * side
            sk.line((lx, hip_y + 6), (lx, y), fill=INK, width=lw)
            sk.line((lx, y), (lx + 30 * s * facing, y), fill=INK, width=lw)

        # govde
        sk.rrect(x - body_w / 2, top_y, x + body_w / 2, hip_y + 10 * s,
                 r=int(34 * s), fill=self.shirt)

        # kollar
        self._arms(sk, x, top_y + 30 * s, body_w, s, lw, pose, facing)

        # kafa + yuz
        sk.circle(*head_c, head_r, fill=SKIN)
        ex = head_c[0] + head_r * 0.32 * facing
        ey = head_c[1] - head_r * 0.10
        sk.d.ellipse((ex - 7 * s, ey - 7 * s, ex + 7 * s, ey + 7 * s), fill=INK)
        sk.circle(head_c[0] - head_r * 0.35 * facing, head_c[1] + head_r * 0.25,
                  12 * s, fill=CHEEK)
        mx = head_c[0] + head_r * 0.30 * facing
        my = head_c[1] + head_r * 0.52
        if pose in ("shocked", "plead"):
            sk.circle(mx, my, 12 * s, fill=INK)
        else:
            sk.d.ellipse((mx - 10 * s, my - 4 * s, mx + 10 * s, my + 12 * s), fill=CHEEK)

        if self.is_hoca:
            sk.poly([(head_c[0] - head_r * 0.55, head_c[1] + head_r * 0.45),
                     (head_c[0] + head_r * 0.55, head_c[1] + head_r * 0.45),
                     (head_c[0], head_c[1] + head_r * 1.45)], fill=(250, 250, 250))
        elif self.is_timur:
            sk.poly([(head_c[0] - head_r * 0.4, head_c[1] + head_r * 0.5),
                     (head_c[0] + head_r * 0.4, head_c[1] + head_r * 0.5),
                     (head_c[0], head_c[1] + head_r * 0.95)], fill=INK)

        self._headwear(sk, head_c, head_r, s)

    def _lying(self, sk, x, y, s, body_w, head_r, lw):
        sk.rrect(x - 120 * s, y - 70 * s, x + 90 * s, y - 10 * s,
                 r=int(28 * s), fill=self.shirt)
        hx = x - 150 * s
        sk.circle(hx, y - 45 * s, head_r * 0.9, fill=SKIN)
        sk.line((hx - 20 * s, y - 50 * s), (hx + 2 * s, y - 50 * s), fill=INK, width=6)
        if self.is_hoca:
            sk.ellipse(hx, y - 45 * s - head_r * 0.8, head_r * 1.3, head_r * 0.6,
                       fill=(250, 250, 250))
        sk.line((x + 60 * s, y - 20 * s), (x + 110 * s, y), fill=INK, width=lw)

    def _headwear(self, sk, head_c, head_r, s):
        hx, hy = head_c
        if self.is_hoca:
            sk.ellipse(hx, hy - head_r * 0.85, head_r * 1.5, head_r * 0.75, fill=(250, 250, 250))
            sk.ellipse(hx, hy - head_r * 1.35, head_r * 0.95, head_r * 0.5, fill=(250, 250, 250))
            return
        if self.is_timur:
            sk.ellipse(hx, hy - head_r * 0.8, head_r * 1.3, head_r * 0.6, fill=(250, 215, 90))
            sk.poly([(hx - 12 * s, hy - head_r * 1.35), (hx + 12 * s, hy - head_r * 1.35),
                     (hx, hy - head_r * 1.85)], fill=(250, 215, 90))
            return
        if self.female:
            sk.arc(hx, hy, head_r * 1.05, 150, 390, fill=(230, 120, 170),
                   width=int(head_r * 0.45))
            return
        if self.key == "guard":
            sk.arc(hx, hy - head_r * 0.1, head_r * 1.0, 180, 360,
                   fill=(150, 150, 160), width=int(head_r * 0.5))
            return
        if self.hair_style == 0:
            sk.ellipse(hx + head_r * 0.12, hy - head_r * 0.72, head_r * 0.85,
                       head_r * 0.5, fill=INK)
        elif self.hair_style == 1:
            sk.ellipse(hx, hy - head_r * 0.7, head_r * 0.95, head_r * 0.45, fill=self.hat)
            sk.ellipse(hx + head_r * 0.55, hy - head_r * 0.42, head_r * 0.5,
                       head_r * 0.16, fill=self.hat)
        else:
            sk.ellipse(hx, hy - head_r * 0.75, head_r * 1.15, head_r * 0.5,
                       fill=(245, 245, 240))

    def _arms(self, sk, x, sh_y, body_w, s, lw, pose, facing):
        L = 95 * s
        sxf = x + body_w * 0.40 * facing
        sxb = x - body_w * 0.40 * facing

        def arm(sx, ang_deg, ln=L):
            a = math.radians(ang_deg)
            ex_ = sx + math.cos(a) * ln
            ey_ = sh_y + math.sin(a) * ln
            sk.line((sx, sh_y), (ex_, ey_), fill=INK, width=lw)
            sk.circle(ex_, ey_, lw * 0.55, fill=INK)
            return ex_, ey_

        F = 0 if facing > 0 else 180
        B = 180 - F
        if pose == "point":
            arm(sxb, 90 + (25 if facing > 0 else -25))
            self.hand_pos = arm(sxf, F - 18 * facing)
        elif pose == "plead":
            self.hand_pos = arm(sxf, F - 35 * facing)
            arm(sxb, B + 35 * facing)
        elif pose == "shrug":
            arm(sxf, F - 55 * facing, L * 0.8)
            arm(sxb, B + 55 * facing, L * 0.8)
        elif pose == "facepalm":
            arm(sxb, 90 + 25 * facing)
            arm(sxf, F - 100 * facing, L * 0.72)
        elif pose == "carry":
            self.hand_pos = arm(sxf, F - 12 * facing, L * 0.85)
            arm(sxb, B + 15 * facing, L * 0.85)
        elif pose == "shocked":
            arm(sxf, F - 60 * facing)
            arm(sxb, B + 60 * facing)
        elif pose == "bow":
            arm(sxf, 90 - 35 * facing)
            arm(sxb, 90 + 35 * facing)
        elif pose == "talk":
            self.hand_pos = arm(sxf, F - 8 * facing)
            arm(sxb, 90 + 25 * facing)
        else:
            arm(sxf, 80)
            arm(sxb, 100)


def get_character(name):
    key = name.strip().lower()
    child = key.startswith("kid")
    female = key in ("wife",) or key.startswith("woman")
    return Character(key, child=child, female=female)
