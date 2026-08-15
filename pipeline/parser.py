# -*- coding: utf-8 -*-
"""parser.py — senaryo dosyası okuyucu.
Format:
  # key: value  (meta; '|' ile çok alanlı olabilir)
  [scene: env | chars: a, b | props: p | action: name]
  EN: ...
  TR: ...
  # punchline_hold: 1.5s
"""
import re
from dataclasses import dataclass, field


@dataclass
class Scene:
    env: str = "village_square"
    chars: list = field(default_factory=list)
    props: list = field(default_factory=list)
    action: str = "idle"
    lines: dict = field(default_factory=dict)  # {"EN": str, "TR": str}


@dataclass
class Episode:
    meta: dict
    scenes: list
    punchline_hold: float = 1.5


TAG_RE = re.compile(r"^\[scene:\s*(?P<body>.+?)\]\s*$")
LINE_RE = re.compile(r"^(EN|TR):\s*(.+)$")
HOLD_RE = re.compile(r"punchline_hold:\s*([\d.]+)")


def parse_script(path):
    meta, scenes, hold = {}, [], 1.5
    cur = None
    with open(path, encoding="utf-8") as f:
        for raw in f:
            line = raw.strip()
            if not line:
                continue
            if line.startswith("#"):
                m = HOLD_RE.search(line)
                if m:
                    hold = float(m.group(1))
                body = line.lstrip("#").strip()
                for part in body.split("|"):
                    if ":" in part:
                        k, v = part.split(":", 1)
                        k = k.strip().lower().replace(" ", "_")
                        if k and not k.startswith("="):
                            meta.setdefault(k, v.strip())
                continue
            m = TAG_RE.match(line)
            if m:
                cur = Scene()
                for part in m.group("body").split("|"):
                    if ":" not in part:
                        cur.env = part.strip()
                        continue
                    k, v = part.split(":", 1)
                    k = k.strip().lower()
                    v = v.strip()
                    if k == "scene" or k == "env":
                        cur.env = v
                    elif k == "chars":
                        cur.chars = [c.strip() for c in v.split(",") if c.strip()]
                    elif k == "props":
                        cur.props = [p.strip() for p in v.split(",") if p.strip()]
                    elif k == "action":
                        cur.action = v
                scenes.append(cur)
                continue
            m = LINE_RE.match(line)
            if m and cur is not None:
                cur.lines[m.group(1)] = m.group(2).strip()
    return Episode(meta=meta, scenes=scenes, punchline_hold=hold)
