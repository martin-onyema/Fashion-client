#!/bin/bash
# Simulate the AdminLoginForm's full sign-in + redirect flow on the local
# dev server. Verifies that after a successful sign-in, /admin renders
# (200) and the user is NOT bounced back to /admin/login.
set -e
cd /home/z/my-project

COOKIE_JAR=/tmp/wc-admin-cookie.jar
rm -f $COOKIE_JAR

# 1. Visit /admin/login first (server sees no session, renders the form).
echo "=== Step 1: GET /admin/login (no session) ==="
curl -s -c $COOKIE_JAR -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000/admin/login

# 2. Get CSRF token.
CSRF_RES=$(curl -s -b $COOKIE_JAR -c $COOKIE_JAR http://localhost:3000/api/auth/csrf)
CSRF_TOKEN=$(echo "$CSRF_RES" | grep -oE '"csrfToken":"[^"]+"' | cut -d'"' -f4)
echo "CSRF: ${CSRF_TOKEN:0:20}..."

# 3. Submit credentials (mirrors the AdminLoginForm's signIn('credentials', {redirect:false})).
echo ""
echo "=== Step 2: POST credentials ==="
curl -s -b $COOKIE_JAR -c $COOKIE_JAR \
  -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "email=admin@wardrobecare.com" \
  --data-urlencode "password=wardrobecare2026" \
  --data-urlencode "csrfToken=$CSRF_TOKEN" \
  --data-urlencode "callbackUrl=/admin" \
  --data-urlencode "json=true" \
  -o /dev/null \
  -w "HTTP %{http_code}\n"

# 4. Now request /admin — the form would window.location.href here.
echo ""
echo "=== Step 3: GET /admin (with session cookie, should NOT redirect) ==="
curl -s -b $COOKIE_JAR -c $COOKIE_JAR -o /dev/null \
  -w "HTTP %{http_code} → Location: %{redirect_url}\n" \
  http://localhost:3000/admin

# 5. Also /admin/login while authenticated (should redirect to /admin, NOT back to login).
echo ""
echo "=== Step 4: GET /admin/login while authenticated (should redirect to /admin) ==="
curl -s -b $COOKIE_JAR -c $COOKIE_JAR -o /dev/null \
  -w "HTTP %{http_code} → Location: %{redirect_url}\n" \
  http://localhost:3000/admin/login

# 6. Session check.
echo ""
echo "=== Step 5: Session contents ==="
curl -s -b $COOKIE_JAR -c $COOKIE_JAR http://localhost:3000/api/auth/session

rm -f $COOKIE_JAR
