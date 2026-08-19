# -*- coding: utf-8 -*-
"""koreo_shots.py — OLAY ARKETIPLERI (kadraj kutuphanesi).

Her arketip = elle tasarlanmis bir OLAY karesi paketi (kamera + poz + efekt).
Otomatik stager bunlari sirayla dizerek "her olay ayri kare" kuralini
yapisal olarak uygular: hicbir sahne ust uste ayni kadrajla gecmez.

Kullanim: SHOT_<ad>(ctxinfo) -> panel dict
ctxinfo: {env, gy, actors_spec, warmth, dur, caption, night, props}
"""
from pipeline_v3.koreo_base import (W, H, GY, P, calm, talk, point, shout, shock,
                                    plead, sly_smile, laugh, carry, facepalm,
                                    lying, hoca, man, wife, timur, kid,
                                    panel, cam, head_y, beats,
                                    spec_man, spec_wife, spec_timur, spec_kid)

# ---- sahnedeki duruş noktaları (kadraj tipine göre) ----
def slots(env, n, tight=False):
    gy = GY[env]
    if n <= 1:
        return [(W * 0.44, gy + 26, False, 1.55)]
    if n == 2:
        if tight:
            return [(W * 0.33, gy + 26, False, 1.5), (W * 0.66, gy + 20, True, 1.45)]
        return [(W * 0.28, gy + 26, False, 1.5), (W * 0.70, gy + 18, True, 1.45)]
    out = [(W * 0.24, gy + 28, False, 1.45), (W * 0.58, gy + 16, True, 1.38)]
    for i in range(2, n):
        out.append((W * (0.86 if i == 2 else 0.10), gy - 30, i != 3, 1.15))
    return out


def _mk(actor_spec, pose_fn, x, y, mirror, scale, **kw):
    """actor_spec: ('hoca',) | ('man', idx) | ('wife',) | ('timur',) | ('kid',)"""
    pose = pose_fn(x=x, y=y, mirror=mirror, scale=scale, **kw)
    kind = actor_spec[0]
    if kind == "hoca":
        return hoca(pose)
    if kind == "wife":
        return wife(pose, scale)
    if kind == "timur":
        return timur(pose, scale)
    if kind == "kid":
        return kid(pose, scale * 0.7)
    return man(pose, actor_spec[1] if len(actor_spec) > 1 else 0, scale)


# ================= ARKETIPLER =================
# Her biri (env, gy, cast, poses, warmth, dur, caption, extra) alir, panel doner.

def SHOT_wide_setup(env, cast, poses, dur, cap, warmth=0.06, props=None, night=False):
    """GENIS KURULUM — mekan + herkes. Fikranin acilisi."""
    gy = GY[env]
    pos = slots(env, len(cast))
    actors = [_mk(cast[i], poses[i], *pos[i][:3], pos[i][3]) for i in range(len(cast))]
    return panel(env, dur, cap, cam(0.8, W / 2, gy - 210), actors, props, warmth, night=night)


def SHOT_two_shot(env, cast, poses, dur, cap, warmth=0.12, props=None, night=False):
    """IKILI ORTA PLAN — diyalog/karsilikli olay."""
    gy = GY[env]
    pos = slots(env, len(cast), tight=True)
    actors = [_mk(cast[i], poses[i], *pos[i][:3], pos[i][3]) for i in range(len(cast))]
    mid = (pos[0][0] + pos[1][0]) / 2 if len(pos) > 1 else pos[0][0]
    return panel(env, dur, cap, cam(1.12, mid, gy - 150, -0.012), actors, props, warmth, night=night)


def SHOT_reaction_cu(env, cast, poses, dur, cap, who=1, warmth=0.16, props=None, night=False):
    """TEPKI YAKIN PLANI — sasiran/bagiran kisiye kamera."""
    gy = GY[env]
    pos = slots(env, len(cast), tight=True)
    idx = min(who, len(cast) - 1)
    actors = [_mk(cast[i], poses[i], *pos[i][:3], pos[i][3]) for i in range(len(cast))]
    x, y, mir, sc = pos[idx]
    return panel(env, dur, cap,
                 cam(1.62, x, head_y(y, sc, 44), 0.022 if not mir else -0.022),
                 actors, props, warmth, night=night)


def SHOT_object_macro(env, cast, poses, dur, cap, obj_xy, warmth=0.14,
                      props=None, night=False, rot=0.03):
    """NESNE MAKRO — olayin merkezindeki esya (kazan, kasik, ates, para...)."""
    gy = GY[env]
    pos = slots(env, len(cast))
    actors = [_mk(cast[i], poses[i], *pos[i][:3], pos[i][3]) for i in range(len(cast))]
    return panel(env, dur, cap, cam(1.95, obj_xy[0], obj_xy[1], rot),
                 actors, props, warmth, night=night)


def SHOT_impact(env, cast, poses, dur, cap, focus_xy, warmth=0.22,
                props=None, night=False):
    """DARBE ANI — patlama/dusme/carpma. Dutch aci + orta-yakin."""
    gy = GY[env]
    pos = slots(env, len(cast))
    actors = [_mk(cast[i], poses[i], *pos[i][:3], pos[i][3]) for i in range(len(cast))]
    return panel(env, dur, cap, cam(1.32, focus_xy[0], focus_xy[1], 0.045),
                 actors, props, warmth, night=night)


def SHOT_chase(env, cast, poses, dur, cap, warmth=0.24, props=None, night=False):
    """KACIS/TAKIP — genis, ters dutch, hareket hissi."""
    gy = GY[env]
    pos = slots(env, len(cast))
    actors = [_mk(cast[i], poses[i], *pos[i][:3], pos[i][3]) for i in range(len(cast))]
    return panel(env, dur, cap, cam(1.0, W / 2 + 40, gy - 150, -0.03),
                 actors, props, warmth, night=night)


def SHOT_crowd(env, cast, poses, dur, cap, warmth=0.18, props=None, night=False):
    """KALABALIK — 3+ kisi, hafif yukseklikten genis."""
    gy = GY[env]
    pos = slots(env, len(cast))
    actors = [_mk(cast[i], poses[i], *pos[i][:3], pos[i][3]) for i in range(len(cast))]
    return panel(env, dur, cap, cam(0.9, W / 2, gy - 200, 0.01),
                 actors, props, warmth, night=night)


def SHOT_far_reveal(env, cast, poses, dur, cap, warmth=0.28, props=None,
                    night=False, noTree=True):
    """UZAK ACIKLAMA — olayin sonucunu ufukta gosterir (kacan esek, gol...)."""
    gy = GY[env]
    pos = slots(env, len(cast))
    actors = [_mk(cast[i], poses[i], *pos[i][:3], pos[i][3]) for i in range(len(cast))]
    return panel(env, dur, cap, cam(0.84, W / 2 + 30, gy - 300), actors, props,
                 warmth, night=night, noTree=noTree)


def SHOT_punch(env, cast, poses, dur, cap, warmth=0.34, props=None,
               night=False, noTree=False, zoom=1.72):
    """PUNCHLINE — Hoca'ya extreme close, dutch, en sicak isik."""
    gy = GY[env]
    pos = slots(env, len(cast))
    actors = [_mk(cast[i], poses[i], *pos[i][:3], pos[i][3]) for i in range(len(cast))]
    x, y, mir, sc = pos[0]
    return panel(env, dur, cap,
                 cam(zoom, x + (30 if not mir else -30), head_y(y, sc, 46), 0.033),
                 actors, props, warmth, punch=True, night=night, noTree=noTree)
