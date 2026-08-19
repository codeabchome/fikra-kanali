# -*- coding: utf-8 -*-
"""koreo/gole_kos.py — GÖLE KOŞ elle koreografi (ağ adam modeli).
Her panel AYRI BİR OLAY karesi; kamera olayı gösterir, Hoca'yı değil.
build(durations, lang) -> panel listesi. durations sahne başına TTS süresi;
koreo bunları kendi beat'lerine bölüştürür (bir anlatım cümlesi = 1-2 beat).
"""
W, H = 720, 1280
GY = H - 190  # road zemini

HOCA_X, KOYLU_Y = 210, GY + 28


def P(hL, hR, fL=(-12, 70), fR=(12, 70), body=0.0, head=0.0, mouth="neutral",
      eyesWide=False, eyesClosed=False, sly=False, sqx=1.0, sqy=1.0,
      x=0, y=0, mirror=False, scale=1.6):
    return {"handL": {"x": hL[0], "y": hL[1]}, "handR": {"x": hR[0], "y": hR[1]},
            "footL": {"x": fL[0], "y": fL[1]}, "footR": {"x": fR[0], "y": fR[1]},
            "bodyAngle": body, "headTilt": head, "mouthShape": mouth,
            "eyesWide": eyesWide, "eyesClosed": eyesClosed, "sly": sly,
            "angry": False, "squashX": sqx, "squashY": sqy,
            "x": x, "y": y, "mirror": mirror, "scale": scale}


def hoca(pose):
    return {"type": "hoca", "pose": pose}


