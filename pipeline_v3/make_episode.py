# -*- coding: utf-8 -*-
"""make_episode.py v3 — senaryo → sinematik video.
Kullanim: python -m pipeline_v3.make_episode content/scripts/X.txt TR out/X_tr.mp4
Ses: edge-tts cok-dilli ses (dogal anlatim); NARRATE_DUMMY=1 ile sessiz yerel test.
"""
import json, os, shutil, subprocess, sys, tempfile

sys.path.insert(0, os.getcwd())
from pipeline.parser import parse_script          # mevcut parser
from pipeline.narrate import narrate_line         # mevcut TTS (yedekli)
import importlib
from pipeline_v3.panelgen import build_episode, wrap_caption
from pipeline_v3.autostager import build_panels as auto_panels

# --- SES: gercekci anlatim icin cok-dilli nöral sesler ---
DEFAULT_VOICES = {"TR": "tr-TR-AhmetNeural", "EN": "en-US-AvaMultilingualNeural"}
RATE = {"TR": "-6%", "EN": "-4%"}
CHANNELS = {"TR": "Karalama F\u0131kralar", "EN": "Scribbled Yarns"}
PAD = 0.45
MUSIC = "assets/music/bg.mp3"
MUSIC_VOL = 0.10
FPS = 30

def _dur(p):
    out = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                          "-of","csv=p=0",p],capture_output=True,text=True)
    return float(out.stdout.strip())

