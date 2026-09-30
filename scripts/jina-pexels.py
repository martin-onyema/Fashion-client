#!/usr/bin/env python3
"""Jina-render Pexels search pages per category, extract photo IDs."""
import subprocess, json, re, time
from pathlib import Path

OUT = Path("/home/z/my-project/scripts/search/jina")
OUT.mkdir(parents=True, exist_ok=True)

QUERIES = {
    "suit":        "black man suit fashion",
    "whitetee":    "black man white t-shirt",
    "denim":       "black man denim jacket",
    "leather":     "black man leather jacket",
    "traditional": "african man traditional fashion",
    "barber":      "barber shop black man haircut",
    "street":      "black man street style fashion",
    "duo":         "two black men friends fashion",
    "polo":        "man polo shirt fashion",
    "shorts":      "man shorts summer fashion",
    "chinos":      "man chinos outfit fashion",
    "groom":       "african wedding groom attire",
}

def jina(q: str, tag: str) -> list:
    dest = OUT / f"{tag}.txt"
    if dest.exists() and dest.stat().st_size > 5000:
        text = dest.read_text(errors="ignore")
    else:
        url = f"https://r.jina.ai/https://www.pexels.com/search/{q.replace(' ', '%20')}/"
        try:
            r = subprocess.run(["curl", "-s", "--max-time", "75", url],
                               capture_output=True, text=True, timeout=80)
            text = r.stdout
        except Exception:
            text = ""
        dest.write_text(text or "")
        time.sleep(1)
    ids = re.findall(r"images\.pexels\.com/photos/(\d+)", text)
    seen, ordered = set(), []
    for i in ids:
        if i not in seen:
            seen.add(i)
            ordered.append(i)
    return ordered[:24]

result = {}
for tag, q in QUERIES.items():
    ids = jina(q, tag)
    result[tag] = ids
    print(f"{tag}: {len(ids)} ids  {ids[:6]}")

(OUT / "category-ids.json").write_text(json.dumps(result, indent=1))
