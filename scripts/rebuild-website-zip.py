#!/usr/bin/env python3
"""Rebuild wardrobecare-website.zip from the old zip's manifest.

Keeps the exact same file set (1,762 files) with current on-disk contents,
plus .env.production. Excludes sandbox-only delivery files automatically
(they were never in the manifest: public/downloads/, download-page.html).
"""
import zipfile, os, sys, hashlib

PROJ = "/home/z/my-project"
# Files intentionally deleted from disk after the manifest was frozen —
# their absence is expected and must not abort the swap.
REMOVED_OK = {
    "src/app/faq/faq-content.tsx",  # replaced by static src/lib/faq-data.ts FAQ (Task 29)
    "public/robots.txt",  # replaced by dynamic src/app/robots.ts (Task 29 created it; conflict fixed in Task 32)
    "src/components/layout/owner-download-button.tsx",  # Task 37 floating download button — user asked for its removal (Task 38)
}
OLD = f"{PROJ}/download/wardrobecare-website.zip"
NEW = f"{PROJ}/download/wardrobecare-website.zip.new"
FINAL = f"{PROJ}/download/wardrobecare-website.zip"

old = zipfile.ZipFile(OLD)
manifest = old.namelist()
for extra in [".env.production", "scripts/test-paystack-e2e.ts"]:
    if extra not in manifest:
        manifest = manifest + [extra]

missing = []
with zipfile.ZipFile(NEW, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for name in manifest:
        if name.endswith("/"):
            z.writestr(name, "")  # explicit directory entry, preserve it
            continue
        path = os.path.join(PROJ, name)
        if not os.path.isfile(path):
            missing.append(name)
            continue
        z.write(path, name)

    # ---- Pick up files added on disk since the manifest was frozen ----
    # Curated to DEPLOYABLE site files only: src/, prisma/, public/ (minus
    # downloads + stray nested dir), db/, root-level files, and top-level
    # scripts/. Sandbox workspace junk (scripts/wc-pages, scripts/shots,
    # skills/, upload/, *.zip copies) is never added.
    EXCLUDE_DIR_NAMES = {"node_modules", ".next", ".turbo", ".git", ".vercel",
                         "download", "downloads", "wc-pages", "shots",
                         "wc-data", "img-audit", "skills", "upload", "tmp"}
    EXCLUDE_FILE_EXACT = {"download-page.html", ".DS_Store", "dev.log"}
    SKIP_SUFFIXES = (".log", ".db-journal", ".db-wal", ".db-shm", ".tmp")

    WALK_ROOTS = ("src", "prisma", "public", "db", "scripts")
    manifest_set = set(manifest)
    added = 0

    def _add(path, rel):
        # z.write() fails on files with pre-1980 timestamps (epoch-0 uploads)
        try:
            z.write(path, rel)
        except ValueError:
            zi = zipfile.ZipInfo(rel, date_time=(1980, 1, 1, 0, 0, 0))
            zi.compress_type = zipfile.ZIP_DEFLATED
            zi.external_attr = 0o644 << 16
            with open(path, "rb") as f:
                z.writestr(zi, f.read())

    for root in WALK_ROOTS:
        base = os.path.join(PROJ, root)
        if not os.path.isdir(base):
            continue
        # scripts/: top-level files only — subdirs are workspace scratch
        allow_subdirs = root != "scripts"
        for dirpath, dirnames, filenames in os.walk(base):
            rel_dir = os.path.relpath(dirpath, PROJ)
            if not allow_subdirs and rel_dir != root:
                dirnames[:] = []
                continue
            dirnames[:] = [d for d in dirnames
                           if d not in EXCLUDE_DIR_NAMES
                           and not (root == "public" and d == "public")]
            for fn in filenames:
                rel = os.path.relpath(os.path.join(dirpath, fn), PROJ)
                if rel in manifest_set or rel in EXCLUDE_FILE_EXACT:
                    continue
                if fn.endswith(SKIP_SUFFIXES):
                    continue
                _add(os.path.join(dirpath, fn), rel)
                added += 1

    # Root-level files (non-recursive), excluding archives and logs
    for fn in os.listdir(PROJ):
        p = os.path.join(PROJ, fn)
        if not os.path.isfile(p):
            continue
        if fn in manifest_set or fn in EXCLUDE_FILE_EXACT or fn.endswith(SKIP_SUFFIXES):
            continue
        if fn.endswith((".zip",)):
            continue
        _add(p, fn)
        added += 1
    if added:
        print(f"  + added {added} new file(s) from disk")

unexpected_missing = [m for m in missing if m not in REMOVED_OK]
if missing:
    print("MISSING FROM DISK (skipped):")
    for m in missing:
        print("  ", m)
    for m in missing:
        if m in REMOVED_OK:
            print("  (intentionally removed, ok)", m)

z = zipfile.ZipFile(NEW)
bad = z.testzip()
names = z.namelist()
print("new zip files:", len(names), "(old:", len(manifest) - (1 if '.env.production' not in old.namelist() else 0), ")")
print("integrity:", "FAILED at " + bad if bad else "OK")
print("has .env.production:", ".env.production" in names)

# spot-check updated content landed
deploy = z.read("DEPLOY.md").decode("utf-8", "ignore")
print("DEPLOY.md is zero-config version:", "Everything is pre-configured" in deploy and "vercel --prod" in deploy)
envprod = z.read(".env.production").decode("utf-8", "ignore")
print(".env.production has pooler URL:", "aws-1-eu-west-1.pooler.supabase.com:6543" in envprod)
print(".env.production has secret:", "hhzNdctvn" in envprod)
gitig = z.read(".gitignore").decode("utf-8", "ignore")
print(".gitignore allows .env.production:", "!.env.production" in gitig)
chat = z.read("src/app/api/chat/route.ts").decode("utf-8", "ignore")
print("chatbot upgrade still in:", "extractIntent" in chat or "buildSystemPrompt" in chat)
layout = z.read("src/app/layout.tsx").decode("utf-8", "ignore")
print("download button NOT in layout:", "WC-DEV-DOWNLOAD" not in layout)

if bad or unexpected_missing:
    print("ABORTING swap due to errors")
    sys.exit(1)

os.replace(NEW, FINAL)
size = os.path.getsize(FINAL)
md5 = hashlib.md5(open(FINAL, "rb").read()).hexdigest()
print(f"FINAL: {FINAL}  {size} bytes  md5={md5}")
