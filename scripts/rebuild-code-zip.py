#!/usr/bin/env python3
"""Rebuild the smaller CODE-only zip from the old CODE zip manifest + current disk contents.

Usage: python3 scripts/rebuild-code-zip.py
Output: download/wardrobecare-CODE.zip (and copies nothing else).
"""
import hashlib
import os
import zipfile

PROJ = "/home/z/my-project"
OLD = os.path.join(PROJ, "download", "wardrobecare-CODE.zip")
OUT = os.path.join(PROJ, "download", "wardrobecare-CODE.zip")

# Read manifest (file list) from the existing CODE zip
with zipfile.ZipFile(OLD, "r") as z:
    manifest = z.namelist()

missing = []
tmp = OUT + ".tmp"
with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for name in manifest:
        if name.endswith("/"):
            z.writestr(name, "")
            continue
        path = os.path.join(PROJ, name)
        if not os.path.isfile(path):
            missing.append(name)
            continue
        z.write(path, name)
    # Include any new source files added since the last build (src/, prisma/)
    for root in ("src", "prisma"):
        base = os.path.join(PROJ, root)
        for dirpath, _dirnames, filenames in os.walk(base):
            for fn in filenames:
                full = os.path.join(dirpath, fn)
                rel = os.path.relpath(full, PROJ)
                if rel not in manifest:
                    z.write(full, rel)
                    print(f"  + added new file: {rel}")
    # New public assets are added EXPLICITLY (walking all of public/ would
    # pull every product image and explode the CODE zip)
    NEW_PUBLIC_FILES = [
        "public/services/personal-shopping-hero.jpg",
        "public/services/personal-shopping-detail.jpg",
    ]
    for rel in NEW_PUBLIC_FILES:
        if rel not in manifest and os.path.isfile(os.path.join(PROJ, rel)):
            z.write(os.path.join(PROJ, rel), rel)
            print(f"  + added new file: {rel}")

os.replace(tmp, OUT)

# Verify
md5 = hashlib.md5(open(OUT, "rb").read()).hexdigest()
size = os.path.getsize(OUT)
with zipfile.ZipFile(OUT) as z:
    bad = z.testzip()
    nav_ok = any("nav-data.ts" in n for n in z.namelist())
print(f"CODE zip rebuilt: {len(z.namelist())} entries, integrity={'OK' if bad is None else 'FAIL:' + bad}")
print(f"nav-data.ts included: {nav_ok}")
print(f"missing from disk: {len(missing)}")
print(f"FINAL: {OUT}  {size} bytes  md5={md5}")
