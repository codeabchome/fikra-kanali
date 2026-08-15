# -*- coding: utf-8 -*-
"""animate.py — sahne kareleyici.
Her sahne: environment + prop'lar + karakterler + aksiyon + altyazı bandı.
Boil efekti: wobble seed'i her 4 karede değişir (el çizimi titremesi)."""
import math
import os

from PIL import Image, ImageDraw, ImageFont

from .sketchy import Sketch
from .human import get_character
from .props import draw_prop
from .environments import draw_environment, W, H, GROUND_Y

FPS = 12
FONT_PATHS = ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
              "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf"]


def _font(size):
    for p in FONT_PATHS:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


CAPTION_FONT = None  # lazy


# ---------------------------------------------------------------- aksiyon çözücü
def resolve_action(action, chars):
    """action adı → (aktör pozu, diğerlerin pozu, hareket tipi)"""
    a = action.lower()

    def has(*keys):
        return any(k in a for k in keys)

    move = None
    if has("run", "bolt", "chase", "flee", "escape", "snatch_and_run"):
        actor_pose, move = "run", "cross"
    elif has("walk", "group", "leaves", "journey"):
        actor_pose, move = "walk", "cross_slow"
    elif has("sneak"):
        actor_pose, move = "walk", "exit"
    elif has("lie", "faint", "sleep", "dead", "ground_dazed", "lying"):
        actor_pose = "lie"
    elif has("point", "announce", "points"):
        actor_pose = "point"
    elif has("plead", "beg", "pray", "surround", "swarm", "protest"):
        actor_pose = "plead"
    elif has("shrug"):
        actor_pose = "shrug"
    elif has("facepalm"):
        actor_pose = "facepalm"
    elif has("shock", "startled", "freez", "confus", "amaz", "erupt", "jaw"):
        actor_pose = "shocked"
    elif has("bow"):
        actor_pose = "bow"
    elif has("carry", "wrap", "load", "pack", "buys", "hand"):
        actor_pose = "carry"
    elif has("deadpan", "calm", "serene"):
        actor_pose = "idle"
    else:
        actor_pose = "talk"

    others_pose = "idle"
    if has("crowd_worried", "gloomy"):
        others_pose = "plead"
    if has("welcomes", "greets"):
        others_pose = "talk"
    if has("scatter"):
        others_pose = "run"
    return actor_pose, others_pose, move


def stage_positions(n):
    """n karakteri sahneye diz (aktör en önde-ortada, BÜYÜK ölçek)."""
    if n == 1:
        return [(W * 0.5, GROUND_Y + 60, 2.0, 1)]
    if n == 2:
        return [(W * 0.32, GROUND_Y + 60, 1.85, 1), (W * 0.71, GROUND_Y + 40, 1.75, -1)]
    pos = [(W * 0.27, GROUND_Y + 70, 1.8, 1)]
    rest = n - 1
    for i in range(rest):
        x = W * (0.52 + 0.42 * i / max(1, rest - 1))
        y = GROUND_Y - 20 - (i % 2) * 70
        pos.append((x, y, 1.45 - (i % 2) * 0.15, -1))
    return pos


PROP_SLOTS = [(W * 0.80, GROUND_Y + 30, 1.5), (W * 0.15, GROUND_Y - 60, 1.2),
              (W * 0.5, GROUND_Y - 480, 1.0), (W * 0.85, 340, 1.1),
              (W * 0.15, 380, 1.0)]
SKY_PROPS = {"moon", "sun", "eagle", "eagle_distant", "moon_dream_bubble"}
ATTACH_HAND = {"candle", "recipe_paper", "whistle", "coin", "bread", "axe",
               "meat_package", "staff"}


def wrap_text(text, font, max_w, draw):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        test = (cur + " " + w).strip()
        if draw.textlength(test, font=font) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def draw_caption(img, text):
    global CAPTION_FONT
    if CAPTION_FONT is None:
        CAPTION_FONT = _font(58)
    d = ImageDraw.Draw(img, "RGBA")
    lines = wrap_text(text, CAPTION_FONT, W - 200, d)
    lh = 74
    box_h = len(lines) * lh + 60
    y0 = 210
    d.rounded_rectangle((70, y0, W - 70, y0 + box_h), radius=34,
                        fill=(20, 18, 16, 190), outline=(250, 246, 232, 230), width=5)
    y = y0 + 34
    for ln in lines:
        tw = d.textlength(ln, font=CAPTION_FONT)
        d.text(((W - tw) / 2, y), ln, font=CAPTION_FONT, fill=(250, 246, 232))
        y += lh
    return img


def render_scene_frames(scene, text, duration, out_dir, start_index=0,
                        hold_extra=0.0):
    """Sahneyi kare kare üret; kare dosya yolu listesi döner."""
    os.makedirs(out_dir, exist_ok=True)
    n_frames = max(FPS, int(round((duration + hold_extra) * FPS)))
    actor_pose, others_pose, move = resolve_action(scene.action, scene.chars)
    chars = [get_character(c) for c in scene.chars] or [get_character("hoca")]
    pos = stage_positions(len(chars))
    frames = []
    for f in range(n_frames):
        t = f / FPS
        prog = f / max(1, n_frames - 1)
        seed = 1000 + (f // 4)  # boil: 4 karede bir yeni titreme
        img = Image.new("RGB", (W, H), (240, 236, 226))
        sk = Sketch(ImageDraw.Draw(img), seed=seed)
        draw_environment(scene.env, img, sk, t)

        # prop'lar
        slot_i = 0
        donkey_pos = None
        prop_keys = [p.lower() for p in scene.props]
        for p in scene.props:
            key = p.lower()
            if key in ATTACH_HAND:
                continue  # el hizasında ayrıca çizilecek
            if key in SKY_PROPS:
                draw_prop(key, sk, W * 0.82, 300, 1.0, t)
                continue
            sx, sy, ss = PROP_SLOTS[slot_i % len(PROP_SLOTS)]
            if key.startswith("fire") and donkey_pos:
                draw_prop(key, sk, donkey_pos[0], donkey_pos[1] - 150 * donkey_pos[2],
                          donkey_pos[2], t)
                continue
            walking = move in ("cross", "cross_slow") and key.startswith("donkey")
            drawn = draw_prop(key, sk, sx, sy, ss, t,
                              walking=walking, running=(move == "cross"))
            if drawn:
                if key.startswith("donkey"):
                    donkey_pos = (sx, sy, ss)
                slot_i += 1

        # karakterler
        for i, (ch, (x, y, sc, face)) in enumerate(zip(chars, pos)):
            pose = actor_pose if i == 0 else others_pose
            cx = x
            if i == 0 and move:
                if move == "cross":
                    cx = W * (0.15 + 0.7 * prog)
                elif move == "cross_slow":
                    cx = W * (0.25 + 0.5 * prog)
                elif move == "exit":
                    cx = x + (W * 0.7) * prog
            ch.draw(sk, cx, y, sc, pose=pose, t=t, facing=face)
            # el prop'u aktörün eline
            if i == 0:
                hx, hy = cx + 70 * sc * face, y - 190 * sc
                for p in scene.props:
                    if p.lower() in ATTACH_HAND:
                        draw_prop(p.lower(), sk, hx, hy, sc * 0.9, t)
                        break

        draw_caption(img, text)
        path = os.path.join(out_dir, f"f{start_index + f:05d}.png")
        img.save(path, "PNG")
        frames.append(path)
    return frames
