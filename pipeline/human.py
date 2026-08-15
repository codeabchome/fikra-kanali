# -*- coding: utf-8 -*-
"""human.py — parametrik karakter şablonu + imza karakterler.
Her karakter draw(sk, x, y, scale, pose, t, facing) ile çizilir.
x,y = ayak hizası merkez. Pozlar aksiyon çözücüden gelir."""
import hashlib
import math

SKIN = (224, 172, 138)
INK = (35, 32, 30)

ROBES = [(106, 76, 147), (44, 110, 73), (160, 64, 52), (52, 88, 148),
         (150, 100, 40), (90, 90, 100), (170, 120, 160), (60, 120, 120)]
TURBANS = [(240, 236, 220), (200, 60, 60), (70, 130, 70), (220, 170, 60),
           (120, 160, 200), (180, 120, 170)]


def _h(name, salt=""):
    return int(hashlib.md5((name + salt).encode()).hexdigest(), 16)


class Character:
    def __init__(self, name, build="normal", beard=None, headwear=None,
                 robe=None, turban=None, big_turban=False, child=False,
                 female=False):
        h = _h(name)
        self.name = name
        self.child = child
        self.female = female
        self.build = build if build != "auto" else ["thin", "normal", "stocky"][h % 3]
        self.beard = beard if beard is not None else (h >> 3) % 3  # 0 yok,1 kısa,2 uzun
        self.robe = robe or ROBES[h % len(ROBES)]
        self.turban = turban or TURBANS[(h >> 5) % len(TURBANS)]
        self.headwear = headwear or ("turban" if not female else "scarf")
        self.big_turban = big_turban

    # ------------------------------------------------------------------
    def draw(self, sk, x, y, scale=1.0, pose="idle", t=0.0, facing=1):
        s = scale * (0.62 if self.child else 1.0)
        H = 300 * s                      # toplam boy
        head_r = (34 if not self.child else 40) * s
        bob = math.sin(t * 2 * math.pi * 1.4) * 3 * s
        if pose in ("walk", "run", "flee"):
            sp = 2.6 if pose != "run" else 4.5
            bob = abs(math.sin(t * 2 * math.pi * sp)) * 5 * s
        hip_y = y - H * 0.42 + bob
        sh_y = y - H * 0.78 + bob        # omuz
        head_c = (x, y - H * 0.88 + bob)

        wide = {"thin": 0.8, "normal": 1.0, "stocky": 1.25}[self.build]
        belly = 1.35 if self.build == "stocky" else 1.0

        if pose == "lie":
            self._draw_lying(sk, x, y, s, wide)
            return

        # bacaklar (cübbe altından kısa)
        leg_a = 0.0
        if pose in ("walk", "run", "flee"):
            sp = 2.6 if pose != "run" else 4.5
            leg_a = math.sin(t * 2 * math.pi * sp) * (14 if pose == "walk" else 24) * s
        sk.line((x - 12 * s * wide, hip_y), (x - 12 * s * wide + leg_a, y), fill=INK, width=int(6 * s) or 3)
        sk.line((x + 12 * s * wide, hip_y), (x + 12 * s * wide - leg_a, y), fill=INK, width=int(6 * s) or 3)
        # ayaklar
        sk.line((x - 12 * s * wide + leg_a, y), (x - 12 * s * wide + leg_a + 14 * s * facing, y), fill=INK, width=int(6 * s) or 3)
        sk.line((x + 12 * s * wide - leg_a, y), (x + 12 * s * wide - leg_a + 14 * s * facing, y), fill=INK, width=int(6 * s) or 3)

        # cübbe / entari
        rw = 34 * s * wide * belly
        robe_pts = [(x - rw * 0.55, sh_y), (x + rw * 0.55, sh_y),
                    (x + rw, hip_y + 26 * s), (x - rw, hip_y + 26 * s)]
        sk.poly(robe_pts, fill=self.robe, outline=INK, width=int(4 * s) or 3)
        if self.build == "stocky":  # göbek vurgusu
            sk.arc(x, sh_y + (hip_y - sh_y) * 0.62, rw * 0.72, 200, 340,
                   fill=INK, width=int(3 * s) or 2)

        # kollar
        self._arms(sk, x, sh_y, s, wide, pose, t, facing)

        # baş
        sk.circle(*head_c, head_r, fill=SKIN, outline=INK, width=int(4 * s) or 3)
        ex = head_c[0] + 10 * s * facing
        sk.d.ellipse((ex - 3 * s, head_c[1] - 6 * s, ex + 3 * s, head_c[1]), fill=INK)
        sk.d.ellipse((ex - 3 * s - 16 * s * facing, head_c[1] - 6 * s,
                      ex + 3 * s - 16 * s * facing, head_c[1]), fill=INK)
        # sakal (önce; ağız üstüne çizilecek)
        if self.beard and not self.female and not self.child:
            col = (245, 245, 245) if self.beard == 2 else (70, 55, 45)
            ln = 30 * s if self.beard == 2 else 16 * s
            sk.poly([(head_c[0] - head_r * 0.62, head_c[1] + head_r * 0.55),
                     (head_c[0] + head_r * 0.62, head_c[1] + head_r * 0.55),
                     (head_c[0] + 6 * s * facing, head_c[1] + head_r * 0.75 + ln)],
                    fill=col, outline=INK, width=int(3 * s) or 2)
        # ağız
        my = head_c[1] + head_r * 0.42
        if pose in ("shocked", "plead"):
            sk.circle(head_c[0] + 4 * s * facing, my, 6 * s, fill=(90, 40, 40), outline=INK, width=2)
        else:
            sk.arc(head_c[0] + 4 * s * facing, my - 2 * s, 8 * s, 20, 160, width=int(3 * s) or 2)
        # başlık
        self._headwear(sk, head_c, head_r, s)

    # ------------------------------------------------------------------
    def _headwear(self, sk, head_c, head_r, s):
        hx, hy = head_c
        if self.headwear == "scarf":
            sk.arc(hx, hy, head_r * 1.12, 140, 400, fill=self.turban, width=int(10 * s) or 5)
            sk.poly([(hx - head_r, hy), (hx - head_r * 0.4, hy + head_r * 1.6),
                     (hx + head_r * 0.4, hy + head_r * 1.6), (hx + head_r, hy)],
                    fill=self.turban, outline=INK, width=int(3 * s) or 2)
            sk.circle(hx, hy, head_r * 0.98, outline=INK, width=int(3 * s) or 2)
            return
        if self.headwear == "helmet":
            sk.arc(hx, hy - head_r * 0.15, head_r * 1.05, 180, 360, fill=(120, 120, 130), width=int(12 * s) or 6)
            sk.line((hx, hy - head_r * 1.2), (hx, hy - head_r * 1.7), fill=(120, 120, 130), width=int(5 * s) or 3)
            return
        # sarık / kavuk
        mult = 1.9 if self.big_turban else 1.25
        ty = hy - head_r * (0.95 if not self.big_turban else 1.15)
        sk.ellipse(hx, ty, head_r * mult, head_r * (0.62 if not self.big_turban else 0.95),
                   fill=self.turban, outline=INK, width=int(4 * s) or 3)
        sk.arc(hx, ty, head_r * mult * 0.7, 200, 340, width=int(3 * s) or 2)
        if self.big_turban:
            sk.ellipse(hx, ty - head_r * 0.5, head_r * 1.2, head_r * 0.5,
                       fill=self.turban, outline=INK, width=int(3 * s) or 2)

    # ------------------------------------------------------------------
    def _arms(self, sk, x, sh_y, s, wide, pose, t, facing):
        w = int(6 * s) or 3
        L = 52 * s
        sw = 30 * s * wide  # omuz genişliği yarısı

        def arm(side, a1_deg, a2_deg):
            sx = x + sw * side
            a1 = math.radians(a1_deg)
            ex_, ey_ = sx + math.cos(a1) * L * 0.55 * side, sh_y + math.sin(a1) * L * 0.55
            a2 = math.radians(a2_deg)
            hx_, hy_ = ex_ + math.cos(a2) * L * 0.5 * side, ey_ + math.sin(a2) * L * 0.5
            sk.line((sx, sh_y), (ex_, ey_), fill=self.robe, width=w + 4)
            sk.line((ex_, ey_), (hx_, hy_), fill=self.robe, width=w + 4)
            sk.circle(hx_, hy_, 7 * s, fill=SKIN, outline=INK, width=2)
            return hx_, hy_

        f, b = facing, -facing
        if pose == "point":
            arm(b, 70, 80)
            self.hand = arm(f, -20, -10)
        elif pose == "plead":
            arm(f, -35, -25); arm(b, -35, -25)
        elif pose == "shrug":
            arm(f, -60, -140); arm(b, -60, -140)
        elif pose == "facepalm":
            arm(b, 70, 80)
            hx_, hy_ = arm(f, -75, -120)
        elif pose == "carry":
            arm(f, -10, -60); arm(b, -10, -60)
        elif pose in ("walk", "run", "flee"):
            sp = 2.6 if pose == "walk" else 4.5
            sw_a = math.sin(t * 2 * math.pi * sp) * (25 if pose == "walk" else 45)
            arm(f, 60 + sw_a, 70 + sw_a); arm(b, 60 - sw_a, 70 - sw_a)
        elif pose == "talk":
            g = math.sin(t * 2 * math.pi * 1.8) * 12
            arm(f, 10 + g, 0 + g); arm(b, 70, 80)
        elif pose == "shocked":
            arm(f, -50, -70); arm(b, -50, -70)
        elif pose == "bow":
            arm(f, 40, 90); arm(b, 40, 90)
        else:  # idle
            arm(f, 70, 78); arm(b, 70, 78)

    def _draw_lying(self, sk, x, y, s, wide):
        # yerde yatan hâl (basit yan çizim)
        sk.ellipse(x, y - 18 * s, 90 * s, 22 * s, fill=self.robe, outline=INK, width=3)
        hx = x - 100 * s
        sk.circle(hx, y - 20 * s, 30 * s, fill=SKIN, outline=INK, width=3)
        sk.ellipse(hx - 6 * s, y - 48 * s, 34 * s, 16 * s, fill=self.turban, outline=INK, width=3)
        sk.line((hx - 12 * s, y - 24 * s), (hx - 4 * s, y - 24 * s), fill=INK, width=2)  # kapalı göz
        sk.line((hx + 2 * s, y - 24 * s), (hx + 10 * s, y - 24 * s), fill=INK, width=2)


# ---------------------------------------------------------------- imzalar
SIGNATURES = {
    "hoca": Character("hoca", build="stocky", beard=2, robe=(106, 76, 147),
                      turban=(245, 242, 230), big_turban=True),
    "wife": Character("wife", build="normal", female=True,
                      robe=(70, 90, 150), turban=(230, 200, 90)),
    "timur": Character("timur", build="stocky", beard=1,
                       robe=(180, 40, 40), turban=(250, 220, 120), big_turban=True),
    "guard": Character("guard", build="normal", beard=1, headwear="helmet",
                       robe=(90, 90, 120)),
}


def get_character(name):
    key = name.strip().lower()
    if key in SIGNATURES:
        return SIGNATURES[key]
    child = key.startswith("kid")
    female = key in ("wife", "woman", "girl") or key.startswith("woman")
    ch = Character(key, build="auto", child=child, female=female)
    if ch.beard == 2:
        ch.beard = 1  # beyaz uzun sakal Hoca'nın imzası
    return ch
