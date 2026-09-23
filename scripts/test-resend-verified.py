#!/usr/bin/env python3
"""
Task 42 — verify the now-verified wardrobecare.com.ng domain end to end.

Test A: branded FROM (codes@wardrobecare.com.ng) -> owner inbox.
        Proves the domain is accepted as a sending identity.
Test B: same branded FROM -> martinonyema90+resendtest@gmail.com.
        Gmail delivers plus-tags to the SAME inbox, but Resend sees a
        DIFFERENT recipient. A 200 here proves the unverified-domain
        sandbox restriction (owner-only) is lifted -> real customers
        with any email address can now receive signup codes.
"""
import json
import urllib.request

API_KEY = "re_KBLC1fbu_FTzGZerDxLuGZuHus9jY47M7"
FROM = "Wardrobecare <codes@wardrobecare.com.ng>"

HTML = """
<div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #1a1817;">
  <p style="font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #8a8580; margin: 0 0 16px;">Wardrobecare</p>
  <h1 style="font-size: 24px; font-weight: 400; margin: 0 0 12px;">Domain verified</h1>
  <p style="font-size: 14px; line-height: 1.6; color: #4a4540;">
    wardrobecare.com.ng is now a verified sending domain. Signup codes will
    arrive from this address. Test code: <b>{code}</b>
  </p>
</div>
"""


def send(to_addr: str, subject: str, code: str) -> dict:
    body = json.dumps({
        "from": FROM,
        "to": [to_addr],
        "subject": subject,
        "html": HTML.replace("{code}", code),
    }).encode()
    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=body,
        headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return {"status": r.status, "resp": json.loads(r.read().decode())}
    except urllib.error.HTTPError as e:
        return {"status": e.code, "resp": e.read().decode()[:400]}


print("== Test A: branded FROM -> owner (martinonyema90@gmail.com) ==")
a = send("martinonyema90@gmail.com", "Domain verified — branded sender test", "100001")
print(json.dumps(a, indent=2))

print("\n== Test B: branded FROM -> plus-tag variant (sandbox-lift proof) ==")
b = send("martinonyema90+resendtest@gmail.com", "Domain verified — non-owner recipient test", "200002")
print(json.dumps(b, indent=2))

ok_a = a.get("status") == 200
ok_b = b.get("status") == 200
print(f"\nRESULT: A(branded from)={'PASS' if ok_a else 'FAIL'}  B(any recipient)={'PASS' if ok_b else 'FAIL'}")
print("Sandbox restriction LIFTED — codes can reach any customer inbox." if ok_b
      else "Sandbox restriction still ACTIVE — domain not accepted yet.")
