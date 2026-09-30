#!/usr/bin/env python3
"""Download every distinct Unsplash original to scripts/orig/<pid>.jpg
Dead/failed downloads are recorded in scripts/orig-status.json"""
import json, urllib.request, struct
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

ROOT = Path("/home/z/my-project")
ORIG = ROOT / "scripts" / "orig"
ORIG.mkdir(exist_ok=True)

refs = json.loads((ROOT / "scripts" / "urls.json").read_text())

def sniff(data: bytes) -> str:
    if data[:3] == b"\xff\xd8\xff":
        return "jpeg"
    if data[:8] == b"\x89PNG\r\n\x1a\n":
        return "png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    if b"<html" in data[:200].lower() or b"<!doctype" in data[:200].lower():
        return "html"
    return "unknown"

def fetch(pid: str):
    url = f"https://images.unsplash.com/{pid}?w=1200&q=80&fm=jpg&fit=max"
    dest = ORIG / f"{pid}.jpg"
    if dest.exists() and dest.stat().st_size > 15000:
        return pid, "cached", dest.stat().st_size
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=45) as r:
            data = r.read()
        kind = sniff(data)
        if kind in {"jpeg", "png", "webp"} and len(data) > 15000:
            dest.write_bytes(data)
            return pid, kind, len(data)
        return pid, f"BAD:{kind}:{len(data)}B", len(data)
    except Exception as e:
        return pid, f"ERR:{type(e).__name__}", 0

with ThreadPoolExecutor(max_workers=8) as ex:
    results = list(ex.map(fetch, refs.keys()))

status = {pid: {"state": st, "bytes": n} for pid, st, n in results}
(ROOT / "scripts" / "orig-status.json").write_text(json.dumps(status, indent=1))
bad = [p for p, s in status.items() if not s["state"] in ("jpeg", "cached", "png", "webp")]
print(f"downloaded ok: {len(status) - len(bad)}  bad: {len(bad)}")
for p in bad:
    print(f"  BAD {p} -> {status[p]['state']}")
