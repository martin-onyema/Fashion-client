#!/bin/bash
# Simulate the AdminLoginForm's full sign-in + redirect flow on the local
# dev server, INCLUDING the stealth middleware checks:
#   - /admin and /admin/login return 404 to anonymous visitors (stealth)
#   - the secret ADMIN_ACCESS_PATH renders the login page (rewrite)
#   - after sign-in, /admin renders (200) and the session has role=ADMIN
set -e
cd /home/z/my-project

# Read the secret path from .env (matches src/middleware.ts default).
SECRET_PATH=$(grep -E '^ADMIN_ACCESS_PATH=' .env 2>/dev/null | cut -d= -f2 | tr -d '"')
SECRET_PATH=${SECRET_PATH:-/wardrobe-hq-9xk2}
BASE=http://localhost:3000

COOKIE_JAR=/tmp/wc-admin-cookie.jar
rm -f $COOKIE_JAR

echo "=== Step 1: STEALTH — anonymous GET /admin (expect 404) ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" $BASE/admin

echo ""
echo "=== Step 2: STEALTH — anonymous GET /admin/login (expect 404) ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" $BASE/admin/login

echo ""
echo "=== Step 3: SECRET PATH — GET $SECRET_PATH (expect 200, login form) ==="
curl -s -c $COOKIE_JAR -o /dev/null -w "HTTP %{http_code}\n" $BASE$SECRET_PATH

# 4. Get CSRF token.
CSRF_RES=$(curl -s -b $COOKIE_JAR -c $COOKIE_JAR $BASE/api/auth/csrf)
CSRF_TOKEN=$(echo "$CSRF_RES" | grep -oE '"csrfToken":"[^"]+"' | cut -d'"' -f4)
echo ""
echo "CSRF: ${CSRF_TOKEN:0:20}..."

# 5. Submit credentials (mirrors AdminLoginForm's signIn('credentials',{redirect:false})).
echo ""
echo "=== Step 4: POST credentials ==="
curl -s -b $COOKIE_JAR -c $COOKIE_JAR \
  -X POST $BASE/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "email=admin@wardrobecare.com" \
  --data-urlencode "password=wardrobecare2026" \
  --data-urlencode "csrfToken=$CSRF_TOKEN" \
  --data-urlencode "callbackUrl=/admin" \
  --data-urlencode "json=true" \
  -o /dev/null \
  -w "HTTP %{http_code}\n"

echo ""
echo "=== Step 5: GET /admin as staff (expect 200, no redirect) ==="
curl -s -b $COOKIE_JAR -c $COOKIE_JAR -o /dev/null \
  -w "HTTP %{http_code} → Location: %{redirect_url}\n" \
  $BASE/admin

echo ""
echo "=== Step 6: Session contents ==="
curl -s -b $COOKIE_JAR -c $COOKIE_JAR $BASE/api/auth/session

echo ""
rm -f $COOKIE_JAR
