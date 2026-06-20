#!/bin/sh
set -eu

ENV_FILE="${SKILL_SURGE_AUTOMATION_ENV:-$HOME/.config/skill-surge/automation.env}"
if [ ! -f "$ENV_FILE" ]; then
  echo "Automation environment file not found: $ENV_FILE" >&2
  exit 1
fi

MODE=$(stat -f '%Lp' "$ENV_FILE" 2>/dev/null || stat -c '%a' "$ENV_FILE" 2>/dev/null || echo unknown)
if [ "$MODE" != "600" ]; then
  echo "Automation environment file must have mode 600, found $MODE" >&2
  exit 1
fi

set -a
. "$ENV_FILE"
set +a
exec "$@"
