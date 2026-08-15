# -*- coding: utf-8 -*-
"""make_episode.py — v2: statik sahne resimleri + 3. sahis anlatim + fon muzigi.
Kullanim: python -m pipeline.make_episode content/scripts/X.txt EN out/X_en.mp4
Fon muzigi: assets/music/bg.mp3 varsa kisik sesle, fade in/out ile eklenir.
"""
import os
import shutil
import subprocess
import sys
import tempfile

from .parser import parse_script
from .narrate import narrate_line
from .animate import render_scene_image, FPS

DEFAULT_VOICES = {"EN": "en-US-AndrewNeural", "TR": "tr-TR-AhmetNeural"}
PAD = 0.45
MUSIC = "assets/music/bg.mp3"
MUSIC_VOL = 0.10


def _dur(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                          "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True)
    return float(out.stdout.strip())


def build_episode(script_path, lang, out_mp4, keep_tmp=False):
    ep = parse_script(script_path)
    lang = lang.upper()
    voice = ep.meta.get(f"voice_{lang.lower()}", DEFAULT_VOICES[lang])
    tmp = tempfile.mkdtemp(prefix="fk_")
    segs = []
    print(f"[{os.path.basename(script_path)} | {lang}] {len(ep.scenes)} sahne, ses: {voice}")

    for si, sc in enumerate(ep.scenes):
        text = sc.lines.get(lang) or sc.lines.get("EN") or ""
        bubble = sc.lines.get("B" + lang) or None
        mp3 = os.path.join(tmp, f"a{si:02d}.mp3")
        dur = narrate_line(text, voice, mp3)
        hold = ep.punchline_hold if si == len(ep.scenes) - 1 else 0.0
        total = dur + PAD + hold
        png = os.path.join(tmp, f"s{si:02d}.png")
        render_scene_image(sc, lang, bubble, png)
        print(f"  sahne {si+1}/{len(ep.scenes)} [{sc.env}] {total:.1f}s"
              + (" (balonlu)" if bubble else ""))
        seg = os.path.join(tmp, f"seg{si:02d}.mp4")
        subprocess.run([
            "ffmpeg", "-y", "-loglevel", "error",
            "-loop", "1", "-framerate", str(FPS), "-t", f"{total:.3f}", "-i", png,
            "-i", mp3,
            "-af", f"apad=whole_dur={total:.3f}",
            "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p",
            "-r", str(FPS), "-c:a", "aac", "-b:a", "128k", "-shortest", seg],
            check=True)
        segs.append(seg)

    seg_list = os.path.join(tmp, "segs.txt")
    with open(seg_list, "w") as f:
        for s in segs:
            f.write(f"file '{s}'\n")
    concat = os.path.join(tmp, "concat.mp4")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat",
                    "-safe", "0", "-i", seg_list, "-c", "copy", concat], check=True)

    os.makedirs(os.path.dirname(out_mp4) or ".", exist_ok=True)
    if os.path.exists(MUSIC):
        total_dur = _dur(concat)
        fade_out_start = max(0.0, total_dur - 2.5)
        subprocess.run([
            "ffmpeg", "-y", "-loglevel", "error", "-i", concat,
            "-stream_loop", "-1", "-i", MUSIC,
            "-filter_complex",
            f"[1:a]volume={MUSIC_VOL},afade=t=in:st=0:d=1.5,"
            f"afade=t=out:st={fade_out_start:.2f}:d=2.5,"
            f"atrim=duration={total_dur:.3f}[m];"
            f"[0:a][m]amix=inputs=2:duration=first:dropout_transition=0,"
            f"alimiter=limit=0.95[a]",
            "-map", "0:v", "-map", "[a]",
            "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
            "-movflags", "+faststart", out_mp4], check=True)
        print("  + fon muzigi eklendi")
    else:
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", concat,
                        "-c", "copy", "-movflags", "+faststart", out_mp4], check=True)
        print("  (assets/music/bg.mp3 yok — muziksiz)")
    if not keep_tmp:
        shutil.rmtree(tmp, ignore_errors=True)
    print(f"  OK {out_mp4}")
    return out_mp4, ep


if __name__ == "__main__":
    build_episode(sys.argv[1], sys.argv[2], sys.argv[3])
