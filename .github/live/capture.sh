#!/usr/bin/env bash
set -u

frame="$LIVE/frame.tmp.jpg"
tick=0

while true; do
  if xcrun simctl io booted screenshot --type=jpeg "$frame" >/dev/null 2>&1; then
    sips -Z 960 "$frame" >/dev/null 2>&1 || true
    mv -f "$frame" "$LIVE/screen.jpg"
  fi

  if [ $((tick % 6)) -eq 0 ]; then
    (cd "$LIVE" && find -L preview -name '[0-9][0-9]-*.png' 2>/dev/null) | python3 -c '
import json, os, sys
paths = sorted((line.strip() for line in sys.stdin if line.strip()), key=lambda p: (p.split("/")[1], os.path.basename(p)))
json.dump(paths, open(sys.argv[1] + "/shots.json.tmp", "w"))
' "$LIVE" && mv -f "$LIVE/shots.json.tmp" "$LIVE/shots.json"
  fi

  tick=$((tick + 1))
  sleep 0.4
done
