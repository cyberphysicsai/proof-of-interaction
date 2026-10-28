#!/usr/bin/env bash
# Build the state-free release archives with the portable standard-library tool.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -n "${PYTHON:-}" ]]; then
  exec "$PYTHON" "$ROOT/tools/build_zips.py" "$@"
elif command -v python3 >/dev/null 2>&1; then
  exec python3 "$ROOT/tools/build_zips.py" "$@"
else
  exec python "$ROOT/tools/build_zips.py" "$@"
fi