def build(durations, captions):
    """durations: 5 sahnelik TTS süreleri. Beat dağılımı:
       sahne1→2 beat, sahne2→2, sahne3→2(kıvılcım+ALEV), sahne4→2(fırlama+koşu),
       sahne5→2(nefes+PUNCH). Toplam 10 panel."""
    def split(d, r1):  # süreyi iki beat'e böl
        return d * r1, d * (1 - r1)

    p = []
    d = durations

    # ---- SAHNE 1: hanım yollar (avlu) — beat1 geniş, beat2 hanım yakın
    b1, b2 = split(d[0], 0.45)
    wife = {"type": "villager", "pose": P((30, -46), (52, -38), x=470, y=GY + 40,
                                          mirror=True, scale=1.5, mouth="talk"),
            "spec": {"skin": "#e8bd94", "skinShade": "#cf9f72",
                     "top": "#7a4a5e", "topShade": "#5a3343",
                     "vest": "#e0c060", "vestShade": "#b09338",
                     "dress": "#7a4a5e", "dressShade": "#5a3343",
                     "headwear": "yazma", "hwCol": "#c05a48", "hwCol2": "#f2ead4",
                     "hairCol": "#2b1c12", "browCol": "#3a2416",
                     "mustache": 0, "beard": 0, "female": True, "scale": 1.45,
                     "seed": 7}}
    p.append({"env": "courtyard", "warmth": 0.05, "dur": round(b1, 3),
              "caption": captions[0], "camera": {"zoom": 0.85, "fx": W/2, "fy": GY-190, "rot": 0},
              "actors": [hoca(P((-26, -4), (26, -8), x=HOCA_X, y=GY+30, scale=1.55, head=0.06)), wife],
              "props": []})
    p.append({"env": "courtyard", "warmth": 0.05, "dur": round(b2, 3),
              "caption": captions[0], "camera": {"zoom": 1.55, "fx": 470, "fy": GY-230, "rot": 0.015},
              "actors": [wife,
                         hoca(P((-26, -4), (26, -8), x=HOCA_X, y=GY+30, scale=1.55, head=0.06))],
              "props": []})

    # ---- SAHNE 2: yükleme (yol) — beat1 eşek+yük GENİŞ, beat2 Hoca ipi bağlar yakın
    b1, b2 = split(d[1], 0.55)
    donkey_loaded = {"type": "donkeyEx", "x": 430, "y": GY - 24, "scale": 1.45,
                     "dir": 1, "run": 0, "load": "thorn"}
    p.append({"env": "road", "warmth": 0.1, "dur": round(b1, 3),
              "caption": captions[1], "camera": {"zoom": 0.9, "fx": W/2+30, "fy": GY-170, "rot": 0},
              "actors": [hoca(P((44, -30), (58, -44), x=200, y=GY+26, scale=1.5, mouth="neutral"))],
              "props": [donkey_loaded]})
    p.append({"env": "road", "warmth": 0.1, "dur": round(b2, 3),
              "caption": captions[1], "camera": {"zoom": 1.5, "fx": 400, "fy": GY-140, "rot": -0.015},
              "actors": [hoca(P((40, -36), (62, -52), x=250, y=GY+26, scale=1.5, head=0.12))],
              "props": [donkey_loaded]})

    # ---- SAHNE 3: merak + KIVILCIM — beat1 Hoca düşünür yakın, beat2 kav yaklaşır (spark makro)
    b1, b2 = split(d[2], 0.5)
    p.append({"env": "road", "warmth": 0.14, "dur": round(b1, 3),
              "caption": captions[2], "camera": {"zoom": 1.45, "fx": 240, "fy": GY-250, "rot": 0.01},
              "actors": [hoca(P((-20, -10), (18, -92), x=240, y=GY+26, scale=1.5,
                               head=0.14, sly=True))],
              "props": [donkey_loaded]})
    p.append({"env": "road", "warmth": 0.16, "dur": round(b2, 3),
              "caption": captions[2], "camera": {"zoom": 1.9, "fx": 402, "fy": GY-118, "rot": 0.03},
              "actors": [hoca(P((30, -20), (78, -34), x=252, y=GY+26, scale=1.5, head=0.1))],
              "props": [donkey_loaded, {"type": "spark", "x": 395, "y": GY-96}]})

    # ---- SAHNE 4: ALEV + FIRLAMA — beat1 alev patlar (squash şok), beat2 eşek koşarken
    b1, b2 = split(d[3], 0.45)
    p.append({"env": "road", "warmth": 0.2, "dur": round(b1, 3),
              "caption": captions[3], "camera": {"zoom": 1.3, "fx": 430, "fy": GY-150, "rot": 0.045},
              "actors": [hoca(P((-34, -60), (34, -60), x=210, y=GY+26, scale=1.5,
                               mouth="shout", eyesWide=True, sqx=0.94, sqy=1.06))],
              "props": [{"type": "donkeyEx", "x": 430, "y": GY-24, "scale": 1.45,
                         "dir": 1, "run": 0.4, "panic": True, "load": "fire"},
                        {"type": "smoke", "x": 400, "y": GY-120, "n": 3}]})
    p.append({"env": "road", "warmth": 0.22, "dur": round(b2, 3),
              "caption": captions[3], "camera": {"zoom": 1.05, "fx": W/2+40, "fy": GY-140, "rot": -0.03},
              "actors": [hoca(P((-44, -46), (46, -50), x=130, y=GY+26, scale=1.4,
                               mouth="shout", eyesWide=True, body=0.16,
                               fL=(-26, 66), fR=(20, 60)))],
              "props": [{"type": "donkeyEx", "x": 520, "y": GY-30, "scale": 1.4,
                         "dir": 1, "run": 1, "panic": True, "load": "fire"},
                        {"type": "smoke", "x": 430, "y": GY-110, "n": 4}]})

    # ---- SAHNE 5: nefes + PUNCH — beat1 uzakta göl + minik alevli eşek, beat2 Hoca bağırır
    b1, b2 = split(d[4], 0.42)
    p.append({"env": "road", "warmth": 0.3, "noTree": True, "dur": round(b1, 3),
              "caption": captions[4], "camera": {"zoom": 0.85, "fx": W/2+40, "fy": GY-260, "rot": 0},
              "actors": [hoca(P((-30, -22), (12, -80), x=150, y=GY+26, scale=1.45,
                               body=0.2, head=0.18, mouth="neutral", eyesClosed=True))],
              "props": [{"type": "lake_far", "x": 560, "y": GY-368},
                        {"type": "donkeyEx", "x": 520, "y": GY-330, "scale": 0.5,
                         "dir": 1, "run": 1, "panic": True, "load": "fire"},
                        {"type": "smoke", "x": 470, "y": GY-350, "n": 3}]})
    p.append({"env": "road", "warmth": 0.34, "noTree": True, "dur": round(b2, 3),
              "caption": captions[5], "punch": True,
              "camera": {"zoom": 1.42, "fx": 330, "fy": GY-300, "rot": 0.03},
              "actors": [hoca(P((-40, -66), (48, -70), x=178, y=GY+26, scale=1.5,
                               mouth="shout", eyesWide=True, head=-0.08))],
              "props": [{"type": "lake_far", "x": 560, "y": GY-372},
                        {"type": "donkeyEx", "x": 520, "y": GY-336, "scale": 0.46,
                         "dir": 1, "run": 1, "panic": True, "load": "fire"}]})
    return p
