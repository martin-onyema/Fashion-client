#!/usr/bin/env python3
"""Task 13: Replace feminine-coded images with masculine ones.
Pipeline consistent with existing assets: Lanczos + UnsharpMask + progressive JPEG q82.
"""
from PIL import Image, ImageFilter, ImageEnhance
import os

OUT = '/home/z/my-project/public'
os.makedirs(f'{OUT}/about', exist_ok=True)
os.makedirs(f'{OUT}/images', exist_ok=True)


def process(src, dst, target_w, target_h, crop_box=None, quality=82):
    im = Image.open(src).convert('RGB')
    if crop_box:
        im = im.crop(crop_box)
    # center-crop to target aspect
    tw, th = target_w, target_h
    ta = tw / th
    w, h = im.size
    a = w / h
    if abs(a - ta) > 0.01:
        if a > ta:  # too wide
            nw = int(h * ta)
            x = (w - nw) // 2
            im = im.crop((x, 0, x + nw, h))
        else:  # too tall
            nh = int(w / ta)
            y = (h - nh) // 2
            im = im.crop((0, y, w, y + nh))
    if im.size != (tw, th):
        im = im.resize((tw, th), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=68, threshold=2))
    im = ImageEnhance.Contrast(im).enhance(1.02)
    im.save(dst, 'JPEG', quality=quality, optimize=True, progressive=True)
    kb = os.path.getsize(dst) // 1024
    print(f'{dst}: {tw}x{th} {kb}KB')


C = '/tmp/cand'
# 1. Home Fitting service — dark masculine walk-in wardrobe (replaces women's dresses)
process(f'{C}/s1-5.img', f'{OUT}/services/home-fitting.jpg', 1200, 800)
# 2. Personal Shopping service — classic menswear boutique (replaces feminine-leaning rack)
process(f'{C}/s2-3.img', f'{OUT}/services/personal-shopping.jpg', 1200, 800)
# 3. Outfit Gifting service — matte black gift boxes (replaces pink heart gift box)
process(f'{C}/gift-gen.png', f'{OUT}/services/outfit-gifting.jpg', 1200, 800)
# 4. About page — stylish man with leather bag outside boutique (replaces woman w/ shopping bags)
process(f'{C}/s4-1.img', f'{OUT}/about/styling-session.jpg', 1080, 1350)
# 5. IG fallback — man in quilted vest (replaces woman shopping, square tile)
process(f'{C}/s2-5.img', f'{OUT}/images/ig-menswear.jpg', 800, 800)
print('DONE')
