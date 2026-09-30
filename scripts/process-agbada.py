#!/usr/bin/env python3
"""Process the uploaded Asooke Agbada photo for the Traditional Wear Consultation page.

Produces two art-directed masters:
- public/services/traditional-wear-consultation.jpg        1200x800 landscape (desktop hero + cards)
- public/services/traditional-wear-consultation-mobile.jpg  800x1000 portrait  (mobile hero)

Both: Lanczos resample, gentle unsharp mask, progressive JPEG q82, metadata stripped.
"""
from PIL import Image, ImageFilter
import os

SRC = "/tmp/agbada-src.jfif"
OUT_SERVICES = "/home/z/my-project/public/services"
DESKTOP_OUT = os.path.join(OUT_SERVICES, "traditional-wear-consultation.jpg")
MOBILE_OUT = os.path.join(OUT_SERVICES, "traditional-wear-consultation-mobile.jpg")

im = Image.open(SRC).convert("RGB")
w, h = im.size
print(f"source: {w}x{h}")

# ── Desktop master: 3:2 landscape, top-biased band (cap + face + flowing sleeves) ──
crop_h = round(w * 2 / 3)  # 491 for w=736
y0 = 48  # keep raised hand, cap, face, necklace, upper agbada wings
y0 = max(0, min(y0, h - crop_h))
desk = im.crop((0, y0, w, y0 + crop_h))
desk = desk.resize((1200, 800), Image.LANCZOS)
desk = desk.filter(ImageFilter.UnsharpMask(radius=2, percent=70, threshold=2))
desk.save(DESKTOP_OUT, "JPEG", quality=82, optimize=True, progressive=True)
print(f"desktop: {desk.size} -> {DESKTOP_OUT} ({os.path.getsize(DESKTOP_OUT)//1024}KB)")

# ── Mobile master: full-frame 4:5 portrait (whole outfit visible on tall hero) ──
mob = im.resize((800, 1000), Image.LANCZOS)
mob = mob.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=2))
mob.save(MOBILE_OUT, "JPEG", quality=82, optimize=True, progressive=True)
print(f"mobile: {mob.size} -> {MOBILE_OUT} ({os.path.getsize(MOBILE_OUT)//1024}KB)")

# preview copies for visual QA
desk.save("/tmp/agbada-desktop-preview.png")
mob.save("/tmp/agbada-mobile-preview.png")
print("previews saved")