def build(script_path, lang, out_mp4, keep_tmp=False):
    lang = lang.upper()
    ep = parse_script(script_path)
    voice = ep.meta.get(f"v3_voice_{lang.lower()}") or DEFAULT_VOICES[lang]
    tmp = tempfile.mkdtemp(prefix="fk3_")
    print(f"[v3 | {os.path.basename(script_path)} | {lang}] ses: {voice}")

    durations, mp3s = [], []
    for si, sc in enumerate(ep.scenes):
        text = sc.lines.get(lang) or sc.lines.get("EN") or ""
        mp3 = os.path.join(tmp, f"a{si:02d}.mp3")
        d = narrate_line(text, voice, mp3, rate=RATE[lang])
        hold = ep.punchline_hold if si == len(ep.scenes)-1 else 0.0
        durations.append(d + PAD + hold)
        mp3s.append((mp3, d))
        print(f"  sahne {si+1}: {durations[-1]:.1f}s")

    base = os.path.splitext(os.path.basename(script_path))[0]
    koreo = None
    for modname in (f"pipeline_v3.koreo_{base}",
                    f"pipeline_v3.koreo_{base.split('_', 1)[-1]}"):
        try:
            koreo = importlib.import_module(modname)
            break
        except ModuleNotFoundError:
            continue
    if koreo is not None:
        caps = [wrap_caption(sc.lines.get(lang) or sc.lines.get("EN") or "", False)
                for sc in ep.scenes]
        last = ep.scenes[-1]
        bubble = last.lines.get("B" + lang) or last.lines.get("BEN") or ""
        caps.append(wrap_caption(bubble, True) if bubble else caps[-1])
        try:
            panels = koreo.build(durations, caps)
        except Exception as e:
            print(f"  ! koreo hatasi ({e}) — otomatik ureticiye dusuluyor")
            koreo = None
            panels = None
    if koreo is not None and panels:
        episode = {"lang": lang, "channel": CHANNELS[lang],
                   "introDur": 0.9, "outroDur": 1.8,
                   "outroTitle": "IF YOU LIKED IT" if lang == "EN" else "BE\u011eEND\u0130YSEN",
                   "outroSub": "SUBSCRIBE!" if lang == "EN" else "ABONE OL!",
                   "panels": panels}
        print(f"  koreografi: {koreo.__name__.split('.')[-1]} ({len(panels)} panel)")
    else:
        caps = [wrap_caption(sc.lines.get(lang) or sc.lines.get("EN") or "", False)
                for sc in ep.scenes]
        last = ep.scenes[-1]
        bubble = last.lines.get("B" + lang) or last.lines.get("BEN") or ""
        if bubble:
            caps.append(wrap_caption(bubble, True))
        panels = auto_panels(ep.scenes, durations, caps)
        episode = {"lang": lang, "channel": CHANNELS[lang],
                   "introDur": 0.9, "outroDur": 1.8,
                   "outroTitle": "IF YOU LIKED IT" if lang == "EN" else "BE\u011eEND\u0130YSEN",
                   "outroSub": "SUBSCRIBE!" if lang == "EN" else "ABONE OL!",
                   "panels": panels}
        print(f"  autostager: {len(panels)} olay karesi")
    ep_json = os.path.join(tmp, "episode.json")
    with open(ep_json, "w", encoding="utf-8") as f:
        json.dump(episode, f, ensure_ascii=False)

    frames = os.path.join(tmp, "frames")
    subprocess.run(["node", "pipeline_v3/render_node.js", ep_json, frames, str(FPS)],
                   check=True)

    # ses hatti: intro sessizligi + sahne sesleri (pad'li) + outro sessizligi
    seg_list = os.path.join(tmp, "alist.txt")
    def silence(dur, p):
        subprocess.run(["ffmpeg","-y","-loglevel","error","-f","lavfi",
                        "-i",f"anullsrc=r=44100:cl=mono:d={dur:.3f}",
                        "-c:a","libmp3lame",p],check=True)
    sil_i = os.path.join(tmp,"sil_i.mp3"); silence(episode["introDur"], sil_i)
    sil_o = os.path.join(tmp,"sil_o.mp3"); silence(episode["outroDur"]+0.2, sil_o)
    parts = [sil_i]
    for i,(mp3,d) in enumerate(mp3s):
        padded = os.path.join(tmp, f"p{i:02d}.mp3")
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",mp3,
                        "-af",f"apad=whole_dur={durations[i]:.3f}",
                        "-c:a","libmp3lame",padded],check=True)
        parts.append(padded)
    parts.append(sil_o)
    with open(seg_list,"w") as f:
        for p in parts: f.write(f"file '{p}'\n")
    voice_track = os.path.join(tmp,"voice.mp3")
    subprocess.run(["ffmpeg","-y","-loglevel","error","-f","concat","-safe","0",
                    "-i",seg_list,"-c","copy",voice_track],check=True)

    # video + ses (+ muzik)
    os.makedirs(os.path.dirname(out_mp4) or ".", exist_ok=True)
    silent_video = os.path.join(tmp,"video.mp4")
    subprocess.run(["ffmpeg","-y","-loglevel","error","-framerate",str(FPS),
                    "-i",os.path.join(frames,"f%05d.png"),
                    "-c:v","libx264","-pix_fmt","yuv420p","-r",str(FPS),silent_video],check=True)
    vdur=_dur(silent_video)
    if os.path.exists(MUSIC):
        fo=max(0.0,vdur-2.5)
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",silent_video,
            "-i",voice_track,"-stream_loop","-1","-i",MUSIC,
            "-filter_complex",
            f"[2:a]volume={MUSIC_VOL},afade=t=in:st=0:d=1.5,afade=t=out:st={fo:.2f}:d=2.5,"
            f"atrim=duration={vdur:.3f}[m];"
            f"[1:a][m]amix=inputs=2:duration=first:dropout_transition=0,alimiter=limit=0.95[a]",
            "-map","0:v","-map","[a]","-c:v","copy","-c:a","aac","-b:a","160k",
            "-movflags","+faststart",out_mp4],check=True)
        print("  + fon muzigi")
    else:
        subprocess.run(["ffmpeg","-y","-loglevel","error","-i",silent_video,
                        "-i",voice_track,"-c:v","copy","-c:a","aac","-b:a","160k",
                        "-shortest","-movflags","+faststart",out_mp4],check=True)
    if not keep_tmp: shutil.rmtree(tmp, ignore_errors=True)
    print(f"  OK {out_mp4} ({vdur:.1f}s)")
    return out_mp4, ep

if __name__ == "__main__":
    build(sys.argv[1], sys.argv[2], sys.argv[3])
