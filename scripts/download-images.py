#!/usr/bin/env python3
"""Download all product images from wardrobecare.com.ng into /public/product-images/"""
import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse, unquote
import urllib.request
import ssl

OUT_DIR = '/home/z/my-project/public/product-images'
TASKS_FILE = '/home/z/my-project/download/scrape/image-tasks.json'

os.makedirs(OUT_DIR, exist_ok=True)

with open(TASKS_FILE) as f:
    tasks = json.load(f)

print(f'Total image tasks: {len(tasks)}')

# De-dupe by src
seen = set()
uniq = []
for t in tasks:
    if t['src'] in seen:
        continue
    seen.add(t['src'])
    uniq.append(t)
print(f'Unique src URLs: {len(uniq)}')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

def dest_path(src: str, product_slug: str) -> str:
    p = urlparse(src)
    base = os.path.basename(p.path)
    base = unquote(base)
    # sanitize
    base = ''.join(c if c.isalnum() or c in '.-_' else '_' for c in base)
    # Add product slug prefix for organization
    safe_slug = ''.join(c if c.isalnum() or c in '-_' else '_' for c in product_slug)[:60]
    return os.path.join(OUT_DIR, f'{safe_slug}__{base}')

def fetch_one(task):
    src = task['src']
    slug = task['productSlug']
    out = dest_path(src, slug)
    if os.path.exists(out) and os.path.getsize(out) > 0:
        return ('skip', src, out)
    try:
        req = urllib.request.Request(src, headers={'User-Agent': UA, 'Referer': 'https://wardrobecare.com.ng/'})
        with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
            data = r.read()
        if len(data) < 100:
            return ('tiny', src, out)
        with open(out, 'wb') as f:
            f.write(data)
        return ('ok', src, out)
    except Exception as e:
        return ('err', src, str(e)[:100])

ok = 0
err = 0
skip = 0
tiny = 0
errs = []

t0 = time.time()
with ThreadPoolExecutor(max_workers=16) as ex:
    futures = [ex.submit(fetch_one, t) for t in uniq]
    for i, fut in enumerate(as_completed(futures)):
        status, src, info = fut.result()
        if status == 'ok': ok += 1
        elif status == 'skip': skip += 1
        elif status == 'tiny': tiny += 1
        elif status == 'err':
            err += 1
            errs.append((src, info))
        if (i+1) % 50 == 0:
            print(f'  progress: {i+1}/{len(uniq)} ok={ok} skip={skip} tiny={tiny} err={err} elapsed={time.time()-t0:.1f}s')

print(f'\n=== DONE ===')
print(f'ok={ok} skip={skip} tiny={tiny} err={err} total={len(uniq)}')
print(f'elapsed={time.time()-t0:.1f}s')
if errs:
    print(f'\nFirst 10 errors:')
    for s, e in errs[:10]:
        print(f'  {e} :: {s}')

# Save download report
report = {'ok': ok, 'skip': skip, 'tiny': tiny, 'err': err, 'total': len(uniq), 'errors': errs[:50]}
with open('/home/z/my-project/download/scrape/image-download-report.json', 'w') as f:
    json.dump(report, f, indent=2)
print('Report saved.')
