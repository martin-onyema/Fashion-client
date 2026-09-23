#!/bin/bash
# Test sampled proxies against claude.ai published_artifacts API
ART="507b95b7-fe64-4f30-9916-16686d98f2ab"
URL="https://claude.ai/api/published_artifacts/$ART"
n=0
while read p; do
  n=$((n+1))
  out=$(curl -s --max-time 8 -x "http://$p" -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0 Safari/537.36" -H "Accept: application/json" "$URL" 2>/dev/null | head -c 200)
  if echo "$out" | grep -q '"type":"error"'; then
    echo "REGION_OR_ERR $p :: $(echo $out | head -c 80)"
  elif echo "$out" | grep -qi "just a moment"; then
    echo "CHALLENGE  $p"
  elif [ -n "$out" ]; then
    echo "CANDIDATE  $p :: $(echo $out | head -c 120)"
  fi
done < /tmp/sample.txt
echo "TESTED $n"
