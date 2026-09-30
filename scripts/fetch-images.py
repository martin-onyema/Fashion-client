#!/usr/bin/env python3
"""Download every Unsplash image used by the site into public/images/.
Self-hosting strategy: no remote image fetches at runtime, immune to
Vercel image-optimizer ACL/remotePatterns issues."""
import os, re, subprocess, json

CODE_DIR = "/home/z/my-project/src"
DB_PATH = "/home/z/my-project/db/custom.db"
OUT_DIR = "/home/z/my-project/public/images"

os.makedirs(OUT_DIR, exist_ok=True)

ids = set()

# 1) Scan source code
for root, _, files in os.walk(CODE_DIR):
    for f in files:
        if f.endswith((".tsx", ".ts")):
            p = os.path.join(root, f)
            try:
                text = open(p, encoding="utf-8", errors="ignore").read()
            except Exception:
                continue
            for m in re.finditer(r"photo-[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)+", text):
                ids.add(m.group(0))

# 2) Scan DB (sqlite via node)
node_script = r"""
const Database = require('better-sqlite3');
const db = new Database(process.argv[1], { readonly: true });
const out = [];
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t=>t.name);
for (const t of tables) {
  let cols;
  try { cols = db.prepare('PRAGMA table_info(' + t + ')').all().map(c => c.name); } catch(e) { continue; }
  let rows;
  try { rows = db.prepare('SELECT * FROM "' + t + '"').all(); } catch(e) { continue; }
  for (const row of rows) {
    for (const c of cols) {
      const v = row[c];
      if (typeof v === 'string' && v.includes('unsplash.com')) {
        const m = v.match(/photo-[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)+/g);
        if (m) out.push(...m);
      }
    }
  }
}
console.log(JSON.stringify(out));
db.close();
"""
res = subprocess.run(["node", "-e", node_script, DB_PATH], capture_output=True, text=True)
if res.returncode == 0:
    for m in json.loads(res.stdout.strip()):
        ids.add(m)

# Filter placeholder ids used in form placeholders
ids = {i for i in ids if not i.startswith("photo-1\n") and len(i) > 12}
# photo-1 / photo-2 placeholders in admin form placeholder text
ids.discard("photo-1")
ids.discard("photo-2")

print(f"Unique photo ids: {len(ids)}")

ok, fail = [], []
for pid in sorted(ids):
    out = os.path.join(OUT_DIR, pid + ".jpg")
    if os.path.exists(out) and os.path.getsize(out) > 5000:
        ok.append(pid)
        continue
    url = f"https://images.unsplash.com/{pid}?q=80&w=1400&auto=format&fit=crop"
    r = subprocess.run(
        ["curl", "-sL", "--max-time", "40", "-o", out, url,
         "-A", "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"],
        capture_output=True, text=True)
    size = os.path.getsize(out) if os.path.exists(out) else 0
    if r.returncode == 0 and size > 5000:
        ok.append(pid)
        print(f"  OK  {pid}  {size//1024}KB")
    else:
        fail.append(pid)
        print(f"  FAIL {pid} rc={r.returncode} size={size}")

print(f"\nDownloaded OK: {len(ok)}  Failed: {len(fail)}")
if fail:
    print("FAILED IDS:", json.dumps(fail))
