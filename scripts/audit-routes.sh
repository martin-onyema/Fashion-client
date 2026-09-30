#!/usr/bin/env bash
# Full-stack readiness audit — every customer-facing route + admin + assets
cd /home/z/my-project
PASS=0; FAIL=0; FAILED=()
check() {
  local path="$1" expect="${2:-200}"
  local code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 60 "http://localhost:3000$path")
  if [ "$code" = "$expect" ]; then PASS=$((PASS+1)); printf "  OK   %-42s %s\n" "$path" "$code"
  else FAIL=$((FAIL+1)); FAILED+=("$path->$code"); printf "  BAD  %-42s %s (want %s)\n" "$path" "$code" "$expect"; fi
}
echo "── Storefront ──"
check /
check /shop
check /about
check /services
check /services/personal-shopping
check /faq
check /track-order
check /shipping
check /returns
check /gift-card
check /cart
echo "── Auth ──"
check /account/login
check /account/register
check /privacy
check /terms
echo "── Admin stealth ──"
check /wardrobe-hq-9xk2 200
check /admin 404
check /admin/login 404
echo "── Product pages (first 4 from DB) ──"
for slug in $(node -e "
const D=require('better-sqlite3');const db=new D('db/custom.db',{readonly:true});
console.log(db.prepare('SELECT slug FROM Product WHERE published=1 LIMIT 4').all().map(r=>r.slug).join(' '));
db.close();"); do check "/product/$slug"; done
echo "── Category/shop pages ──"
check "/shop?category=shirts"
check "/shop?category=suits"
echo "── API surface ──"
check /api/auth/providers
for a in products categories; do
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 "http://localhost:3000/api/$a")
  if [ "$code" = "200" ] || [ "$code" = "404" ]; then printf "  INFO /api/%s -> %s\n" "$a" "$code"; else printf "  BAD  /api/%s -> %s\n" "$a" "$code"; fi
done
echo "── Assets ──"
for i in black-men-traditional black-man-grey-suit black-man-chinos-street photo-1490114538077-0a7f8cb49891 photo-1521572163474-6864f9cf17ab; do
  check "/images/$i.jpg"
done
check /logo.svg
check /robots.txt
check /sitemap.xml
echo ""
echo "RESULT: PASS=$PASS FAIL=$FAIL"
[ $FAIL -gt 0 ] && printf "FAILED: %s\n" "${FAILED[*]}"
exit $FAIL
