#!/usr/bin/env python3
"""
Wardrobecare Nigeria (WooCommerce) crawler — resumable.

Subcommands:
  archive            Crawl /?post_type=product&paged=N until exhausted.
                     -> scripts/wc-data/products-archive.json  [{wpId, slug, name, image, cats, tags, stock, type}]
                     -> raw pages cached in scripts/wc-pages/archive-N.html
  details            Crawl ?product=<slug> for every archived slug (4 polite workers,
                     resumable via scripts/wc-pages/detail-*.html cache).
                     -> scripts/wc-data/products-details.json
  reparse            Re-parse cached archive + detail pages (no network).

Politeness: the server throttles; archive requests sleep ~16s, details run 4 workers
with jittered sleeps. All requests go through fetch() which retries on 5xx/timeouts.
"""
import json
import os
import re
import sys
import time
import random
import html as html_mod
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

BASE = "https://wardrobecare.com.ng"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, "scripts", "wc-pages")
DATA = os.path.join(ROOT, "scripts", "wc-data")
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"}

os.makedirs(CACHE, exist_ok=True)
os.makedirs(DATA, exist_ok=True)

session = requests.Session()
session.headers.update(UA)


def fetch(url, retries=4, timeout=45):
    last = None
    for attempt in range(retries):
        try:
            r = session.get(url, timeout=timeout)
            if r.status_code == 200:
                return r.text
            last = f"HTTP {r.status_code}"
            if r.status_code in (404, 410):
                return None
        except Exception as e:  # noqa: BLE001
            last = str(e)
        time.sleep(3 + attempt * 5 + random.random() * 2)
    print(f"    !! giving up {url}: {last}")
    return None


def cached(name):
    p = os.path.join(CACHE, name)
    if os.path.exists(p) and os.path.getsize(p) > 5000:
        with open(p, encoding="utf-8", errors="replace") as f:
            return f.read()
    return None


def save_cache(name, text):
    with open(os.path.join(CACHE, name), "w", encoding="utf-8") as f:
        f.write(text)


# ---------------------------------------------------------------- archive

def parse_archive(html):
    soup = BeautifulSoup(html, "lxml")
    out = []
    for li in soup.select("li.wc-block-product, li.product"):
        classes = li.get("class", [])
        # slug from the loop link
        a = li.select_one("a[href*='?product=']") or li.select_one("a[href*='/product/']")
        if not a:
            continue
        href = a.get("href", "")
        m = re.search(r"[?&]product=([^&/]+)|/product/([^/]+)/?", href)
        if not m:
            continue
        slug = m.group(1) or m.group(2)
        # name
        h = li.select_one("h2.wp-block-post-title, h2.woocommerce-loop-product__title, h2, h3")
        name = ""
        if h:
            name = h.get_text(strip=True)
        if not name:
            img = li.select_one("img")
            name = (img.get("alt") or "").strip() if img else ""
        if not name:
            name = html_mod.unescape(slug.replace("-", " "))
        # image (largest srcset candidate <= 800w)
        img = li.select_one("img")
        image = pick_from_srcset(img) if img else ""
        # cats / tags from li classes product_cat-xxx product_tag-xxx
        cats = [c[len("product_cat-"):] for c in classes if c.startswith("product_cat-")]
        tags = [c[len("product_tag-"):] for c in classes if c.startswith("product_tag-")]
        stock = "outofstock" if "outofstock" in classes else "instock"
        ptype = "variable"
        for c in classes:
            if c.startswith("product-type-"):
                ptype = c[len("product-type-"):]
        # wp id from data-wp-context JSON or post-NNN class
        wp_id = ""
        ctx = li.get("data-wp-context", "")
        mc = re.search(r"productId\"?:(\d+)", ctx)
        if mc:
            wp_id = mc.group(1)
        else:
            for c in classes:
                if re.fullmatch(r"post-\d+", c):
                    wp_id = c.split("-")[1]
                    break
        out.append({
            "wpId": wp_id,
            "slug": slug,
            "name": name,
            "image": image,
            "cats": cats,
            "tags": tags,
            "stock": stock,
            "type": ptype,
        })
    return out


