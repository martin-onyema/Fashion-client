#!/usr/bin/env python3
"""Build labeled contact sheets (grid of thumbs) from scripts/orig/*.jpg
so a human/model can classify each photo. Index map -> scripts/sheet-index.json"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path("/home/z/my-project")
ORIG = ROOT / "scripts" / "orig"
SHEETS = ROOT / "scripts" / "sheets"
SHEETS.mkdir(exist_ok=True)

THUMB = 260
LABEL_H = 34
COLS, ROWS = 4, 3
PER = COLS * ROWS

files = sorted(ORIG.glob("*.jpg"))
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
except Exception:
    font = ImageFont.load_default()

index = {}
page = 0
for start in range(0, len(files), PER):
    batch = files[start:start + PER]
    W, H = COLS * THUMB, ROWS * (THUMB + LABEL_H)
    sheet = Image.new("RGB", (W, H), "white")
    draw = ImageDraw.Draw(sheet)
    for i, f in enumerate(batch):
        idx = start + i
        index[str(idx)] = f.stem
        r, c = divmod(i, COLS)
        x0, y0 = c * THUMB, r * (THUMB + LABEL_H)
        try:
            im = Image.open(f).convert("RGB")
            w, h = im.size
            s = min(w, h)
            im = im.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2)).resize((THUMB, THUMB))
            sheet.paste(im, (x0, y0 + LABEL_H))
        except Exception as e:
            draw.text((x0 + 10, y0 + LABEL_H + 100), f"UNREADABLE {e}", fill="red", font=font)
        draw.rectangle([x0, y0, x0 + 90, y0 + LABEL_H], fill="black")
        draw.text((x0 + 8, y0 + 6), f"#{idx:02d}", fill="white", font=font)
        tail = f.stem[-10:]
        draw.text((x0 + 95, y0 + 6), tail, fill="black", font=font)
    out = SHEETS / f"sheet-{page}.jpg"
    sheet.save(out, quality=82)
    print(f"{out.name}: #{start:02d}..#{start + len(batch) - 1:02d}")
    page += 1

(ROOT / "scripts" / "sheet-index.json").write_text(json.dumps(index, indent=1))
print(f"total images: {len(files)}")
