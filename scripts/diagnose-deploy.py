"""Diagnose the Vercel deployment: DB content signals + static image availability."""
import re, subprocess, sys, urllib.parse

BASE = "https://fashion-client-7npv.vercel.app"
HOME = "/tmp/deployed-home.html"
SHOP = "/tmp/deployed-shop.html"

def head(url, timeout=30):
    try:
        r = subprocess.run(
            ["curl", "-s", "-o", "/dev/null", "-w", "%{http_code} %{size_download}",
             "--max-time", str(timeout), url],
            capture_output=True, text=True, timeout=timeout + 10)
        return r.stdout.strip()
    except Exception as e:
        return f"ERR {e}"

for name, path in [("HOME", HOME), ("SHOP", SHOP)]:
    html = open(path, encoding="utf-8", errors="ignore").read()
    prods = len(re.findall(r"/_next/image\?url=%2Fproducts", html))
    raw_prods = len(re.findall(r"/products/", html))
    naira = html.count("\u20a6")
    cats = len(re.findall(r"/shop\?category=", html))
    empty_states = len(re.findall(r"(No products|couldn't find|not found|coming soon)", html, re.I))
    unsplash = len(re.findall(r"images\.unsplash\.com", html))
    print(f"[{name}] optimizer-product-imgs={prods} raw-/products/={raw_prods} "
          f"naira-sign={naira} category-links={cats} empty-state-text={empty_states} unsplash-refs={unsplash}")
    # sample of first decoded product image URL if any
    m = re.search(r"/_next/image\?url=([^\"&]+)", html)
    if m:
        print(f"  first optimizer URL: {urllib.parse.unquote(m.group(1))[:100]}")

print()
print("Static asset tests on the deployed domain:")
print("  /logo-black.png ->", head(f"{BASE}/logo-black.png"))
print("  /services/hero.jpg ->", head(f"{BASE}/services/hero.jpg"))
print("  /products/mens-heritage-oxford-long-sleeve-shirt-white-0.jpg ->",
      head(f"{BASE}/products/mens-heritage-oxford-long-sleeve-shirt-white-0.jpg"))
print("  /products/mens-classic-solid-tie-pocket-square-set-sky-blue-2.jpg ->",
      head(f"{BASE}/products/mens-classic-solid-tie-pocket-square-set-sky-blue-2.jpg"))
opt = f"{BASE}/_next/image?url=%2Flogo-black.png&w=256&q=75"
print("  optimizer /logo-black.png ->", head(opt))
