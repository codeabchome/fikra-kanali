# -*- coding: utf-8 -*-
"""narrate.py — edge-tts ile sahne başına seslendirme.
Ağ yoksa / NARRATE_DUMMY=1 ise süre tahminli sessiz ses üretir (yerel test)."""
import asyncio
import os
import subprocess


def _dur(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries",
                          "format=duration", "-of", "csv=p=0", path],
                         capture_output=True, text=True)
    return float(out.stdout.strip())


def _dummy(text, out_mp3):
    words = max(3, len(text.split()))
    dur = max(2.2, min(14.0, words * 0.42))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi",
                    "-i", f"anullsrc=r=44100:cl=mono:d={dur:.2f}",
                    "-c:a", "libmp3lame", out_mp3], check=True)
    return dur


async def _edge(text, voice, out_mp3, rate):
    import edge_tts
    com = edge_tts.Communicate(text, voice, rate=rate)
    await com.save(out_mp3)


def narrate_line(text, voice, out_mp3, rate="+0%"):
    if os.environ.get("NARRATE_DUMMY") == "1":
        return _dummy(text, out_mp3)
    try:
        asyncio.run(_edge(text, voice, out_mp3, rate))
        return _dur(out_mp3)
    except Exception as e:  # ağ hatasında pipeline kırılmasın
        print(f"  ! edge-tts hata ({e}); sessiz yedek üretiliyor")
        return _dummy(text, out_mp3)