def cmd_archive():
    products = []
    page = 1
    while True:
        cache_name = f"archive-{page}.html"
        html = cached(cache_name)
        if html is None:
            url = f"{BASE}/?post_type=product&paged={page}"
            html = fetch(url)
            if html is None:
                print(f"  page {page}: fetch failed, stopping")
                break
            save_cache(cache_name, html)
            time.sleep(15 + random.random() * 4)
        items = parse_archive(html)
        print(f"  page {page}: {len(items)} products")
        if not items:
            break
        products.extend(items)
        # stop when pagination disappears
        soup = BeautifulSoup(html, "lxml")
        if not soup.select("a.page-numbers, nav.woocommerce-pagination"):
            break
        page += 1
        if page > 120:
            break
    # de-dupe by slug
    seen, uniq = set(), []
    for p in products:
        if p["slug"] in seen:
            continue
        seen.add(p["slug"])
        uniq.append(p)
    with open(os.path.join(DATA, "products-archive.json"), "w", encoding="utf-8") as f:
        json.dump(uniq, f, ensure_ascii=False, indent=1)
    print(f"ARCHIVE DONE: {len(uniq)} unique products -> scripts/wc-data/products-archive.json")


# ---------------------------------------------------------------- details

def pick_from_srcset(img):
    """Largest srcset candidate <= 800px wide."""
    srcset = img.get("srcset") or img.get("data-srcset") or ""
    best = ""
    best_w = 0
    for part in srcset.split(","):
        bits = part.strip().split()
        if len(bits) >= 2 and bits[1].endswith("w"):
            try:
                w = int(bits[1][:-1])
            except ValueError:
                continue
            if best_w < w <= 800 and w > best_w:
                best, best_w = bits[0], w
    return best or img.get("src") or ""


def parse_detail(html):
    soup = BeautifulSoup(html, "lxml")
    body = soup.body if soup.body else soup
    body_classes = body.get("class", [])
    d = {}

    # price — block theme: div.wp-block-woocommerce-product-price
    price_el = soup.select_one("div.wp-block-woocommerce-product-price, .summary .price, form.cart .price")
    if price_el:
        amounts = price_el.select("span.woocommerce-Price-amount")
        texts = [a.get_text(" ", strip=True) for a in amounts]
        d["priceHtml"] = " | ".join(texts)[:120]
        # bdi contains e.g. ₦30,000
        bdis = [b.get_text(strip=True) for b in price_el.select("bdi")]
        d["prices"] = bdis[:4]
        ins = price_el.select("del .woocommerce-Price-amount, del bdi")
        d["regularPrices"] = [b.get_text(strip=True) for b in ins][:4]

    # variations json
    form = soup.select_one("form.variations_form")
    if form and form.get("data-product_variations"):
        raw = html_mod.unescape(form["data-product_variations"])
        try:
            vars_ = json.loads(raw)
            out = []
            for v in vars_:
                out.append({
                    "id": v.get("variation_id") or v.get("id"),
                    "attrs": v.get("attributes", {}),
                    "price": v.get("display_price"),
                    "regular_price": v.get("display_regular_price"),
                    "in_stock": v.get("is_in_stock", False),
                    "sku": v.get("sku"),
                    "image": (v.get("image") or {}).get("gallery_thumbnail_src", ""),
                })
            d["variations"] = out
        except Exception as e:  # noqa: BLE001
            d["variationsError"] = str(e)[:100]

    # attributes table (simple products)
    attrs = []
    for row in soup.select(".woocommerce-product-attributes tr"):
        label = row.select_one(".woocommerce-product-attributes-item__label")
        value = row.select_one(".woocommerce-product-attributes-item__value")
        if label and value:
            attrs.append({
                "label": label.get_text(strip=True),
                "value": value.get_text(" ", strip=True),
            })
    d["attributes"] = attrs

    # description
    desc = soup.select_one("#tab-description")
    if desc:
        for el in desc.select("script, style"):
            el.decompose()
        text = desc.get_text("\n", strip=True)
        text = re.sub(r"^Description\s*\n?", "", text, count=1)
        d["description"] = text.strip()[:6000]

    # short description
    short = soup.select_one(".woocommerce-product-details__short-description, .product-short-description")
    if short:
        d["shortDescription"] = short.get_text("\n", strip=True)[:2000]

    # gallery + main image
    gallery = []
    seen_img = set()
    for fig in soup.select("figure.woocommerce-product-gallery__wrapper img, .woocommerce-product-gallery img"):
        src = pick_from_srcset(fig)
        if src and src not in seen_img:
            seen_img.add(src)
            gallery.append(src)
    d["gallery"] = gallery[:8]

    # sku
    sku = soup.select_one(".sku")
    d["sku"] = sku.get_text(strip=True) if sku else ""

    # cats/tags from body class
    d["cats"] = [c[len("product_cat-"):] for c in body_classes if c.startswith("product_cat-")]
    d["tags"] = [c[len("product_tag-"):] for c in body_classes if c.startswith("product_tag-")]
    for c in body_classes:
        if c.startswith("product-type-") or c.startswith("product_type-"):
            d["type"] = c.split("-", 1)[1]

    return d


