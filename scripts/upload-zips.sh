#!/bin/bash
# Upload Wardrobecare delivery zips to gofile.io (proven reachable from this sandbox).
# Usage:
#   bash /home/z/my-project/scripts/upload-zips.sh small   # CODE + 4 image parts
#   bash /home/z/my-project/scripts/upload-zips.sh full    # the 82 MB website zip
set -u
DL=/home/z/my-project/download
RESULTS=/tmp/upload-results-gofile.txt
MODE="${1:-small}"

server=$(curl -s --max-time 20 https://api.gofile.io/servers | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['data']['servers'][0]['name'])" 2>/dev/null)
echo "gofile server: ${server:-NONE}"
[ -z "${server:-}" ] && exit 1

if [ "$MODE" = "full" ]; then
  FILES=("wardrobecare-website.zip")
else
  FILES=("wardrobecare-CODE.zip" "wardrobecare-IMAGES-1of4.zip" "wardrobecare-IMAGES-3of4.zip" "wardrobecare-IMAGES-4of4.zip")
fi

for f in "${FILES[@]}"; do
  path="$DL/$f"
  [ -f "$path" ] || { echo "$f -> MISSING" >> "$RESULTS"; continue; }
  echo "== uploading $f ($(du -h "$path" | cut -f1)) =="
  g=$(curl -s --max-time 540 -F "file=@$path" "https://${server}.gofile.io/contents/uploadfile" 2>/dev/null)
  gurl=$(echo "$g" | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['data']['downloadPage'])" 2>/dev/null)
  if [ -n "${gurl:-}" ]; then
    echo "$f -> $gurl" >> "$RESULTS"
    echo "   OK: $gurl"
  else
    echo "$f -> FAILED: $(echo "$g" | head -c 120)" >> "$RESULTS"
    echo "   FAILED"
  fi
done

echo "=== RESULTS ($MODE) ==="
cat "$RESULTS"
