#!/usr/bin/env python3
"""ONE-SHOT image migration:
1. Copy 27 keep-originals + fetch 18 black-model picks -> public/images/
2. Client asooke agbada -> ig grid lead image
3. Rewrite DB (all tables/text cols) + src/** unsplash refs -> /images/<name>.jpg
4. Set HomepageContent.instagramImages + instagram-section.tsx defaults (6)
5. Verify: zero unsplash anywhere, every referenced local file exists
"""
import json, re, shutil, sqlite3, urllib.request
from pathlib import Path
from collections import defaultdict

ROOT = Path("/home/z/my-project")
PUB = ROOT / "public" / "images"
PUB.mkdir(parents=True, exist_ok=True)
ORIG = ROOT / "scripts" / "orig"
POOL = ROOT / "scripts" / "search" / "pool"

refs = json.loads((ROOT / "scripts" / "urls.json").read_text())
tail2full = {}
for pid in refs:
    tail2full[pid[-10:]] = pid

# tail10 -> local filename (KEEP originals)
KEEP = {
    "3728e1935b": "woman-shopping-burgundy.jpg",
    "7f8cb49891": "suit-accessories-flatlay.jpg",
    "64f9cf17ab": "black-man-white-tee-classic.jpg",
    "b97e060509": "brown-monk-shoes.jpg",
    "b084683601": "chanel-no5.jpg",
    "7c3835535d": "folded-jeans-stack.jpg",
    "ec264c27ff": "red-nike-sneaker.jpg",
    "075a1d41f2": "denim-jacket-teal.jpg",
    "2c031ac5ea": "woman-cargo-joggers.jpg",
    "5a672e8a03": "curology-skincare.jpg",
    "63f95609a7": "grey-hoodie-back.jpg",
    "4232fdb516": "white-graphic-tee-back.jpg",
    "b3f281503f": "rayban-wayfarer.jpg",
    "47f3842f27": "kuma-print-tee.jpg",
    "123a1eb820": "white-tee-hanger.jpg",
    "36f5b7be1a": "black-tee-hanger.jpg",
    "89df76afd3": "red-leather-bag.jpg",
    "78c282e89b": "white-trucker-cap.jpg",
    "1aecb6caea": "olive-bomber-hanger.jpg",
    "fbafd7f539": "coco-perfume.jpg",
    "7e34085b2c": "denim-shirt-flatlay.jpg",
    "86cc2a3ccf": "dress-shirts-trio.jpg",
    "31b7b14ad0": "jeans-rack.jpg",
    "120bd6d753": "brown-brogues.jpg",
    "c6dcb6d633": "white-sweatshirt-flatlay.jpg",
    "0fb60583dc": "brown-leather-belt.jpg",
    "4758594e93": "brown-bifold-wallet.jpg",
}
# tail10 (or dead pid) -> (pexels_id, filename)  [REPLACE with black-model shots]
REPLACE = {
    "801b869a1a": (5524436, "black-man-chinos-street.jpg"),
    "5cc3e65df4": (35374302, "black-man-linen-shirt.jpg"),
    "9cd4e2cf59": (6626361, "new-season-group.jpg"),
    "2162b0f3f1": (19140178, "black-man-grooming.jpg"),
    "1dd7228f2d": (8508760, "black-man-white-tee.jpg"),
    "3779587ccf": (35686192, "black-man-blazer-studio.jpg"),
    "1ac7f401a0": (39696794, "black-man-navy-suit.jpg"),
    "148c4dae35": (9322950, "black-man-suit-editorial.jpg"),
    "b4d707412e": (7061988, "black-man-denim-jacket.jpg"),
    "1eba835eb1": (32527462, "black-man-leather-jacket.jpg"),
    "924c800a22": (12317931, "ig-blue-suits-duo.jpg"),
    "1624206112918-f2f7f2c5b3e7": (31874402, "black-man-formal-trousers.jpg"),
    "1591195854234-9c5b4eaaab7c": (27721736, "black-man-shorts-summer.jpg"),
    "1626497764746-6dc3652e2c1e": (34630594, "black-man-polo-bw.jpg"),
    "9ceadc732d": (34630594, "black-man-polo-bw.jpg"),
}
# extra IG grid images (no pid mapping, direct adds)
IG_EXTRAS = {
    34067459: "ig-groomsmen-agbada.jpg",
    11086637: "ig-gold-agbada.jpg",
    35429611: "ig-blue-agbada.jpg",
    37906285: "ig-groom-detail.jpg",
}
IG_GRID = [
    "/images/client-asooke-agbada.jpg",
    "/images/ig-groomsmen-agbada.jpg",
    "/images/ig-gold-agbada.jpg",
    "/images/ig-blue-agbada.jpg",
    "/images/ig-groom-detail.jpg",
    "/images/ig-blue-suits-duo.jpg",
]

# ---------- 1) materialize files ----------
def fetch_pexels(pid: int, dest: Path):
    if dest.exists() and dest.stat().st_size > 15000:
        return "cached"
    url = f"https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&w=1200"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=45) as r:
        data = r.read()
    assert len(data) > 15000 and data[:3] == b"\xff\xd8\xff", f"bad download {pid}"
    dest.write_bytes(data)
    return "ok"

