#!/usr/bin/env python3
"""
Download all product images listed in scripts/wc-data/image-manifest.json
into public/products/ — 700px, JPEG q82, alpha flattened to white.
Resumable: skips files that already exist and are valid JPEGs.
"""
import io
import json
import os
import random
import time
from concurrent.futures import ThreadPoolExecutor

import requests
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(ROOT, "scripts", "wc-data", "image-manifest.json")
OUT_DIR = os.path.join(ROOT, "public", "products")
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126.0 Safari/537.36"}

os.makedirs(OUT_DIR, exist_ok=True)

session = requests.Session()
session.headers.update(UA)


def fetch_image(url, retries=3):
    for attempt in range(retries):
        try:
            r = session.get(url, timeout=40)
            head = r.content[:16]
            if r.status_code == 200 and (
                head[:3] == b"\xff\xd8\xff"
                or head[:8] == b"\x89PNG\r\n\x1a\n"
                or head[:4] == b"RIFF" and r.content[8:12] == b"WEBP"
            ):
                return r.content
        except Exception:  # noqa: BLE001
            pass
        time.sleep(1.5 + attempt * 2 + random.random())
    return None


def process(entry):
    local = os.path.join(ROOT, entry["local"])
    remote = entry["remote"]
    if os.path.exists(local) and os.path.getsize(local) > 3000:
        return True
    blob = fetch_image(remote)
    if not blob:
        return False
    try:
        im = Image.open(io.BytesIO(blob))
        im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
        if im.mode == "RGBA":
            bg = Image.new("RGB", im.size, (255, 255, 255))
            bg.paste(im, mask=im.split()[3])
            im = bg
        if im.width > 700:
            h = round(im.height * 700 / im.width)
            im = im.resize((700, h), Image.LANCZOS)
        im.save(local, "JPEG", quality=82)
        return True
    except Exception as e:  # noqa: BLE001
        print(f"  !! {entry['local']}: {e}")
        return False


def main():
    with open(MANIFEST, encoding="utf-8") as f:
        manifest = json.load(f)
    print(f"downloading {len(manifest)} images…")
    ok = 0
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=6) as ex:
        for i, done in enumerate(ex.map(process, manifest)):
            ok += 1 if done else 0
            if (i + 1) % 100 == 0:
                print(f"  {i + 1}/{len(manifest)} ({(i + 1) / (time.time() - t0):.0f}/s)")
    print(f"IMAGES DONE: {ok}/{len(manifest)} in {time.time() - t0:.0f}s")


if __name__ == "__main__":
    main()
