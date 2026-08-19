# -*- coding: utf-8 -*-
"""YA TUTARSA — olay bazli koreografi (10 panel, gol kiyisi)."""
from pipeline_v3.koreo_base import *

GYL = GY["lakeside"]
HX, KX = 180, 520
DIP_X, DIP_Y = 150, H - 360


def crouch(**kw):
    """comelmis poz: ayaklar govde altinda-kisa; govde one egik"""
    return P((-44, 22), (-22, 2), fL=(2, 52), fR=(16, 50),
             body=0.30, head=0.30, **kw)


def build(durations, captions):
    d = durations
    p = []

    # S1: Hoca kiyida mayaliyor — (a) genis gol, (b) KASIK suya deger MAKRO
    b = beats(d[0], 5, 4)
    p.append(panel("lakeside", b[0], captions[0],
        cam(0.78, W/2, GYL-300),
        [hoca(crouch(x=HX, y=GYL-6, scale=1.5))],
        [{"type": "bowl", "x": HX+64, "y": GYL+16, "scale": 1.1}], warmth=0.04))
    p.append(panel("lakeside", b[1], captions[0],
        cam(1.85, HX-40, GYL-190, -0.02),
        [hoca(crouch(x=HX, y=GYL-6, scale=1.5))],
        [{"type": "bowl", "x": HX+64, "y": GYL+16, "scale": 1.1},
         {"type": "spark", "x": HX-58, "y": GYL-176}], warmth=0.05))

    # S2: koylu gelir, sasirir — (a) koylu yolda, (b) koylu bakakalir yakin
    b = beats(d[1], 4, 5)
    p.append(panel("lakeside", b[0], captions[1],
        cam(1.0, (HX+KX)/2, GYL-170),
        [hoca(crouch(x=HX, y=GYL-6, scale=1.5)),
         man(calm(x=KX, y=GYL+14, mirror=True, scale=1.4), 1)],
        [{"type": "bowl", "x": HX+64, "y": GYL+16, "scale": 1.1}], warmth=0.08))
    p.append(panel("lakeside", b[1], captions[1],
        cam(1.6, KX, head_y(GYL+14, 1.4, 40), 0.02),
        [man(P((-30, -56), (32, -56), mouth="shout", eyesWide=True,
               x=KX, y=GYL+14, mirror=True, scale=1.4), 1)],
        [], warmth=0.1))

    # S3: Hoca aciklar — (a) Hoca yakin (kasik havada), (b) gol genis (absurt olcek)
    b = beats(d[2], 5, 4)  # 3. sahne
    p.append(panel("lakeside", b[0], captions[2],
        cam(1.5, HX+10, GYL-120, -0.015),
        [hoca(P((-48, 0), (-26, -16), fL=(-16, 44), fR=(14, 42),
                body=0.12, head=-0.04, mouth="talk", x=HX, y=GYL-6, scale=1.5))],
        [{"type": "bowl", "x": HX+64, "y": GYL+16, "scale": 1.1}], warmth=0.14))
    p.append(panel("lakeside", b[1], captions[2],
        cam(0.74, W/2, GYL-330),
        [hoca(crouch(x=HX, y=GYL-6, scale=1.45)),
         man(calm(x=KX, y=GYL+14, mirror=True, scale=1.35), 1)],
        [], warmth=0.16))

    # S4: koylu guler + PUNCH ayni sahnede
    b = beats(d[3], 4, 3, 5)
    p.append(panel("lakeside", b[0], captions[3],
        cam(1.4, KX-20, head_y(GYL+14, 1.4, 56), 0.03),
        [man(laugh(x=KX, y=GYL+14, mirror=True, scale=1.4), 1),
         hoca(crouch(x=HX, y=GYL-6, scale=1.45))],
        [], warmth=0.2))
    p.append(panel("lakeside", b[1], captions[3],
        cam(1.55, HX+6, GYL-150, -0.02),
        [hoca(P((-34, -46), (-20, -14), fL=(-16, 44), fR=(14, 42),
                body=0.02, head=-0.02, x=HX, y=GYL-6, scale=1.5))],
        [{"type": "spark", "x": HX-30, "y": GYL-92}], warmth=0.22))

    p.append(panel("lakeside", b[2], captions[-1],
        cam(1.75, HX+16, GYL-206, 0.035),
        [hoca(P((-32, -52), (-16, -12), fL=(-16, 44), fR=(14, 42),
                mouth="smile", sly=True, head=0.06, x=HX, y=GYL-6, scale=1.5))],
        [], warmth=0.36, punch=True))
    return p
