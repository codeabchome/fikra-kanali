# -*- coding: utf-8 -*-
"""
pipeline/upload.py — YouTube yükleme modülü
Kimlik bilgilerini ortam değişkenlerinden alır (GitHub Secrets üzerinden gelir):
  YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN
Kullanım:
  python pipeline/upload.py --file video.mp4 --title "Başlık" \
      --description "Açıklama" --privacy private --tags "tag1,tag2"
"""
import argparse
import os
import sys

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/youtube.upload",
          "https://www.googleapis.com/auth/youtube"]


def get_service():
    client_id = os.environ["YT_CLIENT_ID"]
    client_secret = os.environ["YT_CLIENT_SECRET"]
    refresh_token = os.environ["YT_REFRESH_TOKEN"]
    creds = Credentials(
        token=None,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=client_id,
        client_secret=client_secret,
        scopes=SCOPES,
    )
    return build("youtube", "v3", credentials=creds, cache_discovery=False)


def upload(file_path, title, description="", tags=None, privacy="private",
           category_id="23", default_language=None):
    yt = get_service()
    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags or [],
            "categoryId": category_id,  # 23 = Comedy
        },
        "status": {
            "privacyStatus": privacy,
            "selfDeclaredMadeForKids": False,
        },
    }
    if default_language:
        body["snippet"]["defaultLanguage"] = default_language
        body["snippet"]["defaultAudioLanguage"] = default_language

    media = MediaFileUpload(file_path, chunksize=8 * 1024 * 1024,
                            resumable=True, mimetype="video/mp4")
    request = yt.videos().insert(part="snippet,status", body=body, media_body=media)

    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"  yükleniyor... %{int(status.progress() * 100)}")
    video_id = response["id"]
    print(f"OK video_id={video_id} -> https://youtu.be/{video_id}")
    return video_id


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--file", required=True)
    p.add_argument("--title", required=True)
    p.add_argument("--description", default="")
    p.add_argument("--tags", default="")
    p.add_argument("--privacy", default="private",
                   choices=["private", "unlisted", "public"])
    p.add_argument("--category", default="23")
    p.add_argument("--lang", default=None)
    a = p.parse_args()
    try:
        upload(a.file, a.title, a.description,
               [t.strip() for t in a.tags.split(",") if t.strip()],
               a.privacy, a.category, a.lang)
    except KeyError as e:
        print(f"HATA: eksik ortam değişkeni: {e}", file=sys.stderr)
        sys.exit(1)
