# -*- coding: utf-8 -*-
"""KAZAN DOGURDU — olay bazli koreografi (10 panel)."""
from pipeline_v3.koreo_base import *

GYC = GY["courtyard"]
HX, NX = 200, 500


def build(durations, captions):
    d = durations
    p = []

    # S1: kazan odunc alinir — (a) genis avlu, (b) KAZAN yakin plan
    b = beats(d[0], 5, 4)
    p.append(panel("courtyard", b[0], captions[0],
        cam(0.86, W/2, GYC-200),
        [hoca(carry(x=HX, y=GYC+30, scale=1.5, head=0.06)),
         man(talk(x=NX, y=GYC+26, mirror=True, scale=1.42), 0)],
        [{"type": "kazan", "x": 355, "y": GYC-6, "scale": 1.25}], warmth=0.05))
    p.append(panel("courtyard", b[1], captions[0],
        cam(1.85, 355, GYC-40, -0.02),
        [hoca(carry(x=HX, y=GYC+30, scale=1.5))],
        [{"type": "kazan", "x": 355, "y": GYC-6, "scale": 1.25}], warmth=0.06))

    # S2: iade + "kazanin dogurdu" — (a) kucuk tencere MAKRO, (b) komsu sasirir
    b = beats(d[1], 4, 5)
    p.append(panel("courtyard", b[0], captions[1],
        cam(2.0, 360, GYC-58, 0.03),
        [],
        [{"type": "kazan", "x": 360, "y": GYC-6, "scale": 1.3, "hasBaby": True}],
        warmth=0.1))
    p.append(panel("courtyard", b[1], captions[1],
        cam(1.5, NX, head_y(GYC+26, 1.42, 40), 0.02),
        [man(P((-30, -58), (32, -58), mouth="shout", eyesWide=True,
               x=NX, y=GYC+26, mirror=True, scale=1.42), 0),
         hoca(sly_smile(x=HX, y=GYC+30, scale=1.5))],
        [{"type": "kazan", "x": 360, "y": GYC-6, "scale": 1.25, "hasBaby": True}],
        warmth=0.12))

    # S3: komsu sevincle kabul eder — (a) iki kap birlikte, (b) komsu kaplari alir
    b = beats(d[2], 4, 5)
    p.append(panel("courtyard", b[0], captions[2],
        cam(1.25, 380, GYC-90, -0.015),
        [man(laugh(x=NX+40, y=GYC+26, mirror=True, scale=1.42), 0)],
        [{"type": "kazan", "x": 340, "y": GYC-6, "scale": 1.3, "hasBaby": True}],
        warmth=0.14))
    p.append(panel("courtyard", b[1], captions[2],
        cam(1.35, 430, GYC-120, 0.02),
        [man(carry(x=NX-10, y=GYC+26, mirror=True, scale=1.42), 0),
         hoca(calm(x=HX-30, y=GYC+30, scale=1.45, sly=True))],
        [{"type": "kazan", "x": 355, "y": GYC-70, "scale": 1.15, "hasBaby": True}],
        warmth=0.15))

    # S4: ikinci odunc, kazan donmez — (a) bos avlu genis, (b) komsu kapida
    b = beats(d[3], 4, 5)
    p.append(panel("courtyard", b[0], captions[3],
        cam(0.88, W/2+20, GYC-210),
        [hoca(calm(x=HX, y=GYC+30, scale=1.5, head=0.1))],
        [{"type": "kazan", "x": 470, "y": GYC-6, "scale": 1.2}], warmth=0.18))
    p.append(panel("courtyard", b[1], captions[3],
        cam(1.45, 430, head_y(GYC+26, 1.42, 46), -0.02),
        [man(plead(x=NX, y=GYC+26, mirror=True, scale=1.42), 0),
         hoca(calm(x=HX+40, y=GYC+30, scale=1.5))],
        [], warmth=0.2))

    # S5: "kazan oldu" + PUNCH
    b = beats(d[4], 4, 6)
    p.append(panel("courtyard", b[0], captions[4],
        cam(1.4, HX+40, head_y(GYC+30, 1.5, 55), 0.015),
        [hoca(P((-22, -14), (30, -18), mouth="neutral", head=0.16,
                x=HX+30, y=GYC+30, scale=1.5)),
         man(P((-28, -54), (30, -54), mouth="shout", eyesWide=True,
               x=NX, y=GYC+26, mirror=True, scale=1.42), 0)],
        [], warmth=0.26))
    p.append(panel("courtyard", b[1], captions[5],
        cam(1.7, HX+46, head_y(GYC+30, 1.5, 44), 0.032),
        [hoca(sly_smile(x=HX+30, y=GYC+30, scale=1.5))],
        [], warmth=0.32, punch=True))
    return p
