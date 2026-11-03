#!/usr/bin/env bash

live_stage() {
  local stage="$1" device="${2:-}" detail="${3:-}"
  python3 - "$LIVE/status.json" "$stage" "$device" "$detail" <<'PY'
import json, sys, time, os
path, stage, device, detail = sys.argv[1:5]
data = {}
if os.path.exists(path):
    try:
        data = json.load(open(path))
    except Exception:
        data = {}
data.setdefault("started", int(time.time()))
data.update(stage=stage, device=device, detail=detail, updated=int(time.time()))
tmp = path + ".tmp"
json.dump(data, open(tmp, "w"))
os.replace(tmp, path)
PY
  echo "▶ ${device:-$stage} ${detail}" >> "$LIVE/log.txt"
}

live_fail() {
  python3 - "$LIVE/status.json" "$1" <<'PY'
import json, sys, os
path, stage = sys.argv[1:3]
data = json.load(open(path))
data["failed"] = sorted(set(data.get("failed", [])) | {stage})
tmp = path + ".tmp"
json.dump(data, open(tmp, "w"))
os.replace(tmp, path)
PY
}
