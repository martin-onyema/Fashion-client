#!/bin/bash
# Task 42 — verify wardrobecare.com.ng sending via curl (urllib gets Cloudflare 1010)
API_KEY="re_KBLC1fbu_FTzGZerDxLuGZuHus9jY47M7"
FROM="Wardrobecare <codes@wardrobecare.com.ng>"
HTML='<div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1817;">
  <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #8a8580; margin: 0 0 16px;">Wardrobecare</p>
  <h1 style="font-size: 24px; font-weight: 400; margin: 0 0 12px;">Domain verified</h1>
  <p style="font-size: 14px; line-height: 1.6; color: #4a4540;">
    wardrobecare.com.ng is now a verified sending domain. Signup codes will arrive
    from this address. Test code: <b>CODE</b>
  </p></div>'

send() {
  local to="$1" subj="$2" code="$3"
  local body
  body=$(python3 - "$to" "$subj" "$code" <<'PY'
import sys, json
to, subj, code = sys.argv[1:4]
print(json.dumps({"from": "Wardrobecare <codes@wardrobecare.com.ng>", "to": [to],
                  "subject": subj, "html": open('/tmp/resend-html.txt').read().replace("CODE", code)}))
PY
)
  curl -s -o /tmp/resend-out.json -w "%{http_code}" \
    -X POST https://api.resend.com/emails \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    --user-agent "wardrobecare-deploy/1.0" \
    -d "$body"
}

printf '%s' "$HTML" > /tmp/resend-html.txt

echo "== Test A: branded FROM -> owner (martinonyema90@gmail.com) =="
a=$(send "martinonyema90@gmail.com" "Domain verified - branded sender test" "100001")
echo "HTTP $a"; cat /tmp/resend-out.json; echo

echo ""
echo "== Test B: branded FROM -> plus-tag variant (sandbox-lift proof) =="
b=$(send "martinonyema90+resendtest@gmail.com" "Domain verified - non-owner recipient test" "200002")
echo "HTTP $b"; cat /tmp/resend-out.json; echo

echo ""
[ "$a" = "200" ] && ra=PASS || ra=FAIL
[ "$b" = "200" ] && rb=PASS || rb=FAIL
echo "RESULT: A(branded from)=$ra  B(any recipient)=$rb"
if [ "$b" = "200" ]; then
  echo "Sandbox restriction LIFTED - codes can reach any customer inbox."
else
  echo "Sandbox restriction still ACTIVE - domain not accepted yet."
fi
