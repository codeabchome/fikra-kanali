# -*- coding: utf-8 -*-
"""panelgen.py — senaryo + TTS süreleri → sinematik episode.json
Sinematik gramer:
  * ilk sahne  : geniş kurulum (zoom ~0.68)
  * konuşma    : konuşana orta-yakın (1.25-1.4)
  * şok/bağırış: yakın plan (1.5)
  * son sahne  : punchline — extreme close (1.8) + dutch açı + sıcaklık artışı
Pozlar action anahtar kelimesinden; karakter spec'leri isimden deterministik üretilir.
"""
import hashlib
import textwrap

W, H = 720, 1280

GROUND_Y = {"lakeside": H-250, "courtyard": H-240, "interior": H-190,
            "bazaar": H-230, "palace": H-210, "road": H-190}

ENV_MAP = {
    "village_square": "courtyard", "mosque_courtyard": "courtyard",
    "home_door": "courtyard", "street_day": "courtyard",
    "street_night": ("courtyard", True), "inn_exterior_night": ("courtyard", True),
    "home_interior": "interior", "feast_hall": "interior",
    "bedroom_night": ("interior", True), "inn_interior": ("interior", True),
    "barn_interior": "interior",
    "bazaar": "bazaar", "butcher_shop": "bazaar",
    "palace_tent": "palace", "castle_wall": ("palace", True),
    "riverside": "lakeside",
    "village_road": "road", "hill_road": "road", "mountain_road": "road",
    "forest_road": "road", "forest": "road",
}

# ---- POZ KÜTÜPHANESİ (sağa bakan; mirror JS'te) ----
def P(handL, handR, footL=(-12, 70), footR=(12, 70), body=0.0, head=0.0,
      mouth="neutral", eyesWide=False, eyesClosed=False, sly=False, angry=False,
      sqx=1.0, sqy=1.0):
    return {"handL": {"x": handL[0], "y": handL[1]},
            "handR": {"x": handR[0], "y": handR[1]},
            "footL": {"x": footL[0], "y": footL[1]},
            "footR": {"x": footR[0], "y": footR[1]},
            "bodyAngle": body, "headTilt": head, "mouthShape": mouth,
            "eyesWide": eyesWide, "eyesClosed": eyesClosed, "sly": sly,
            "angry": angry, "squashX": sqx, "squashY": sqy}

POSES = {
    "idle":     P((-26, -4), (28, -6)),
    "talk":     P((-24, -2), (46, -40), head=-0.04, mouth="talk"),
    "point":    P((-26, -4), (58, -50), head=-0.06, mouth="talk"),
    "punch":    P((-24, -8), (52, -46), head=0.05, mouth="smile", sly=True),
    "plead":    P((20, -50), (48, -36), head=-0.08, mouth="talk", eyesWide=True),
    "shout":    P((-46, -52), (46, -52), head=-0.1, mouth="shout", eyesWide=True),
    "shocked":  P((-30, -62), (30, -62), head=0.06, mouth="shout", eyesWide=True, sqy=1.02),
    "shrug":    P((-42, -26), (42, -26), head=0.08, mouth="neutral"),
    "facepalm": P((-24, -6), (10, -96), head=0.16, mouth="neutral", eyesClosed=True),
    "carry":    P((32, -26), (44, -20), head=0.04),
    "laugh":    P((-16, -28), (16, -30), head=0.2, mouth="smile", eyesClosed=True, body=-0.06),
    "bow":      P((-14, 24), (18, 22), body=0.42, head=0.2),
    "smile":    P((-26, -4), (28, -6), mouth="smile"),
    "listen":   P((-26, -4), (26, -8), head=0.05),
}

def resolve_pose(action):
    a = action.lower()
    def has(*k): return any(x in a for x in k)
    if has("shout", "erupt", "protest"): return "shout"
    if has("shock", "startle", "freez", "amaz", "jaw", "panic", "confus"): return "shocked"
    if has("plead", "beg", "pray", "ask", "surround"): return "plead"
    if has("shrug"): return "shrug"
    if has("facepalm"): return "facepalm"
    if has("laugh", "mock"): return "laugh"
    if has("bow", "greet"): return "bow"
    if has("point", "announce"): return "point"
    if has("carry", "load", "hand", "buys", "wrap", "hold", "dip"): return "carry"
    if has("deadpan", "calm", "serene", "smile", "sly"): return "smile"
    if has("idle", "watch", "listen"): return "listen"
    return "talk"

def others_pose(action):
    a = action.lower()
    if any(x in a for x in ("worried", "gloomy")): return "plead"
    if any(x in a for x in ("shock", "scatter", "erupt")): return "shocked"
    if any(x in a for x in ("laugh",)): return "laugh"
    return "listen"

