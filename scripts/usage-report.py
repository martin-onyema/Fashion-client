#!/usr/bin/env python3
"""For each unsplash pid, show WHERE it's used in the DB (table, row, context)
so replacements can be garment-matched. Output: scripts/usage-report.txt"""
import json, sqlite3, re
from pathlib import Path

ROOT = Path("/home/z/my-project")
refs = json.loads((ROOT / "scripts" / "urls.json").read_text())
pids = set(refs.keys()) - {"photo-1", "photo-2"}

con = sqlite3.connect(ROOT / "db" / "custom.db")
con.row_factory = sqlite3.Row
cur = con.cursor()

lines = []
for (t,) in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall():
    cols = [r[1] for r in cur.execute(f'PRAGMA table_info("{t}")').fetchall()]
    pk = "rowid"
    text_cols = []
    for _cid, name, ctype, *_ in cur.execute(f'PRAGMA table_info("{t}")').fetchall():
        if "TEXT" in (ctype or "").upper() or "CHAR" in (ctype or "").upper():
            text_cols.append(name)
    if not text_cols:
        continue
    for row in cur.execute(f'SELECT rowid AS rid, * FROM "{t}"').fetchall():
        rid = row["rid"]
        for c in text_cols:
            v = row[c]
            if not v or "unsplash" not in str(v):
                continue
            hit_pids = {m.group(1) for m in re.finditer(r"images\.unsplash\.com/(photo-[A-Za-z0-9\-_]+)", str(v))}
            inter = hit_pids & pids
            if not inter:
                continue
            # build context: show identifying columns
            ident = {}
            for key in ("id", "name", "title", "slug", "sku", "key", "email"):
                if key in row.keys() and row[key] is not None:
                    ident[key] = str(row[key])[:60]
            lines.append(f"[{t} rid={rid}] {ident}")
            for pid in sorted(inter):
                # try to find the product name for ProductImage rows via join
                extra = ""
                if t == "ProductImage":
                    r2 = cur.execute("SELECT p.name FROM ProductImage pi JOIN Product p ON p.id=pi.productId WHERE pi.rowid=?", (rid,)).fetchone()
                    if r2: extra = f"  PRODUCT: {r2[0]}"
                if t == "ProductVariant":
                    r2 = cur.execute("SELECT p.name, pv.id FROM ProductVariant pv JOIN Product p ON p.id=pv.productId WHERE pv.rowid=?", (rid,)).fetchone()
                    if r2: extra = f"  PRODUCT: {r2[0]} / variant: {r2[1]}"
                lines.append(f"    -> {pid}{extra}")
lines.append("\n=== SRC FILE REFS ===")
(Path(ROOT / "scripts" / "urls.json"))
for pid, v in refs.items():
    if v["src_refs"]:
        lines.append(f"{pid}: {v['src_refs']}")

(ROOT / "scripts" / "usage-report.txt").write_text("\n".join(lines))
print("\n".join(lines[:80]))
print(f"\n... total lines: {len(lines)} (full report in scripts/usage-report.txt)")
