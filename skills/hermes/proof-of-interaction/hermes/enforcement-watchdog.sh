#!/bin/bash
# Optional Hermes watchdog for Proof of Interaction.
# Hermes has no native lifecycle hook that can block a response. This helper is
# for users who want an external check, for example from cron or a terminal tab.

set -euo pipefail

SKILL="${CT_SKILL_DIR:-$HOME/.hermes/skills/openclaw-imports/proof-of-interaction}"

if [ ! -f "$SKILL/enforce.py" ]; then
  echo "Proof of Interaction skill not found at: $SKILL" >&2
  echo "Set CT_SKILL_DIR=/path/to/proof-of-interaction and try again." >&2
  exit 2
fi

out="$(python3 "$SKILL/enforce.py" stop-check 2>&1 || true)"
if [ -n "$out" ]; then
  printf '%s\n' "$out"
else
  echo "Proof of Interaction watchdog: no pending marked Hermes turn is currently unsealed."
fi
