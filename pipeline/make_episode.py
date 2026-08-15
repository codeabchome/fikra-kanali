# -*- coding: utf-8 -*-
"""make_episode.py — senaryo + dil → bitmiş dikey video.
Kullanım: python -m pipeline.make_episode content/scripts/X.txt EN out/X_en.mp4
"""
import os
import shutil
import subprocess
import sys
import tempfile

from .parser import parse_script
from .narrate import narrate_line
from .animate import render_scene_frames, FPS

DEFAULT_VOICES = {"EN": "en-US-AndrewNeural", "TR": "tr-TR-AhmetNeural"}
PAD = 0.35  # sahne sonu nefes payı (sn)


def build_episode(script_path, lang, out_mp4, keep_tmp=False):
    ep = parse_script(script_path)
    lang = lang.upper()
    voice = ep.meta.get(f"voice_{lang.lower()}", DEFAULT_VOICES[lang])
    tmp = tempfile.mkdtemp(prefix="fk_")
    frames_dir = os.path.join(tmp, "frames")
    seg_list = os.path.join(tmp, "segs.txt")
    segs = []
    idx = 0
    print(f"[{os.path.basename(script_path)} | {lang}] {len(ep.scenes)} sahne, ses: {voice}")

    for si, sc in enumerate(ep.scenes):
        text = sc.lines.get(lang) or sc.lines.get("EN") or ""
        mp3 = os.path.join(tmp, f"a{si:02d}.mp3")
        dur = narrate_line(text, voice, mp3)
        hold = ep.punchline_hold if si == len(ep.scenes) - 1 else 0.0
        total = dur + PAD + hold
        print(f"  sahne {si+1}/{len(ep.scenes)} [{sc.env}|{sc.action}] {total:.1f}s")
        frames = render_scene_frames(sc, text, total, frames_dir, start_index=idx)
        idx += len(frames)
        # sahne videosu: kareler + ses (apad ile sahne süresine uzat)
        seg = os.path.join(tmp, f"seg{si:02d}.mp4")
        subprocess.run([
            "ffmpeg", "-y", "-loglevel", "error",
            "-framerate", str(FPS), "-start_number", str(idx - len(frames)),
            "-i", os.path.join(frames_dir, "f%05d.png"),
            "-i", mp3,
            "-frames:v", str(len(frames)),
            "-af", f"apad=whole_dur={len(frames)/FPS:.3f}",
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", str(FPS),
            "-c:a", "aac", "-b:a", "128k", "-shortest", seg], check=True)
        segs.append(seg)

    with open(seg_list, "w") as f:
        for s in segs:
            f.write(f"file '{s}'\n")
    os.makedirs(os.path.dirname(out_mp4) or ".", exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat",
                    "-safe", "0", "-i", seg_list, "-c:v", "libx264",
                    "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
                    "-movflags", "+faststart", out_mp4], check=True)
    if not keep_tmp:
        shutil.rmtree(tmp, ignore_errors=True)
    print(f"  ✓ {out_mp4}")
    return out_mp4, ep


if __name__ == "__main__":
    build_episode(sys.argv[1], sys.argv[2], sys.argv[3])
