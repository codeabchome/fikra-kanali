# -*- coding: utf-8 -*-
"""sketchy.py — v2: TEMİZ Paint çizgileri (dalgalanma yok)."""
import math

class Sketch:
    def __init__(self, draw, seed=0, wobble=0.0, segments_per_100px=2):
        self.d = draw

    def line(self, p1, p2, fill=(20, 20, 20), width=6, wobble=None):
        self.d.line([p1, p2], fill=fill, width=width)
        r = width // 2
        for x, y in (p1, p2):
            self.d.ellipse((x - r, y - r, x + r, y + r), fill=fill)

    def polyline(self, pts, fill=(20, 20, 20), width=6, close=False):
        pts = list(pts)
        if close:
            pts = pts + [pts[0]]
        self.d.line(pts, fill=fill, width=width, joint="curve")
        r = width // 2
        for x, y in pts:
            self.d.ellipse((x - r, y - r, x + r, y + r), fill=fill)

    def ellipse(self, cx, cy, rx, ry, outline=None, width=5, fill=None, n=None):
        box = (cx - rx, cy - ry, cx + rx, cy + ry)
        self.d.ellipse(box, fill=fill, outline=outline, width=width)

    def circle(self, cx, cy, r, **kw):
        self.ellipse(cx, cy, r, r, **kw)

    def poly(self, pts, fill=None, outline=None, width=5):
        if fill:
            self.d.polygon(pts, fill=fill)
        if outline:
            self.polyline(pts, fill=outline, width=width, close=True)

    def rrect(self, x0, y0, x1, y1, r=18, fill=None, outline=None, width=5):
        self.d.rounded_rectangle((x0, y0, x1, y1), radius=r, fill=fill,
                                 outline=outline, width=width)

    def arc(self, cx, cy, r, a0, a1, fill=(20, 20, 20), width=5, n=14):
        pts = []
        for i in range(n + 1):
            a = math.radians(a0 + (a1 - a0) * i / n)
            pts.append((cx + math.cos(a) * r, cy + math.sin(a) * r))
        self.d.line(pts, fill=fill, width=width, joint="curve")

    def scribble_fill(self, bbox, color, density=14, width=3):
        x0, y0, x1, y1 = bbox
        self.d.rectangle(bbox, fill=color)
