# -*- coding: utf-8 -*-
"""run_daily.py — günlük otomasyon orkestratörü.
Akış:
  1. content/scripts/*.txt tara
  2. content/published/published.json defterinde OLMAYAN ilk N dosyayı seç
  3. Her biri için EN + TR render et
  4. EN videoyu EN kanala, TR videoyu TR kanala yükle
  5. Defteri güncelle (workflow commit eder)

Bahadır için kural: yeni fıkra eklemek = content/scripts/ içine .txt atmak.
Başka hiçbir şey gerekmez; sistem sırayla kendisi yayınlar.
Ortam değişkenleri: EPISODES_PER_RUN (varsayılan 1), PRIVACY (varsayılan public),
EN_/TR_ önekli kanal kimlik bilgileri (workflow'dan gelir).
"""
import glob
import json
import os
import sys
from datetime import datetime, timezone

import os as _os
if _os.environ.get("USE_V3") == "1":
    from pipeline_v3.make_episode import build as _v3_build
    def build_episode(script, lang, out):
        return _v3_build(script, lang, out)
else:
    from .make_episode import build_episode
from . import upload as up

LEDGER = "content/published/published.json"
HASHTAG = {"EN": "#shorts #folktale #nasreddinhodja",
           "TR": "#shorts #fıkra #nasreddinhoca"}
DESC = {
    "EN": "A classic Anatolian folk tale, retold and animated.\n"
          "New tales every day. {tags}",
    "TR": "Klasik bir Nasreddin Hoca fıkrası, yeniden anlatım ve çizim bizden.\n"
          "Her gün yeni fıkra. {tags}",
}


def load_ledger():
    if os.path.exists(LEDGER):
        with open(LEDGER, encoding="utf-8") as f:
            return json.load(f)
    return {"published": {}}


def save_ledger(led):
    os.makedirs(os.path.dirname(LEDGER), exist_ok=True)
    with open(LEDGER, "w", encoding="utf-8") as f:
        json.dump(led, f, ensure_ascii=False, indent=2)


def pick_pending(led, n):
    all_scripts = sorted(os.path.basename(p)
                         for p in glob.glob("content/scripts/*.txt"))
    done = set(led["published"].keys())
    return [s for s in all_scripts if s not in done][:n]


def creds(prefix):
    return {
        "YT_CLIENT_ID": os.environ[f"{prefix}_CLIENT_ID"],
        "YT_CLIENT_SECRET": os.environ[f"{prefix}_CLIENT_SECRET"],
        "YT_REFRESH_TOKEN": os.environ[f"{prefix}_REFRESH_TOKEN"],
    }


def upload_with(prefix, path, title, desc, privacy, lang):
    old = {k: os.environ.get(k) for k in
           ("YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN")}
    os.environ.update(creds(prefix))
    try:
        return up.upload(path, title, desc, tags=None, privacy=privacy,
                         category_id="23", default_language=lang.lower())
    finally:
        for k, v in old.items():
            if v is None:
                os.environ.pop(k, None)
            else:
                os.environ[k] = v


def main():
    n = int(os.environ.get("EPISODES_PER_RUN", "1"))
    privacy = os.environ.get("PRIVACY", "public")
    led = load_ledger()
    pending = pick_pending(led, n)
    if not pending:
        print("Yayınlanacak yeni senaryo yok — content/scripts/ boşta.")
        return 0
    for fname in pending:
        path = os.path.join("content/scripts", fname)
        entry = {"date": datetime.now(timezone.utc).isoformat()}
        for lang, prefix in (("EN", "EN"), ("TR", "TR")):
            out = f"out/{os.path.splitext(fname)[0]}_{lang.lower()}.mp4"
            _, ep = build_episode(path, lang, out)
            title_key = "title_en" if lang == "EN" else "title_tr"
            title = ep.meta.get(title_key) or ep.meta.get("title_display") \
                or os.path.splitext(fname)[0].replace("_", " ").title()
            title = f"{title} {HASHTAG[lang].split()[0]}"
            desc = DESC[lang].format(tags=HASHTAG[lang])
            vid = upload_with(prefix, out, title, desc, privacy, lang)
            entry[lang.lower()] = vid
        led["published"][fname] = entry
        save_ledger(led)  # her bölümden sonra kaydet (yarıda kesilirse kayıp olmaz)
        print(f"✓ yayınlandı: {fname} -> {entry}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
