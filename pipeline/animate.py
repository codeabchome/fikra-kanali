# -*- coding: utf-8 -*-
"""animate.py — v2: STATIK sahne resmi (Paint Terk).
Her sahne = TEK resim: duz canli arka plan + karakterler + isim etiketleri
+ elle cizilmis beyaz konusma balonu (BEN/BTR satirindan). Hareket yok."""
import math
import os

from PIL import Image, ImageDraw, ImageFont

from .sketchy import Sketch
from .human import get_character, display_name, INK
from .props import draw_prop
from .environments import draw_environment, W, H, GROUND_Y

FPS = 12
FONT_PATHS = [
    "/usr/share/fonts/opentype/comic-neue/ComicNeue-Bold.otf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]


def _font(size):
    for p in FONT_PATHS:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def resolve_action(action, chars):
    a = action.lower()

    def has(*keys):
        return any(k in a for k in keys)

    if has("lie", "faint", "sleep", "dead", "dazed", "lying"):
        actor = "lie"
    elif has("point", "announce", "shout"):
        actor = "point"
    elif has("plead", "beg", "pray", "surround", "swarm", "protest", "ask"):
        actor = "plead"
    elif has("shrug"):
        actor = "shrug"
    elif has("facepalm"):
        actor = "facepalm"
    elif has("shock", "startled", "freez", "confus", "amaz", "erupt", "jaw", "panic"):
        actor = "shocked"
    elif has("bow"):
        actor = "bow"
    elif has("carry", "wrap", "load", "pack", "buys", "hand", "hold", "dip"):
        actor = "carry"
    elif has("run", "bolt", "chase", "flee", "walk", "sneak", "leave", "journey"):
        actor = "carry"
    elif has("deadpan", "calm", "serene", "idle"):
        actor = "talk"
    else:
        actor = "talk"

    others = "idle"
    if has("worried", "gloomy", "plead"):
        others = "plead"
    if has("shocked", "scatter", "erupt"):
        others = "shocked"
    if has("welcome", "greet", "laugh"):
        others = "talk"
    return actor, others


def stage_positions(n):
    if n == 1:
        return [(W * 0.5, GROUND_Y + 150, 1.6, 1)]
    if n == 2:
        return [(W * 0.29, GROUND_Y + 150, 1.5, 1), (W * 0.70, GROUND_Y + 130, 1.42, -1)]
    pos = [(W * 0.23, GROUND_Y + 160, 1.45, 1)]
    rest = n - 1
    for i in range(rest):
        x = W * (0.50 + 0.44 * i / max(1, rest - 1))
        y = GROUND_Y + 40 - (i % 2) * 100
        pos.append((x, y, 1.12 - (i % 2) * 0.12, -1))
    return pos


PROP_SLOTS = [(W * 0.84, GROUND_Y + 60, 1.1), (W * 0.14, GROUND_Y - 20, 1.2),
              (W * 0.5, GROUND_Y - 460, 1.0), (W * 0.85, 360, 1.1),
              (W * 0.15, 400, 1.0)]
SKY_PROPS = {"moon", "sun", "eagle", "eagle_distant", "moon_dream_bubble"}
ATTACH_HAND = {"candle", "recipe_paper", "whistle", "coin", "bread", "axe",
               "meat_package", "staff"}


def _wrap(text, font, max_w, d):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if d.textlength(test, font=font) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def draw_bubble(img, sk, text, anchor_x, anchor_y):
    """Elle cizilmis beyaz konusma balonu, siyah yazi. Ust banda cizilir."""
    d = ImageDraw.Draw(img)
    font = _font(56)
    max_w = W - 320
    lines = _wrap(text, font, max_w, d)
    lh = 68
    tw = max(d.textlength(ln, font=font) for ln in lines)
    bw = tw + 110
    bh = len(lines) * lh + 80
    cx = min(max(bw / 2 + 60, anchor_x), W - bw / 2 - 60)
    cy = max(bh / 2 + 140, anchor_y - bh / 2 - 190)
    # balon govdesi (hafif duzensiz elips = el cizimi hissi)
    pts = []
    n = 26
    for i in range(n):
        a = 2 * math.pi * i / n
        r_jit = 1.0 + 0.05 * math.sin(a * 3 + 0.7)
        pts.append((cx + math.cos(a) * bw / 2 * r_jit,
                    cy + math.sin(a) * bh / 2 * r_jit))
    d.polygon(pts, fill=(255, 255, 255))
    sk.polyline(pts, fill=INK, width=7, close=True)
    # kuyruk
    tail_x = min(max(anchor_x, cx - bw / 3), cx + bw / 3)
    d.polygon([(tail_x - 30, cy + bh / 2 - 12), (tail_x + 34, cy + bh / 2 - 12),
               (anchor_x, anchor_y)], fill=(255, 255, 255))
    sk.line((tail_x - 30, cy + bh / 2 - 10), (anchor_x, anchor_y), fill=INK, width=7)
    sk.line((tail_x + 34, cy + bh / 2 - 10), (anchor_x, anchor_y), fill=INK, width=7)
    y = cy - (len(lines) * lh) / 2 + 6
    for ln in lines:
        tw_ = d.textlength(ln, font=font)
        d.text((cx - tw_ / 2, y), ln, font=font, fill=(10, 10, 10))
        y += lh


def draw_name_label(img, sk, name, head_x, head_y):
    d = ImageDraw.Draw(img)
    font = _font(46)
    tw = d.textlength(name, font=font)
    lx = min(max(head_x + 105, 60), W - tw - 60)
    ly = head_y - 150
    d.text((lx, ly), name, font=font, fill=INK)
    # ok: yazidan kafaya
    ax0, ay0 = lx + tw / 2, ly + 58
    sk.line((ax0, ay0), (head_x + 25, head_y + 5), fill=INK, width=6)
    ang = math.atan2((head_y + 5) - ay0, (head_x + 25) - ax0)
    for da in (2.6, -2.6):
        sk.line((head_x + 25, head_y + 5),
                (head_x + 25 - 26 * math.cos(ang + da),
                 head_y + 5 - 26 * math.sin(ang + da)), fill=INK, width=6)


def render_scene_image(scene, lang, bubble_text, out_path):
    """Sahneyi TEK statik resim olarak uret."""
    actor_pose, others_pose = resolve_action(scene.action, scene.chars)
    chars = [get_character(c) for c in scene.chars] or [get_character("hoca")]
    pos = stage_positions(len(chars))
    img = Image.new("RGB", (W, H), (125, 205, 235))
    sk = Sketch(ImageDraw.Draw(img))
    draw_environment(scene.env, img, sk, 0.0)

    # proplar
    slot_i = 0
    donkey_pos = None
    for p in scene.props:
        key = p.lower()
        if key in ATTACH_HAND:
            continue
        if key in SKY_PROPS:
            draw_prop(key, sk, W * 0.82, 320, 1.0, 0.0)
            continue
        sx, sy, ss = PROP_SLOTS[slot_i % len(PROP_SLOTS)]
        if key.startswith("fire") and donkey_pos:
            draw_prop(key, sk, donkey_pos[0], donkey_pos[1] - 150 * donkey_pos[2],
                      donkey_pos[2], 0.0)
            continue
        if draw_prop(key, sk, sx, sy, ss, 0.0):
            if key.startswith("donkey"):
                donkey_pos = (sx, sy, ss)
            slot_i += 1

    # karakterler + isim etiketleri
    heads = []
    for i, (ch, (x, y, sc, face)) in enumerate(zip(chars, pos)):
        pose = actor_pose if i == 0 else others_pose
        ch.draw(sk, x, y, sc, pose=pose, facing=face)
        head_y = y - 110 * sc - 170 * sc - 62 * sc  # yaklasik kafa ustu
        heads.append((ch, x, head_y))
    # balon (varsa) aktorun agzina baglanir — etiketlerden ONCE
    if bubble_text:
        ch, hx, hy = heads[0]
        draw_bubble(img, sk, bubble_text, hx + 40, hy + 120)
    for i, (ch, hx, hy) in enumerate(heads):
        if bubble_text and i == 0:
            continue  # konusanin etiketi yok — balon kuyrugu zaten gosteriyor
        draw_name_label(img, sk, display_name(ch.key, lang), hx, hy)

    img.save(out_path, "PNG")
    return out_path
