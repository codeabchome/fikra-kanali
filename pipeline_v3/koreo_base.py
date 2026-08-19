# -*- coding: utf-8 -*-
"""koreo_base.py — koreografi yardimcilari (tum koreo dosyalari bunu kullanir)."""
W, H = 720, 1280
GY_ROAD = H - 190
GY_COURT = H - 240
GY_INT = H - 190
GY_BAZ = H - 230
GY_PAL = H - 210
GY_LAKE = H - 250

GY = {"road": GY_ROAD, "courtyard": GY_COURT, "interior": GY_INT,
      "bazaar": GY_BAZ, "palace": GY_PAL, "lakeside": GY_LAKE}


def P(hL, hR, fL=(-12, 70), fR=(12, 70), body=0.0, head=0.0, mouth="neutral",
      eyesWide=False, eyesClosed=False, sly=False, angry=False,
      sqx=1.0, sqy=1.0, x=0, y=0, mirror=False, scale=1.5):
    return {"handL": {"x": hL[0], "y": hL[1]}, "handR": {"x": hR[0], "y": hR[1]},
            "footL": {"x": fL[0], "y": fL[1]}, "footR": {"x": fR[0], "y": fR[1]},
            "bodyAngle": body, "headTilt": head, "mouthShape": mouth,
            "eyesWide": eyesWide, "eyesClosed": eyesClosed, "sly": sly,
            "angry": angry, "squashX": sqx, "squashY": sqy,
            "x": x, "y": y, "mirror": mirror, "scale": scale}


# hazir poz kaliplari (olay anlarinda kullanilir)
def calm(**kw):    return P((-26, -4), (26, -8), **kw)
def talk(**kw):    return P((-24, -2), (46, -40), mouth="talk", head=-0.04, **kw)
def point(**kw):   return P((-26, -4), (58, -50), mouth="talk", head=-0.06, **kw)
def shout(**kw):   return P((-42, -56), (46, -58), mouth="shout", eyesWide=True, **kw)
def shock(**kw):   return P((-34, -60), (34, -60), mouth="shout", eyesWide=True,
                            sqx=0.94, sqy=1.06, **kw)
def plead(**kw):   return P((22, -52), (50, -38), mouth="talk", eyesWide=True, **kw)
def sly_smile(**kw): return P((-24, -8), (52, -46), mouth="smile", sly=True, **kw)
def laugh(**kw):   return P((-16, -30), (18, -32), mouth="smile", eyesClosed=True,
                            head=0.2, body=-0.06, **kw)
def carry(**kw):   return P((34, -28), (48, -22), **kw)
def facepalm(**kw):return P((-24, -6), (10, -96), eyesClosed=True, head=0.16, **kw)
def lying(**kw):   return P((-40, 10), (30, -10), fL=(-46, 30), fR=(20, 24),
                            body=1.25, head=-0.3, eyesClosed=True, **kw)


def hoca(pose): return {"type": "hoca", "pose": pose}


# ---- hazir karakter spec'leri (fabrikadan sabitlenmis, tutarli gorunum) ----
def spec_wife(scale=1.45):
    return {"skin": "#e8bd94", "skinShade": "#cf9f72", "top": "#7a4a5e",
            "topShade": "#5a3343", "vest": "#e0c060", "vestShade": "#b09338",
            "dress": "#7a4a5e", "dressShade": "#5a3343", "headwear": "yazma",
            "hwCol": "#c05a48", "hwCol2": "#f2ead4", "hairCol": "#2b1c12",
            "browCol": "#3a2416", "mustache": 0, "beard": 0, "female": True,
            "scale": scale, "seed": 7}

def spec_man(i=0, scale=1.45):
    pals = [
        ("#dba374", "#bd8557", "#d9c9a3", "#b8a67e", "#5b7a5b", "#3f5a3f",
         "#4a5568", "#353e4d", "takke", "#8a5a3a", "#5f3a22"),
        ("#d19a6b", "#b07f50", "#c9d4de", "#a4b2c0", "#7a5b6e", "#5a3f50",
         "#5e4a3a", "#443428", "sarik", "#e8e2d0", "#c6bfa8"),
        ("#e3b287", "#c9986d", "#d9b8a3", "#b8957e", "#5b6a8a", "#3f4c66",
         "#3f5a50", "#2c4038", "fes", "#a33d30", "#7a2a20"),
        ("#e8bd94", "#cf9f72", "#c4d0b0", "#a0ad8a", "#8a6a4a", "#66492c",
         "#6a4a5e", "#4c3343", "takke", "#5a6a8a", "#3c4a66"),
    ]
    p = pals[i % len(pals)]
    return {"skin": p[0], "skinShade": p[1], "top": p[2], "topShade": p[3],
            "vest": p[4], "vestShade": p[5], "salvar": p[6], "salvarShade": p[7],
            "headwear": p[8], "hwCol": p[9], "hwCol2": p[10],
            "hairCol": "#2b1c12", "browCol": "#2b1c12",
            "mustache": 1 + (i % 2), "beard": 1 if i % 3 == 0 else 0,
            "scale": scale, "seed": 11 + i * 13}

def spec_timur(scale=1.5):
    return {"skin": "#d9a878", "skinShade": "#ba8a5c", "top": "#8a2f2f",
            "topShade": "#661f1f", "vest": "#a33d30", "vestShade": "#7a2a20",
            "kusak": "#e0c060", "kusakShade": "#b09338", "salvar": "#5e2a2a",
            "salvarShade": "#421c1c", "headwear": "crown_sarik",
            "hwCol": "#efe6cf", "hwCol2": "#e0c060", "hairCol": "#1f1712",
            "browCol": "#1f1712", "mustache": 2, "beard": 1,
            "scale": scale, "seed": 3}

def spec_kid(scale=1.0):
    return {"skin": "#e8bd94", "skinShade": "#cf9f72", "top": "#c4d0b0",
            "topShade": "#a0ad8a", "vest": None, "vestShade": None,
            "salvar": "#5e4a3a", "salvarShade": "#443428", "headwear": "takke",
            "hwCol": "#a33d30", "hwCol2": "#7a2a20", "hairCol": "#2b1c12",
            "browCol": "#2b1c12", "mustache": 0, "beard": 0,
            "scale": scale, "seed": 29}


def man(pose, i=0, scale=1.45):
    return {"type": "villager", "pose": pose, "spec": spec_man(i, scale)}

def wife(pose, scale=1.45):
    return {"type": "villager", "pose": pose, "spec": spec_wife(scale)}

def timur(pose, scale=1.5):
    return {"type": "villager", "pose": pose, "spec": spec_timur(scale)}

def kid(pose, scale=1.0):
    return {"type": "villager", "pose": pose, "spec": spec_kid(scale)}


def panel(env, dur, caption, cam, actors, props=None, warmth=0.1,
          punch=False, night=False, noTree=False):
    d = {"env": env, "warmth": warmth, "dur": round(dur, 3), "caption": caption,
         "camera": cam, "actors": actors, "props": props or []}
    if punch: d["punch"] = True
    if night: d["night"] = True
    if noTree: d["noTree"] = True
    return d


def cam(zoom, fx, fy, rot=0.0):
    return {"zoom": zoom, "fx": fx, "fy": fy, "rot": rot}


def head_y(gy, scale, offset=0):
    """karakterin kafa hizasi (kamera odagi icin)"""
    return gy - 186 * scale + offset


def beats(dur, *ratios):
    """bir sahnenin suresini beat'lere bol"""
    tot = sum(ratios)
    return [dur * r / tot for r in ratios]
