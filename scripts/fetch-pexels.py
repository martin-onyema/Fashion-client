#!/usr/bin/env python3
"""Download candidate Pexels photos by ID for visual curation."""
import urllib.request, concurrent.futures, json
from pathlib import Path

OUT = Path("/home/z/my-project/scripts/search/pexels")
OUT.mkdir(parents=True, exist_ok=True)

CANDIDATES = [
    2379004, 1043471, 3785079, 91227, 428364, 837140, 912027, 1300402,
    1499327, 1681010, 1689731, 1858175, 2065195, 2076930, 2092470, 2122361,
    2379005, 2897883, 3052361, 3760263, 3781538, 3812743, 927022, 1124468,
    1587009, 1898555, 291762, 1367200, 1083545, 2269872, 614810, 1222271,
    874158, 1687675, 1681007, 1681312, 1040945, 972995, 764847, 1043474,
    1043473, 1183266, 2050994, 1683975, 3777943, 3785078, 1462980, 1462982,
]

def fetch(pid):
    dest = OUT / f"pex-{pid}.jpg"
    if dest.exists() and dest.stat().st_size > 15000:
        return pid, "cached"
    url = f"https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&w=1200"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
        if len(data) > 15000 and data[:3] == b"\xff\xd8\xff":
            dest.write_bytes(data)
            return pid, "ok"
        return pid, f"BAD {len(data)}B"
    except Exception as e:
        return pid, f"ERR {type(e).__name__}"

with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
    results = dict(ex.map(fetch, CANDIDATES))

ok = [p for p, s in results.items() if s in ("ok", "cached")]
bad = {p: s for p, s in results.items() if s not in ("ok", "cached")}
print(f"ok: {len(ok)}  bad: {len(bad)}")
print("bad ids:", json.dumps(bad))
