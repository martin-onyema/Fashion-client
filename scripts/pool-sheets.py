#!/usr/bin/env python3
"""Download all unique candidate IDs from category-ids.json, build sheets."""
import json, urllib.request, concurrent.futures
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

BASE = Path("/home/z/my-project/scripts/search")
POOL = BASE / "pool"
POOL.mkdir(exist_ok=True)

cats = json.loads((BASE / "jina" / "category-ids.json").read_text())
all_ids = []
seen = set()
for tag, ids in cats.items():
    for i in ids:
        if i not in seen:
            seen.add(i)
            all_ids.append(i)

def fetch(pid):
    dest = POOL / f"{pid}.jpg"
    if dest.exists() and dest.stat().st_size > 15000:
        return pid, "cached"
    url = f"https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&w=900"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
        if len(data) > 15000 and data[:3] == b"\xff\xd8\xff":
            dest.write_bytes(data)
            return pid, "ok"
        return pid, f"BAD{len(data)}"
    except Exception as e:
        return pid, f"ERR{type(e).__name__}"

with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
    results = dict(ex.map(fetch, all_ids))
ok = [p for p in all_ids if results[p] in ("ok", "cached")]
print(f"pool ok: {len(ok)}/{len(all_ids)}")

# sheets
THUMB, LABEL, COLS, ROWS = 250, 30, 5, 4
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
index = {}
page_no = 0
for start in range(0, len(ok), COLS * ROWS):
    batch = ok[start:start + COLS * ROWS]
    sheet = Image.new("RGB", (COLS * THUMB, ROWS * (THUMB + LABEL)), "white")
    d = ImageDraw.Draw(sheet)
    for i, pid in enumerate(batch):
        idx = start + i
        index[str(idx)] = pid
        r, c = divmod(i, COLS)
        x0, y0 = c * THUMB, r * (THUMB + LABEL)
        try:
            im = Image.open(POOL / f"{pid}.jpg").convert("RGB")
            w, h = im.size
            s = min(w, h)
            im = im.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2)).resize((THUMB, THUMB))
            sheet.paste(im, (x0, y0 + LABEL))
        except Exception:
            d.text((x0 + 10, y0 + 120), "BAD", fill="red", font=font)
        d.rectangle([x0, y0, x0 + 80, y0 + LABEL], fill="black")
        d.text((x0 + 6, y0 + 4), f"#{idx:03d}", fill="white", font=font)
        d.text((x0 + 88, y0 + 4), pid, fill="black", font=font)
    out = BASE / f"cur-{page_no}.jpg"
    sheet.save(out, quality=80)
    print(f"{out.name}: #{start:03d}..#{start + len(batch) - 1:03d}")
    page_no += 1

(BASE / "cur-index.json").write_text(json.dumps(index, indent=1))
print("total:", len(ok))
