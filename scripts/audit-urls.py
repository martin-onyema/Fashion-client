#!/usr/bin/env python3
"""Extract every distinct images.unsplash.com URL from src/ and db/custom.db.
Outputs scripts/urls.json  {photo_id: {"url":..., "src_refs":[...], "db_count":N}}"""
import json, re, sqlite3
from pathlib import Path
from collections import defaultdict

ROOT = Path("/home/z/my-project")
PAT = re.compile(r"https://images\.unsplash\.com/(photo-[A-Za-z0-9\-_]+)")

refs = defaultdict(lambda: {"url": "", "src_refs": [], "db_count": 0})

def note(url: str, where: str):
    m = PAT.search(url)
    if not m:
        return
    pid = m.group(1)
    refs[pid]["url"] = f"https://images.unsplash.com/{pid}"
    if where.startswith("src:") and where not in refs[pid]["src_refs"]:
        refs[pid]["src_refs"].append(where)

# 1) source files
for f in (ROOT / "src").rglob("*"):
    if f.is_file() and f.suffix in {".ts", ".tsx", ".css", ".js"}:
        try:
            text = f.read_text(errors="ignore")
        except Exception:
            continue
        for m in PAT.finditer(text):
            note(m.group(0), f"src:{f.relative_to(ROOT)}")

# 2) database (every table, every text column)
con = sqlite3.connect(ROOT / "db" / "custom.db")
cur = con.cursor()
tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'")]
for t in tables:
    cols = cur.execute(f'PRAGMA table_info("{t}")').fetchall()
    for _cid, name, ctype, *_rest in cols:
        if "TEXT" not in (ctype or "").upper() and "CHAR" not in (ctype or "").upper():
            continue
        try:
            rows = cur.execute(f'SELECT "{name}" FROM "{t}"').fetchall()
        except Exception:
            continue
        for (val,) in rows:
            if val and "unsplash" in str(val):
                for m in PAT.finditer(str(val)):
                    pid = m.group(1)
                    note(m.group(0), f"db:{t}.{name}")
                    refs[pid]["db_count"] += 1

out = ROOT / "scripts" / "urls.json"
out.write_text(json.dumps(refs, indent=1))
print(f"distinct photo ids: {len(refs)}")
print(f"  with src refs: {sum(1 for v in refs.values() if v['src_refs'])}")
print(f"  db-only: {sum(1 for v in refs.values() if not v['src_refs'])}")
print(f"total db cell hits: {sum(v['db_count'] for v in refs.values())}")
