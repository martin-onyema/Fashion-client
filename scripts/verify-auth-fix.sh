#!/bin/bash
# Verify the role-aware redirect fix on the local dev server.
# 1. Sign in as admin@wardrobecare.com via /account/login's credentials flow.
# 2. Confirm we land on /admin (not /account).
# 3. Also verify a wrong password is rejected.

set -e
cd /home/z/my-project

COOKIE_JAR=/tmp/wc-cookie.jar
rm -f $COOKIE_JAR

# 1. Get the CSRF token from NextAuth's providers endpoint
echo "=== Step 1: Get CSRF token ==="
CSRF_RES=$(curl -s -c $COOKIE_JAR http://localhost:3000/api/auth/csrf)
CSRF_TOKEN=$(echo "$CSRF_RES" | grep -oE '"csrfToken":"[^"]+"' | cut -d'"' -f4)
echo "CSRF token: ${CSRF_TOKEN:0:20}..."

# 2. Try WRONG password - should fail with CredentialsSignin
echo ""
echo "=== Step 2: Try WRONG password (should fail) ==="
WRONG_RES=$(curl -s -b $COOKIE_JAR -c $COOKIE_JAR \
  -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "email=admin@wardrobecare.com" \
  --data-urlencode "password=definitely-wrong" \
  --data-urlencode "csrfToken=$CSRF_TOKEN" \
  --data-urlencode "callbackUrl=/account" \
  --data-urlencode "json=true" \
  -w "\n---HTTPSTATUS:%{http_code}\n---LOCATION:%{redirect_url}")
echo "$WRONG_RES" | tail -5

# 3. Try CORRECT password - should succeed
echo ""
echo "=== Step 3: Try CORRECT password (should succeed) ==="
# Refresh CSRF token (it may have been consumed)
CSRF_RES2=$(curl -s -b $COOKIE_JAR -c $COOKIE_JAR http://localhost:3000/api/auth/csrf)
CSRF_TOKEN2=$(echo "$CSRF_RES2" | grep -oE '"csrfToken":"[^"]+"' | cut -d'"' -f4)
echo "New CSRF token: ${CSRF_TOKEN2:0:20}..."

CORRECT_RES=$(curl -s -b $COOKIE_JAR -c $COOKIE_JAR \
  -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "email=admin@wardrobecare.com" \
  --data-urlencode "password=wardrobecare2026" \
  --data-urlencode "csrfToken=$CSRF_TOKEN2" \
  --data-urlencode "callbackUrl=/account" \
  --data-urlencode "json=true" \
  -w "\n---HTTPSTATUS:%{http_code}\n---LOCATION:%{redirect_url}\n")
echo "$CORRECT_RES" | tail -10

# 4. Verify the session was created with role=ADMIN
echo ""
echo "=== Step 4: Verify session has role=ADMIN ==="
SESSION_RES=$(curl -s -b $COOKIE_JAR -c $COOKIE_JAR http://localhost:3000/api/auth/session)
echo "$SESSION_RES"

# 5. Try visiting /account/login while authenticated - should redirect to /admin (307)
echo ""
echo "=== Step 5: Visit /account/login while authenticated as admin (should 307 → /admin) ==="
curl -s -b $COOKIE_JAR -c $COOKIE_JAR -o /dev/null -w "HTTP %{http_code} → Location: %{redirect_url}\n" http://localhost:3000/account/login

# 6. Also try /admin - should serve 200
echo ""
echo "=== Step 6: Visit /admin while authenticated (should 200) ==="
curl -s -b $COOKIE_JAR -c $COOKIE_JAR -o /dev/null -w "HTTP %{http_code}\n" http://localhost:3000/admin

# Cleanup
rm -f $COOKIE_JAR