# ---- KARAKTER FABRİKASI SPEC'LERİ ----
SKINS = [("#e3b287", "#c9986d"), ("#dba374", "#bd8557"), ("#d19a6b", "#b07f50"),
         ("#e8bd94", "#cf9f72")]
TOPS = [("#d9c9a3", "#b8a67e"), ("#c9d4de", "#a4b2c0"), ("#d9b8a3", "#b8957e"),
        ("#c4d0b0", "#a0ad8a")]
VESTS = [("#5b7a5b", "#3f5a3f"), ("#7a5b6e", "#5a3f50"), ("#5b6a8a", "#3f4c66"),
         ("#8a6a4a", "#66492c"), (None, None)]
SALVARS = [("#4a5568", "#353e4d"), ("#5e4a3a", "#443428"), ("#3f5a50", "#2c4038"),
           ("#6a4a5e", "#4c3343")]
HEADWEAR = ["takke", "sarik", "fes", "takke", "sarik"]
HW_COLS = {"takke": [("#8a5a3a", "#5f3a22"), ("#5a6a8a", "#3c4a66"), ("#7a4a4a", "#552f2f")],
           "sarik": [("#e8e2d0", "#c6bfa8"), ("#d9c9a3", "#b5a67e")],
           "fes":   [("#a33d30", "#7a2a20"), ("#8a3a4a", "#642532")]}
HAIRS = ["#2b1c12", "#3a2a1a", "#4a3525", "#1f1712"]

def _h(name, salt=""):
    return int(hashlib.md5((name + salt).encode()).hexdigest(), 16)

def char_spec(name):
    key = name.strip().lower()
    if key == "hoca":
        return {"type": "hoca"}
    h = _h(key)
    female = key in ("wife", "woman", "girl") or key.startswith("woman")
    child = key.startswith("kid")
    if key == "timur":
        return {"type": "villager", "spec": {
            "skin": "#d9a878", "skinShade": "#ba8a5c",
            "top": "#8a2f2f", "topShade": "#661f1f",
            "vest": "#a33d30", "vestShade": "#7a2a20",
            "kusak": "#e0c060", "kusakShade": "#b09338",
            "salvar": "#5e2a2a", "salvarShade": "#421c1c",
            "headwear": "crown_sarik", "hwCol": "#efe6cf", "hwCol2": "#e0c060",
            "hairCol": "#1f1712", "browCol": "#1f1712",
            "mustache": 2, "beard": 1, "scale": 1.08, "seed": h % 97}}
    if female:
        d = [("#7a4a5e", "#5a3343"), ("#4a5e7a", "#33435a"), ("#5e7a4a", "#435a33")][h % 3]
        return {"type": "villager", "spec": {
            "skin": "#e8bd94", "skinShade": "#cf9f72",
            "top": d[0], "topShade": d[1],
            "vest": "#e0c060", "vestShade": "#b09338",
            "dress": d[0], "dressShade": d[1],
            "headwear": "yazma",
            "hwCol": ["#c05a48", "#5a8ac0", "#c09a3a"][(h >> 4) % 3], "hwCol2": "#f2ead4",
            "hairCol": "#2b1c12", "browCol": "#3a2416",
            "mustache": 0, "beard": 0, "female": True,
            "scale": 0.97, "seed": h % 97}}
    skin = SKINS[h % len(SKINS)]
    top = TOPS[(h >> 3) % len(TOPS)]
    vest = VESTS[(h >> 6) % len(VESTS)]
    sal = SALVARS[(h >> 9) % len(SALVARS)]
    hw = HEADWEAR[(h >> 12) % len(HEADWEAR)]
    hwc = HW_COLS[hw][(h >> 15) % len(HW_COLS[hw])]
    return {"type": "villager", "spec": {
        "skin": skin[0], "skinShade": skin[1],
        "top": top[0], "topShade": top[1],
        "vest": vest[0], "vestShade": vest[1],
        "salvar": sal[0], "salvarShade": sal[1],
        "headwear": hw, "hwCol": hwc[0], "hwCol2": hwc[1],
        "hairCol": HAIRS[(h >> 18) % len(HAIRS)],
        "browCol": HAIRS[(h >> 18) % len(HAIRS)],
        "mustache": 1 if (h >> 21) % 3 else 2,
        "beard": 1 if (h >> 23) % 4 == 0 else 0,
        "scale": (0.62 if child else [0.96, 1.0, 1.04][(h >> 25) % 3]),
        "seed": h % 97}}