mapping = {}  # full unsplash pid (or dead pid) -> "/images/<name>.jpg"
for tail, name in KEEP.items():
    pid = tail2full.get(tail)
    assert pid, f"tail {tail} not found"
    src = ORIG / f"{pid}.jpg"
    dst = PUB / name
    shutil.copyfile(src, dst)
    mapping[pid] = f"/images/{name}"
for tail, (px, name) in REPLACE.items():
    if tail in tail2full:
        pid = tail2full[tail]
    else:
        pid = f"photo-{tail}"  # dead links stored as full pid in urls.json
    fetch_pexels(px, PUB / name)
    mapping[pid] = f"/images/{name}"
for px, name in IG_EXTRAS.items():
    fetch_pexels(px, PUB / name)
shutil.copyfile(ROOT / "scripts/orig/client-0.jpg", PUB / "client-asooke-agbada.jpg")
n_files = len(list(PUB.glob("*.jpg")))
print(f"[1] public/images now has {n_files} files")

# ---------- 2) DB rewrite ----------
con = sqlite3.connect(ROOT / "db" / "custom.db")
cur = con.cursor()
repl_counts = defaultdict(int)
for (t,) in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall():
    cols = [r[1] for r in cur.execute(f'PRAGMA table_info("{t}")').fetchall()]
    for c in cols:
        try:
            rows = cur.execute(f'SELECT rowid, "{c}" FROM "{t}"').fetchall()
        except Exception:
            continue
        for rid, v in rows:
            if not v or "unsplash" not in str(v):
                continue
            nv = str(v)
            for pid, local in mapping.items():
                pat = re.compile(r"https://images\.unsplash\.com/" + re.escape(pid) + r"(\?[^\s\"'\)\]}]*)?")
                if pat.search(nv):
                    nv = pat.sub(local, nv)
                    repl_counts[pid] += 1
            if nv != str(v):
                cur.execute(f'UPDATE "{t}" SET "{c}"=? WHERE rowid=?', (nv, rid))
# instagram grid override
try:
    cur.execute('UPDATE HomepageContent SET "instagramImages"=? WHERE rowid=1',
                (json.dumps(IG_GRID),))
    repl_counts["IG_GRID"] += 1
except Exception as e:
    print("IG grid update failed:", e)
con.commit()
con.close()
print(f"[2] DB rewritten, top hits: {dict(sorted(repl_counts.items(), key=lambda x: -x[1])[:8])}")

# ---------- 3) src rewrite ----------
changed = []
for f in (ROOT / "src").rglob("*"):
    if not f.is_file() or f.suffix not in {".ts", ".tsx", ".css", ".js"}:
        continue
    text = f.read_text(errors="ignore")
    if "unsplash" not in text and "photo-1\\n" not in text:
        continue
    nv = text
    for pid, local in mapping.items():
        pat = re.compile(r"https://images\.unsplash\.com/" + re.escape(pid) + r"(\?[^\s\"'\)\]}]*)?")
        nv = pat.sub(local, nv)
    nv = nv.replace(
        "https://images.unsplash.com/photo-1\\nhttps://images.unsplash.com/photo-2",
        "/images/black-man-white-tee.jpg\\n/images/black-man-polo-bw.jpg",
    )
    if nv != text:
        f.write_text(nv)
        changed.append(str(f.relative_to(ROOT)))
print(f"[3] src files rewritten: {len(changed)} -> {changed}")

# ---------- 4) instagram-section defaults ----------
igsec = ROOT / "src/components/home/instagram-section.tsx"
if igsec.exists():
    text = igsec.read_text()
    json_arr = json.dumps(IG_GRID, indent=8).replace('"', "'")
    new = re.sub(r"const\s+fallbackImages\s*=\s*\[[^\]]*\]", f"const fallbackImages = {json_arr}", text, flags=re.S)
    if new == text:
        new = re.sub(r"const\s+\w*[Ii]mages\w*\s*(:\s*[^=]+)?=\s*\[[^\]]*\]",
                     f"const fallbackImages = {json_arr}", text, count=1, flags=re.S)
    igsec.write_text(new)
    print("[4] instagram-section.tsx defaults set")

# ---------- 5) verify ----------
import subprocess
r1 = subprocess.run(["rg", "-c", "images.unsplash.com", "src/"], capture_output=True, text=True, cwd=ROOT)
con = sqlite3.connect(ROOT / "db" / "custom.db")
cur = con.cursor()
n_db = 0
for (t,) in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall():
    for _cid, c, ctype, *_ in cur.execute(f'PRAGMA table_info("{t}")').fetchall():
        if "TEXT" not in (ctype or "").upper() and "CHAR" not in (ctype or "").upper():
            continue
        try:
            n_db += cur.execute(f'SELECT COUNT(*) FROM "{t}" WHERE "{c}" LIKE \'%unsplash%\'').fetchone()[0]
        except Exception:
            pass
missing = []
for f in (ROOT / "src").rglob("*.tsx"):
    for m in re.finditer(r"/images/([a-z0-9\-]+\.jpg)", f.read_text(errors="ignore")):
        if not (PUB / m.group(1)).exists():
            missing.append(f"{f.name}: {m.group(1)}")
print(f"[5] VERIFY: unsplash in src: {r1.stdout.strip() or '0 files'} | unsplash rows in db: {n_db} | missing local refs: {len(missing)}")
for m in missing[:10]:
    print("   ", m)
print("DONE" if not missing and not r1.stdout.strip() and n_db == 0 else "ATTENTION NEEDED")
