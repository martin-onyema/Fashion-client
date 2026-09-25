#!/usr/bin/env python3
"""
Rebuild the Wardrobecare deliverable zips:
  - wardrobecare-code.zip    deployable source (small, what Vercel needs)
  - wardrobecare-website.zip full project backup (no node_modules/.next)

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

# ---------- CODE ZIP ----------
CODE_INCLUDE_FILES = [
    ".env.example",
    ".env.production",
    "DEPLOY.md",
    "README.md",
    "package.json",
    "package-lock.json",
    "bun.lock",
    "next.config.ts",
    "next-env.d.ts",
    "tsconfig.json",
    "tailwind.config.ts",
    "postcss.config.mjs",
    "components.json",
    "eslint.config.mjs",
    "db/custom.db",
    "scripts/prepare-standalone.mjs",
]
CODE_INCLUDE_DIRS = ["src", "prisma", "public"]
CODE_EXCLUDE_PARTS = {"node_modules", ".next", "__pycache__"}

# ---------- FULL ZIP (backup) ----------
FULL_EXCLUDE_DIRS = {
    "node_modules", ".next", ".git", "download", "skills", "mini-services",
    "examples", "upload", "verify", "video-frames", ".zscripts",
    "__pycache__", ".claude", ".playwright-mcp",
}
FULL_EXTRA_FILES = [".env.example", ".env.production", "DEPLOY.md"]


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


def code_files():
    for name in CODE_INCLUDE_FILES:
        p = ROOT / name
        if p.is_file():
            yield p, name
    for d in CODE_INCLUDE_DIRS:
        base = ROOT / d
        for dirpath, dirnames, filenames in os.walk(base):
            dirnames[:] = [x for x in dirnames if x not in CODE_EXCLUDE_PARTS]
            for f in filenames:
                fp = Path(dirpath) / f
                if fp.suffix in {".log", ".pyc"}:
                    continue
                yield fp, str(fp.relative_to(ROOT))


def full_files():
    for dirpath, dirnames, filenames in os.walk(ROOT):
        rel = Path(dirpath).relative_to(ROOT)
        dirnames[:] = [x for x in dirnames if x not in FULL_EXCLUDE_DIRS
                       and not x.startswith("wardrobecare-")]
        for f in filenames:
            fp = Path(dirpath) / f
            relname = str(fp.relative_to(ROOT))
            if f == ".env":
                continue  # overridden with portable version
            if f in {"dev.log", ".DS_Store"} or fp.suffix in {".pyc", ".log"}:
                continue
            yield fp, relname
    for name in FULL_EXTRA_FILES:
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
    size = zip_path.stat().st_size
    md5 = hashlib.md5(zip_path.read_bytes()).hexdigest()
    return size, md5


def main():
    code_key = ["package.json", "DEPLOY.md", ".env.production", ".env.example",
                "db/custom.db", "scripts/prepare-standalone.mjs",
                "src/middleware.ts", "src/lib/auth.ts", "src/lib/rate-limit.ts",
                "src/app/admin/login/page.tsx", "prisma/schema.prisma",
                "prisma/schema.sqlite.prisma", "next.config.ts"]
    full_key = code_key + ["DEPLOY.md"]

    code_zip = OUT / "wardrobecare-code.zip"
    code_names = build_zip(code_zip, code_files, env_override=True)
    s1, m1 = validate(code_zip, code_names, code_key)
    print(f"CODE  : {code_zip.name}  {len(code_names)} entries  {s1:,} B  md5 {m1}")

    full_zip = OUT / "wardrobecare-website.zip"
    full_names = build_zip(full_zip, full_files, env_override=True)
    s2, m2 = validate(full_zip, full_names, full_key)
    print(f"FULL  : {full_zip.name}  {len(full_names)} entries  {s2:,} B  md5 {m2}")

    # rewrite README
    (OUT / "README.md").write_text(f"""# Wardrobecare — Download Package

## wardrobecare-code.zip  ({len(code_names)} files, {s1:,} bytes, md5 {m1})
Deployable source. Unzip → `vercel` deploy. Includes:
- full `src/` (storefront + hidden admin console + security middleware)
- both Prisma schemas (SQLite dev / Postgres production)
- `db/custom.db` pre-seeded demo database
- `DEPLOY.md` — complete step-by-step deployment + security guide
- `.env.production` / `.env.example` reference templates

## wardrobecare-website.zip  ({len(full_names)} files, {s2:,} bytes, md5 {m2})
Complete project backup (everything except node_modules/.next/junk).
Same core files plus all scripts, docs and assets.

## After unzipping
1. Read `DEPLOY.md` — it walks you through Vercel, env vars, domain,
   Paystack and how to reach the hidden admin console.
2. Admin access: `https://<your-domain>/wardrobe-hq-9xk2`
   (default `admin@wardrobecare.com` / `wardrobecare2026` — change it!)
""")

    print("OK: both zips validated (no duplicates, all key files present)")


if __name__ == "__main__":
    main()