# ---- SAHNELEME ----
def stage(chars, env):
    """(x, y, mirror, sahne_olcegi)"""
    gy = GROUND_Y[env]
    n = len(chars)
    if n == 1:
        return [(W * 0.44, gy + 30, False, 1.9)]
    if n == 2:
        return [(W * 0.28, gy + 26, False, 1.65), (W * 0.68, gy + 20, True, 1.55)]
    out = [(W * 0.24, gy + 28, False, 1.55), (W * 0.60, gy + 14, True, 1.4)]
    for i in range(2, n):
        out.append((W * (0.86 if i == 2 else 0.10), gy - 40, i != 3, 1.15))
    return out

def head_world(x, y, scale=1.0):
    return (x, y - 186 * scale)

def wrap_caption(text, punch):
    width = 20 if punch else 28
    lines = textwrap.wrap(text, width=width, break_long_words=False)
    if len(lines) > 3:
        width = max(24, len(text) // 3 + 2)
        lines = textwrap.wrap(text, width=width, break_long_words=False)
    return "\n".join(lines[:4])


def build_episode(episode, lang, durations, channel):
    """episode: parser.Episode; durations: sahne başına saniye"""
    panels = []
    scenes = episode.scenes
    n = len(scenes)
    for i, sc in enumerate(scenes):
        raw_env = ENV_MAP.get(sc.env.strip().lower(), "courtyard")
        night = False
        if isinstance(raw_env, tuple):
            raw_env, night = raw_env
        chars = sc.chars or ["hoca"]
        pos = stage(chars, raw_env)
        actor_pose = resolve_pose(sc.action)
        oth = others_pose(sc.action)
        last = (i == n - 1)
        if last:
            actor_pose = "punch"
        actors = []
        for ci, cname in enumerate(chars[:4]):
            cs = char_spec(cname)
            pose_name = actor_pose if ci == 0 else oth
            pose = dict(POSES[pose_name])
            x, y, mirror, st_scale = pos[ci]
            pose = {k: (dict(v) if isinstance(v, dict) else v) for k, v in pose.items()}
            pose["x"] = x
            pose["y"] = y
            pose["mirror"] = mirror
            actor = {"type": cs["type"], "pose": pose}
            if cs["type"] == "villager":
                spec = dict(cs["spec"])
                spec["scale"] = round(spec.get("scale", 1.0) * st_scale, 3)
                actor["spec"] = spec
                actor["_scale"] = spec["scale"]
            else:
                pose["scale"] = st_scale
                actor["_scale"] = st_scale
            actors.append(actor)
        # kamera grameri
        ax, ay, amir, _ = pos[0]
        scale0 = actors[0]["_scale"]
        hx, hy = head_world(ax, ay, scale0)
        gy = GROUND_Y[raw_env]
        if last:
            cam = {"zoom": 2.0, "fx": hx + (26 if not amir else -26) * scale0,
                   "fy": hy + 40 * scale0, "rot": 0.03}
        elif i == 0:
            cam = {"zoom": 0.82, "fx": W / 2, "fy": gy - 210, "rot": 0.0}
        elif actor_pose in ("shout", "shocked"):
            cam = {"zoom": 1.55, "fx": hx, "fy": hy + 46 * scale0,
                   "rot": 0.02 if actor_pose == "shout" else -0.015}
        elif len(chars) >= 2 and actor_pose in ("plead", "laugh"):
            mx = (pos[0][0] + pos[1][0]) / 2
            cam = {"zoom": 1.0, "fx": mx, "fy": gy - 150, "rot": 0.0}
        else:
            cam = {"zoom": 1.4, "fx": hx + (34 if not amir else -34) * scale0,
                   "fy": hy + 62 * scale0, "rot": -0.01}
        warmth = 0.05 + 0.28 * (i / max(1, n - 1))
        # proplar
        props = []
        plist = [p.lower() for p in sc.props]
        gy = GROUND_Y[raw_env]
        if any("kazan" in p or "soup_pot" in p or "pot" == p for p in plist):
            props.append({"type": "kazan", "x": W * 0.5, "y": gy - 20, "scale": 1.0,
                          "hasBaby": any("baby" in p or "tencere" in p for p in plist)})
        if any(p in ("bowl", "soup_bowls", "water_jug") for p in plist):
            props.append({"type": "bowl", "x": ax + 66, "y": gy - 6, "scale": 1.0})
        for a in actors:
            a.pop("_scale", None)
        panels.append({
            "env": raw_env, "night": night, "warmth": round(warmth, 3),
            "dur": round(durations[i], 3),
            "caption": wrap_caption(sc.lines.get(lang) or sc.lines.get("EN") or "", last),
            "punch": last, "camera": cam, "actors": actors, "props": props,
        })
    return {
        "lang": lang, "channel": channel,
        "introDur": 0.9, "outroDur": 1.8,
        "outroTitle": "BEGENDIYSEN" if lang == "EN" else "BE\u011eEND\u0130YSEN",
        "outroSub": "SUBSCRIBE!" if lang == "EN" else "ABONE OL!",
        "panels": panels,
    }