def detail_worker(slug):
    cache_name = f"detail-{slug}.html"
    html = cached(cache_name)
    if html is None:
        url = f"{BASE}/?product={slug}"
        html = fetch(url, timeout=60)
        if html is None:
            return slug, None
        save_cache(cache_name, html)
        time.sleep(1.2 + random.random() * 1.6)
    try:
        return slug, parse_detail(html)
    except Exception as e:  # noqa: BLE001
        print(f"    !! parse error {slug}: {e}")
        return slug, None


def load_archive():
    with open(os.path.join(DATA, "products-archive.json"), encoding="utf-8") as f:
        return json.load(f)


def cmd_details():
    archive = load_archive()
    slugs = [p["slug"] for p in archive]
    print(f"DETAILS: {len(slugs)} products")
    results = {}
    done_path = os.path.join(DATA, "products-details.json")
    if os.path.exists(done_path):
        with open(done_path, encoding="utf-8") as f:
            results = json.load(f)
        print(f"  resuming: {len(results)} already parsed")
    todo = [s for s in slugs if s not in results]
    print(f"  to crawl: {len(todo)}")
    t0 = time.time()
    with ThreadPoolExecutor(max_workers=4) as ex:
        for i, (slug, parsed) in enumerate(ex.map(detail_worker, todo)):
            if parsed is not None:
                results[slug] = parsed
            if (i + 1) % 25 == 0:
                rate = (i + 1) / (time.time() - t0) * 60
                print(f"  {i + 1}/{len(todo)} ({rate:.0f}/min)")
                with open(done_path, "w", encoding="utf-8") as f:
                    json.dump(results, f, ensure_ascii=False)
    with open(done_path, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False)
    print(f"DETAILS DONE: {len(results)} -> scripts/wc-data/products-details.json")


def cmd_reparse():
    """Re-parse cached detail pages without network (fix parser bugs)."""
    archive = load_archive()
    results = {}
    for p in archive:
        html = cached(f"detail-{p['slug']}.html")
        if html is None:
            continue
        try:
            results[p["slug"]] = parse_detail(html)
        except Exception as e:  # noqa: BLE001
            print(f"    !! {p['slug']}: {e}")
    with open(os.path.join(DATA, "products-details.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False)
    print(f"REPARSE DONE: {len(results)}")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "archive"
    if cmd == "archive":
        cmd_archive()
    elif cmd == "details":
        cmd_details()
    elif cmd == "reparse":
        cmd_reparse()
    else:
        print("usage: scrape-wc.py archive|details|reparse")
