#!/usr/bin/env python3
"""
Build ONE complete, self-contained Wardrobecare deliverable:
  - wardrobecare-complete.zip  (everything the website needs, in a single file)

Contents: full src/, both Prisma schemas, seeded demo db, public assets,
all scripts, DEPLOY.md, env templates, package-lock.json, vercel.json.
Excluded: node_modules/.next/.git and sandbox-only junk (restored by
`npm install` / Vercel automatically).

Self-validating: fails with non-zero exit if any duplicate entry, missing
key file, or broken zip is detected.
"""
import hashlib
import os
import zipfile
from pathlib import Path

ROOT = Path("/home/z/my-project")
OUT = ROOT / "download"
OUT.mkdir(exist_ok=True)

PORTABLE_ENV = '''# Portable local environment (safe on any machine).
# For PRODUCTION values see .env.production and DEPLOY.md section 2.
DATABASE_URL="file:./db/custom.db"
NEXTAUTH_SECRET="qpeD1LhpzwbQBwjsFoLy2tTKyJKDx0XWxlZujeLSIuM="
NEXTAUTH_URL="http://localhost:3000"
ADMIN_ACCESS_PATH="/wardrobe-hq-9xk2"
'''

EXCLUDE_DIRS = {
    "node_modules", ".next", ".git", "download", "skills", "mini-services",
    "examples", "upload", "verify", "video-frames", ".zscripts", "tests",
    "__pycache__", ".claude", ".playwright-mcp",
}
EXCLUDE_FILES = {"worklog.md", "dev.log", "build.log", ".DS_Store", "Caddyfile"}
EXCLUDE_SUFFIXES = {".pyc", ".log", ".tmp"}
FORCE_FILES = [".env.example", ".env.production", "DEPLOY.md"]

KEY_FILES = [
    "package.json", "package-lock.json", "vercel.json", "DEPLOY.md",
    ".env.production", ".env.example", ".gitignore",
    "db/custom.db", "scripts/prepare-standalone.mjs", "scripts/seed.ts",
    "src/middleware.ts", "src/lib/auth.ts", "src/lib/rate-limit.ts",
    "src/lib/email.ts", "src/lib/auth-fallback-secret.ts",
    "src/app/admin/login/page.tsx", "src/app/account/login/page.tsx",
    "prisma/schema.prisma", "prisma/schema.sqlite.prisma",
    "next.config.ts", "tsconfig.json",
]


def norm(name: str) -> str:
    name = name.replace("\\", "/")
    while name.startswith("./"):
        name = name[2:]
    return name.lstrip("/")


def build_zip(zip_path: Path, include_fn, env_override: bool) -> list:
    written = {}
    if zip_path.exists():
        zip_path.unlink()
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for full_path, arcname in include_fn():
            arcname = norm(arcname)
            if arcname in written:
                continue  # first occurrence wins, no duplicates
            written[arcname] = True
            zf.write(full_path, arcname)
        if env_override and ".env" not in written:
            zf.writestr(".env", PORTABLE_ENV)
            written[".env"] = True
    return list(written.keys())


def complete_files():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        rel = Path(dirpath).relative_to(ROOT)
        dirnames[:] = [x for x in dirnames if x not in EXCLUDE_DIRS
                       and not x.startswith("wardrobecare-")]
        for f in filenames:
            fp = Path(dirpath) / f
            if f == ".env":
                continue  # overridden with portable version below
            if f in EXCLUDE_FILES or fp.suffix in EXCLUDE_SUFFIXES:
                continue
            yield fp, str(fp.relative_to(ROOT))
    for name in FORCE_FILES:
        p = ROOT / name
        if p.is_file():
            yield p, name


def validate(zip_path: Path, names: list, key_files: list):
    with zipfile.ZipFile(zip_path) as zf:
        bad = zf.testzip()
        assert bad is None, f"corrupt member: {bad}"
        actual = {norm(n) for n in zf.namelist()}
    assert len(actual) == len(names), f"entry mismatch {len(actual)} vs {len(names)}"
    for k in key_files:
        assert k in actual, f"MISSING key file: {k}"
    # ghost-file guard: these stale files must NEVER ship again
    for ghost in ["src/components/account/verify-form.tsx",
                  "src/app/account/verify/page.tsx",
                  "src/app/digital-closet/notify-form.tsx",
                  "src/app/gift-card/checkout/gift-card-wizard.tsx",
                  "src/components/shop/category-hub.tsx"]:
        assert ghost not in actual, f"GHOST FILE PRESENT: {ghost}"
    size = zip_path.stat().st_size
    md5 = hashlib.md5(zip_path.read_bytes()).hexdigest()
    return size, md5


def main():
    complete_zip = OUT / "wardrobecare-complete.zip"
    names = build_zip(complete_zip, complete_files, env_override=True)
    size, md5 = validate(complete_zip, names, KEY_FILES)
    print(f"COMPLETE: {complete_zip.name}  {len(names)} entries  {size:,} B  md5 {md5}")

    # rewrite README
    (OUT / "README.md").write_text(f"""# Wardrobecare — Complete Package (single file)

**wardrobecare-complete.zip** — {len(names)} files, {size:,} bytes, md5 {md5}

Everything in one zip: full source (storefront + hidden admin + security
middleware + email system), both Prisma schemas, pre-seeded demo database,
all scripts, DEPLOY.md, env templates, vercel.json.

node_modules is intentionally NOT included — run `npm install` (or just
deploy to Vercel, which installs everything automatically).

## ⚠️ THE ONE RULE WHEN DEPLOYING

Extract into an **EMPTY folder** (or a **brand-new GitHub repo**).
Never copy these files on top of an older copy — leftover old files are
exactly what broke the Vercel build ("verify-form.tsx", "gift-card",
"digital-closet" must not exist anywhere in the deploy source).

## Deploy to Vercel (fast path)
1. Unzip into an empty folder.
2. `npm i -g vercel` then `vercel --prod` inside that folder
   (or push the folder contents to a fresh GitHub repo and import it).
3. Add the environment variables from DEPLOY.md section 2
   (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, ADMIN_ACCESS_PATH, ...).

## Admin console
`https://<your-domain>/wardrobe-hq-9xk2`
default `admin@wardrobecare.com` / `wardrobecare2026` — change it after
first login (Admin → Staff).
""")

    print("OK: complete zip validated (no duplicates, all key files present, no ghosts)")


if __name__ == "__main__":
    main()
