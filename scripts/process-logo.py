#!/usr/bin/env python3
"""
Wardrobecare logo processing.

Input : /tmp/logo-work/logo-clean.png  (1024x1024 RGB, white bg, navy/orange ink)
Output:
  public/logo.png            wordmark only, original ink colours, transparent bg
  public/logo-black.png      wordmark recoloured to #121110 (mono design system)
  public/logo-white.png      wordmark recoloured to white (dark footer)
  public/logo-full-color.png full logo incl. tagline, original colours
  src/app/icon.png           512x512 favicon, full logo on white, padded square

Method:
  1. alpha = distance from white (keeps antialiasing, makes ink recolourable)
  2. find the horizontal gap separating the wordmark from the tagline block
  3. crop each part with 6% padding
"""
from PIL import Image
import numpy as np

SRC = "/tmp/logo-work/logo-clean.png"
OUT_PUBLIC = "public"
OUT_ICON = "src/app"

INK = (18, 17, 16)  # #121110 -- the design system foreground


def ink_alpha(im):
    """Alpha mask: 255 where ink, scaled by distance from white."""
    rgb = np.asarray(im.convert("RGB")).astype(np.int16)
    dist = 255 - rgb.min(axis=2)  # white -> 0, saturated ink -> ~255
    a = np.clip(dist * (255.0 / 180.0), 0, 255).astype(np.uint8)
    return a


def trim_mask(a, pad_frac=0.06):
    ys, xs = np.where(a > 8)
    if not len(ys):
        raise SystemExit("empty mask")
    y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
    ph = int((y1 - y0) * pad_frac)
    pw = int((x1 - x0) * pad_frac)
    return max(0, y0 - ph), min(a.shape[0], y1 + ph + 1), max(0, x0 - pw), min(a.shape[1], x1 + pw + 1)


def find_splits(a, min_gap=6):
    """Rows that are fully blank (candidates for a gap between blocks)."""
    rows = (a > 8).sum(axis=1)
    blank = rows == 0
    runs = []
    start = None
    for i, b in enumerate(blank):
        if b and start is None:
            start = i
        elif not b and start is not None:
            if i - start >= min_gap:
                runs.append((start, i))
            start = None
    if start is not None and len(blank) - start >= min_gap:
        runs.append((start, len(blank)))
    return runs


def compose(rgba_color, a, box):
    y0, y1, x0, x1 = box
    h, w = y1 - y0, x1 - x0
    out = np.zeros((h, w, 4), dtype=np.uint8)
    out[..., 0] = rgba_color[0]
    out[..., 1] = rgba_color[1]
    out[..., 2] = rgba_color[2]
    out[..., 3] = a[y0:y1, x0:x1]
    return Image.fromarray(out, "RGBA")


def save(img, path):
    img.save(path)
    print("  ->", path, img.size)


def main():
    im = Image.open(SRC)
    a = ink_alpha(im)

    # average ink colour from the original (for logo.png / full-color)
    rgb = np.asarray(im.convert("RGB")).astype(np.float32)
    m = a > 60
    ink_rgb = tuple(int(rgb[..., c][m].mean()) for c in range(3))
    print("avg ink colour:", ink_rgb)

    y0, y1, x0, x1 = trim_mask(a)
    print("trimmed box:", (x0, y0, x1, y1))

    # split wordmark from tagline: the widest blank run in the trimmed area
    sub = a[y0:y1, x0:x1]
    splits = find_splits(sub)
    print("blank runs (rel):", splits[:6])
    wordmark_box = (y0, y1, x0, x1)
    full_box = (y0, y1, x0, x1)
    if splits:
        # choose the run closest to ~55-70% height (tagline sits below the script)
        hgt = sub.shape[0]
        best = None
        for (s, e) in splits:
            mid = (s + e) / 2
            frac = mid / hgt
            score = abs(frac - 0.68)
            if best is None or score < best[0]:
                best = (score, s, e)
        _, s, e = best
        wordmark_box = (y0, y0 + s, x0, x1)
        print(f"split at rows {s}-{e} -> wordmark box {wordmark_box}")

    # wordmark, original ink
    wm = compose(ink_rgb, a, wordmark_box)
    save(wm, f"{OUT_PUBLIC}/logo.png")
    # mono variants
    save(compose(INK, a, wordmark_box), f"{OUT_PUBLIC}/logo-black.png")
    save(compose((255, 255, 255), a, wordmark_box), f"{OUT_PUBLIC}/logo-white.png")
    # full logo (wordmark + tagline), original colours
    save(compose(ink_rgb, a, full_box), f"{OUT_PUBLIC}/logo-full-color.png")

    # favicon: full logo on white, square, 512
    fy0, fy1, fx0, fx1 = full_box
    crop = im.convert("RGB").crop((fx0, fy0, fx1, fy1))
    side = max(crop.size)
    canvas = Image.new("RGB", (side, side), (255, 255, 255))
    canvas.paste(crop, ((side - crop.width) // 2, (side - crop.height) // 2))
    canvas = canvas.resize((512, 512), Image.LANCZOS)
    save(canvas, f"{OUT_ICON}/icon.png")


if __name__ == "__main__":
    main()
