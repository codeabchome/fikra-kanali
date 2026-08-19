# -*- coding: utf-8 -*-
"""autostager.py — HERHANGI bir senaryoyu olay-bazli kadraj dizisine cevirir.

Kural: her anlatim sahnesi 2 panele bolunur —
  (a) OLAY karesi   : ne oluyor (nesne/darbe/kacis/kalabalik)
  (b) TEPKI karesi  : kim ne yapiyor (yakin plan/ikili)
ve ardisik paneller ASLA ayni kadraj tipini tekrarlamaz.
Boylece "durmadan Hoca'yi gosterme" sorunu yapisal olarak cozulur.
"""
from pipeline_v3 import koreo_shots as S
from pipeline_v3.koreo_base import (W, H, GY, calm, talk, point, shout, shock,
                                    plead, sly_smile, laugh, carry, facepalm, lying)

ENV_MAP = {
    "village_square": ("courtyard", False), "mosque_courtyard": ("courtyard", False),
    "home_door": ("courtyard", False), "street_day": ("courtyard", False),
    "street_night": ("courtyard", True), "inn_exterior_night": ("courtyard", True),
    "home_interior": ("interior", False), "feast_hall": ("interior", False),
    "bedroom_night": ("interior", True), "inn_interior": ("interior", True),
    "barn_interior": ("interior", False),
    "bazaar": ("bazaar", False), "butcher_shop": ("bazaar", False),
    "palace_tent": ("palace", False), "castle_wall": ("palace", True),
    "riverside": ("lakeside", False),
    "village_road": ("road", False), "hill_road": ("road", False),
    "mountain_road": ("road", False), "forest_road": ("road", False),
    "forest": ("road", False),
}

POSE_FN = {"calm": calm, "talk": talk, "point": point, "shout": shout,
           "shock": shock, "plead": plead, "sly": sly_smile, "laugh": laugh,
           "carry": carry, "facepalm": facepalm, "lying": lying}


def pose_of(action, is_actor, last=False):
    a = action.lower()
    def has(*k): return any(x in a for x in k)
    if not is_actor:
        if has("shock", "erupt", "scatter", "startle"): return shock
        if has("laugh", "mock"): return laugh
        if has("plead", "beg", "worried"): return plead
        if has("point", "announce"): return point
        return calm
    if last: return sly_smile
    if has("lie", "faint", "dead", "dazed", "sleep"): return lying
    if has("shout", "erupt", "protest"): return shout
    if has("shock", "startle", "freez", "amaz", "panic", "confus", "jaw"): return shock
    if has("plead", "beg", "pray", "ask", "surround"): return plead
    if has("facepalm"): return facepalm
    if has("laugh", "mock"): return laugh
    if has("point", "announce"): return point
    if has("carry", "load", "hand", "buys", "wrap", "hold", "dip", "shrug"): return carry
    if has("deadpan", "calm", "serene", "idle", "watch", "listen"): return calm
    return talk


def cast_of(chars):
    """senaryo isimlerini arketip cast'ine cevir"""
    out = []
    gi = 0
    for c in chars[:4]:
        k = c.strip().lower()
        if k == "hoca":
            out.append(("hoca",))
        elif k in ("wife", "woman") or k.startswith("woman"):
            out.append(("wife",))
        elif k == "timur":
            out.append(("timur",))
        elif k.startswith("kid"):
            out.append(("kid",))
        else:
            out.append(("man", gi))
            gi += 1
    return out or [("hoca",)]


# hangi propa hangi olay karesi yakisir
IMPACT_WORDS = ("fire", "burn", "flame", "crash", "fall", "broken", "snap", "smash")
CHASE_WORDS = ("run", "bolt", "chase", "flee", "escape", "scatter")
MACRO_PROPS = {"kazan": "kazan", "soup_pot": "kazan", "coin": "bowl", "bowl": "bowl",
               "soup_bowls": "bowl", "water_jug": "bowl"}


def build_panels(scenes, durations, captions):
    panels = []
    n = len(scenes)
    prev_kind = None
    for i, sc in enumerate(scenes):
        env, night = ENV_MAP.get(sc.env.strip().lower(), ("courtyard", False))
        gy = GY[env]
        cast = cast_of(sc.chars or ["hoca"])
        last = (i == n - 1)
        act = sc.action.lower()
        plist = [p.lower() for p in sc.props]
        poses = [pose_of(act, j == 0, last and j == 0) for j in range(len(cast))]

        # sahne suresini iki beat'e bol
        d1 = durations[i] * 0.52
        d2 = durations[i] - d1
        cap = captions[i]

        # ---- (a) OLAY karesi: icerige gore arketip sec ----
        props = []
        macro_xy = None
        for p in plist:
            if p in MACRO_PROPS:
                t = MACRO_PROPS[p]
                px, py = W * 0.62, gy - 10
                props.append({"type": t, "x": px, "y": py, "scale": 1.2})
                macro_xy = (px, py - 30)
                break
        if any(w in act for w in IMPACT_WORDS) or any(w in " ".join(plist) for w in IMPACT_WORDS):
            a = S.SHOT_impact(env, cast, poses, d1, cap, (W * 0.58, gy - 150),
                              props=props, night=night, warmth=0.06 + 0.3 * i / max(1, n - 1))
            kind = "impact"
        elif any(w in act for w in CHASE_WORDS):
            a = S.SHOT_chase(env, cast, poses, d1, cap, props=props, night=night,
                             warmth=0.06 + 0.3 * i / max(1, n - 1))
            kind = "chase"
        elif macro_xy and prev_kind != "macro":
            a = S.SHOT_object_macro(env, cast, poses, d1, cap, macro_xy,
                                    props=props, night=night,
                                    warmth=0.06 + 0.3 * i / max(1, n - 1))
            kind = "macro"
        elif len(cast) >= 3:
            a = S.SHOT_crowd(env, cast, poses, d1, cap, props=props, night=night,
                             warmth=0.06 + 0.3 * i / max(1, n - 1))
            kind = "crowd"
        elif i == 0 or prev_kind == "two":
            a = S.SHOT_wide_setup(env, cast, poses, d1, cap, props=props, night=night,
                                  warmth=0.05 + 0.3 * i / max(1, n - 1))
            kind = "wide"
        else:
            a = S.SHOT_two_shot(env, cast, poses, d1, cap, props=props, night=night,
                                warmth=0.06 + 0.3 * i / max(1, n - 1))
            kind = "two"
        panels.append(a)

        # ---- (b) TEPKI/DEVAM karesi ----
        w2 = 0.08 + 0.3 * i / max(1, n - 1)
        if last:
            panels.append(S.SHOT_punch(env, cast, poses, d2,
                                       captions[-1] if len(captions) > n else cap,
                                       props=props, night=night, warmth=0.34))
            kind = "punch"
        elif len(cast) >= 2 and kind not in ("two",):
            who = 1 if any(w in act for w in ("shock", "laugh", "plead", "shout")) else 0
            panels.append(S.SHOT_reaction_cu(env, cast, poses, d2, cap, who=who,
                                             props=props, night=night, warmth=w2))
            kind = "cu"
        elif kind in ("impact", "chase"):
            panels.append(S.SHOT_far_reveal(env, cast, poses, d2, cap,
                                            props=props, night=night, warmth=w2))
            kind = "far"
        else:
            panels.append(S.SHOT_reaction_cu(env, cast, poses, d2, cap, who=0,
                                             props=props, night=night, warmth=w2))
            kind = "cu"
        prev_kind = kind
    return panels
