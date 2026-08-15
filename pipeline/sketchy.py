# -*- coding: utf-8 -*-
"""sketchy.py — Paint Terk tarzı titrek çizgi motoru (PIL üstüne)."""
import math
import random

from PIL import ImageDraw


class Sketch:
    """Deterministik wobble: aynı seed = aynı titreme. Boil efekti için
    frame başına seed değiştirilir."""

    def __init__(self, draw: ImageDraw.ImageDraw, seed: int = 0,
                 wobble: float = 3.2, segments_per_100px: float = 6.0):
        self.d = draw
        self.rng = random.Random(seed)
        self.wobble = wobble
        self.seg = segments_per_100px

    # ---- temel ----
    def _jit(self, amt=None):
        a = self.wobble if amt is None else amt
        return self.rng.uniform(-a, a)

    def line(self, p1, p2, fill=(30, 30, 30), width=4, wobble=None):
        x1, y1 = p1
        x2, y2 = p2
        dist = math.hypot(x2 - x1, y2 - y1)
        n = max(2, int(dist / 100.0 * self.seg))
        pts = []
        for i in range(n + 1):
            t = i / n
            x = x1 + (x2 - x1) * t
            y = y1 + (y2 - y1) * t
            if 0 < i < n:
                x += self._jit(wobble)
                y += self._jit(wobble)
            pts.append((x, y))
        self.d.line(pts, fill=fill, width=width, joint="curve")

    def polyline(self, pts, fill=(30, 30, 30), width=4, close=False):
        pts = list(pts)
        if close:
            pts = pts + [pts[0]]
        for a, b in zip(pts, pts[1:]):
            self.line(a, b, fill=fill, width=width)

    def ellipse(self, cx, cy, rx, ry, outline=(30, 30, 30), width=4,
                fill=None, n=None):
        n = n or max(10, int((rx + ry) / 8))
        pts = []
        for i in range(n):
            a = 2 * math.pi * i / n
            pts.append((cx + math.cos(a) * rx + self._jit(),
                        cy + math.sin(a) * ry + self._jit()))
        if fill:
            self.d.polygon(pts, fill=fill)
        if outline:
            self.polyline(pts, fill=outline, width=width, close=True)

    def circle(self, cx, cy, r, **kw):
        self.ellipse(cx, cy, r, r, **kw)

    def poly(self, pts, fill=None, outline=(30, 30, 30), width=4):
        pts = [(x + self._jit(), y + self._jit()) for x, y in pts]
        if fill:
            self.d.polygon(pts, fill=fill)
        if outline:
            self.polyline(pts, fill=outline, width=width, close=True)

    def arc(self, cx, cy, r, a0, a1, fill=(30, 30, 30), width=4, n=12):
        pts = []
        for i in range(n + 1):
            a = math.radians(a0 + (a1 - a0) * i / n)
            pts.append((cx + math.cos(a) * r + self._jit(1.2),
                        cy + math.sin(a) * r + self._jit(1.2)))
        self.d.line(pts, fill=fill, width=width, joint="curve")

    def scribble_fill(self, pts_bbox, color, density=14, width=3):
        """Kaba boyama hissi: bbox içinde çapraz karalama çizgileri."""
        x0, y0, x1, y1 = pts_bbox
        step = max(8, int((y1 - y0) / density))
        for y in range(int(y0), int(y1), step):
            self.line((x0 + self._jit(4), y + self._jit(3)),
                      (x1 + self._jit(4), y + step * 0.6 + self._jit(3)),
                      fill=color, width=width, wobble=3)
